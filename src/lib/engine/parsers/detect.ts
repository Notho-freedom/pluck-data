// Auto-detect input schema format.
export type DetectedFormat = "sql" | "prisma" | "drizzle" | "zod" | "openapi" | "json-schema";

export function detectFormat(files: Array<{ name: string; content: string }>): DetectedFormat {
  const blob = files.map((f) => `${f.name}\n${f.content}`).join("\n").slice(0, 50_000);
  const lower = blob.toLowerCase();
  // Strong signals first
  if (/\bgenerator\s+client\b/.test(blob) && /\bmodel\s+\w+\s*\{/.test(blob)) return "prisma";
  if (/datasource\s+db\s*\{/.test(blob) && /\bmodel\s+\w+\s*\{/.test(blob)) return "prisma";
  if (/(pgTable|mysqlTable|sqliteTable)\s*\(/.test(blob)) return "drizzle";
  if (/z\.object\s*\(/.test(blob) && /from\s+["']zod["']/.test(blob)) return "zod";
  if (/"openapi"\s*:\s*"3/.test(blob) || /openapi:\s*3/.test(blob)) return "openapi";
  if (/^\s*create\s+table/i.test(blob) || /create\s+table\s+\w/.test(lower)) return "sql";
  // JSON schema heuristic
  try {
    const parsed = JSON.parse(files[0]?.content ?? "{}");
    if (parsed.$schema || parsed.properties || parsed.definitions || parsed.$defs) return "json-schema";
    if (parsed.tables) return "json-schema";
  } catch { /* ignore */ }
  return "sql";
}
