// Logo strip — sober, wordmark-style, monochrome for corporate feel.
const ITEMS = [
  "Postgres", "MySQL", "SQLite", "Prisma", "Drizzle",
  "Supabase", "Neon", "Cursor", "Claude", "Cloudflare",
];

export function LogosBar() {
  return (
    <div className="border-y border-border/40 bg-[oklch(0.13_0.012_250)]/60">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground/60">
          Built to plug into the stack your team already runs
        </p>
        <div className="mt-7 grid grid-cols-2 items-center gap-x-6 gap-y-5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
          {ITEMS.map((label) => (
            <span
              key={label}
              className="text-center font-mono text-[13px] tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
