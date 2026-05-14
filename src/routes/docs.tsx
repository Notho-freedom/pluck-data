import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "API documentation — DataSeed" },
      { name: "description", content: "DataSeed API reference: endpoints, payloads, error codes." },
    ],
  }),
  component: Docs,
});

function Endpoint({ method, path, children }: { method: string; path: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-6">
      <div className="flex items-baseline gap-3">
        <span className="rounded bg-primary px-2 py-0.5 font-mono text-xs font-semibold uppercase text-primary-foreground">{method}</span>
        <code className="text-sm font-mono">{path}</code>
      </div>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return <pre className="mt-3 overflow-x-auto rounded-md border bg-muted p-3 text-xs font-mono"><code>{children}</code></pre>;
}

function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">API Reference</h1>
        <p className="mt-2 text-muted-foreground">
          Base URL: <code className="rounded bg-muted px-1.5 py-0.5 text-sm">https://your-domain/api/public/v1</code>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          All endpoints accept JSON bodies. Authenticated endpoints require <code className="text-foreground">X-API-Key</code>.
          Get a key from your <Link to="/keys" className="text-primary underline">dashboard</Link>.
        </p>

        <div className="mt-8 space-y-6">
          <Endpoint method="POST" path="/v1/generate">
            <p>Main endpoint. Parse a schema, generate demo data, return it in the requested format.</p>
            <h4 className="mt-4 font-semibold text-foreground">Request body</h4>
            <Pre>{`{
  "input":  { "type": "sql" | "json-schema" | "auto",
              "files": [{ "name": "schema.sql", "content": "CREATE TABLE ..." }] },
  "output": { "format": "sql" | "json" | "csv" | "typescript" | "python",
              "mode":   "single" | "per-table",
              "sql_dialect": "postgres" | "mysql" | "sqlite" },
  "options": {
    "rowsPerTable": { "default": 10, "users": 50 },
    "locale": "fr",
    "seed": 42,
    "ai_enrichment": "off" | "validate" | "fill-gaps" | "full"
  }
}`}</Pre>
            <h4 className="mt-4 font-semibold text-foreground">Response</h4>
            <Pre>{`{
  "schema": { "tables": [...] },
  "output": { "single": "INSERT INTO ..." },
  "report": { "totalRows": 20, "perTable": {"users":10,"messages":10},
              "durationMs": 84, "warnings": [], "order": ["users","messages"],
              "aiCalls": 0, "domain": "chat app" }
}`}</Pre>
          </Endpoint>

          <Endpoint method="POST" path="/v1/analyze">
            <p>Parse a schema and return the parsed model — useful for debugging your input.</p>
          </Endpoint>

          <Endpoint method="GET" path="/v1/formats">
            <p>List supported output formats, SQL dialects, locales, and AI modes.</p>
          </Endpoint>

          <Endpoint method="GET" path="/v1/usage">
            <p>Returns the current month's usage and remaining quota for the API key.</p>
          </Endpoint>
        </div>

        <h2 className="mt-12 text-xl font-semibold">Error codes</h2>
        <div className="mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr><td className="px-4 py-2 font-mono">400</td><td className="px-4 py-2">Bad input (missing files, invalid schema)</td></tr>
              <tr><td className="px-4 py-2 font-mono">401</td><td className="px-4 py-2">Missing or invalid API key</td></tr>
              <tr><td className="px-4 py-2 font-mono">402</td><td className="px-4 py-2">Monthly quota exceeded</td></tr>
              <tr><td className="px-4 py-2 font-mono">413</td><td className="px-4 py-2">Input larger than 1 MB</td></tr>
              <tr><td className="px-4 py-2 font-mono">429</td><td className="px-4 py-2">Rate limit exceeded</td></tr>
              <tr><td className="px-4 py-2 font-mono">500</td><td className="px-4 py-2">Server error during generation</td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
