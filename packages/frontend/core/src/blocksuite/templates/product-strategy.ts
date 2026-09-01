import { BOLD, createCanvasKit, REG, SEMI, type TemplateBuilder } from './kit';

/**
 * Builds the "Product Strategy" board onto a freshly-created edgeless surface.
 *
 * Visual sibling of the OKR board: black header bar, white cards with thin line
 * borders, black number chips + orange accent bars for sections and small
 * chips. Content is a reusable template - real field labels with light, generic
 * example placeholders users overwrite.
 *
 * Layout (top to bottom):
 *   1) Vision banner          - one-line product vision.
 *   2) Strategic pillars      - 4 pillar columns with why-it-matters + bullets.
 *   3) Strategic bets         - 3 bet cards (bet / hypothesis / success metric).
 *   4) Footer                 - north-star metric card + non-goals card.
 */
export const buildProductStrategyBoard: TemplateBuilder = (doc, surfaceId) => {
  const kit = createCanvasKit(doc, surfaceId);
  if (!kit) return;
  const { C, TINTS, shape, text } = kit;

  // ===================== HEADER ==========================================
  shape({ x: 0, y: 0, w: 1600, h: 140, fill: C.BLACK });
  text({
    x: 40,
    y: 28,
    w: 820,
    text: 'PRODUCT STRATEGY',
    color: C.WHITE,
    size: 44,
    weight: BOLD,
  });
  shape({ x: 44, y: 82, w: 130, h: 4, fill: C.ORANGE });
  text({
    x: 42,
    y: 96,
    w: 560,
    text: 'VISION  •  PILLARS  •  BETS',
    color: C.WHITE,
    size: 16,
    weight: SEMI,
  });

  // header fields (white label + accent underline bar)
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
    shape({ x: fx, y: 92, w: 240, h: 2, fill: C.ORANGE });
  };
  field(1080, 'OWNER:');
  field(1320, 'HORIZON:  H1 20__');

  // ===================== 1) VISION BANNER ================================
  const visX = 40;
  const visY = 175;
  const visW = 1520;
  const visH = 90;
  shape({
    x: visX,
    y: visY,
    w: visW,
    h: visH,
    fill: TINTS.ORANGE,
    stroke: C.LINE,
    strokeWidth: 1.5,
    radius: 0.02,
  });
  text({
    x: visX + 24,
    y: visY + 16,
    w: 300,
    text: 'OUR VISION',
    color: C.ORANGE,
    size: 13,
    weight: BOLD,
  });
  text({
    x: visX + 24,
    y: visY + 40,
    w: visW - 48,
    text: 'Become the default canvas where teams plan, decide and build - together.',
    color: C.INK,
    size: 18,
    weight: SEMI,
  });

  // ===================== 2) STRATEGIC PILLARS ============================
  const pillarSecY = 295;
  const secW = 1520;
  // section header: black number chip + orange accent bar
  shape({
    x: 40,
    y: pillarSecY,
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
    y: pillarSecY,
    w: secW - 52,
    h: 46,
    fill: C.ORANGE,
    text: '  STRATEGIC PILLARS',
    color: C.WHITE,
    size: 18,
    weight: BOLD,
    align: 'left',
  });

  const pillarChipColors = [C.BLUE, C.PURPLE, C.TEAL, C.GREEN];
  const pillars = [
    {
      title: 'Delightful onboarding',
      why: 'First-run experience decides retention.',
      bullets: [
        'Value in the first 5 minutes',
        'Guided templates, not blank pages',
        'Zero-config sample workspace',
      ],
    },
    {
      title: 'AI that does real work',
      why: 'Assistants must save hours, not seconds.',
      bullets: [
        'Draft, summarise and restructure content',
        'Grounded in the user’s own docs',
        'Suggests next actions inline',
      ],
    },
    {
      title: 'Collaboration at scale',
      why: 'Teams grow; the canvas must keep up.',
      bullets: [
        'Real-time multiplayer editing',
        'Comments, mentions and reviews',
        'Roles and shared spaces',
      ],
    },
    {
      title: 'Trust & reliability',
      why: 'Confidence is a feature, not an afterthought.',
      bullets: [
        'Fast, offline-first sync',
        'Secure by default, exportable data',
        'Predictable, dependable uptime',
      ],
    },
  ];

  const pillarTop = pillarSecY + 62; // 357
  const pillarH = 200; // ends 557, clears the bets header at y 565
  const pillarGutter = 24;
  const pillarW = (secW - pillarGutter * 3) / 4; // 362
  pillars.forEach((p, i) => {
    const x = 40 + i * (pillarW + pillarGutter);

    // card background
    shape({
      x,
      y: pillarTop,
      w: pillarW,
      h: pillarH,
      fill: C.CARD,
      stroke: C.LINE,
      strokeWidth: 1.5,
      radius: 0.02,
    });

    // coloured number chip top-left
    shape({
      x: x + 18,
      y: pillarTop + 18,
      w: 40,
      h: 34,
      fill: pillarChipColors[i],
      radius: 0.12,
      text: `0${i + 1}`,
      color: C.WHITE,
      size: 15,
      weight: BOLD,
    });

    // pillar title
    text({
      x: x + 70,
      y: pillarTop + 22,
      w: pillarW - 88,
      text: p.title,
      color: C.INK,
      size: 15,
      weight: SEMI,
      h: 40,
    });

    // why it matters
    text({
      x: x + 18,
      y: pillarTop + 66,
      w: pillarW - 36,
      text: p.why,
      color: C.MUTED,
      size: 12,
      h: 32,
    });

    // divider
    shape({
      x: x + 18,
      y: pillarTop + 96,
      w: pillarW - 36,
      h: 1,
      fill: C.LINE,
    });

    // bullets, each prefixed by a small orange dot
    p.bullets.forEach((b, r) => {
      const by = pillarTop + 108 + r * 30;
      shape({
        x: x + 18,
        y: by + 4,
        w: 7,
        h: 7,
        fill: C.ORANGE,
        shapeType: 'ellipse',
      });
      text({
        x: x + 34,
        y: by,
        w: pillarW - 52,
        text: b,
        color: C.INK,
        size: 12,
        h: 30,
      });
    });
  });

  // ===================== 3) STRATEGIC BETS ===============================
  const betSecY = 565;
  shape({
    x: 40,
    y: betSecY,
    w: 52,
    h: 46,
    fill: C.BLACK,
    text: '03',
    color: C.WHITE,
    size: 18,
    weight: BOLD,
  });
  shape({
    x: 92,
    y: betSecY,
    w: secW - 52,
    h: 46,
    fill: C.ORANGE,
    text: '  STRATEGIC BETS THIS HORIZON',
    color: C.WHITE,
    size: 18,
    weight: BOLD,
    align: 'left',
  });

  const bets = [
    {
      bet: 'Ship an AI writing partner',
      hypothesis:
        'If drafting is assisted, more docs reach “done” and weekly active use rises.',
      metric: '+15% weekly active editors',
    },
    {
      bet: 'Template-first onboarding',
      hypothesis:
        'If new users start from a template, time-to-first-value drops sharply.',
      metric: 'Time-to-value under 5 min',
    },
    {
      bet: 'Team spaces & sharing',
      hypothesis:
        'If sharing is one click, invites per workspace and seat growth increase.',
      metric: '2x invites per workspace',
    },
  ];

  const betTop = betSecY + 62; // 627
  const betH = 170;
  const betGutter = 25;
  const betW = (secW - betGutter * 2) / 3; // 490
  bets.forEach((b, i) => {
    const x = 40 + i * (betW + betGutter);

    shape({
      x,
      y: betTop,
      w: betW,
      h: betH,
      fill: C.CARD,
      stroke: C.LINE,
      strokeWidth: 1.5,
      radius: 0.02,
    });

    const rowLabel = (ly: number, label: string, value: string, vh: number) => {
      text({
        x: x + 20,
        y: ly,
        w: betW - 40,
        text: label,
        color: C.ORANGE,
        size: 11,
        weight: BOLD,
      });
      text({
        x: x + 20,
        y: ly + 16,
        w: betW - 40,
        text: value,
        color: C.INK,
        size: 12.5,
        weight: label === 'BET' ? SEMI : REG,
        h: vh,
      });
    };

    rowLabel(betTop + 16, 'BET', b.bet, 20);
    rowLabel(betTop + 62, 'HYPOTHESIS', b.hypothesis, 40);
    rowLabel(betTop + 124, 'SUCCESS METRIC', b.metric, 20);
  });

  // ===================== 4) FOOTER =======================================
  const footY = 837; // clears the bet cards (which end at y 797) with a gutter
  const footH = 120;
  const footGutter = 40;
  const footW = (secW - footGutter) / 2; // 740

  // ---- North star metric (black card) ----
  const nsX = 40;
  shape({ x: nsX, y: footY, w: footW, h: footH, fill: C.BLACK, radius: 0.06 });
  text({
    x: nsX + 28,
    y: footY + 22,
    w: footW - 56,
    text: 'NORTH STAR METRIC',
    color: C.ORANGE,
    size: 15,
    weight: BOLD,
  });
  text({
    x: nsX + 28,
    y: footY + 52,
    w: footW - 56,
    text: 'Weekly active teams creating and sharing work on the canvas.',
    color: C.WHITE,
    size: 15,
    weight: SEMI,
    h: 48,
  });

  // ---- Non-goals (white card) ----
  const ngX = nsX + footW + footGutter; // 820
  shape({
    x: ngX,
    y: footY,
    w: footW,
    h: footH,
    fill: C.CARD,
    stroke: C.LINE,
    strokeWidth: 1.5,
    radius: 0.06,
  });
  text({
    x: ngX + 28,
    y: footY + 18,
    w: footW - 56,
    text: 'NON-GOALS (WHAT WE WON’T DO)',
    color: C.INK,
    size: 15,
    weight: BOLD,
  });
  const nonGoals = [
    'Chase every feature request from a single account',
    'Rebuild a full spreadsheet or project-management suite',
    'Add integrations before the core loop feels great',
  ];
  nonGoals.forEach((g, r) => {
    const gy = footY + 48 + r * 22;
    shape({
      x: ngX + 28,
      y: gy + 5,
      w: 7,
      h: 7,
      fill: C.ORANGE,
      shapeType: 'ellipse',
    });
    text({
      x: ngX + 44,
      y: gy,
      w: footW - 72,
      text: g,
      color: C.INK,
      size: 12,
      h: 20,
    });
  });

  // ---- wrap everything in a named frame ----
  const boardBottom = footY + footH; // 957
  kit.frame('Product Strategy', -30, -30, 1600 + 60, boardBottom + 60);
};
