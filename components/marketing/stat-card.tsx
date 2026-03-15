"use client";

import { useI18n } from "@/components/shared/i18n-provider";
import { resolveText } from "@/lib/utils";
import type { LocalizedText } from "@/types/app";

export function StatCard({
  value,
  label,
}: {
  value: string;
  label: LocalizedText;
}) {
  const { locale } = useI18n();

  return (
    <div className="rounded-[1.8rem] border border-border/70 bg-card/86 p-6 shadow-[var(--shadow-sm)]">
      <div className="font-heading text-4xl font-extrabold text-foreground">{value}</div>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">
        {resolveText(locale, label)}
      </div>
    </div>
  );
}
