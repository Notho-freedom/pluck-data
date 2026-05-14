import { createFileRoute } from "@tanstack/react-router";
import { authenticateApiKey } from "@/lib/api-auth.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "X-API-Key",
};

export const Route = createFileRoute("/api/public/v1/usage")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const auth = await authenticateApiKey(request.headers.get("x-api-key"));
        if ("err" in auth) {
          return new Response(JSON.stringify({ error: auth.err.message }), {
            status: auth.err.status,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }
        const monthStart = new Date();
        monthStart.setUTCDate(1);
        monthStart.setUTCHours(0, 0, 0, 0);
        const { data } = await supabaseAdmin
          .from("usage_logs")
          .select("rows_generated, ai_calls")
          .eq("user_id", auth.ctx.userId)
          .gte("created_at", monthStart.toISOString());
        const rowsUsed = (data ?? []).reduce((a, r) => a + (r.rows_generated ?? 0), 0);
        const aiUsed = (data ?? []).reduce((a, r) => a + (r.ai_calls ?? 0), 0);
        return new Response(
          JSON.stringify({
            plan: auth.ctx.plan,
            rows: { used: rowsUsed, limit: auth.ctx.monthlyRows, remaining: Math.max(0, auth.ctx.monthlyRows - rowsUsed) },
            ai_calls: { used: aiUsed, limit: auth.ctx.monthlyAiCalls, remaining: Math.max(0, auth.ctx.monthlyAiCalls - aiUsed) },
            rate_limit_per_min: auth.ctx.rateLimitPerMin,
          }),
          { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
        );
      },
    },
  },
});
