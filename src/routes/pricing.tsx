import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import { PageHero } from "@/components/marketing/Primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [
    { title: "Pricing — DataSeed" },
    { name: "description", content: "Simple, transparent pricing. Start free, scale to team, or bring us into your enterprise." },
  ]}),
  component: PricingPage,
});

type Tier = {
  name: string;
  price: string;
  cadence?: string;
  tagline: string;
  highlight?: boolean;
  features: string[];
  cta: { label: string; to: string; variant?: "default" | "outline" };
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "€0",
    cadence: "forever",
    tagline: "For prototyping and hobby projects.",
    features: [
      "10,000 rows / month",
      "60 API calls / minute",
      "All schema formats",
      "SQL / JSON / CSV / TS / Python exports",
      "Community support",
    ],
    cta: { label: "Start free", to: "/signup", variant: "outline" },
  },
  {
    name: "Pro",
    price: "€29",
    cadence: "per month",
    tagline: "For teams shipping demos every week.",
    highlight: true,
    features: [
      "1,000,000 rows / month",
      "600 API calls / minute",
      "AI enrichment (validate + fill-gaps)",
      "Direct DB injection (Postgres / Supabase / Neon)",
      "Saved presets and run history",
      "Email support · 48h response",
    ],
    cta: { label: "Start 14-day trial", to: "/signup" },
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "For platforms embedding DataSeed.",
    features: [
      "Unlimited rows and calls",
      "Dedicated MCP endpoints",
      "SSO / SAML, audit logs, SOC 2 report",
      "Private personas and locales",
      "SLA · 24/7 pager · Slack channel",
    ],
    cta: { label: "Talk to sales", to: "/", variant: "outline" },
  },
];

const FAQ: { q: string; a: string }[] = [
  { q: "How is a 'row' counted?", a: "One inserted or generated record across all your tables per call. Duplicated rows across formats (SQL + JSON) count once." },
  { q: "Do you store my schema or generated data?", a: "No. Requests are processed in-memory and never persisted. Only aggregated usage metrics (calls, rows, ms) are logged." },
  { q: "Can I self-host?", a: "The engine, MCP server and REST API are packaged as a single container available to Enterprise customers on request." },
  { q: "What happens if I hit my quota?", a: "The API returns 429 with a clear payload. Upgrade in one click from the console — no downtime." },
];

function PricingPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Pricing"
        title="Predictable. Priced by row,"
        emphasis="not by seat."
        sub="Start free — no credit card. Upgrade the day your team starts running DataSeed in CI."
      />

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid items-stretch gap-6 md:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-7 transition-colors",
                  t.highlight
                    ? "border-primary/40 bg-card/60 shadow-glow"
                    : "border-border/60 bg-card/30 hover:border-primary/20",
                )}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                    <Sparkles className="mr-1 inline h-3 w-3" /> Most popular
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight">{t.price}</span>
                  {t.cadence && <span className="text-xs text-muted-foreground">{t.cadence}</span>}
                </div>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-muted-foreground">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button asChild variant={t.cta.variant ?? "default"} className={cn("w-full", t.highlight && "shadow-glow")}>
                    <Link to={t.cta.to}>{t.cta.label}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked.
          </h2>
          <div className="mt-10 divide-y divide-border/40 rounded-xl border border-border/60 bg-card/40">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                  {f.q}
                  <span className="font-mono text-xs text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
