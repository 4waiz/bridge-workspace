"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eraser,
  Hand,
  ImagePlus,
  Maximize2,
  MessageSquare,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  Presentation,
  Redo2,
  Square,
  StickyNote,
  TextCursorInput,
  Undo2,
} from "lucide-react";
import { DefaultMinimap, Tldraw, type Editor } from "tldraw";
import { toast } from "sonner";

import { InspectorPanel } from "@/components/board/inspector-panel";
import { PresentationMode } from "@/components/board/presentation-mode";
import { CollaboratorStack } from "@/components/shared/collaborator-stack";
import { ClassificationBadge } from "@/components/shared/classification-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useI18n } from "@/components/shared/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  exportBoard,
  generateExecutiveBrief,
  insertArrow,
  insertFrame,
  insertGeo,
  insertImages,
  insertLine,
  insertSticky,
  insertText,
  seedBoard,
} from "@/lib/board-utils";
import { createId, resolveText } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { useWorkspaceStore } from "@/store/workspace-store";

function CanvasExtras() {
  return (
    <div className="pointer-events-none absolute right-4 bottom-4 z-30 hidden h-28 w-44 overflow-hidden rounded-[1.4rem] border border-border/70 bg-card/90 shadow-[var(--shadow-sm)] lg:block">
      <DefaultMinimap />
    </div>
  );
}

export function BoardWorkspace({ boardId }: { boardId: string }) {
  const board = useWorkspaceStore((state) =>
    state.boards.find((entry) => entry.id === boardId),
  );
  const { locale } = useI18n();
  const users = useWorkspaceStore((state) => state.users);
  const currentUserId = useWorkspaceStore((state) => state.currentUserId);
  const renameBoard = useWorkspaceStore((state) => state.renameBoard);
  const updateBoardSnapshot = useWorkspaceStore((state) => state.updateBoardSnapshot);
  const setBoardBrief = useWorkspaceStore((state) => state.setBoardBrief);
  const addBoardComment = useWorkspaceStore((state) => state.addBoardComment);
  const setBoardClassification = useWorkspaceStore((state) => state.setBoardClassification);
  const setBoardVisibility = useWorkspaceStore((state) => state.setBoardVisibility);
  const hydrated = useWorkspaceStore((state) => state.hydrated);
  const setBoardActions = useUiStore((state) => state.setBoardActions);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [inspectorTab, setInspectorTab] = useState("details");
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const autosaveTimeout = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const currentUser = users.find((user) => user.id === currentUserId) ?? users[0];

  useEffect(() => {
    if (!editor) return;
    setBoardActions({
      createSticky: () => insertSticky(editor),
      createText: () => insertText(editor),
      createShape: (shape) => {
        if (shape === "rectangle") insertGeo(editor, "rectangle", "Decision");
        if (shape === "ellipse") insertGeo(editor, "ellipse", "Focus area");
        if (shape === "diamond") insertGeo(editor, "diamond", "Decision point");
        if (shape === "arrow") insertArrow(editor);
        if (shape === "line") insertLine(editor);
        if (shape === "frame") insertFrame(editor);
      },
      zoomToFit: () => editor.zoomToFit(),
    });

    return () => setBoardActions(null);
  }, [editor, setBoardActions]);

  const boardUsers = useMemo(() => {
    if (!board) return [];
    return users.filter((user) => board.collaboratorIds.includes(user.id));
  }, [board, users]);

  const toolButtons = [
    { icon: MousePointer2, label: "Select", key: "select" },
    { icon: Hand, label: "Pan", key: "hand" },
    { icon: StickyNote, label: "Sticky", key: "sticky" },
    { icon: TextCursorInput, label: "Text", key: "text" },
    { icon: Square, label: "Rectangle", key: "rectangle" },
    { icon: ArrowRight, label: "Arrow", key: "arrow" },
    { icon: Pencil, label: "Draw", key: "draw" },
    { icon: Eraser, label: "Eraser", key: "eraser" },
    { icon: Maximize2, label: "Frame", key: "frame" },
    { icon: ImagePlus, label: "Image", key: "image" },
  ] as const;

  const handleToolAction = (tool: (typeof toolButtons)[number]["key"]) => {
    if (!editor) return;
    if (tool === "select") editor.setCurrentTool("select");
    if (tool === "hand") editor.setCurrentTool("hand");
    if (tool === "sticky") insertSticky(editor);
    if (tool === "text") insertText(editor);
    if (tool === "rectangle") insertGeo(editor, "rectangle", "Decision");
    if (tool === "arrow") insertArrow(editor);
    if (tool === "draw") editor.setCurrentTool("draw");
    if (tool === "eraser") editor.setCurrentTool("eraser");
    if (tool === "frame") insertFrame(editor);
    if (tool === "image") imageInputRef.current?.click();
  };

  if (!hydrated) {
    return (
      <div className="p-6">
        <div className="h-[80vh] animate-pulse rounded-[2rem] border border-border/70 bg-muted/45" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="p-6">
        <EmptyState
          icon={StickyNote}
          title="Board not found"
          description="The requested board could not be found in local demo storage."
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 px-4 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
          </Button>
          <input
            key={`${board.id}-${locale}`}
            className="min-w-[280px] border-none bg-transparent font-heading text-3xl font-black outline-none"
            defaultValue={board.title[locale]}
            onBlur={(event) =>
              renameBoard(board.id, {
                ...board.title,
                [locale]: event.currentTarget.value || board.title[locale],
              })
            }
          />
          <ClassificationBadge classification={board.classification} />
          <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {saveState === "saving" ? "Autosaving" : "Saved locally"}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CollaboratorStack users={boardUsers} />
          <Button variant="outline" className="rounded-full" onClick={() => setInspectorTab("comments")}>
            <MessageSquare className="size-4" />
            Comments
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => setInspectorTab("activity")}>
            Activity
          </Button>
          <Button
            className="rounded-full"
            onClick={() => {
              if (!editor) return;
              const brief = generateExecutiveBrief(editor, board);
              setBoardBrief(board.id, brief);
              setInspectorTab("brief");
              toast.success("Executive brief generated");
            }}
          >
            Executive brief
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => setPresentationOpen(true)}>
            <Presentation className="size-4" />
            Present
          </Button>
        </div>
      </div>

      <div className="grid flex-1 gap-4 px-4 py-4 md:px-6 xl:grid-cols-[72px_1fr_340px]">
        <div className="flex flex-row gap-2 xl:flex-col">
          {toolButtons.map((tool) => (
            <Button
              key={tool.label}
              variant="outline"
              size="icon"
              className="rounded-2xl"
              onClick={() => handleToolAction(tool.key)}
              title={tool.label}
            >
              <tool.icon className="size-4" />
            </Button>
          ))}

          <div className="mt-auto flex gap-2 xl:flex-col">
            <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => editor?.undo()}>
              <Undo2 className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-2xl" onClick={() => editor?.redo()}>
              <Redo2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="relative min-h-[70vh] overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[var(--shadow-sm)]">
          <ContextMenu>
            <ContextMenuTrigger className="block h-full">
              <Tldraw
                hideUi
                onMount={(mountedEditor) => {
                  setEditor(mountedEditor);
                  seedBoard(mountedEditor, board);
                  const unsubscribe = mountedEditor.store.listen(() => {
                    setSaveState("saving");
                    setZoom(Math.round(mountedEditor.getZoomLevel() * 100));
                    if (autosaveTimeout.current) {
                      window.clearTimeout(autosaveTimeout.current);
                    }
                    autosaveTimeout.current = window.setTimeout(() => {
                      updateBoardSnapshot(board.id, mountedEditor.getSnapshot());
                      setSaveState("saved");
                    }, 700);
                  });
                  return () => unsubscribe();
                }}
              >
                <CanvasExtras />
              </Tldraw>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => editor?.duplicateShapes(editor.getSelectedShapes())}>
                Duplicate
              </ContextMenuItem>
              <ContextMenuItem onClick={() => editor?.bringForward(editor.getSelectedShapes())}>
                Bring forward
              </ContextMenuItem>
              <ContextMenuItem onClick={() => editor?.sendToBack(editor.getSelectedShapes())}>
                Send to back
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => editor?.alignShapes(editor.getSelectedShapes(), "left")}>
                Align left
              </ContextMenuItem>
              <ContextMenuItem onClick={() => editor?.distributeShapes(editor.getSelectedShapes(), "horizontal")}>
                Distribute horizontally
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-destructive" onClick={() => editor?.deleteShapes(editor.getSelectedShapes())}>
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/70 bg-card/92 px-3 py-2 shadow-[var(--shadow-sm)]">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => editor?.zoomOut()}>
                <Minus className="size-4" />
              </Button>
              <div className="min-w-16 text-center text-sm font-semibold text-foreground">
                {zoom}%
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => editor?.zoomIn()}>
                <Plus className="size-4" />
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => editor?.zoomToFit()}>
                Fit
              </Button>
            </div>
          </div>
        </div>

        <div className="min-h-[70vh]">
          <InspectorPanel
            board={board}
            locale={locale}
            users={users}
            editor={editor}
            brief={board.brief}
            tab={inspectorTab}
            onTabChange={setInspectorTab}
            onGenerateBrief={() => {
              if (!editor) return;
              const brief = generateExecutiveBrief(editor, board);
              setBoardBrief(board.id, brief);
            }}
            onSetClassification={(classification) => setBoardClassification(board.id, classification)}
            onSetVisibility={(visibility) => setBoardVisibility(board.id, visibility)}
            onAddComment={(text) => {
              addBoardComment(board.id, {
                id: createId("comment"),
                authorId: currentUser.id,
                createdAt: new Date().toISOString(),
                text: { en: text, ar: text },
                resolved: false,
              });
              if (editor) insertSticky(editor, `Comment\n${text}`);
            }}
            onExport={(format) => {
              if (!editor) return;
              exportBoard(editor, resolveText(locale, board.title), format);
            }}
          />
        </div>
      </div>

      <PresentationMode open={presentationOpen} editor={editor} onClose={() => setPresentationOpen(false)} />

      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={async (event) => {
          if (!editor || !event.target.files?.length) return;
          await insertImages(editor, event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
