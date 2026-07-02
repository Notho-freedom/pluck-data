import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Copy, Download, Loader2, Play, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code, type CodeLang } from "@/components/code/Code";
import { CodeEditor } from "@/components/code/CodeEditor";
import { ProgressSteps } from "@/components/ProgressSteps";
import { CountUp } from "@/components/animations/CountUp";
import { EXAMPLES, type SchemaExample } from "@/lib/examples";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/playground")({
  validateSearch: (s: Record<string, unknown>) => ({
    example: typeof s.example === "string" ? s.example : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Playground - DataSeed workbench" },
      {
        name: "description",
        content:
          "Paste a schema, tune row counts, and generate realistic seed data in a live workbench.",
      },
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
type Dialect = "postgres" | "mysql" | "sqlite";
type AiMode = "off" | "validate";
type RunReport = {
  totalRows: number;
  durationMs: number;
  aiCalls?: number;
  domain?: string;
};
type GenerateResponse = {
  output: { single?: string } | Record<string, unknown>;
  report: RunReport;
  error?: string;
};

const DIALECTS: Dialect[] = ["postgres", "mysql", "sqlite"];
const AI_MODES: AiMode[] = ["off", "validate"];
const EXT: Record<Format, string> = {
  sql: "sql",
  json: "json",
  csv: "csv",
  typescript: "ts",
  python: "py",
};
const OUTPUT_LANG: Record<Format, CodeLang> = {
  sql: "sql",
  json: "json",
  csv: "csv",
  typescript: "typescript",
  python: "python",
};

function Playground() {
  const [schema, setSchema] = useState(EXAMPLE_SQL);
  const [format, setFormat] = useState<Format>("sql");
  const [dialect, setDialect] = useState<Dialect>("postgres");
  const [locale, setLocale] = useState("fr");
  const [aiMode, setAiMode] = useState<AiMode>("off");
  const [rows, setRows] = useState(10);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<RunReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeExample, setActiveExample] = useState<string | undefined>();
  const { user } = useAuth();
  const search = useSearch({ from: "/playground" });

  const sourceStats = useMemo(() => {
    const tables = [...schema.matchAll(/create\s+table\s+("?[\w.]+")/gi)].map((m) =>
      m[1].replaceAll('"', ""),
    );
    const fk = (schema.match(/references\s+/gi) ?? []).length;
    return { tables, fk };
  }, [schema]);

  const pickExample = useCallback((ex: SchemaExample) => {
    setSchema(ex.schema);
    if (ex.suggestedFormat) setFormat(ex.suggestedFormat);
    if (ex.suggestedLocale) setLocale(ex.suggestedLocale);
    setActiveExample(ex.id);
    setOutput("");
    setReport(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (search.example) {
      const ex = EXAMPLES.find((e) => e.id === search.example);
      if (ex) pickExample(ex);
    }
  }, [pickExample, search.example]);

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
          options: {
            rowsPerTable: { default: rows },
            seed: 42,
            locale,
            ai_enrichment: aiMode,
          },
        }),
      });
      const data = (await res.json()) as GenerateResponse;
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setOutput(
        "single" in data.output && typeof data.output.single === "string"
          ? data.output.single
          : JSON.stringify(data.output, null, 2),
      );
      setReport(data.report);
      toast.success(`Generated ${data.report.totalRows} rows in ${data.report.durationMs}ms`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      toast.error(message);
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
      <WorkbenchRail userPresent={!!user} />
      <main className="min-h-screen md:pl-12">
        <section className="border-b border-border/40 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary/90">
                DataSeed workbench
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Schema in. Coherent rows out.
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/docs"
                className="hidden border-b border-border/60 pb-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:inline-flex"
              >
                docs
              </Link>
              <Button
                onClick={generate}
                disabled={loading}
                size="lg"
                className="rounded-full shadow-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" /> Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1500px] gap-0 px-4 py-5 sm:px-6 xl:grid-cols-[1fr_320px_1fr]">
          <div className="min-w-0 border-y border-border/45 xl:border-r">
            <CodeEditor
              value={schema}
              onChange={setSchema}
              lang="sql"
              label="schema.sql"
              placeholder="CREATE TABLE users (...);"
            />
          </div>

          <aside className="border-b border-border/45 xl:border-y">
            <div className="divide-y divide-border/35">
              <ControlStrip title="Output">
                <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
                  <SelectTrigger className="h-8 border-0 border-b border-border/50 bg-transparent px-0 text-sm focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sql">SQL insert</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={dialect}
                  onValueChange={(v) => {
                    if (DIALECTS.includes(v as Dialect)) setDialect(v as Dialect);
                  }}
                >
                  <SelectTrigger className="h-8 border-0 border-b border-border/50 bg-transparent px-0 text-sm focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                  </SelectContent>
                </Select>
              </ControlStrip>

              <ControlStrip title="Generation">
                <label className="grid gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Root rows
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={rows}
                    onChange={(event) => setRows(Math.max(1, Number(event.target.value) || 1))}
                    className="h-8 border-0 border-b border-border/50 bg-transparent px-0 font-mono text-sm outline-none focus:border-primary"
                  />
                </label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger className="h-8 border-0 border-b border-border/50 bg-transparent px-0 text-sm focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Francais</SelectItem>
                    <SelectItem value="es">Espanol</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={aiMode}
                  onValueChange={(v) => {
                    if (AI_MODES.includes(v as AiMode)) setAiMode(v as AiMode);
                  }}
                >
                  <SelectTrigger className="h-8 border-0 border-b border-border/50 bg-transparent px-0 text-sm focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">AI off</SelectItem>
                    <SelectItem value="validate">AI validate</SelectItem>
                  </SelectContent>
                </Select>
              </ControlStrip>

              <ControlStrip title="Read">
                <Signal label="Tables" value={sourceStats.tables.length || "?"} />
                <Signal label="FK edges" value={sourceStats.fk} />
                <Signal label="Seed" value="42" />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sourceStats.tables.slice(0, 5).map((table) => (
                    <button
                      key={table}
                      type="button"
                      className="border-b border-border/50 pb-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {table}
                    </button>
                  ))}
                </div>
              </ControlStrip>

              <ControlStrip title="Starts">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {EXAMPLES.map((ex, index) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => pickExample(ex)}
                      className={`group text-left ${
                        activeExample === ex.id
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="ml-2 text-[13px]">{ex.label}</span>
                    </button>
                  ))}
                </div>
              </ControlStrip>
            </div>
          </aside>

          <div className="min-w-0 border-b border-border/45 xl:border-y xl:border-l">
            <div className="flex h-9 items-center justify-between border-b border-border/35 px-4">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                seed.{EXT[format]}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyOutput}
                  disabled={!output}
                  className="grid h-7 w-7 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  aria-label="Copy output"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={downloadOutput}
                  disabled={!output}
                  className="grid h-7 w-7 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  aria-label="Download output"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="min-h-[421px] bg-[oklch(0.105_0.012_250)]">
              {loading ? (
                <div className="p-8">
                  <ProgressSteps
                    steps={[
                      { id: "parse", label: "Parsing schema" },
                      { id: "infer", label: "Inferring column types" },
                      { id: "gen", label: "Generating rows" },
                      { id: "ser", label: "Serializing output" },
                    ]}
                    active
                  />
                </div>
              ) : output ? (
                <Code
                  code={output}
                  lang={OUTPUT_LANG[format]}
                  className="max-h-[620px] overflow-auto p-5 text-[12.5px] animate-fade-in"
                />
              ) : (
                <div className="grid min-h-[421px] place-items-center p-8 text-center">
                  <div>
                    <Sparkles className="mx-auto h-6 w-6 text-primary/70" />
                    <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                      Waiting for a run
                    </p>
                    <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                      Generate once and the output keeps syntax color, copy, and download ready.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1500px] gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_1fr]">
          <div className="border-t border-border/45 pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Request shape
            </p>
            <Code
              code={requestPreview(schema, format, dialect, rows, locale, aiMode)}
              lang="json"
              wrap
              className="mt-3 max-h-[300px] overflow-auto text-[12px]"
            />
          </div>

          <div className="border-t border-border/45 pt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Run report
              </p>
              <button
                type="button"
                onClick={() => {
                  setOutput("");
                  setReport(null);
                  setError(null);
                }}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> clear
              </button>
            </div>
            {error ? (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            ) : report ? (
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
                <Metric label="Rows" value={<CountUp to={report.totalRows} />} />
                <Metric
                  label="Duration"
                  value={
                    <>
                      <CountUp to={report.durationMs} />
                      ms
                    </>
                  }
                />
                <Metric label="AI calls" value={report.aiCalls ?? 0} />
                <Metric label="Domain" value={report.domain ?? "auto"} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No telemetry yet. Run generation to see rows, latency, AI calls, and inferred
                domain.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function WorkbenchRail({ userPresent }: { userPresent: boolean }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-12 border-r border-border/35 bg-background/80 backdrop-blur-xl md:block">
      <div className="flex h-full flex-col items-center justify-between py-4">
        <Link
          to="/"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary [writing-mode:vertical-rl]"
        >
          DataSeed
        </Link>
        <nav className="flex flex-col items-center gap-4">
          <Link
            to="/playground"
            className="font-mono text-[10px] text-primary [writing-mode:vertical-rl]"
          >
            workbench
          </Link>
          <Link
            to="/dashboard"
            className="font-mono text-[10px] text-muted-foreground [writing-mode:vertical-rl]"
          >
            console
          </Link>
          <Link
            to="/docs"
            className="font-mono text-[10px] text-muted-foreground [writing-mode:vertical-rl]"
          >
            docs
          </Link>
        </nav>
        <Link
          to={userPresent ? "/dashboard" : "/login"}
          className="grid h-7 w-7 place-items-center text-muted-foreground transition-colors hover:text-foreground"
          aria-label={userPresent ? "Open console" : "Sign in"}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}

function ControlStrip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-5">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

function Signal({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/35 pb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-[34px] leading-none text-foreground">{value}</p>
    </div>
  );
}

function requestPreview(
  schema: string,
  format: Format,
  dialect: string,
  rows: number,
  locale: string,
  aiMode: string,
) {
  const compactSchema = schema.length > 120 ? `${schema.slice(0, 120)}...` : schema;
  return JSON.stringify(
    {
      input: { type: "auto", files: [{ name: "schema.sql", content: compactSchema }] },
      output: { format, mode: "single", sql_dialect: dialect },
      options: { rowsPerTable: { default: rows }, seed: 42, locale, ai_enrichment: aiMode },
    },
    null,
    2,
  );
}
