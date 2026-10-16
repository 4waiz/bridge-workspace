import {
  Children,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { OKR_DASHBOARD_ZOOM, useFitPageZoom } from '../../../utils/app-zoom';
import { BusinessOpsOverlay } from './business-ops-overlay';
import { BoardBackdrop3D, StatusDonut3D, useSurfaceTone } from './okr-3d';
import {
  Glare,
  GLASS,
  GLASS_DEEP,
  Rim,
  riseIn,
  Tube,
  useTilt,
} from './okr-glass';
import {
  CURRENT_QUARTER,
  CURRENT_YEAR,
  type DashboardModel,
  fetchDashboardModel,
  type Objective,
  quarterDay,
  quarterExpectedPct,
  quarterOf,
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
  glass: GLASS,
  glassDeep: GLASS_DEEP,
};

function rgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const ORDER: Status[] = ['on_track', 'at_risk', 'off_track'];

/** How long realtime row events settle before the board refetches. */
const REFETCH_DEBOUNCE_MS = 3_000;

/** How often the board checks whether the pace benchmark has moved. */
const PACE_CHECK_MS = 60_000;

function pct(n: number | null | undefined): number {
  return Math.max(0, Math.min(100, Math.round(n ?? 0)));
}

function dashboardErrorHint(error: string): string {
  if (/jwt issued at future/i.test(error)) {
    return 'Set this screen PC to automatic date/time, then sign out and sign in again.';
  }
  return 'Run supabase/migrations/0001_okr_dashboard.sql + supabase/seed.sql, and make sure you are signed in.';
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
        // A raised pill: lit from above, casting its own colour below.
        background: `linear-gradient(180deg, ${rgba(c, 0.26)} 0%, ${rgba(c, 0.1)} 100%)`,
        border: `1px solid ${rgba(c, 0.5)}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), 0 6px 16px -6px ${rgba(c, 0.65)}`,
        textShadow: `0 0 12px ${rgba(c, 0.45)}`,
      }}
    >
      {STATUS_LABEL[status]} · {progress}%
    </span>
  );
}

// ---- glass card -------------------------------------------------------------
/**
 * Every panel on the board: frosted glass over the 3D scene, with a rim of
 * `accent` light along its top edge. Under a mouse it leans towards the
 * pointer and catches a highlight; the wall screen has no pointer, so there it
 * simply sits still.
 */
function GlassCard({
  accent,
  index,
  children,
}: {
  accent?: string;
  /** Position on the board - staggers the entrance. */
  index: number;
  children: ReactNode;
}) {
  const tilt = useTilt<HTMLDivElement>();
  return (
    <div
      {...tilt}
      style={{ ...S.card, borderColor: T.border, ...riseIn(index) }}
    >
      <Glare />
      {accent ? <Rim color={accent} /> : null}
      {children}
    </div>
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
      <Tube value={pct} color={color} />
    </button>
  );
}

// ---- team card ------------------------------------------------------------
function TeamCard({
  rollup,
  index,
  onOpen,
}: {
  rollup: TeamRollup;
  index: number;
  onOpen: (id: string) => void;
}) {
  const { team, objectives, progress, status, owner } = rollup;
  const color = STATUS_COLOR[status];
  return (
    <GlassCard accent={objectives.length ? color : undefined} index={index}>
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
        Team leader: <span style={S.leaderName}>{owner || '-'}</span>
      </div>
    </GlassCard>
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
      <Tube value={value} color={color} />
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
  index,
}: {
  overall: number;
  expected: number;
  index: number;
}) {
  const delta = overall - expected;
  const ahead = delta >= 0;
  const color = STATUS_COLOR[statusFromProgress(overall, expected)];
  const { day, days } = quarterDay();
  return (
    <GlassCard accent={color} index={index}>
      <div style={{ ...S.overviewTitle, color: T.sub }}>PACE VS PLAN</div>
      <div
        style={{
          ...S.kpiBig,
          color,
          textShadow: `0 0 22px ${rgba(color, 0.4)}`,
        }}
      >
        {ahead ? '+' : '-'}
        {Math.abs(delta)} pts
      </div>
      <div style={{ ...S.kpiCaption, color: T.sub }}>
        {ahead ? 'ahead of' : 'behind'} {CURRENT_QUARTER} pace · day {day} of{' '}
        {days}
      </div>
      <PaceBar label="Actual progress" value={overall} color={color} />
      <PaceBar label="Expected by today" value={expected} color={T.sub} />
    </GlassCard>
  );
}

// ---- needs attention ------------------------------------------------------
type Behind = { obj: Objective; team: Team; value: number };

/**
 * The objectives furthest behind pace, worst first. Everything here is already
 * on the board somewhere, but spread across seven cards - this is the one place
 * that answers "what do we talk about first" without scanning all of them.
 */
function AttentionCard({
  items,
  expected,
  index,
  onOpen,
}: {
  items: Behind[];
  expected: number;
  index: number;
  onOpen: (id: string) => void;
}) {
  // Lit by the worst item on the list - or green when the list is empty.
  const accent =
    STATUS_COLOR[
      items.length ? statusFromProgress(items[0].value, expected) : 'on_track'
    ];
  return (
    <GlassCard accent={accent} index={index}>
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
    </GlassCard>
  );
}

/**
 * How many columns the board is laid out in.
 *
 * `auto-fill` picks the column count from the card width alone, which is what
 * left two dead cells in the bottom-right corner: 10 cards over 6 columns is
 * 6 + 4. Choosing the count from how many cards there actually are keeps the
 * rows full - 10 cards read as 5 + 5. Ties break towards fewer rows, since a
 * taller card is easier to read from across the room.
 */
export function gridColumns(count: number): number {
  if (count <= 4) return Math.max(1, count);
  let best = 4;
  let bestScore = Infinity;
  for (let cols = 4; cols <= 6; cols++) {
    const rows = Math.ceil(count / cols);
    const score = (cols * rows - count) * 10 + rows;
    if (score < bestScore) {
      bestScore = score;
      best = cols;
    }
  }
  return best;
}

/**
 * Column span per card, so a last row that does not divide evenly stretches to
 * the right-hand edge instead of leaving holes. Every card spans 1 except the
 * trailing partial row, which shares the columns between its cards.
 */
export function columnSpans(count: number, cols: number): number[] {
  const spans: number[] = Array.from({ length: count }, () => 1);
  const rest = count % cols;
  if (rest === 0) return spans;
  const base = Math.floor(cols / rest);
  const extra = cols % rest;
  for (let i = 0; i < rest; i++) {
    spans[count - rest + i] = base + (i < extra ? 1 : 0);
  }
  return spans;
}

/**
 * The card grid. Lays its children out over a column count derived from how
 * many there are, and stretches the last row across the full width, so the
 * board never shows an empty cell.
 */
function BoardGrid({ children }: { children: ReactNode }) {
  const cards = Children.toArray(children);
  const cols = gridColumns(cards.length);
  const spans = columnSpans(cards.length, cols);
  return (
    <div
      style={{
        ...S.grid,
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {cards.map((card, i) => (
        // The wrapper carries the span; the card inside fills it.
        <div key={i} style={{ ...S.cell, gridColumn: `span ${spans[i]}` }}>
          {card}
        </div>
      ))}
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
  const rootRef = useRef<HTMLDivElement>(null);
  // The 3D layer is lit to suit the theme, and rests while the Business Ops
  // slide covers the board.
  const tone = useSurfaceTone(rootRef);
  const [slideShown, setSlideShown] = useState(false);

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
      // A single save rewrites every objective on a team, so one edit arrives
      // as a burst of row events. Waiting for the burst to settle collapses it
      // into one refetch instead of several full dashboard reads - this screen
      // is open all day, so those add up.
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => void load(), REFETCH_DEBOUNCE_MS);
    });
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
      unsub();
    };
  }, [load]);

  // The pace benchmark creeps up about a point a day. Re-read the board when it
  // moves, so the badges (scored when the data is fetched) and the pace card
  // (scored on render) are always judged against the same number. The period
  // itself is fixed when the app loads, so once the calendar moves into the
  // next quarter the wall screen reloads to pick it up.
  useEffect(() => {
    let shown = quarterExpectedPct();
    const timer = setInterval(() => {
      const now = quarterOf();
      if (now.quarter !== CURRENT_QUARTER || now.year !== CURRENT_YEAR) {
        window.location.reload();
        return;
      }
      const next = quarterExpectedPct();
      if (next !== shown) {
        shown = next;
        void load();
      }
    }, PACE_CHECK_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  // The dashboard is a dense, full-viewport view - it carries its own scale so
  // 100% browser zoom shows the whole board at once. Restored on close.
  // The scale is a starting point, not a fixed value: the board shrinks from
  // here until every card fits, because on a wall-mounted screen anything below
  // the fold is never seen. Re-runs whenever the data changes.
  useFitPageZoom(OKR_DASHBOARD_ZOOM, rootRef, model);

  const openObjective = useCallback(
    (id: string) => navigate(`/okr-objective/${id}`),
    [navigate]
  );

  const counts = model?.counts ?? { on_track: 0, at_risk: 0, off_track: 0 };

  // Pace benchmark for the live quarter, and the objectives trailing it worst.
  // Recomputed on every render so the board stays honest as the quarter runs on
  // - it re-renders whenever the realtime subscription fires.
  const expected = quarterExpectedPct();
  const behind: Behind[] = (model?.teams ?? [])
    .flatMap(r => r.objectives.map(obj => ({ obj, team: r.team })))
    .map(x => ({ ...x, value: pct(x.obj.progress) }))
    .filter(x => x.value < expected)
    .sort((a, b) => a.value - b.value)
    .slice(0, 5);

  return (
    <div
      ref={rootRef}
      style={{ ...S.root, backgroundColor: T.bg, color: T.text }}
    >
      <BoardBackdrop3D dark={tone.dark} bg={tone.bg} paused={slideShown} />
      <BusinessOpsOverlay onShownChange={setSlideShown} />

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
              background: `linear-gradient(160deg, ${T.glass} 0%, ${T.glassDeep} 100%)`,
              borderColor: T.border,
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.1), 0 16px 32px -18px rgba(0,0,0,0.7)',
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
                // Raised tiles, each glowing in its own status colour.
                background: `linear-gradient(160deg, ${rgba(STATUS_COLOR[k], 0.24)} 0%, ${rgba(STATUS_COLOR[k], 0.07)} 100%)`,
                borderColor: rgba(STATUS_COLOR[k], 0.5),
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 16px 32px -18px ${rgba(STATUS_COLOR[k], 0.9)}`,
              }}
            >
              <div
                style={{
                  ...S.summaryBig,
                  color: STATUS_COLOR[k],
                  textShadow: `0 0 18px ${rgba(STATUS_COLOR[k], 0.5)}`,
                }}
              >
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
            {dashboardErrorHint(error)}
          </div>
        </div>
      ) : !model ? (
        <div style={{ ...S.loading, color: T.sub }}>Loading OKRs…</div>
      ) : (
        <BoardGrid>
          {model.teams.map((r, i) => (
            <TeamCard
              key={r.team.id}
              rollup={r}
              index={i}
              onOpen={openObjective}
            />
          ))}

          {/* STATUS OVERVIEW cell */}
          <GlassCard index={model.teams.length}>
            <div style={{ ...S.overviewTitle, color: T.sub }}>
              STATUS OVERVIEW
            </div>
            <div style={S.overviewBody}>
              <StatusDonut3D
                counts={counts}
                dark={tone.dark}
                paused={slideShown}
                fallback={<Donut counts={counts} />}
              />
              <div style={{ flex: 1 }}>
                {ORDER.map(k => (
                  <div key={k} style={S.legendRow}>
                    <span
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        // A little lit sphere, to match the 3D donut.
                        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.75), ${STATUS_COLOR[k]} 45%, ${rgba(STATUS_COLOR[k], 0.8)} 100%)`,
                        boxShadow: `0 0 8px ${rgba(STATUS_COLOR[k], 0.6)}`,
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
          </GlassCard>

          <PaceCard
            overall={model.overall}
            expected={expected}
            index={model.teams.length + 1}
          />
          <AttentionCard
            items={behind}
            expected={expected}
            index={model.teams.length + 2}
            onOpen={openObjective}
          />
        </BoardGrid>
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
    // leaving a band of empty background under the last row - this board lives
    // on a wall-mounted screen, where that gap is the whole bottom third.
    display: 'flex',
    flexDirection: 'column',
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    // Faint brand light in the corners, under the 3D scene - and the depth the
    // board keeps if that scene never loads.
    backgroundImage:
      'radial-gradient(1200px 640px at 12% -12%, rgba(241,90,41,0.12), transparent 60%), radial-gradient(1100px 760px at 102% 112%, rgba(76,110,245,0.12), transparent 62%)',
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
    background: T.glass,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 8px 20px -10px rgba(0,0,0,0.6)',
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
    backdropFilter: 'blur(12px) saturate(140%)',
    WebkitBackdropFilter: 'blur(12px) saturate(140%)',
  },
  summaryBig: { fontSize: 26, fontWeight: 800, lineHeight: 1.1 },
  summaryLabel: { fontSize: 11.5, marginTop: 2, fontWeight: 600 },
  grid: {
    display: 'grid',
    // gridTemplateColumns is set per render - see BoardGrid.
    gap: 18,
    // Rows never shrink below their content, but share any spare height, so a
    // short last row stretches to the bottom edge rather than leaving a gap.
    gridAutoRows: 'minmax(min-content, 1fr)',
    flex: 1,
    minHeight: 0,
  },
  // The grid item, one per card: it owns the column span so the card itself
  // stays a plain card wherever it is used.
  cell: { display: 'flex', minWidth: 0 },
  card: {
    // Frosted glass: the scene's light shows through, blurred, so it adds
    // depth without ever sitting sharp behind the text - which is why the
    // glass stays dense over the top third, where the objectives are.
    background: `linear-gradient(180deg, ${T.glass} 0%, ${T.glass} 34%, ${T.glassDeep} 100%)`,
    backdropFilter: 'blur(8px) saturate(120%)',
    WebkitBackdropFilter: 'blur(8px) saturate(120%)',
    border: '1px solid',
    borderRadius: 16,
    padding: 20,
    // Lit edge on top, soft contact shadow below - the card floats.
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 6px rgba(0,0,0,0.12), 0 26px 50px -28px rgba(0,0,0,0.65)',
    position: 'relative',
    transition: 'transform .35s ease',
    // Fill the cell, whether that cell spans one column or several.
    flex: 1,
    minWidth: 0,
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
    // Objective titles run long ("Establish Advanced Technology Lab
    // Demonstration, Innovation PoC, Usecases"). Wrap onto as many lines as
    // it takes rather than clipping with an ellipsis - the board is read from
    // across the room, so a hidden half-title is worse than a taller card.
    // flex:1 + minWidth:0 lets the title shrink inside the flex row so the
    // percentage on the right keeps its space.
    flex: 1,
    minWidth: 0,
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    lineHeight: 1.3,
  },
  objPct: { fontSize: 14, fontWeight: 700, flexShrink: 0 },
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
