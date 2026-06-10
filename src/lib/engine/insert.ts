// Direct insertion into a target database. Supports:
//   - "supabase":  POST to /rest/v1/<table> with service_role key (worker-safe)
//   - "neon-http": Neon serverless driver (HTTPS, worker-safe)
// Other Postgres URLs are unsupported from edge for now — fall back to SQL output.
import type { GeneratedDataset, UnifiedSchema } from "./types";

export interface InsertTarget {
  kind: "supabase" | "neon-http";
  /** Supabase project URL or Neon HTTPS URL */
  url: string;
  /** Supabase service_role key (NOT the anon key) */
  serviceRoleKey?: string;
}

export interface InsertResult {
  inserted: Record<string, number>;
  errors: Array<{ table: string; error: string }>;
  durationMs: number;
}

function validateTarget(t: InsertTarget): string | null {
  try {
    const u = new URL(t.url);
    if (u.protocol !== "https:") return "Target URL must be https://";
    if (t.kind === "supabase" && !t.serviceRoleKey) return "Supabase target requires serviceRoleKey";
  } catch { return "Invalid target URL"; }
  return null;
}

async function insertSupabase(
  target: InsertTarget, dataset: GeneratedDataset,
): Promise<InsertResult> {
  const t0 = Date.now();
  const inserted: Record<string, number> = {};
  const errors: Array<{ table: string; error: string }> = [];
  const base = target.url.replace(/\/+$/, "") + "/rest/v1";
  const headers = {
    "Content-Type": "application/json",
    apikey: target.serviceRoleKey!,
    Authorization: `Bearer ${target.serviceRoleKey}`,
    Prefer: "return=minimal,resolution=ignore-duplicates",
  };
  for (const tName of dataset.order) {
    const rows = dataset.rows[tName] ?? [];
    if (rows.length === 0) { inserted[tName] = 0; continue; }
    // PostgREST: serialize Date → ISO string
    const payload = rows.map((r) => {
      const o: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(r)) o[k] = v instanceof Date ? v.toISOString() : v;
      return o;
    });
    try {
      const res = await fetch(`${base}/${encodeURIComponent(tName)}`, {
        method: "POST", headers, body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        errors.push({ table: tName, error: `HTTP ${res.status}: ${text.slice(0, 300)}` });
        inserted[tName] = 0;
      } else {
        inserted[tName] = rows.length;
      }
    } catch (e) {
      errors.push({ table: tName, error: e instanceof Error ? e.message : "Unknown" });
      inserted[tName] = 0;
    }
  }
  return { inserted, errors, durationMs: Date.now() - t0 };
}

async function insertNeonHttp(
  target: InsertTarget, dataset: GeneratedDataset, schema: UnifiedSchema,
): Promise<InsertResult> {
  const t0 = Date.now();
  // Lazy import to keep cold start light
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(target.url);
  const inserted: Record<string, number> = {};
  const errors: Array<{ table: string; error: string }> = [];
  const dialect = schema.dialect ?? "postgres";
  const quote = (n: string) => dialect === "mysql" ? `\`${n}\`` : `"${n}"`;
  const tableMap = new Map(schema.tables.map((t) => [t.name, t]));
  for (const tName of dataset.order) {
    const rows = dataset.rows[tName] ?? [];
    if (!rows.length) { inserted[tName] = 0; continue; }
    const table = tableMap.get(tName);
    if (!table) continue;
    const cols = table.columns.map((c) => c.name);
    const colSql = cols.map(quote).join(",");
    let ok = 0;
    for (const r of rows) {
      const vals = cols.map((c) => {
        const v = r[c];
        if (v === null || v === undefined) return "NULL";
        if (typeof v === "number") return String(v);
        if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
        if (v instanceof Date) return `'${v.toISOString()}'`;
        if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
        return `'${String(v).replace(/'/g, "''")}'`;
      }).join(",");
      try {
        await sql.query(`INSERT INTO ${quote(tName)} (${colSql}) VALUES (${vals}) ON CONFLICT DO NOTHING`);
        ok++;
      } catch (e) {
        errors.push({ table: tName, error: e instanceof Error ? e.message : "Unknown" });
      }
    }
    inserted[tName] = ok;
  }
  return { inserted, errors, durationMs: Date.now() - t0 };
}

export async function insertInto(
  target: InsertTarget, dataset: GeneratedDataset, schema: UnifiedSchema,
): Promise<InsertResult> {
  const v = validateTarget(target);
  if (v) throw new Error(v);
  if (target.kind === "supabase") return insertSupabase(target, dataset);
  return insertNeonHttp(target, dataset, schema);
}
