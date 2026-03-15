import { Loader2 } from "lucide-react";

import { Logo } from "@/components/shared/logo";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5 rounded-[30px] border border-border/60 bg-card/90 px-10 py-12 shadow-[var(--shadow-md)] backdrop-blur">
        <Logo size="lg" />
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Preparing the workspace surface</span>
        </div>
      </div>
    </div>
  );
}
