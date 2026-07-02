import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  clampProgress,
  CURRENT_QUARTER,
  CURRENT_YEAR,
  type EditableObjective,
  fetchTeamOkr,
  getMyTeamId,
  getTeams,
  type OkrMeta,
  saveTeamOkr,
  setMyTeam,
  STATUS_COLOR,
  STATUS_LABEL,
  statusFromProgress,
  type Team,
} from '../okr-dashboard/okr-data';

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

export function OkrEditor() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [phase, setPhase] = useState<'pick' | 'edit'>('pick');
  const [pick, setPick] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [meta, setMeta] = useState<OkrMeta>({
    area: '',
    owner: '',
    focus_note: '',
  });
  const [objectives, setObjectives] = useState<EditableObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [ts, myId] = await Promise.all([getTeams(), getMyTeamId()]);
        setTeams(ts);
        setPick(myId ?? ts[0]?.id ?? null);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })().catch(() => {});
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

  const chooseTeam = useCallback(async (id: string) => {
    setError(null);
    setLoading(true);
    try {
      await setMyTeam(id);
      const data = await fetchTeamOkr(id);
      setTeamId(id);
      setMeta(data.meta);
      setObjectives(data.objectives);
      setDirty(false);
      setPhase('edit');
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

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
      // auto-save is on — flush any pending edit before leaving
      if (dirty) save().catch(() => {});
      if (typeof to === 'number') {
        navigate(to);
        return;
      }
      navigate(to);
    },
    [dirty, save, navigate]
  );

  // Auto-save: persist 2s after the last edit — no need to press Save.
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

  const teamName = teams.find(t => t.id === teamId)?.name ?? '';

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

            {loading ? (
              <div style={{ color: T.sub, padding: 12 }}>Loading teams…</div>
            ) : teams.length === 0 ? (
              <div style={{ color: T.sub, padding: 12 }}>
                No teams found. Run <code>supabase/seed.sql</code> and make sure
                you’re signed in.
              </div>
            ) : (
              <div style={S.pickList}>
                {teams.map(t => {
                  const on = pick === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setPick(t.id)}
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
            )}

            {error ? <div style={S.err}>{error}</div> : null}

            <div style={S.pickActions}>
              <button style={S.ghostBtn} onClick={() => guardedLeave(-1)}>
                Cancel
              </button>
              <button
                style={{
                  ...S.primaryBtn,
                  opacity: pick && !loading ? 1 : 0.5,
                }}
                disabled={!pick || loading}
                onClick={() => pick && void chooseTeam(pick)}
              >
                Continue →
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
                    placeholder={`Objective ${i + 1} — what do we want to achieve?`}
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
    </div>
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
    marginBottom: 20,
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
};
