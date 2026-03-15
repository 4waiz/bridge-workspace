import Link from "next/link";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="soft-card mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-[2rem] px-8 py-10 md:px-12 md:py-14">
        <Logo size="lg" />
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground">
              <Sparkles className="size-3.5" />
              Route not found
            </div>
            <h1 className="max-w-2xl font-heading text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
              This workspace surface does not exist.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              The link may be outdated or the board was removed from the demo
              environment. Use the workspace home to continue exploring the app.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-border/60 bg-muted/55 p-6">
            <div className="space-y-4">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Continue here
              </h2>
              <Button asChild className="w-full justify-between rounded-2xl">
                <Link href="/dashboard">
                  Open dashboard
                  <LayoutGrid className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-between rounded-2xl"
              >
                <Link href="/">
                  Return to homepage
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
