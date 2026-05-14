// Server-only helpers for API key auth in public endpoints.
// Lookups + quota checks, called from /api/public/v1/* server routes.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface ApiKeyContext {
  userId: string;
  apiKeyId: string;
  plan: string;
  monthlyRows: number;
  monthlyAiCalls: number;
  rateLimitPerMin: number;
}

export interface ApiKeyError {
  status: number;
  message: string;
}

// Simple in-memory rate-limit (per worker). Best-effort.
const buckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, perMin: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (b.count >= perMin) return false;
  b.count++;
  return true;
}

export async function authenticateApiKey(
  rawKey: string | null,
): Promise<{ ctx: ApiKeyContext } | { err: ApiKeyError }> {
  if (!rawKey) return { err: { status: 401, message: "Missing X-API-Key header" } };
  if (!rawKey.startsWith("ds_live_") || rawKey.length < 20) {
    return { err: { status: 401, message: "Invalid API key format" } };
  }

  const keyHash = await sha256Hex(rawKey);
  const { data: key, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, user_id, revoked_at")
    .eq("key_hash", keyHash)
    .maybeSingle();
  if (error) return { err: { status: 500, message: error.message } };
  if (!key) return { err: { status: 401, message: "Invalid API key" } };
  if (key.revoked_at) return { err: { status: 401, message: "API key revoked" } };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("plan")
    .eq("id", key.user_id)
    .maybeSingle();
  const plan = profile?.plan ?? "free";

  const { data: quota } = await supabaseAdmin
    .from("quotas")
    .select("monthly_rows, monthly_ai_calls, rate_limit_per_min")
    .eq("plan", plan)
    .maybeSingle();

  const ctx: ApiKeyContext = {
    userId: key.user_id,
    apiKeyId: key.id,
    plan,
    monthlyRows: Number(quota?.monthly_rows ?? 10_000),
    monthlyAiCalls: Number(quota?.monthly_ai_calls ?? 100),
    rateLimitPerMin: Number(quota?.rate_limit_per_min ?? 30),
  };

  if (!rateLimit(key.id, ctx.rateLimitPerMin)) {
    return { err: { status: 429, message: "Rate limit exceeded" } };
  }

  // Touch last_used_at (fire and forget)
  void supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", key.id);

  return { ctx };
}

export async function checkMonthlyQuota(ctx: ApiKeyContext): Promise<ApiKeyError | null> {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { data } = await supabaseAdmin
    .from("usage_logs")
    .select("rows_generated, ai_calls")
    .eq("user_id", ctx.userId)
    .gte("created_at", monthStart.toISOString());
  const rows = (data ?? []).reduce((a, r) => a + (r.rows_generated ?? 0), 0);
  const ai = (data ?? []).reduce((a, r) => a + (r.ai_calls ?? 0), 0);
  if (rows >= ctx.monthlyRows) {
    return { status: 402, message: `Monthly row quota exceeded (${ctx.monthlyRows})` };
  }
  if (ai > ctx.monthlyAiCalls) {
    return { status: 402, message: `Monthly AI quota exceeded (${ctx.monthlyAiCalls})` };
  }
  return null;
}

export async function logUsage(opts: {
  userId: string;
  apiKeyId: string | null;
  endpoint: string;
  status: number;
  rowsGenerated?: number;
  aiCalls?: number;
  durationMs: number;
}) {
  await supabaseAdmin.from("usage_logs").insert({
    user_id: opts.userId,
    api_key_id: opts.apiKeyId,
    endpoint: opts.endpoint,
    status: opts.status,
    rows_generated: opts.rowsGenerated ?? 0,
    ai_calls: opts.aiCalls ?? 0,
    duration_ms: opts.durationMs,
  });
}
