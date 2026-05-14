// API key management & usage server functions.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function randomKey(): string {
  // 32 hex chars (~128 bits)
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ name: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const raw = `ds_live_${randomKey()}`;
    const keyHash = await sha256Hex(raw);
    const keyPrefix = raw.slice(0, 12);
    const { data: row, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        user_id: userId,
        name: data.name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
      })
      .select("id, name, key_prefix, created_at")
      .single();
    if (error) throw new Error(error.message);
    // Return raw key ONCE
    return { ...row, key: raw };
  });

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getUsageSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const [{ data: profile }, { data: logs }] = await Promise.all([
      supabaseAdmin.from("profiles").select("plan").eq("id", context.userId).maybeSingle(),
      supabaseAdmin
        .from("usage_logs")
        .select("rows_generated, ai_calls, status, duration_ms, endpoint, created_at")
        .eq("user_id", context.userId)
        .gte("created_at", monthStart.toISOString()),
    ]);

    const plan = profile?.plan ?? "free";
    const { data: quota } = await supabaseAdmin
      .from("quotas")
      .select("monthly_rows, monthly_ai_calls, rate_limit_per_min")
      .eq("plan", plan)
      .maybeSingle();

    const rowsUsed = (logs ?? []).reduce((a, l) => a + (l.rows_generated ?? 0), 0);
    const aiUsed = (logs ?? []).reduce((a, l) => a + (l.ai_calls ?? 0), 0);
    const totalCalls = (logs ?? []).length;
    const successCalls = (logs ?? []).filter((l) => l.status >= 200 && l.status < 300).length;

    return {
      plan,
      rowsUsed,
      aiUsed,
      totalCalls,
      successCalls,
      monthlyRows: Number(quota?.monthly_rows ?? 0),
      monthlyAiCalls: Number(quota?.monthly_ai_calls ?? 0),
      rateLimitPerMin: Number(quota?.rate_limit_per_min ?? 30),
    };
  });

export const getRecentLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("usage_logs")
      .select("id, endpoint, status, rows_generated, ai_calls, duration_ms, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
