"use client";

import Link from "next/link";
import { Home, Settings, Sparkles, Star, Trash2, Users2, Clock3, PanelsTopLeft, BookOpen } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { SearchInput } from "@/components/shared/search-input";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/shared/i18n-provider";

const items = [
  { id: "dashboard", href: "/dashboard", icon: Home, labelKey: "home" as const },
  { id: "recent", href: "/dashboard?view=recent", icon: Clock3, labelKey: "recent" as const },
  { id: "starred", href: "/dashboard?view=starred", icon: Star, labelKey: "starred" as const },
  { id: "shared", href: "/dashboard?view=shared", icon: Users2, labelKey: "shared" as const },
  { id: "templates", href: "/templates", icon: Sparkles, labelKey: "templates" as const },
  { id: "spaces", href: "/dashboard?view=spaces", icon: PanelsTopLeft, labelKey: "spaces" as const },
  { id: "trash", href: "/dashboard?view=trash", icon: Trash2, labelKey: "trash" as const },
  { id: "settings", href: "/settings", icon: Settings, labelKey: "settings" as const },
];

export function SidebarNav({
  current,
  search,
  onSearchChange,
}: {
  current: string;
  search?: string;
  onSearchChange?: (value: string) => void;
}) {
  const { messages } = useI18n();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <Logo />
        <BookOpen className="size-5 text-muted-foreground" />
      </div>
      {onSearchChange ? (
        <SearchInput
          placeholder="Search by title or topic"
          value={search ?? ""}
          onChange={onSearchChange}
        />
      ) : null}
      <div className="grid gap-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            current === item.id ||
            (current === "templates" && item.id === "templates") ||
            (current === "settings" && item.id === "settings");

          const label =
            item.labelKey in messages.dashboard
              ? messages.dashboard[item.labelKey as keyof typeof messages.dashboard]
              : messages.common[item.labelKey as keyof typeof messages.common];

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-xs)]"
                  : "text-foreground/80 hover:bg-muted",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
