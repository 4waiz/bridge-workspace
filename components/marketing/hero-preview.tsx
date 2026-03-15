"use client";

import { motion } from "framer-motion";
import {
  CircleUserRound,
  LayoutGrid,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="overflow-hidden rounded-[2.2rem] border border-border/70 bg-card shadow-[var(--shadow-md)]"
    >
      <div className="grid min-h-[520px] grid-cols-[88px_1fr_280px]">
        <div className="border-r border-border/60 bg-[#f8f6f2] p-4">
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-card text-muted-foreground shadow-[var(--shadow-xs)]"
              >
                <LayoutGrid className="size-5" />
              </div>
            ))}
          </div>
        </div>
        <div className="premium-grid relative overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(244,244,242,0.96))] p-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute top-8 left-10 rounded-3xl border border-border/70 bg-[#fff8e1] px-4 py-3 shadow-[var(--shadow-sm)]"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a5a00]">
              Objective
            </div>
            <p className="mt-2 max-w-[170px] text-sm font-semibold text-[#5c4307]">
              Simplify portfolio direction for the next steering cycle.
            </p>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute top-24 right-12 rounded-3xl border border-border/70 bg-card px-5 py-4 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="size-4" />
              Executive brief
            </div>
            <div className="mt-3 grid gap-2">
              <div className="h-2.5 w-36 rounded-full bg-muted" />
              <div className="h-2.5 w-28 rounded-full bg-muted" />
              <div className="h-2.5 w-20 rounded-full bg-muted" />
            </div>
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute top-44 left-24 w-[480px] rounded-[1.8rem] border border-border/70 bg-card/96 p-5 shadow-[var(--shadow-md)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Strategy sprint canvas
                </div>
                <h3 className="mt-2 font-heading text-2xl font-bold text-foreground">
                  Program operating model
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CircleUserRound className="size-4" />
                7 active contributors
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                "Objective",
                "Decision lane",
                "Risks",
                "Dependencies",
                "Ownership",
                "Next actions",
              ].map((label, index) => (
                <div
                  key={label}
                  className={`rounded-3xl border border-border/70 p-4 ${
                    index % 3 === 0
                      ? "bg-[#fff4ed]"
                      : index % 3 === 1
                        ? "bg-card"
                        : "bg-[#f0faf8]"
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                  </div>
                  <div className="mt-3 grid gap-2">
                    <div className="h-2.5 rounded-full bg-muted" />
                    <div className="h-2.5 w-4/5 rounded-full bg-muted" />
                    <div className="h-2.5 w-3/5 rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute right-24 bottom-10 rounded-3xl border border-border/70 bg-[#eef7ff] px-4 py-3 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1d4ed8]">
              <MessageSquareText className="size-4" />
              Activity
            </div>
            <p className="mt-2 max-w-[180px] text-sm font-medium text-[#1e3a8a]">
              Decision owners were updated five minutes ago.
            </p>
          </motion.div>
        </div>
        <div className="border-l border-border/60 bg-[#faf9f6] p-5">
          <div className="rounded-[1.8rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-sm)]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Board snapshot
            </div>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl bg-muted p-4">
                <div className="h-2.5 w-2/3 rounded-full bg-card" />
                <div className="mt-2 h-2.5 w-full rounded-full bg-card" />
                <div className="mt-2 h-2.5 w-4/5 rounded-full bg-card" />
              </div>
              <div className="rounded-2xl border border-border/70 bg-[#fff4ed] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Restricted
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  Board classification visible in the shell, cards, and exports.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-[#f0faf8] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                  Summary ready
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  Executive brief can be generated from live board content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
