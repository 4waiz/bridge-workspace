"use client";

import { Languages } from "lucide-react";

import { useI18n } from "@/components/shared/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={cn("inline-flex items-center rounded-full border border-border/70 bg-card p-1 shadow-[var(--shadow-xs)]", className)}>
      <Button
        variant={locale === "en" ? "default" : "ghost"}
        size="sm"
        className="rounded-full px-3"
        onClick={() => setLocale("en")}
      >
        <Languages className="size-3.5" />
        EN
      </Button>
      <Button
        variant={locale === "ar" ? "default" : "ghost"}
        size="sm"
        className="rounded-full px-3"
        onClick={() => setLocale("ar")}
      >
        AR
      </Button>
    </div>
  );
}
