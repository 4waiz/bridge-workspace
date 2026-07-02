import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  fetchObjectiveDetail,
  type ObjectiveDetail,
  STATUS_COLOR,
  STATUS_DESC,
  STATUS_LABEL,
  statusFromProgress,
} from '../okr-dashboard/okr-data';

const T = {
  bg: 'var(--affine-background-primary-color, #0b0d10)',
  card: 'var(--affine-background-overlay-panel-color, #14171c)',
  border: 'var(--affine-border-color, rgba(255,255,255,0.09))',
  text: 'var(--affine-text-primary-color, #e8eaed)',
  sub: 'var(--affine-text-secondary-color, #9aa3b2)',
  track: 'var(--affine-hover-color, rgba(255,255,255,0.07))',
};

function rgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// ---- radial gauge ---------------------------------------------------------
function Gauge({ value, color }: { value: number; color: string }) {
  const r = 76;
  const cx = 90;
  const cy = 90;
  const sw = 16;
  const circ = 2 * Math.PI * r;
  const pct = clamp(value);
  const dash = (pct / 100) * circ;
  const st = statusFromProgress(pct);
  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={T.track}
        strokeWidth={sw}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fontSize="40"
        fontWeight="800"
        fill="currentColor"
      >
        {pct}%
      </text>
      <text
        x={cx}
        y={cy + 24}
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill={color}
      >
        {STATUS_LABEL[st]}
      </text>
    </svg>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 26 }}>
      <div style={{ ...S.sectionTitle, color: T.sub }}>{title}</div>
      {children}
    </section>
  );
}

// ---- page -----------------------------------------------------------------
export function OkrObjectiveDetail() {
  const navigate = useNavigate();
  const { objectiveId } = useParams();
  const [data, setData] = useState<ObjectiveDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!objectiveId) return;
    fetchObjectiveDetail(objectiveId)
      .then(d => {
        setData(d);
        setError(null);
      })
      .catch(e => setError(e?.message ?? String(e)));
  }, [objectiveId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const progress = data ? clamp(data.objective.progress ?? 0) : 0;
  const status = statusFromProgress(progress);
  const color = STATUS_COLOR[status];
  const accent = data?.team?.accent ?? '#f15a29';
  const delta = data ? progress - data.teamProgress : 0;

  return (
    <div style={{ ...S.root, background: T.bg, color: T.text }}>
      <button style={S.close} onClick={() => navigate(-1)} title="Back (Esc)">
        ✕
      </button>

      {error ? (
        <div
          style={{ ...S.errorBox, background: T.card, borderColor: T.border }}
        >
          <b>Couldn’t load this objective.</b>
          <div style={{ marginTop: 6, color: T.sub }}>{error}</div>
        </div>
      ) : !data ? (
        <div style={{ ...S.loading, color: T.sub }}>Loading objective…</div>
      ) : (
        <>
          <button style={S.back} onClick={() => navigate(-1)}>
            ← Back to dashboard
          </button>
          <div style={S.breadcrumb}>
            <span style={{ ...S.dot, background: accent }} />
            {data.team?.name ?? 'Team'} · Objective {data.objective.position}
          </div>
          <h1 style={S.title}>
            {data.objective.title || 'Untitled objective'}
          </h1>

          {/* gauge + status */}
          <div style={S.topGrid}>
            <div
              style={{
                ...S.panel,
                background: T.card,
                borderColor: T.border,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Gauge value={progress} color={color} />
            </div>
            <div
              style={{
                ...S.panel,
                background: T.card,
                borderColor: T.border,
                flex: 1,
              }}
            >
              <div style={{ ...S.kicker, color: T.sub }}>STATUS</div>
              <div
                style={{ fontSize: 24, fontWeight: 800, color, marginTop: 4 }}
              >
                {STATUS_LABEL[status]}
              </div>
              <div style={{ color: T.sub, marginTop: 4 }}>
                {STATUS_DESC[status]}
              </div>
              <div
                style={{ height: 1, background: T.border, margin: '18px 0' }}
              />
              <Bar label="This objective" value={progress} color={color} />
              <Bar
                label={`Team average — ${data.team?.name ?? ''}`}
                value={data.teamProgress}
                color={STATUS_COLOR[statusFromProgress(data.teamProgress)]}
              />
              <div style={{ color: T.sub, fontSize: 12.5, marginTop: 12 }}>
                {delta >= 0
                  ? `+${delta} pts above team average`
                  : `${delta} pts below team average`}
              </div>
            </div>
          </div>

          {/* siblings comparison */}
          <Section title={`Objectives in ${data.team?.name ?? 'team'}`}>
            {data.siblings.map(o => {
              const st = statusFromProgress(o.progress ?? 0);
              const c = STATUS_COLOR[st];
              const me = o.id === data.objective.id;
              const pct = clamp(o.progress ?? 0);
              return (
                <div key={o.id} style={{ marginBottom: 13 }}>
                  <div style={S.objTop}>
                    <span
                      style={{
                        ...S.objTitle,
                        fontWeight: me ? 800 : 500,
                        color: me ? T.text : T.sub,
                      }}
                    >
                      {me ? '▸ ' : ''}
                      {o.title || 'Untitled'}
                    </span>
                    <span style={{ fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div
                    style={{
                      ...S.track,
                      background: T.track,
                      outline: me ? `2px solid ${rgba(c, 0.6)}` : 'none',
                      outlineOffset: 1,
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 5,
                        background: c,
                        boxShadow: `0 0 8px ${rgba(c, 0.5)}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </Section>

          {data.keyResults.length ? (
            <Section title="Key Results">
              <div style={S.cardsGrid}>
                {data.keyResults.map(kr => (
                  <div
                    key={kr.id}
                    style={{
                      ...S.miniCard,
                      background: T.card,
                      borderColor: T.border,
                    }}
                  >
                    <div style={{ fontSize: 14 }}>{kr.description}</div>
                    {kr.target_text ? (
                      <div
                        style={{
                          marginTop: 10,
                          fontWeight: 800,
                          color: accent,
                        }}
                      >
                        {kr.target_text}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {data.initiatives.length ? (
            <Section title="Initiatives">
              <div style={S.cardsGrid}>
                {data.initiatives.map(it => (
                  <div
                    key={it.id}
                    style={{
                      ...S.miniCard,
                      background: T.card,
                      borderColor: T.border,
                    }}
                  >
                    <div style={{ fontSize: 14 }}>{it.description}</div>
                    {it.owner ? (
                      <div
                        style={{ marginTop: 10, fontSize: 12, color: T.sub }}
                      >
                        Owner: {it.owner}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          <button style={S.editLink} onClick={() => navigate('/okr-editor')}>
            Edit this OKR →
          </button>
          <div style={{ height: 40 }} />
        </>
      )}
    </div>
  );
}

function Bar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = clamp(value);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={S.objTop}>
        <span style={{ fontSize: 13 }}>{label}</span>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{pct}%</span>
      </div>
      <div style={{ ...S.track, background: T.track }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 5,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    overflowY: 'auto',
    padding: '28px 32px 40px',
    maxWidth: 980,
    margin: '0 auto',
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
  back: {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    opacity: 0.7,
    fontSize: 13,
    cursor: 'pointer',
    padding: 0,
    marginBottom: 12,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    opacity: 0.8,
  },
  dot: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  title: {
    fontSize: 30,
    fontWeight: 800,
    margin: '8px 0 22px',
    letterSpacing: -0.3,
  },
  topGrid: { display: 'flex', gap: 18, flexWrap: 'wrap' },
  panel: {
    border: '1px solid',
    borderRadius: 16,
    padding: 22,
    minWidth: 220,
  },
  kicker: { fontSize: 12, fontWeight: 800, letterSpacing: 1.5 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 1.2,
    marginBottom: 12,
    textTransform: 'uppercase',
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
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 14,
  },
  miniCard: { border: '1px solid', borderRadius: 12, padding: 16 },
  editLink: {
    marginTop: 26,
    background: 'transparent',
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    color: 'inherit',
    padding: '10px 16px',
    fontSize: 14,
    cursor: 'pointer',
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
