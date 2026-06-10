import { createFileRoute } from "@tanstack/react-router";
import { runGeneration } from "@/lib/engine";
import { insertInto, type InsertTarget } from "@/lib/engine/insert";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};
const jh = { ...cors, "Content-Type": "application/json" };

export const Route = createFileRoute("/api/public/v1/insert")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const target = body.target as InsertTarget | undefined;
          if (!target?.kind || !target?.url) {
            return new Response(JSON.stringify({ error: "target.kind and target.url required" }), { status: 400, headers: jh });
          }
          // Generate first (reuses /v1/generate body shape minus output)
          const genReq = {
            input: body.input,
            output: { format: "sql" as const, mode: "single" as const, sql_dialect: "postgres" as const },
            options: body.options,
            config: body.config,
          };
          const result = await runGeneration(genReq);
          // Re-run generator alone to get dataset (runGeneration returns serialized only).
          // For simplicity, parse + generate again here:
          const { parseSchema } = await import("@/lib/engine");
          const { generate } = await import("@/lib/engine/generator");
          const schema = parseSchema(genReq);
          const dataset = generate(schema, { ...(body.options ?? {}), ...(body.config ?? {}) });
          const ins = await insertInto(target, dataset, schema);
          return new Response(JSON.stringify({ report: result.report, insert: ins }), { status: 200, headers: jh });
        } catch (e) {
          return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: jh });
        }
      },
    },
  },
});
