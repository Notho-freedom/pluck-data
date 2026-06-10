// Orchestrator: parse → generate → serialize. v3 with multi-format parsers.
import { parseSqlDdl } from "./parser-sql";
import { parseJsonSchema } from "./parser-json";
import { parsePrisma } from "./parsers/parser-prisma";
import { parseDrizzle } from "./parsers/parser-drizzle";
import { parseZod } from "./parsers/parser-zod";
import { parseOpenApi } from "./parsers/parser-openapi";
import { detectFormat, type DetectedFormat } from "./parsers/detect";
import { generate } from "./generator";
import { serialize, combineSingle } from "./writers";
import type { GenerateRequest, UnifiedSchema, GenerateOptions } from "./types";

const PARSERS: Record<DetectedFormat, (f: Array<{name:string;content:string}>) => UnifiedSchema> = {
  sql: parseSqlDdl,
  prisma: parsePrisma,
  drizzle: parseDrizzle,
  zod: parseZod,
  openapi: parseOpenApi,
  "json-schema": parseJsonSchema,
};

export function parseSchema(req: GenerateRequest): UnifiedSchema {
  const t = req.input.type;
  if (t && t !== "auto") {
    const key = (t === "json-schema" ? "json-schema" : t) as DetectedFormat;
    const fn = PARSERS[key];
    if (fn) return fn(req.input.files);
  }
  const detected = detectFormat(req.input.files);
  return PARSERS[detected](req.input.files);
}

export interface GenerationOutcome {
  schema: UnifiedSchema;
  output: { single?: string; perTable?: Record<string, string> };
  report: {
    totalRows: number;
    perTable: Record<string, number>;
    durationMs: number;
    warnings: string[];
    order: string[];
    aiCalls: number;
    domain?: string;
    aiIssues?: string[];
    parser?: string;
    assets?: Record<string, string>;
  };
}

function mergeConfig(req: GenerateRequest): GenerateOptions {
  const a = req.options ?? {};
  const b = req.config ?? {};
  return {
    ...b, ...a,
    rowsPerTable: { ...(b.rowsPerTable ?? {}), ...(a.rowsPerTable ?? {}) },
    assets: { ...(b.assets ?? {}), ...(a.assets ?? {}) },
  };
}

export async function runGeneration(req: GenerateRequest): Promise<GenerationOutcome> {
  const t0 = Date.now();
  const schema = parseSchema(req);
  if (schema.tables.length === 0) throw new Error("No tables found in schema");

  const options = mergeConfig(req);
  let aiCalls = 0;
  let domain: string | undefined;
  let aiIssues: string[] | undefined;
  const aiMode = options.ai_enrichment ?? "off";

  if (aiMode !== "off") {
    try {
      const { analyzeSchema } = await import("./ai.server");
      const summary = { tables: schema.tables.map((t) => ({
        name: t.name, columns: t.columns.map((c) => ({ name: c.name, kind: c.kind })),
      })) };
      const analysis = await analyzeSchema(summary);
      aiCalls++;
      domain = analysis.domain;
      for (const t of schema.tables) for (const c of t.columns) {
        const hint = analysis.columnHints[`${t.name}.${c.name}`];
        if (hint) (c as any).aiHint = hint;
      }
    } catch (e) { console.warn("AI analyze skipped:", e); }
  }

  const dataset = generate(schema, options);
  if (!domain) domain = dataset.domain;
  const dialect = req.output.sql_dialect ?? schema.dialect ?? "postgres";
  const perTable = serialize(dataset, req.output.format, dialect);
  const mode = req.output.mode ?? "single";

  if (aiMode === "validate" || aiMode === "full") {
    try {
      const { validateSample } = await import("./ai.server");
      const sample: Record<string, unknown[]> = {};
      for (const [k, rows] of Object.entries(dataset.rows)) sample[k] = rows.slice(0, 5);
      const v = await validateSample(sample, domain ?? "unknown");
      aiCalls++;
      aiIssues = v.issues;
    } catch (e) { console.warn("AI validate skipped:", e); }
  }

  const output = mode === "single"
    ? { single: combineSingle(perTable, req.output.format) }
    : { perTable };

  return {
    schema,
    output,
    report: {
      totalRows: Object.values(dataset.rows).reduce((a, r) => a + r.length, 0),
      perTable: Object.fromEntries(Object.entries(dataset.rows).map(([k, v]) => [k, v.length])),
      durationMs: Date.now() - t0,
      warnings: dataset.warnings,
      order: dataset.order,
      aiCalls,
      domain,
      aiIssues,
      parser: schema.source,
      assets: dataset.assetsUsed,
    },
  };
}

export type { GenerateRequest, UnifiedSchema } from "./types";
