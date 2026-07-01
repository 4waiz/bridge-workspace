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
 * Builds the "Research Synthesis" board onto a freshly-created edgeless surface.
 *
 * Visual language mirrors the OKR board (black header bar, white cards with thin
 * line borders, black number chips + accent title bars, small chips). The accent
 * hue here is BLUE. The board tells the synthesis story left-to-right across
 * three lanes — OBSERVATIONS -> THEMES -> INSIGHTS — with a research-question /
 * method footer. Every element is a real, editable canvas element so users can
 * overwrite the light example placeholder content with their own study.
 */
export const buildResearchSynthesisBoard: TemplateBuilder = (
  doc,
  surfaceId
) => {
  const kit = createCanvasKit(doc, surfaceId);
  if (!kit) return;
  const { C, TINTS, shape, text, connector, frame } = kit;

  const ACCENT = C.BLUE;

  // ===================== HEADER ==========================================
  shape({ x: 0, y: 0, w: 1600, h: 140, fill: C.BLACK });
  text({
    x: 40,
    y: 28,
    w: 900,
    text: 'RESEARCH SYNTHESIS',
    color: C.WHITE,
    size: 44,
    weight: BOLD,
  });
  shape({ x: 44, y: 82, w: 130, h: 4, fill: ACCENT });
  text({
    x: 42,
    y: 96,
    w: 560,
    text: 'OBSERVATIONS  →  THEMES  →  INSIGHTS',
    color: C.WHITE,
    size: 16,
    weight: SEMI,
  });

  // right header fields (white label + accent underline bar)
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
  field(1080, 'STUDY:  __');
  field(1320, 'PARTICIPANTS:  __');

  // ===================== LANE GEOMETRY ===================================
  const laneW = 480;
  const laneX = [40, 560, 1080];
  const headerY = 175;
  const headerH = 46;

  // section header helper: black number chip + accent bar
  const laneHeader = (x: number, num: string, label: string) => {
    shape({
      x,
      y: headerY,
      w: 52,
      h: headerH,
      fill: C.BLACK,
      text: num,
      color: C.WHITE,
      size: 18,
      weight: BOLD,
    });
    shape({
      x: x + 52,
      y: headerY,
      w: laneW - 52,
      h: headerH,
      fill: ACCENT,
      text: `  ${label}`,
      color: C.WHITE,
      size: 18,
      weight: BOLD,
      align: 'left',
    });
  };

  laneHeader(laneX[0], '01', 'OBSERVATIONS');
  laneHeader(laneX[1], '02', 'THEMES');
  laneHeader(laneX[2], '03', 'INSIGHTS');

  // flow arrows between lane headers (observations -> themes -> insights)
  const arrowY = headerY + headerH / 2;
  connector({
    x1: laneX[0] + laneW + 6,
    y1: arrowY,
    x2: laneX[1] - 6,
    y2: arrowY,
    stroke: ACCENT,
    strokeWidth: 2.5,
    mode: LINE_MODE.STRAIGHT,
    arrow: true,
  });
  connector({
    x1: laneX[1] + laneW + 6,
    y1: arrowY,
    x2: laneX[2] - 6,
    y2: arrowY,
    stroke: ACCENT,
    strokeWidth: 2.5,
    mode: LINE_MODE.STRAIGHT,
    arrow: true,
  });

  const contentY = headerY + headerH + 24; // 245

  // ===================== LANE A: OBSERVATIONS ============================
  // sticky-note style cards, soft yellow, no visible border, one raw quote +
  // a tiny source tag.
  const obs = [
    ['"I never know which version is the latest one."', 'P3'],
    ['"Setup took me almost an hour to figure out."', 'P1'],
    ['"I copy the link into chat every single time."', 'P5'],
    ['"I wasn\'t sure my changes had actually saved."', 'P2'],
  ];
  const stickyH = 80;
  const stickyGap = 16;
  obs.forEach(([quote, tag], i) => {
    const cy = contentY + i * (stickyH + stickyGap);
    shape({
      x: laneX[0],
      y: cy,
      w: laneW,
      h: stickyH,
      fill: '#fff7d6',
      radius: 0.04,
    });
    text({
      x: laneX[0] + 18,
      y: cy + 14,
      w: laneW - 36,
      text: quote,
      color: C.INK,
      size: 12,
      weight: MED,
    });
    text({
      x: laneX[0] + 18,
      y: cy + stickyH - 22,
      w: laneW - 36,
      text: tag,
      color: C.MUTED,
      size: 10,
      weight: SEMI,
    });
  });
  const laneABottom = contentY + obs.length * (stickyH + stickyGap) - stickyGap;

  // ===================== LANE B: THEMES =================================
  // white cluster cards, blue stroke, theme title + description + count pill.
  const themes = [
    ['Version confusion', 'Users lose track of which file is current.', 'n=4'],
    ['Onboarding friction', 'First-run setup feels slow and unclear.', 'n=3'],
    ['Manual sharing', 'Links are copied around by hand, not built in.', 'n=5'],
  ];
  const themeH = 110;
  const themeGap = 20;
  themes.forEach(([title, desc, count], i) => {
    const cy = contentY + i * (themeH + themeGap);
    shape({
      x: laneX[1],
      y: cy,
      w: laneW,
      h: themeH,
      fill: C.CARD,
      stroke: ACCENT,
      strokeWidth: 1.5,
      radius: 0.04,
    });
    text({
      x: laneX[1] + 20,
      y: cy + 18,
      w: laneW - 130,
      text: title,
      color: ACCENT,
      size: 14,
      weight: BOLD,
    });
    text({
      x: laneX[1] + 20,
      y: cy + 50,
      w: laneW - 40,
      text: desc,
      color: C.INK,
      size: 12,
      weight: REG,
    });
    // count pill
    shape({
      x: laneX[1] + laneW - 84,
      y: cy + 16,
      w: 64,
      h: 26,
      fill: ACCENT,
      radius: 0.5,
      text: count,
      color: C.WHITE,
      size: 12,
      weight: BOLD,
    });
  });
  const laneBBottom = contentY + themes.length * (themeH + themeGap) - themeGap;

  // ===================== LANE C: INSIGHTS ===============================
  // tinted blue cards: label + statement + "SO WHAT ->" recommendation.
  const insights = [
    [
      'Surface the current version everywhere.',
      'SO WHAT →  Add a clear "latest" badge on every view.',
    ],
    [
      'Make first-run setup near-automatic.',
      'SO WHAT →  Ship sensible defaults; guide the first task.',
    ],
    [
      'Build sharing into the product itself.',
      'SO WHAT →  Replace copy-paste links with one-click share.',
    ],
  ];
  const insH = 110;
  const insGap = 20;
  insights.forEach(([statement, sowhat], i) => {
    const cy = contentY + i * (insH + insGap);
    shape({
      x: laneX[2],
      y: cy,
      w: laneW,
      h: insH,
      fill: TINTS.BLUE,
      stroke: C.LINE,
      strokeWidth: 1.5,
      radius: 0.04,
    });
    text({
      x: laneX[2] + 20,
      y: cy + 16,
      w: laneW - 40,
      text: 'INSIGHT',
      color: ACCENT,
      size: 11,
      weight: BOLD,
    });
    text({
      x: laneX[2] + 20,
      y: cy + 38,
      w: laneW - 40,
      text: statement,
      color: C.INK,
      size: 13,
      weight: SEMI,
    });
    text({
      x: laneX[2] + 20,
      y: cy + 76,
      w: laneW - 40,
      text: sowhat,
      color: C.MUTED,
      size: 12,
      weight: MED,
    });
  });
  const laneCBottom = contentY + insights.length * (insH + insGap) - insGap;

  const lanesBottom = Math.max(laneABottom, laneBBottom, laneCBottom);

  // ===================== FOOTER =========================================
  const footY = lanesBottom + 40;
  const footW = 1520; // 40..1560
  const footH = 180;

  shape({
    x: 40,
    y: footY,
    w: footW,
    h: footH,
    fill: C.CARD,
    stroke: C.LINE,
    strokeWidth: 1.5,
    radius: 0.02,
  });
  // title bar (accent) across the top-left of the footer card
  shape({
    x: 40,
    y: footY,
    w: footW,
    h: 40,
    fill: ACCENT,
    text: '  RESEARCH QUESTION & METHOD',
    color: C.WHITE,
    size: 16,
    weight: BOLD,
    align: 'left',
  });

  // left: research question
  const leftX = 64;
  text({
    x: leftX,
    y: footY + 58,
    w: 560,
    text: 'RESEARCH QUESTION',
    color: ACCENT,
    size: 12,
    weight: BOLD,
  });
  text({
    x: leftX,
    y: footY + 82,
    w: 620,
    text: 'How do people keep track of their work today, and where does the current flow break down?',
    color: C.INK,
    size: 14,
    weight: SEMI,
    h: 60,
  });

  // vertical divider
  shape({ x: 720, y: footY + 56, w: 1.5, h: footH - 76, fill: C.LINE });

  // right: method / participants meta
  const metaX = 760;
  text({
    x: metaX,
    y: footY + 58,
    w: 320,
    text: 'METHOD',
    color: ACCENT,
    size: 12,
    weight: BOLD,
  });
  const meta = [
    ['Approach', 'Moderated interviews'],
    ['Participants', '5 (recruited by role)'],
    ['Duration', '45 min each'],
  ];
  meta.forEach(([k, v], i) => {
    const my = footY + 82 + i * 26;
    text({
      x: metaX,
      y: my,
      w: 130,
      text: k,
      color: C.MUTED,
      size: 12,
      weight: MED,
    });
    text({
      x: metaX + 130,
      y: my,
      w: 220,
      text: v,
      color: C.INK,
      size: 12,
      weight: SEMI,
    });
  });

  // CONFIDENCE legend (High / Med / Low dots) at footer right
  const legX = 1160;
  text({
    x: legX,
    y: footY + 58,
    w: 320,
    text: 'CONFIDENCE',
    color: ACCENT,
    size: 12,
    weight: BOLD,
  });
  const legend = [
    [C.GREEN, 'High', 'Strong, repeated signal'],
    [C.AMBER, 'Med', 'Some supporting evidence'],
    [C.RED, 'Low', 'Early / single source'],
  ];
  legend.forEach(([clr, title, sub], i) => {
    const ly = footY + 84 + i * 28;
    shape({ x: legX, y: ly, w: 16, h: 16, fill: clr, shapeType: 'ellipse' });
    text({
      x: legX + 28,
      y: ly - 2,
      w: 90,
      text: title,
      color: C.INK,
      size: 12,
      weight: BOLD,
    });
    text({
      x: legX + 90,
      y: ly - 1,
      w: 240,
      text: sub,
      color: C.MUTED,
      size: 11,
      weight: REG,
    });
  });

  const boardBottom = footY + footH;

  // ---- wrap everything in a named frame ----
  frame('Research Synthesis', -30, -30, 1600 + 60, boardBottom + 60);
};
