import { Text } from '@blocksuite/bridgeflow/store';
import { generateNKeysBetween } from '@blocksuite/bridgeflow/std/gfx';
import * as Y from 'yjs';

/**
 * Builds the "OKR Quarterly Plan" board onto a freshly-created edgeless surface.
 *
 * It is designed to run from `initDocFromProps`' `onStoreLoad` hook, where we
 * only have the BlockSuite `Store` and the id of the surface block. We add the
 * elements straight to the surface model (`addElement`) so the board persists
 * with the document and renders as soon as the edgeless editor mounts.
 *
 * The layout mirrors the BRIDGE OKR template: a black header bar, three
 * objective columns (objective / key results / initiatives) and a footer with
 * the monthly review table, status legend and "Our focus" card. Every text box
 * is a real, editable canvas element so users can drop in their own content.
 */

// -- BRIDGE palette --------------------------------------------------------
const BLACK = '#16191f';
const ORANGE = '#f15a29';
const WHITE = '#ffffff';
const INK = '#3d4451';
const MUTED = '#6b7280';
const CARD = '#ffffff';
const TINT = '#f4f5f7';
const LINE = '#d7dbe0';
const GREEN = '#2eb85c';
const AMBER = '#f5a623';
const RED = '#e5341f';

const FONT = 'blocksuite:surface:Inter';
const BOLD = '700';
const SEMI = '600';
const REG = '400';

type AnyProps = Record<string, unknown> & { type: string };
interface SurfaceLike {
  addElement: (props: AnyProps) => string;
}

interface StoreLike {
  getModelById: (id: string) => unknown;
  addBlock: (
    flavour: string,
    props: Record<string, unknown>,
    parent?: string
  ) => string;
}

export function buildOkrBoard(doc: StoreLike, surfaceId: string) {
  const surface = doc.getModelById(surfaceId) as SurfaceLike | null;
  if (!surface || typeof surface.addElement !== 'function') return;

  // Pre-generate enough monotonically increasing z-index keys so elements
  // stack in insertion order (later boxes paint on top of their backgrounds).
  const keys = generateNKeysBetween(null, null, 320);
  let ki = 0;
  const nextIndex = () => keys[ki++] ?? 'a0';

  const xywh = (x: number, y: number, w: number, h: number) =>
    `[${x},${y},${w},${h}]`;

  interface ShapeOpts {
    x: number;
    y: number;
    w: number;
    h: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    radius?: number; // ratio 0..1
    shapeType?: 'rect' | 'ellipse';
    text?: string;
    color?: string;
    size?: number;
    weight?: string;
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'center' | 'bottom';
  }

  const shape = (o: ShapeOpts) => {
    const props: AnyProps = {
      type: 'shape',
      shapeType: o.shapeType ?? 'rect',
      xywh: xywh(o.x, o.y, o.w, o.h),
      filled: o.fill !== undefined,
      fillColor: o.fill ?? 'transparent',
      strokeColor: o.stroke ?? 'transparent',
      strokeWidth: o.strokeWidth ?? (o.stroke ? 1 : 0),
      strokeStyle: o.stroke ? 'solid' : 'none',
      shapeStyle: 'General',
      roughness: 0,
      radius: o.radius ?? 0,
      index: nextIndex(),
    };
    if (o.text !== undefined) {
      props.text = new Y.Text(o.text);
      props.color = o.color ?? INK;
      props.fontSize = o.size ?? 14;
      props.fontFamily = FONT;
      props.fontWeight = o.weight ?? REG;
      props.textHorizontalAlign = o.align ?? 'center';
      props.textVerticalAlign = o.valign ?? 'center';
    }
    return surface.addElement(props);
  };

  interface TextOpts {
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

  const text = (o: TextOpts) =>
    surface.addElement({
      type: 'text',
      xywh: xywh(o.x, o.y, o.w, o.h ?? (o.size ?? 14) * 1.6),
      text: new Y.Text(o.text),
      color: o.color ?? INK,
      fontSize: o.size ?? 14,
      fontFamily: FONT,
      fontWeight: o.weight ?? REG,
      textAlign: o.align ?? 'left',
      hasMaxWidth: true,
      index: nextIndex(),
    });

  // ===================== HEADER ==========================================
  shape({ x: 0, y: 0, w: 1600, h: 140, fill: BLACK });
  text({
    x: 40,
    y: 26,
    w: 760,
    text: 'OKR QUARTERLY PLAN',
    color: WHITE,
    size: 46,
    weight: BOLD,
  });
  text({
    x: 42,
    y: 92,
    w: 520,
    text: 'FOCUS  •  ALIGNMENT  •  RESULTS',
    color: WHITE,
    size: 18,
    weight: SEMI,
  });

  // header fields
  const field = (fx: number, label: string) => {
    text({ x: fx, y: 52, w: 200, text: label, color: WHITE, size: 14, weight: SEMI });
    shape({ x: fx, y: 92, w: 200, h: 2, fill: ORANGE });
  };
  field(820, 'AREA / DISCIPLINE:');
  field(1060, 'OWNER:');
  field(1300, 'QUARTER:  Q____  20____');

  // BRIDGE wordmark
  text({
    x: 1380,
    y: 38,
    w: 200,
    text: 'BRIDGE',
    color: WHITE,
    size: 38,
    weight: BOLD,
    align: 'right',
  });
  shape({ x: 1542, y: 36, w: 30, h: 9, fill: ORANGE });

  // ===================== OBJECTIVE COLUMNS ===============================
  const colW = 486;
  const colX = [40, 557, 1074];
  const top = 175;
  const colH = 500;

  const objectives = [
    {
      goal: 'Development & Launch of Industry 5.0 Curricula',
      krs: [
        ['Development of new I5.0 training modules', '2 Modules'],
        ['Development of I5.0 use cases for training', '4 Use Cases'],
        ['Dry Run of newly developed modules', '30th Sep'],
      ],
      inits: [
        ['I5.0 Foundation Training Content Development', 'Sohel, Awaiz'],
        ['3D Printing Basic Training Content Development', 'Sohel, Haroon'],
        ['I5.0 Technology Evaluation & Procurement', 'Sohel, Haroon, Awaiz'],
      ],
    },
    {
      goal: 'Development & Deployment of Digital Workflows for ADASI (Vortex Project)',
      krs: [
        ['Develop Platform for Digital Workflows', '30 Days'],
        ['Demo and requirement validation', '20 Stations'],
        ['Deploy, support & Continuous Improvement', '60 Days'],
      ],
      inits: [
        ['Requirement Gathering & Architecture Dev', 'Sohel, Awaiz'],
        ['Coding, Platform Development & Testing', 'Awaiz, Sohel'],
        ['H/W Procurement, Deployment & Support', 'Sohel, Awaiz'],
      ],
    },
    {
      goal: 'Development of Technology Inventory, Issue Tracker & Maintenance Plan',
      krs: [
        ['Development of Technology Inventory', '15th Aug'],
        ['Development of Technology Issue Tracker', '30th Aug'],
        ['Development of Technology Maintenance Plan', '15th Sep'],
      ],
      inits: [
        ['Technology Inventory & Assets List Creation', 'Antony, Babu, Haroon'],
        ['Technology Issue Tracker Creation', 'Antony, Babu, Haroon'],
        ['Technology Maintenance Plan', 'Antony, Babu, Haroon'],
      ],
    },
  ];

  objectives.forEach((obj, i) => {
    const x = colX[i];

    // card background
    shape({
      x,
      y: top,
      w: colW,
      h: colH,
      fill: CARD,
      stroke: LINE,
      strokeWidth: 1.5,
      radius: 0.02,
    });

    // header: black number chip + orange title bar
    shape({
      x,
      y: top,
      w: 60,
      h: 52,
      fill: BLACK,
      text: `0${i + 1}`,
      color: WHITE,
      size: 26,
      weight: BOLD,
    });
    shape({
      x: x + 60,
      y: top,
      w: colW - 60,
      h: 52,
      fill: ORANGE,
      text: `   OBJECTIVE ${i + 1}`,
      color: WHITE,
      size: 22,
      weight: BOLD,
      align: 'left',
    });

    // objective statement
    text({
      x: x + 20,
      y: top + 66,
      w: colW - 40,
      text: 'What do we want to achieve?',
      color: INK,
      size: 15,
      weight: BOLD,
    });
    text({
      x: x + 20,
      y: top + 92,
      w: colW - 40,
      text: obj.goal,
      color: MUTED,
      size: 13,
    });
    shape({ x: x + 20, y: top + 138, w: colW - 40, h: 1.5, fill: LINE });

    // KEY RESULTS
    text({
      x: x + 20,
      y: top + 150,
      w: 320,
      text: 'KEY RESULTS (max. 3)',
      color: ORANGE,
      size: 15,
      weight: BOLD,
    });
    text({
      x: x + colW - 130,
      y: top + 152,
      w: 110,
      text: 'TARGET',
      color: INK,
      size: 12,
      weight: SEMI,
      align: 'right',
    });

    obj.krs.forEach(([desc, target], r) => {
      const ry = top + 182 + r * 40;
      shape({
        x: x + 20,
        y: ry,
        w: 48,
        h: 26,
        fill: BLACK,
        radius: 0.12,
        text: `KR${r + 1}`,
        color: WHITE,
        size: 12,
        weight: BOLD,
      });
      text({
        x: x + 78,
        y: ry + 4,
        w: colW - 220,
        text: desc,
        color: INK,
        size: 12.5,
      });
      text({
        x: x + colW - 130,
        y: ry + 4,
        w: 110,
        text: target,
        color: INK,
        size: 12.5,
        weight: SEMI,
        align: 'right',
      });
      shape({ x: x + 78, y: ry + 30, w: colW - 100, h: 1, fill: TINT });
    });

    // INITIATIVES
    text({
      x: x + 20,
      y: top + 320,
      w: 320,
      text: 'INITIATIVES (max. 3)',
      color: ORANGE,
      size: 15,
      weight: BOLD,
    });
    text({
      x: x + colW - 150,
      y: top + 322,
      w: 130,
      text: 'OWNER',
      color: INK,
      size: 12,
      weight: SEMI,
      align: 'right',
    });

    obj.inits.forEach(([desc, owner], r) => {
      const ry = top + 352 + r * 42;
      shape({
        x: x + 20,
        y: ry,
        w: 34,
        h: 26,
        fill: TINT,
        radius: 0.12,
        text: `${r + 1}`,
        color: INK,
        size: 13,
        weight: BOLD,
      });
      text({
        x: x + 64,
        y: ry + 4,
        w: colW - 220,
        text: desc,
        color: INK,
        size: 12,
      });
      text({
        x: x + colW - 160,
        y: ry + 4,
        w: 140,
        text: owner,
        color: MUTED,
        size: 11.5,
        align: 'right',
      });
      shape({ x: x + 64, y: ry + 30, w: colW - 86, h: 1, fill: TINT });
    });
  });

  // ===================== FOOTER =========================================
  const footY = 700;

  // ---- Monthly review table ----
  text({
    x: 40,
    y: footY,
    w: 400,
    text: '📅  MONTHLY REVIEW',
    color: INK,
    size: 20,
    weight: BOLD,
  });

  const tableX = 40;
  const tableY = footY + 40;
  const cols = [
    { label: 'OBJECTIVE', w: 170 },
    { label: 'MONTH 1', w: 95 },
    { label: 'MONTH 2', w: 95 },
    { label: 'MONTH 3', w: 95 },
    { label: 'COMMENTS / RISKS / SUPPORT NEEDED', w: 455 },
  ];
  const tableW = cols.reduce((s, c) => s + c.w, 0);

  // header row
  let cx = tableX;
  cols.forEach(c => {
    shape({
      x: cx,
      y: tableY,
      w: c.w,
      h: 32,
      fill: BLACK,
      stroke: BLACK,
      text: c.label,
      color: WHITE,
      size: 11,
      weight: BOLD,
    });
    cx += c.w;
  });

  // body rows
  for (let r = 0; r < 3; r++) {
    const ry = tableY + 32 + r * 40;
    let bx = tableX;
    cols.forEach((c, ci) => {
      shape({
        x: bx,
        y: ry,
        w: c.w,
        h: 40,
        fill: ci === 0 ? TINT : WHITE,
        stroke: LINE,
        strokeWidth: 1,
        text: ci === 0 ? `OBJECTIVE ${r + 1}` : undefined,
        color: INK,
        size: 12,
        weight: SEMI,
      });
      // month status dot placeholders
      if (ci >= 1 && ci <= 3) {
        shape({
          x: bx + c.w / 2 - 9,
          y: ry + 11,
          w: 18,
          h: 18,
          fill: '#e6e8eb',
          shapeType: 'ellipse',
        });
      }
      bx += c.w;
    });
  }

  // ---- Status legend ----
  const legendX = tableX + tableW + 40;
  text({
    x: legendX,
    y: footY,
    w: 260,
    text: 'STATUS LEGEND',
    color: INK,
    size: 16,
    weight: BOLD,
  });
  shape({ x: legendX, y: footY + 26, w: 64, h: 3, fill: ORANGE });

  const legend = [
    [GREEN, 'ON TRACK', 'Progressing as planned'],
    [AMBER, 'AT RISK', 'Some risks or obstacles'],
    [RED, 'OFF TRACK', 'Corrective action required'],
  ];
  legend.forEach(([clr, title, sub], r) => {
    const ly = footY + 44 + r * 46;
    shape({ x: legendX, y: ly, w: 22, h: 22, fill: clr, shapeType: 'ellipse' });
    text({ x: legendX + 34, y: ly - 2, w: 230, text: title, color: INK, size: 14, weight: BOLD });
    text({ x: legendX + 34, y: ly + 17, w: 230, text: sub, color: MUTED, size: 11 });
  });

  // ---- Our focus card ----
  const focusX = legendX + 320;
  shape({ x: focusX, y: footY + 32, w: 240, h: 150, fill: BLACK, radius: 0.06 });
  text({
    x: focusX,
    y: footY + 58,
    w: 240,
    text: 'OUR FOCUS',
    color: ORANGE,
    size: 16,
    weight: BOLD,
    align: 'center',
  });
  text({
    x: focusX + 24,
    y: footY + 92,
    w: 192,
    text: 'Less is more. Focus on the results that drive the biggest impact.',
    color: WHITE,
    size: 13,
    align: 'center',
  });

  // ---- wrap everything in a named frame so it moves/exports as one unit ----
  try {
    doc.addBlock(
      'bridgeflow:frame',
      {
        xywh: xywh(-40, -40, 1680, footY + 250),
        title: new Text('OKR Quarterly Plan'),
      },
      surfaceId
    );
  } catch {
    // frame is a nicety; ignore if the flavour isn't registered in this build
  }
}
