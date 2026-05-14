import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, Zap, Lock, Code2, Shuffle, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DataSeed — Realistic seed data from your SQL or JSON schema" },
      { name: "description", content: "An API that turns any schema into realistic demo data with foreign keys preserved. Output as SQL, JSON, CSV, TypeScript, or Python." },
    ],
  }),
  component: Landing,
});

const SAMPLE_OUT = `INSERT INTO "users" ("id", "email", "full_name", "created_at") VALUES
  ('a1b2…', 'lea.martin@example.fr', 'Léa Martin',   '2025-02-14 09:21:03'),
  ('c3d4…', 'paul.dupont@example.fr','Paul Dupont',  '2025-03-02 18:42:11');

INSERT INTO "messages" ("id", "user_id", "content", "created_at") VALUES
  ('e5f6…', 'a1b2…', 'Salut, on se voit demain ?', '2025-04-01 10:11:02'),
  ('g7h8…', 'c3d4…', 'Réunion confirmée pour 14h.','2025-04-01 11:30:48');`;

const SAMPLE_IN = `CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP
);`;

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, var(--color-accent) 0%, transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" /> AI-assisted demo data, on demand
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Schema in.{" "}
            <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Realistic data out.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Send a SQL <code className="rounded bg-muted px-1 py-0.5 text-sm">CREATE TABLE</code> or
            JSON Schema. Get coherent demo rows back — foreign keys preserved, columns named like a
            human, ready to seed your dev database.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/playground">
                Try the playground <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/docs">Read the API docs</Link>
            </Button>
          </div>

          {/* Schema → Data preview */}
          <div className="mx-auto mt-14 grid max-w-5xl gap-3 text-left lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <CodePane title="users.sql" language="sql" code={SAMPLE_IN} />
            <div className="hidden justify-self-center text-muted-foreground lg:block">
              <ArrowRight className="h-6 w-6" />
            </div>
            <CodePane title="seed.sql" language="sql" code={SAMPLE_OUT} accent />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature icon={<Shuffle className="h-5 w-5" />} title="Relationships preserved">
            Topological sort + smart FK pools. <code>messages.user_id</code> always points at a real
            user — no orphan rows.
          </Feature>
          <Feature icon={<Code2 className="h-5 w-5" />} title="5 output formats">
            SQL (Postgres / MySQL / SQLite), JSON, CSV, TypeScript seed, Python. Per table or one
            single file.
          </Feature>
          <Feature icon={<Sparkles className="h-5 w-5" />} title="AI assistance, optional">
            Turn it on and the AI infers the domain (chat, e-commerce, blog…) and validates the
            result. Off by default to save credits.
          </Feature>
          <Feature icon={<Zap className="h-5 w-5" />} title="API-first">
            Built as an API. The web playground just calls it. Drop one POST in your seed script.
          </Feature>
          <Feature icon={<Lock className="h-5 w-5" />} title="API keys + quotas">
            Hashed keys, per-key rate limit, monthly quotas, full usage history.
          </Feature>
          <Feature icon={<Database className="h-5 w-5" />} title="Locale-aware">
            Generate French, Spanish, Japanese… seed data with proper names, addresses, phone
            numbers.
          </Feature>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Simple plans</h2>
            <p className="mt-2 text-muted-foreground">Start free. Upgrade when you ship.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
            <PriceCard name="Free" price="$0" features={["10k rows / month", "100 AI calls", "30 req/min"]} />
            <PriceCard name="Pro" price="$19" highlight features={["1M rows / month", "5k AI calls", "120 req/min", "Email support"]} />
            <PriceCard name="Enterprise" price="Custom" features={["100M rows", "100k AI calls", "Dedicated rate limits", "SLA"]} />
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DataSeed</p>
          <div className="flex gap-4">
            <Link to="/playground" className="hover:text-foreground">Playground</Link>
            <Link to="/docs" className="hover:text-foreground">Docs</Link>
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CodePane({ title, code, accent }: { title: string; language: string; code: string; accent?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-lg border ${accent ? "ring-1 ring-primary/20 shadow-lg" : ""} bg-card`}>
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5 text-xs">
        <span className="font-mono text-muted-foreground">{title}</span>
        <span className="font-mono uppercase text-muted-foreground/70">sql</span>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-accent text-foreground">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function PriceCard({ name, price, features, highlight }: { name: string; price: string; features: string[]; highlight?: boolean }) {
  return (
    <div className={`flex flex-col rounded-lg border bg-card p-6 ${highlight ? "ring-2 ring-primary" : ""}`}>
      <h3 className="font-semibold">{name}</h3>
      <div className="mt-2 text-3xl font-bold">
        {price}
        {price.startsWith("$") && price !== "$0" && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
      </div>
      <ul className="mt-4 flex-1 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" /> {f}
          </li>
        ))}
      </ul>
      <Button asChild className="mt-6" variant={highlight ? "default" : "outline"}>
        <Link to="/signup">Start free</Link>
      </Button>
    </div>
  );
}
