import { generateNKeysBetween } from '@blocksuite/bridgeflow/std/gfx';
import { Text } from '@blocksuite/bridgeflow/store';
import * as Y from 'yjs';

/**
 * Shared canvas-building kit for BRIDGE Flow board templates.
 *
 * Every template builder ("Product Strategy", "Business Model Canvas", …) draws
 * real, editable edgeless elements straight onto a freshly-created surface via
 * `surface.addElement`. To keep the whole template family visually consistent —
 * same palette, same type scale, same card language as the OKR board — the low
 * level primitives live here instead of being re-invented per file.
 *
 * Usage (from `initDocFromProps`' `onStoreLoad` hook):
 *
 *   const kit = createCanvasKit(doc, surfaceId);
 *   if (!kit) return;
 *   const { shape, text, connector, frame, C } = kit;
 *   shape({ x: 0, y: 0, w: 1600, h: 140, fill: C.BLACK });
 *   ...
 *   frame('Product Strategy', -40, -40, 1680, 1000);
 */

// -- BRIDGE palette ---------------------------------------------------------
// Mirrors the OKR board plus the accent hues used by the home-screen template
// cards, so a board's colours match the tile the user clicked.
export const C = {
  BLACK: '#16191f',
  ORANGE: '#f15a29',
  WHITE: '#ffffff',
  INK: '#3d4451',
  MUTED: '#6b7280',
  CARD: '#ffffff',
  TINT: '#f4f5f7',
  LINE: '#d7dbe0',
  GREEN: '#2eb85c',
  AMBER: '#f5a623',
  RED: '#e5341f',
  BLUE: '#3884ff',
  PURPLE: '#865eff',
  PINK: '#ed4a8a',
  TEAL: '#00b8d4',
  INDIGO: '#5865f2',
} as const;

// Soft 12%-opacity tints keyed to the accent hues, for card wash backgrounds.
export const TINTS = {
  ORANGE: 'rgba(241, 90, 41, 0.12)',
  BLUE: 'rgba(56, 132, 255, 0.12)',
  PURPLE: 'rgba(134, 94, 255, 0.12)',
  GREEN: 'rgba(46, 184, 92, 0.12)',
  PINK: 'rgba(237, 74, 138, 0.12)',
  TEAL: 'rgba(0, 184, 212, 0.12)',
  AMBER: 'rgba(245, 166, 35, 0.12)',
  INDIGO: 'rgba(88, 101, 242, 0.12)',
} as const;

export const FONT = 'blocksuite:surface:Inter';
export const BOLD = '700';
export const SEMI = '600';
export const MED = '500';
export const REG = '400';

// Connector mode + endpoint enums, inlined so builders don't need to depend on
// the blocksuite model package directly. (ConnectorMode: 0=Straight,
// 1=Orthogonal/Elbowed, 2=Curve.)
export const LINE_MODE = { STRAIGHT: 0, ELBOW: 1, CURVE: 2 } as const;

type AnyProps = Record<string, unknown> & { type: string };

interface SurfaceLike {
  addElement: (props: AnyProps) => string;
}

export interface TemplateStore {
  getModelById: (id: string) => unknown;
  addBlock: (
    flavour: string,
    props: Record<string, unknown>,
    parent?: string
  ) => string;
}

/** Signature every template builder implements. */
export type TemplateBuilder = (doc: TemplateStore, surfaceId: string) => void;

export interface ShapeOpts {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  dashed?: boolean;
  radius?: number; // ratio 0..1
  shapeType?: 'rect' | 'ellipse' | 'diamond' | 'triangle';
  // optional centred label baked into the shape
  text?: string;
  color?: string;
  size?: number;
  weight?: string;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'center' | 'bottom';
}

export interface TextOpts {
  x: number;
  y: number;
  w: number;
  text: string;
  color?: string;
  size?: number;
  weight?: string;
  align?: 'left' | 'center' | 'right';
  h?: number;
}

export interface ConnectorOpts {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  strokeWidth?: number;
  dashed?: boolean;
  mode?: number; // LINE_MODE.*
  arrow?: boolean; // rear arrowhead, default true
  startArrow?: boolean; // front arrowhead, default false
  text?: string;
}

export interface CanvasKit {
  /** BRIDGE palette. */
  C: typeof C;
  TINTS: typeof TINTS;
  /** Serialise an [x,y,w,h] bound. */
  xywh: (x: number, y: number, w: number, h: number) => string;
  /** A filled/stroked rectangle (or ellipse/diamond/triangle) with optional centred label. */
  shape: (o: ShapeOpts) => string;
  /** Free-standing left-aligned text box. */
  text: (o: TextOpts) => string;
  /** An arrow/line between two absolute points. */
  connector: (o: ConnectorOpts) => string;
  /** Wrap everything drawn so far in a named frame so the board moves/exports as one unit. */
  frame: (title: string, x: number, y: number, w: number, h: number) => void;
}

/**
 * Build a drawing kit bound to a surface. Returns `null` if the surface id is
 * not a valid, addable surface model (so callers can bail safely).
 */
export function createCanvasKit(
  doc: TemplateStore,
  surfaceId: string
): CanvasKit | null {
  const surface = doc.getModelById(surfaceId) as SurfaceLike | null;
  if (!surface || typeof surface.addElement !== 'function') return null;

  // Lazily extend a pool of monotonically-increasing fractional z-index keys so
  // elements stack in insertion order no matter how large the board grows.
  let keys: string[] = generateNKeysBetween(null, null, 400);
  let ki = 0;
  const nextIndex = () => {
    if (ki >= keys.length) {
      const last = keys.length ? keys[keys.length - 1] : null;
      keys = keys.concat(generateNKeysBetween(last, null, 400));
    }
    return keys[ki++] ?? 'a0';
  };

  const xywh = (x: number, y: number, w: number, h: number) =>
    `[${x},${y},${w},${h}]`;

  const shape = (o: ShapeOpts) => {
    const props: AnyProps = {
      type: 'shape',
      shapeType: o.shapeType ?? 'rect',
      xywh: xywh(o.x, o.y, o.w, o.h),
      filled: o.fill !== undefined,
      fillColor: o.fill ?? 'transparent',
      strokeColor: o.stroke ?? 'transparent',
      strokeWidth: o.strokeWidth ?? (o.stroke ? 1 : 0),
      strokeStyle: o.stroke ? (o.dashed ? 'dash' : 'solid') : 'none',
      shapeStyle: 'General',
      roughness: 0,
      radius: o.radius ?? 0,
      index: nextIndex(),
    };
    if (o.text !== undefined) {
      props.text = new Y.Text(o.text);
      props.color = o.color ?? C.INK;
      props.fontSize = o.size ?? 14;
      props.fontFamily = FONT;
      props.fontWeight = o.weight ?? REG;
      props.textHorizontalAlign = o.align ?? 'center';
      props.textVerticalAlign = o.valign ?? 'center';
    }
    return surface.addElement(props);
  };

  const text = (o: TextOpts) =>
    surface.addElement({
      type: 'text',
      xywh: xywh(o.x, o.y, o.w, o.h ?? (o.size ?? 14) * 1.6),
      text: new Y.Text(o.text),
      color: o.color ?? C.INK,
      fontSize: o.size ?? 14,
      fontFamily: FONT,
      fontWeight: o.weight ?? REG,
      textAlign: o.align ?? 'left',
      hasMaxWidth: true,
      index: nextIndex(),
    });

  const connector = (o: ConnectorOpts) => {
    const minX = Math.min(o.x1, o.x2);
    const minY = Math.min(o.y1, o.y2);
    const w = Math.abs(o.x2 - o.x1) || 1;
    const h = Math.abs(o.y2 - o.y1) || 1;
    const props: AnyProps = {
      type: 'connector',
      mode: o.mode ?? LINE_MODE.STRAIGHT,
      stroke: o.stroke ?? C.INK,
      strokeWidth: o.strokeWidth ?? 2,
      strokeStyle: o.dashed ? 'dash' : 'solid',
      roughness: 0,
      // absolute-position endpoints (no element binding)
      source: { position: [o.x1, o.y1] },
      target: { position: [o.x2, o.y2] },
      frontEndpointStyle: o.startArrow ? 'Arrow' : 'None',
      rearEndpointStyle: o.arrow === false ? 'None' : 'Arrow',
      // give the element a sane bound; the connector watcher recomputes the path
      xywh: xywh(minX, minY, w, h),
      index: nextIndex(),
    };
    if (o.text !== undefined) {
      props.text = new Y.Text(o.text);
      props.labelStyle = {
        color: C.INK,
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: SEMI,
        fontStyle: 'normal',
        textAlign: 'center',
      };
    }
    return surface.addElement(props);
  };

  const frame = (title: string, x: number, y: number, w: number, h: number) => {
    try {
      doc.addBlock(
        'bridgeflow:frame',
        { xywh: xywh(x, y, w, h), title: new Text(title) },
        surfaceId
      );
    } catch {
      // frame is a nicety; ignore if the flavour isn't registered in this build
    }
  };

  return { C, TINTS, xywh, shape, text, connector, frame };
}
