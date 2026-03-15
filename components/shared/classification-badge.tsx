import { ShieldCheck } from "lucide-react";

import { cn, classificationTone } from "@/lib/utils";
import type { ClassificationLevel } from "@/types/app";

const labels: Record<ClassificationLevel, string> = {
  public: "Public",
  internal: "Internal",
  restricted: "Restricted",
};

export function ClassificationBadge({
  classification,
  className,
}: {
  classification: ClassificationLevel;
  className?: string;
}) {
  const tone = classificationTone(classification);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        className,
      )}
      style={{
        backgroundColor: tone.background,
        color: tone.foreground,
        borderColor: tone.border,
      }}
    >
      <ShieldCheck className="size-3.5" />
      {labels[classification]}
    </span>
  );
}
