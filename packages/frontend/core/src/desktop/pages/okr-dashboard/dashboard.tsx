import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { OKR_DASHBOARD_ZOOM, usePageZoom } from '../../../utils/app-zoom';
import { BusinessOpsOverlay } from './business-ops-overlay';
import {
  CURRENT_QUARTER,
  CURRENT_YEAR,
  type DashboardModel,
  fetchDashboardModel,
  type Objective,
  quarterExpectedPct,
  type Status,
  STATUS_COLOR,
  STATUS_LABEL,
  statusFromProgress,
  subscribeDashboard,
  type Team,
  type TeamRollup,
} from './okr-data';

// Theme-aware tokens: these CSS vars flip automatically between light & dark.
const T = {
  bg: 'var(--affine-background-primary-color, #0b0d10)',
  card: 'var(--affine-background-overlay-panel-color, #14171c)',
  cardSoft: 'var(--affine-background-secondary-color, #101318)',
  border: 'var(--affine-border-color, rgba(255,255,255,0.09))',
  text: 'var(--affine-text-primary-color, #e8eaed)',
  sub: 'var(--affine-text-secondary-color, #9aa3b2)',
  track: 'var(--affine-hover-color, rgba(255,255,255,0.07))',
};

function rgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const ORDER: Status[] = ['on_track', 'at_risk', 'off_track'];

function pct(n: number | null | undefined): number {
  return Math.max(0, Math.min(100, Math.round(n ?? 0)));
}

// ---- status badge ---------------------------------------------------------
function Badge({ status, progress }: { status: Status; progress: number }) {
  const c = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        padding: '5px 10px',
        borderRadius: 8,
        fontSize: 12.5,
        fontWeight: 700,
        color: c,
        background: rgba(c, 0.14),
        border: `1px solid ${rgba(c, 0.45)}`,
      }}
    >
      {STATUS_LABEL[status]} · {progress}%
    </span>
  );
}

// ---- one objective row (bar coloured by the TEAM status, per the mockup) --
function ObjectiveRow({
  obj,
  color,
  onOpen,
}: {
  obj: Objective;
  color: string;
  onOpen: (id: string) => void;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(obj.progress ?? 0)));
  return (
    <button
      type="button"
      onClick={() => onOpen(obj.id)}
      title="Open objective details"
      style={S.objRowBtn}
    >
      <div style={S.objTop}>
        <span style={S.objTitle}>{obj.title || 'Untitled objective'}</span>
        <span style={S.objPct}>{pct}%</span>
      </div>
      <div style={{ ...S.track, background: T.track }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 5,
            background: color,
            boxShadow: `0 0 8px ${rgba(color, 0.55)}`,
            transition: 'width .4s ease',
          }}
        />
      </div>
    </button>
  );
}

// ---- team card ------------------------------------------------------------
function TeamCard({
  rollup,
  onOpen,
}: {
  rollup: TeamRollup;
  onOpen: (id: string) => void;
}) {
  const { team, objectives, progress, status, owner } = rollup;
  const color = STATUS_COLOR[status];
  return (
    <div style={{ ...S.card, borderColor: T.border }}>
      <div style={S.cardHead}>
        <h2 style={S.teamName}>{team.name}</h2>
        {objectives.length ? (
          <Badge status={status} progress={progress} />
        ) : null}
      </div>
      {objectives.length ? (
        objectives.map(o => (
          <ObjectiveRow key={o.id} obj={o} color={color} onOpen={onOpen} />
        ))
      ) : (
        <div style={S.emptyCard}>
          No objectives yet - edit this team&apos;s OKR.
        </div>
      )}
      {/* Sits on the card's bottom edge (marginTop:auto) so the leader line
          stays aligned across cards of differing objective counts. */}
      <div style={{ ...S.leader, borderColor: T.border, color: T.sub }}>
        Team leader: <span style={S.leaderName}>{owner || '—'}</span>
      </div>
    </div>
  );
}

// ---- donut ----------------------------------------------------------------
function Donut({ counts }: { counts: Record<Status, number> }) {
  const total = ORDER.reduce((s, k) => s + counts[k], 0) || 1;
  const r = 52;
  const cx = 70;
  const cy = 70;
  const sw = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={140} height={140} viewBox="0 0 140 140" aria-hidden="true">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={T.track}
        strokeWidth={sw}
      />
      {ORDER.map(k => {
        const len = (counts[k] / total) * circ;
        const seg = (
          <circle
            key={k}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={STATUS_COLOR[k]}
            strokeWidth={sw}
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += len;
        return seg;
      })}
    </svg>
  );
}

// ---- pace vs plan ---------------------------------------------------------
function PaceBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={S.objTop}>
        <span style={S.objTitle}>{label}</span>
        <span style={S.objPct}>{value}%</span>
      </div>
      <div style={{ ...S.track, background: T.track }}>
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            borderRadius: 5,
            background: color,
            transition: 'width .4s ease',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Overall progress against how far into the quarter we actually are. Status on
 * this board is pace-based, so this is the number that explains every badge:
 * 63% reads as On Track in month one and At Risk in month three.
 */
function PaceCard({
  overall,
  expected,
}: {
  overall: number;
  expected: number;
}) {
  const delta = overall - expected;
  const ahead = delta >= 0;
  const color = STATUS_COLOR[statusFromProgress(overall, expected)];
  return (
    <div style={{ ...S.card, borderColor: T.border }}>
      <div style={{ ...S.overviewTitle, color: T.sub }}>PACE VS PLAN</div>
      <div style={{ ...S.kpiBig, color }}>
        {ahead ? '+' : '−'}
        {Math.abs(delta)} pts
      </div>
      <div style={{ ...S.kpiCaption, color: T.sub }}>
        {ahead ? 'ahead of quarter pace' : 'behind quarter pace'}
      </div>
      <PaceBar label="Actual progress" value={overall} color={color} />
      <PaceBar label="Expected by today" value={expected} color={T.sub} />
    </div>
  );
}

// ---- needs attention ------------------------------------------------------
type Behind = { obj: Objective; team: Team; value: number };

/**
 * The objectives furthest behind pace, worst first. Everything here is already
 * on the board somewhere, but spread across seven cards — this is the one place
 * that answers "what do we talk about first" without scanning all of them.
 */
function AttentionCard({
  items,
  expected,
  onOpen,
}: {
  items: Behind[];
  expected: number;
  onOpen: (id: string) => void;
}) {
  return (
    <div style={{ ...S.card, borderColor: T.border }}>
      <div style={{ ...S.overviewTitle, color: T.sub }}>NEEDS ATTENTION</div>
      {items.length ? (
        items.map(({ obj, team, value }) => {
          const c = STATUS_COLOR[statusFromProgress(value, expected)];
          return (
            <button
              key={obj.id}
              type="button"
              onClick={() => onOpen(obj.id)}
              title="Open objective details"
              style={S.objRowBtn}
            >
              <div style={S.objTop}>
                <span style={S.objTitle}>
                  {obj.title || 'Untitled objective'}
                </span>
                <span style={{ ...S.objPct, color: c }}>{value}%</span>
              </div>
              <div style={{ ...S.attnTeam, color: T.sub }}>
                {team.name} · {expected - value} pts behind
              </div>
            </button>
          );
        })
      ) : (
        <div style={S.emptyCard}>
          Every objective is on or ahead of pace for {CURRENT_QUARTER}.
        </div>
      )}
    </div>
  );
}

// ---- page -----------------------------------------------------------------
export function OkrDashboard() {
  const navigate = useNavigate();
  const [model, setModel] = useState<DashboardModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const m = await fetchDashboardModel();
      setModel(m);
      setUpdatedAt(new Date());
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, []);

  useEffect(() => {
    load().catch(() => {});
    const unsub = subscribeDashboard(() => {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => void load(), 250);
    });
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
      unsub();
    };
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  // The dashboard is a dense, full-viewport view — it carries its own scale so
  // 100% browser zoom shows the whole board at once. Restored on close.
  usePageZoom(OKR_DASHBOARD_ZOOM);

  const openObjective = useCallback(
    (id: string) => navigate(`/okr-objective/${id}`),
    [navigate]
  );

  const counts = model?.counts ?? { on_track: 0, at_risk: 0, off_track: 0 };

  // Pace benchmark for the live quarter, and the objectives trailing it worst.
  // Recomputed on every render so the board stays honest as the quarter runs on
  // — it re-renders whenever the realtime subscription fires.
  const expected = quarterExpectedPct();
  const behind: Behind[] = (model?.teams ?? [])
    .flatMap(r => r.objectives.map(obj => ({ obj, team: r.team })))
    .map(x => ({ ...x, value: pct(x.obj.progress) }))
    .filter(x => x.value < expected)
    .sort((a, b) => a.value - b.value)
    .slice(0, 5);

  return (
    <div style={{ ...S.root, background: T.bg, color: T.text }}>
      <BusinessOpsOverlay />

      <button style={S.close} onClick={() => navigate(-1)} title="Close (Esc)">
        ✕
      </button>

      {/* ---------- header ---------- */}
      <header style={S.header}>
        <div style={{ minWidth: 0 }}>
          <h1 style={S.title}>
            BRIDGE XPI - OKRs {CURRENT_QUARTER} {CURRENT_YEAR}
          </h1>
          <div style={{ ...S.subtitle, color: T.sub }}>
            {model?.area ?? 'Excellence Department'} · Auto-updated from OKRs ·{' '}
            <span style={S.liveWrap}>
              <span style={S.liveDot} /> live
            </span>
            {updatedAt ? ` · updated ${updatedAt.toLocaleTimeString()}` : ''}
          </div>
        </div>

        {/* summary panel */}
        <div style={S.summary}>
          <div
            style={{
              ...S.summaryCell,
              background: T.card,
              borderColor: T.border,
            }}
          >
            <div style={S.summaryBig}>{model?.overall ?? 0}%</div>
            <div style={{ ...S.summaryLabel, color: T.sub }}>
              overall progress
            </div>
          </div>
          {ORDER.map(k => (
            <div
              key={k}
              style={{
                ...S.summaryCell,
                background: rgba(STATUS_COLOR[k], 0.1),
                borderColor: rgba(STATUS_COLOR[k], 0.45),
              }}
            >
              <div style={{ ...S.summaryBig, color: STATUS_COLOR[k] }}>
                {counts[k]}
              </div>
              <div style={{ ...S.summaryLabel, color: STATUS_COLOR[k] }}>
                {STATUS_LABEL[k].toLowerCase()}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* ---------- body ---------- */}
      {error ? (
        <div
          style={{ ...S.errorBox, background: T.card, borderColor: T.border }}
        >
          <b>Couldn’t load dashboard data.</b>
          <div style={{ marginTop: 6, color: T.sub }}>{error}</div>
          <div style={{ marginTop: 10, fontSize: 12, color: T.sub }}>
            Run <code>supabase/migrations/0001_okr_dashboard.sql</code> +{' '}
            <code>supabase/seed.sql</code>, and make sure you’re signed in.
          </div>
        </div>
      ) : !model ? (
        <div style={{ ...S.loading, color: T.sub }}>Loading OKRs…</div>
      ) : (
        <div style={S.grid}>
          {model.teams.map(r => (
            <TeamCard key={r.team.id} rollup={r} onOpen={openObjective} />
          ))}

          {/* STATUS OVERVIEW cell */}
          <div style={{ ...S.card, borderColor: T.border }}>
            <div style={{ ...S.overviewTitle, color: T.sub }}>
              STATUS OVERVIEW
            </div>
            <div style={S.overviewBody}>
              <Donut counts={counts} />
              <div style={{ flex: 1 }}>
                {ORDER.map(k => (
                  <div key={k} style={S.legendRow}>
                    <span
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        background: STATUS_COLOR[k],
                      }}
                    />
                    <span style={{ flex: 1, fontSize: 13 }}>
                      {STATUS_LABEL[k]}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>
                      {counts[k]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PaceCard overall={model.overall} expected={expected} />
          <AttentionCard
            items={behind}
            expected={expected}
            onOpen={openObjective}
          />
        </div>
      )}
    </div>
  );
}

// ---- styles ---------------------------------------------------------------
const S: Record<string, CSSProperties> = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    overflowY: 'auto',
    padding: '28px 32px 32px',
    // Column layout so the card grid can claim the leftover height instead of
    // leaving a band of empty background under the last row — this board lives
    // on a wall-mounted screen, where that gap is the whole bottom third.
    display: 'flex',
    flexDirection: 'column',
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  close: {
    position: 'fixed',
    top: 18,
    right: 20,
    zIndex: 10000,
    width: 34,
    height: 34,
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    background: 'transparent',
    color: 'inherit',
    fontSize: 15,
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 24,
    flexWrap: 'wrap',
    marginBottom: 24,
    paddingRight: 40,
  },
  title: { fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: -0.3 },
  subtitle: { fontSize: 13.5, marginTop: 6 },
  liveWrap: { display: 'inline-flex', alignItems: 'center', gap: 5 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#2eb85c',
    display: 'inline-block',
    animation: 'okrpulse 1.6s infinite',
  },
  summary: { display: 'flex', gap: 12, flexShrink: 0 },
  summaryCell: {
    minWidth: 92,
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid',
    textAlign: 'center',
  },
  summaryBig: { fontSize: 26, fontWeight: 800, lineHeight: 1.1 },
  summaryLabel: { fontSize: 11.5, marginTop: 2, fontWeight: 600 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 18,
    // Rows never shrink below their content, but share any spare height, so a
    // short last row stretches to the bottom edge rather than leaving a gap.
    gridAutoRows: 'minmax(min-content, 1fr)',
    flex: 1,
    minHeight: 0,
  },
  card: {
    background: T.card,
    border: '1px solid',
    borderRadius: 16,
    padding: 20,
    // Column so a card can push its footer to the bottom of the stretched row.
    display: 'flex',
    flexDirection: 'column',
  },
  leader: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTop: '1px solid',
    fontSize: 12.5,
  },
  leaderName: { fontWeight: 700, color: T.text },
  cardHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 18,
  },
  teamName: { fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.2 },
  objRowBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    padding: '4px 6px',
    margin: '0 -6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    color: 'inherit',
  },
  objTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 7,
  },
  objTitle: {
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  objPct: { fontSize: 14, fontWeight: 700, flexShrink: 0 },
  track: { height: 9, borderRadius: 5, overflow: 'hidden' },
  emptyCard: { fontSize: 13, opacity: 0.6, padding: '12px 0' },
  overviewTitle: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  overviewBody: { display: 'flex', alignItems: 'center', gap: 16 },
  kpiBig: { fontSize: 34, fontWeight: 800, lineHeight: 1.05, marginTop: 4 },
  kpiCaption: { fontSize: 12.5, fontWeight: 600, marginTop: 2 },
  attnTeam: { fontSize: 12, marginTop: 5 },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '7px 0',
  },
  loading: { padding: 40, fontSize: 14 },
  errorBox: {
    padding: 20,
    border: '1px solid',
    borderRadius: 12,
    maxWidth: 560,
    fontSize: 14,
  },
};
