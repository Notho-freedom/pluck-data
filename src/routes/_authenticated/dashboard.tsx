import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight } from "lucide-react";
import { getUsageSummary, getRecentLogs } from "@/lib/keys.functions";
import { CountUp } from "@/components/animations/CountUp";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Overview — DataSeed" }] }),
  component: Dashboard,
});

function Dashboard() {
  const usageFn = useServerFn(getUsageSummary);
  const logsFn = useServerFn(getRecentLogs);
  const usage = useQuery({ queryKey: ["usage"], queryFn: () => usageFn() });
  const logs = useQuery({ queryKey: ["logs", "dashboard"], queryFn: () => logsFn() });

  const data = usage.data;
  const loading = usage.isLoading;
  const feed = logs.data ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6">
      {/* Editorial header */}
      <header className="flex items-baseline justify-between border-b border-border/40 pb-6">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
            Console / Overview · {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-3 font-display text-[64px] leading-none tracking-tight sm:text-[88px]">
            {loading ? "—" : data ? <CountUp to={data.totalCalls} /> : 0}
            <span className="ml-3 align-top font-sans text-[13px] uppercase tracking-[0.14em] text-muted-foreground">requests</span>
          </h1>
          <p className="mt-4 max-w-xl text-[13.5px] text-muted-foreground">
            Month in progress. Below, the same account expressed as rows shipped, AI validations, and rate ceiling.
          </p>
        </div>
        <Link
          to="/playground"
          className="hidden items-center gap-1 border-b border-primary/40 pb-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-primary hover:border-primary sm:inline-flex"
        >
          new run <ArrowUpRight className="h-3 w-3" />
        </Link>
      </header>

      {/* Metrics row — no cards, no borders */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-10 py-10 md:grid-cols-4">
        <Metric label="Rows generated" value={data ? <CountUp to={data.rowsUsed} /> : "—"} sub={data ? `of ${data.monthlyRows.toLocaleString()} allowed` : ""} accent bar={data ? (data.rowsUsed / Math.max(1, data.monthlyRows)) * 100 : 0} />
        <Metric label="AI validations" value={data ? <CountUp to={data.aiUsed} /> : "—"} sub={data ? `of ${data.monthlyAiCalls}` : ""} bar={data ? (data.aiUsed / Math.max(1, data.monthlyAiCalls)) * 100 : 0} />
        <Metric label="Rate ceiling" value={data ? <><CountUp to={data.rateLimitPerMin} /><span className="ml-1 text-sm text-muted-foreground">/min</span></> : "—"} sub="hard cap" />
        <Metric label="Plan" value={data ? data.plan.toUpperCase() : "—"} sub={data?.hasKey ? "key active" : "no key yet"} />
      </section>

      {/* Divider chapter */}
      <ChapterHeader chapter="II" title="Activity feed" caption="Last 50 calls, newest first." />

      {loading || logs.isLoading ? (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-sm bg-muted/30" />
          ))}
        </div>
      ) : feed.length === 0 ? (
        <p className="mt-6 border-t border-border/40 pt-6 font-mono text-[12px] text-muted-foreground">
          → no activity yet. Try the <Link to="/playground" className="text-primary underline-offset-4 hover:underline">playground</Link>, or POST your first request with an API key.
        </p>
      ) : (
        <ol className="mt-6 divide-y divide-border/40 font-mono text-[12.5px]">
          {feed.slice(0, 12).map((l: any) => (
            <li key={l.id} className="flex items-baseline gap-4 py-3">
              <span className="w-40 shrink-0 text-muted-foreground/70">
                {new Date(l.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span className={`w-14 shrink-0 ${l.status >= 400 ? "text-destructive" : "text-primary/90"}`}>{l.status}</span>
              <span className="flex-1 truncate text-foreground/90">{l.endpoint}</span>
              <span className="hidden w-24 shrink-0 text-right text-muted-foreground sm:inline">{l.rows_generated.toLocaleString()} rows</span>
              <span className="w-16 shrink-0 text-right text-muted-foreground/70">{l.duration_ms}ms</span>
            </li>
          ))}
        </ol>
      )}

      {/* Divider chapter */}
      <ChapterHeader chapter="III" title="Get further" caption="Everything you may want to do next, in one column." />

      <div className="mt-6 divide-y divide-border/40 font-mono text-[13px]">
        <NextRow label="Create a production key" to="/keys" hint="hashed at rest, one-time reveal" />
        <NextRow label="Save a preset" to="/presets" hint="replay a config from API or MCP" />
        <NextRow label="Wire it to Claude / Cursor" to="/mcp" hint="MCP server URL + key" />
        <NextRow label="Read the REST reference" to="/rest-api" hint="/v1/generate · /v1/analyze · /v1/insert" />
      </div>
    </main>
  );
}

/* ---------- pieces ---------- */

function Metric({
  label, value, sub, bar, accent,
}: { label: string; value: React.ReactNode; sub?: string; bar?: number; accent?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">{label}</p>
      <p className={`mt-3 font-display leading-none tracking-tight ${accent ? "text-primary" : "text-foreground"} text-[46px] sm:text-[56px]`}>
        {value}
      </p>
      {sub && <p className="mt-2 text-[11.5px] text-muted-foreground">{sub}</p>}
      {typeof bar === "number" && (
        <div className="mt-3 h-[2px] w-full bg-border/50">
          <div
            className={`h-full ${accent ? "bg-primary" : "bg-foreground/50"}`}
            style={{ width: `${Math.min(100, Math.max(3, bar))}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ChapterHeader({ chapter, title, caption }: { chapter: string; title: string; caption: string }) {
  return (
    <div className="mt-16 flex items-baseline gap-6 border-t border-border/40 pt-6">
      <span className="font-display text-[36px] leading-none text-primary">{chapter}</span>
      <div>
        <h2 className="text-[18px] font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-[12.5px] text-muted-foreground">{caption}</p>
      </div>
    </div>
  );
}

function NextRow({ label, to, hint }: { label: string; to: string; hint: string }) {
  return (
    <Link to={to} className="group flex items-center gap-4 py-3 text-foreground/90 transition-colors hover:text-primary">
      <span className="w-6 text-muted-foreground/60">→</span>
      <span className="flex-1">{label}</span>
      <span className="hidden text-muted-foreground/70 sm:inline">{hint}</span>
      <span className="w-24 text-right text-muted-foreground/50 transition-colors group-hover:text-primary">{to}</span>
    </Link>
  );
}
