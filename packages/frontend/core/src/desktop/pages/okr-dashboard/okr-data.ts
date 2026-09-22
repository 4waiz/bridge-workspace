/**
 * Data layer for the OKR system:
 *   - the live "Operational Excellence" rollup dashboard (read-only)
 *   - the per-team OKR editor (department picker + save)
 *
 * The Supabase client is created by the web app and published on
 * globalThis.__bridgeSupabase (apps/web/src/auth/supabase-client.ts).
 * @bridgeflow/core cannot import the web app, so we read that shared singleton
 * here - one client, one auth session, app-wide.
 */
import {
  objectiveProgress,
  OKR_DEMO,
  OKR_TEAMS,
  type SeedTeamOkr,
} from './okr-seed-data';
import {
  buildOkrWorkbook,
  type ParsedObjective,
  type ParsedTeamOkr,
  type ParsedWorkbook,
  parseOkrWorkbook,
} from './xlsx-lite';

// Minimal slice of the supabase-js surface we use (keeps core dependency-free).
interface SupabaseLike {
  from: (table: string) => any;
  channel: (name: string) => any;
  removeChannel: (channel: any) => void;
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
    refreshSession?: () => Promise<{ error: any }>;
  };
  storage?: {
    from: (bucket: string) => {
      download: (path: string) => Promise<{ data: Blob | null; error: any }>;
      upload: (
        path: string,
        body: Blob | ArrayBuffer | Uint8Array,
        opts?: { upsert?: boolean; contentType?: string }
      ) => Promise<{ data: any; error: any }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
}

export function getSupabase(): SupabaseLike | null {
  return (globalThis as any).__bridgeSupabase ?? null;
}

function isJwtIssuedInFutureError(err: any): boolean {
  const msg = String(err?.message ?? err ?? '');
  return /jwt issued at future/i.test(msg);
}

// Current OKR period. Kept in one place so dashboard + editor stay in sync.
export const CURRENT_QUARTER = 'Q3';
export const CURRENT_YEAR = 2026;

// ---- Domain types ---------------------------------------------------------
export interface Team {
  id: string;
  key: string;
  name: string;
  accent: string;
  sort_order: number;
}
export interface Okr {
  id: string;
  team_id: string;
  quarter: string;
  year: number;
  area: string | null;
  owner: string | null;
  focus_note: string | null;
}
export interface Objective {
  id: string;
  okr_id: string;
  team_id: string;
  position: number;
  title: string | null;
  progress: number; // 0..100
}

// ---- Status + the ONLY three colours (exactly the OKR legend) --------------
export type Status = 'on_track' | 'at_risk' | 'off_track';

export const STATUS_COLOR: Record<Status, string> = {
  on_track: '#2eb85c', // green
  at_risk: '#f5a623', // yellow / amber
  off_track: '#e5341f', // red
};
export const STATUS_LABEL: Record<Status, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  off_track: 'Off Track',
};
export const STATUS_DESC: Record<Status, string> = {
  on_track: 'Progressing as planned',
  at_risk: 'Some risks or obstacles',
  off_track: 'Corrective action required',
};

/**
 * Fraction (0..100) of the current quarter that has elapsed - i.e. where a
 * team "should" be if they progressed linearly. Month 1 ≈ 33%, month 2 ≈ 66%,
 * end of quarter ≈ 100%. This is the pace benchmark that status is judged
 * against, so early in the quarter the bar is low and late it is high.
 */
export function quarterExpectedPct(
  quarter: string = CURRENT_QUARTER,
  year: number = CURRENT_YEAR,
  now: Date = new Date()
): number {
  const q = parseInt(quarter.replace(/\D/g, ''), 10) || 1; // 1..4
  const startMonth = (q - 1) * 3; // 0-indexed
  const start = new Date(year, startMonth, 1).getTime();
  const end = new Date(year, startMonth + 3, 1).getTime(); // first day after quarter
  if (end <= start) return 0;
  const frac = (now.getTime() - start) / (end - start);
  return Math.max(0, Math.min(100, Math.round(frac * 100)));
}

/** How far behind pace (in progress points) still counts as "at risk". */
export const PACE_AT_RISK_BAND = 25;

/**
 * Status is PACE-BASED, not a fixed threshold: compare actual progress against
 * how far into the quarter we are (`expected`).
 *   - on or ahead of pace (incl. target met/exceeded) → On Track
 *   - up to PACE_AT_RISK_BAND points behind pace       → At Risk
 *   - further behind                                   → Off Track
 * So 33% in month 1 is On Track, but 90% in the last month (expected ~100%)
 * is At Risk. Defaults `expected` to the live quarter pace.
 */
export function statusFromProgress(
  progress: number,
  expected: number = quarterExpectedPct()
): Status {
  if (progress >= expected) return 'on_track';
  if (progress >= expected - PACE_AT_RISK_BAND) return 'at_risk';
  return 'off_track';
}

/**
 * Team-level status. Starts from the average-progress status, then downgrades:
 * a team shouldn't read "On Track" when 2 or more of its objectives are at risk
 * (or worse) - the healthy average hides the shaky ones, so surface it.
 */
export function rollupStatus(progresses: number[]): Status {
  if (progresses.length === 0) return 'on_track';
  const avg = Math.round(
    progresses.reduce((s, p) => s + p, 0) / progresses.length
  );
  let status = statusFromProgress(avg);
  const risky = progresses.filter(
    p => statusFromProgress(p) !== 'on_track'
  ).length;
  if (risky >= 2 && status === 'on_track') status = 'at_risk';
  return status;
}

export function clampProgress(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ---- Dashboard model ------------------------------------------------------
export interface TeamRollup {
  team: Team;
  objectives: Objective[]; // sorted by position
  progress: number; // avg of objectives, 0..100
  status: Status;
  owner: string | null; // team leader, from the team's OKR row
}
export interface DashboardModel {
  teams: TeamRollup[];
  overall: number;
  counts: Record<Status, number>;
  area: string | null;
}

export async function fetchDashboardModel(): Promise<DashboardModel> {
  const sb = getSupabase();
  if (!sb) throw new Error('Not signed in - Supabase client unavailable.');

  const loadRows = () =>
    Promise.all([
      sb.from('teams').select('*').order('sort_order'),
      sb.from('objectives').select('*').order('position'),
      sb.from('okrs').select('team_id, owner, area, quarter, year'),
    ]);
  let [teamsRes, objsRes, okrsRes] = await loadRows();
  let err = teamsRes.error || objsRes.error || okrsRes.error;
  if (err && isJwtIssuedInFutureError(err) && sb.auth.refreshSession) {
    const refresh = await sb.auth.refreshSession();
    if (!refresh.error) {
      [teamsRes, objsRes, okrsRes] = await loadRows();
      err = teamsRes.error || objsRes.error || okrsRes.error;
    }
  }
  if (err) throw err;

  const teams: Team[] = teamsRes.data ?? [];
  const objectives: Objective[] = objsRes.data ?? [];

  // One OKR row per team per quarter; the owner on it is the team leader.
  // Prefer the live quarter, but fall back to whatever exists so a board seeded
  // for another period still shows leaders and the area heading.
  const okrRows: any[] = okrsRes.data ?? [];
  const current = okrRows.filter(
    o => o.quarter === CURRENT_QUARTER && o.year === CURRENT_YEAR
  );
  const source = current.length ? current : okrRows;
  const ownerByTeam = new Map<string, string>();
  for (const o of source) {
    const owner = typeof o.owner === 'string' ? o.owner.trim() : '';
    if (o.team_id && owner) ownerByTeam.set(o.team_id, owner);
  }

  const byTeam = new Map<string, Objective[]>();
  for (const o of objectives) {
    const arr = byTeam.get(o.team_id) ?? [];
    arr.push(o);
    byTeam.set(o.team_id, arr);
  }

  const rollups: TeamRollup[] = teams
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(team => {
      const objs = (byTeam.get(team.id) ?? [])
        .slice()
        .sort((a, b) => a.position - b.position);
      const progresses = objs.map(o => o.progress ?? 0);
      const progress = progresses.length
        ? Math.round(progresses.reduce((s, p) => s + p, 0) / progresses.length)
        : 0;
      return {
        team,
        objectives: objs,
        progress,
        status: rollupStatus(progresses),
        owner: ownerByTeam.get(team.id) ?? null,
      };
    });

  const withData = rollups.filter(r => r.objectives.length > 0);
  const counts: Record<Status, number> = {
    on_track: 0,
    at_risk: 0,
    off_track: 0,
  };
  for (const r of withData) counts[r.status] += 1;
  const overall = withData.length
    ? Math.round(withData.reduce((s, r) => s + r.progress, 0) / withData.length)
    : 0;

  return {
    teams: rollups,
    overall,
    counts,
    area: source.find(o => o.area)?.area ?? null,
  };
}

// ---- Realtime -------------------------------------------------------------
/** Live updates for the dashboard. Returns an unsubscribe fn. */
export function subscribeDashboard(onChange: () => void): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};

  const channel = sb.channel('okr-dashboard-live');
  ['teams', 'okrs', 'objectives'].forEach(table => {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      onChange
    );
  });
  channel.subscribe();

  return () => {
    try {
      sb.removeChannel(channel);
    } catch {
      /* ignore */
    }
  };
}

// ===========================================================================
// Editor helpers
// ===========================================================================

export async function getTeams(): Promise<Team[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const res = await sb.from('teams').select('*').order('sort_order');
  if (res.error) throw res.error;
  return res.data ?? [];
}

/** A signed-up person, with the team they belong to resolved for display. */
export interface Member {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string | null;
  team_id: string | null;
  team_name: string | null;
  team_accent: string | null;
}

/**
 * Everyone who has signed in at least once, newest last.
 *
 * `profiles` rows are keyed by auth.users.id and are readable by any signed-in
 * user (the profiles_read policy). Emails live in auth.users, which the anon
 * key cannot reach, so a member is identified by name and team here.
 */
export async function fetchMembers(): Promise<Member[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const [profiles, teams] = await Promise.all([
    sb.from('profiles').select('*').order('created_at'),
    sb.from('teams').select('*'),
  ]);
  if (profiles.error) throw profiles.error;
  if (teams.error) throw teams.error;

  const byId = new Map<string, Team>(
    (teams.data ?? []).map((t: Team) => [t.id, t])
  );

  return (profiles.data ?? []).map((p: any): Member => {
    const team = p.team_id ? byId.get(p.team_id) : undefined;
    return {
      id: p.id,
      full_name: p.full_name ?? null,
      is_admin: !!p.is_admin,
      created_at: p.created_at ?? null,
      team_id: p.team_id ?? null,
      team_name: team?.name ?? null,
      team_accent: team?.accent ?? null,
    };
  });
}

async function currentUserId(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

/** The team the signed-in user currently belongs to (or null). */
export async function getMyTeamId(): Promise<string | null> {
  const sb = getSupabase();
  const uid = await currentUserId();
  if (!sb || !uid) return null;
  const res = await sb
    .from('profiles')
    .select('team_id')
    .eq('id', uid)
    .maybeSingle();
  if (res.error) throw res.error;
  return res.data?.team_id ?? null;
}

/** Assign the signed-in user to a team (the department picker uses this so
 *  RLS lets them edit that team's OKR). */
export async function setMyTeam(teamId: string): Promise<void> {
  const sb = getSupabase();
  const uid = await currentUserId();
  if (!sb || !uid) throw new Error('Not signed in.');
  const res = await sb
    .from('profiles')
    .upsert({ id: uid, team_id: teamId }, { onConflict: 'id' });
  if (res.error) throw res.error;
}

export interface OkrMeta {
  area: string;
  owner: string;
  focus_note: string;
}
export interface EditableKeyResult {
  description: string;
  unit: string;
  baseline: number;
  target: number;
  current: number;
}
export interface EditableObjective {
  title: string;
  progress: number;
  /**
   * The KRs behind this objective. When any of them carries a Target, the
   * objective's progress is DERIVED from them (mean of Current/Target) rather
   * than typed - that is what keeps the dashboard and the Excel workbook
   * showing the same number. Objectives with no numeric KRs keep whatever
   * progress was stored, so data that predates migration 0003 is not wiped.
   */
  keyResults: EditableKeyResult[];
  /** Initiative descriptions, positional - one per KR row in the workbook. */
  initiatives: string[];
}

/**
 * Recover the numbers from a legacy `target_text` such as
 * "Target 20 count · now 8 count (baseline 0 count)".
 * Used only against a DB that has not run migration 0003 yet.
 */
export function parseTargetText(text: string | null): {
  unit: string;
  baseline: number;
  target: number;
  current: number;
} {
  const t = text ?? '';
  const num = (re: RegExp): number => {
    const m = re.exec(t);
    return m ? Number(m[1]) : 0;
  };
  const unitMatch = /Target\s+-?[\d.]+\s*([^·(]*)/.exec(t);
  return {
    unit: (unitMatch?.[1] ?? '').trim(),
    target: num(/Target\s+(-?[\d.]+)/),
    current: num(/now\s+(-?[\d.]+)/),
    baseline: num(/baseline\s+(-?[\d.]+)/),
  };
}

/** Objective progress from its KRs (mean of Current/Target), or null. */
export function derivedObjectiveProgress(
  krs: { target: number; current: number }[]
): number | null {
  const scored = krs.filter(k => k.target !== 0 || k.current !== 0);
  if (!scored.length) return null;
  return objectiveProgress({
    keyResults: scored.map(k => ({
      baseline: 0,
      target: k.target,
      current: k.current,
    })),
  });
}

/** Load a team's current-period OKR + objectives for the editor. */
export async function fetchTeamOkr(
  teamId: string
): Promise<{ meta: OkrMeta; objectives: EditableObjective[] }> {
  const sb = getSupabase();
  if (!sb) throw new Error('Not signed in.');

  const okrRes = await sb
    .from('okrs')
    .select('*')
    .eq('team_id', teamId)
    .eq('quarter', CURRENT_QUARTER)
    .eq('year', CURRENT_YEAR)
    .maybeSingle();
  if (okrRes.error) throw okrRes.error;

  const okr: Okr | null = okrRes.data ?? null;
  const meta: OkrMeta = {
    area: okr?.area ?? 'Excellence Department',
    owner: okr?.owner ?? '',
    focus_note: okr?.focus_note ?? '',
  };

  let objectives: EditableObjective[] = [];
  if (okr) {
    const objRes = await sb
      .from('objectives')
      .select('id,title,progress,position')
      .eq('okr_id', okr.id)
      .order('position');
    if (objRes.error) throw objRes.error;
    const objRows = objRes.data ?? [];

    // Pull the KR numbers. A DB that has not run migration 0003 has no
    // unit/baseline/target/current columns, so fall back to the old
    // target_text and recover the numbers from it.
    const ids = objRows.map((o: any) => o.id);
    const byObjective = new Map<string, EditableKeyResult[]>();
    if (ids.length) {
      let rows: any[] = [];
      const full = await sb
        .from('key_results')
        .select(
          'objective_id,description,unit,baseline,target,current,position'
        )
        .in('objective_id', ids)
        .order('position');
      if (full.error) {
        const legacy = await sb
          .from('key_results')
          .select('objective_id,description,target_text,position')
          .in('objective_id', ids)
          .order('position');
        rows = (legacy.data ?? []).map((k: any) => ({
          ...k,
          ...parseTargetText(k.target_text),
        }));
      } else {
        rows = full.data ?? [];
      }
      for (const k of rows) {
        const list = byObjective.get(k.objective_id) ?? [];
        list.push({
          description: k.description ?? '',
          unit: k.unit ?? '',
          baseline: Number(k.baseline ?? 0),
          target: Number(k.target ?? 0),
          current: Number(k.current ?? 0),
        });
        byObjective.set(k.objective_id, list);
      }
    }

    const initByObjective = new Map<string, string[]>();
    if (ids.length) {
      const initRes = await sb
        .from('initiatives')
        .select('objective_id,description,position')
        .in('objective_id', ids)
        .order('position');
      for (const it of initRes.data ?? []) {
        const list = initByObjective.get(it.objective_id) ?? [];
        list.push(it.description ?? '');
        initByObjective.set(it.objective_id, list);
      }
    }

    objectives = objRows.map((o: any) => {
      const keyResults = byObjective.get(o.id) ?? [];
      const derived = derivedObjectiveProgress(keyResults);
      return {
        title: o.title ?? '',
        progress: derived ?? clampProgress(Number(o.progress)),
        keyResults,
        initiatives: initByObjective.get(o.id) ?? [],
      };
    });
  }
  if (!objectives.length) {
    objectives = [{ title: '', progress: 0, keyResults: [], initiatives: [] }];
  }
  return { meta, objectives };
}

// ---- Objective drill-down -------------------------------------------------
export interface KeyResult {
  id: string;
  objective_id: string;
  team_id: string;
  position: number;
  description: string | null;
  target_text: string | null;
  // Added by migration 0003. Optional because a database that has not run it
  // yet returns rows without these columns.
  unit?: string | null;
  baseline?: number | null;
  target?: number | null;
  current?: number | null;
}

/**
 * The four numbers behind a Key Result. Prefers the real columns from
 * migration 0003 and falls back to parsing the legacy rendered `target_text`,
 * so the UI shows a real bar either way.
 */
export function krNumbers(kr: {
  target_text: string | null;
  unit?: string | null;
  baseline?: number | null;
  target?: number | null;
  current?: number | null;
}): { unit: string; baseline: number; target: number; current: number } {
  if (kr.target != null || kr.current != null) {
    return {
      unit: kr.unit ?? '',
      baseline: Number(kr.baseline ?? 0),
      target: Number(kr.target ?? 0),
      current: Number(kr.current ?? 0),
    };
  }
  return parseTargetText(kr.target_text);
}
export interface Initiative {
  id: string;
  objective_id: string;
  team_id: string;
  position: number;
  description: string | null;
  owner: string | null;
}
export interface ObjectiveDetail {
  objective: Objective;
  team: Team | null;
  siblings: Objective[];
  keyResults: KeyResult[];
  initiatives: Initiative[];
  teamProgress: number;
}

/** Everything needed for the visual objective drill-down page. */
export async function fetchObjectiveDetail(
  objectiveId: string
): Promise<ObjectiveDetail> {
  const sb = getSupabase();
  if (!sb) throw new Error('Not signed in.');

  const objRes = await sb
    .from('objectives')
    .select('*')
    .eq('id', objectiveId)
    .maybeSingle();
  if (objRes.error) throw objRes.error;
  const objective: Objective | null = objRes.data ?? null;
  if (!objective) throw new Error('Objective not found.');

  const [teamRes, sibRes, krRes, initRes] = await Promise.all([
    sb.from('teams').select('*').eq('id', objective.team_id).maybeSingle(),
    sb
      .from('objectives')
      .select('*')
      .eq('team_id', objective.team_id)
      .order('position'),
    sb
      .from('key_results')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('position'),
    sb
      .from('initiatives')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('position'),
  ]);
  const err = teamRes.error || sibRes.error || krRes.error || initRes.error;
  if (err) throw err;

  const siblings: Objective[] = sibRes.data ?? [];
  const teamProgress = siblings.length
    ? Math.round(
        siblings.reduce((s, o) => s + (o.progress ?? 0), 0) / siblings.length
      )
    : 0;

  return {
    objective,
    team: teamRes.data ?? null,
    siblings,
    keyResults: krRes.data ?? [],
    initiatives: initRes.data ?? [],
    teamProgress,
  };
}

/**
 * Persist a team's OKR from the editor.
 *
 * Saving replaces the team's objectives, and that cascades their key results
 * and initiatives away - so everything the editor holds has to be written back
 * here, not just the objective titles. Delegates to `saveFullOkr` so the editor
 * and the Excel import write exactly the same rows; anything left out would be
 * gone for good, which is what used to empty the objective drill-down after the
 * first save.
 */
export async function saveTeamOkr(
  teamId: string,
  meta: OkrMeta,
  objectives: EditableObjective[]
): Promise<void> {
  await saveFullOkr(
    teamId,
    meta,
    objectives.map(o => editableToFullObjective(o, meta.owner))
  );
}

// ===========================================================================
// Excel template  (Download)  +  Excel import  (Upload)
// ===========================================================================

export const OKR_TEMPLATE_BUCKET = 'okr-templates';
export const OKR_TEMPLATE_FILE = 'bridge_xpi_okrs_template.xlsx';
/** Committed static copy served by Cloudflare Pages (public/okr/...). */
export const OKR_TEMPLATE_STATIC_URL = '/okr/bridge_xpi_okrs_template.xlsx';
export const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Build the demo-populated template in the browser (always in sync). */
export async function buildTemplateBlob(): Promise<Blob> {
  const bytes = await buildOkrWorkbook(OKR_DEMO, OKR_TEAMS);
  // Uint8Array is a valid BlobPart at runtime; cast past the stricter
  // ArrayBuffer-vs-ArrayBufferLike lib typing.
  return new Blob([bytes as unknown as BlobPart], { type: XLSX_MIME });
}

/**
 * Get the downloadable template. Tries, in order:
 *   1. the committed static file under /okr/ - the fully-styled, demo-filled
 *      design (navy headers, pink status banding, formulas). This is the copy
 *      the team wants, so it wins over everything else.
 *   2. Supabase Storage (an admin-uploaded copy, if any)
 *   3. an in-browser build from the demo data (unstyled, never fails)
 */
export async function getTemplateBlob(): Promise<Blob> {
  try {
    const res = await fetch(OKR_TEMPLATE_STATIC_URL, { cache: 'no-store' });
    if (res.ok) {
      const blob = await res.blob();
      if (blob.size > 0) return blob;
    }
  } catch {
    /* fall through */
  }
  const sb = getSupabase();
  if (sb?.storage) {
    try {
      const { data } = await sb.storage
        .from(OKR_TEMPLATE_BUCKET)
        .download(OKR_TEMPLATE_FILE);
      if (data && data.size > 0) return data;
    } catch {
      /* fall through */
    }
  }
  return buildTemplateBlob();
}

/**
 * Build the workbook from what is CURRENTLY in the database, so a download
 * mirrors the live dashboard instead of the seed data frozen at build time.
 * This is the other half of the round trip: the editor writes KR numbers to
 * Postgres, and these numbers come straight back out into the Excel cells that
 * the =Current/Target formulas read.
 *
 * A team with nothing stored yet falls back to its seed content rather than
 * exporting an empty tab.
 */
export async function buildLiveWorkbookBlob(): Promise<Blob> {
  const dbTeams = await getTeams().catch(() => [] as Team[]);
  const live: SeedTeamOkr[] = [];

  for (const team of OKR_TEAMS) {
    const seed = OKR_DEMO.find(d => d.key === team.key);
    const db = dbTeams.find(t => t.key === team.key);
    let objectives: EditableObjective[] = [];
    let owner = '';

    if (db) {
      try {
        const data = await fetchTeamOkr(db.id);
        objectives = data.objectives.filter(o => o.title.trim().length > 0);
        owner = data.meta.owner ?? '';
      } catch {
        /* fall through to the seed copy */
      }
    }

    // Nothing usable stored for this team - keep the seed tab.
    const hasNumbers = objectives.some(o =>
      o.keyResults.some(k => k.target !== 0 || k.current !== 0)
    );
    if (!hasNumbers) {
      if (seed) live.push(seed);
      continue;
    }

    const teamOwner = owner || seed?.owner || '';
    live.push({
      key: team.key,
      owner: teamOwner,
      objectives: objectives.map(o => ({
        title: o.title,
        keyResults: o.keyResults.map((k, i) => ({
          description: k.description,
          unit: k.unit,
          baseline: k.baseline,
          target: k.target,
          current: k.current,
          initiative: o.initiatives[i] ?? o.initiatives[0] ?? '',
          owner: teamOwner,
        })),
      })),
    });
  }

  const bytes = await buildOkrWorkbook(live, OKR_TEAMS);
  return new Blob([bytes as unknown as BlobPart], { type: XLSX_MIME });
}

/** Upload the current demo template to Supabase Storage (admin helper). */
export async function uploadTemplateToStorage(): Promise<void> {
  const sb = getSupabase();
  if (!sb?.storage) throw new Error('Supabase Storage unavailable.');
  const blob = await buildTemplateBlob();
  const { error } = await sb.storage
    .from(OKR_TEMPLATE_BUCKET)
    .upload(OKR_TEMPLATE_FILE, blob, { upsert: true, contentType: XLSX_MIME });
  if (error) throw error;
}

/** Parse an uploaded .xlsx into structured OKRs (no DB writes). */
export async function parseOkrFile(file: File): Promise<ParsedWorkbook> {
  const buf = await file.arrayBuffer();
  return parseOkrWorkbook(buf);
}

// ---- team-name matching (Excel name -> DB team) ---------------------------
function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}
// tolerant aliases so slightly different labels still resolve to a team key
const TEAM_ALIASES: Record<string, string> = {
  agile: 'agile',
  aianalytics: 'ai-analytics',
  ai: 'ai-analytics',
  aiandanalytics: 'ai-analytics',
  opex: 'opex',
  operationalexcellence: 'opex',
  industry50: 'industry-5',
  industry5: 'industry-5',
  businessoperation: 'business-operation',
  businessoperations: 'business-operation',
  businessops: 'business-operation',
  leansixsigmaspecialprojects: 'lean-six-sigma',
  leansixsigmaandspecialprojects: 'lean-six-sigma',
  leansixsigma: 'lean-six-sigma',
  sixsigma: 'lean-six-sigma',
  lean: 'lean-six-sigma',
  externalengagement: 'external-engagement',
};

/** Resolve an Excel team label to a DB team row (or null if none matches). */
export function matchTeam(excelName: string, dbTeams: Team[]): Team | null {
  const n = normName(excelName);
  // 1. exact normalized name
  let hit = dbTeams.find(t => normName(t.name) === n);
  if (hit) return hit;
  // 2. via alias -> key
  const key = TEAM_ALIASES[n];
  if (key) {
    hit = dbTeams.find(
      t => t.key === key || normName(t.name) === normName(key)
    );
    if (hit) return hit;
  }
  // 3. loose contains
  hit = dbTeams.find(
    t => normName(t.name).includes(n) || n.includes(normName(t.name))
  );
  return hit ?? null;
}

// ---- full-detail objective (objective + KRs + initiatives) ----------------
export interface FullKeyResult {
  description: string;
  target_text: string;
  unit: string;
  baseline: number;
  target: number;
  current: number;
}
export interface FullInitiative {
  description: string;
  owner: string;
}
export interface FullObjective {
  title: string;
  progress: number;
  keyResults: FullKeyResult[];
  initiatives: FullInitiative[];
}

function targetText(kr: {
  unit: string;
  baseline: number;
  target: number;
  current: number;
}): string {
  const u = kr.unit ? ` ${kr.unit}` : '';
  return `Target ${kr.target}${u} · now ${kr.current}${u} (baseline ${kr.baseline}${u})`;
}

/** Turn a parsed objective into the DB-shaped full objective. */
export function parsedToFullObjective(obj: ParsedObjective): FullObjective {
  const seen = new Set<string>();
  const initiatives: FullInitiative[] = [];
  for (const kr of obj.keyResults) {
    const desc = kr.initiative.trim();
    if (desc && !seen.has(desc.toLowerCase())) {
      seen.add(desc.toLowerCase());
      initiatives.push({ description: desc, owner: kr.owner });
    }
  }
  return {
    title: obj.title || `Objective ${obj.number}`,
    progress: clampProgress(obj.progress),
    keyResults: obj.keyResults
      .filter(kr => kr.description)
      .map(kr => ({
        description: kr.description,
        target_text: targetText(kr),
        unit: kr.unit,
        baseline: kr.baseline,
        target: kr.target,
        current: kr.current,
      })),
    initiatives,
  };
}

/**
 * Turn an objective as the editor holds it into the DB-shaped full objective.
 *
 * `target_text` is rendered here from the numbers so a database that predates
 * migration 0003 (no unit/baseline/target/current columns to read back) still
 * shows a real Key Result bar. Initiatives are positional strings in the
 * editor, so they pick up the team leader as their owner.
 */
export function editableToFullObjective(
  o: EditableObjective,
  owner: string
): FullObjective {
  const keyResults: FullKeyResult[] = o.keyResults
    .filter(k => k.description.trim().length > 0)
    .map(k => ({
      description: k.description.trim(),
      target_text: targetText(k),
      unit: k.unit,
      baseline: k.baseline,
      target: k.target,
      current: k.current,
    }));

  const seen = new Set<string>();
  const initiatives: FullInitiative[] = [];
  for (const raw of o.initiatives) {
    const desc = (raw ?? '').trim();
    if (!desc || seen.has(desc.toLowerCase())) continue;
    seen.add(desc.toLowerCase());
    initiatives.push({ description: desc, owner });
  }

  // Numeric KRs drive the objective's progress (same rule as the workbook and
  // the editor); objectives without them keep the typed figure.
  const derived = derivedObjectiveProgress(keyResults);
  return {
    title: o.title,
    progress: clampProgress(derived ?? o.progress),
    keyResults,
    initiatives,
  };
}

/**
 * Persist a team's OKR WITH key results + initiatives. Upserts the OKR,
 * replaces its objectives, and (re)creates each objective's KRs + initiatives.
 * Relies on ON DELETE CASCADE to clear old KRs/initiatives.
 */
export async function saveFullOkr(
  teamId: string,
  meta: OkrMeta,
  objectives: FullObjective[]
): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error('Not signed in.');

  const okrRes = await sb
    .from('okrs')
    .upsert(
      {
        team_id: teamId,
        quarter: CURRENT_QUARTER,
        year: CURRENT_YEAR,
        area: meta.area,
        owner: meta.owner,
        focus_note: meta.focus_note,
      },
      { onConflict: 'team_id,quarter,year' }
    )
    .select('id')
    .single();
  if (okrRes.error) throw okrRes.error;
  const okrId = okrRes.data.id as string;

  // deleting objectives cascades to key_results + initiatives
  const del = await sb.from('objectives').delete().eq('okr_id', okrId);
  if (del.error) throw del.error;

  const kept = objectives.filter(o => o.title.trim().length > 0);
  if (!kept.length) return;

  const objRows = kept.map((o, i) => ({
    okr_id: okrId,
    team_id: teamId,
    position: i + 1,
    title: o.title.trim(),
    progress: clampProgress(o.progress),
  }));
  const objIns = await sb
    .from('objectives')
    .insert(objRows)
    .select('id,position');
  if (objIns.error) throw objIns.error;

  const posToId = new Map<number, string>();
  for (const r of objIns.data ?? []) posToId.set(r.position, r.id);

  const krRows: any[] = [];
  const initRows: any[] = [];
  kept.forEach((o, i) => {
    const objectiveId = posToId.get(i + 1);
    if (!objectiveId) return;
    o.keyResults.forEach((kr, ki) => {
      krRows.push({
        objective_id: objectiveId,
        team_id: teamId,
        position: ki + 1,
        description: kr.description,
        target_text: kr.target_text,
        unit: kr.unit ?? '',
        baseline: kr.baseline ?? 0,
        target: kr.target ?? 0,
        current: kr.current ?? 0,
      });
    });
    o.initiatives.forEach((it, ii) => {
      initRows.push({
        objective_id: objectiveId,
        team_id: teamId,
        position: ii + 1,
        description: it.description,
        owner: it.owner,
      });
    });
  });
  if (krRows.length) {
    const r = await sb.from('key_results').insert(krRows);
    if (r.error) throw r.error;
  }
  if (initRows.length) {
    const r = await sb.from('initiatives').insert(initRows);
    if (r.error) throw r.error;
  }
}

// ---- org-wide import ------------------------------------------------------
export type ImportOutcome = 'imported' | 'skipped' | 'error';
export interface TeamImportResult {
  excelName: string;
  team: Team | null;
  outcome: ImportOutcome;
  objectiveCount: number;
  message?: string;
}

/**
 * Write every parsed team's OKR (objectives + KRs + initiatives) to Supabase.
 * Teams that don't match a DB team are skipped; teams the signed-in user can't
 * write (RLS) surface as an error with a hint. Returns a per-team report.
 */
export async function importParsedWorkbook(
  parsed: ParsedWorkbook,
  dbTeams: Team[]
): Promise<TeamImportResult[]> {
  const results: TeamImportResult[] = [];
  for (const pt of parsed.teams) {
    const team = matchTeam(pt.teamName, dbTeams);
    const objectives = pt.objectives.map(parsedToFullObjective);
    if (!team) {
      results.push({
        excelName: pt.teamName,
        team: null,
        outcome: 'skipped',
        objectiveCount: objectives.length,
        message: 'No matching team in the dashboard',
      });
      continue;
    }
    try {
      await saveFullOkr(
        team.id,
        {
          area: 'Excellence Department',
          owner: pt.owner || team.name,
          focus_note: 'Focus on the results that drive the biggest impact.',
        },
        objectives
      );
      results.push({
        excelName: pt.teamName,
        team,
        outcome: 'imported',
        objectiveCount: objectives.length,
      });
    } catch (e: any) {
      const raw = e?.message ?? String(e);
      const rls = /row-level security|violates|policy/i.test(raw);
      results.push({
        excelName: pt.teamName,
        team,
        outcome: 'error',
        objectiveCount: objectives.length,
        message: rls
          ? 'No permission to write this team (needs admin - see 0002 migration)'
          : raw,
      });
    }
  }
  return results;
}

/** Pull the parsed OKR for a single team (used to fill the editor after import). */
export function editableFromParsed(
  pt: ParsedTeamOkr | undefined
): EditableObjective[] {
  if (!pt) return [];
  return pt.objectives.map(o => ({
    title: o.title || `Objective ${o.number}`,
    progress: clampProgress(o.progress),
    keyResults: o.keyResults.map(k => ({
      description: k.description,
      unit: k.unit,
      baseline: k.baseline,
      target: k.target,
      current: k.current,
    })),
    initiatives: o.keyResults.map(k => k.initiative),
  }));
}
