"use client";

import { useState } from "react";
import { Download, Sparkles } from "lucide-react";
import type { Editor } from "tldraw";

import { ExecutiveBriefPanel } from "@/components/board/executive-brief-panel";
import { ClassificationBadge } from "@/components/shared/classification-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime, resolveText } from "@/lib/utils";
import type { Board, ExecutiveBrief, Locale, User } from "@/types/app";

function updateSelectedShapes(
  editor: Editor,
  props: Record<string, string>,
) {
  const selected = editor.getSelectedShapes();
  if (selected.length === 0) return;
  editor.updateShapes(
    selected.map((shape) => ({
      id: shape.id,
      type: shape.type,
      props,
    })) as never,
  );
}

export function InspectorPanel({
  board,
  locale,
  users,
  editor,
  brief,
  tab,
  onTabChange,
  onGenerateBrief,
  onSetClassification,
  onSetVisibility,
  onAddComment,
  onExport,
}: {
  board: Board;
  locale: Locale;
  users: User[];
  editor: Editor | null;
  brief: ExecutiveBrief | null;
  tab: string;
  onTabChange: (value: string) => void;
  onGenerateBrief: () => void;
  onSetClassification: (classification: Board["classification"]) => void;
  onSetVisibility: (visibility: Board["visibility"]) => void;
  onAddComment: (text: string) => void;
  onExport: (format: "png" | "svg") => void;
}) {
  const [commentText, setCommentText] = useState("");
  const selectedShapes = editor?.getSelectedShapes() ?? [];

  return (
    <div className="h-full rounded-[2rem] border border-border/70 bg-card shadow-[var(--shadow-sm)]">
      <Tabs value={tab} onValueChange={onTabChange} className="h-full">
        <div className="border-b border-border/70 p-4">
          <TabsList className="w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="brief">Brief</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>
        <div className="h-[calc(100%-73px)] overflow-y-auto p-4">
          <TabsContent value="details" className="space-y-4">
            <div className="rounded-[1.7rem] border border-border/70 bg-muted/45 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Selection
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">
                {selectedShapes.length} item(s) selected
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["orange", "green", "blue", "red", "black"].map((color) => (
                  <button
                    key={color}
                    className="size-9 rounded-full border border-border/70"
                    style={{ backgroundColor: color === "black" ? "#454B50" : color }}
                    onClick={() => editor && updateSelectedShapes(editor, { color })}
                  />
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => editor && updateSelectedShapes(editor, { fill: "solid" })}
                >
                  Solid fill
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => editor && updateSelectedShapes(editor, { size: "l" })}
                >
                  Large
                </Button>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-border/70 bg-muted/45 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Board details
                </div>
                <ClassificationBadge classification={board.classification} />
              </div>
              <div className="mt-4 grid gap-3">
                <Select value={board.classification} onValueChange={(value) => onSetClassification(value as Board["classification"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={board.visibility} onValueChange={(value) => onSetVisibility(value as Board["visibility"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="workspace">Workspace</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
                <div className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
                  {board.tags.map((tag) => resolveText(locale, tag)).join(" • ")}
                </div>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-border/70 bg-muted/45 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Export actions
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => onExport("png")}>
                  <Download className="size-4" />
                  PNG
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => onExport("svg")}>
                  <Download className="size-4" />
                  SVG
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="brief" className="space-y-4">
            <Button className="w-full rounded-full" onClick={onGenerateBrief}>
              <Sparkles className="size-4" />
              Generate executive brief
            </Button>
            <ExecutiveBriefPanel brief={brief} locale={locale} />
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Textarea
              placeholder="Add a comment pin for this board..."
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <Button
              className="w-full rounded-full"
              onClick={() => {
                if (!commentText.trim()) return;
                onAddComment(commentText.trim());
                setCommentText("");
              }}
            >
              Add comment pin
            </Button>
            <div className="grid gap-3">
              {board.comments.map((comment) => {
                const author = users.find((user) => user.id === comment.authorId);
                return (
                  <div
                    key={comment.id}
                    className="rounded-[1.7rem] border border-border/70 bg-muted/45 px-4 py-4"
                  >
                    <div className="font-semibold text-foreground">{author?.name ?? "User"}</div>
                    <div className="mt-2 text-sm text-foreground">
                      {resolveText(locale, comment.text)}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {formatRelativeTime(comment.createdAt, locale)}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-3">
            <div className="text-sm leading-6 text-muted-foreground">
              Board activity is recorded locally from edits, comments, and summary generation in this demo.
            </div>
            {board.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-[1.7rem] border border-border/70 bg-muted/45 px-4 py-4"
              >
                <div className="font-semibold text-foreground">
                  {resolveText(locale, comment.text)}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {formatRelativeTime(comment.createdAt, locale)}
                </div>
              </div>
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
