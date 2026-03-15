"use client";

import { Star } from "lucide-react";

import { BoardActionMenu } from "@/components/dashboard/board-action-menu";
import { ClassificationBadge } from "@/components/shared/classification-badge";
import { CollaboratorStack } from "@/components/shared/collaborator-stack";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, resolveText } from "@/lib/utils";
import type { Board, User } from "@/types/app";
import { useI18n } from "@/components/shared/i18n-provider";

export function BoardTableRow({
  board,
  owner,
  users,
  onOpen,
  onRename,
  onDuplicate,
  onStarToggle,
  onArchive,
  onDelete,
  onSetClassification,
  onSetVisibility,
}: {
  board: Board;
  owner: User;
  users: User[];
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onStarToggle: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onSetClassification: (classification: Board["classification"]) => void;
  onSetVisibility: (visibility: Board["visibility"]) => void;
}) {
  const { locale } = useI18n();

  return (
    <tr className="border-b border-border/60 hover:bg-muted/35">
      <td className="px-4 py-4">
        <button
          className="text-left"
          onClick={onOpen}
        >
          <div className="font-semibold text-foreground">
            {resolveText(locale, board.title)}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {resolveText(locale, board.summary)}
          </div>
        </button>
      </td>
      <td className="px-4 py-4">
        <ClassificationBadge classification={board.classification} />
      </td>
      <td className="px-4 py-4 text-sm font-medium text-foreground">{owner.name}</td>
      <td className="px-4 py-4 text-sm text-muted-foreground">
        {formatRelativeTime(board.modifiedAt, locale)}
      </td>
      <td className="px-4 py-4">
        <CollaboratorStack users={users} />
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onStarToggle}>
            <Star
              className={`size-4 ${board.starred ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </Button>
          <BoardActionMenu
            board={board}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            onDelete={onDelete}
            onSetClassification={onSetClassification}
            onSetVisibility={onSetVisibility}
          />
        </div>
      </td>
    </tr>
  );
}
