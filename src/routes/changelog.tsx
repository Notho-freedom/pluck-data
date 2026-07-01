import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import { PageHero } from "@/components/marketing/Primitives";

export const Route = createFileRoute("/changelog")({
  head: () => ({ meta: [
    { title: "Changelog — DataSeed" },
    { name: "description", content: "Every notable change to the DataSeed engine, MCP server, and API." },
  ]}),
  component: ChangelogPage,
});

type Entry = {
  version: string;
  date: string;
  tag: "release" | "improvement" | "fix";
  title: string;
  body: string;
  items?: string[];
};

const ENTRIES: Entry[] = [
  {
    version: "v1.4.0", date: "This week", tag: "release",
    title: "Persona coherence & rich Postgres types",
    body: "Cross-column consistency lands: a French user gets a +33 phone, Lyon address, EUR currency, and a fr-FR avatar.",
    items: [
      "8 country personas (FR, US, DE, ES, JP, BR, GB, CA)",
      "pgvector, PostGIS geo-point, jsonb, bytea, interval, inet",
      "Domain inference (medical, e-commerce, finance, CRM)",
      "Deterministic asset URLs (DiceBear, Pravatar, Unsplash)",
    ],
  },
  {
    version: "v1.3.0", date: "Last month", tag: "release",
    title: "MCP server & Cursor/Claude support",
    body: "DataSeed is now a first-class MCP server. Any MCP-aware agent can call five tools without any plugin.",
    items: [
      "analyze_schema, generate_seed, insert_into_db, list_presets, run_preset",
      "Cursor + Claude Code + Windsurf tested end-to-end",
      "Per-key rate limits and audit trail",
    ],
  },
  {
    version: "v1.2.0", date: "6 weeks ago", tag: "improvement",
    title: "Prisma, Drizzle, Zod, OpenAPI parsers",
    body: "The engine now accepts every schema format the ecosystem ships with — auto-detected on upload.",
  },
  {
    version: "v1.1.3", date: "2 months ago", tag: "fix",
    title: "SQL parser: nested column identifiers",
    body: "Fixed a bug where node-sql-parser returned nested objects for column names, producing '[object Object]' in generated inserts.",
  },
  {
    version: "v1.1.0", date: "3 months ago", tag: "release",
    title: "Direct database injection",
    body: "New /v1/insert endpoint. Supabase and Neon supported today; raw Postgres via connection string.",
  },
];

const TAG_STYLES: Record<Entry["tag"], string> = {
  release:     "border-primary/30 bg-primary/10 text-primary",
  improvement: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  fix:         "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

function ChangelogPage() {
  return (
    <PublicLayout showLogos={false}>
      <PageHero
        eyebrow="Changelog"
        title="What we shipped,"
        emphasis="week by week."
        sub="No marketing filler. Real changes to the engine, the API, and the MCP server."
      />

      <section>
        <div className="mx-auto max-w-3xl px-6 py-20">
          <ol className="relative border-l border-border/60 pl-8">
            {ENTRIES.map((e) => (
              <li key={e.version} className="relative mb-14 last:mb-0">
                <span className="absolute -left-[42px] top-1 grid h-4 w-4 place-items-center rounded-full bg-background ring-1 ring-primary/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-[13px] text-foreground">{e.version}</span>
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                  <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${TAG_STYLES[e.tag]}`}>
                    {e.tag}
                  </span>
                </div>
                <h3 className="mt-3 text-[17px] font-semibold tracking-tight">{e.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.body}</p>
                {e.items && (
                  <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                    {e.items.map((i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                        {i}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </PublicLayout>
  );
}
