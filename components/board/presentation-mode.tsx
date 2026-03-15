"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { Editor } from "tldraw";

import { Button } from "@/components/ui/button";

export function PresentationMode({
  open,
  editor,
  onClose,
}: {
  open: boolean;
  editor: Editor | null;
  onClose: () => void;
}) {
  const frames = useMemo(() => {
    if (!editor) return [];
    return editor.getCurrentPageShapes().filter((shape) => shape.type === "frame");
  }, [editor]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open || !editor || frames.length === 0) return;
    const frame = frames[index];
    const bounds = editor.getShapePageBounds(frame.id);
    if (bounds) {
      editor.zoomToBounds(bounds, { animation: { duration: 220 }, inset: 36 });
    } else {
      editor.zoomToFit();
    }
  }, [editor, frames, index, open]);
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background/90 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Presentation mode
          </div>
          <div className="mt-1 font-heading text-2xl font-bold text-foreground">
            {((frames[index] as { props?: { name?: string } } | undefined)?.props?.name) ??
              "Frame review"}
          </div>
        </div>
        <Button variant="outline" className="rounded-full" onClick={onClose}>
          <X className="size-4" />
          Exit
        </Button>
      </div>
      <div className="flex flex-1 items-end justify-between p-4">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => setIndex((value) => Math.max(value - 1, 0))}
          disabled={index === 0}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <div className="rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-[var(--shadow-xs)]">
          {frames.length === 0 ? (
            <span className="inline-flex items-center gap-2">
              <Maximize2 className="size-4" />
              Add frame shapes to navigate sections.
            </span>
          ) : (
            `${index + 1} / ${frames.length}`
          )}
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => setIndex((value) => Math.min(value + 1, frames.length - 1))}
          disabled={index >= frames.length - 1}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
