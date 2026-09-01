import { BOLD, createCanvasKit, MED, SEMI, type TemplateBuilder } from './kit';

/**
 * Builds the "Sprint Planning" board onto a freshly-created edgeless surface.
 *
 * Visual language mirrors the OKR board (black header bar, white cards with thin
 * line borders, black number chips + accent title bars) but themed PURPLE. It is
 * a reusable template: real field labels with light, generic example placeholder
 * text users overwrite. Layout: a sprint-goal banner, a four-column kanban board
 * (Backlog / To Do / In Progress / Done) of example task cards, and a footer with
 * a team-capacity table and a sprint-metrics stat card.
 */
export const buildSprintPlanningBoard: TemplateBuilder = (doc, surfaceId) => {
  const kit = createCanvasKit(doc, surfaceId);
  if (!kit) return;
  const { C, TINTS, shape, text } = kit;

  const ACCENT = C.PURPLE;
  const ACCENT_TINT = TINTS.PURPLE;

  // ===================== HEADER ==========================================
  shape({ x: 0, y: 0, w: 1600, h: 140, fill: C.BLACK });
  text({
    x: 40,
    y: 28,
    w: 800,
    text: 'SPRINT PLANNING',
    color: C.WHITE,
    size: 44,
    weight: BOLD,
  });
  shape({ x: 44, y: 82, w: 130, h: 4, fill: ACCENT });
  text({
    x: 42,
    y: 96,
    w: 560,
    text: 'BACKLOG  •  CAPACITY  •  GOALS',
    color: C.WHITE,
    size: 16,
    weight: SEMI,
  });

  // right header fields (white label + accent underline bar)
  const field = (fx: number, fw: number, label: string) => {
    text({
      x: fx,
      y: 52,
      w: fw,
      text: label,
      color: C.WHITE,
      size: 14,
      weight: SEMI,
    });
    shape({ x: fx, y: 92, w: fw, h: 2, fill: ACCENT });
  };
  field(1130, 200, 'SPRINT:  __');
  field(1360, 200, 'DATES:  __ - __');

  // ===================== SPRINT GOAL BANNER ==============================
  const goalY = 175;
  shape({
    x: 40,
    y: goalY,
    w: 1520,
    h: 78,
    fill: ACCENT_TINT,
    stroke: C.LINE,
    strokeWidth: 1.5,
    radius: 0.02,
  });
  text({
    x: 64,
    y: goalY + 16,
    w: 240,
    text: 'SPRINT GOAL',
    color: ACCENT,
    size: 13,
    weight: BOLD,
  });
  text({
    x: 64,
    y: goalY + 40,
    w: 1440,
    text: 'Ship the onboarding flow so a new user reaches first value without support.',
    color: C.INK,
    size: 16,
    weight: SEMI,
  });

  // ===================== KANBAN BOARD ===================================
  const kbY = 285;
  const colW = 362;
  const gutter = 24;
  const colX = [
    40,
    40 + (colW + gutter),
    40 + 2 * (colW + gutter),
    40 + 3 * (colW + gutter),
  ];
  const headH = 44;
  const colBgH = 375;
  const cardH = 78;
  const cardGap = 14;
  const cardTop = kbY + headH + 16;

  // owner avatar colours cycled per initial
  const avatarColors = [C.BLUE, C.TEAL, C.PINK, C.INDIGO, C.AMBER, C.GREEN];

  interface Task {
    title: string;
    points: string;
    owner: string;
    tag: string;
    avatar: string;
    done?: boolean;
  }

  const columns: { name: string; count: string; tasks: Task[] }[] = [
    {
      name: 'BACKLOG',
      count: '3',
      tasks: [
        {
          title: 'Draft account settings page',
          points: '5',
          owner: 'A',
          tag: 'Feature',
          avatar: C.BLUE,
        },
        {
          title: 'Research notification options',
          points: '2',
          owner: 'M',
          tag: 'Spike',
          avatar: C.TEAL,
        },
        {
          title: 'Define empty-state copy',
          points: '1',
          owner: 'R',
          tag: 'Content',
          avatar: C.PINK,
        },
      ],
    },
    {
      name: 'TO DO',
      count: '2',
      tasks: [
        {
          title: 'Build sign-up form validation',
          points: '3',
          owner: 'S',
          tag: 'Feature',
          avatar: C.INDIGO,
        },
        {
          title: 'Wire welcome email trigger',
          points: '2',
          owner: 'A',
          tag: 'Backend',
          avatar: C.BLUE,
        },
      ],
    },
    {
      name: 'IN PROGRESS',
      count: '2',
      tasks: [
        {
          title: 'Onboarding checklist UI',
          points: '5',
          owner: 'M',
          tag: 'Feature',
          avatar: C.TEAL,
        },
        {
          title: 'Fix avatar upload bug',
          points: '3',
          owner: 'R',
          tag: 'Bug',
          avatar: C.PINK,
        },
      ],
    },
    {
      name: 'DONE',
      count: '3',
      tasks: [
        {
          title: 'Set up analytics events',
          points: '2',
          owner: 'S',
          tag: 'Done',
          avatar: C.INDIGO,
          done: true,
        },
        {
          title: 'Landing page hero section',
          points: '3',
          owner: 'A',
          tag: 'Done',
          avatar: C.BLUE,
          done: true,
        },
        {
          title: 'Add password reset flow',
          points: '3',
          owner: 'M',
          tag: 'Done',
          avatar: C.TEAL,
          done: true,
        },
      ],
    },
  ];

  columns.forEach((col, ci) => {
    const x = colX[ci];

    // column header: black chip + accent bar with name (white) + count chip
    shape({
      x,
      y: kbY,
      w: colW,
      h: headH,
      fill: ACCENT,
      radius: 0.04,
      text: `  ${col.name}`,
      color: C.WHITE,
      size: 15,
      weight: BOLD,
      align: 'left',
    });
    // count chip (top-right of header)
    shape({
      x: x + colW - 44,
      y: kbY + 9,
      w: 30,
      h: 26,
      fill: C.BLACK,
      radius: 0.3,
      text: col.count,
      color: C.WHITE,
      size: 13,
      weight: BOLD,
    });

    // light column background
    shape({
      x,
      y: kbY + headH + 8,
      w: colW,
      h: colBgH,
      fill: C.TINT,
      radius: 0.02,
    });

    // task cards
    col.tasks.forEach((task, ti) => {
      const cy = cardTop + ti * (cardH + cardGap);
      const cardX = x + 12;
      const cardW = colW - 24;

      shape({
        x: cardX,
        y: cy,
        w: cardW,
        h: cardH,
        fill: C.CARD,
        stroke: C.LINE,
        strokeWidth: 1.5,
        radius: 0.06,
      });

      // title (leaves room for point chip top-right)
      text({
        x: cardX + 14,
        y: cy + 12,
        w: cardW - 74,
        text: task.title,
        color: C.INK,
        size: 13,
        weight: SEMI,
      });

      // story-point pill (purple, top-right)
      shape({
        x: cardX + cardW - 44,
        y: cy + 12,
        w: 30,
        h: 24,
        fill: ACCENT,
        radius: 0.5,
        text: task.points,
        color: C.WHITE,
        size: 12,
        weight: BOLD,
      });

      // owner initials avatar (bottom-left)
      shape({
        x: cardX + 14,
        y: cy + cardH - 30,
        w: 22,
        h: 22,
        fill: task.avatar,
        shapeType: 'ellipse',
        text: task.owner,
        color: C.WHITE,
        size: 11,
        weight: BOLD,
      });

      // status / tag line
      text({
        x: cardX + 44,
        y: cy + cardH - 26,
        w: cardW - 90,
        text: task.tag,
        color: C.MUTED,
        size: 11,
        weight: MED,
      });

      // green check dot for DONE column
      if (task.done) {
        shape({
          x: cardX + cardW - 30,
          y: cy + cardH - 30,
          w: 16,
          h: 16,
          fill: C.GREEN,
          shapeType: 'ellipse',
          text: '✓',
          color: C.WHITE,
          size: 10,
          weight: BOLD,
        });
      }
    });
  });

  const kbBottom = kbY + headH + 8 + colBgH; // bottom of column backgrounds

  // ===================== FOOTER STRIP ===================================
  const footY = 730;
  const footH = 150;
  const halfW = 740;
  const capX = 40;
  const metX = 40 + halfW + 40; // 820

  // ---- TEAM CAPACITY card ----
  shape({
    x: capX,
    y: footY,
    w: halfW,
    h: footH,
    fill: C.CARD,
    stroke: C.LINE,
    strokeWidth: 1.5,
    radius: 0.02,
  });
  text({
    x: capX + 24,
    y: footY + 18,
    w: 400,
    text: 'TEAM CAPACITY',
    color: C.INK,
    size: 18,
    weight: BOLD,
  });
  shape({ x: capX + 24, y: footY + 46, w: 64, h: 3, fill: ACCENT });

  // column headers for the capacity list
  text({
    x: capX + 24,
    y: footY + 58,
    w: 240,
    text: 'MEMBER',
    color: C.MUTED,
    size: 11,
    weight: SEMI,
  });
  text({
    x: capX + 300,
    y: footY + 58,
    w: 240,
    text: 'ROLE',
    color: C.MUTED,
    size: 11,
    weight: SEMI,
  });
  text({
    x: capX + halfW - 120,
    y: footY + 58,
    w: 96,
    text: 'CAPACITY',
    color: C.MUTED,
    size: 11,
    weight: SEMI,
    align: 'right',
  });

  const members: [string, string, string, string][] = [
    ['A', 'Alex Kim', 'Frontend Engineer', '32h'],
    ['M', 'Morgan Diaz', 'Backend Engineer', '30h'],
    ['R', 'Riley Chen', 'Product Designer', '24h'],
    ['S', 'Sam Patel', 'QA Engineer', '28h'],
  ];

  members.forEach((m, r) => {
    const [initial, name, role, cap] = m;
    const ry = footY + 80 + r * 17;
    // avatar
    shape({
      x: capX + 24,
      y: ry,
      w: 14,
      h: 14,
      fill: avatarColors[r % avatarColors.length],
      shapeType: 'ellipse',
      text: initial,
      color: C.WHITE,
      size: 8,
      weight: BOLD,
    });
    text({
      x: capX + 46,
      y: ry - 1,
      w: 240,
      text: name,
      color: C.INK,
      size: 12,
      weight: SEMI,
    });
    text({
      x: capX + 300,
      y: ry - 1,
      w: 300,
      text: role,
      color: C.MUTED,
      size: 12,
    });
    text({
      x: capX + halfW - 120,
      y: ry - 1,
      w: 96,
      text: cap,
      color: ACCENT,
      size: 12,
      weight: BOLD,
      align: 'right',
    });
  });

  // ---- SPRINT METRICS card ----
  shape({
    x: metX,
    y: footY,
    w: halfW,
    h: footH,
    fill: C.BLACK,
    radius: 0.06,
  });
  text({
    x: metX + 24,
    y: footY + 18,
    w: 400,
    text: 'SPRINT METRICS',
    color: ACCENT,
    size: 18,
    weight: BOLD,
  });
  shape({ x: metX + 24, y: footY + 46, w: 64, h: 3, fill: ACCENT });

  const stats: [string, string][] = [
    ['26', 'COMMITTED'],
    ['24', 'VELOCITY (AVG)'],
    ['3', 'CARRY-OVER'],
  ];
  const statBlockW = (halfW - 48) / 3;
  stats.forEach((s, i) => {
    const [num, label] = s;
    const sx = metX + 24 + i * statBlockW;
    text({
      x: sx,
      y: footY + 66,
      w: statBlockW - 16,
      text: num,
      color: C.WHITE,
      size: 40,
      weight: BOLD,
    });
    text({
      x: sx,
      y: footY + 118,
      w: statBlockW - 16,
      text: label,
      color: C.MUTED,
      size: 11,
      weight: SEMI,
    });
  });

  const boardBottom = Math.max(kbBottom, footY + footH);

  // ---- wrap everything in a named frame ----
  const { frame } = kit;
  frame('Sprint Planning', -30, -30, 1600 + 60, boardBottom + 60);
};
