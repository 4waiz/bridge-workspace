import {
  BOLD,
  createCanvasKit,
  LINE_MODE,
  MED,
  SEMI,
  type TemplateBuilder,
} from './kit';

/**
 * Builds the "Roadmap" board onto a freshly-created edgeless surface.
 *
 * A swimlane timeline: four quarter columns across the top, three themed
 * swimlanes (Platform / Growth / AI) carrying pill-shaped initiative bars, a
 * milestone axis with diamond markers, and a status legend footer with a
 * dashed "NOW" marker line. Every element is a real, editable canvas shape so
 * teams can drag, rename and re-time their own initiatives.
 *
 * Visual language mirrors the OKR board: black header bar, white cards with
 * thin line borders, black number chips + accent title bars, and small status
 * chips. Accent colour is GREEN.
 */
export const buildRoadmapBoard: TemplateBuilder = (doc, surfaceId) => {
  const kit = createCanvasKit(doc, surfaceId);
  if (!kit) return;
  const { C, TINTS, shape, text, connector, frame } = kit;

  // ===================== HEADER ==========================================
  shape({ x: 0, y: 0, w: 1600, h: 140, fill: C.BLACK });
  text({
    x: 40,
    y: 28,
    w: 900,
    text: 'ROADMAP',
    color: C.WHITE,
    size: 44,
    weight: BOLD,
  });
  shape({ x: 44, y: 82, w: 130, h: 4, fill: C.GREEN });
  text({
    x: 42,
    y: 96,
    w: 640,
    text: 'QUARTERS  •  THEMES  •  MILESTONES',
    color: C.WHITE,
    size: 16,
    weight: SEMI,
  });

  // right header fields (white label + green underline bar)
  const field = (fx: number, label: string) => {
    text({
      x: fx,
      y: 52,
      w: 220,
      text: label,
      color: C.WHITE,
      size: 14,
      weight: SEMI,
    });
    shape({ x: fx, y: 92, w: 220, h: 2, fill: C.GREEN });
  };
  field(1100, 'YEAR:  20____');
  field(1340, 'OWNER:  ____');

  // ===================== TIMELINE GRID ===================================
  const laneX = 40; // left lane-label band start
  const laneW = 180; // lane-label band width
  const gridX = laneX + laneW; // quarter area start = 220
  const gridR = 1560; // right edge
  const gridW = gridR - gridX; // 1340
  const qW = gridW / 4; // 335 per quarter

  const qX = (q: number) => gridX + q * qW; // 0-based quarter index -> x

  // ---- quarter column headers ----
  const headY = 175;
  const headH = 40;
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  quarters.forEach((q, i) => {
    shape({
      x: qX(i) + 4,
      y: headY,
      w: qW - 8,
      h: headH,
      fill: C.GREEN,
      radius: 0.06,
      text: q,
      color: C.WHITE,
      size: 14,
      weight: BOLD,
    });
  });

  // ---- swimlanes ----
  // Start below the quarter headers (end y=215) with room for the "NOW" chip
  // (drawn at laneStartY-26) to sit in the gap instead of on top of a header.
  const laneStartY = 250;
  const laneH = 150;
  const laneGap = 10;

  // Each lane: a theme label + tinted colour for its pills, plus initiative
  // bars keyed by [startQuarter, durationInQuarters, title, status].
  // status: 'on' green / 'risk' amber. Bars are staggered to two sub-rows so a
  // bar can span a quarter boundary without colliding with its neighbour.
  const ON = C.GREEN;
  const RISK = C.AMBER;
  const lanes = [
    {
      name: 'PLATFORM',
      tint: TINTS.BLUE,
      dot: C.BLUE,
      bars: [
        {
          start: 0,
          span: 1.4,
          row: 0,
          title: 'Auth & billing revamp',
          status: ON,
        },
        {
          start: 1.6,
          span: 1.6,
          row: 0,
          title: 'Multi-region infra',
          status: RISK,
        },
        { start: 0.4, span: 1.8, row: 1, title: 'API v2 rollout', status: ON },
        { start: 2.6, span: 1.3, row: 1, title: 'Data pipeline', status: ON },
      ],
    },
    {
      name: 'GROWTH',
      tint: TINTS.PURPLE,
      dot: C.PURPLE,
      bars: [
        { start: 0, span: 1.2, row: 0, title: 'Onboarding funnel', status: ON },
        {
          start: 1.3,
          span: 1.7,
          row: 0,
          title: 'Referral program',
          status: RISK,
        },
        {
          start: 2.2,
          span: 1.5,
          row: 1,
          title: 'Pricing experiments',
          status: ON,
        },
      ],
    },
    {
      name: 'AI',
      tint: TINTS.GREEN,
      dot: C.GREEN,
      bars: [
        {
          start: 0.2,
          span: 1.6,
          row: 0,
          title: 'Smart search beta',
          status: RISK,
        },
        { start: 1.9, span: 1.4, row: 0, title: 'Assistant GA', status: ON },
        {
          start: 0.6,
          span: 2.0,
          row: 1,
          title: 'Model eval harness',
          status: ON,
        },
      ],
    },
  ];

  const laneTop = (i: number) => laneStartY + i * (laneH + laneGap);

  lanes.forEach((lane, i) => {
    const ly = laneTop(i);

    // left theme label cell
    shape({
      x: laneX,
      y: ly,
      w: laneW,
      h: laneH,
      fill: C.TINT,
      stroke: C.LINE,
      strokeWidth: 1.5,
      radius: 0.03,
      text: lane.name,
      color: C.INK,
      size: 16,
      weight: BOLD,
    });

    // lane track background (subtle wash card) + faint quarter grid lines
    shape({
      x: gridX,
      y: ly,
      w: gridW,
      h: laneH,
      fill: C.CARD,
      stroke: C.LINE,
      strokeWidth: 1.5,
      radius: 0.02,
    });
    for (let g = 1; g < 4; g++) {
      shape({ x: qX(g), y: ly + 8, w: 1, h: laneH - 16, fill: C.LINE });
    }

    // initiative pills (two sub-rows inside the lane)
    const pillH = 44;
    const subRowY = (row: number) => ly + 16 + row * (pillH + 14);
    lane.bars.forEach(bar => {
      const px = qX(bar.start) + 8;
      const rawW = bar.span * qW - 16;
      const pw = Math.max(90, Math.min(rawW, gridR - px - 6));
      const py = subRowY(bar.row);

      shape({
        x: px,
        y: py,
        w: pw,
        h: pillH,
        fill: lane.tint,
        stroke: C.LINE,
        strokeWidth: 1.5,
        radius: 0.5,
      });
      // status dot inside the pill (left)
      shape({
        x: px + 14,
        y: py + pillH / 2 - 7,
        w: 14,
        h: 14,
        fill: bar.status,
        shapeType: 'ellipse',
      });
      // initiative title (right of the dot)
      text({
        x: px + 36,
        y: py + pillH / 2 - 9,
        w: pw - 48,
        text: bar.title,
        color: C.INK,
        size: 11,
        weight: SEMI,
      });
    });
  });

  const lanesBottom = laneTop(lanes.length - 1) + laneH; // bottom of last lane

  // ===================== MILESTONE AXIS ==================================
  const axisY = lanesBottom + 60;
  const axisLabelY = axisY - 26;
  text({
    x: laneX,
    y: axisLabelY,
    w: laneW,
    text: 'MILESTONES',
    color: C.INK,
    size: 14,
    weight: BOLD,
  });

  // baseline across the quarter area (green, no arrowhead)
  connector({
    x1: gridX,
    y1: axisY,
    x2: gridR,
    y2: axisY,
    stroke: C.GREEN,
    strokeWidth: 3,
    mode: LINE_MODE.STRAIGHT,
    arrow: false,
  });

  // milestone markers: green diamonds sitting on the line + label below
  const milestones = [
    { at: 0.9, name: 'Alpha', date: 'Jan' },
    { at: 1.9, name: 'Beta', date: 'Mar' },
    { at: 2.9, name: 'GA', date: 'Jun' },
    { at: 3.7, name: 'Scale', date: 'Sep' },
  ];
  const diaSize = 18;
  milestones.forEach(m => {
    const mx = qX(m.at);
    shape({
      x: mx - diaSize / 2,
      y: axisY - diaSize / 2,
      w: diaSize,
      h: diaSize,
      fill: C.GREEN,
      shapeType: 'diamond',
    });
    text({
      x: mx - 70,
      y: axisY + 16,
      w: 140,
      text: `${m.name} - ${m.date}`,
      color: C.INK,
      size: 12,
      weight: SEMI,
      align: 'center',
    });
  });

  // ===================== "NOW" MARKER ====================================
  // dashed vertical green line through the lanes at an example date (~Q2 start).
  const nowX = qX(1.15);
  connector({
    x1: nowX,
    y1: laneStartY - 6,
    x2: nowX,
    y2: lanesBottom + 6,
    stroke: C.GREEN,
    strokeWidth: 2,
    dashed: true,
    mode: LINE_MODE.STRAIGHT,
    arrow: false,
  });
  shape({
    x: nowX - 26,
    y: laneStartY - 26,
    w: 52,
    h: 20,
    fill: C.GREEN,
    radius: 0.4,
    text: 'NOW',
    color: C.WHITE,
    size: 11,
    weight: BOLD,
  });

  // ===================== STATUS LEGEND (footer) ==========================
  const legendY = axisY + 56;
  text({
    x: laneX,
    y: legendY,
    w: 260,
    text: 'STATUS',
    color: C.INK,
    size: 14,
    weight: BOLD,
  });
  shape({ x: laneX, y: legendY + 24, w: 56, h: 3, fill: C.GREEN });

  const legend = [
    [C.GREEN, 'ON TRACK'],
    [C.AMBER, 'AT RISK'],
    [C.RED, 'OFF TRACK'],
  ] as const;
  let lx = laneX + 160;
  legend.forEach(([clr, label]) => {
    shape({
      x: lx,
      y: legendY - 2,
      w: 18,
      h: 18,
      fill: clr,
      shapeType: 'ellipse',
    });
    text({
      x: lx + 28,
      y: legendY,
      w: 150,
      text: label,
      color: C.INK,
      size: 13,
      weight: MED,
    });
    lx += 210;
  });

  const legendBottom = legendY + 30;

  // ---- wrap everything in a named frame ----
  const boardBottom = legendBottom;
  frame('Roadmap', -30, -30, 1600 + 60, boardBottom + 60);
};
