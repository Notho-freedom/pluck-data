// MCP tools exposing the DataSeed engine to agents (Cursor, Claude Code, etc).
import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { runGeneration, parseSchema } from "@/lib/engine";
import { detectFormat } from "@/lib/engine/parsers/detect";

const fileSchema = z.object({ name: z.string(), content: z.string() });

export const analyzeSchemaTool = defineTool({
  name: "analyze_schema",
  description: "Parse a schema (SQL, Prisma, Drizzle, Zod, OpenAPI, JSON Schema) and return tables, columns, FKs, and detected format.",
  parameters: z.object({ files: z.array(fileSchema).min(1) }),
  execute: async ({ files }) => {
    const format = detectFormat(files);
    const schema = parseSchema({ input: { type: "auto", files }, output: { format: "json" } });
    return JSON.stringify({ format, tables: schema.tables, dialect: schema.dialect }, null, 2);
  },

});

export const generateSeedTool = defineTool({
  name: "generate_seed",
  description: "Generate realistic seed data from a schema. Returns SQL/JSON/CSV output.",
  parameters: z.object({
    files: z.array(fileSchema).min(1),
    format: z.enum(["sql","json","csv","typescript","python"]).default("sql"),
    rows: z.number().int().min(1).max(10000).default(50),
    locale: z.string().default("en"),
    seed: z.number().int().default(42),
  }),
  execute: async ({ files, format, rows, locale, seed }) => {
    const res = await runGeneration({
      input: { type: "auto", files },
      output: { format, mode: "single", sql_dialect: "postgres" },
      options: { rowsPerTable: { default: rows }, locale, seed },
    });
    return { output: res.output.single, report: res.report };
  },
});
