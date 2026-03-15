"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { BoardCard } from "@/components/dashboard/board-card";
import { BoardTableRow } from "@/components/dashboard/board-table-row";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { AppShell } from "@/components/shared/app-shell";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingSkeletons } from "@/components/shared/loading-skeletons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/shared/i18n-provider";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { Board, ClassificationLevel } from "@/types/app";
import { formatDate, groupByMonth, resolveText } from "@/lib/utils";

type SortOption = "modified" | "title" | "owner";

const FILTER_STORAGE_KEY = "edge-dashboard-filters";

function loadStoredFilters() {
  if (typeof window === "undefined") {
    return {
      search: "",
      classification: "all" as ClassificationLevel | "all",
      sort: "modified" as SortOption,
    };
  }

  const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
  if (!raw) {
    return {
      search: "",
      classification: "all" as ClassificationLevel | "all",
      sort: "modified" as SortOption,
    };
  }

  const parsed = JSON.parse(raw) as {
    search?: string;
    classification?: ClassificationLevel | "all";
    sort?: SortOption;
  };

  return {
    search: parsed.search ?? "",
    classification: parsed.classification ?? "all",
    sort: parsed.sort ?? "modified",
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, messages } = useI18n();
  const hydrated = useWorkspaceStore((state) => state.hydrated);
  const boards = useWorkspaceStore((state) => state.boards);
  const templates = useWorkspaceStore((state) => state.templates);
  const users = useWorkspaceStore((state) => state.users);
  const collectionView = useWorkspaceStore((state) => state.preferences.collectionView);
  const setCollectionView = useWorkspaceStore((state) => state.setCollectionView);
  const createBoardFromTemplate = useWorkspaceStore((state) => state.createBoardFromTemplate);
  const createBoard = useWorkspaceStore((state) => state.createBoard);
  const renameBoard = useWorkspaceStore((state) => state.renameBoard);
  const duplicateBoard = useWorkspaceStore((state) => state.duplicateBoard);
  const toggleBoardStar = useWorkspaceStore((state) => state.toggleBoardStar);
  const archiveBoard = useWorkspaceStore((state) => state.archiveBoard);
  const deleteBoard = useWorkspaceStore((state) => state.deleteBoard);
  const setBoardClassification = useWorkspaceStore((state) => state.setBoardClassification);
  const setBoardVisibility = useWorkspaceStore((state) => state.setBoardVisibility);

  const [search, setSearch] = useState(() => loadStoredFilters().search);
  const [classification, setClassification] = useState<ClassificationLevel | "all">(
    () => loadStoredFilters().classification,
  );
  const [sort, setSort] = useState<SortOption>(() => loadStoredFilters().sort);
  const [renameTarget, setRenameTarget] = useState<Board | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Board | null>(null);

  const section = searchParams.get("view") ?? "dashboard";

  useEffect(() => {
    window.localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ search, classification, sort }),
    );
  }, [search, classification, sort]);

  const filteredBoards = useMemo(() => {
    let nextBoards = boards.filter((board) =>
      section === "trash" ? board.status === "trash" : board.status === "active",
    );

    if (section === "starred") {
      nextBoards = nextBoards.filter((board) => board.starred);
    }
    if (section === "shared") {
      nextBoards = nextBoards.filter((board) => board.visibility === "shared");
    }
    if (section === "recent") {
      nextBoards = [...nextBoards].sort(
        (a, b) => +new Date(b.modifiedAt) - +new Date(a.modifiedAt),
      );
    }

    if (classification !== "all") {
      nextBoards = nextBoards.filter((board) => board.classification === classification);
    }

    if (search) {
      const query = search.toLowerCase();
      nextBoards = nextBoards.filter((board) => {
        const haystack = [
          board.title.en,
          board.title.ar,
          board.summary.en,
          board.summary.ar,
          ...board.tags.map((tag) => tag.en),
          ...board.tags.map((tag) => tag.ar),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    if (sort === "modified") {
      nextBoards = [...nextBoards].sort(
        (a, b) => +new Date(b.modifiedAt) - +new Date(a.modifiedAt),
      );
    }
    if (sort === "title") {
      nextBoards = [...nextBoards].sort((a, b) =>
        resolveText(locale, a.title).localeCompare(resolveText(locale, b.title)),
      );
    }
    if (sort === "owner") {
      nextBoards = [...nextBoards].sort((a, b) => {
        const ownerA = users.find((user) => user.id === a.ownerId)?.name ?? "";
        const ownerB = users.find((user) => user.id === b.ownerId)?.name ?? "";
        return ownerA.localeCompare(ownerB);
      });
    }

    return nextBoards;
  }, [boards, classification, locale, search, section, sort, users]);

  const groupedTimeline = useMemo(() => {
    return filteredBoards.reduce<Record<string, Board[]>>((acc, board) => {
      const key = groupByMonth(board.modifiedAt);
      acc[key] = [...(acc[key] ?? []), board];
      return acc;
    }, {});
  }, [filteredBoards]);

  const handleCreateBoard = () => {
    const boardId = createBoard({
      title: { en: "New Board", ar: "لوحة جديدة" },
      summary: {
        en: "A fresh workspace surface ready for planning and execution.",
        ar: "سطح جديد جاهز للتخطيط والتنفيذ.",
      },
      tags: [{ en: "New", ar: "جديد" }],
    });
    router.push(`/boards/${boardId}`);
  };

  if (!hydrated) {
    return (
      <AppShell current="dashboard" search={search} onSearchChange={setSearch}>
        <LoadingSkeletons rows={5} />
      </AppShell>
    );
  }

  return (
    <AppShell current="dashboard" search={search} onSearchChange={setSearch}>
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {messages.dashboard.templatesRail}
            </div>
            <h1 className="mt-2 font-heading text-4xl font-black tracking-tight text-foreground">
              {messages.common.dashboard}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Open boards, adjust classification, and move from template launch to active execution without leaving the workspace shell.
            </p>
          </div>
          <Button className="rounded-full" onClick={handleCreateBoard}>
            <Plus className="size-4" />
            {messages.common.createBoard}
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {templates.slice(0, 6).map((template) => (
            <button
              key={template.id}
              className="min-w-[260px] rounded-[1.8rem] border border-border/70 bg-card p-5 text-left shadow-[var(--shadow-sm)]"
              onClick={() => {
                const id = createBoardFromTemplate(template);
                toast.success(resolveText(locale, template.name));
                router.push(`/boards/${id}`);
              }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-foreground">
                <Sparkles className="size-3.5" />
                {template.category}
              </div>
              <div className="mt-4 font-heading text-2xl font-bold text-foreground">
                {resolveText(locale, template.name)}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {resolveText(locale, template.description)}
              </p>
            </button>
          ))}
        </div>

        <FilterBar
          classification={classification}
          setClassification={setClassification}
          sort={sort}
          setSort={(value) => setSort(value as SortOption)}
          view={collectionView}
          setView={setCollectionView}
        />

        {filteredBoards.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={messages.dashboard.emptyTitle}
            description={messages.dashboard.emptyDescription}
            action={{
              label: messages.common.createBoard,
              onClick: handleCreateBoard,
            }}
          />
        ) : collectionView === "grid" ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredBoards.map((board) => {
              const owner = users.find((user) => user.id === board.ownerId) ?? users[0];
              const boardUsers = users.filter((user) => board.onlineUserIds.includes(user.id));

              return (
                <BoardCard
                  key={board.id}
                  board={board}
                  owner={owner}
                  users={boardUsers}
                  onOpen={() => router.push(`/boards/${board.id}`)}
                  onRename={() => {
                    setRenameTarget(board);
                    setRenameValue(resolveText(locale, board.title));
                  }}
                  onDuplicate={() => {
                    const id = duplicateBoard(board.id);
                    if (id) toast.success("Board duplicated");
                  }}
                  onStarToggle={() => toggleBoardStar(board.id)}
                  onArchive={() => archiveBoard(board.id)}
                  onDelete={() => setDeleteTarget(board)}
                  onSetClassification={(value) => setBoardClassification(board.id, value)}
                  onSetVisibility={(value) => setBoardVisibility(board.id, value)}
                />
              );
            })}
          </div>
        ) : collectionView === "list" ? (
          <div className="overflow-hidden rounded-[1.8rem] border border-border/70 bg-card shadow-[var(--shadow-sm)]">
            <table className="min-w-full text-left">
              <thead className="bg-muted/45 text-sm text-muted-foreground">
                <tr>
                  <th className="px-4 py-4">{messages.dashboard.allBoards}</th>
                  <th className="px-4 py-4">{messages.dashboard.classification}</th>
                  <th className="px-4 py-4">{messages.dashboard.owner}</th>
                  <th className="px-4 py-4">{messages.dashboard.modified}</th>
                  <th className="px-4 py-4">{messages.dashboard.shared}</th>
                  <th className="px-4 py-4 text-right">{messages.common.settings}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoards.map((board) => {
                  const owner = users.find((user) => user.id === board.ownerId) ?? users[0];
                  const boardUsers = users.filter((user) => board.onlineUserIds.includes(user.id));

                  return (
                    <BoardTableRow
                      key={board.id}
                      board={board}
                      owner={owner}
                      users={boardUsers}
                      onOpen={() => router.push(`/boards/${board.id}`)}
                      onRename={() => {
                        setRenameTarget(board);
                        setRenameValue(resolveText(locale, board.title));
                      }}
                      onDuplicate={() => {
                        const id = duplicateBoard(board.id);
                        if (id) toast.success("Board duplicated");
                      }}
                      onStarToggle={() => toggleBoardStar(board.id)}
                      onArchive={() => archiveBoard(board.id)}
                      onDelete={() => setDeleteTarget(board)}
                      onSetClassification={(value) => setBoardClassification(board.id, value)}
                      onSetVisibility={(value) => setBoardVisibility(board.id, value)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTimeline).map(([label, boardsForMonth]) => (
              <div key={label} className="grid gap-4 lg:grid-cols-[180px_1fr]">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </div>
                <div className="space-y-4 border-l border-border/70 pl-6">
                  {boardsForMonth.map((board) => (
                    <button
                      key={board.id}
                      className="w-full rounded-[1.8rem] border border-border/70 bg-card p-5 text-left shadow-[var(--shadow-sm)]"
                      onClick={() => router.push(`/boards/${board.id}`)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-heading text-2xl font-bold text-foreground">
                            {resolveText(locale, board.title)}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {resolveText(locale, board.summary)}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{board.milestone ? resolveText(locale, board.milestone) : "Timeline view"}</div>
                          <div className="mt-1">{formatDate(board.modifiedAt, locale)}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(renameTarget)} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.common.rename}</DialogTitle>
          </DialogHeader>
          <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              {messages.common.cancel}
            </Button>
            <Button
              onClick={() => {
                if (!renameTarget) return;
                renameBoard(renameTarget.id, {
                  en: renameValue || renameTarget.title.en,
                  ar: renameValue || renameTarget.title.ar,
                });
                setRenameTarget(null);
              }}
            >
              {messages.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Move board to trash?"
        description="The board will remain available from the trash view in this local-first demo."
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteBoard(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </AppShell>
  );
}
