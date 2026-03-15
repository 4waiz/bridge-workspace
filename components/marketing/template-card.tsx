"use client";

import { ArrowRight } from "lucide-react";

import { useI18n } from "@/components/shared/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveText } from "@/lib/utils";
import type { LocalizedText, TemplateCategory } from "@/types/app";

export function TemplateCard({
  name,
  description,
  category,
  ctaLabel,
  onClick,
}: {
  name: LocalizedText;
  description: LocalizedText;
  category: TemplateCategory;
  ctaLabel: string;
  onClick?: () => void;
}) {
  const { locale } = useI18n();

  return (
    <div className="rounded-[1.8rem] border border-border/70 bg-card p-6 shadow-[var(--shadow-sm)]">
      <Badge variant="secondary">{category}</Badge>
      <h3 className="mt-4 font-heading text-2xl font-bold text-foreground">
        {resolveText(locale, name)}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {resolveText(locale, description)}
      </p>
      <Button variant="ghost" className="mt-5 px-0" onClick={onClick}>
        {ctaLabel}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
