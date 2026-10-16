/**
 * The OKR pages' glass-and-light look, in plain CSS: frosted panels that lean
 * towards the mouse, lit progress tubes, and the keyframes both pages share.
 * The dashboard and the objective drill-down use the same pieces, so the two
 * read as one product. The three.js side lives in okr-3d.tsx.
 */
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
} from 'react';

function rgba(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// The panel colour, part see-through, so the 3D scene glows behind the glass:
// dense where the text is, clearer further down where a card is empty.
export const GLASS =
  'color-mix(in srgb, var(--affine-background-overlay-panel-color, #14171c) 86%, transparent)';
export const GLASS_DEEP =
  'color-mix(in srgb, var(--affine-background-overlay-panel-color, #14171c) 52%, transparent)';

/** Light from above on a rounded surface: a highlight up top, shade beneath. */
export const GLOSS =
  'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.22) 100%)';

/** Keyframes for both OKR pages - inline styles cannot declare them. */
export const OKR_KEYFRAMES = `@keyframes okrpulse {
  0%   { box-shadow: 0 0 0 0 rgba(46,184,92,0.6); }
  70%  { box-shadow: 0 0 0 8px rgba(46,184,92,0); }
  100% { box-shadow: 0 0 0 0 rgba(46,184,92,0); }
}
@keyframes okrrise {
  from { opacity: 0; transform: perspective(1100px) rotateX(9deg) translateY(14px); }
  to   { opacity: 1; transform: none; }
}`;

/**
 * Rises a panel into place on first paint; `index` staggers a set of them.
 * `backwards`, not `both`: a held final frame would pin the transform and stop
 * the hover tilt.
 */
export function riseIn(index: number): CSSProperties {
  return {
    animationName: 'okrrise',
    animationDuration: '.7s',
    animationTimingFunction: 'cubic-bezier(.2,.8,.2,1)',
    animationFillMode: 'backwards',
    animationDelay: `${index * 45}ms`,
  };
}

/**
 * Lean a panel towards the mouse, up to `maxDeg`, and move its <Glare/> with
 * the pointer. Spread the result onto the panel. Touch and the wall screen
 * have no hover, so there the panel simply sits still. The panel is styled
 * straight from the handler: re-rendering it on every mouse move would be
 * pointless work for a purely visual effect.
 */
export function useTilt<E extends HTMLElement>(maxDeg = 3.5) {
  const ref = useRef<E>(null);
  const onPointerMove = useCallback(
    (e: ReactPointerEvent<E>) => {
      const el = ref.current;
      if (!el || e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(1100px) rotateX(${(0.5 - y) * maxDeg * 2}deg) rotateY(${(x - 0.5) * maxDeg * 2}deg)`;
      el.style.setProperty('--glare-x', `${x * 100}%`);
      el.style.setProperty('--glare-y', `${y * 100}%`);
      el.style.setProperty('--glare-o', '1');
    },
    [maxDeg]
  );
  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.setProperty('--glare-o', '0');
  }, []);
  return { ref, onPointerMove, onPointerLeave };
}

/** The highlight a tilted panel catches. The panel must be positioned. */
export function Glare() {
  return <div aria-hidden="true" style={S.glare} />;
}

/** A line of `color` light along a positioned panel's top edge. */
export function Rim({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        ...S.rim,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        boxShadow: `0 0 14px ${rgba(color, 0.8)}`,
      }}
    />
  );
}

/**
 * A progress bar drawn as a lit glass tube sunk into a groove. `color` may be
 * a CSS var (the "expected" bar uses the theme's secondary text colour), in
 * which case it simply goes without the glow.
 */
export function Tube({
  value,
  color,
  height = 9,
  trackStyle,
}: {
  value: number;
  color: string;
  height?: number;
  /** Extra styling for the groove, e.g. an outline on the current row. */
  trackStyle?: CSSProperties;
}) {
  const hex = color.startsWith('#');
  return (
    <div style={{ ...S.track, height, ...trackStyle }}>
      <div
        style={{
          ...S.fill,
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: `${GLOSS}, ${color}`,
          boxShadow: hex
            ? `0 0 10px ${rgba(color, 0.55)}, 0 0 2px ${rgba(color, 0.9)}`
            : 'none',
        }}
      />
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  glare: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    background:
      'radial-gradient(380px circle at var(--glare-x, 50%) var(--glare-y, 0%), rgba(255,255,255,0.08), transparent 45%)',
    opacity: 'var(--glare-o, 0)',
    transition: 'opacity .3s ease',
  },
  rim: {
    position: 'absolute',
    top: -1,
    left: 18,
    right: 18,
    height: 2,
    borderRadius: 2,
    pointerEvents: 'none',
  },
  track: {
    borderRadius: 5,
    overflow: 'hidden',
    background: 'var(--affine-hover-color, rgba(255,255,255,0.07))',
    boxShadow:
      'inset 0 1px 2px rgba(0,0,0,0.35), inset 0 -1px 0 rgba(255,255,255,0.05)',
  },
  fill: { height: '100%', borderRadius: 5, transition: 'width .4s ease' },
};
