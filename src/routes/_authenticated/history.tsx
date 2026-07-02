import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRecentLogs } from "@/lib/keys.functions";
import { Code } from "@/components/code/Code";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — DataSeed" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const fn = useServerFn(getRecentLogs);
  const { data, isLoading } = useQuery({ queryKey: ["logs"], queryFn: () => fn() });
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-5xl px-6">
      <header className="flex items-baseline justify-between border-b border-border/40 pb-6">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">Console / History</p>
          <h1 className="mt-3 font-display text-[52px] leading-none tracking-tight sm:text-[72px]">
            {isLoading ? "—" : (data?.length ?? 0)}
            <span className="ml-3 align-top font-sans text-[13px] uppercase tracking-[0.14em] text-muted-foreground">calls</span>
          </h1>
          <p className="mt-4 max-w-xl text-[13.5px] text-muted-foreground">
            Every request against your keys, newest first. Click a row to expand the payload.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="mt-8 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-sm bg-muted/30" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="mt-8 font-mono text-[12.5px] text-muted-foreground">
          → no calls yet. Fire one from the playground or your own code.
        </p>
      ) : (
        <ol className="mt-8 relative">
          {/* vertical rail */}
          <div aria-hidden className="absolute left-[8px] top-2 bottom-2 w-px bg-border/60" />
          {data.map((l: any) => {
            const isOpen = openId === l.id;
            const failed = l.status >= 400;
            return (
              <li key={l.id} className="relative pl-8">
                <span
                  className={`absolute left-[3px] top-4 h-[10px] w-[10px] rounded-full border-2 ${
                    failed
                      ? "border-destructive/60 bg-destructive/40"
                      : "border-primary/60 bg-primary/40"
                  }`}
                />
                <button
                  onClick={() => setOpenId(isOpen ? null : l.id)}
                  className="group flex w-full flex-wrap items-baseline gap-4 border-b border-border/40 py-3 text-left font-mono text-[12.5px] transition-colors hover:bg-muted/10"
                >
                  <span className="w-44 text-muted-foreground/80">
                    {new Date(l.created_at).toLocaleString()}
                  </span>
                  <span className={`w-12 ${failed ? "text-destructive" : "text-primary/90"}`}>{l.status}</span>
                  <span className="flex-1 truncate text-foreground/90">{l.endpoint}</span>
                  <span className="hidden w-24 text-right text-muted-foreground sm:inline">{Number(l.rows_generated).toLocaleString()} rows</span>
                  <span className="w-16 text-right text-muted-foreground/70">{l.duration_ms}ms</span>
                  <span className="w-4 text-right text-muted-foreground/50">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="mb-2 mt-3 space-y-3 animate-fade-in">
                    <MetaRow label="Method" value={l.method ?? "POST"} />
                    <MetaRow label="AI calls" value={String(l.ai_calls ?? 0)} />
                    <MetaRow label="Key prefix" value={l.key_prefix ?? "—"} />
                    {l.request_payload && (
                      <div>
                        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">Request</p>
                        <Code lang="json" code={pretty(l.request_payload)} className="max-h-64 overflow-auto rounded-md border border-border/40 p-3 text-[12px]" />
                      </div>
                    )}
                    {l.response_summary && (
                      <div>
                        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">Response summary</p>
                        <Code lang="json" code={pretty(l.response_summary)} className="max-h-64 overflow-auto rounded-md border border-border/40 p-3 text-[12px]" />
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 font-mono text-[12px]">
      <span className="w-24 text-muted-foreground/70">{label}</span>
      <span className="text-foreground/90">{value}</span>
    </div>
  );
}

function pretty(v: any): string {
  try {
    return typeof v === "string" ? JSON.stringify(JSON.parse(v), null, 2) : JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
