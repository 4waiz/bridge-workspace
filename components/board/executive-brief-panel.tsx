import { resolveText } from "@/lib/utils";
import type { ExecutiveBrief, Locale, LocalizedText } from "@/types/app";

function BriefSection({
  title,
  items,
  locale,
}: {
  title: string;
  items: LocalizedText[];
  locale: Locale;
}) {
  return (
    <div className="rounded-[1.7rem] border border-border/70 bg-muted/45 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {title}
      </div>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div
            key={item.en}
            className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm font-medium text-foreground"
          >
            {resolveText(locale, item)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExecutiveBriefPanel({
  brief,
  locale,
}: {
  brief: ExecutiveBrief | null;
  locale: Locale;
}) {
  if (!brief) {
    return (
      <div className="rounded-[1.7rem] border border-dashed border-border bg-muted/35 px-4 py-8 text-center text-sm text-muted-foreground">
        Generate an executive brief from the board header to summarize current board content.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <BriefSection title="Objective" items={brief.objective} locale={locale} />
      <BriefSection title="Key decisions" items={brief.decisions} locale={locale} />
      <BriefSection title="Risks" items={brief.risks} locale={locale} />
      <BriefSection title="Open items" items={brief.openItems} locale={locale} />
      <BriefSection title="Owners" items={brief.owners} locale={locale} />
      <BriefSection title="Next steps" items={brief.nextSteps} locale={locale} />
    </div>
  );
}
