"use client";

import { Star } from "lucide-react";

import { BoardActionMenu } from "@/components/dashboard/board-action-menu";
import { ClassificationBadge } from "@/components/shared/classification-badge";
import { CollaboratorStack } from "@/components/shared/collaborator-stack";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, resolveText } from "@/lib/utils";
import type { Board, User } from "@/types/app";
import { useI18n } from "@/components/shared/i18n-provider";

export function BoardCard({
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
    <div
      className="group rounded-[1.9rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-1"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <ClassificationBadge classification={board.classification} />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={(event) => {
              event.stopPropagation();
              onStarToggle();
            }}
          >
            <Star
              className={`size-4 ${board.starred ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </Button>
          <div onClick={(event) => event.stopPropagation()}>
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
        </div>
      </div>
      <h3 className="mt-5 font-heading text-2xl font-bold text-foreground">
        {resolveText(locale, board.title)}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {resolveText(locale, board.summary)}
      </p>
      <div className="mt-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Owner
          </div>
          <div className="mt-1 text-sm font-semibold text-foreground">{owner.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatRelativeTime(board.modifiedAt, locale)}
          </div>
        </div>
        <CollaboratorStack users={users} />
      </div>
    </div>
  );
}
