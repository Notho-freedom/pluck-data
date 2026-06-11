import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Check, Terminal, Sparkles, Shield,
  Layers, Workflow, Boxes, Wand2, Cpu, Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Magnetic } from "@/components/animations/Magnetic";
import { AnimatedTerminal } from "@/components/animations/AnimatedTerminal";
import { BlendedImage } from "@/components/illustrations/BlendedImage";
import { LogosBar } from "@/components/landing/LogosBar";
import { CorporateFooter } from "@/components/landing/CorporateFooter";

import heroIllu from "@/assets/illustrations/hero-product.jpg";
import solvesSchema from "@/assets/illustrations/solves-schema.jpg";
import solvesCoherence from "@/assets/illustrations/solves-coherence.jpg";
import solvesInject from "@/assets/illustrations/solves-inject.jpg";
import intelligenceIllu from "@/assets/illustrations/intelligence.jpg";
import agentsIllu from "@/assets/illustrations/agents.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DataSeed — Seed-data infrastructure for code agents" },
      { name: "description", content: "Turn any schema (SQL, Prisma, Drizzle, Zod, OpenAPI) into coherent, FK-safe demo data with realistic personas, images, and direct database injection. MCP-native." },
    ],
  }),
  component: Landing,
});

const SAMPLE_IN = `model User {
  id        String   @id @default(uuid())
  email     String   @unique
  fullName  String
  country   String
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        String   @id @default(uuid())
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  title     String
  body      String
}`;

const SAMPLE_OUT = `INSERT INTO "User" ("id","email","fullName","country","createdAt") VALUES
  ('a1…','lea.martin@proton.me','Léa Martin','FR','2025-02-14 09:21:03'),
  ('c3…','paul.dupont@gmail.com','Paul Dupont','FR','2025-03-02 18:42:11'),
  ('e5…','maya.bernard@outlook.com','Maya Bernard','FR','2025-03-19 07:48:55');

INSERT INTO "Post" ("id","authorId","title","body") VALUES
  ('p1…','a1…','Lancement V2','Très fière de partager…'),
  ('p2…','c3…','Retour conférence','Trois jours intenses…');`;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(70%_60%_at_50%_20%,black,transparent)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl bg-[radial-gradient(closest-side,oklch(0.84_0.18_155/.35),transparent_70%)]" />

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <span className="relative grid h-1.5 w-1.5 place-items-center">
                  <span className="absolute inset-0 animate-pulse-dot rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                v1 API · MCP-native · Lovable Cloud
              </div>

              <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-[58px] sm:leading-[1.05]">
                The seed-data
                <br />
                infrastructure
                <br />
                <span className="font-display italic text-primary">for code agents.</span>
              </h1>

              <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-[17px]">
                Give us a schema in any format. We return coherent, foreign-key safe, persona-consistent demo data — with avatars, locales, domain logic — ready to download, stream, or inject straight into your Postgres.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Magnetic>
                  <Button asChild size="lg" className="shadow-glow">
                    <Link to="/playground">Open the playground <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </Magnetic>
                <Magnetic>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/docs"><Terminal className="mr-1 h-4 w-4" /> Read the docs</Link>
                  </Button>
                </Magnetic>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
                <Bullet>Free tier — 10k rows / month</Bullet>
                <Bullet>No credit card</Bullet>
                <Bullet>SOC 2 in progress</Bullet>
              </div>
            </div>

            <div className="relative illu-halo">
              <BlendedImage
                src={heroIllu}
                alt="DataSeed schema-to-data pipeline illustration"
                width={1600}
                height={1024}
                fade="all"
                glow={false}
                priority
              />
            </div>
          </div>

          {/* Schema → Data animated terminal */}
          <ScrollReveal delay={120}>
            <div className="relative mx-auto mt-20 max-w-6xl">
              <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 opacity-60 blur-2xl" />
              <AnimatedTerminal input={SAMPLE_IN} output={SAMPLE_OUT} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ───────── Logos ───────── */}
      <LogosBar />

      {/* ───────── What it solves ───────── */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <SectionHead
            eyebrow="What it solves"
            title="Three problems every engineering team hits."
            sub="Faker breaks foreign keys. ChatGPT hallucinates constraints. Mockaroo has no API for agents. DataSeed fixes all three."
          />

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <SolveCard
              illustration={solvesSchema}
              title="Any schema, parsed natively"
              body="SQL DDL, Prisma, Drizzle, Zod, OpenAPI, JSON Schema. Auto-detected. Tables, columns, FKs, enums, and CHECK constraints — all respected."
              tags={["SQL", "Prisma", "Drizzle", "Zod", "OpenAPI"]}
            />
            <SolveCard
              illustration={solvesCoherence}
              title="Personas, not noise"
              body="Each row is a coherent human: a French user gets a +33 number, a Paris zip, a fr-FR avatar. Cross-column consistency for country, language, currency, timezone."
              tags={["i18n", "Avatars", "Locale-aware"]}
            />
            <SolveCard
              illustration={solvesInject}
              title="Download or inject directly"
              body="Get SQL, JSON, CSV, TypeScript, Python — or push straight into Supabase, Neon, Postgres with topological ordering. Your connection string never persists."
              tags={["Postgres", "Supabase", "Neon"]}
            />
          </div>
        </div>
      </section>

      {/* ───────── Built-in intelligence ───────── */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="pointer-events-none absolute right-0 top-1/2 -z-10 h-[40rem] w-[40rem] -translate-y-1/2 rounded-full opacity-30 blur-3xl bg-[radial-gradient(closest-side,oklch(0.72_0.15_220/.35),transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-6 py-28">
          <SectionHead
            eyebrow="Built-in intelligence"
            title="The data understands its own domain."
            sub="DataSeed reads your table names and field shapes, infers the business domain, and generates field values that fit — IBANs in finance, blood types in medical, SKUs in commerce."
          />

          <div className="mt-16 grid items-center gap-14 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <BlendedImage
                src={intelligenceIllu}
                alt="Domain-aware data generation across medical, e-commerce, CRM, and finance"
                width={1400}
                height={900}
                fade="edges"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <Capability icon={<Layers className="h-5 w-5" />} title="Multi-format schema parsing">
                Same engine reads <code>schema.prisma</code>, <code>pgTable()</code> from Drizzle, <code>z.object()</code>, OpenAPI 3, and raw <code>CREATE TABLE</code>. Format auto-detected on upload.
              </Capability>
              <Capability icon={<Wand2 className="h-5 w-5" />} title="Rich Postgres types">
                <code>vector(1536)</code> for pgvector, <code>geo-point</code> for PostGIS, <code>jsonb</code>, <code>inet</code>, <code>bytea</code>, <code>interval</code>, custom enums.
              </Capability>
              <Capability icon={<Boxes className="h-5 w-5" />} title="Domain awareness">
                Healthcare → real ICD-10 specialties. E-commerce → realistic SKUs and price points. Finance → valid IBAN/SWIFT. CRM → coherent companies and contacts.
              </Capability>
              <Capability icon={<Sparkles className="h-5 w-5" />} title="Deterministic by seed">
                Same input + same seed = same dataset. Bit-for-bit reproducible CI fixtures.
              </Capability>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Built for agents ───────── */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <SectionHead
            eyebrow="MCP-native"
            title="Your agent calls it, not you."
            sub="DataSeed ships a Model Context Protocol server. Cursor, Claude Code, Windsurf, and OpenAI Codex can analyse schemas and seed databases as a tool — no plugin, no glue code."
          />

          <div className="mt-16 grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div className="illu-halo">
              <BlendedImage
                src={agentsIllu}
                alt="AI agents connected to the DataSeed MCP infrastructure"
                width={1600}
                height={900}
                fade="all"
                glow={false}
              />
            </div>
            <div>
              <TerminalCard title="claude mcp add" badge="MCP">
{`# Add DataSeed to Claude Code
claude mcp add dataseed \\
  --url https://api.dataseed.dev/api/mcp \\
  --api-key ds_live_...

# Available tools:
#   analyze_schema  → returns tables, FKs, columns
#   generate_seed   → returns SQL/JSON/CSV
#   insert_into_db  → topological insert
#   list_presets    → user-saved configs`}
              </TerminalCard>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <AgentBadge label="Cursor" />
                <AgentBadge label="Claude Code" />
                <AgentBadge label="Windsurf" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Drop-in code ───────── */}
      <section className="border-b border-border/40 bg-[oklch(0.13_0.012_250)]/40">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHead
                align="left"
                eyebrow="cURL · JS · Python"
                title="One POST. Done."
                sub="No SDK, no auth dance, no glue. Drop it into your seed script, your CI pipeline, your agent's tool list."
              />
              <ul className="mt-8 space-y-3.5 text-sm text-muted-foreground">
                {[
                  "Up to 100k rows per call, streamed NDJSON for the big ones",
                  "Per-table row counts, per-column overrides, persona profiles",
                  "Same JSON contract across every output format",
                  "Direct injection — Postgres / Supabase / Neon",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex gap-3">
                <Button asChild>
                  <Link to="/playground">Try it live <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/docs">View the docs</Link>
                </Button>
              </div>
            </div>

            <TerminalCard title="seed.ts" badge="REQUEST" lang="ts" accent>
{`import { readFileSync } from "fs";

const schema = readFileSync("schema.prisma", "utf8");

const res = await fetch("https://api.dataseed.dev/v1/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.DATASEED_KEY!,
  },
  body: JSON.stringify({
    input:  { type: "auto", files: [{ name: "schema.prisma", content: schema }] },
    output: { format: "sql", sql_dialect: "postgres" },
    options:{
      rowsPerTable: { User: 50, Post: { perParent: 5, parent: "User" } },
      assets: { avatars: "dicebear" },
      locale: "fr", seed: 42,
    },
  }),
});

const { output, report } = await res.json();
console.log(\`✓ \${report.totalRows} rows in \${report.durationMs}ms\`);`}
            </TerminalCard>
          </div>
        </div>
      </section>

      {/* ───────── Trust strip ───────── */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-4">
            <TrustItem icon={<Shield className="h-5 w-5" />} title="SHA-256 keys"
              body="Hashed at rest, scoped per workspace, rotatable, audit-logged." />
            <TrustItem icon={<Cpu className="h-5 w-5" />} title="Edge runtime"
              body="Sub-100ms cold start. Streams over HTTP for million-row jobs." />
            <TrustItem icon={<Workflow className="h-5 w-5" />} title="Topological inserts"
              body="Parents first, children second. Zero orphan rows, ever." />
            <TrustItem icon={<Zap className="h-5 w-5" />} title="Quota & rate-limit"
              body="Per-key budgets, per-minute caps, monthly counters." />
          </div>
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl bg-[radial-gradient(closest-side,oklch(0.84_0.18_155/.35),transparent_70%)]" />
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <ScrollReveal>
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Stop hand-writing fixtures.{" "}
              <span className="font-display italic text-primary">Ship realistic demos.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
              30 seconds to a free key. Two minutes to your first 10,000 rows. A whole afternoon back to building actual features.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Magnetic>
                <Button asChild size="lg" className="shadow-glow">
                  <Link to="/signup">Create your free account <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button asChild size="lg" variant="outline">
                  <Link to="/playground">Try without signup</Link>
                </Button>
              </Magnetic>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <CorporateFooter />
    </div>
  );
}

/* ───────── Building blocks ───────── */

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3 w-3 text-primary" />
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow, title, sub, align = "center",
}: { eyebrow: string; title: string; sub?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/90">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-[40px] sm:leading-[1.1]">
        {title}
      </h2>
      {sub && <p className={`mt-4 text-[15px] leading-relaxed text-muted-foreground ${align === "center" ? "mx-auto max-w-xl" : ""}`}>{sub}</p>}
    </div>
  );
}

function SolveCard({
  illustration, title, body, tags,
}: { illustration: string; title: string; body: string; tags: string[] }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-7 transition-all hover:border-primary/30">
      <div className="-mx-7 -mt-7 mb-6 aspect-[4/3] overflow-hidden border-b border-border/40 bg-[oklch(0.11_0.01_250)]">
        <img
          src={illustration}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"
        />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Capability({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function AgentBadge({ label }: { label: string }) {
  return (
    <div className="grid place-items-center rounded-lg border border-border/60 bg-card/40 px-3 py-3 text-center">
      <span className="text-sm font-medium">{label}</span>
      <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-primary/80">supported</span>
    </div>
  );
}

function TrustItem({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="grid h-10 w-10 place-items-center rounded-lg border border-border/60 bg-muted/30 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function TerminalCard({
  title, badge, lang, children, accent,
}: { title: string; badge: string; lang?: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-[oklch(0.115_0.015_250)] ${accent ? "border-primary/30 shadow-glow" : "border-border/60"}`}>
      <div className="flex items-center justify-between border-b border-border/60 bg-card/60 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.6_0.18_25)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.15_75)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.16_150)]/70" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${accent ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"}`}>{badge}</span>
          {lang && <span className="font-mono text-[10px] uppercase text-muted-foreground/70">{lang}</span>}
        </div>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words p-5 text-[12.5px] leading-relaxed font-mono text-foreground/90">
        <code>{children}</code>
      </pre>
    </div>
  );
}
