"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { useI18n } from "@/components/shared/i18n-provider";
import { cn, resolveText } from "@/lib/utils";
import type { LocalizedText } from "@/types/app";

type MegaMenuItem = {
  title: LocalizedText;
  description: LocalizedText;
  href: string;
};

export function MegaMenu({
  open,
  items,
  className,
}: {
  open: boolean;
  items: MegaMenuItem[];
  className?: string;
}) {
  const { locale } = useI18n();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "absolute top-full left-0 mt-4 w-[min(92vw,780px)] rounded-[2rem] border border-border/70 bg-card/96 p-4 shadow-[var(--shadow-lg)] backdrop-blur",
            className,
          )}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.href + item.title.en}
                href={item.href}
                className="group rounded-[1.5rem] border border-border/60 bg-muted/40 p-5 transition-colors hover:bg-accent"
              >
                <div className="font-heading text-lg font-bold text-foreground">
                  {resolveText(locale, item.title)}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {resolveText(locale, item.description)}
                </p>
              </Link>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
