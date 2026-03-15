export function LoadingSkeletons({
  rows = 4,
}: {
  rows?: number;
}) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-[1.75rem] border border-border/60 bg-muted/60"
        />
      ))}
    </div>
  );
}
