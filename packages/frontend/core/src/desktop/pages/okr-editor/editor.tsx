import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  clampProgress,
  CURRENT_QUARTER,
  CURRENT_YEAR,
  editableFromParsed,
  type EditableObjective,
  fetchTeamOkr,
  getMyTeamId,
  getTeams,
  getTemplateBlob,
  importParsedWorkbook,
  matchTeam,
  type OkrMeta,
  parseOkrFile,
  saveTeamOkr,
  setMyTeam,
  STATUS_COLOR,
  STATUS_LABEL,
  statusFromProgress,
  type Team,
  type TeamImportResult,
} from '../okr-dashboard/okr-data';
import { OKR_TEAMS } from '../okr-dashboard/okr-seed-data';
import type { ParsedWorkbook } from '../okr-dashboard/xlsx-lite';

// theme-aware tokens (flip automatically light <-> dark)
const T = {
  bg: 'var(--affine-background-primary-color, #0b0d10)',
  card: 'var(--affine-background-overlay-panel-color, #14171c)',
  border: 'var(--affine-border-color, rgba(255,255,255,0.09))',
  text: 'var(--affine-text-primary-color, #e8eaed)',
  sub: 'var(--affine-text-secondary-color, #9aa3b2)',
  track: 'var(--affine-hover-color, rgba(255,255,255,0.07))',
  accent: 'var(--affine-primary-color, #f15a29)',
};

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

export function OkrEditor() {
  const navigate = useNavigate();
  // The picker renders instantly from the fixed roster; DB rows (with real ids)
  // load in the background so there is never a "loading teams…" wait.
  const [teams, setTeams] = useState<Team[]>([]);
  const teamsRef = useRef<Team[]>([]);
  const teamsPromise = useRef<Promise<Team[]> | null>(null);

  const [phase, setPhase] = useState<'pick' | 'edit'>('pick');
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
    setMeta(data.meta);
    setObjectives(data.objectives);
    setDirty(false);
  }, []);

  const chooseTeam = useCallback(
    async (key: string) => {
      setError(null);
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

  // Auto-save: persist 2s after the last edit.
  useEffect(() => {
    if (phase !== 'edit' || !dirty || !teamId || saving) return;
    const timer = setTimeout(() => {
      save().catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase, dirty, teamId, saving, save]);

  const patchObj = (i: number, patch: Partial<EditableObjective>) => {
    setObjectives(prev =>
      prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o))
    );
    setDirty(true);
  };
  const addObj = () => {
    setObjectives(prev => [...prev, { title: '', progress: 0 }]);
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
      const blob = await getTemplateBlob();
      triggerDownload(blob, 'bridge_xpi_okrs_template.xlsx');
      setToast(
        'Template downloaded - fill the OKRs tab, then Upload & import.'
      );
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }, []);

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
        // Each department only imports its own OKR — show/apply just this team.
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const mine = parsed.teams.filter(
          pt => norm(pt.teamName) === norm(teamName)
        );
        if (!mine.length) {
          setError(
            `No rows for your team (${teamName}) were found in that file. Make sure the "Team" column says "${teamName}".`
          );
          return;
        }
        setPreview({ ...parsed, teams: mine });
      } catch (err: any) {
        setError(err?.message ?? String(err));
      } finally {
        setBusy(false);
      }
    },
    [teamName]
  );

  const applyImport = useCallback(async () => {
    if (!preview) return;
    setImporting(true);
    setError(null);
    try {
      const results = await importParsedWorkbook(preview, teamsRef.current);
      setImportResults(results);
      // refresh the currently-open team from the DB so the editor reflects it
      if (teamId) {
        try {
          const data = await fetchTeamOkr(teamId);
          setMeta(data.meta);
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
      setToast(`Imported ${ok} team${ok === 1 ? '' : 's'} into the dashboard.`);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setImporting(false);
    }
  }, [preview, teamId]);

  // auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  // ---- render ----
  return (
    <div style={{ ...S.root, background: T.bg, color: T.text }}>
      {phase === 'pick' ? (
        <div style={S.pickWrap}>
          <div
            style={{ ...S.pickCard, background: T.card, borderColor: T.border }}
          >
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
                      background: on ? rgba('#f15a29', 0.1) : 'transparent',
                    }}
                  >
                    <span
                      style={{
                        ...S.radio,
                        borderColor: on ? T.accent : T.sub,
                      }}
                    >
                      {on ? <span style={S.radioDot} /> : null}
                    </span>
                    <span style={{ ...S.teamDot, background: t.accent }} />
                    {t.name}
                  </button>
                );
              })}
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
      ) : (
        <>
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
              View dashboard →
            </button>
          </header>

          {/* Excel toolbar — the primary workflow, so make it stand out */}
          <div
            style={{
              ...S.toolbar,
              borderColor: rgba('#f15a29', 0.35),
              background: rgba('#f15a29', 0.06),
            }}
          >
            <div>
              <div style={S.toolbarKicker}>EXCEL SYNC</div>
              <span style={{ color: T.sub, fontSize: 13 }}>
                Import updates the whole dashboard · or edit the sliders below
                by hand
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                style={{ ...S.downloadBtn, opacity: busy ? 0.6 : 1 }}
                onClick={() => void onDownload()}
                disabled={busy}
                title="Download the Excel template (demo data pre-filled)"
              >
                <span style={S.btnIcon}>⬇</span> Download template
              </button>
              <button
                style={{ ...S.uploadBtn, opacity: busy ? 0.6 : 1 }}
                onClick={() => fileInput.current?.click()}
                disabled={busy}
                title="Upload a filled-in Excel to import into the dashboard"
              >
                <span style={S.btnIcon}>⬆</span> Upload &amp; import
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

          {/* OKR meta */}
          <div style={{ ...S.metaRow }}>
            <Field label="Area / Discipline">
              <input
                style={{ ...S.input, borderColor: T.border }}
                value={meta.area}
                onChange={e => {
                  setMeta({ ...meta, area: e.target.value });
                  setDirty(true);
                }}
              />
            </Field>
            <Field label="Owner">
              <input
                style={{ ...S.input, borderColor: T.border }}
                value={meta.owner}
                onChange={e => {
                  setMeta({ ...meta, owner: e.target.value });
                  setDirty(true);
                }}
              />
            </Field>
          </div>

          {/* objectives */}
          <div style={S.objHead}>
            <span>OBJECTIVES</span>
            <span style={{ color: T.sub, fontWeight: 400 }}>
              progress drives the dashboard status colour
            </span>
          </div>

          {objectives.map((o, i) => {
            const st = statusFromProgress(o.progress);
            const c = STATUS_COLOR[st];
            return (
              <div
                key={i}
                style={{
                  ...S.objCard,
                  background: T.card,
                  borderColor: T.border,
                }}
              >
                <div style={S.objTopRow}>
                  <input
                    style={{ ...S.input, borderColor: T.border, flex: 1 }}
                    placeholder={`Objective ${i + 1} - what do we want to achieve?`}
                    value={o.title}
                    onChange={e => patchObj(i, { title: e.target.value })}
                  />
                  <button
                    style={S.removeBtn}
                    title="Remove objective"
                    onClick={() => removeObj(i)}
                  >
                    ✕
                  </button>
                </div>
                <div style={S.progressRow}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={o.progress}
                    onChange={e =>
                      patchObj(i, {
                        progress: clampProgress(Number(e.target.value)),
                      })
                    }
                    style={{ flex: 1, accentColor: c }}
                  />
                  <div style={S.pctBox}>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={o.progress}
                      onChange={e =>
                        patchObj(i, {
                          progress: clampProgress(Number(e.target.value)),
                        })
                      }
                      style={{
                        ...S.input,
                        borderColor: T.border,
                        width: 58,
                        textAlign: 'right',
                      }}
                    />
                    <span style={{ color: T.sub }}>%</span>
                  </div>
                  <span
                    style={{
                      ...S.statusChip,
                      color: c,
                      background: rgba(c, 0.14),
                      border: `1px solid ${rgba(c, 0.45)}`,
                    }}
                  >
                    {STATUS_LABEL[st]}
                  </span>
                </div>
              </div>
            );
          })}

          <button
            style={{ ...S.addBtn, borderColor: T.border }}
            onClick={addObj}
          >
            + Add objective
          </button>

          {error ? <div style={S.err}>{error}</div> : null}

          {/* sticky save bar */}
          <div
            style={{ ...S.saveBar, background: T.card, borderColor: T.border }}
          >
            <span style={{ color: T.sub, fontSize: 13 }}>
              {saving
                ? 'Saving…'
                : dirty
                  ? 'Editing… auto-saves'
                  : savedAt
                    ? `Saved ✓ ${savedAt.toLocaleTimeString()}`
                    : 'Auto-save on'}
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={S.ghostBtn} onClick={() => guardedLeave(-1)}>
                Close
              </button>
              <button
                style={{ ...S.primaryBtn, opacity: saving || !dirty ? 0.6 : 1 }}
                disabled={saving || !dirty}
                onClick={() => void save()}
              >
                {saving ? 'Saving…' : 'Save now'}
              </button>
            </div>
          </div>
          <div style={{ height: 80 }} />
        </>
      )}

      {toast ? (
        <div style={{ ...S.toast, background: T.card, borderColor: T.border }}>
          {toast}
        </div>
      ) : null}

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
      <div
        style={{ ...S.modal, background: T.card, borderColor: T.border }}
        onClick={e => e.stopPropagation()}
      >
        <div style={S.modalHead}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>
              Preview import
            </h2>
            <p style={{ margin: '4px 0 0', color: T.sub, fontSize: 13 }}>
              {preview.teams.length} team
              {preview.teams.length === 1 ? '' : 's'} · {totalObjs} objectives ·{' '}
              {totalKrs} key results
            </p>
          </div>
          <button style={S.removeBtn} onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div style={S.modalBody}>
          {preview.teams.map(pt => {
            const match = matchTeam(pt.teamName, teams);
            const res = resultFor(pt.teamName);
            const isCurrent = match?.id && match.id === currentTeamId;
            return (
              <div
                key={pt.teamName}
                style={{ ...S.previewTeam, borderColor: T.border }}
              >
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

        <div style={{ ...S.modalFoot, borderColor: T.border }}>
          <span style={{ color: T.sub, fontSize: 12.5, flex: 1 }}>
            {results
              ? 'Import finished - if your team can’t be written you need the admin policy (0002 migration).'
              : 'Applies your team’s OKR to the dashboard.'}
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
              {importing ? 'Importing…' : 'Apply to dashboard'}
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
    <label style={{ display: 'block', flex: 1 }}>
      <div style={{ fontSize: 12, color: T.sub, marginBottom: 5 }}>{label}</div>
      {children}
    </label>
  );
}

const S: Record<string, CSSProperties> = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    overflowY: 'auto',
    padding: '28px 32px 40px',
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  // picker
  pickWrap: {
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickCard: {
    width: 'min(460px, 92vw)',
    border: '1px solid',
    borderRadius: 16,
    padding: 28,
  },
  pickTitle: { fontSize: 22, fontWeight: 800, margin: 0 },
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
    color: 'inherit',
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
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#f15a29',
  },
  teamDot: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  pickActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 22,
  },
  // editor
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: 800, margin: '6px 0 0' },
  link: {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    opacity: 0.75,
    fontSize: 13,
    cursor: 'pointer',
    padding: 0,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    padding: '16px 20px',
    border: '1px solid',
    borderRadius: 14,
    marginBottom: 24,
  },
  toolbarKicker: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1.4,
    color: '#f15a29',
    marginBottom: 4,
  },
  btnIcon: { fontSize: 16, marginRight: 2 },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 22px',
    borderRadius: 11,
    border: 'none',
    background: '#f15a29',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(241,90,41,0.35)',
    whiteSpace: 'nowrap',
  },
  uploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 22px',
    borderRadius: 11,
    border: '2px solid #f15a29',
    background: 'rgba(241,90,41,0.12)',
    color: '#f15a29',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  metaRow: { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid',
    background: 'transparent',
    color: 'inherit',
    fontSize: 14,
    boxSizing: 'border-box',
  },
  objHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 1,
    marginBottom: 12,
  },
  objCard: {
    border: '1px solid',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  objTopRow: { display: 'flex', gap: 10, alignItems: 'center' },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    opacity: 0.5,
    fontSize: 15,
    cursor: 'pointer',
    padding: 6,
    flexShrink: 0,
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
  },
  pctBox: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  statusChip: {
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 8,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  addBtn: {
    width: '100%',
    padding: '11px',
    borderRadius: 10,
    border: '1px dashed',
    background: 'transparent',
    color: 'inherit',
    opacity: 0.8,
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 4,
  },
  saveBar: {
    position: 'fixed',
    left: 32,
    right: 32,
    bottom: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 18px',
    border: '1px solid',
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
  },
  primaryBtn: {
    padding: '9px 22px',
    borderRadius: 9,
    border: 'none',
    background: '#f15a29',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  ghostBtn: {
    padding: '9px 18px',
    borderRadius: 9,
    border: '1px solid var(--affine-border-color, rgba(255,255,255,0.15))',
    background: 'transparent',
    color: 'inherit',
    fontSize: 14,
    cursor: 'pointer',
  },
  err: {
    color: '#e5341f',
    background: 'rgba(229,52,31,0.1)',
    border: '1px solid rgba(229,52,31,0.4)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    margin: '14px 0',
  },
  toast: {
    position: 'fixed',
    left: '50%',
    bottom: 92,
    transform: 'translateX(-50%)',
    border: '1px solid',
    borderRadius: 10,
    padding: '11px 18px',
    fontSize: 13.5,
    boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
    zIndex: 10001,
  },
  // modal
  modalWrap: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: 20,
  },
  modal: {
    width: 'min(640px, 96vw)',
    maxHeight: '86vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid',
    borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
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
    borderTop: '1px solid',
  },
  previewTeam: {
    border: '1px solid',
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
