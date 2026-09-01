import { BOLD, createCanvasKit, REG, SEMI, type TemplateBuilder } from './kit';

/**
 * Builds the "Business Model Canvas" board onto a freshly-created edgeless
 * surface - the canonical Osterwalder nine-block grid rendered as real,
 * editable canvas elements so users can overwrite the example prompts.
 *
 * Visual language matches the OKR board: black header bar, white cards with
 * thin LINE borders, indigo section title bars, small indigo bullet dots and
 * light generic placeholder prompts. Indigo is the accent throughout, and the
 * central VALUE PROPOSITIONS block is emphasised with a tinted indigo wash so
 * it clearly reads as the hero of the canvas.
 */
export const buildBusinessModelCanvasBoard: TemplateBuilder = (
  doc,
  surfaceId
) => {
  const kit = createCanvasKit(doc, surfaceId);
  if (!kit) return;
  const { C, TINTS, shape, text, frame } = kit;

  const ACCENT = C.INDIGO;
  const WASH = TINTS.INDIGO;

  // ===================== HEADER ==========================================
  shape({ x: 0, y: 0, w: 1600, h: 140, fill: C.BLACK });
  text({
    x: 40,
    y: 28,
    w: 900,
    text: 'BUSINESS MODEL CANVAS',
    color: C.WHITE,
    size: 44,
    weight: BOLD,
  });
  shape({ x: 44, y: 82, w: 130, h: 4, fill: ACCENT });
  text({
    x: 42,
    y: 96,
    w: 620,
    text: 'NINE BUILDING BLOCKS  •  ONE VIEW',
    color: C.WHITE,
    size: 16,
    weight: SEMI,
  });

  // header fields (right-aligned): white label + accent underline bar
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
  field(1080, 'COMPANY:  __________');
  field(1340, 'DATE:  __________');

  // ===================== BLOCK HELPERS ===================================
  // Every block is a white card with an indigo title bar (black number chip +
  // accent bar) followed by 2-3 light example bullet prompts, each with a small
  // indigo dot. `hero` swaps the card fill for the indigo wash so the centre
  // Value Propositions block stands out.
  const PAD = 18;
  const BAR_H = 40;
  const drawBlock = (
    n: string,
    title: string,
    x: number,
    y: number,
    w: number,
    h: number,
    bullets: string[],
    hero = false
  ) => {
    // card background
    shape({
      x,
      y,
      w,
      h,
      fill: hero ? WASH : C.CARD,
      stroke: C.LINE,
      strokeWidth: 1.5,
      radius: 0.02,
    });
    // title bar: black number chip + accent bar
    shape({
      x,
      y,
      w: 46,
      h: BAR_H,
      fill: C.BLACK,
      text: n,
      color: C.WHITE,
      size: 15,
      weight: BOLD,
    });
    shape({
      x: x + 46,
      y,
      w: w - 46,
      h: BAR_H,
      fill: ACCENT,
      text: `  ${title}`,
      color: C.WHITE,
      size: 13.5,
      weight: BOLD,
      align: 'left',
    });
    // bullet prompts
    bullets.forEach((b, i) => {
      const by = y + BAR_H + 16 + i * 34;
      shape({
        x: x + PAD,
        y: by + 4,
        w: 8,
        h: 8,
        fill: ACCENT,
        shapeType: 'ellipse',
      });
      text({
        x: x + PAD + 18,
        y: by,
        w: w - PAD * 2 - 18,
        text: b,
        color: C.INK,
        size: 11.5,
        weight: REG,
        h: 30,
      });
    });
  };

  // ===================== GRID GEOMETRY ===================================
  // Content area x:40..1560 (width 1520). Top band y:175..645 (topH 470).
  // 5 columns with an 8px gutter: outer cols 292 wide, centre 320 wide.
  const topY = 175;
  const topH = 470;
  const gut = 8;
  const outerW = 292;
  const centreW = 320;
  const halfH = (topH - gut) / 2; // 231 - split-column half height

  const col1X = 40;
  const col2X = col1X + outerW + gut; // 340
  const col3X = col2X + outerW + gut; // 640
  const col4X = col3X + centreW + gut; // 968
  const col5X = col4X + outerW + gut; // 1268
  // col5 ends at 1268 + 292 = 1560 ✓

  // COL1 - KEY PARTNERS (full height)
  drawBlock('01', 'KEY PARTNERS', col1X, topY, outerW, topH, [
    'Strategic suppliers & alliances',
    'Key vendors we rely on',
    'Partners who de-risk delivery',
  ]);

  // COL2 - KEY ACTIVITIES (top) + KEY RESOURCES (bottom)
  drawBlock('02', 'KEY ACTIVITIES', col2X, topY, outerW, halfH, [
    'Core work that creates value',
    'Production / delivery / support',
  ]);
  drawBlock('03', 'KEY RESOURCES', col2X, topY + halfH + gut, outerW, halfH, [
    'People, IP & platform',
    'Physical & financial assets',
  ]);

  // COL3 - VALUE PROPOSITIONS (full height, HERO)
  drawBlock(
    '04',
    'VALUE PROPOSITIONS',
    col3X,
    topY,
    centreW,
    topH,
    [
      'The core problem we solve',
      'What makes our offer distinct',
      'Outcome the customer gains',
      'Why they choose us over others',
    ],
    true
  );

  // COL4 - CUSTOMER RELATIONSHIPS (top) + CHANNELS (bottom)
  drawBlock('05', 'CUSTOMER RELATIONSHIPS', col4X, topY, outerW, halfH, [
    'How we win & keep customers',
    'Self-serve, assisted or community',
  ]);
  drawBlock('06', 'CHANNELS', col4X, topY + halfH + gut, outerW, halfH, [
    'How we reach each segment',
    'Sales, web & partner routes',
  ]);

  // COL5 - CUSTOMER SEGMENTS (full height)
  drawBlock('07', 'CUSTOMER SEGMENTS', col5X, topY, outerW, topH, [
    'Who we create value for',
    'Primary segment & niche',
    'Their key jobs to be done',
  ]);

  // ===================== BOTTOM BAND =====================================
  // Two half-width cards under the grid: COST STRUCTURE + REVENUE STREAMS.
  const botY = topY + topH + gut + 2; // 655
  const botH = 150;
  const botW = (1520 - gut) / 2; // 756
  const botLX = 40;
  const botRX = botLX + botW + gut; // 804 - ends at 1560 ✓

  drawBlock('08', 'COST STRUCTURE', botLX, botY, botW, botH, [
    'Biggest fixed & variable costs',
    'Cost of the key resources & activities',
  ]);
  drawBlock('09', 'REVENUE STREAMS', botRX, botY, botW, botH, [
    'How each segment pays us',
    'Pricing model & recurring revenue',
  ]);

  // ===================== FRAME ===========================================
  const boardBottom = botY + botH; // 805
  frame('Business Model Canvas', -30, -30, 1600 + 60, boardBottom + 60);
};
