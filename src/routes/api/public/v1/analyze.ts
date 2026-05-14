import { createFileRoute } from "@tanstack/react-router";
import { parseSchema } from "@/lib/engine";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

export const Route = createFileRoute("/api/public/v1/analyze")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          if (!body?.input?.files?.length) {
            return new Response(JSON.stringify({ error: "input.files required" }), {
              status: 400,
              headers: { ...cors, "Content-Type": "application/json" },
            });
          }
          const schema = parseSchema(body);
          return new Response(
            JSON.stringify({
              dialect: schema.dialect,
              tables: schema.tables.map((t) => ({
                name: t.name,
                columns: t.columns.map((c) => ({
                  name: c.name,
                  kind: c.kind,
                  nullable: c.nullable,
                  isPrimaryKey: c.isPrimaryKey,
                  isUnique: c.isUnique,
                  fk: c.fk ?? null,
                  rawType: c.rawType,
                })),
              })),
            }),
            { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
          );
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
            { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
