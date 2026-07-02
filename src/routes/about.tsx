import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import { PageHero } from "@/components/marketing/Primitives";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - DataSeed" },
      {
        name: "description",
        content:
          "DataSeed builds seed-data infrastructure for developers, QA teams, demos, and AI coding agents.",
      },
    ],
  }),
  component: AboutPage,
});

const PRINCIPLES = [
  [
    "Realistic beats random",
    "Data should preserve relationships, locale, domain, and product truth.",
  ],
  [
    "Agents need tools",
    "A coding agent can scaffold features, but it also needs believable data to verify them.",
  ],
  [
    "Reproducibility is a feature",
    "Same schema and seed should return the same dataset every time.",
  ],
  [
    "No hidden data lake",
    "Schemas and generated rows stay in the request cycle; usage logs stay aggregate.",
  ],
];

function AboutPage() {
  return (
    <PublicLayout showLogos={false}>
      <PageHero
        eyebrow="About"
        title="We build the missing data layer"
        emphasis="for software demos."
        sub="DataSeed exists because empty tables make good products look unfinished, and random fixtures make real bugs invisible."
      >
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/playground">
            Open the workbench <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </PageHero>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <p className="font-display text-[44px] leading-[0.95] tracking-tight text-foreground sm:text-[58px]">
              Seed data should feel designed, not dumped.
            </p>
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
              <p>
                DataSeed reads schema structure, relation graphs, column names, constraints, and
                domain signals. Then it emits rows that behave like a small, coherent product
                universe.
              </p>
              <p>
                That matters for AI-assisted engineering. Agents can now call DataSeed over MCP or
                REST, fill a database, and validate a feature against realistic state instead of an
                empty screen.
              </p>
            </div>
          </div>

          <div className="mt-16 divide-y divide-border/45 border-y border-border/45">
            {PRINCIPLES.map(([title, body], index) => (
              <div key={title} className="grid gap-4 py-6 sm:grid-cols-[80px_1fr]">
                <span className="font-display text-[38px] leading-none text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
