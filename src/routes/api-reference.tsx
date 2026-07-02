import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import { PageHero } from "@/components/marketing/Primitives";
import { CodePanel } from "@/components/code/Code";

export const Route = createFileRoute("/api-reference")({
  head: () => ({
    meta: [
      { title: "API reference - DataSeed" },
      {
        name: "description",
        content:
          "DataSeed API reference for authentication, generate, analyze, insert, formats, usage, and errors.",
      },
    ],
  }),
  component: ApiReferencePage,
});

const GENERATE = `{
  "input": {
    "type": "auto",
    "files": [{ "name": "schema.sql", "content": "CREATE TABLE users (...)" }]
  },
  "output": {
    "format": "sql",
    "mode": "single",
    "sql_dialect": "postgres"
  },
  "options": {
    "rowsPerTable": { "default": 10, "messages": { "perParent": 12, "parent": "users" } },
    "locale": "fr",
    "seed": 42,
    "ai_enrichment": "off"
  }
}`;

const RESPONSE = `{
  "schema": { "tables": [{ "name": "users", "columns": [] }] },
  "output": { "single": "INSERT INTO users ..." },
  "report": {
    "totalRows": 20,
    "durationMs": 84,
    "warnings": [],
    "order": ["users", "messages"],
    "aiCalls": 0,
    "domain": "chat app"
  }
}`;

const ERRORS = [
  ["400", "Bad input: missing files, invalid schema, or unsupported output option."],
  ["401", "Missing, malformed, or revoked API key."],
  ["402", "Monthly quota exhausted for the key workspace."],
  ["413", "Request body exceeds the current payload limit."],
  ["429", "Rate limit exceeded; retry after the response window."],
  ["500", "Generation or insertion failed unexpectedly."],
];

function ApiReferencePage() {
  return (
    <PublicLayout showLogos={false}>
      <PageHero
        eyebrow="API reference"
        title="The contract,"
        emphasis="without ceremony."
        sub="Base URL: https://api.dataseed.dev. Authenticated requests use X-API-Key."
      >
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/rest-api">
            REST guide <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </PageHero>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <CodePanel title="request.json" badge="POST /v1/generate" lang="json" code={GENERATE} />
            <CodePanel title="response.json" badge="200 OK" lang="json" code={RESPONSE} />
          </div>

          <div className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight">Endpoints</h2>
            <div className="mt-6 divide-y divide-border/45 border-y border-border/45">
              {[
                ["POST", "/v1/generate", "Generate serialized data."],
                ["POST", "/v1/analyze", "Parse and inspect schema structure."],
                ["POST", "/v1/insert", "Generate and insert into database target."],
                ["GET", "/v1/formats", "Supported inputs, outputs, locales, and AI modes."],
                ["GET", "/v1/usage", "Quota and usage for current key."],
              ].map(([method, path, detail]) => (
                <div key={path} className="grid gap-3 py-4 sm:grid-cols-[90px_170px_1fr]">
                  <span className="font-mono text-[12px] text-primary">{method}</span>
                  <span className="font-mono text-sm">{path}</span>
                  <span className="text-sm text-muted-foreground">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight">Errors</h2>
            <div className="mt-6 divide-y divide-border/45 border-y border-border/45">
              {ERRORS.map(([code, body]) => (
                <div key={code} className="grid gap-3 py-4 sm:grid-cols-[90px_1fr]">
                  <span className="font-mono text-sm text-primary">{code}</span>
                  <span className="text-sm text-muted-foreground">{body}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
