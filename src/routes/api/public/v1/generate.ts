import { createFileRoute } from "@tanstack/react-router";
import { runGeneration } from "@/lib/engine";
import {
  authenticateApiKey,
  checkMonthlyQuota,
  logUsage,
} from "@/lib/api-auth.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Authorization",
};
const jsonHeaders = { ...cors, "Content-Type": "application/json" };

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/v1/generate")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const t0 = Date.now();
        const apiKey = request.headers.get("x-api-key");
        const sameOrigin = isSameOrigin(request);

        let userId: string | null = null;
        let apiKeyId: string | null = null;

        // Same-origin (playground) requests get a soft cap; external requires key.
        if (apiKey) {
          const auth = await authenticateApiKey(apiKey);
          if ("err" in auth) {
            return new Response(JSON.stringify({ error: auth.err.message }), {
              status: auth.err.status,
              headers: jsonHeaders,
            });
          }
          const quotaErr = await checkMonthlyQuota(auth.ctx);
          if (quotaErr) {
            return new Response(JSON.stringify({ error: quotaErr.message }), {
              status: quotaErr.status,
              headers: jsonHeaders,
            });
          }
          userId = auth.ctx.userId;
          apiKeyId = auth.ctx.apiKeyId;
        } else if (!sameOrigin) {
          return new Response(
            JSON.stringify({ error: "Missing X-API-Key header" }),
            { status: 401, headers: jsonHeaders },
          );
        }

        try {
          const body = await request.json();
          if (!body?.input?.files?.length) {
            return new Response(
              JSON.stringify({ error: "input.files is required" }),
              { status: 400, headers: jsonHeaders },
            );
          }
          const totalSize = body.input.files.reduce(
            (a: number, f: any) => a + (f.content?.length ?? 0),
            0,
          );
          if (totalSize > 1_000_000) {
            return new Response(
              JSON.stringify({ error: "Total input exceeds 1MB" }),
              { status: 413, headers: jsonHeaders },
            );
          }

          // Soft cap on rows for unauthenticated playground use
          if (!apiKey) {
            const opts = (body.options ??= {});
            const rpt = (opts.rowsPerTable ??= {});
            if (typeof rpt.default !== "number" || rpt.default > 100) rpt.default = Math.min(rpt.default ?? 10, 100);
            opts.ai_enrichment = "off";
          }

          const result = await runGeneration(body);

          if (userId) {
            await logUsage({
              userId,
              apiKeyId,
              endpoint: "/v1/generate",
              status: 200,
              rowsGenerated: result.report.totalRows,
              aiCalls: result.report.aiCalls,
              durationMs: Date.now() - t0,
            });
          }

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: jsonHeaders,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Unknown error";
          if (userId) {
            await logUsage({
              userId,
              apiKeyId,
              endpoint: "/v1/generate",
              status: 500,
              durationMs: Date.now() - t0,
            });
          }
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: jsonHeaders,
          });
        }
      },
    },
  },
});
