import { createFileRoute } from "@tanstack/react-router";
import { runGeneration } from "@/lib/engine";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Authorization",
};

export const Route = createFileRoute("/api/public/v1/generate")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          if (!body?.input?.files?.length) {
            return new Response(
              JSON.stringify({ error: "input.files is required" }),
              { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
            );
          }
          // Basic size guard
          const totalSize = body.input.files.reduce(
            (a: number, f: any) => a + (f.content?.length ?? 0),
            0,
          );
          if (totalSize > 1_000_000) {
            return new Response(
              JSON.stringify({ error: "Total input exceeds 1MB" }),
              { status: 413, headers: { ...cors, "Content-Type": "application/json" } },
            );
          }

          const result = runGeneration(body);
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
