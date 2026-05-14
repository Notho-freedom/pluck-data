import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Copy, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const EXT: Record<Format, string> = {
  sql: "sql", json: "json", csv: "csv", typescript: "ts", python: "py",
};

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
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Playground</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Try the live API. Capped at 100 rows/table without an API key.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Schema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                className="font-mono text-xs min-h-[280px]"
                placeholder="CREATE TABLE users (...)"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Format</Label>
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
                </div>
                <div>
                  <Label>Rows / table</Label>
                  <Input type="number" min={1} max={500} value={rows}
                    onChange={(e) => setRows(Number(e.target.value))} />
                </div>
                <div>
                  <Label>SQL dialect</Label>
                  <Select value={dialect} onValueChange={(v) => setDialect(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgres">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Locale</Label>
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
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> AI mode (requires API key)
                </Label>
                <Select value={aiMode} onValueChange={(v) => setAiMode(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off (algo only)</SelectItem>
                    <SelectItem value="validate">Validate (AI checks output)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={generate} disabled={loading} className="w-full">
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>) : "Generate"}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Result</CardTitle>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" onClick={copyOutput} disabled={!output}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadOutput} disabled={!output}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ) : (
                <Textarea
                  value={output}
                  readOnly
                  className="font-mono text-xs min-h-[360px]"
                  placeholder="Your seed data will appear here…"
                />
              )}
              {report && (
                <div className="mt-3 rounded-md border bg-muted/40 p-3 text-xs">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>{report.totalRows}</strong> rows</span>
                    <span><strong>{report.durationMs}</strong> ms</span>
                    {report.aiCalls > 0 && <span><strong>{report.aiCalls}</strong> AI calls</span>}
                    {report.domain && <span>domain: <strong>{report.domain}</strong></span>}
                  </div>
                  {report.warnings?.length > 0 && (
                    <p className="mt-2 text-amber-600">⚠ {report.warnings.join(" · ")}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="curl" className="mt-10">
          <h2 className="text-lg font-semibold">Use the API from your code</h2>
          <TabsList className="mt-3">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="py">Python</TabsTrigger>
          </TabsList>
          <TabsContent value="curl">
            <CodeBlock>{`curl -X POST https://your-domain/api/public/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ds_live_..." \\
  -d '{
    "input":  { "type": "sql", "files": [{ "name": "schema.sql", "content": "CREATE TABLE ..." }] },
    "output": { "format": "sql", "mode": "single", "sql_dialect": "postgres" },
    "options":{ "rowsPerTable": { "default": 10 }, "seed": 42 }
  }'`}</CodeBlock>
          </TabsContent>
          <TabsContent value="js">
            <CodeBlock>{`const res = await fetch("https://your-domain/api/public/v1/generate", {
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
    "https://your-domain/api/public/v1/generate",
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
      </main>
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-md border bg-muted p-4 text-xs font-mono">
      <code>{children}</code>
    </pre>
  );
}
