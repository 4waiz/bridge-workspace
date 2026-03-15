"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Board, ClassificationLevel } from "@/types/app";

export function BoardActionMenu({
  board,
  onRename,
  onDuplicate,
  onArchive,
  onDelete,
  onSetClassification,
  onSetVisibility,
}: {
  board: Board;
  onRename: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onSetClassification: (classification: ClassificationLevel) => void;
  onSetVisibility: (visibility: Board["visibility"]) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Board actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Classification</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={board.classification}>
              <DropdownMenuRadioItem onClick={() => onSetClassification("public")} value="public">
                Public
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem onClick={() => onSetClassification("internal")} value="internal">
                Internal
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem onClick={() => onSetClassification("restricted")} value="restricted">
                Restricted
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Visibility</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={board.visibility}>
              <DropdownMenuRadioItem onClick={() => onSetVisibility("private")} value="private">
                Private
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem onClick={() => onSetVisibility("workspace")} value="workspace">
                Workspace
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem onClick={() => onSetVisibility("shared")} value="shared">
                Shared
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
