/**
 * Data layer for the OKR system:
 *   - the live "Operational Excellence" rollup dashboard (read-only)
 *   - the per-team OKR editor (department picker + save)
 *
 * The Supabase client is created by the web app and published on
 * globalThis.__bridgeSupabase (apps/web/src/auth/supabase-client.ts).
 * @bridgeflow/core cannot import the web app, so we read that shared singleton
 * here — one client, one auth session, app-wide.
 */

// Minimal slice of the supabase-js surface we use (keeps core dependency-free).
interface SupabaseLike {
  from: (table: string) => any;
  channel: (name: string) => any;
  removeChannel: (channel: any) => void;
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
}

export function getSupabase(): SupabaseLike | null {
  return (globalThis as any).__bridgeSupabase ?? null;
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

/** Progress % -> status. >=70 on track, >=50 at risk, else off track. */
export function statusFromProgress(progress: number): Status {
  if (progress >= 70) return 'on_track';
  if (progress >= 50) return 'at_risk';
  return 'off_track';
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
}
export interface DashboardModel {
  teams: TeamRollup[];
  overall: number;
  counts: Record<Status, number>;
  area: string | null;
}

export async function fetchDashboardModel(): Promise<DashboardModel> {
  const sb = getSupabase();
  if (!sb) throw new Error('Not signed in — Supabase client unavailable.');

  const [teamsRes, objsRes, okrsRes] = await Promise.all([
    sb.from('teams').select('*').order('sort_order'),
    sb.from('objectives').select('*').order('position'),
    sb.from('okrs').select('area').limit(1),
  ]);
  const err = teamsRes.error || objsRes.error || okrsRes.error;
  if (err) throw err;

  const teams: Team[] = teamsRes.data ?? [];
  const objectives: Objective[] = objsRes.data ?? [];

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
      const progress = objs.length
        ? Math.round(
            objs.reduce((s, o) => s + (o.progress ?? 0), 0) / objs.length
          )
        : 0;
      return {
        team,
        objectives: objs,
        progress,
        status: statusFromProgress(progress),
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
    area: okrsRes.data?.[0]?.area ?? null,
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
export interface EditableObjective {
  title: string;
  progress: number;
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
      .select('title,progress,position')
      .eq('okr_id', okr.id)
      .order('position');
    if (objRes.error) throw objRes.error;
    objectives = (objRes.data ?? []).map((o: any) => ({
      title: o.title ?? '',
      progress: clampProgress(Number(o.progress)),
    }));
  }
  if (!objectives.length) {
    objectives = [{ title: '', progress: 0 }];
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

/** Persist a team's OKR (upsert the OKR row, replace its objectives). */
export async function saveTeamOkr(
  teamId: string,
  meta: OkrMeta,
  objectives: EditableObjective[]
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

  const del = await sb.from('objectives').delete().eq('okr_id', okrId);
  if (del.error) throw del.error;

  const rows = objectives
    .filter(o => o.title.trim().length > 0)
    .map((o, i) => ({
      okr_id: okrId,
      team_id: teamId,
      position: i + 1,
      title: o.title.trim(),
      progress: clampProgress(o.progress),
    }));
  if (rows.length) {
    const ins = await sb.from('objectives').insert(rows);
    if (ins.error) throw ins.error;
  }
}
