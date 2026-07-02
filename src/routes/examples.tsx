import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import { PageHero } from "@/components/marketing/Primitives";
import { Code } from "@/components/code/Code";
import { EXAMPLES } from "@/lib/examples";

export const Route = createFileRoute("/examples")({
  head: () => ({
    meta: [
      { title: "Examples - DataSeed" },
      {
        name: "description",
        content:
          "Example DataSeed schemas for chat, ecommerce, SaaS billing, CMS, CRM, and analytics events.",
      },
    ],
  }),
  component: ExamplesPage,
});

function ExamplesPage() {
  return (
    <PublicLayout showLogos={false}>
      <PageHero
        eyebrow="Examples"
        title="Start from a product shape,"
        emphasis="not a blank box."
        sub="Each sample can be opened directly in the workbench and generated as SQL, JSON, CSV, TypeScript, or Python."
      >
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/playground">
            Open workbench <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </PageHero>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="divide-y divide-border/45 border-y border-border/45">
            {EXAMPLES.map((example, index) => (
              <article key={example.id} className="grid gap-6 py-8 lg:grid-cols-[0.55fr_1fr]">
                <div>
                  <p className="font-display text-[42px] leading-none text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">{example.label}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {example.description}
                  </p>
                  <Link
                    to="/playground"
                    search={{ example: example.id }}
                    className="mt-5 inline-flex items-center gap-1 border-b border-primary/50 pb-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary"
                  >
                    run this schema <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <Code
                  code={example.schema}
                  lang="sql"
                  className="max-h-[360px] overflow-auto text-[12px]"
                />
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
