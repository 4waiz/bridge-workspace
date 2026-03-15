"use client";

import { create } from "zustand";

import type { Locale } from "@/types/app";

type BoardCommandActions = {
  createSticky: () => void;
  createText: () => void;
  createShape: (shape: "rectangle" | "ellipse" | "diamond" | "arrow" | "line" | "frame") => void;
  zoomToFit: () => void;
};

type UiStore = {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  boardActions: BoardCommandActions | null;
  setBoardActions: (actions: BoardCommandActions | null) => void;
  pendingLocale: Locale | null;
  setPendingLocale: (locale: Locale | null) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  boardActions: null,
  setBoardActions: (boardActions) => set({ boardActions }),
  pendingLocale: null,
  setPendingLocale: (pendingLocale) => set({ pendingLocale }),
}));
