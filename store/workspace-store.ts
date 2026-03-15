"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createSeedState } from "@/lib/mock-data/seed";
import { createId } from "@/lib/utils";
import type {
  ActivityItem,
  Board,
  BoardComment,
  ClassificationLevel,
  CollectionView,
  ExecutiveBrief,
  Template,
  ThemeMode,
} from "@/types/app";

type WorkspaceStore = ReturnType<typeof createSeedState> & {
  hydrated: boolean;
  setHydrated: () => void;
  resetDemoState: () => void;
  setCollectionView: (view: CollectionView) => void;
  setThemeMode: (theme: ThemeMode) => void;
  setBoardDensity: (density: "comfortable" | "compact") => void;
  setBoardDefaults: (defaults: {
    classification: ClassificationLevel;
    visibility: Board["visibility"];
  }) => void;
  setNotificationPreference: (
    key: keyof ReturnType<typeof createSeedState>["preferences"]["notifications"],
    value: boolean,
  ) => void;
  updateBoard: (boardId: string, updater: Partial<Board>) => void;
  renameBoard: (boardId: string, title: Board["title"]) => void;
  createBoard: (
    payload: Pick<Board, "title" | "summary"> &
      Partial<Pick<Board, "classification" | "visibility" | "templateId" | "tags">>,
  ) => string;
  createBoardFromTemplate: (template: Template) => string;
  duplicateBoard: (boardId: string) => string | null;
  toggleBoardStar: (boardId: string) => void;
  archiveBoard: (boardId: string) => void;
  deleteBoard: (boardId: string) => void;
  restoreBoard: (boardId: string) => void;
  setBoardClassification: (boardId: string, classification: ClassificationLevel) => void;
  setBoardVisibility: (boardId: string, visibility: Board["visibility"]) => void;
  updateBoardSnapshot: (boardId: string, snapshot: Board["snapshot"]) => void;
  setBoardBrief: (boardId: string, brief: ExecutiveBrief) => void;
  addBoardComment: (boardId: string, comment: BoardComment) => void;
  addActivity: (entry: ActivityItem) => void;
  markNotificationRead: (notificationId: string) => void;
};

const seed = createSeedState();

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      ...seed,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      resetDemoState: () => set({ ...createSeedState(), hydrated: true }),
      setCollectionView: (collectionView) =>
        set((state) => ({
          preferences: { ...state.preferences, collectionView },
        })),
      setThemeMode: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),
      setBoardDensity: (boardDensity) =>
        set((state) => ({
          preferences: { ...state.preferences, boardDensity },
        })),
      setBoardDefaults: (boardDefaults) =>
        set((state) => ({
          preferences: { ...state.preferences, boardDefaults },
        })),
      setNotificationPreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            notifications: {
              ...state.preferences.notifications,
              [key]: value,
            },
          },
        })),
      updateBoard: (boardId, updater) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  ...updater,
                  modifiedAt: new Date().toISOString(),
                }
              : board,
          ),
        })),
      renameBoard: (boardId, title) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  title,
                  modifiedAt: new Date().toISOString(),
                }
              : board,
          ),
        })),
      createBoard: (payload) => {
        const id = createId("board");
        const now = new Date().toISOString();
        set((state) => ({
          boards: [
            {
              id,
              title: payload.title,
              summary: payload.summary,
              ownerId: state.currentUserId,
              collaboratorIds: [state.currentUserId],
              classification:
                payload.classification ?? state.preferences.boardDefaults.classification,
              visibility:
                payload.visibility ?? state.preferences.boardDefaults.visibility,
              tags: payload.tags ?? [],
              templateId: payload.templateId,
              modifiedAt: now,
              createdAt: now,
              starred: false,
              onlineUserIds: [state.currentUserId],
              status: "active",
              snapshot: null,
              comments: [],
              brief: null,
            },
            ...state.boards,
          ],
          preferences: { ...state.preferences, lastBoardId: id },
        }));
        return id;
      },
      createBoardFromTemplate: (template) =>
        get().createBoard({
          title: template.name,
          summary: template.description,
          templateId: template.id,
          tags: template.tags,
        }),
      duplicateBoard: (boardId) => {
        const source = get().boards.find((board) => board.id === boardId);
        if (!source) return null;
        const id = createId("board");
        const now = new Date().toISOString();
        set((state) => ({
          boards: [
            {
              ...source,
              id,
              title: {
                en: `${source.title.en} Copy`,
                ar: `${source.title.ar} نسخة`,
              },
              createdAt: now,
              modifiedAt: now,
              starred: false,
            },
            ...state.boards,
          ],
        }));
        return id;
      },
      toggleBoardStar: (boardId) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId ? { ...board, starred: !board.starred } : board,
          ),
        })),
      archiveBoard: (boardId) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId ? { ...board, status: "archived" } : board,
          ),
        })),
      deleteBoard: (boardId) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId ? { ...board, status: "trash" } : board,
          ),
        })),
      restoreBoard: (boardId) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId ? { ...board, status: "active" } : board,
          ),
        })),
      setBoardClassification: (boardId, classification) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId ? { ...board, classification } : board,
          ),
        })),
      setBoardVisibility: (boardId, visibility) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId ? { ...board, visibility } : board,
          ),
        })),
      updateBoardSnapshot: (boardId, snapshot) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? { ...board, snapshot, modifiedAt: new Date().toISOString() }
              : board,
          ),
        })),
      setBoardBrief: (boardId, brief) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? { ...board, brief, modifiedAt: new Date().toISOString() }
              : board,
          ),
        })),
      addBoardComment: (boardId, comment) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  comments: [comment, ...board.comments],
                  modifiedAt: new Date().toISOString(),
                }
              : board,
          ),
        })),
      addActivity: (entry) =>
        set((state) => ({
          activity: [entry, ...state.activity],
        })),
      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification,
          ),
        })),
    }),
    {
      name: "edge-workspace-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        workspace: state.workspace,
        users: state.users,
        boards: state.boards,
        templates: state.templates,
        notifications: state.notifications,
        activity: state.activity,
        preferences: state.preferences,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
