import { type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/70 px-6 py-16 text-center shadow-[var(--shadow-xs)]">
      <div className="mb-5 rounded-3xl bg-accent p-4 text-accent-foreground">
        <Icon className="size-8" />
      </div>
      <h3 className="font-heading text-2xl font-bold text-foreground">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
