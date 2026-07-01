import {
  BOLD,
  createCanvasKit,
  LINE_MODE,
  MED,
  REG,
  SEMI,
  type TemplateBuilder,
} from './kit';

/**
 * Builds the "Workshop Canvas" board onto a freshly-created edgeless surface.
 *
 * A reusable facilitation template for running a working session end-to-end:
 * session objectives + ground rules up top, a five-stop agenda timeline, a
 * sticky-note idea wall, a parking lot and a decisions/actions card. Every
 * element is a real, editable canvas object so the facilitator can overwrite the
 * generic starter content with their own.
 *
 * Visual language mirrors the OKR board (black header bar, white cards with thin
 * line borders, black number chips + accent title bars) with PINK as the accent.
 */
export const buildWorkshopCanvasBoard: TemplateBuilder = (doc, surfaceId) => {
  const kit = createCanvasKit(doc, surfaceId);
  if (!kit) return;
  const { C, TINTS, shape, text, connector, frame } = kit;

  const ACCENT = C.PINK;
  const ACCENT_TINT = TINTS.PINK;

  // ===================== HEADER ==========================================
  shape({ x: 0, y: 0, w: 1600, h: 140, fill: C.BLACK });
  text({
    x: 40,
    y: 28,
    w: 780,
    text: 'WORKSHOP CANVAS',
    color: C.WHITE,
    size: 44,
    weight: BOLD,
  });
  shape({ x: 44, y: 82, w: 130, h: 4, fill: ACCENT });
  text({
    x: 42,
    y: 96,
    w: 560,
    text: 'FRAME  •  DIVERGE  •  CONVERGE',
    color: C.WHITE,
    size: 16,
    weight: SEMI,
  });

  // header fields (white label + accent underline bar)
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
    shape({ x: fx, y: 92, w: 220, h: 2, fill: ACCENT });
  };
  field(1100, 'FACILITATOR:  __');
  field(1340, 'DATE:  __');

  // ===================== TOP ROW =========================================
  const rowY = 175;
  const rowH = 120;
  const gap = 40;
  const topW = 740;
  const objX = 40;
  const rulesX = objX + topW + gap; // 820

  // --- Session objectives card (pink wash) ---
  shape({
    x: objX,
    y: rowY,
    w: topW,
    h: rowH,
    fill: ACCENT_TINT,
    stroke: C.LINE,
    strokeWidth: 1.5,
    radius: 0.02,
  });
  text({
    x: objX + 22,
    y: rowY + 16,
    w: topW - 44,
    text: 'SESSION OBJECTIVES',
    color: ACCENT,
    size: 16,
    weight: BOLD,
  });
  const objectives = [
    'Align on the problem we are solving together',
    'Generate a wide set of candidate directions',
    'Leave with 2–3 committed next actions',
  ];
  objectives.forEach((line, i) => {
    text({
      x: objX + 24,
      y: rowY + 48 + i * 22,
      w: topW - 48,
      text: `•  ${line}`,
      color: C.INK,
      size: 12.5,
    });
  });

  // --- Ground rules card (white) ---
  shape({
    x: rulesX,
    y: rowY,
    w: topW,
    h: rowH,
    fill: C.CARD,
    stroke: C.LINE,
    strokeWidth: 1.5,
    radius: 0.02,
  });
  text({
    x: rulesX + 22,
    y: rowY + 16,
    w: topW - 44,
    text: 'GROUND RULES',
    color: ACCENT,
    size: 16,
    weight: BOLD,
  });
  const rules = [
    'One conversation at a time',
    'Defer judgement — capture every idea',
    'Build on ideas, do not tear them down',
  ];
  rules.forEach((line, i) => {
    text({
      x: rulesX + 24,
      y: rowY + 48 + i * 22,
      w: topW - 48,
      text: `•  ${line}`,
      color: C.INK,
      size: 12.5,
    });
  });

  // ===================== AGENDA TIMELINE =================================
  const agendaY = 335;
  const secW = 1520;
  // section header: black number chip + accent bar
  shape({
    x: 40,
    y: agendaY,
    w: 52,
    h: 46,
    fill: C.BLACK,
    text: '01',
    color: C.WHITE,
    size: 18,
    weight: BOLD,
  });
  shape({
    x: 92,
    y: agendaY,
    w: secW - 52,
    h: 46,
    fill: ACCENT,
    text: '  AGENDA',
    color: C.WHITE,
    size: 18,
    weight: BOLD,
    align: 'left',
  });

  // horizontal timeline baseline
  const lineY = agendaY + 105; // 440
  connector({
    x1: 60,
    y1: lineY,
    x2: 1540,
    y2: lineY,
    stroke: ACCENT,
    strokeWidth: 3,
    arrow: false,
    mode: LINE_MODE.STRAIGHT,
  });

  const stops = [
    ['0:00', 'Frame'],
    ['0:15', 'Diverge'],
    ['0:35', 'Cluster'],
    ['0:55', 'Decide'],
    ['1:15', 'Close'],
  ];
  const stopStartX = 120;
  const stopStep = 340; // 120,460,800,1140,1480
  const nodeW = 20;
  const nodeH = 20;
  stops.forEach(([time, label], i) => {
    const cx = stopStartX + i * stopStep;
    // node on the line
    shape({
      x: cx - nodeW / 2,
      y: lineY - nodeH / 2,
      w: nodeW,
      h: nodeH,
      fill: ACCENT,
      stroke: C.WHITE,
      strokeWidth: 2,
      radius: 0.3,
    });
    // time (bold) + segment name below the line
    text({
      x: cx - 120,
      y: lineY + 18,
      w: 240,
      text: time,
      color: C.INK,
      size: 13,
      weight: BOLD,
      align: 'center',
    });
    text({
      x: cx - 120,
      y: lineY + 38,
      w: 240,
      text: label,
      color: C.MUTED,
      size: 12,
      weight: MED,
      align: 'center',
    });
  });

  // ===================== IDEAS BOARD + RIGHT COLUMN =====================
  const bodyY = 520;

  // ---- Ideas board section header ----
  shape({
    x: 40,
    y: bodyY,
    w: 52,
    h: 46,
    fill: C.BLACK,
    text: '02',
    color: C.WHITE,
    size: 18,
    weight: BOLD,
  });
  shape({
    x: 92,
    y: bodyY,
    w: 948,
    h: 46,
    fill: ACCENT,
    text: '  IDEAS  (STICKY WALL)',
    color: C.WHITE,
    size: 18,
    weight: BOLD,
    align: 'left',
  });

  // ---- Ideas board card ----
  const boardX = 40;
  const boardY = bodyY + 62; // 582
  const boardW = 1000;
  const boardH = 300;
  shape({
    x: boardX,
    y: boardY,
    w: boardW,
    h: boardH,
    fill: C.TINT,
    stroke: C.LINE,
    strokeWidth: 1.5,
    radius: 0.02,
  });

  // 4x2 grid of sticky notes
  const stickyPad = 24;
  const stickyGap = 20;
  const cols = 4;
  const rows = 2;
  const stickyW = (boardW - stickyPad * 2 - stickyGap * (cols - 1)) / cols; // 218.5
  const stickyH = (boardH - stickyPad * 2 - stickyGap * (rows - 1)) / rows; // 116
  const stickyFills = [
    TINTS.AMBER,
    TINTS.PINK,
    TINTS.BLUE,
    TINTS.GREEN,
    TINTS.PINK,
    TINTS.BLUE,
    TINTS.GREEN,
    TINTS.AMBER,
  ];
  const ideas = [
    'Kick-off ritual to set the tone',
    'Shared glossary for the team',
    'Async check-in template',
    'Automate the weekly report',
    'Onboarding buddy program',
    'Single source of truth doc',
    'Lightweight decision log',
    'Monthly show-and-tell',
  ];
  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const sx = boardX + stickyPad + col * (stickyW + stickyGap);
    const sy = boardY + stickyPad + row * (stickyH + stickyGap);
    shape({
      x: sx,
      y: sy,
      w: stickyW,
      h: stickyH,
      fill: stickyFills[i],
      stroke: C.LINE,
      strokeWidth: 1,
      radius: 0.04,
    });
    text({
      x: sx + 14,
      y: sy + 14,
      w: stickyW - 28,
      h: stickyH - 28,
      text: ideas[i],
      color: C.INK,
      size: 11,
      weight: MED,
    });
  }

  // ---- Right column ----
  const rightX = boardX + boardW + gap; // 1080
  const rightW = 480; // ends at 1560

  // Parking lot card
  const parkY = boardY;
  const parkH = 140;
  shape({
    x: rightX,
    y: parkY,
    w: rightW,
    h: parkH,
    fill: C.CARD,
    stroke: C.LINE,
    strokeWidth: 1.5,
    radius: 0.02,
  });
  text({
    x: rightX + 20,
    y: parkY + 16,
    w: rightW - 40,
    text: 'PARKING LOT',
    color: ACCENT,
    size: 16,
    weight: BOLD,
  });
  const parked = [
    'Budget question — take offline with finance',
    'Tooling migration — separate deep-dive session',
  ];
  parked.forEach((line, i) => {
    text({
      x: rightX + 22,
      y: parkY + 48 + i * 34,
      w: rightW - 44,
      text: `•  ${line}`,
      color: C.INK,
      size: 12.5,
    });
  });

  // Decisions & actions card (black)
  const decY = parkY + parkH + gap; // 762
  const decH = 150;
  shape({
    x: rightX,
    y: decY,
    w: rightW,
    h: decH,
    fill: C.BLACK,
    radius: 0.06,
  });
  text({
    x: rightX + 20,
    y: decY + 16,
    w: rightW - 40,
    text: 'DECISIONS & ACTIONS',
    color: ACCENT,
    size: 16,
    weight: BOLD,
  });
  const actions = [
    ['Ship the pilot to one team next sprint', 'AC'],
    ['Draft the decision log by Friday', 'JD'],
    ['Book the deep-dive on tooling', 'RM'],
  ];
  actions.forEach(([line, owner], i) => {
    const ay = decY + 50 + i * 32;
    // owner chip
    shape({
      x: rightX + 20,
      y: ay,
      w: 34,
      h: 24,
      fill: ACCENT,
      radius: 0.2,
      text: owner,
      color: C.WHITE,
      size: 11,
      weight: BOLD,
    });
    text({
      x: rightX + 66,
      y: ay + 3,
      w: rightW - 88,
      text: line,
      color: C.WHITE,
      size: 12.5,
      weight: REG,
    });
  });

  // ===================== FRAME ===========================================
  // true bottom of the board = bottom of the ideas board card / decisions card
  const boardBottom = Math.max(boardY + boardH, decY + decH); // 912
  frame('Workshop Canvas', -30, -30, 1600 + 60, boardBottom + 60);
};
