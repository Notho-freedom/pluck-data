import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Database, Cloud, Braces, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import { PageHero, SectionHead, TerminalCard } from "@/components/marketing/Primitives";
import { BlendedImage } from "@/components/illustrations/BlendedImage";
import matrix from "@/assets/illustrations/integrations-matrix.jpg";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [
    { title: "Integrations — DataSeed" },
    { name: "description", content: "DataSeed integrates with Postgres, Supabase, Neon, Prisma, Drizzle, Zod, OpenAPI, and MCP-compatible agents." },
  ]}),
  component: IntegrationsPage,
});

type IntegrationGroup = { title: string; icon: React.ReactNode; items: { name: string; note: string; status: "live" | "beta" }[] };

const GROUPS: IntegrationGroup[] = [
  {
    title: "Databases",
    icon: <Database className="h-4 w-4" />,
    items: [
      { name: "Postgres",  note: "Direct INSERT stream, topological ordering", status: "live" },
      { name: "Supabase",  note: "REST + service key injection", status: "live" },
      { name: "Neon",      note: "HTTP driver for edge workflows", status: "live" },
      { name: "MySQL",     note: "SQL export, direct insert on roadmap", status: "beta" },
      { name: "SQLite",    note: "SQL export for local prototyping", status: "live" },
    ],
  },
  {
    title: "Schema formats",
    icon: <Braces className="h-4 w-4" />,
    items: [
      { name: "SQL DDL",  note: "CREATE TABLE, FKs, enums, CHECK", status: "live" },
      { name: "Prisma",   note: "schema.prisma with relations", status: "live" },
      { name: "Drizzle",  note: "pgTable, foreign keys, indexes", status: "live" },
      { name: "Zod",      note: "z.object with refinements", status: "live" },
      { name: "OpenAPI",  note: "3.0 / 3.1 component schemas", status: "live" },
      { name: "JSON Schema", note: "Draft 2020-12 subset", status: "beta" },
    ],
  },
  {
    title: "Agents & runtimes",
    icon: <Terminal className="h-4 w-4" />,
    items: [
      { name: "Cursor",       note: "MCP server via .cursor/mcp.json", status: "live" },
      { name: "Claude Code",  note: "claude mcp add", status: "live" },
      { name: "Windsurf",     note: "Native MCP support", status: "live" },
      { name: "Cloudflare Workers", note: "Edge-friendly REST client", status: "live" },
      { name: "Node & Deno",  note: "Any fetch-compatible runtime", status: "live" },
    ],
  },
  {
    title: "Delivery",
    icon: <Cloud className="h-4 w-4" />,
    items: [
      { name: "REST",   note: "One JSON contract, every language", status: "live" },
      { name: "NDJSON", note: "Streamed rows for million-row jobs", status: "live" },
      { name: "Webhook", note: "Push seeded runs to your service", status: "beta" },
    ],
  },
];

function IntegrationsPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Integrations"
        title="Plugs into the stack"
        emphasis="you already ship on."
        sub="No SDK to install. No custom binding to maintain. DataSeed exposes one JSON contract that fits every runtime, database and agent your team touches."
      >
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/docs">See integration guides <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/agents">Set up as an MCP tool</Link>
        </Button>
      </PageHero>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="illu-halo mx-auto max-w-3xl">
            <BlendedImage src={matrix} alt="Integrations matrix" width={1600} height={1024} fade="all" glow={false} />
          </div>
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <SectionHead
            eyebrow="Compatibility"
            title="Everything on one page."
            sub="Green = shipping today. Amber = in beta, request access from the console."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {GROUPS.map((g) => (
              <div key={g.title} className="rounded-xl border border-border/60 bg-card/40 p-6">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    {g.icon}
                  </span>
                  <h3 className="text-[15px] font-semibold tracking-tight">{g.title}</h3>
                </div>
                <ul className="mt-5 divide-y divide-border/40">
                  {g.items.map((it) => (
                    <li key={it.name} className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-sm font-medium">{it.name}</div>
                        <div className="text-[12px] text-muted-foreground">{it.note}</div>
                      </div>
                      <span className={
                        it.status === "live"
                          ? "rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary"
                          : "rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-400"
                      }>
                        {it.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/40 bg-[oklch(0.13_0.012_250)]/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <SectionHead align="left" eyebrow="Direct insert" title="Push straight into your database."
            sub="Skip the download-then-import dance. Give DataSeed a connection URL — we handle topological ordering." />
          <div className="mt-10">
            <TerminalCard title="insert.ts" badge="POST /v1/insert" lang="ts" accent>
{`await fetch("https://api.dataseed.dev/v1/insert", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.DATASEED_KEY!,
  },
  body: JSON.stringify({
    target: {
      driver: "supabase",              // or "neon" | "postgres"
      url:    process.env.SUPABASE_URL!,
      key:    process.env.SUPABASE_SERVICE_KEY!,
    },
    input:  { type: "auto", files: [{ name: "schema.sql", content: sql }] },
    options: { rowsPerTable: { users: 250 }, seed: 42 },
  }),
});`}
            </TerminalCard>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
