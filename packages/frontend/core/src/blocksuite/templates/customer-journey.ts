import {
  BOLD,
  createCanvasKit,
  LINE_MODE,
  MED,
  SEMI,
  type TemplateBuilder,
} from './kit';

/**
 * Builds the "Customer Journey Map" board onto a freshly-created edgeless
 * surface. It mirrors the BRIDGE OKR board's visual language (black header bar,
 * white cards with thin line borders, accent section bars, small chips) but
 * arranges the content as a journey matrix: a left row-label column plus six
 * stage columns (Awareness → Advocacy) crossed with rows for actions,
 * touchpoints, an emotion curve, pain points and opportunities.
 *
 * All content is generic, editable placeholder text - a starting point users
 * overwrite with their own persona, channels and insights.
 */
export const buildCustomerJourneyBoard: TemplateBuilder = (doc, surfaceId) => {
  const kit = createCanvasKit(doc, surfaceId);
  if (!kit) return;
  const { C, TINTS, shape, text, connector, frame } = kit;

  const ACCENT = C.TEAL;
  const ACCENT_TINT = TINTS.TEAL;

  // ===================== HEADER ==========================================
  shape({ x: 0, y: 0, w: 1600, h: 140, fill: C.BLACK });
  text({
    x: 40,
    y: 28,
    w: 900,
    text: 'CUSTOMER JOURNEY MAP',
    color: C.WHITE,
    size: 44,
    weight: BOLD,
  });
  shape({ x: 44, y: 82, w: 130, h: 4, fill: ACCENT });
  text({
    x: 42,
    y: 96,
    w: 640,
    text: 'STAGES  •  TOUCHPOINTS  •  MOMENTS',
    color: C.WHITE,
    size: 16,
    weight: SEMI,
  });

  // header fields (right side)
  const field = (fx: number, label: string) => {
    text({
      x: fx,
      y: 52,
      w: 240,
      text: label,
      color: C.WHITE,
      size: 14,
      weight: SEMI,
    });
    shape({ x: fx, y: 92, w: 240, h: 2, fill: ACCENT });
  };
  field(1080, 'PERSONA:  __');
  field(1320, 'SCENARIO:  __');

  // ===================== MATRIX GEOMETRY =================================
  const labelX = 40; // left row-label band
  const labelW = 300; // aligns with the persona card
  const stagesX = 360; // first stage column starts here
  const colStep = 200; // centre-to-centre column stride
  const cellW = 194; // cell width (6px gutter between columns)
  const cellX = (i: number) => stagesX + i * colStep;

  const stages = [
    'AWARENESS',
    'CONSIDERATION',
    'PURCHASE',
    'ONBOARDING',
    'RETENTION',
    'ADVOCACY',
  ];

  // ---- Persona card (top-left) ----
  const personaY = 175;
  const personaH = 120;
  shape({
    x: labelX,
    y: personaY,
    w: labelW,
    h: personaH,
    fill: ACCENT_TINT,
    stroke: C.LINE,
    strokeWidth: 1.5,
    radius: 0.04,
  });
  // round avatar
  shape({
    x: labelX + 18,
    y: personaY + 30,
    w: 60,
    h: 60,
    fill: ACCENT,
    shapeType: 'ellipse',
    text: 'A',
    color: C.WHITE,
    size: 24,
    weight: BOLD,
  });
  text({
    x: labelX + 92,
    y: personaY + 18,
    w: labelW - 108,
    text: 'PERSONA',
    color: ACCENT,
    size: 12,
    weight: BOLD,
  });
  text({
    x: labelX + 92,
    y: personaY + 36,
    w: labelW - 108,
    text: 'Alex - Ops Manager',
    color: C.INK,
    size: 15,
    weight: BOLD,
  });
  text({
    x: labelX + 92,
    y: personaY + 62,
    w: labelW - 108,
    text: 'Goal: find a tool the team adopts fast',
    color: C.MUTED,
    size: 11.5,
  });

  // ---- Stage header row ----
  const stageHdrY = 175;
  const stageHdrH = 46;
  stages.forEach((s, i) => {
    shape({
      x: cellX(i),
      y: stageHdrY,
      w: cellW,
      h: stageHdrH,
      fill: ACCENT,
      text: s,
      color: C.WHITE,
      size: 12,
      weight: BOLD,
      align: 'center',
    });
  });
  // a small number chip band to echo the OKR section language
  const chipY = stageHdrY + stageHdrH + 6;
  stages.forEach((_, i) => {
    shape({
      x: cellX(i),
      y: chipY,
      w: cellW,
      h: 20,
      fill: ACCENT_TINT,
      text: `STAGE 0${i + 1}`,
      color: ACCENT,
      size: 11,
      weight: SEMI,
      align: 'center',
    });
  });

  // ---- Row helper: draws the left label cell (number chip + accent bar) ----
  const rowLabel = (num: string, label: string, y: number, h: number) => {
    shape({
      x: labelX,
      y,
      w: 52,
      h: 46,
      fill: C.BLACK,
      text: num,
      color: C.WHITE,
      size: 18,
      weight: BOLD,
    });
    shape({
      x: labelX + 52,
      y,
      w: labelW - 52,
      h: 46,
      fill: ACCENT,
      text: `  ${label}`,
      color: C.WHITE,
      size: 15,
      weight: BOLD,
      align: 'left',
    });
    // faint hint under the label bar, filling the rest of the row band
    if (h > 46) {
      shape({
        x: labelX,
        y: y + 46,
        w: labelW,
        h: h - 46,
        fill: C.TINT,
        stroke: C.LINE,
        strokeWidth: 1,
      });
    }
  };

  // A plain white grid cell.
  const gridCell = (i: number, y: number, h: number, fill: string) =>
    shape({
      x: cellX(i),
      y,
      w: cellW,
      h,
      fill,
      stroke: C.LINE,
      strokeWidth: 1,
    });

  // Small teal channel pill with centred label.
  const pill = (x: number, y: number, w: number, label: string) =>
    shape({
      x,
      y,
      w,
      h: 24,
      fill: ACCENT_TINT,
      radius: 0.5,
      text: label,
      color: ACCENT,
      size: 11,
      weight: SEMI,
      align: 'center',
    });

  // ===================== ROW 1 - DOING / ACTIONS =========================
  const r1Y = 305;
  const r1H = 90;
  rowLabel('01', 'DOING / ACTIONS', r1Y, r1H);
  const actions = [
    'Sees an ad / referral',
    'Compares options',
    'Signs up / buys',
    'Sets up workspace',
    'Uses it weekly',
    'Refers a colleague',
  ];
  actions.forEach((a, i) => {
    gridCell(i, r1Y, r1H, C.CARD);
    text({
      x: cellX(i) + 14,
      y: r1Y + 16,
      w: cellW - 28,
      text: a,
      color: C.INK,
      size: 11,
      h: r1H - 28,
    });
  });

  // ===================== ROW 2 - TOUCHPOINTS =============================
  const r2Y = r1Y + r1H; // 395
  const r2H = 80;
  rowLabel('02', 'TOUCHPOINTS', r2Y, r2H);
  const touchpoints: string[][] = [
    ['Web', 'Social'],
    ['Web', 'Email'],
    ['App', 'Sales'],
    ['App', 'Docs'],
    ['App', 'Email'],
    ['Social', 'Referral'],
  ];
  touchpoints.forEach((chips, i) => {
    gridCell(i, r2Y, r2H, C.CARD);
    // lay pills in a row, wrapping to a second line if needed
    const px = cellX(i) + 12;
    let cx = px;
    let cy = r2Y + 16;
    chips.forEach(label => {
      const w = Math.max(46, 16 + label.length * 7);
      if (cx + w > cellX(i) + cellW - 12) {
        cx = px;
        cy += 30;
      }
      pill(cx, cy, w, label);
      cx += w + 8;
    });
  });

  // ===================== ROW 3 - EMOTION (curve) =========================
  const r3Y = r2Y + r2H; // 475
  const r3H = 120;
  rowLabel('03', 'EMOTION', r3Y, r3H);
  // white cells behind the curve
  for (let i = 0; i < 6; i++) gridCell(i, r3Y, r3H, C.CARD);

  const dotSize = 22;
  const pad = 18; // vertical padding inside the row for the curve band
  // 0 = top (happy) .. 1 = bottom (unhappy). mid, low, up, up, high, high.
  const levels = [0.5, 0.85, 0.4, 0.35, 0.15, 0.1];
  const dotCentres = levels.map((lvl, i) => {
    const cx = cellX(i) + cellW / 2;
    const cy = r3Y + pad + lvl * (r3H - 2 * pad);
    return { cx, cy };
  });
  // draw the connecting curve first (under the dots)
  for (let i = 0; i < dotCentres.length - 1; i++) {
    connector({
      x1: dotCentres[i].cx,
      y1: dotCentres[i].cy,
      x2: dotCentres[i + 1].cx,
      y2: dotCentres[i + 1].cy,
      stroke: ACCENT,
      strokeWidth: 3,
      mode: LINE_MODE.CURVE,
      arrow: false,
    });
  }
  // emotion dots on top
  dotCentres.forEach(({ cx, cy }) => {
    shape({
      x: cx - dotSize / 2,
      y: cy - dotSize / 2,
      w: dotSize,
      h: dotSize,
      fill: ACCENT,
      stroke: C.WHITE,
      strokeWidth: 2,
      shapeType: 'ellipse',
    });
  });

  // ===================== ROW 4 - PAIN POINTS ============================
  const r4Y = r3Y + r3H; // 595
  const r4H = 90;
  rowLabel('04', 'PAIN POINTS', r4Y, r4H);
  const pains = [
    'Too many choices',
    'Unclear pricing',
    'Long checkout',
    'Steep learning curve',
    'Feature gaps',
    'No incentive to share',
  ];
  pains.forEach((p, i) => {
    gridCell(i, r4Y, r4H, C.CARD);
    // small red dot marker
    shape({
      x: cellX(i) + 14,
      y: r4Y + 18,
      w: 10,
      h: 10,
      fill: C.RED,
      shapeType: 'ellipse',
    });
    text({
      x: cellX(i) + 32,
      y: r4Y + 14,
      w: cellW - 46,
      text: p,
      color: C.INK,
      size: 11,
      h: r4H - 24,
    });
  });

  // ===================== ROW 5 - OPPORTUNITIES ==========================
  const r5Y = r4Y + r4H; // 685
  const r5H = 90;
  rowLabel('05', 'OPPORTUNITIES', r5Y, r5H);
  const opps = [
    'Clearer value prop',
    'Simple pricing page',
    'One-click checkout',
    'Guided onboarding',
    'Ship key features',
    'Referral rewards',
  ];
  opps.forEach((o, i) => {
    gridCell(i, r5Y, r5H, ACCENT_TINT);
    text({
      x: cellX(i) + 14,
      y: r5Y + 16,
      w: cellW - 28,
      text: o,
      color: C.INK,
      size: 11,
      weight: MED,
      h: r5H - 28,
    });
  });

  // ===================== FRAME ==========================================
  const boardBottom = r5Y + r5H; // true bottom of the last row = 775
  frame('Customer Journey Map', -30, -30, 1600 + 60, boardBottom + 60);
};
