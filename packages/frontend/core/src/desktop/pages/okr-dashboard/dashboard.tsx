import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CURRENT_QUARTER,
  CURRENT_YEAR,
  type DashboardModel,
  fetchDashboardModel,
  type Objective,
  type Status,
  STATUS_COLOR,
  STATUS_LABEL,
  subscribeDashboard,
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
function ObjectiveRow({ obj, color }: { obj: Objective; color: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(obj.progress ?? 0)));
  return (
    <div style={{ marginBottom: 14 }}>
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
    </div>
  );
}

// ---- team card ------------------------------------------------------------
function TeamCard({ rollup }: { rollup: TeamRollup }) {
  const { team, objectives, progress, status } = rollup;
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
        objectives.map(o => <ObjectiveRow key={o.id} obj={o} color={color} />)
      ) : (
        <div style={S.emptyCard}>
          No objectives yet — edit this team&apos;s OKR.
        </div>
      )}
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

  const counts = model?.counts ?? { on_track: 0, at_risk: 0, off_track: 0 };

  return (
    <div style={{ ...S.root, background: T.bg, color: T.text }}>
      <button style={S.close} onClick={() => navigate(-1)} title="Close (Esc)">
        ✕
      </button>

      {/* ---------- header ---------- */}
      <header style={S.header}>
        <div style={{ minWidth: 0 }}>
          <h1 style={S.title}>
            BRIDGE XPI — OKRs {CURRENT_QUARTER} {CURRENT_YEAR}
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
            <TeamCard key={r.team.id} rollup={r} />
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
    padding: '28px 32px 40px',
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
  },
  card: {
    background: T.card,
    border: '1px solid',
    borderRadius: 16,
    padding: 20,
  },
  cardHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 18,
  },
  teamName: { fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.2 },
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
