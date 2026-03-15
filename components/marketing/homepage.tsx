"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Shield, Workflow } from "lucide-react";

import { HeroPreview } from "@/components/marketing/hero-preview";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { StatCard } from "@/components/marketing/stat-card";
import { TemplateCard } from "@/components/marketing/template-card";
import { useI18n } from "@/components/shared/i18n-provider";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { homepageContent } from "@/lib/mock-data/marketing-content";
import { resolveText } from "@/lib/utils";

export function Homepage() {
  const { locale } = useI18n();

  return (
    <div className="pb-10">
      <MarketingHeader />
      <main>
        <section className="px-4 pt-8 md:px-6 md:pt-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/88 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-[var(--shadow-xs)]">
                {resolveText(locale, homepageContent.hero.eyebrow)}
              </div>
              <div className="space-y-5">
                <h1 className="max-w-2xl font-heading text-5xl font-black leading-[1.02] tracking-tight text-foreground md:text-7xl">
                  {resolveText(locale, homepageContent.hero.title)}
                </h1>
                <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                  {resolveText(locale, homepageContent.hero.description)}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/dashboard">
                    {resolveText(locale, homepageContent.hero.primaryCta)}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/pricing">
                    {resolveText(locale, homepageContent.hero.secondaryCta)}
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {resolveText(locale, homepageContent.hero.callout)}
                </p>
                <LanguageToggle />
              </div>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section className="px-4 pt-12 md:px-6 md:pt-14">
          <div className="mx-auto max-w-7xl">
            <LogoCloud items={homepageContent.socialProof} />
          </div>
        </section>

        <section id="solutions" className="px-4 pt-20 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <h2 className="font-heading text-4xl font-black tracking-tight text-foreground md:text-5xl">
                Structured collaboration for teams that operate at scale.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Each surface is designed to reduce ambiguity, increase decision velocity, and keep executive context close to active work.
              </p>
            </div>
            <Tabs defaultValue={homepageContent.stories[0].id} className="mt-10">
              <TabsList className="w-full flex-wrap gap-2 rounded-[1.5rem] bg-transparent p-0">
                {homepageContent.stories.map((story) => (
                  <TabsTrigger
                    key={story.id}
                    value={story.id}
                    className="flex-none rounded-full border border-border/70 bg-card px-5 shadow-[var(--shadow-xs)] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {resolveText(locale, story.label)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {homepageContent.stories.map((story) => (
                <TabsContent key={story.id} value={story.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
                  >
                    <div className="rounded-[2rem] border border-border/70 bg-card p-8 shadow-[var(--shadow-sm)]">
                      <h3 className="font-heading text-3xl font-bold text-foreground">
                        {resolveText(locale, story.title)}
                      </h3>
                      <p className="mt-4 text-base leading-7 text-muted-foreground">
                        {resolveText(locale, story.description)}
                      </p>
                      <div className="mt-6 grid gap-3">
                        {story.bullets.map((bullet) => (
                          <div
                            key={bullet.en}
                            className="rounded-2xl border border-border/70 bg-muted/50 px-4 py-4 text-sm font-medium text-foreground"
                          >
                            {resolveText(locale, bullet)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 rounded-[2rem] border border-border/70 bg-card p-6 shadow-[var(--shadow-sm)] md:grid-cols-2">
                      {["Board shell", "Smart templates", "Team visibility", "Executive summary"].map(
                        (item, index) => (
                          <div
                            key={item}
                            className={`rounded-[1.7rem] border border-border/70 p-5 ${
                              index % 2 === 0 ? "bg-[#fff4ed]" : "bg-[#f3f8f8]"
                            }`}
                          >
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {item}
                            </div>
                            <div className="mt-4 h-2.5 w-2/3 rounded-full bg-card" />
                            <div className="mt-3 h-2.5 rounded-full bg-card" />
                            <div className="mt-3 h-2.5 w-4/5 rounded-full bg-card" />
                          </div>
                        ),
                      )}
                    </div>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        <section id="entities" className="px-4 pt-20 md:px-6">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-4">
            {homepageContent.capabilities.map((item) => (
              <div
                key={item.title.en}
                className="rounded-[1.8rem] border border-border/70 bg-card p-6 shadow-[var(--shadow-sm)]"
              >
                <h3 className="font-heading text-xl font-bold text-foreground">
                  {resolveText(locale, item.title)}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {resolveText(locale, item.description)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pt-20 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-4">
              {homepageContent.stats.map((item) => (
                <StatCard key={item.value + item.label.en} value={item.value} label={item.label} />
              ))}
            </div>
          </div>
        </section>

        <section id="media" className="px-4 pt-20 md:px-6">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-border/70 bg-card p-8 shadow-[var(--shadow-sm)]">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                Case study
              </div>
              <h2 className="mt-5 font-heading text-4xl font-black tracking-tight text-foreground">
                {resolveText(locale, homepageContent.caseStudy.headline)}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {resolveText(locale, homepageContent.caseStudy.description)}
              </p>
              <div className="mt-6 grid gap-3">
                {homepageContent.caseStudy.outcomes.map((item) => (
                  <div
                    key={item.en}
                    className="rounded-2xl border border-border/70 bg-muted/50 px-4 py-4 text-sm font-semibold text-foreground"
                  >
                    {resolveText(locale, item)}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-border/70 bg-[#2f353a] p-8 text-white shadow-[var(--shadow-sm)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                {homepageContent.caseStudy.company}
              </p>
              <div className="mt-10 grid gap-4">
                <div className="rounded-[1.8rem] bg-white/10 p-5">
                  <Workflow className="size-5 text-[#f7b267]" />
                  <p className="mt-4 text-lg font-semibold">
                    Boards replaced fragmented planning docs, risk trackers, and review decks.
                  </p>
                </div>
                <div className="rounded-[1.8rem] bg-white/10 p-5">
                  <Shield className="size-5 text-[#f7b267]" />
                  <p className="mt-4 text-lg font-semibold">
                    Classification controls made leadership collaboration usable without losing governance.
                  </p>
                </div>
                <div className="rounded-[1.8rem] bg-white/10 p-5">
                  <LockKeyhole className="size-5 text-[#f7b267]" />
                  <p className="mt-4 text-lg font-semibold">
                    Executive brief generation reduced time spent rebuilding the narrative every week.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pt-20 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-4xl font-black tracking-tight text-foreground">
                  Ready-made structures for every operating motion.
                </h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                  Launch strategy, engineering, delivery, and leadership boards without rebuilding the canvas each time.
                </p>
              </div>
              <Button asChild variant="outline" className="hidden rounded-full md:inline-flex">
                <Link href="/templates">Browse template center</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {homepageContent.templatesShowcase.map((item) => (
                <TemplateCard
                  key={item.name.en}
                  category={item.category}
                  name={item.name}
                  description={item.description}
                  ctaLabel={locale === "ar" ? "فتح القوالب" : "Open templates"}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pt-20 md:px-6">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[2rem] border border-border/70 bg-card p-8 shadow-[var(--shadow-sm)]">
              <h2 className="font-heading text-4xl font-black tracking-tight text-foreground">
                Integrates with the systems that already run the work.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The architecture is frontend-first today and prepared for deeper service connectivity tomorrow.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {homepageContent.integrations.map((item) => (
                  <div
                    key={item.en}
                    className="rounded-2xl border border-border/70 bg-muted/50 px-4 py-4 text-sm font-semibold text-foreground"
                  >
                    {resolveText(locale, item)}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-border/70 bg-card p-8 shadow-[var(--shadow-sm)]">
              <h2 className="font-heading text-4xl font-black tracking-tight text-foreground">
                Security and governance built into the default experience.
              </h2>
              <div className="mt-6 grid gap-4">
                {homepageContent.security.map((item) => (
                  <div
                    key={item.title.en}
                    className="rounded-[1.7rem] border border-border/70 bg-muted/45 px-5 py-5"
                  >
                    <h3 className="font-heading text-xl font-bold text-foreground">
                      {resolveText(locale, item.title)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {resolveText(locale, item.description)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pt-20 md:px-6">
          <div className="mx-auto max-w-7xl rounded-[2.4rem] bg-[linear-gradient(135deg,#2f353a,#454b50)] px-8 py-12 text-white shadow-[var(--shadow-md)] md:px-12">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="font-heading text-4xl font-black tracking-tight md:text-5xl">
                  Move from idea to decision with complete clarity.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/76">
                  Launch the demo workspace, explore the board shell, and test bilingual leadership workflows with local persistence enabled.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-primary hover:bg-[var(--brand-primary-hover)]">
                  <Link href="/dashboard">Open demo workspace</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20">
                  <Link href="/pricing">Review plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 pt-20 md:px-6">
        <div className="mx-auto max-w-7xl rounded-[2.2rem] border border-border/70 bg-card/88 px-8 py-10 shadow-[var(--shadow-sm)]">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <Logo size="lg" />
              <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
                EDGE Workspace is built for enterprise teams that need visual clarity, disciplined execution, and bilingual collaboration without unnecessary friction.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {homepageContent.footerColumns.map((column) => (
                <div key={column.title.en}>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {resolveText(locale, column.title)}
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {column.links.map((link) => (
                      <Link
                        key={link.href + link.label.en}
                        href={link.href}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        {resolveText(locale, link.label)}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
