import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Copy, Download, Sparkles, Play, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Playground — DataSeed API" },
      { name: "description", content: "Try the DataSeed API in your browser. Paste a schema, get realistic seed data." },
    ],
  }),
  component: Playground,
});

const EXAMPLE_SQL = `CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP
);`;

type Format = "sql" | "json" | "csv" | "typescript" | "python";
const EXT: Record<Format, string> = { sql: "sql", json: "json", csv: "csv", typescript: "ts", python: "py" };

function Playground() {
  const [schema, setSchema] = useState(EXAMPLE_SQL);
  const [format, setFormat] = useState<Format>("sql");
  const [dialect, setDialect] = useState<"postgres" | "mysql" | "sqlite">("postgres");
  const [locale, setLocale] = useState("fr");
  const [aiMode, setAiMode] = useState<"off" | "validate">("off");
  const [rows, setRows] = useState(10);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setOutput("");
    setReport(null);
    try {
      const res = await fetch("/api/public/v1/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { type: "auto", files: [{ name: "schema.sql", content: schema }] },
          output: { format, mode: "single", sql_dialect: dialect },
          options: { rowsPerTable: { default: rows }, seed: 42, locale, ai_enrichment: aiMode },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setOutput(typeof data.output.single === "string" ? data.output.single : JSON.stringify(data.output, null, 2));
      setReport(data.report);
      toast.success(`Generated ${data.report.totalRows} rows in ${data.report.durationMs}ms`);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Unknown error";
      setError(m);
      toast.error(m);
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seed.${EXT[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="app" />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Playground</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Generate seed data, live.</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Paste a schema. Pick a format. Get rows back. Capped at 100 rows/table without an API key.
            </p>
          </div>
          <Button onClick={generate} disabled={loading} size="lg" className="shadow-glow">
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>) : (<><Play className="mr-2 h-4 w-4" /> Generate</>)}
          </Button>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-5">
          {/* Schema editor */}
          <Panel className="lg:col-span-3" title="schema.sql" badge="INPUT">
            <Textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              spellCheck={false}
              className="min-h-[360px] resize-none rounded-none border-0 bg-transparent font-mono text-[12.5px] leading-relaxed focus-visible:ring-0"
              placeholder="CREATE TABLE users (...)"
            />
          </Panel>

          {/* Options */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl border border-border/80 bg-card/60 p-5">
              <h3 className="text-sm font-semibold">Options</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label="Format">
                  <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sql">SQL (INSERT)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Rows / table">
                  <Input type="number" min={1} max={500} value={rows} onChange={(e) => setRows(Number(e.target.value))} />
                </Field>
                <Field label="SQL dialect">
                  <Select value={dialect} onValueChange={(v) => setDialect(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgres">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Locale">
                  <Select value={locale} onValueChange={setLocale}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <Label className="flex items-center gap-1.5 text-primary">
                  <Wand2 className="h-3.5 w-3.5" /> AI enrichment
                </Label>
                <Select value={aiMode} onValueChange={(v) => setAiMode(v as any)}>
                  <SelectTrigger className="mt-2 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off (algo only)</SelectItem>
                    <SelectItem value="validate">Validate (AI checks output)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-2 text-[11px] text-muted-foreground">Requires an API key for production calls.</p>
              </div>

              {error && <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{error}</p>}
            </div>

            {report && (
              <div className="rounded-xl border border-border/80 bg-card/60 p-5">
                <h3 className="text-sm font-semibold">Report</h3>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Rows" value={String(report.totalRows)} />
                  <Metric label="Duration" value={`${report.durationMs}ms`} />
                  {report.aiCalls > 0 && <Metric label="AI calls" value={String(report.aiCalls)} />}
                  {report.domain && <Metric label="Domain" value={report.domain} />}
                </dl>
                {report.warnings?.length > 0 && (
                  <p className="mt-3 text-xs text-amber-400">⚠ {report.warnings.join(" · ")}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Output */}
        <Panel
          className="mt-5"
          title={`seed.${EXT[format]}`}
          badge="OUTPUT"
          accent
          actions={
            <>
              <Button variant="ghost" size="sm" onClick={copyOutput} disabled={!output}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadOutput} disabled={!output}>
                <Download className="h-3.5 w-3.5" />
              </Button>
            </>
          }
        >
          {loading ? (
            <div className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="font-mono">parsing schema · generating rows · serializing…</span>
              </div>
              {[3, 5, 4, 6, 5, 4, 3, 5].map((w, i) => (
                <Skeleton key={i} className="h-3.5" style={{ width: `${w * 12 + 20}%` }} />
              ))}
            </div>
          ) : output ? (
            <pre className="max-h-[480px] overflow-auto p-5 font-mono text-[12.5px] leading-relaxed text-foreground/90">
              <code>{output}</code>
            </pre>
          ) : (
            <div className="grid place-items-center p-12 text-center">
              <Sparkles className="h-6 w-6 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">Your seed data will appear here.</p>
            </div>
          )}
        </Panel>

        {/* SDK */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold">Use it from your code</h2>
          <Tabs defaultValue="curl" className="mt-4">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
              <TabsTrigger value="py">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="curl">
              <CodeBlock>{`curl -X POST https://api.dataseed.dev/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ds_live_..." \\
  -d '{
    "input":  { "type": "sql", "files": [{ "name": "schema.sql", "content": "CREATE TABLE ..." }] },
    "output": { "format": "sql", "mode": "single", "sql_dialect": "postgres" },
    "options":{ "rowsPerTable": { "default": 10 }, "seed": 42 }
  }'`}</CodeBlock>
            </TabsContent>
            <TabsContent value="js">
              <CodeBlock>{`const res = await fetch("https://api.dataseed.dev/v1/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-API-Key": process.env.DATASEED_KEY },
  body: JSON.stringify({
    input:  { type: "sql", files: [{ name: "schema.sql", content: schema }] },
    output: { format: "sql", mode: "single" },
    options:{ rowsPerTable: { default: 50 }, seed: 42 },
  }),
});
const { output, report } = await res.json();`}</CodeBlock>
            </TabsContent>
            <TabsContent value="py">
              <CodeBlock>{`import os, requests
res = requests.post(
    "https://api.dataseed.dev/v1/generate",
    headers={"X-API-Key": os.environ["DATASEED_KEY"]},
    json={
        "input":  {"type": "sql", "files": [{"name": "schema.sql", "content": schema}]},
        "output": {"format": "sql", "mode": "single"},
        "options":{"rowsPerTable": {"default": 50}, "seed": 42},
    },
)
data = res.json()`}</CodeBlock>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function Panel({
  title, badge, accent, actions, children, className = "",
}: { title: string; badge: string; accent?: boolean; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border bg-[oklch(0.115_0.015_250)] ${accent ? "border-primary/30 shadow-glow" : "border-border/80"} ${className}`}>
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
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/50 p-2.5">
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm text-foreground">{value}</dd>
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-border/80 bg-[oklch(0.115_0.015_250)] p-5 text-[12.5px] font-mono leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}
