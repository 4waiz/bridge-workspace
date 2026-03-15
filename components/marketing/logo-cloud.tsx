export function LogoCloud({ items }: { items: string[] }) {
  return (
    <div className="grid gap-4 rounded-[2rem] border border-border/70 bg-card/86 p-5 shadow-[var(--shadow-sm)] sm:grid-cols-2 lg:grid-cols-6">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-border/60 bg-muted/50 px-4 py-4 text-center text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase"
        >
          {item}
        </div>
      ))}
    </div>
  );
}
