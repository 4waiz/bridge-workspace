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
 * Builds the "AI Flow Builder" board onto a freshly-created edgeless surface.
 *
 * A left-to-right node pipeline (INPUT -> STEPS -> OUTPUT) wired together with
 * amber connector arrows, plus a decision diamond that branches to a refine
 * loop, and three reference panels (models / variables / guardrails). Every
 * element is a real editable canvas object so users can rewire the flow.
 */
export const buildAiFlowBuilderBoard: TemplateBuilder = (doc, surfaceId) => {
  const kit = createCanvasKit(doc, surfaceId);
  if (!kit) return;
  const { C, TINTS, shape, text, connector, frame } = kit;

  const ACCENT = C.AMBER;
  const ACCENT_TINT = TINTS.AMBER;

  // ===================== HEADER ==========================================
  shape({ x: 0, y: 0, w: 1600, h: 140, fill: C.BLACK });
  text({
    x: 40,
    y: 28,
    w: 780,
    text: 'AI FLOW BUILDER',
    color: C.WHITE,
    size: 44,
    weight: BOLD,
  });
  shape({ x: 44, y: 82, w: 130, h: 4, fill: ACCENT });
  text({
    x: 42,
    y: 96,
    w: 520,
    text: 'INPUT  →  STEPS  →  OUTPUT',
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
  field(1100, 'FLOW:  __');
  field(1340, 'MODEL:  __');

  // ===================== PIPELINE =========================================
  // A horizontal chain of node cards connected by amber arrows.
  const nodeY = 282; // top of each rectangular node
  const nodeH = 96;
  const nodeW = 200;
  const nodeMidY = nodeY + nodeH / 2; // vertical centre line of the chain (330)

  // node x positions (200 wide, ~70px gaps)
  const xInput = 40;
  const xPrompt = 310;
  const xTool = 580;
  const xDiamond = 850;
  const diamondW = 120;
  const diamondH = 120;
  const diamondY = nodeMidY - diamondH / 2; // 270
  const xOutput = 1040;

  // -- helper: draw a rectangular node card with type label + title + example
  const node = (
    x: number,
    opts: {
      label: string;
      title: string;
      example: string;
      fill: string;
      stroke: string;
      labelColor: string;
      titleColor: string;
      exampleColor: string;
    }
  ) => {
    shape({
      x,
      y: nodeY,
      w: nodeW,
      h: nodeH,
      fill: opts.fill,
      stroke: opts.stroke,
      strokeWidth: 1.5,
      radius: 0.06,
    });
    text({
      x: x + 16,
      y: nodeY + 14,
      w: nodeW - 32,
      text: opts.label,
      color: opts.labelColor,
      size: 10,
      weight: BOLD,
    });
    text({
      x: x + 16,
      y: nodeY + 32,
      w: nodeW - 32,
      text: opts.title,
      color: opts.titleColor,
      size: 15,
      weight: BOLD,
    });
    text({
      x: x + 16,
      y: nodeY + 62,
      w: nodeW - 32,
      text: opts.example,
      color: opts.exampleColor,
      size: 12,
      weight: REG,
    });
  };

  // a) TRIGGER / INPUT
  node(xInput, {
    label: 'INPUT',
    title: 'TRIGGER / INPUT',
    example: 'User message',
    fill: ACCENT_TINT,
    stroke: ACCENT,
    labelColor: ACCENT,
    titleColor: C.BLACK,
    exampleColor: C.INK,
  });

  // b) PROMPT
  node(xPrompt, {
    label: 'LLM STEP',
    title: 'PROMPT',
    example: 'Draft reply',
    fill: C.CARD,
    stroke: C.LINE,
    labelColor: C.MUTED,
    titleColor: C.BLACK,
    exampleColor: C.INK,
  });

  // c) TOOL CALL
  node(xTool, {
    label: 'ACTION',
    title: 'TOOL CALL',
    example: 'Search docs',
    fill: C.CARD,
    stroke: C.LINE,
    labelColor: C.MUTED,
    titleColor: C.BLACK,
    exampleColor: C.INK,
  });

  // d) DECISION diamond
  shape({
    x: xDiamond,
    y: diamondY,
    w: diamondW,
    h: diamondH,
    fill: ACCENT_TINT,
    stroke: ACCENT,
    strokeWidth: 1.5,
    shapeType: 'diamond',
    text: 'OK?',
    color: C.BLACK,
    size: 16,
    weight: BOLD,
  });

  // e) OUTPUT
  shape({
    x: xOutput,
    y: nodeY,
    w: nodeW,
    h: nodeH,
    fill: C.BLACK,
    radius: 0.06,
  });
  text({
    x: xOutput + 16,
    y: nodeY + 14,
    w: nodeW - 32,
    text: 'OUTPUT',
    color: ACCENT,
    size: 10,
    weight: BOLD,
  });
  text({
    x: xOutput + 16,
    y: nodeY + 32,
    w: nodeW - 32,
    text: 'OUTPUT',
    color: C.WHITE,
    size: 15,
    weight: BOLD,
  });
  text({
    x: xOutput + 16,
    y: nodeY + 62,
    w: nodeW - 32,
    text: 'Send / save',
    color: C.LINE,
    size: 12,
    weight: REG,
  });

  // -- connectors along the main chain (amber arrows) --------------------
  const arrow = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    mode: number,
    label?: string
  ) =>
    connector({
      x1,
      y1,
      x2,
      y2,
      stroke: ACCENT,
      strokeWidth: 2.5,
      mode,
      arrow: true,
      text: label,
    });

  // INPUT -> PROMPT
  arrow(xInput + nodeW, nodeMidY, xPrompt, nodeMidY, LINE_MODE.STRAIGHT);
  // PROMPT -> TOOL CALL
  arrow(xPrompt + nodeW, nodeMidY, xTool, nodeMidY, LINE_MODE.STRAIGHT);
  // TOOL CALL -> DECISION (left vertex of diamond)
  arrow(xTool + nodeW, nodeMidY, xDiamond, nodeMidY, LINE_MODE.STRAIGHT);
  // DECISION -> OUTPUT (right vertex -> output left edge), branch "yes"
  arrow(
    xDiamond + diamondW,
    nodeMidY,
    xOutput,
    nodeMidY,
    LINE_MODE.STRAIGHT,
    'yes'
  );

  // -- refine loop (the "no" branch) -------------------------------------
  // REFINE node sits below the main line; the diamond's bottom vertex elbows
  // down into it, and it elbows back up into the PROMPT node.
  const refineW = 200;
  const refineH = 72;
  const refineX = xPrompt; // sits under the PROMPT node
  const refineY = 470;
  shape({
    x: refineX,
    y: refineY,
    w: refineW,
    h: refineH,
    fill: C.CARD,
    stroke: ACCENT,
    strokeWidth: 1.5,
    dashed: true,
    radius: 0.06,
  });
  text({
    x: refineX + 16,
    y: refineY + 12,
    w: refineW - 32,
    text: 'LOOP',
    color: ACCENT,
    size: 10,
    weight: BOLD,
  });
  text({
    x: refineX + 16,
    y: refineY + 30,
    w: refineW - 32,
    text: 'REFINE',
    color: C.BLACK,
    size: 15,
    weight: BOLD,
  });

  const refineMidX = refineX + refineW / 2;
  // DECISION bottom vertex -> REFINE (right side), labelled "no"
  arrow(
    xDiamond + diamondW / 2,
    diamondY + diamondH,
    refineX + refineW,
    refineY + refineH / 2,
    LINE_MODE.ELBOW,
    'no'
  );
  // REFINE (top) -> PROMPT (bottom), loops back into the prompt step
  arrow(refineMidX, refineY, refineMidX, nodeY + nodeH, LINE_MODE.ELBOW);

  // ===================== SIDE PANELS ======================================
  // Sits below the refine loop (which ends at y=542); its section header at
  // panelY-60 must clear that node.
  const panelY = 640;
  const panelH = 190;
  const panelW = 490;
  const panelGap = 25;
  const panelX = [40, 40 + panelW + panelGap, 40 + 2 * (panelW + panelGap)];

  // -- section header (number chip + accent bar) for the panels row
  shape({
    x: 40,
    y: panelY - 60,
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
    y: panelY - 60,
    w: 1428,
    h: 46,
    fill: ACCENT,
    text: '  FLOW CONFIG',
    color: C.WHITE,
    size: 18,
    weight: BOLD,
    align: 'left',
  });

  // -- generic panel with a title bar + a list of pill rows
  const panel = (x: number, title: string, rows: string[]) => {
    shape({
      x,
      y: panelY,
      w: panelW,
      h: panelH,
      fill: C.CARD,
      stroke: C.LINE,
      strokeWidth: 1.5,
      radius: 0.02,
    });
    text({
      x: x + 20,
      y: panelY + 18,
      w: panelW - 40,
      text: title,
      color: ACCENT,
      size: 15,
      weight: BOLD,
    });
    shape({ x: x + 20, y: panelY + 44, w: 56, h: 3, fill: ACCENT });

    rows.forEach((row, r) => {
      const py = panelY + 62 + r * 40;
      // pill background
      shape({
        x: x + 20,
        y: py,
        w: panelW - 40,
        h: 30,
        fill: C.TINT,
        radius: 0.3,
      });
      text({
        x: x + 36,
        y: py + 7,
        w: panelW - 72,
        text: row,
        color: C.INK,
        size: 13,
        weight: MED,
      });
    });
  };

  panel(panelX[0], 'MODELS', [
    'claude-opus  ·  primary',
    'claude-haiku  ·  fast / cheap',
    'fallback  ·  __',
  ]);
  panel(panelX[1], 'VARIABLES', [
    '{{user_message}}',
    '{{context_docs}}',
    '{{tone}}  ·  friendly',
  ]);
  panel(panelX[2], 'GUARDRAILS', [
    'Max retries  ·  2',
    'PII / secrets filter',
    'Require citation before send',
  ]);

  // ===================== FRAME ============================================
  // True bottom = panels bottom.
  const boardBottom = panelY + panelH; // 780
  frame('AI Flow Builder', -30, -30, 1600 + 60, boardBottom + 60);
};
