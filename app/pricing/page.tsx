"use client";

import Link from "next/link";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/mock-data/marketing-content";
import { resolveText } from "@/lib/utils";
import { useI18n } from "@/components/shared/i18n-provider";

export default function PricingPage() {
  const { locale } = useI18n();

  return (
    <div className="pb-12">
      <MarketingHeader />
      <main className="px-4 pt-10 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Plans
            </div>
            <h1 className="mt-3 font-heading text-5xl font-black tracking-tight text-foreground md:text-6xl">
              {locale === "ar" ? "خطط مبنية للتنفيذ المنضبط." : "Plans built for disciplined execution."}
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Choose a starting point for the demo and keep the architecture ready for a later enterprise backend.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-[2rem] border p-8 shadow-[var(--shadow-sm)] ${
                  plan.featured
                    ? "border-primary bg-card ring-2 ring-primary/15"
                    : "border-border/70 bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-heading text-2xl font-bold text-foreground">
                    {resolveText(locale, plan.name)}
                  </div>
                  {plan.featured ? (
                    <div className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground">
                      Popular
                    </div>
                  ) : null}
                </div>
                <div className="mt-6 font-heading text-5xl font-black text-foreground">
                  {plan.price}
                  {plan.price !== "Custom" ? <span className="text-lg font-semibold text-muted-foreground"> / seat</span> : null}
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {resolveText(locale, plan.description)}
                </p>
                <div className="mt-6 grid gap-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature.en}
                      className="rounded-2xl border border-border/70 bg-muted/45 px-4 py-3 text-sm font-semibold text-foreground"
                    >
                      {resolveText(locale, feature)}
                    </div>
                  ))}
                </div>
                <Button className="mt-8 w-full rounded-full" variant={plan.featured ? "default" : "outline"}>
                  {plan.price === "Custom" ? "Contact sales" : "Start now"}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[2.2rem] border border-border/70 bg-card/88 px-8 py-10 shadow-[var(--shadow-sm)]">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Logo />
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                  The current implementation is frontend-first, locally persistent, and structured for a Supabase-backed collaboration layer later.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-full">
                  <Link href="/dashboard">Open workspace</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/signup">Create account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
