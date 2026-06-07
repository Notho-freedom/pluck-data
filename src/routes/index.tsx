import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Check, Shuffle, Code2, Sparkles, Zap, Lock, Globe2,
  Terminal, Database, FileJson, FileCode, GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Typewriter } from "@/components/animations/Typewriter";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CountUp } from "@/components/animations/CountUp";
import { Magnetic } from "@/components/animations/Magnetic";
import { AuroraBackground } from "@/components/animations/AuroraBackground";
import { AnimatedTerminal } from "@/components/animations/AnimatedTerminal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DataSeed — Realistic seed data from your SQL or JSON schema" },
      { name: "description", content: "An API that turns any schema into realistic demo data with foreign keys preserved. Output as SQL, JSON, CSV, TypeScript, or Python." },
    ],
  }),
  component: Landing,
});

const SAMPLE_IN = `CREATE TABLE users (
  id           UUID PRIMARY KEY,
  email        VARCHAR(255) UNIQUE,
  full_name    VARCHAR(100),
  created_at   TIMESTAMP
);

CREATE TABLE messages (
  id           UUID PRIMARY KEY,
  user_id      UUID REFERENCES users(id),
  content      TEXT,
  created_at   TIMESTAMP
);`;

const SAMPLE_OUT = `INSERT INTO "users" ("id","email","full_name","created_at") VALUES
  ('a1b2-…','lea.martin@example.fr','Léa Martin','2025-02-14 09:21:03'),
  ('c3d4-…','paul.dupont@example.fr','Paul Dupont','2025-03-02 18:42:11'),
  ('e5f6-…','maya.bernard@example.fr','Maya Bernard','2025-03-19 07:48:55');

INSERT INTO "messages" ("id","user_id","content","created_at") VALUES
  ('m1-…','a1b2-…','Salut, on se voit demain ?','2025-04-01 10:11:02'),
  ('m2-…','c3d4-…','Réunion confirmée pour 14h.','2025-04-01 11:30:48'),
  ('m3-…','a1b2-…','Parfait, je prends le café.','2025-04-01 11:32:10');`;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_50%_at_50%_30%,black,transparent)]" />
        <AuroraBackground />

        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <a
              href="#docs"
              className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground animate-fade-in"
            >
              <span className="relative grid h-1.5 w-1.5 place-items-center">
                <span className="absolute inset-0 animate-pulse-dot rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              v1 API · Lovable AI Gateway inside
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </a>

            <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight sm:text-7xl">
              <span className="text-gradient">Schema in.</span>
              <br />
              <span className="text-mint-gradient bg-[length:200%_auto] animate-gradient">
                <Typewriter
                  words={["Realistic data out.", "SQL inserts out.", "JSON fixtures out.", "CSV rows out.", "TypeScript seeds out."]}
                />
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-in">
              The API that turns any <code className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[0.85em]">CREATE TABLE</code> or JSON Schema into coherent demo rows.
              Foreign keys preserved. Locale-aware. Ready to seed your dev database.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <Button asChild size="lg" className="shadow-glow animate-glow-pulse">
                  <Link to="/playground">
                    Open the playground
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button asChild variant="outline" size="lg">
                  <Link to="/docs">
                    <Terminal className="mr-1 h-4 w-4" /> Read the API
                  </Link>
                </Button>
              </Magnetic>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
              <Bullet>Free tier — 10k rows / month</Bullet>
              <Bullet>No credit card</Bullet>
              <Bullet>Postgres · MySQL · SQLite</Bullet>
            </div>
          </div>

          {/* Schema → Data animated terminal */}
          <ScrollReveal delay={120}>
            <div className="relative mx-auto mt-20 max-w-6xl">
              <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 opacity-60 blur-2xl" />
              <AnimatedTerminal input={SAMPLE_IN} output={SAMPLE_OUT} />
            </div>
          </ScrollReveal>

          {/* Stats band */}
          <ScrollReveal delay={200}>
            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/80 bg-border/60 md:grid-cols-4">
              <StatBand value={<CountUp to={80} suffix="ms" />} label="median latency" />
              <StatBand value={<CountUp to={100} suffix="k" />} label="rows / call" />
              <StatBand value={<CountUp to={10} suffix="+" />} label="locales" />
              <StatBand value={<CountUp to={5} />} label="output formats" />
            </div>
          </ScrollReveal>

          {/* Logos / trust */}
          <ScrollReveal delay={280}>
            <div className="mx-auto mt-14 max-w-3xl">
              <p className="text-center text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground/70">
                works with every stack you already use
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                {["Postgres", "MySQL", "SQLite", "Prisma", "Drizzle", "TypeORM", "Knex"].map((s) => (
                  <span key={s} className="font-mono transition-colors hover:text-foreground">{s}</span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>


      {/* ───────── Features ───────── */}
      <section className="relative border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <SectionHead
            eyebrow="The engine"
            title="Built for real schemas, not toy data."
            sub="A topological generator with smart FK pools, locale-aware faker, and optional AI domain inference. No orphan rows. Ever."
          />

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <Feature icon={<Shuffle />} title="Relationships preserved">
              Topological sort + FK pools. <code>messages.user_id</code> always points at a real user — no orphans, no NULLs where you didn't ask for them.
            </Feature>
            <Feature icon={<Code2 />} title="5 output formats">
              SQL (Postgres / MySQL / SQLite), JSON, CSV, TypeScript seed, Python. One file or one per table — your call.
            </Feature>
            <Feature icon={<Sparkles />} title="AI assistance, optional">
              Turn it on and Gemini infers the domain (chat, e-commerce, blog…) and validates the output. Off by default.
            </Feature>
            <Feature icon={<Zap />} title="API-first">
              The web playground just calls it. Drop one <code>POST</code> in your seed script and you're done.
            </Feature>
            <Feature icon={<Lock />} title="Keys, quotas, audit">
              SHA-256 hashed keys, per-key rate limit, monthly quotas, every request logged.
            </Feature>
            <Feature icon={<Globe2 />} title="Locale-aware">
              Generate French, Spanish, Japanese seed data with proper names, addresses, phone numbers.
            </Feature>
          </div>
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead
          eyebrow="How it works"
          title="From CREATE TABLE to seed file in 80ms."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <Step n="01" icon={<FileCode className="h-4 w-4" />} title="Send your schema">
            POST a SQL <code>CREATE TABLE</code> dump or JSON Schema. <code>node-sql-parser</code> reads Postgres, MySQL and SQLite dialects.
          </Step>
          <Step n="02" icon={<GitBranch className="h-4 w-4" />} title="Engine generates">
            We topo-sort the graph, build FK pools, then fill columns from a column-name heuristic + locale-aware faker.
          </Step>
          <Step n="03" icon={<FileJson className="h-4 w-4" />} title="Pick your format">
            Get SQL inserts, a single JSON, a CSV per table, a typed TS seed file, or a Python script.
          </Step>
        </div>
      </section>

      {/* ───────── Code sample ───────── */}
      <section className="border-t border-border/60 bg-card/20">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHead
                align="left"
                eyebrow="cURL · JS · Python"
                title="Drop one POST in your seed script."
                sub="No SDK, no auth dance. An API key, a body, you're seeding."
              />
              <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                {[
                  "Deterministic by seed — reproducible CI fixtures",
                  "Up to 100k rows per call, streamed JSON for the big ones",
                  "Per-table row counts and column overrides",
                  "Same JSON contract across every output format",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Button asChild>
                  <Link to="/playground">Try it live <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/docs">View the docs</Link>
                </Button>
              </div>
            </div>

            <TerminalPane
              title="seed.ts"
              badge="REQUEST"
              lang="ts"
              code={`import { readFileSync } from "fs";

const schema = readFileSync("schema.sql", "utf8");

const res = await fetch("https://api.dataseed.dev/v1/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.DATASEED_KEY!,
  },
  body: JSON.stringify({
    input:  { type: "sql", files: [{ name: "schema.sql", content: schema }] },
    output: { format: "sql", mode: "single", sql_dialect: "postgres" },
    options:{ rowsPerTable: { default: 50 }, locale: "fr", seed: 42 },
  }),
});

const { output, report } = await res.json();
console.log(\`✓ \${report.totalRows} rows in \${report.durationMs}ms\`);`}
              accent
            />
          </div>
        </div>
      </section>

      {/* ───────── Pricing ───────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHead
          eyebrow="Pricing"
          title="Simple plans. Real limits, not asterisks."
          sub="Start free. Upgrade when you ship."
        />
        <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
          <PriceCard
            name="Free"
            price="$0"
            cadence="forever"
            features={["10k rows / month", "100 AI calls", "30 req / min", "Community support"]}
            cta="Start free"
          />
          <PriceCard
            name="Pro"
            price="$19"
            cadence="/ month"
            highlight
            features={["1M rows / month", "5k AI calls", "120 req / min", "Email support", "All output formats"]}
            cta="Start Pro"
          />
          <PriceCard
            name="Enterprise"
            price="Custom"
            cadence="talk to us"
            features={["100M+ rows", "100k AI calls", "Dedicated rate limits", "SLA & SSO", "Private deploy"]}
            cta="Contact sales"
          />
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="relative overflow-hidden border-t border-border/60">
        <div className="bg-aurora pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            <span className="text-gradient">Stop hand-writing fixtures.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Sign up in 30 seconds, paste a schema, get a key, ship better demos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/signup">Create your free account <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/playground">Try without signup</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <span>© {new Date().getFullYear()} DataSeed — built for developers.</span>
          </div>
          <div className="flex gap-5">
            <Link to="/playground" className="hover:text-foreground">Playground</Link>
            <Link to="/docs" className="hover:text-foreground">Docs</Link>
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
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
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
        <span className="text-gradient">{title}</span>
      </h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card/60 p-6 transition-all hover:border-primary/30 hover:bg-card">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="grid h-10 w-10 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
        <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      </div>
      <h3 className="mt-5 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function Step({ n, icon, title, children }: { n: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded-xl border border-border/80 bg-card/40 p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-primary">{n}</span>
        <span className="grid h-7 w-7 place-items-center rounded-md bg-muted text-muted-foreground">{icon}</span>
      </div>
      <h3 className="mt-6 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function PriceCard({
  name, price, cadence, features, highlight, cta,
}: { name: string; price: string; cadence: string; features: string[]; highlight?: boolean; cta: string }) {
  return (
    <div className={`relative flex flex-col rounded-xl border bg-card/60 p-7 ${highlight ? "border-primary/40 shadow-glow" : "border-border/80"}`}>
      {highlight && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary/70 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-primary-foreground">
          Most popular
        </span>
      )}
      <h3 className="text-sm font-semibold text-muted-foreground">{name}</h3>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tracking-tight">{price}</span>
        <span className="text-xs text-muted-foreground">{cadence}</span>
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button asChild className={`mt-7 ${highlight ? "shadow-glow" : ""}`} variant={highlight ? "default" : "outline"}>
        <Link to="/signup">{cta}</Link>
      </Button>
    </div>
  );
}

function TerminalPane({
  title, badge, lang, code, accent,
}: { title: string; badge: string; lang: string; code: string; accent?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-[oklch(0.115_0.015_250)] ${accent ? "border-primary/30 shadow-glow" : "border-border/80"}`}>
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
          <span className="font-mono text-[10px] uppercase text-muted-foreground/70">{lang}</span>
        </div>
      </div>
      <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed font-mono text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
