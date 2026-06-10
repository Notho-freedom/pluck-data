// Drizzle ORM parser — best-effort regex; covers pgTable/mysqlTable/sqliteTable.
import type { Column, ColumnKind, Table, UnifiedSchema } from "../types";

const TYPE_MAP: Record<string, ColumnKind> = {
  text: "text", varchar: "string", char: "string",
  integer: "integer", int: "integer", smallint: "integer",
  bigint: "bigint", serial: "integer", bigserial: "bigint",
  numeric: "decimal", decimal: "decimal", real: "decimal", doublePrecision: "decimal",
  boolean: "boolean", timestamp: "datetime", date: "date",
  json: "json", jsonb: "json", uuid: "uuid",
  vector: "vector",
};

export function parseDrizzle(files: Array<{ name: string; content: string }>): UnifiedSchema {
  const content = files.map((f) => f.content).join("\n");
  const tables: Table[] = [];
  // Match: export const users = pgTable("users", { ...fields... }, ...)
  const tableRe = /(?:export\s+)?const\s+\w+\s*=\s*(?:pgTable|mysqlTable|sqliteTable)\s*\(\s*["'`](\w+)["'`]\s*,\s*\{([\s\S]*?)\}\s*[,)]/g;
  let m: RegExpExecArray | null;
  while ((m = tableRe.exec(content))) {
    const tableName = m[1]!;
    const fieldsBlock = m[2]!;
    const columns: Column[] = [];
    // field: type("col_name"[, opts]).chain().chain()
    const fieldRe = /(\w+):\s*(\w+)\s*\(\s*(?:["'`](\w+)["'`])?\s*(?:,\s*\{([^}]*)\})?\s*\)([^,\n]*)/g;
    let fm: RegExpExecArray | null;
    while ((fm = fieldRe.exec(fieldsBlock))) {
      const jsName = fm[1]!;
      const drizzleType = fm[2]!;
      const colName = fm[3] ?? jsName;
      const opts = fm[4] ?? "";
      const chain = fm[5] ?? "";
      const kind = TYPE_MAP[drizzleType] ?? "unknown";
      const col: Column = {
        name: colName,
        kind,
        nullable: !chain.includes(".notNull("),
        isPrimaryKey: chain.includes(".primaryKey("),
        isUnique: chain.includes(".unique("),
        isAutoIncrement: drizzleType === "serial" || drizzleType === "bigserial",
        rawType: drizzleType,
      };
      if (drizzleType === "vector") {
        const dimM = opts.match(/dimensions:\s*(\d+)/);
        col.meta = { vectorDim: dimM ? Number(dimM[1]) : 1536 };
      }
      const lenM = opts.match(/length:\s*(\d+)/);
      if (lenM) col.maxLength = Number(lenM[1]);
      // .references(() => users.id)
      const refM = chain.match(/\.references\(\s*\(\s*\)\s*=>\s*(\w+)\.(\w+)/);
      if (refM) col.fk = { table: refM[1]!, column: refM[2]! };
      columns.push(col);
    }
    if (columns.length) tables.push({ name: tableName, columns });
  }
  return { tables, dialect: content.includes("mysqlTable") ? "mysql" : "postgres", source: "drizzle" };
}
