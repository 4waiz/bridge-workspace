"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers3 } from "lucide-react";

import { TemplateCard } from "@/components/marketing/template-card";
import { AppShell } from "@/components/shared/app-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/components/shared/i18n-provider";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { TemplateCategory } from "@/types/app";
import { resolveText } from "@/lib/utils";

const categories: Array<TemplateCategory | "all"> = [
  "all",
  "strategy",
  "engineering",
  "operations",
  "delivery",
  "executive",
  "workshops",
];

export default function TemplatesPage() {
  const router = useRouter();
  const { locale, messages } = useI18n();
  const templates = useWorkspaceStore((state) => state.templates);
  const createBoardFromTemplate = useWorkspaceStore((state) => state.createBoardFromTemplate);

  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? null;

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesCategory =
        activeCategory === "all" || template.category === activeCategory;
      const haystack = [
        template.name.en,
        template.name.ar,
        template.description.en,
        template.description.ar,
        ...template.useCases.map((item) => item.en),
        ...template.useCases.map((item) => item.ar),
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && haystack.includes(search.toLowerCase());
    });
  }, [activeCategory, search, templates]);

  return (
    <AppShell current="templates" search={search} onSearchChange={setSearch}>
      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <aside className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-sm)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {messages.templates.templateLibrary}
          </div>
          <h1 className="mt-3 font-heading text-3xl font-black text-foreground">
            Template center
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Launch ready-made board structures for recurring enterprise workflows.
          </p>
          <div className="mt-6 grid gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground hover:bg-muted"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-[var(--shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {messages.templates.featured}
                </div>
                <h2 className="mt-2 font-heading text-3xl font-black text-foreground">
                  Launch with proven board structures
                </h2>
              </div>
              <div className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                {filteredTemplates.length} templates
              </div>
            </div>
            <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
              {templates
                .filter((template) => template.featured)
                .map((template) => (
                  <button
                    key={template.id}
                    className="min-w-[280px] rounded-[1.8rem] border border-border/70 bg-muted/50 p-5 text-left"
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      {template.category}
                    </div>
                    <div className="mt-3 font-heading text-2xl font-bold text-foreground">
                      {resolveText(locale, template.name)}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {resolveText(locale, template.description)}
                    </p>
                  </button>
                ))}
            </div>
          </div>

          <ScrollArea className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-[var(--shadow-sm)]">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  category={template.category}
                  name={template.name}
                  description={template.description}
                  ctaLabel={messages.templates.useTemplate}
                  onClick={() => setSelectedTemplateId(template.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Dialog open={Boolean(selectedTemplate)} onOpenChange={(open) => !open && setSelectedTemplateId(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTemplate ? (
            <>
              <DialogHeader>
                <DialogTitle>{resolveText(locale, selectedTemplate.name)}</DialogTitle>
                <DialogDescription>
                  {resolveText(locale, selectedTemplate.description)}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Structure
                  </div>
                  <div className="mt-4 grid gap-3">
                    {selectedTemplate.structure.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-border/70 bg-muted/50 px-4 py-3 text-sm font-semibold text-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Use cases
                  </div>
                  <div className="mt-4 grid gap-3">
                    {selectedTemplate.useCases.map((item) => (
                      <div
                        key={item.en}
                        className="rounded-2xl border border-border/70 bg-muted/50 px-4 py-3 text-sm font-semibold text-foreground"
                      >
                        {resolveText(locale, item)}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Tags
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag) => (
                      <div
                        key={tag.en}
                        className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
                      >
                        {resolveText(locale, tag)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTemplateId(null)}>
                  {messages.common.cancel}
                </Button>
                <Button
                  onClick={() => {
                    const boardId = createBoardFromTemplate(selectedTemplate);
                    router.push(`/boards/${boardId}`);
                  }}
                >
                  <Layers3 className="size-4" />
                  {messages.templates.useTemplate}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
