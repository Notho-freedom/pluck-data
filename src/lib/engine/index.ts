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

export function runGeneration(req: GenerateRequest) {
  const t0 = Date.now();
  const schema = parseSchema(req);
  if (schema.tables.length === 0) {
    throw new Error("No tables found in schema");
  }

  const dataset = generate(schema, req.options ?? {});
  const dialect = req.output.sql_dialect ?? schema.dialect ?? "postgres";
  const perTable = serialize(dataset, req.output.format, dialect);

  const mode = req.output.mode ?? "single";
  const totalRows = Object.values(dataset.rows).reduce((a, r) => a + r.length, 0);

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
    },
  };
}

export type { GenerateRequest, UnifiedSchema } from "./types";
