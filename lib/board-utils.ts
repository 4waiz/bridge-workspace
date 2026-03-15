"use client";

import {
  Editor,
  exportAs,
  renderPlaintextFromRichText,
  toRichText,
} from "tldraw";

import type { Board, ExecutiveBrief, LocalizedText } from "@/types/app";

const t = (en: string, ar: string): LocalizedText => ({ en, ar });

function getViewportCenter(editor: Editor) {
  const bounds = editor.getViewportPageBounds();
  return {
    x: bounds.x + bounds.w / 2,
    y: bounds.y + bounds.h / 2,
  };
}

export function insertSticky(editor: Editor, text = "New note") {
  const center = getViewportCenter(editor);
  editor.createShape({
    type: "note",
    x: center.x - 100,
    y: center.y - 60,
    props: {
      color: "orange",
      richText: toRichText(text),
    },
  });
}

export function insertText(editor: Editor, text = "Section title") {
  const center = getViewportCenter(editor);
  editor.createShape({
    type: "text",
    x: center.x - 160,
    y: center.y - 24,
    props: {
      color: "black",
      size: "xl",
      font: "sans",
      w: 360,
      autoSize: true,
      richText: toRichText(text),
    },
  });
}

export function insertGeo(
  editor: Editor,
  geo: "rectangle" | "ellipse" | "diamond",
  text: string,
) {
  const center = getViewportCenter(editor);
  editor.createShape({
    type: "geo",
    x: center.x - 140,
    y: center.y - 70,
    props: {
      geo,
      w: 280,
      h: 140,
      fill: "solid",
      color: "orange",
      richText: toRichText(text),
    },
  });
}

export function insertFrame(editor: Editor, name = "Section frame") {
  const center = getViewportCenter(editor);
  editor.createShape({
    type: "frame",
    x: center.x - 420,
    y: center.y - 260,
    props: {
      w: 840,
      h: 520,
      name,
      color: "orange",
    },
  });
}

export function insertArrow(editor: Editor) {
  editor.setCurrentTool("arrow");
}

export function insertLine(editor: Editor) {
  editor.setCurrentTool("line");
}

export async function insertImages(editor: Editor, files: FileList | File[]) {
  const center = getViewportCenter(editor);
  await editor.putExternalContent({
    type: "files",
    files: Array.from(files),
    point: center,
  });
}

export async function exportBoard(editor: Editor, name: string, format: "png" | "svg") {
  const ids = Array.from(editor.getCurrentPageShapeIds());
  await exportAs(editor, ids, {
    name,
    format,
    background: true,
  });
}

export function seedBoard(editor: Editor, board: Board) {
  if (board.snapshot) {
    editor.loadSnapshot(board.snapshot);
    return;
  }

  editor.createShape({
    type: "frame",
    x: 0,
    y: 0,
    props: {
      w: 1480,
      h: 840,
      name: board.title.en,
      color: "orange",
    },
  });

  editor.createShape({
    type: "text",
    x: 48,
    y: 48,
    props: {
      color: "black",
      size: "xl",
      font: "sans",
      w: 700,
      autoSize: true,
      richText: toRichText(board.title.en),
    },
  });

  editor.createShape({
    type: "text",
    x: 48,
    y: 112,
    props: {
      color: "grey",
      size: "m",
      font: "sans",
      w: 740,
      autoSize: true,
      richText: toRichText(board.summary.en),
    },
  });

  editor.createShape({
    type: "note",
    x: 72,
    y: 188,
    props: {
      color: "yellow",
      richText: toRichText(`Objective\n${board.summary.en}`),
    },
  });

  editor.createShape({
    type: "geo",
    x: 360,
    y: 200,
    props: {
      geo: "rectangle",
      w: 300,
      h: 130,
      fill: "solid",
      color: "orange",
      richText: toRichText(
        "Key decisions\nLock scope, confirm owners, and sequence governance gates.",
      ),
    },
  });

  editor.createShape({
    type: "geo",
    x: 700,
    y: 200,
    props: {
      geo: "rectangle",
      w: 300,
      h: 130,
      fill: "solid",
      color: "green",
      richText: toRichText(
        "Owners\nProgram lead, strategy director, delivery manager.",
      ),
    },
  });

  editor.createShape({
    type: "geo",
    x: 1040,
    y: 200,
    props: {
      geo: "rectangle",
      w: 300,
      h: 130,
      fill: "solid",
      color: "red",
      richText: toRichText(
        "Risks\nApproval timing, partner readiness, and architecture debt.",
      ),
    },
  });

  editor.createShape({
    type: "frame",
    x: 60,
    y: 430,
    props: {
      w: 1320,
      h: 320,
      name: "Execution path",
      color: "orange",
    },
  });

  editor.createShape({
    type: "geo",
    x: 108,
    y: 500,
    props: {
      geo: "rectangle",
      w: 240,
      h: 108,
      fill: "solid",
      color: "black",
      richText: toRichText("Frame the decision"),
    },
  });
  editor.createShape({
    type: "geo",
    x: 420,
    y: 500,
    props: {
      geo: "rectangle",
      w: 240,
      h: 108,
      fill: "solid",
      color: "orange",
      richText: toRichText("Validate constraints"),
    },
  });
  editor.createShape({
    type: "geo",
    x: 732,
    y: 500,
    props: {
      geo: "rectangle",
      w: 240,
      h: 108,
      fill: "solid",
      color: "blue",
      richText: toRichText("Confirm owners"),
    },
  });
  editor.createShape({
    type: "geo",
    x: 1044,
    y: 500,
    props: {
      geo: "rectangle",
      w: 240,
      h: 108,
      fill: "solid",
      color: "green",
      richText: toRichText("Publish next steps"),
    },
  });

  editor.createShape({
    type: "arrow",
    x: 342,
    y: 548,
    props: { start: { x: 0, y: 0 }, end: { x: 78, y: 0 } },
  });
  editor.createShape({
    type: "arrow",
    x: 654,
    y: 548,
    props: { start: { x: 0, y: 0 }, end: { x: 78, y: 0 } },
  });
  editor.createShape({
    type: "arrow",
    x: 966,
    y: 548,
    props: { start: { x: 0, y: 0 }, end: { x: 78, y: 0 } },
  });

  editor.zoomToFit({ animation: { duration: 240 } });
}

function collectBoardText(editor: Editor) {
  return editor
    .getCurrentPageShapes()
    .map((shape) => {
      if ("richText" in shape.props && shape.props.richText) {
        return renderPlaintextFromRichText(editor, shape.props.richText).trim();
      }
      return "";
    })
    .filter(Boolean);
}

export function generateExecutiveBrief(editor: Editor, board: Board): ExecutiveBrief {
  const text = collectBoardText(editor);
  const decisions = text.filter((item) => item.toLowerCase().includes("decision"));
  const risks = text.filter((item) => item.toLowerCase().includes("risk"));
  const owners = text.filter((item) => item.toLowerCase().includes("owner"));

  return {
    objective: [board.summary],
    decisions:
      decisions.length > 0
        ? decisions.slice(0, 3).map((item) => t(item, `قرار: ${item}`))
        : [
            t(
              "Lock scope and execution ownership before the next review.",
              "ثبّت النطاق وملكية التنفيذ قبل المراجعة القادمة.",
            ),
          ],
    risks:
      risks.length > 0
        ? risks.slice(0, 3).map((item) => t(item, `مخاطر: ${item}`))
        : [
            t(
              "Approval timing can delay delivery sequencing.",
              "قد يؤدي توقيت الاعتماد إلى تأخير تسلسل التسليم.",
            ),
          ],
    openItems: [
      t(
        "Confirm the milestone owner and escalation path.",
        "أكد مسؤول المرحلة ومسار التصعيد.",
      ),
      t(
        "Review unresolved comments before the next steering cadence.",
        "راجع التعليقات غير المحسومة قبل الإيقاع التوجيهي القادم.",
      ),
    ],
    owners:
      owners.length > 0
        ? owners.slice(0, 3).map((item) => t(item, `المالكون: ${item}`))
        : [
            t(
              "Program lead, strategy director, delivery manager.",
              "قائد البرنامج ومدير الاستراتيجية ومدير التسليم.",
            ),
          ],
    nextSteps: [
      t(
        "Generate the leadership narrative and publish the review frame.",
        "أنشئ السرد القيادي وانشر إطار المراجعة.",
      ),
      t(
        "Close open comments and lock the next milestone date.",
        "أغلق التعليقات المفتوحة وثبّت تاريخ المرحلة التالية.",
      ),
    ],
    generatedAt: new Date().toISOString(),
  };
}
