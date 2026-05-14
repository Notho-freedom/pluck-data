// Orchestrator: parse → generate → serialize.
import { parseSqlDdl } from "./parser-sql";
import { parseJsonSchema } from "./parser-json";
import { generate } from "./generator";
import { serialize, combineSingle } from "./writers";
import type { GenerateRequest, UnifiedSchema } from "./types";

export function parseSchema(req: GenerateRequest): UnifiedSchema {
  const type = req.input.type;
  if (type === "sql") return parseSqlDdl(req.input.files);
  if (type === "json-schema") return parseJsonSchema(req.input.files);
  // auto: detect by content / extension
  const isJson = req.input.files.every(
    (f) => f.name.endsWith(".json") || f.content.trim().startsWith("{"),
  );
  return isJson ? parseJsonSchema(req.input.files) : parseSqlDdl(req.input.files);
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
  };
}

export async function runGeneration(req: GenerateRequest): Promise<GenerationOutcome> {
  const t0 = Date.now();
  const schema = parseSchema(req);
  if (schema.tables.length === 0) {
    throw new Error("No tables found in schema");
  }

  let aiCalls = 0;
  let domain: string | undefined;
  let aiIssues: string[] | undefined;
  const aiMode = req.options?.ai_enrichment ?? "off";

  // Phase 3: AI analysis (lazy import → server-only)
  if (aiMode !== "off") {
    try {
      const { analyzeSchema } = await import("./ai.server");
      const summary = {
        tables: schema.tables.map((t) => ({
          name: t.name,
          columns: t.columns.map((c) => ({ name: c.name, kind: c.kind })),
        })),
      };
      const analysis = await analyzeSchema(summary);
      aiCalls++;
      domain = analysis.domain;
      // Apply column hints into schema metadata (generator picks them up)
      for (const t of schema.tables) {
        for (const c of t.columns) {
          const hint = analysis.columnHints[`${t.name}.${c.name}`];
          if (hint) (c as any).aiHint = hint;
        }
      }
    } catch (e) {
      // AI is optional — never fail generation
      console.warn("AI analyze skipped:", e);
    }
  }

  const dataset = generate(schema, req.options ?? {});
  const dialect = req.output.sql_dialect ?? schema.dialect ?? "postgres";
  const perTable = serialize(dataset, req.output.format, dialect);

  const mode = req.output.mode ?? "single";
  const totalRows = Object.values(dataset.rows).reduce((a, r) => a + r.length, 0);

  // AI validation on a sample
  if (aiMode === "validate" || aiMode === "full") {
    try {
      const { validateSample } = await import("./ai.server");
      const sample: Record<string, unknown[]> = {};
      for (const [k, rows] of Object.entries(dataset.rows)) sample[k] = rows.slice(0, 5);
      const v = await validateSample(sample, domain ?? "unknown");
      aiCalls++;
      aiIssues = v.issues;
    } catch (e) {
      console.warn("AI validate skipped:", e);
    }
  }

  const output =
    mode === "single"
      ? { single: combineSingle(perTable, req.output.format) }
      : { perTable };

  return {
    schema,
    output,
    report: {
      totalRows,
      perTable: Object.fromEntries(
        Object.entries(dataset.rows).map(([k, v]) => [k, v.length]),
      ),
      durationMs: Date.now() - t0,
      warnings: dataset.warnings,
      order: dataset.order,
      aiCalls,
      domain,
      aiIssues,
    },
  };
}

export type { GenerateRequest, UnifiedSchema } from "./types";
