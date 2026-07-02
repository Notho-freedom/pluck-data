import { createFileRoute, Link } from "@tanstack/react-router";
import { EXAMPLES } from "@/lib/examples";
import { Code } from "@/components/code/Code";

export const Route = createFileRoute("/_authenticated/presets")({
  head: () => ({ meta: [{ title: "Presets — DataSeed" }] }),
  component: PresetsPage,
});

function PresetsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6">
      <header className="flex items-baseline justify-between border-b border-border/40 pb-6">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">Console / Presets</p>
          <h1 className="mt-3 font-display text-[52px] leading-none tracking-tight sm:text-[72px]">
            Configurations
          </h1>
          <p className="mt-4 max-w-xl text-[13.5px] text-muted-foreground">
            A preset locks a schema, row counts, locale and seed. Replay from the API, CLI or an MCP tool.
            Start from one of the canonical schemas below — each is production-shaped.
          </p>
        </div>
      </header>

      {/* Editorial magazine grid — irregular tiles */}
      <section className="mt-10 grid gap-6 md:grid-cols-6">
        {EXAMPLES.map((ex, i) => {
          // Magazine sizing: 1st is wide, then alternate
          const span =
            i === 0 ? "md:col-span-4 md:row-span-2"
              : i % 3 === 1 ? "md:col-span-2"
                : i % 3 === 2 ? "md:col-span-3"
                  : "md:col-span-3";
          return (
            <Link
              key={ex.id}
              to="/playground"
              search={{ example: ex.id }}
              className={`group relative flex flex-col justify-between p-6 transition-colors hover:bg-muted/10 ${span} min-h-[220px] border-t border-border/40`}
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/90">
                  #{String(i + 1).padStart(2, "0")} · {ex.category ?? "preset"}
                </p>
                <h3 className="mt-3 font-display text-[26px] leading-tight tracking-tight sm:text-[32px]">
                  {ex.title}
                </h3>
                <p className="mt-2 max-w-md text-[13px] text-muted-foreground">{ex.description}</p>
              </div>

              {/* ASCII-ish schema snippet, syntax highlighted */}
              <div className="relative mt-6 overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
                <Code
                  lang={ex.suggestedFormat === "json" ? "json" : "sql"}
                  code={ex.schema.split("\n").slice(0, i === 0 ? 12 : 6).join("\n")}
                  className="max-h-40 overflow-hidden text-[11px]"
                />
              </div>

              <div className="mt-4 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/80">
                <span>{ex.suggestedFormat ?? "sql"} · {ex.suggestedLocale ?? "en"}</span>
                <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100">open →</span>
              </div>
            </Link>
          );
        })}
      </section>

      <p className="mt-16 border-t border-border/40 pt-6 font-mono text-[11.5px] text-muted-foreground">
        Save your own preset from the <Link to="/playground" className="text-primary hover:underline">playground</Link> — coming next: named presets synced across your workspace.
      </p>
    </main>
  );
}
