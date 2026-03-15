import Image from "next/image";

import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: {
    mark: 28,
    text: "text-sm",
  },
  md: {
    mark: 36,
    text: "text-base",
  },
  lg: {
    mark: 52,
    text: "text-xl",
  },
} as const;

export function Logo({ compact, size = "md", className }: LogoProps) {
  const config = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.png"
        alt="EDGE Workspace"
        width={config.mark}
        height={config.mark}
        className="rounded-2xl shadow-[var(--shadow-xs)]"
        priority={size === "lg"}
      />
      {compact ? null : (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-heading text-foreground font-extrabold tracking-[0.18em] uppercase",
              config.text,
            )}
          >
            EDGE
          </span>
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Workspace
          </span>
        </div>
      )}
    </div>
  );
}
