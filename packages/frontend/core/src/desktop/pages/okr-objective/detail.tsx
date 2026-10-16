import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { OKR_OBJECTIVE_ZOOM, usePageZoom } from '../../../utils/app-zoom';
import { ProgressGauge3D, useSurfaceTone } from '../okr-dashboard/okr-3d';
import {
  fetchObjectiveDetail,
  type KeyResult,
  krNumbers,
  type ObjectiveDetail,
  STATUS_COLOR,
  STATUS_DESC,
  STATUS_LABEL,
  statusFromProgress,
} from '../okr-dashboard/okr-data';
import {
  Glare,
  GLASS,
  GLASS_DEEP,
  Rim,
  riseIn,
  Tube,
  useTilt,
} from '../okr-dashboard/okr-glass';

const T = {
  bg: 'var(--affine-background-primary-color, #0b0d10)',
  card: 'var(--affine-background-overlay-panel-color, #14171c)',
  border: 'var(--affine-border-color, rgba(255,255,255,0.09))',
  text: 'var(--affine-text-primary-color, #e8eaed)',
  sub: 'var(--affine-text-secondary-color, #9aa3b2)',
  track: 'var(--affine-hover-color, rgba(255,255,255,0.07))',
  glass: GLASS,
  glassDeep: GLASS_DEEP,
};

function rgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * A Key Result's progress, Current / Target - the same figure the Excel
 * workbook computes with =Current/Target, so target 2 / current 1 reads 50%.
 * Not capped: beating a target reads 125%. Null when the KR has no numbers.
 */
function krPercent(kr: KeyResult): number | null {
  const n = krNumbers(kr);
  if (!n.target && !n.current) return null;
  return n.target ? (n.current / n.target) * 100 : n.current > 0 ? 100 : 0;
}

/**
 * A Key Result's progress drawn as a bar, matching the objective rows above.
 * Only the bar's width is clamped, since it cannot draw past its track.
 */
function KrBar({ kr }: { kr: KeyResult }) {
  const raw = krPercent(kr);
  if (raw === null) return null;

  const n = krNumbers(kr);
  const pct = Math.round(raw);
  const c = STATUS_COLOR[statusFromProgress(clamp(raw))];
  const unit = n.unit ? ` ${n.unit}` : '';

  return (
    <div style={{ marginTop: 12 }}>
      <div style={S.objTop}>
        <span style={{ fontSize: 12.5, color: T.sub }}>
          {n.current} / {n.target}
          {unit}
        </span>
        <span style={{ fontWeight: 800, color: c }}>{pct}%</span>
      </div>
      <Tube value={clamp(raw)} color={c} height={10} />
    </div>
  );
}

// ---- radial gauge ---------------------------------------------------------
/** The flat ring: what shows until the 3D gauge is ready, or instead of it. */
function GaugeRing({ value, color }: { value: number; color: string }) {
  const r = 76;
  const cx = 90;
  const cy = 90;
  const sw = 16;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={180} height={180} viewBox="0 0 180 180" aria-hidden="true">
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
    </svg>
  );
}

/**
 * The objective's progress as a 3D ring, with the number laid over it as
 * plain text so it stays crisp at any scale.
 */
function Gauge({
  value,
  color,
  dark,
}: {
  value: number;
  color: string;
  dark: boolean;
}) {
  const pct = clamp(value);
  const st = statusFromProgress(pct);
  return (
    <div style={S.gauge}>
      <ProgressGauge3D
        value={pct}
        color={color}
        dark={dark}
        fallback={<GaugeRing value={pct} color={color} />}
      />
      <div style={S.gaugeLabel}>
        <div
          style={{
            ...S.gaugePct,
            textShadow: `0 2px 16px ${rgba(color, 0.3)}`,
          }}
        >
          {pct}%
        </div>
        <div style={{ ...S.gaugeStatus, color }}>{STATUS_LABEL[st]}</div>
      </div>
    </div>
  );
}

/**
 * A frosted panel over the 3D scene, lit along its top edge by `accent`.
 * Under a mouse it leans towards the pointer and catches a highlight.
 */
function GlassPanel({
  accent,
  index,
  style,
  children,
}: {
  accent?: string;
  /** Position on the page - staggers the entrance. */
  index: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const tilt = useTilt<HTMLDivElement>(2.5);
  return (
    <div
      {...tilt}
      // borderColor after `style`: a `border` shorthand in it would reset it.
      style={{ ...S.glass, ...style, borderColor: T.border, ...riseIn(index) }}
    >
      <Glare />
      {accent ? <Rim color={accent} /> : null}
      {children}
    </div>
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
  const rootRef = useRef<HTMLDivElement>(null);
  // The 3D gauge is lit to suit the theme, the same as the dashboard's donut.
  const tone = useSurfaceTone(rootRef);

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

  // The objective detail carries its own scale so 100% browser zoom shows the
  // whole page compactly. The app default is restored on close.
  usePageZoom(OKR_OBJECTIVE_ZOOM);

  const progress = data ? clamp(data.objective.progress ?? 0) : 0;
  const status = statusFromProgress(progress);
  const color = STATUS_COLOR[status];
  const accent = data?.team?.accent ?? '#f15a29';
  const delta = data ? progress - data.teamProgress : 0;

  return (
    <div ref={rootRef} style={{ ...S.root, background: T.bg, color: T.text }}>
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
            <GlassPanel
              accent={color}
              index={0}
              style={{ ...S.panel, display: 'grid', placeItems: 'center' }}
            >
              <Gauge value={progress} color={color} dark={tone.dark} />
            </GlassPanel>
            <GlassPanel
              accent={color}
              index={1}
              style={{ ...S.panel, flex: 1 }}
            >
              <div style={{ ...S.kicker, color: T.sub }}>STATUS</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color,
                  marginTop: 4,
                  textShadow: `0 0 18px ${rgba(color, 0.35)}`,
                }}
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
            </GlassPanel>
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
                  <Tube
                    value={pct}
                    color={c}
                    height={10}
                    trackStyle={{
                      outline: me ? `2px solid ${rgba(c, 0.6)}` : 'none',
                      outlineOffset: 1,
                    }}
                  />
                </div>
              );
            })}
          </Section>

          {/* Key Results always get a section: an objective with none stored is
              a gap worth showing, not something to hide - silently rendering
              nothing reads as a broken drill-down. */}
          <Section title="Key Results">
            {data.keyResults.length ? (
              <div style={S.cardsGrid}>
                {data.keyResults.map((kr, i) => {
                  const raw = krPercent(kr);
                  return (
                    <GlassPanel
                      key={kr.id}
                      index={2 + i}
                      accent={
                        raw === null
                          ? undefined
                          : STATUS_COLOR[statusFromProgress(clamp(raw))]
                      }
                      style={S.miniCard}
                    >
                      <div style={{ fontSize: 14 }}>{kr.description}</div>
                      <KrBar kr={kr} />
                    </GlassPanel>
                  );
                })}
              </div>
            ) : (
              <GlassPanel
                index={2}
                style={{ ...S.miniCard, color: T.sub, fontSize: 13.5 }}
              >
                No Key Results stored for this objective yet. Add them in the
                OKR editor, or import the team&apos;s Excel workbook.
              </GlassPanel>
            )}
          </Section>

          {data.initiatives.length ? (
            <Section title="Initiatives">
              <div style={S.cardsGrid}>
                {data.initiatives.map((it, i) => (
                  <GlassPanel
                    key={it.id}
                    index={2 + data.keyResults.length + i}
                    style={S.miniCard}
                  >
                    <div style={{ fontSize: 14 }}>{it.description}</div>
                    {it.owner ? (
                      <div
                        style={{ marginTop: 10, fontSize: 12, color: T.sub }}
                      >
                        Owner: {it.owner}
                      </div>
                    ) : null}
                  </GlassPanel>
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
      <Tube value={pct} color={color} height={10} />
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
    background: T.glass,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 8px 20px -10px rgba(0,0,0,0.6)',
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
  // Glass under every panel, the dashboard's look: a lit top edge and a soft
  // shadow below lift it off the page.
  glass: {
    background: `linear-gradient(160deg, ${T.glass} 0%, ${T.glassDeep} 100%)`,
    backdropFilter: 'blur(8px) saturate(120%)',
    WebkitBackdropFilter: 'blur(8px) saturate(120%)',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 6px rgba(0,0,0,0.1), 0 22px 44px -26px rgba(0,0,0,0.55)',
    position: 'relative',
    transition: 'transform .35s ease',
  },
  panel: {
    border: '1px solid',
    borderRadius: 16,
    padding: 22,
    minWidth: 220,
  },
  gauge: { position: 'relative', width: 180, height: 180 },
  gaugeLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  gaugePct: { fontSize: 40, fontWeight: 800, lineHeight: 1 },
  gaugeStatus: { fontSize: 13, fontWeight: 700, marginTop: 8 },
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
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 14,
  },
  miniCard: { border: '1px solid', borderRadius: 12, padding: 16 },
  editLink: {
    marginTop: 26,
    background: T.glass,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 24px -14px rgba(0,0,0,0.55)',
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
