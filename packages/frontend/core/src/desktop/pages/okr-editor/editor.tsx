import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { OKR_EDITOR_ZOOM, usePageZoom } from '../../../utils/app-zoom';
import {
  buildLiveWorkbookBlob,
  clampProgress,
  CURRENT_QUARTER,
  CURRENT_YEAR,
  derivedObjectiveProgress,
  editableFromParsed,
  type EditableKeyResult,
  type EditableObjective,
  fetchTeamOkr,
  getMyTeamId,
  getTeams,
  getTemplateBlob,
  importParsedWorkbook,
  matchTeam,
  type OkrMeta,
  parseOkrFile,
  rollupStatus,
  saveTeamOkr,
  setMyTeam,
  STATUS_COLOR,
  STATUS_LABEL,
  statusFromProgress,
  type Team,
  type TeamImportResult,
} from '../okr-dashboard/okr-data';
import {
  demoForTeam,
  krProgress,
  OKR_TEAMS,
} from '../okr-dashboard/okr-seed-data';
import type { ParsedWorkbook } from '../okr-dashboard/xlsx-lite';
import { BusinessOpsPanel } from './business-ops-panel';

/** How long the editor waits after the last edit before saving. */
const AUTOSAVE_IDLE_MS = 60_000;

/**
 * Pseudo-department for the "All departments" mode: upload ONE workbook that
 * carries every team's tab and push the lot in a single import. Not a real
 * team, so it never reaches the database as a team key.
 */
const ALL_KEY = '__all__';

// Light UI palette (matches the OKR editor design).
const T = {
  bg: '#f3f4f6',
  card: '#ffffff',
  border: '#e6e8ee',
  text: '#20242e',
  sub: '#7b8290',
  track: '#eceef2',
  accent: '#f15a29',
};

const initialsOf = (s: string): string =>
  (s || 'OK')
    .split(/\s+/)
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

function rgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// A transparent native range overlays the drawn track/fill line below it; only
// its thumb is visible (coloured per objective via the --okr-c CSS variable).
const SLIDER_CSS = `
.okr-range{-webkit-appearance:none;appearance:none;position:absolute;inset:0;width:100%;height:20px;margin:0;padding:0;background:transparent;cursor:pointer;z-index:2}
.okr-range:focus{outline:none}
.okr-range::-webkit-slider-runnable-track{-webkit-appearance:none;height:20px;background:transparent;border:none}
.okr-range::-moz-range-track{height:20px;background:transparent;border:none}
.okr-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;margin-top:1px;border-radius:50%;background:var(--okr-c,#2eb85c);border:3px solid #fff;box-shadow:0 1px 5px rgba(20,24,34,.3);cursor:pointer}
.okr-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--okr-c,#2eb85c);border:3px solid #fff;box-shadow:0 1px 5px rgba(20,24,34,.3);cursor:pointer}
`;

export function OkrEditor() {
  const navigate = useNavigate();
  // The picker renders instantly from the fixed roster; DB rows (with real ids)
  // load in the background so there is never a "loading teams…" wait.
  const [teams, setTeams] = useState<Team[]>([]);
  const teamsRef = useRef<Team[]>([]);
  const teamsPromise = useRef<Promise<Team[]> | null>(null);

  const [phase, setPhase] = useState<'pick' | 'edit' | 'all'>('pick');
  const [pick, setPick] = useState<string>(OKR_TEAMS[0]?.key ?? '');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [meta, setMeta] = useState<OkrMeta>({
    area: '',
    owner: '',
    focus_note: '',
  });
  const [objectives, setObjectives] = useState<EditableObjective[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Excel import/preview state
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedWorkbook | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<TeamImportResult[] | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<number | null>(null);

  // Header profile / notification dropdowns.
  const [hdrMenu, setHdrMenu] = useState<null | 'profile' | 'notif'>(null);
  const appbarRightRef = useRef<HTMLDivElement>(null);

  // Close the header dropdown on outside click or Escape.
  useEffect(() => {
    if (!hdrMenu) return;
    const onDown = (e: MouseEvent) => {
      if (!appbarRightRef.current?.contains(e.target as Node)) setHdrMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHdrMenu(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [hdrMenu]);

  // The editor carries its own scale so 100% browser zoom shows it the way the
  // team prefers. The app default is restored on close.
  usePageZoom(OKR_EDITOR_ZOOM);

  // Background: load DB teams (for ids + import matching) + my team preselect.
  useEffect(() => {
    const p = getTeams();
    teamsPromise.current = p;
    p.then(ts => {
      teamsRef.current = ts;
      setTeams(ts);
    }).catch(() => {});
    getMyTeamId()
      .then(id => {
        if (!id) return;
        const mine = teamsRef.current.find(t => t.id === id);
        if (mine) setPick(mine.key);
      })
      .catch(() => {});
  }, []);

  // warn on tab close with unsaved edits
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const resolveDbTeam = useCallback(async (key: string): Promise<Team> => {
    let ts = teamsRef.current;
    if (!ts.length && teamsPromise.current) {
      ts = await teamsPromise.current.catch(() => []);
      teamsRef.current = ts;
    }
    const seed = OKR_TEAMS.find(t => t.key === key);
    const hit =
      ts.find(t => t.key === key) ?? (seed ? matchTeam(seed.name, ts) : null);
    if (!hit) {
      throw new Error(
        `“${seed?.name ?? key}” isn’t in the database yet. Run supabase/seed.sql (7 teams) and sign in.`
      );
    }
    return hit;
  }, []);

  const loadTeam = useCallback(async (dbTeam: Team) => {
    await setMyTeam(dbTeam.id);
    const data = await fetchTeamOkr(dbTeam.id);
    setTeamId(dbTeam.id);
    setTeamName(dbTeam.name);
    // Owner comes from the Excel/seed roster so each team shows its person
    // (e.g. Agile → Mateus Rocha), falling back to the DB value if unmapped.
    const seedOwner = demoForTeam(dbTeam.key)?.owner ?? '';
    setMeta({ ...data.meta, owner: seedOwner || data.meta.owner || '' });
    setObjectives(data.objectives);
    setDirty(false);
  }, []);

  const chooseTeam = useCallback(
    async (key: string) => {
      setError(null);
      // "All departments" has no OKR of its own to load - it is purely the
      // org-wide import screen.
      if (key === ALL_KEY) {
        setPhase('all');
        return;
      }
      setBusy(true);
      try {
        const dbTeam = await resolveDbTeam(key);
        await loadTeam(dbTeam);
        setPhase('edit');
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setBusy(false);
      }
    },
    [resolveDbTeam, loadTeam]
  );

  const save = useCallback(async () => {
    if (!teamId) return;
    setSaving(true);
    setError(null);
    try {
      await saveTeamOkr(teamId, meta, objectives);
      setSavedAt(new Date());
      setDirty(false);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }, [teamId, meta, objectives]);

  const guardedLeave = useCallback(
    (to: number | string) => {
      if (dirty) save().catch(() => {});
      // split only to satisfy react-router's number|To navigate overloads
      if (typeof to === 'number') {
        navigate(to);
        return;
      }
      navigate(to);
    },
    [dirty, save, navigate]
  );

  // Auto-save: persist AUTOSAVE_IDLE_MS after the last edit.
  //
  // A save rewrites the team's objectives, and every write fans out over
  // realtime to each open dashboard, which then refetches. On a wall screen
  // that is open all day, a short debounce turns one editing session into a
  // steady stream of writes and refetches, so the idle window is deliberately
  // long. Work is not at risk from it: navigating away saves first
  // (guardedLeave) and closing the tab dirty raises the beforeunload prompt.
  useEffect(() => {
    if (phase !== 'edit' || !dirty || !teamId || saving) return;
    const timer = setTimeout(() => {
      save().catch(() => {});
    }, AUTOSAVE_IDLE_MS);
    return () => clearTimeout(timer);
  }, [phase, dirty, teamId, saving, save]);

  const patchObj = (i: number, patch: Partial<EditableObjective>) => {
    setObjectives(prev =>
      prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o))
    );
    setDirty(true);
  };
  /**
   * Edit one Key Result's numbers. The objective's progress is RECOMPUTED from
   * its KRs here rather than typed, which is what keeps the dashboard and the
   * workbook's =Current/Target formulas showing the same figure.
   */
  const patchKr = (
    oi: number,
    ki: number,
    patch: Partial<EditableKeyResult>
  ) => {
    setObjectives(prev =>
      prev.map((o, idx) => {
        if (idx !== oi) return o;
        const keyResults = o.keyResults.map((k, kidx) =>
          kidx === ki ? { ...k, ...patch } : k
        );
        return {
          ...o,
          keyResults,
          progress: derivedObjectiveProgress(keyResults) ?? o.progress,
        };
      })
    );
    setDirty(true);
  };

  const addObj = () => {
    setObjectives(prev => [
      ...prev,
      { title: '', progress: 0, keyResults: [], initiatives: [] },
    ]);
    setDirty(true);
  };
  const removeObj = (i: number) => {
    setObjectives(prev => prev.filter((_, idx) => idx !== i));
    setDirty(true);
  };

  // ---- Excel: download / upload / import ----
  const onDownload = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      // Export what is in the database right now, so the workbook mirrors the
      // dashboard. Falls back to the shipped template if the DB is unreachable.
      let blob: Blob;
      let live = true;
      try {
        blob = await buildLiveWorkbookBlob();
      } catch {
        blob = await getTemplateBlob();
        live = false;
      }
      triggerDownload(blob, 'bridge_xpi_okrs.xlsx');
      if (phase === 'all') {
        setToast(
          live
            ? `Downloaded with every department's current numbers - ${OKR_TEAMS.length} tabs.`
            : `Template downloaded - ${OKR_TEAMS.length} department tabs.`
        );
      } else {
        setToast(
          live
            ? `Downloaded with the dashboard's current numbers - your tab is "${teamName}".`
            : `Template downloaded - fill in your own "${teamName}" tab, then Upload & import.`
        );
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }, [teamName, phase]);

  const onPickFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // allow re-selecting the same file
      if (!file) return;
      setError(null);
      setImportResults(null);
      setBusy(true);
      try {
        const parsed = await parseOkrFile(file);
        if (!parsed.teams.length) {
          setError(
            parsed.warnings[0] ??
              'No OKR rows found in that file. Use the downloaded template.'
          );
          return;
        }
        // "All departments" imports the whole workbook; a single department
        // imports only its own tab.
        if (phase === 'all') {
          setPreview(parsed);
          setToast(
            `Read ${parsed.teams.length} department${
              parsed.teams.length === 1 ? '' : 's'
            } from ${parsed.sheetNames.length} tab${
              parsed.sheetNames.length === 1 ? '' : 's'
            }.`
          );
          return;
        }

        // The workbook holds one tab per team lead. You import YOUR tab and
        // nothing else: everyone else's rows are dropped here, and the DB's
        // row-level security refuses them anyway if this gets past us.
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const mine = parsed.teams.filter(pt => {
          if (teamId) {
            const hit = matchTeam(pt.teamName, teamsRef.current);
            if (hit) return hit.id === teamId;
          }
          return norm(pt.teamName) === norm(teamName);
        });
        if (!mine.length) {
          setError(
            `That workbook has no rows for your team (${teamName}). It has these tabs: ${parsed.sheetNames.join(
              ', '
            )}. Open your own tab and check the Team column says "${teamName}".`
          );
          return;
        }
        const ignored = parsed.teams.length - mine.length;
        setPreview({ ...parsed, teams: mine });
        if (ignored > 0) {
          setToast(
            `Reading your "${mine[0].sheetName}" tab - ${ignored} other team${
              ignored === 1 ? '' : 's'
            } in the file ${ignored === 1 ? 'was' : 'were'} ignored.`
          );
        }
      } catch (err: any) {
        setError(err?.message ?? String(err));
      } finally {
        setBusy(false);
      }
    },
    [teamName, teamId, phase]
  );

  const applyImport = useCallback(async () => {
    if (!preview) return;
    setImporting(true);
    setError(null);
    try {
      const results = await importParsedWorkbook(preview, teamsRef.current);
      setImportResults(results);
      // refresh the currently-open team from the DB so the editor reflects it
      if (teamId && phase === 'edit') {
        try {
          const data = await fetchTeamOkr(teamId);
          setMeta(prev => ({ ...data.meta, owner: prev.owner }));
          setObjectives(data.objectives);
          setDirty(false);
        } catch {
          // fall back to the parsed values for the current team
          const mine = preview.teams.find(
            pt => matchTeam(pt.teamName, teamsRef.current)?.id === teamId
          );
          const objs = editableFromParsed(mine);
          if (objs.length) setObjectives(objs);
        }
      }
      const ok = results.filter(r => r.outcome === 'imported').length;
      setToast(
        ok
          ? phase === 'all'
            ? `${ok} department${ok === 1 ? '' : 's'} pushed to the dashboard.`
            : `${teamName} pushed to the dashboard.`
          : 'Nothing was imported - see the result below.'
      );
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setImporting(false);
    }
  }, [preview, teamId, teamName, phase]);

  // auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  // ---- summary for the stat row ----
  const objCount = objectives.length;
  const avgProgress = objCount
    ? Math.round(
        objectives.reduce((s, o) => s + (o.progress ?? 0), 0) / objCount
      )
    : 0;
  const statuses = objectives.map(o => statusFromProgress(o.progress));
  const notOk = statuses.filter(s => s !== 'on_track').length;
  const overall = rollupStatus(objectives.map(o => o.progress));
  const overallColor = STATUS_COLOR[overall];
  const overallSub =
    objCount === 0
      ? 'No objectives yet'
      : notOk === 0
        ? 'All objectives on track'
        : `${notOk} objective${notOk === 1 ? '' : 's'} to watch`;
  const avatarText = initialsOf(meta.owner || teamName);

  // Header notifications, derived from the current OKR state.
  const notifs: { title: string; sub: string; color: string }[] = [];
  if (dirty) {
    notifs.push({
      title: 'Unsaved changes',
      sub: 'Your edits have not been saved yet.',
      color: T.accent,
    });
  }
  objectives.forEach(o => {
    const st = statusFromProgress(o.progress);
    if (st !== 'on_track' && (o.title || '').trim()) {
      notifs.push({
        title: o.title,
        sub: `${STATUS_LABEL[st]} · ${o.progress}% progress`,
        color: STATUS_COLOR[st],
      });
    }
  });
  if (savedAt) {
    notifs.push({
      title: 'Last saved',
      sub: savedAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      color: STATUS_COLOR.on_track,
    });
  }

  // ---- render ----
  return (
    <div style={{ ...S.root, background: T.bg, color: T.text }}>
      <style>{SLIDER_CSS}</style>
      {phase === 'pick' ? (
        <div style={S.pickWrap}>
          <div style={S.pickCard}>
            <h1 style={S.pickTitle}>Which department are you from?</h1>
            <p style={{ ...S.pickSub, color: T.sub }}>
              Pick your team to load and edit its {CURRENT_QUARTER}{' '}
              {CURRENT_YEAR} OKR.
            </p>

            <div style={S.pickList}>
              {OKR_TEAMS.map(t => {
                const on = pick === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setPick(t.key)}
                    style={{
                      ...S.pickItem,
                      borderColor: on ? T.accent : T.border,
                      background: on ? rgba('#f15a29', 0.08) : '#fff',
                    }}
                  >
                    <span
                      style={{ ...S.radio, borderColor: on ? T.accent : T.sub }}
                    >
                      {on ? <span style={S.radioDot} /> : null}
                    </span>
                    <span style={{ ...S.teamDot, background: t.accent }} />
                    {t.name}
                  </button>
                );
              })}

              <div style={S.pickDivider}>
                <span style={S.pickDividerText}>or</span>
              </div>

              <button
                onClick={() => setPick(ALL_KEY)}
                style={{
                  ...S.pickItem,
                  borderColor: pick === ALL_KEY ? T.accent : T.border,
                  background: pick === ALL_KEY ? rgba('#f15a29', 0.08) : '#fff',
                }}
              >
                <span
                  style={{
                    ...S.radio,
                    borderColor: pick === ALL_KEY ? T.accent : T.sub,
                  }}
                >
                  {pick === ALL_KEY ? <span style={S.radioDot} /> : null}
                </span>
                <span style={S.allDot}>◎</span>
                <span>
                  All departments
                  <span style={{ ...S.allItemSub, color: T.sub }}>
                    upload one workbook, update every team
                  </span>
                </span>
              </button>
            </div>

            {error ? <div style={S.err}>{error}</div> : null}

            <div style={S.pickActions}>
              <button style={S.ghostBtn} onClick={() => guardedLeave(-1)}>
                Cancel
              </button>
              <button
                style={{ ...S.primaryBtn, opacity: pick && !busy ? 1 : 0.5 }}
                disabled={!pick || busy}
                onClick={() => pick && void chooseTeam(pick)}
              >
                {busy ? 'Loading…' : 'Continue →'}
              </button>
            </div>
          </div>
        </div>
      ) : phase === 'all' ? (
        <>
          <div style={S.appbar}>
            <div style={S.appbarLeft}>
              <button
                style={S.appMenu}
                onClick={() => setPhase('pick')}
                title="Change department"
              >
                ☰
              </button>
              <span style={S.appMark}>◎</span>
              <span style={S.appTitle}>OKRs</span>
            </div>
          </div>

          <div style={S.allWrap}>
            <div style={S.allCard}>
              <h1 style={S.allTitle}>All departments</h1>
              <p style={{ ...S.pickSub, color: T.sub }}>
                Upload one workbook holding every team&apos;s tab and push all{' '}
                {OKR_TEAMS.length} departments in a single import. Each tab is
                matched to its department by the <strong>Team</strong> column,
                so tab order and tab names don&apos;t matter.
              </p>

              <ol style={S.allSteps}>
                <li>
                  Download the workbook - it comes filled with the
                  dashboard&apos;s current numbers, one tab per department.
                </li>
                <li>
                  Each lead fills in their own tab, or you collect the returned
                  tabs into this one file.
                </li>
                <li>
                  Upload it here and check the preview - every department that
                  matched is listed with its objectives.
                </li>
                <li>
                  Push to write them all to the dashboard at once. Progress
                  stays driven by Current / Target.
                </li>
              </ol>

              <div style={S.allNote}>
                Writing departments other than your own needs an admin profile (
                <code>profiles.is_admin = true</code>, migration 0002). Without
                it the database accepts only your own department and the rest
                come back as <em>skipped</em>.
              </div>

              {error ? <div style={S.err}>{error}</div> : null}

              <div style={S.allActions}>
                <button
                  style={{ ...S.downloadBtn, opacity: busy ? 0.6 : 1 }}
                  onClick={() => void onDownload()}
                  disabled={busy}
                  title="Download every department's tab, filled with the dashboard's current numbers"
                >
                  Download workbook
                </button>
                <button
                  style={{ ...S.uploadBtn, opacity: busy ? 0.6 : 1 }}
                  onClick={() => fileInput.current?.click()}
                  disabled={busy}
                  title="Upload the full workbook and import every department"
                >
                  Upload &amp; import all
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  style={{ display: 'none' }}
                  onChange={e => void onPickFile(e)}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* top app bar */}
          <div style={S.appbar}>
            <div style={S.appbarLeft}>
              <button
                style={S.appMenu}
                onClick={() => setPhase('pick')}
                title="Change department"
              >
                ☰
              </button>
              <span style={S.appMark}>◎</span>
              <span style={S.appTitle}>OKRs</span>
            </div>
            <div style={S.appbarRight} ref={appbarRightRef}>
              <button
                style={{
                  ...S.iconBtn,
                  ...(hdrMenu === 'notif' ? S.iconBtnOn : null),
                }}
                onClick={() =>
                  setHdrMenu(m => (m === 'notif' ? null : 'notif'))
                }
                title="Notifications"
                aria-label="Notifications"
              >
                <span style={S.bell}>🔔</span>
                {notifs.length > 0 ? (
                  <span style={S.badge}>{notifs.length}</span>
                ) : null}
              </button>
              <button
                style={{
                  ...S.avatarBtn,
                  ...(hdrMenu === 'profile' ? S.iconBtnOn : null),
                }}
                onClick={() =>
                  setHdrMenu(m => (m === 'profile' ? null : 'profile'))
                }
                title="Account"
                aria-label="Account"
              >
                <span style={S.avatar}>{avatarText}</span>
              </button>

              {hdrMenu === 'notif' ? (
                <div style={S.dropdown}>
                  <div style={S.ddHead}>Notifications</div>
                  {notifs.length === 0 ? (
                    <div style={S.ddEmpty}>{'You’re all caught up 🎉'}</div>
                  ) : (
                    notifs.map((n, i) => (
                      <div key={i} style={S.ddNotif}>
                        <span style={{ ...S.ddDot, background: n.color }} />
                        <div>
                          <div style={S.ddNotifTitle}>{n.title}</div>
                          <div style={S.ddNotifSub}>{n.sub}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : null}

              {hdrMenu === 'profile' ? (
                <div style={S.dropdown}>
                  <div style={S.ddProfile}>
                    <span style={S.ddAvatar}>{avatarText}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={S.ddName}>{meta.owner || teamName}</div>
                      <div style={S.ddSub}>{teamName} · OKR editor</div>
                    </div>
                  </div>
                  <div style={S.ddSep} />
                  <button
                    style={S.ddItem}
                    onClick={() => {
                      setHdrMenu(null);
                      window.dispatchEvent(new Event('bridge-open-profile'));
                    }}
                  >
                    <span style={S.ddItemIcon}>⚙️</span> Settings
                  </button>
                  <button
                    style={S.ddItem}
                    onClick={() => {
                      setHdrMenu(null);
                      setPhase('pick');
                    }}
                  >
                    <span style={S.ddItemIcon}>🔀</span> Change department
                  </button>
                  <button
                    style={S.ddItem}
                    onClick={() => {
                      setHdrMenu(null);
                      guardedLeave('/okr-dashboard');
                    }}
                  >
                    <span style={S.ddItemIcon}>📊</span> View dashboard
                  </button>
                  <div style={S.ddSep} />
                  <button
                    style={{ ...S.ddItem, color: '#b42318' }}
                    onClick={() => {
                      setHdrMenu(null);
                      void (globalThis as any).bridgeSignOut?.();
                    }}
                  >
                    <span style={S.ddItemIcon}>↩︎</span> Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div style={S.content}>
            {/* header */}
            <header style={S.header}>
              <div>
                <button style={S.link} onClick={() => setPhase('pick')}>
                  ← Change department
                </button>
                <h1 style={S.title}>
                  {teamName} · OKR {CURRENT_QUARTER} {CURRENT_YEAR}
                </h1>
              </div>
              <button
                style={S.link}
                onClick={() => guardedLeave('/okr-dashboard')}
              >
                View dashboard ↗
              </button>
            </header>

            {/* Excel Sync */}
            <div style={S.toolbar}>
              <div>
                <div style={S.toolbarKicker}>
                  <span style={S.toolbarIcon}>▦</span> EXCEL SYNC
                </div>
                <span style={{ color: T.sub, fontSize: 13 }}>
                  The workbook has a tab per team. Fill in your own{' '}
                  <strong>{teamName}</strong> tab and push it here, or edit the
                  sliders below by hand.
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  style={{ ...S.downloadBtn, opacity: busy ? 0.6 : 1 }}
                  onClick={() => void onDownload()}
                  disabled={busy}
                  title={`Download the Excel workbook - one tab per team, yours is "${teamName}"`}
                >
                  Download template
                </button>
                <button
                  style={{ ...S.uploadBtn, opacity: busy ? 0.6 : 1 }}
                  onClick={() => fileInput.current?.click()}
                  disabled={busy}
                  title={`Upload the filled-in workbook - only your "${teamName}" tab is imported`}
                >
                  Upload &amp; import
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  style={{ display: 'none' }}
                  onChange={e => void onPickFile(e)}
                />
              </div>
            </div>

            {/* Business Ops slide shown full-screen on the wall board */}
            <BusinessOpsPanel />

            {/* summary stat row */}
            <div style={S.statRow}>
              <div style={S.statCell}>
                <span
                  style={{
                    ...S.statIcon,
                    background: rgba('#f15a29', 0.12),
                    color: '#f15a29',
                  }}
                >
                  ◎
                </span>
                <div>
                  <div style={S.statLabel}>Objectives</div>
                  <div style={S.statValue}>{objCount}</div>
                  <div style={S.statSub}>Total objectives</div>
                </div>
              </div>
              <div style={S.statDivider} />
              <div style={S.statCell}>
                <span
                  style={{
                    ...S.statIcon,
                    background: rgba('#2eb85c', 0.12),
                    color: '#2eb85c',
                  }}
                >
                  ↗
                </span>
                <div>
                  <div style={S.statLabel}>Average progress</div>
                  <div style={S.statValue}>{avgProgress}%</div>
                  <div style={S.statSub}>Across all objectives</div>
                </div>
              </div>
              <div style={S.statDivider} />
              <div style={S.statCell}>
                <span
                  style={{
                    ...S.statIcon,
                    background: rgba(overallColor, 0.14),
                    color: overallColor,
                  }}
                >
                  ✓
                </span>
                <div>
                  <div style={S.statLabel}>Overall status</div>
                  <div
                    style={{
                      ...S.statValue,
                      fontSize: 18,
                      color: overallColor,
                    }}
                  >
                    {STATUS_LABEL[overall]}
                  </div>
                  <div style={S.statSub}>{overallSub}</div>
                </div>
              </div>
            </div>

            {/* meta */}
            <div style={S.metaRow}>
              <Field label="Area / Discipline">
                <div style={S.inputWrap}>
                  <span style={S.inputIcon}>👥</span>
                  <input
                    style={{ ...S.input, paddingLeft: 38 }}
                    value={meta.area}
                    onChange={e => {
                      setMeta({ ...meta, area: e.target.value });
                      setDirty(true);
                    }}
                  />
                </div>
              </Field>
              <Field label="Owner">
                <div style={S.inputWrap}>
                  <span style={S.inputIcon}>👤</span>
                  <input
                    style={{ ...S.input, paddingLeft: 38 }}
                    value={meta.owner}
                    onChange={e => {
                      setMeta({ ...meta, owner: e.target.value });
                      setDirty(true);
                    }}
                  />
                </div>
              </Field>
            </div>

            {/* objectives */}
            <div style={S.objHead}>
              <span>OBJECTIVES</span>
              <span style={{ color: T.sub, fontWeight: 500, letterSpacing: 0 }}>
                progress drives the dashboard status
              </span>
            </div>

            {objectives.map((o, i) => {
              const st = statusFromProgress(o.progress);
              const c = STATUS_COLOR[st];
              // Progress is derived (and therefore read-only) as soon as the
              // objective has KRs carrying numbers. Objectives without them
              // keep the old free slider.
              const derived = derivedObjectiveProgress(o.keyResults) !== null;
              return (
                <div key={i} style={S.objCard}>
                  <div style={S.objTopRow}>
                    <span style={S.objBadge}>{i + 1}</span>
                    <input
                      style={S.objTitleInput}
                      placeholder={`Objective ${i + 1} - what do we want to achieve?`}
                      value={o.title}
                      onChange={e => patchObj(i, { title: e.target.value })}
                    />
                    <div style={{ position: 'relative' }}>
                      <button
                        style={S.kebab}
                        title="Options"
                        onClick={() => setMenuFor(menuFor === i ? null : i)}
                      >
                        ⋮
                      </button>
                      {menuFor === i ? (
                        <div style={S.menu}>
                          <button
                            style={S.menuItem}
                            onClick={() => {
                              removeObj(i);
                              setMenuFor(null);
                            }}
                          >
                            Remove objective
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div style={S.progressRow}>
                    <div style={S.sliderWrap}>
                      <div
                        style={{
                          ...S.sliderBubble,
                          left: `${o.progress}%`,
                          color: c,
                        }}
                      >
                        {o.progress}%
                      </div>
                      <div style={S.sliderRow}>
                        <div style={S.trackLine}>
                          <div
                            style={{
                              ...S.trackFill,
                              width: `${o.progress}%`,
                              background: c,
                            }}
                          />
                        </div>
                        <input
                          className="okr-range"
                          type="range"
                          min={0}
                          max={100}
                          value={o.progress}
                          disabled={derived}
                          title={
                            derived
                              ? 'Calculated from the Key Results below - edit a Current Value instead'
                              : undefined
                          }
                          onChange={e =>
                            patchObj(i, {
                              progress: clampProgress(Number(e.target.value)),
                            })
                          }
                          style={
                            {
                              ['--okr-c' as string]: c,
                              cursor: derived ? 'not-allowed' : 'pointer',
                            } as CSSProperties
                          }
                        />
                      </div>
                      <div style={S.sliderEnds}>
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <div style={S.pctBox}>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={o.progress}
                        readOnly={derived}
                        onChange={e =>
                          patchObj(i, {
                            progress: clampProgress(Number(e.target.value)),
                          })
                        }
                        style={S.pctInput}
                      />
                      <span style={{ color: T.sub }}>%</span>
                    </div>
                    <span
                      style={{
                        ...S.statusChip,
                        color: c,
                        background: rgba(c, 0.12),
                        border: `1px solid ${rgba(c, 0.4)}`,
                      }}
                    >
                      ● {STATUS_LABEL[st]}
                    </span>
                  </div>

                  {o.keyResults.length ? (
                    <div style={S.krBlock}>
                      <div style={S.krHead}>
                        KEY RESULTS
                        <span style={S.krHint}>
                          progress is calculated from Current / Target
                        </span>
                      </div>
                      {o.keyResults.map((k, ki) => {
                        const kp = krProgress(k);
                        const kc = STATUS_COLOR[statusFromProgress(kp)];
                        return (
                          <div key={ki} style={S.krRow}>
                            <span style={S.krDesc}>
                              {k.description || `Key result ${ki + 1}`}
                            </span>
                            <input
                              type="number"
                              value={k.current}
                              onChange={e =>
                                patchKr(i, ki, {
                                  current: Number(e.target.value),
                                })
                              }
                              style={S.krInput}
                              title="Current Value - this is what the Excel formula divides by Target"
                            />
                            <span style={S.krOf}>
                              / {k.target}
                              {k.unit ? ` ${k.unit}` : ''}
                            </span>
                            <span style={{ ...S.krPct, color: kc }}>{kp}%</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <button style={S.addBtn} onClick={addObj}>
              ＋ Add objective
            </button>

            {error ? <div style={S.err}>{error}</div> : null}
            <div style={{ height: 96 }} />
          </div>

          {/* sticky save bar */}
          <div style={S.saveBar}>
            <div style={S.saveBarInner}>
              <span style={S.saveStatus}>
                <span style={S.saveDot}>✓</span>
                <span>
                  <b style={{ color: T.text }}>
                    {saving
                      ? 'Saving…'
                      : dirty
                        ? 'Editing… auto-saves'
                        : savedAt
                          ? `Saved · ${savedAt.toLocaleTimeString()}`
                          : 'Auto-save on'}
                  </b>
                  <span style={S.saveSub}>
                    {' '}
                    All changes are saved automatically
                  </span>
                </span>
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={S.ghostBtn} onClick={() => guardedLeave(-1)}>
                  Close
                </button>
                <button
                  style={{ ...S.primaryBtn, opacity: saving ? 0.6 : 1 }}
                  disabled={saving}
                  onClick={() => void save()}
                >
                  {saving ? 'Saving…' : 'Save now'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {toast ? <div style={S.toast}>{toast}</div> : null}

      {preview ? (
        <ImportPreview
          preview={preview}
          teams={teams}
          currentTeamId={teamId}
          importing={importing}
          results={importResults}
          onApply={() => void applyImport()}
          onClose={() => {
            setPreview(null);
            setImportResults(null);
          }}
        />
      ) : null}
    </div>
  );
}

// ---- Import preview modal --------------------------------------------------
function ImportPreview({
  preview,
  teams,
  currentTeamId,
  importing,
  results,
  onApply,
  onClose,
}: {
  preview: ParsedWorkbook;
  teams: Team[];
  currentTeamId: string | null;
  importing: boolean;
  results: TeamImportResult[] | null;
  onApply: () => void;
  onClose: () => void;
}) {
  const resultFor = (excelName: string) =>
    results?.find(r => r.excelName === excelName);
  const totalObjs = preview.teams.reduce((s, t) => s + t.objectives.length, 0);
  const totalKrs = preview.teams.reduce(
    (s, t) => s + t.objectives.reduce((a, o) => a + o.keyResults.length, 0),
    0
  );

  return (
    <div style={S.modalWrap} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>
              Preview import
            </h2>
            <p style={{ margin: '4px 0 0', color: T.sub, fontSize: 13 }}>
              {preview.teams.length === 1 && preview.teams[0].sheetName
                ? `From your "${preview.teams[0].sheetName}" tab`
                : `${preview.teams.length} teams`}{' '}
              · {totalObjs} objectives · {totalKrs} key results
            </p>
          </div>
          <button style={S.kebab} onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div style={S.modalBody}>
          {preview.warnings.map(w => (
            <p
              key={w}
              style={{
                margin: '0 0 10px',
                fontSize: 12.5,
                color: STATUS_COLOR.at_risk,
              }}
            >
              {w}
            </p>
          ))}
          {preview.teams.map(pt => {
            const match = matchTeam(pt.teamName, teams);
            const res = resultFor(pt.teamName);
            const isCurrent = match?.id && match.id === currentTeamId;
            return (
              <div key={pt.teamName} style={S.previewTeam}>
                <div style={S.previewTeamHead}>
                  <span style={{ fontWeight: 700 }}>
                    {pt.teamName}
                    {isCurrent ? (
                      <span style={{ ...S.badgeYou, color: T.accent }}>
                        {' '}
                        (your team)
                      </span>
                    ) : null}
                  </span>
                  {res ? (
                    <ResultChip res={res} />
                  ) : match ? (
                    <span style={{ ...S.mapChip, color: T.sub }}>
                      → {match.name}
                    </span>
                  ) : (
                    <span
                      style={{ ...S.mapChip, color: STATUS_COLOR.off_track }}
                    >
                      no matching team - will skip
                    </span>
                  )}
                </div>
                {pt.objectives.map(o => {
                  const st = statusFromProgress(o.progress);
                  const c = STATUS_COLOR[st];
                  return (
                    <div key={o.number} style={S.previewObj}>
                      <span style={{ flex: 1 }}>
                        {o.title || `Objective ${o.number}`}
                      </span>
                      <span style={{ color: T.sub, fontSize: 12 }}>
                        {o.keyResults.length} KR
                      </span>
                      <span style={{ ...S.miniBarTrack, background: T.track }}>
                        <span
                          style={{
                            ...S.miniBarFill,
                            width: `${o.progress}%`,
                            background: c,
                          }}
                        />
                      </span>
                      <span
                        style={{
                          width: 38,
                          textAlign: 'right',
                          color: c,
                          fontWeight: 700,
                        }}
                      >
                        {o.progress}%
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div style={S.modalFoot}>
          <span style={{ color: T.sub, fontSize: 12.5, flex: 1 }}>
            {results
              ? 'Import finished - if your team can’t be written you need the admin policy (0002 migration).'
              : 'Pushes your own tab to the dashboard. No other team is touched.'}
          </span>
          <button style={S.ghostBtn} onClick={onClose}>
            {results ? 'Done' : 'Cancel'}
          </button>
          {!results ? (
            <button
              style={{ ...S.primaryBtn, opacity: importing ? 0.6 : 1 }}
              disabled={importing}
              onClick={onApply}
            >
              {importing ? 'Pushing…' : 'Push to dashboard'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ResultChip({ res }: { res: TeamImportResult }) {
  const map = {
    imported: { c: STATUS_COLOR.on_track, label: 'Imported ✓' },
    skipped: { c: '#9aa3b2', label: 'Skipped' },
    error: { c: STATUS_COLOR.off_track, label: 'Failed' },
  } as const;
  const m = map[res.outcome];
  return (
    <span
      style={{
        ...S.mapChip,
        color: m.c,
        background: rgba(m.c === '#9aa3b2' ? '#9aa3b2' : m.c, 0.14),
        border: `1px solid ${rgba(m.c === '#9aa3b2' ? '#9aa3b2' : m.c, 0.4)}`,
      }}
      title={res.message ?? ''}
    >
      {m.label}
      {res.message && res.outcome !== 'imported' ? ` · ${res.message}` : ''}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block', flex: 1, minWidth: 240 }}>
      <div style={{ fontSize: 12.5, color: T.sub, marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </label>
  );
}

const FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const S: Record<string, CSSProperties> = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    overflowY: 'auto',
    fontFamily: FONT,
  },
  content: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '24px 28px 40px',
  },
  // top app bar
  appbar: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 58,
    padding: '0 22px',
    background: '#fff',
    borderBottom: `1px solid ${T.border}`,
  },
  appbarLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  appbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  iconBtn: {
    position: 'relative',
    border: 'none',
    background: 'transparent',
    borderRadius: 9,
    padding: 6,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  iconBtnOn: { background: rgba('#20242e', 0.06) },
  avatarBtn: {
    border: 'none',
    background: 'transparent',
    borderRadius: '50%',
    padding: 2,
    cursor: 'pointer',
    display: 'inline-flex',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 15,
    height: 15,
    padding: '0 3px',
    borderRadius: 8,
    background: T.accent,
    color: '#fff',
    fontSize: 9.5,
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 288,
    maxHeight: 380,
    overflowY: 'auto',
    background: '#fff',
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    boxShadow: '0 20px 48px -18px rgba(45,52,63,.45)',
    padding: 6,
    zIndex: 50,
  },
  ddHead: {
    padding: '8px 10px 6px',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: T.sub,
  },
  ddEmpty: { padding: '14px 10px', fontSize: 13.5, color: T.sub },
  ddNotif: {
    display: 'flex',
    gap: 10,
    padding: '9px 10px',
    borderRadius: 9,
    alignItems: 'flex-start',
  },
  ddDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginTop: 5,
    flexShrink: 0,
  },
  ddNotifTitle: {
    fontSize: 13.5,
    fontWeight: 600,
    color: T.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 220,
  },
  ddNotifSub: { fontSize: 12, color: T.sub, marginTop: 2 },
  ddProfile: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    padding: '8px 10px',
  },
  ddAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: rgba('#f15a29', 0.15),
    color: T.accent,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 800,
    flexShrink: 0,
  },
  ddName: {
    fontSize: 14.5,
    fontWeight: 700,
    color: T.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  ddSub: { fontSize: 12, color: T.sub, marginTop: 2 },
  ddSep: { height: 1, background: T.border, margin: '6px 4px' },
  ddItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 10px',
    border: 'none',
    background: 'transparent',
    borderRadius: 9,
    cursor: 'pointer',
    fontSize: 13.5,
    fontWeight: 600,
    color: T.text,
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  ddItemIcon: { fontSize: 14, width: 18, textAlign: 'center' },
  appMenu: {
    border: 'none',
    background: 'transparent',
    color: T.sub,
    fontSize: 18,
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
  },
  appMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    background: T.accent,
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    flexShrink: 0,
  },
  appTitle: { fontSize: 16, fontWeight: 800, color: T.text },
  bell: { fontSize: 15, opacity: 0.7 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: rgba('#f15a29', 0.15),
    color: T.accent,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12.5,
    fontWeight: 800,
  },
  // picker
  pickWrap: {
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pickCard: {
    width: 'min(460px, 92vw)',
    background: '#fff',
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 20px 50px -30px rgba(20,24,34,.4)',
  },
  pickTitle: { fontSize: 22, fontWeight: 800, margin: 0, color: T.text },
  pickSub: { fontSize: 13.5, margin: '8px 0 18px' },
  pickList: { display: 'flex', flexDirection: 'column', gap: 8 },
  pickItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    textAlign: 'left',
    padding: '11px 14px',
    borderRadius: 10,
    border: '1px solid',
    color: T.text,
    fontSize: 15,
    cursor: 'pointer',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioDot: { width: 8, height: 8, borderRadius: '50%', background: '#f15a29' },
  teamDot: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  pickActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 22,
  },
  // header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 18,
  },
  title: {
    fontSize: 27,
    fontWeight: 800,
    margin: '6px 0 0',
    color: T.text,
    letterSpacing: -0.3,
  },
  link: {
    background: 'transparent',
    border: 'none',
    color: T.sub,
    fontSize: 13,
    cursor: 'pointer',
    padding: 0,
    fontWeight: 600,
  },
  // Excel Sync
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    padding: '16px 20px',
    border: `1px solid ${rgba('#f15a29', 0.25)}`,
    background: rgba('#f15a29', 0.05),
    borderRadius: 14,
    marginBottom: 18,
  },
  toolbarKicker: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 12.5,
    fontWeight: 800,
    letterSpacing: 1.2,
    color: '#f15a29',
    marginBottom: 4,
  },
  toolbarIcon: { fontSize: 14 },
  btnIcon: { fontSize: 15, marginRight: 2 },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 20px',
    borderRadius: 11,
    border: 'none',
    background: '#f15a29',
    color: '#fff',
    fontSize: 14.5,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(241,90,41,0.3)',
    whiteSpace: 'nowrap',
  },
  uploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 20px',
    borderRadius: 11,
    border: '1.5px solid #f15a29',
    background: '#fff',
    color: '#f15a29',
    fontSize: 14.5,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  // stat row
  statRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 0,
    background: '#fff',
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: '18px 8px',
    marginBottom: 22,
    flexWrap: 'wrap',
  },
  statCell: {
    flex: 1,
    minWidth: 200,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '4px 20px',
  },
  statDivider: { width: 1, background: T.border, alignSelf: 'stretch' },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
  },
  statLabel: { fontSize: 12.5, color: T.sub, fontWeight: 600 },
  statValue: {
    fontSize: 26,
    fontWeight: 800,
    color: T.text,
    lineHeight: 1.15,
  },
  statSub: { fontSize: 12, color: T.sub },
  // meta
  metaRow: { display: 'flex', gap: 20, marginBottom: 26, flexWrap: 'wrap' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: {
    position: 'absolute',
    left: 13,
    fontSize: 14,
    opacity: 0.6,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    height: 46,
    padding: '0 14px',
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: '#fff',
    color: T.text,
    fontSize: 14.5,
    boxSizing: 'border-box',
    fontFamily: FONT,
  },
  objHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontSize: 12.5,
    fontWeight: 800,
    letterSpacing: 1,
    color: T.text,
    marginBottom: 12,
  },
  objCard: {
    background: '#fff',
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    padding: '18px 20px',
    marginBottom: 14,
    boxShadow: '0 1px 2px rgba(20,24,34,.04)',
  },
  objTopRow: { display: 'flex', gap: 12, alignItems: 'center' },
  objBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    background: rgba('#f15a29', 0.1),
    color: T.accent,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 800,
    flexShrink: 0,
  },
  objTitleInput: {
    flex: 1,
    height: 40,
    padding: '0 12px',
    borderRadius: 9,
    border: `1px solid transparent`,
    background: 'transparent',
    color: T.text,
    fontSize: 16,
    fontWeight: 600,
    boxSizing: 'border-box',
    fontFamily: FONT,
  },
  kebab: {
    background: 'transparent',
    border: 'none',
    color: T.sub,
    fontSize: 18,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 8,
    flexShrink: 0,
    lineHeight: 1,
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: 4,
    background: '#fff',
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    boxShadow: '0 10px 30px -8px rgba(20,24,34,.3)',
    zIndex: 10,
    minWidth: 160,
    padding: 6,
  },
  menuItem: {
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    color: '#e5341f',
    fontSize: 13.5,
    fontWeight: 600,
    padding: '9px 10px',
    borderRadius: 7,
    cursor: 'pointer',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    marginTop: 18,
    flexWrap: 'wrap',
  },
  sliderWrap: {
    position: 'relative',
    flex: 1,
    minWidth: 220,
    paddingTop: 22,
  },
  sliderBubble: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    fontSize: 12.5,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  sliderRow: { position: 'relative', height: 20 },
  trackLine: {
    position: 'absolute',
    top: 7,
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 4,
    background: T.track,
    overflow: 'hidden',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 6,
    borderRadius: 4,
  },
  sliderEnds: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: T.sub,
    marginTop: 8,
  },
  pctBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  pctInput: {
    width: 64,
    height: 40,
    padding: '0 10px',
    borderRadius: 9,
    border: `1px solid ${T.border}`,
    background: '#fff',
    color: T.text,
    fontSize: 14.5,
    fontWeight: 700,
    textAlign: 'right',
    boxSizing: 'border-box',
    fontFamily: FONT,
  },
  statusChip: {
    fontSize: 12.5,
    fontWeight: 700,
    padding: '7px 12px',
    borderRadius: 9,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  pickDivider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '4px 0',
  },
  pickDividerText: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#9aa3b2',
    fontWeight: 700,
  },
  allDot: {
    width: 10,
    height: 10,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: '#f15a29',
    flexShrink: 0,
  },
  allItemSub: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    marginTop: 2,
  },
  allWrap: {
    display: 'flex',
    justifyContent: 'center',
    padding: '32px 20px 60px',
  },
  allCard: {
    width: '100%',
    maxWidth: 760,
    background: '#fff',
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 6px 26px rgba(20,24,34,.07)',
  },
  allTitle: {
    margin: '0 0 6px',
    fontSize: 24,
    fontWeight: 800,
  },
  allSteps: {
    margin: '18px 0 0',
    paddingLeft: 20,
    fontSize: 13.5,
    lineHeight: 1.75,
    color: T.text,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  allNote: {
    marginTop: 18,
    padding: '12px 14px',
    borderRadius: 10,
    fontSize: 12.5,
    lineHeight: 1.6,
    color: '#7a5b12',
    background: 'rgba(245,166,35,.12)',
    border: '1px solid rgba(245,166,35,.4)',
  },
  allActions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 22,
  },
  krBlock: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: `1px dashed ${T.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  krHead: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.2,
    color: T.sub,
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
    flexWrap: 'wrap',
  },
  krHint: {
    fontSize: 11.5,
    fontWeight: 500,
    letterSpacing: 0,
    opacity: 0.75,
  },
  krRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13.5,
  },
  krDesc: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    lineHeight: 1.35,
  },
  krInput: {
    width: 72,
    padding: '6px 8px',
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: T.card,
    color: T.text,
    fontSize: 13.5,
    fontWeight: 700,
    textAlign: 'right',
    flexShrink: 0,
  },
  krOf: {
    color: T.sub,
    fontSize: 12.5,
    minWidth: 78,
    flexShrink: 0,
  },
  krPct: {
    fontSize: 13.5,
    fontWeight: 800,
    width: 46,
    textAlign: 'right',
    flexShrink: 0,
  },
  addBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: `1.5px dashed ${rgba('#f15a29', 0.4)}`,
    background: rgba('#f15a29', 0.03),
    color: T.accent,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 4,
  },
  saveBar: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    background: '#fff',
    borderTop: `1px solid ${T.border}`,
    boxShadow: '0 -6px 20px -12px rgba(20,24,34,.25)',
    zIndex: 20,
  },
  saveBarInner: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '14px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  saveStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    color: T.sub,
  },
  saveDot: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: rgba('#2eb85c', 0.15),
    color: '#2eb85c',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    flexShrink: 0,
  },
  saveSub: { color: T.sub, fontSize: 12.5 },
  primaryBtn: {
    padding: '11px 24px',
    borderRadius: 10,
    border: 'none',
    background: '#f15a29',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  ghostBtn: {
    padding: '11px 20px',
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: '#fff',
    color: T.text,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  err: {
    color: '#b42318',
    background: '#fef3f2',
    border: '1px solid #fecdc9',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    margin: '14px 0',
  },
  toast: {
    position: 'fixed',
    left: '50%',
    bottom: 92,
    transform: 'translateX(-50%)',
    background: T.text,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '11px 18px',
    fontSize: 13.5,
    boxShadow: '0 12px 30px -8px rgba(20,24,34,.5)',
    zIndex: 10001,
  },
  // modal
  modalWrap: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(20,24,34,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: 20,
  },
  modal: {
    width: 'min(640px, 96vw)',
    maxHeight: '86vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    boxShadow: '0 30px 70px -20px rgba(20,24,34,.5)',
  },
  modalHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 22px 12px',
  },
  modalBody: {
    overflowY: 'auto',
    padding: '4px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  modalFoot: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 22px',
    borderTop: `1px solid ${T.border}`,
  },
  previewTeam: {
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: '12px 14px',
  },
  previewTeamHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  badgeYou: { fontSize: 12, fontWeight: 700 },
  mapChip: {
    fontSize: 11.5,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 7,
    whiteSpace: 'nowrap',
  },
  previewObj: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '5px 0',
    fontSize: 13.5,
  },
  miniBarTrack: {
    width: 90,
    height: 6,
    borderRadius: 4,
    overflow: 'hidden',
    flexShrink: 0,
  },
  miniBarFill: { display: 'block', height: '100%', borderRadius: 4 },
};
