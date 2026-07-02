import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import { PageHero } from "@/components/marketing/Primitives";
import { CodePanel } from "@/components/code/Code";

export const Route = createFileRoute("/rest-api")({
  head: () => ({
    meta: [
      { title: "REST API - DataSeed" },
      {
        name: "description",
        content:
          "Use the DataSeed REST API to analyze schemas, generate data, insert rows, and inspect usage.",
      },
    ],
  }),
  component: RestApiPage,
});

const REQUEST = `curl -X POST https://api.dataseed.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ds_live_..." \\
  -d '{
    "input": { "type": "auto", "files": [{ "name": "schema.sql", "content": "CREATE TABLE users (...)" }] },
    "output": { "format": "sql", "mode": "single", "sql_dialect": "postgres" },
    "options": { "rowsPerTable": { "default": 50 }, "locale": "fr", "seed": 42 }
  }'`;

const ENDPOINTS = [
  ["POST", "/v1/generate", "Parse schema, generate rows, return serialized output."],
  ["POST", "/v1/analyze", "Return parsed tables, columns, FKs, enums, and warnings."],
  ["POST", "/v1/insert", "Generate and insert into a target database in topological order."],
  ["GET", "/v1/formats", "List supported schema inputs, output formats, locales, and AI modes."],
  ["GET", "/v1/usage", "Return current month quota usage for the API key."],
];

function RestApiPage() {
  return (
    <PublicLayout showLogos={false}>
      <PageHero
        eyebrow="REST API"
        title="One JSON contract,"
        emphasis="every runtime."
        sub="Use fetch, curl, CI jobs, server actions, edge functions, or your own agent tool wrapper."
      >
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/api-reference">
            Full reference <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </PageHero>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <CodePanel
            title="generate.sh"
            badge="POST /v1/generate"
            lang="bash"
            code={REQUEST}
            wrap
          />

          <div className="mt-12 divide-y divide-border/45 border-y border-border/45">
            {ENDPOINTS.map(([method, path, detail]) => (
              <div key={path} className="grid gap-3 py-5 sm:grid-cols-[90px_180px_1fr]">
                <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
                  {method}
                </span>
                <span className="font-mono text-sm text-foreground">{path}</span>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
