/**
 * The OKR pages' 3D layer (three.js): a slow field of light behind the glass
 * panels, the dashboard's 3D status donut, and the objective page's 3D gauge.
 *
 * Everything here is decoration on top of pages that already work without
 * it. three.js is loaded on demand, after the page has painted, and every
 * failure - no WebGL, a lost GPU context, a chunk that will not download -
 * leaves the flat page exactly as it was.
 *
 * The board runs all day on a wall-mounted screen, so every scene is capped
 * at 30 frames a second, draws nothing while the Business Ops slide covers it
 * or the tab is hidden, and holds still for prefers-reduced-motion.
 */
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type * as THREE_NS from 'three';
import type { RoomEnvironment as RoomEnvironmentType } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { type Status, STATUS_COLOR } from './okr-data';

type Three = typeof THREE_NS;

interface ThreeKit {
  THREE: Three;
  RoomEnvironment: typeof RoomEnvironmentType;
}

let kitPromise: Promise<ThreeKit> | null = null;

/** three.js in its own chunk, so the board never waits on it. */
function loadThree(): Promise<ThreeKit> {
  if (!kitPromise) {
    const pending = Promise.all([
      import('three'),
      import('three/examples/jsm/environments/RoomEnvironment.js'),
    ]).then(([THREE, env]) => ({
      THREE,
      RoomEnvironment: env.RoomEnvironment,
    }));
    // A failed download is retried on the next mount, not cached forever.
    pending.catch(() => {
      kitPromise = null;
    });
    kitPromise = pending;
  }
  return kitPromise;
}

/**
 * The CSS zoom on <html>. The dashboard scales the whole page to fit the
 * screen (useFitPageZoom), so a canvas laid out at 1000 CSS px may cover only
 * 700 device px - sizing the drawing buffer by this keeps it one-to-one.
 */
function pageZoom(): number {
  const z = parseFloat(getComputedStyle(document.documentElement).zoom);
  return z > 0 ? z : 1;
}

// ---- scene plumbing -------------------------------------------------------
interface SceneContext<D> {
  THREE: Three;
  RoomEnvironment: typeof RoomEnvironmentType;
  renderer: THREE_NS.WebGLRenderer;
  data: D;
  /** prefers-reduced-motion: draw still frames only. */
  still: boolean;
}

interface Scene<D> {
  /** Draw one frame; `t` is seconds since the scene started, `dt` the step. */
  frame: (t: number, dt: number) => void;
  /** The canvas is now `w` x `h` CSS pixels. */
  resize: (w: number, h: number) => void;
  /** New data from React, applied in place without a rebuild. */
  update: (data: D) => void;
  dispose: () => void;
}

type SceneFactory<D> = (ctx: SceneContext<D>) => Scene<D>;

type SceneState = 'loading' | 'ready' | 'failed';

/** How often the loop re-checks the canvas size and the page zoom. */
const FIT_CHECK_MS = 500;

/**
 * Runs `factory`'s scene on the canvas behind `canvasRef`: loads three.js,
 * owns the renderer, the frame loop and teardown. A change of `buildKey`
 * rebuilds the scene from scratch, so the caller must key the <canvas> on it
 * too - a canvas whose context was released cannot host a new one.
 */
function useThreeScene<D>(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  factory: SceneFactory<D>,
  opts: {
    data: D;
    paused: boolean;
    fps: number;
    maxPixelRatio: number;
    buildKey: string;
  }
): SceneState {
  const { data, paused, fps, maxPixelRatio, buildKey } = opts;
  const [state, setState] = useState<SceneState>('loading');
  const dataRef = useRef(data);
  const pausedRef = useRef(paused);
  const sceneRef = useRef<Scene<D> | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    dataRef.current = data;
    sceneRef.current?.update(data);
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let stopped = false;
    let teardown = () => {};

    loadThree()
      .then(({ THREE, RoomEnvironment }) => {
        if (stopped) return;
        // Throws without WebGL - caught below, and the flat board stays.
        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        });
        renderer.setClearColor(0x000000, 0);
        // Neutral keeps the status colours true to the legend.
        renderer.toneMapping = THREE.NeutralToneMapping;
        const still = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        let scene: Scene<D>;
        try {
          scene = factory({
            THREE,
            RoomEnvironment,
            renderer,
            data: dataRef.current,
            still,
          });
        } catch (e) {
          // Hand the GPU context back before falling back to the flat board.
          renderer.dispose();
          renderer.forceContextLoss();
          throw e;
        }
        sceneRef.current = scene;

        let size = '';
        const fit = () => {
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          if (!w || !h) return;
          const ratio =
            Math.min(window.devicePixelRatio || 1, maxPixelRatio) * pageZoom();
          const next = `${w}x${h}@${ratio.toFixed(3)}`;
          if (next === size) return;
          size = next;
          renderer.setPixelRatio(ratio);
          renderer.setSize(w, h, false);
          scene.resize(w, h);
        };

        const begin = performance.now();
        const interval = 1000 / (still ? 2 : fps);
        let last = 0;
        let lastFit = 0;
        let raf = 0;
        const tick = (now: number) => {
          raf = requestAnimationFrame(tick);
          if (now - last < interval - 2) return;
          const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
          last = now;
          if (now - lastFit > FIT_CHECK_MS) {
            lastFit = now;
            fit();
          }
          if (pausedRef.current) return;
          scene.frame(still ? 0 : (now - begin) / 1000, still ? 0 : dt);
        };
        fit();
        scene.frame(0, 0);
        raf = requestAnimationFrame(tick);
        setState('ready');

        const onLost = (e: Event) => {
          e.preventDefault();
          cancelAnimationFrame(raf);
          setState('failed');
        };
        canvas.addEventListener('webglcontextlost', onLost);

        teardown = () => {
          cancelAnimationFrame(raf);
          canvas.removeEventListener('webglcontextlost', onLost);
          sceneRef.current = null;
          scene.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
        };
      })
      .catch(() => {
        if (!stopped) setState('failed');
      });

    return () => {
      stopped = true;
      teardown();
    };
  }, [canvasRef, factory, fps, maxPixelRatio, buildKey]);

  return state;
}

/** A soft radial sprite drawn in code - glows, dots and contact shadows. */
function radialTexture(
  THREE: Three,
  stops: [offset: number, color: string][],
  size = 128
): THREE_NS.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  if (g) {
    const half = size / 2;
    const grad = g.createRadialGradient(half, half, 0, half, half, half);
    for (const [offset, color] of stops) grad.addColorStop(offset, color);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Studio reflections for glossy surfaces, generated - nothing to download. */
function studioEnvironment(
  THREE: Three,
  RoomEnvironment: typeof RoomEnvironmentType,
  renderer: THREE_NS.WebGLRenderer
): THREE_NS.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  pmrem.dispose();
  return env;
}

/** Frees every geometry and material under `root`. */
function disposeTree(root: THREE_NS.Object3D) {
  root.traverse(obj => {
    const mesh = obj as Partial<THREE_NS.Mesh>;
    mesh.geometry?.dispose();
    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    for (const m of mats) m.dispose();
  });
}

// ---- the backdrop ---------------------------------------------------------
interface BackdropData {
  dark: boolean;
  /** The board's background colour, for depth fog. */
  bg: string;
}

/** Team accents from the roster - the board's own colours, none of them a status. */
const SCENE_PALETTE = [
  '#4c6ef5',
  '#14b8a6',
  '#f15a29',
  '#9b5de5',
  '#ec4899',
  '#f5a623',
];

// A field of light points rolling like a slow sea towards a far horizon.
const FIELD_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aColor;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float wave = sin(p.x * 0.16 + uTime * 0.55) * 0.9
      + sin(p.z * 0.21 + uTime * 0.42) * 0.7
      + sin((p.x + p.z) * 0.09 + uTime * 0.27) * 0.6;
    p.y += wave;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    float twinkle = 0.75 + 0.25 * sin(uTime * 1.2 + aSeed * 6.2831);
    gl_PointSize = uSize * uPixelRatio * (14.0 / dist) * twinkle;
    // Crests catch more light than troughs.
    vColor = aColor * (0.7 + 0.45 * (wave + 2.2) / 4.4);
    vAlpha = smoothstep(78.0, 20.0, dist);
  }
`;
const FIELD_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.05, d) * vAlpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

const createBackdrop: SceneFactory<BackdropData> = ({
  THREE,
  renderer,
  data,
  still,
}) => {
  const { dark } = data;
  const glowBlend = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(new THREE.Color(data.bg), 0.011);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 220);
  camera.position.set(0, 0, 18);

  const glow = radialTexture(THREE, [
    [0, 'rgba(255,255,255,1)'],
    [0.35, 'rgba(255,255,255,0.35)'],
    [1, 'rgba(255,255,255,0)'],
  ]);
  const dot = radialTexture(
    THREE,
    [
      [0, 'rgba(255,255,255,1)'],
      [0.4, 'rgba(255,255,255,0.55)'],
      [1, 'rgba(255,255,255,0)'],
    ],
    64
  );

  // 1. Pools of coloured light far back: what the glass cards take a tint from.
  const orbs = [
    { color: '#f15a29', x: -15, y: 8, z: -28, size: 28 },
    { color: '#4c6ef5', x: 17, y: 6, z: -32, size: 32 },
    { color: '#9b5de5', x: 3, y: -9, z: -26, size: 26 },
    { color: '#14b8a6', x: -19, y: -8, z: -32, size: 28 },
    { color: '#ec4899', x: 21, y: -11, z: -36, size: 24 },
  ].map((o, i) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glow,
        color: o.color,
        transparent: true,
        opacity: dark ? 0.4 : 0.2,
        depthWrite: false,
        blending: glowBlend,
      })
    );
    sprite.position.set(o.x, o.y, o.z);
    sprite.scale.setScalar(o.size);
    scene.add(sprite);
    return { sprite, x: o.x, y: o.y, phase: i * 1.7 };
  });

  // 2. The rolling field of points.
  const COLS = 150;
  const ROWS = 56;
  const positions = new Float32Array(COLS * ROWS * 3);
  const colors = new Float32Array(COLS * ROWS * 3);
  const seeds = new Float32Array(COLS * ROWS);
  const palette = SCENE_PALETTE.map(c => new THREE.Color(c));
  const tint = new THREE.Color();
  for (let r = 0, i = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++, i++) {
      const u = c / (COLS - 1);
      positions[i * 3] = (u - 0.5) * 92;
      positions[i * 3 + 2] = 6 - r * 1.15;
      // The colour sweeps across the palette from left to right.
      const f = u * (palette.length - 1);
      const k = Math.min(palette.length - 2, Math.floor(f));
      tint.copy(palette[k]).lerp(palette[k + 1], f - k);
      if (!dark) tint.multiplyScalar(0.8);
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
      seeds[i] = Math.random();
    }
  }
  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  fieldGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  fieldGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  const fieldMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: dark ? 9 : 7.5 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: dark ? 1 : 0.6 },
    },
    vertexShader: FIELD_VERT,
    fragmentShader: FIELD_FRAG,
    transparent: true,
    depthWrite: false,
    blending: glowBlend,
  });
  const field = new THREE.Points(fieldGeo, fieldMat);
  field.position.y = -7.5;
  scene.add(field);

  // 3. Dust on dark boards; on light ones it only reads as dirt.
  let stars: THREE_NS.Points | null = null;
  if (dark) {
    const STARS = 900;
    const pts = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS; i++) {
      const v = new THREE.Vector3()
        .randomDirection()
        .multiplyScalar(30 + Math.random() * 40);
      pts.set([v.x, v.y, v.z - 20], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    stars = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.18,
        map: dot,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(stars);
  }

  // Mouse parallax for desk screens; the wall screen just drifts.
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!still) window.addEventListener('pointermove', onPointer);

  return {
    frame(t, dt) {
      const ease = Math.min(1, dt * 2);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      camera.position.x = Math.sin(t * 0.05) * 1.6 + pointer.x * 1.2;
      camera.position.y = Math.cos(t * 0.037) * 0.6 - pointer.y * 0.6;
      camera.lookAt(0, 0, -8);

      fieldMat.uniforms.uTime.value = t;
      for (const o of orbs) {
        o.sprite.position.x = o.x + Math.sin(t * 0.06 + o.phase) * 3;
        o.sprite.position.y = o.y + Math.cos(t * 0.05 + o.phase) * 2;
      }
      if (stars) stars.rotation.y = t * 0.01;

      renderer.render(scene, camera);
    },
    resize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fieldMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    },
    update() {
      // Colours are baked in at build time; a theme change rebuilds the scene.
    },
    dispose() {
      window.removeEventListener('pointermove', onPointer);
      disposeTree(scene);
      glow.dispose();
      dot.dispose();
    },
  };
};

/**
 * The scene behind an OKR page. A fixed canvas at z-index -1 inside the page's
 * own stacking context: above the page background, below every panel, and out
 * of the flow so the dashboard's fit-to-screen measurement never sees it.
 */
export function BoardBackdrop3D({
  dark,
  bg,
  paused,
}: {
  dark: boolean;
  bg: string;
  paused: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const buildKey = `${dark ? 'dark' : 'light'}|${bg}`;
  const data = useMemo(() => ({ dark, bg }), [dark, bg]);
  const state = useThreeScene(ref, createBackdrop, {
    data,
    paused,
    fps: 30,
    // A soft, out-of-focus layer - full resolution would be wasted on it.
    maxPixelRatio: 1,
    buildKey,
  });
  if (state === 'failed') return null;
  return (
    <canvas
      key={buildKey}
      ref={ref}
      aria-hidden="true"
      style={{ ...S.backdrop, opacity: state === 'ready' ? 1 : 0 }}
    />
  );
}

// ---- the status donut -----------------------------------------------------
interface DonutData {
  counts: Record<Status, number>;
  dark: boolean;
}

const DONUT_ORDER: Status[] = ['on_track', 'at_risk', 'off_track'];
const RING_OUTER = 1;
const RING_INNER = 0.6;
const RING_DEPTH = 0.3;
const RING_GAP = 0.07; // radians between segments
const RING_TILT = -0.8; // leaned back, so the ring reads as a solid
const RING_SPIN = 0.22; // radians a second - one turn every ~30 s

function countsKey(counts: Record<Status, number>): string {
  return DONUT_ORDER.map(k => counts[k]).join('/');
}

const createDonut: SceneFactory<DonutData> = ({
  THREE,
  RoomEnvironment,
  renderer,
  data,
  still,
}) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 4.9);

  const env = studioEnvironment(THREE, RoomEnvironment, renderer);
  scene.environment = env;
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(2.5, 3.5, 5);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1);
  rim.position.set(-4, -1, -3);
  scene.add(key, rim);

  const tilt = new THREE.Group();
  tilt.rotation.x = RING_TILT;
  scene.add(tilt);
  const spin = new THREE.Group();
  tilt.add(spin);

  // A soft ring of shadow under the donut, so it sits on the card. It fades
  // out well inside the canvas - a shadow cut off by the canvas edge shows as
  // a grey square on a light card.
  const shadowTex = radialTexture(THREE, [
    [0, 'rgba(0,0,0,0)'],
    [0.5, 'rgba(0,0,0,0)'],
    [0.7, 'rgba(0,0,0,0.85)'],
    [0.82, 'rgba(0,0,0,0.3)'],
    [0.92, 'rgba(0,0,0,0)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 2.5),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: data.dark ? 0.7 : 0.25,
      depthWrite: false,
    })
  );
  shadow.position.z = -0.12;
  tilt.add(shadow);

  let segments: THREE_NS.Mesh[] = [];
  let shownKey = '';
  let growFrom = -1; // when the current segments started rising; -1 = next frame

  const segment = (a0: number, a1: number, color: string, nudge: number) => {
    const shape = new THREE.Shape();
    const full = a1 - a0 >= Math.PI * 2 - 1e-6;
    if (full) {
      // A whole ring is a disc with a hole - one contour folding back on
      // itself would triangulate badly.
      shape.absarc(0, 0, RING_OUTER, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, RING_INNER, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    } else {
      shape.absarc(0, 0, RING_OUTER, a0, a1, false);
      shape.absarc(0, 0, RING_INNER, a1, a0, true);
    }
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: RING_DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.035,
      bevelSegments: 4,
      curveSegments: Math.max(6, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 96)),
    });
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.3,
        metalness: 0.06,
        clearcoat: 1,
        clearcoatRoughness: 0.14,
      })
    );
    // Pushed out along its middle, so the gaps between segments read.
    const mid = (a0 + a1) / 2;
    mesh.position.set(Math.cos(mid) * nudge, Math.sin(mid) * nudge, 0);
    spin.add(mesh);
    segments.push(mesh);
  };

  const build = (counts: Record<Status, number>) => {
    for (const m of segments) {
      spin.remove(m);
      disposeTree(m);
    }
    segments = [];
    const total = DONUT_ORDER.reduce((s, k) => s + counts[k], 0);
    const parts = DONUT_ORDER.filter(k => counts[k] > 0);
    if (!total) {
      segment(0, Math.PI * 2, data.dark ? '#3a3f47' : '#d9dce1', 0);
    } else {
      const gap = parts.length > 1 ? RING_GAP : 0;
      // From 12 o'clock, clockwise - the same order as the flat donut.
      let a = Math.PI / 2;
      for (const k of parts) {
        const sweep = (counts[k] / total) * Math.PI * 2;
        // Never let the gap eat a thin segment whole.
        const g = Math.min(gap, sweep / 3);
        segment(a - sweep + g / 2, a - g / 2, STATUS_COLOR[k], g * 0.5);
        a -= sweep;
      }
    }
    shownKey = countsKey(counts);
    growFrom = -1;
  };
  build(data.counts);

  return {
    frame(t, dt) {
      if (growFrom < 0) growFrom = t;
      // New numbers rise out of the card instead of popping in.
      const g = still ? 1 : Math.min(1, (t - growFrom) / 0.9);
      const rise = 1 - Math.pow(1 - g, 3);
      for (const m of segments) m.scale.z = 0.08 + 0.92 * rise;
      if (!still) {
        spin.rotation.z -= dt * RING_SPIN;
        tilt.rotation.x = RING_TILT + Math.sin(t * 0.7) * 0.035;
      }
      renderer.render(scene, camera);
    },
    resize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    update(next) {
      if (countsKey(next.counts) !== shownKey) build(next.counts);
    },
    dispose() {
      disposeTree(scene);
      shadowTex.dispose();
      env.dispose();
    },
  };
};

/**
 * The status donut, in 3D. Same 140 px footprint as the flat one, which is
 * shown until the 3D one is ready and stays if it never is.
 */
export function StatusDonut3D({
  counts,
  dark,
  paused,
  fallback,
}: {
  counts: Record<Status, number>;
  dark: boolean;
  paused: boolean;
  fallback: ReactNode;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { on_track, at_risk, off_track } = counts;
  const data = useMemo(
    () => ({ counts: { on_track, at_risk, off_track }, dark }),
    [on_track, at_risk, off_track, dark]
  );
  const buildKey = dark ? 'dark' : 'light';
  const state = useThreeScene(ref, createDonut, {
    data,
    paused,
    fps: 30,
    maxPixelRatio: 2,
    buildKey,
  });
  const ready = state === 'ready';
  return (
    <div style={{ ...S.box, width: 140, height: 140 }}>
      <div style={{ ...S.layer, opacity: ready ? 0 : 1 }}>{fallback}</div>
      {state === 'failed' ? null : (
        <canvas
          key={buildKey}
          ref={ref}
          aria-hidden="true"
          style={{ ...S.layer, opacity: ready ? 1 : 0 }}
        />
      )}
    </div>
  );
}

// ---- the objective gauge --------------------------------------------------
interface GaugeData {
  /** Progress, 0..100. */
  value: number;
  color: string;
  dark: boolean;
}

const GAUGE_RADIUS = 1;
const GAUGE_TUBE = 0.1;
// Leaned back just enough to read as a solid ring, while the number in its
// middle stays square-on and easy to read.
const GAUGE_TILT = -0.3;
const GAUGE_FILL_S = 1.1; // how long the ring takes to fill to its value
const TWELVE_O_CLOCK = Math.PI / 2;

const createGauge: SceneFactory<GaugeData> = ({
  THREE,
  RoomEnvironment,
  renderer,
  data,
  still,
}) => {
  const { dark } = data;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 4.7);

  const env = studioEnvironment(THREE, RoomEnvironment, renderer);
  scene.environment = env;
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2.5, 3.5, 5);
  const rim = new THREE.DirectionalLight(0xffffff, 1);
  rim.position.set(-4, -2, -3);
  scene.add(key, rim);

  const tilt = new THREE.Group();
  tilt.rotation.x = GAUGE_TILT;
  scene.add(tilt);

  // The groove the progress runs in.
  const track = new THREE.Mesh(
    new THREE.TorusGeometry(GAUGE_RADIUS, GAUGE_TUBE * 0.7, 16, 160),
    new THREE.MeshPhysicalMaterial({
      color: dark ? '#2b3038' : '#dfe2e7',
      roughness: 0.55,
      metalness: 0.05,
      clearcoat: 0.4,
    })
  );
  track.position.z = -0.04;
  tilt.add(track);

  // A soft ring of shadow behind, so the gauge stands off the panel. Like the
  // donut's, it fades out well inside the canvas.
  const shadowTex = radialTexture(THREE, [
    [0, 'rgba(0,0,0,0)'],
    [0.55, 'rgba(0,0,0,0)'],
    [0.74, 'rgba(0,0,0,0.8)'],
    [0.84, 'rgba(0,0,0,0.25)'],
    [0.92, 'rgba(0,0,0,0)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.6),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: dark ? 0.55 : 0.2,
      depthWrite: false,
    })
  );
  shadow.position.set(0, -0.1, -0.3);
  tilt.add(shadow);

  // The progress: a lit tube from 12 o'clock, clockwise, with a round tail
  // where it starts and a glowing bead where it has got to.
  const arcMat = new THREE.MeshPhysicalMaterial({
    color: data.color,
    emissive: data.color,
    emissiveIntensity: dark ? 0.15 : 0.05,
    roughness: 0.22,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
  const arc = new THREE.Mesh(new THREE.BufferGeometry(), arcMat);
  const tail = new THREE.Mesh(
    new THREE.SphereGeometry(GAUGE_TUBE, 24, 16),
    arcMat
  );
  tail.position.set(0, GAUGE_RADIUS, 0);
  const beadMat = new THREE.MeshPhysicalMaterial({
    color: data.color,
    emissive: data.color,
    emissiveIntensity: dark ? 0.6 : 0.3,
    roughness: 0.15,
    clearcoat: 1,
  });
  const bead = new THREE.Mesh(
    new THREE.SphereGeometry(GAUGE_TUBE * 1.45, 32, 20),
    beadMat
  );
  const glowTex = radialTexture(
    THREE,
    [
      [0, 'rgba(255,255,255,1)'],
      [0.3, 'rgba(255,255,255,0.4)'],
      [1, 'rgba(255,255,255,0)'],
    ],
    64
  );
  const glowOpacity = dark ? 0.9 : 0.5;
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: data.color,
    transparent: true,
    opacity: glowOpacity,
    depthWrite: false,
    blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.setScalar(0.8);
  tilt.add(arc, tail, bead, glow);

  const fraction = (value: number) => Math.max(0, Math.min(1, value / 100));
  let shown = 0;
  let from = 0;
  let to = fraction(data.value);
  let fillFrom = -1; // when the current fill started; -1 = next frame
  let filling = true;

  const draw = (f: number) => {
    shown = f;
    const visible = f > 0.002;
    arc.visible = tail.visible = bead.visible = glow.visible = visible;
    if (!visible) return;
    const sweep = f * Math.PI * 2;
    arc.geometry.dispose();
    arc.geometry = new THREE.TorusGeometry(
      GAUGE_RADIUS,
      GAUGE_TUBE,
      20,
      Math.max(8, Math.ceil(180 * f)),
      sweep
    );
    // A torus arc runs anticlockwise from 3 o'clock. Turned to end at 12, it
    // reads as running clockwise from 12 - the way the flat gauge fills.
    const tip = TWELVE_O_CLOCK - sweep;
    arc.rotation.z = tip;
    bead.position.set(
      Math.cos(tip) * GAUGE_RADIUS,
      Math.sin(tip) * GAUGE_RADIUS,
      0
    );
    glow.position.set(bead.position.x, bead.position.y, 0.06);
  };

  return {
    frame(t) {
      if (filling) {
        if (fillFrom < 0) fillFrom = t;
        const g = still ? 1 : Math.min(1, (t - fillFrom) / GAUGE_FILL_S);
        draw(from + (to - from) * (1 - Math.pow(1 - g, 3)));
        if (g >= 1) filling = false;
      }
      if (!still) {
        tilt.rotation.x = GAUGE_TILT + Math.sin(t * 0.6) * 0.04;
        tilt.rotation.y = Math.sin(t * 0.45) * 0.08;
        glowMat.opacity = glowOpacity * (0.8 + 0.2 * Math.sin(t * 2.2));
      }
      renderer.render(scene, camera);
    },
    resize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    update(next) {
      arcMat.color.set(next.color);
      arcMat.emissive.set(next.color);
      beadMat.color.set(next.color);
      beadMat.emissive.set(next.color);
      glowMat.color.set(next.color);
      const target = fraction(next.value);
      if (target !== to) {
        from = shown;
        to = target;
        fillFrom = -1;
        filling = true;
      }
    },
    dispose() {
      disposeTree(scene);
      shadowTex.dispose();
      glowTex.dispose();
      env.dispose();
    },
  };
};

/**
 * An objective's progress as a lit 3D ring - same footprint as the flat
 * gauge, which shows until this one is ready and stays if it never is. The
 * number in the middle is the caller's to lay over the top as plain text, so
 * it stays crisp.
 */
export function ProgressGauge3D({
  value,
  color,
  dark,
  size = 180,
  fallback,
}: {
  value: number;
  color: string;
  dark: boolean;
  size?: number;
  fallback: ReactNode;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const data = useMemo(() => ({ value, color, dark }), [value, color, dark]);
  const buildKey = dark ? 'dark' : 'light';
  const state = useThreeScene(ref, createGauge, {
    data,
    paused: false,
    fps: 30,
    maxPixelRatio: 2,
    buildKey,
  });
  const ready = state === 'ready';
  return (
    <div style={{ ...S.box, width: size, height: size }}>
      <div style={{ ...S.layer, opacity: ready ? 0 : 1 }}>{fallback}</div>
      {state === 'failed' ? null : (
        <canvas
          key={buildKey}
          ref={ref}
          aria-hidden="true"
          style={{ ...S.layer, opacity: ready ? 1 : 0 }}
        />
      )}
    </div>
  );
}

// ---- theme ----------------------------------------------------------------
/** How often the board's surface colour is re-read, to follow theme changes. */
const TONE_CHECK_MS = 3_000;

/**
 * Whether the board is on a dark or light surface, and its exact colour. The
 * scenes are lit differently for each - glow adds light on a dark board but
 * would wash a light one out.
 */
export function useSurfaceTone(ref: RefObject<HTMLElement | null>): {
  dark: boolean;
  bg: string;
} {
  const [tone, setTone] = useState({ dark: true, bg: 'rgb(11, 13, 16)' });
  useEffect(() => {
    const read = () => {
      const el = ref.current;
      if (!el) return;
      const bg = getComputedStyle(el).backgroundColor;
      const rgb = bg.match(/[\d.]+/g)?.map(Number);
      if (!rgb || rgb.length < 3) return;
      const dark =
        (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255 < 0.5;
      setTone(prev =>
        prev.dark === dark && prev.bg === bg ? prev : { dark, bg }
      );
    };
    read();
    const timer = setInterval(read, TONE_CHECK_MS);
    return () => clearInterval(timer);
  }, [ref]);
  return tone;
}

const S: Record<string, CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    pointerEvents: 'none',
    transition: 'opacity 1.2s ease',
  },
  box: { position: 'relative', flexShrink: 0 },
  layer: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    transition: 'opacity .6s ease',
  },
};
