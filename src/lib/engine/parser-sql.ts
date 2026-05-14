// SQL DDL parser → UnifiedSchema. Uses node-sql-parser (pure JS, Worker-safe).
import pkg from "node-sql-parser";
const { Parser } = pkg;
import type { Column, ColumnKind, Table, UnifiedSchema } from "./types";

const parser = new Parser();

/** Robustly extract a column / identifier name from any node-sql-parser node shape. */
function colName(c: unknown): string {
  if (c == null) return "";
  if (typeof c === "string") return c;
  if (typeof c !== "object") return String(c);
  const o = c as Record<string, unknown>;
  // Common shapes across node-sql-parser versions:
  // { type: "column_ref", column: "id" }
  // { type: "column_ref", column: { expr: { type: "default", value: "id" } } }
  // { expr: { value: "id" } }
  // { value: "id" }
  if (typeof o.column === "string") return o.column;
  if (o.column && typeof o.column === "object") return colName(o.column);
  if (o.expr && typeof o.expr === "object") return colName(o.expr);
  if (typeof o.value === "string") return o.value;
  if (typeof o.name === "string") return o.name;
  return "";
}

function dataTypeString(def: any): string {
  const dt = def?.dataType;
  if (typeof dt === "string") return dt;
  if (dt && typeof dt === "object") {
    if (typeof dt.dataType === "string") return dt.dataType;
    if (typeof dt.type === "string") return dt.type;
    if (typeof dt.value === "string") return dt.value;
  }
  return "unknown";
}

function mapType(rawType: string): ColumnKind {
  const t = rawType.toLowerCase();
  if (t.includes("uuid")) return "uuid";
  if (t.includes("bool")) return "boolean";
  if (t.includes("timestamp") || t.includes("datetime")) return "datetime";
  if (t === "date") return "date";
  if (t.includes("json")) return "json";
  if (t.includes("text") || t.includes("clob")) return "text";
  if (t.includes("char") || t.includes("string") || t.includes("varying")) return "string";
  if (t.includes("bigint") || t.includes("int8")) return "bigint";
  if (t.includes("int") || t.includes("serial")) return "integer";
  if (
    t.includes("numeric") ||
    t.includes("decimal") ||
    t.includes("float") ||
    t.includes("double") ||
    t.includes("real")
  )
    return "decimal";
  return "unknown";
}

function tryParse(sql: string, dialect: string): unknown {
  try {
    return parser.astify(sql, { database: dialect });
  } catch {
    return null;
  }
}

function tableNameOf(stmt: any): string {
  const t = stmt?.table;
  if (!t) return "";
  if (Array.isArray(t)) return t[0]?.table ?? "";
  if (typeof t === "object") return t.table ?? "";
  return String(t);
}

export function parseSqlDdl(
  files: Array<{ name: string; content: string }>,
): UnifiedSchema {
  const all = files.map((f) => f.content).join("\n;\n");
  const dialects = ["PostgresQL", "MySQL", "SQLite", "MariaDB"];
  let ast: any = null;
  let usedDialect: "postgres" | "mysql" | "sqlite" = "postgres";
  for (const d of dialects) {
    const r = tryParse(all, d);
    if (r) {
      ast = r;
      usedDialect = d.toLowerCase().includes("mysql")
        ? "mysql"
        : d.toLowerCase().includes("sqlite")
          ? "sqlite"
          : "postgres";
      break;
    }
  }
  if (!ast) throw new Error("Failed to parse SQL DDL with any supported dialect");

  const stmts = Array.isArray(ast) ? ast : [ast];
  const tables: Table[] = [];

  for (const stmt of stmts) {
    if (!stmt || stmt.type !== "create" || stmt.keyword !== "table") continue;
    const tableName = tableNameOf(stmt);
    if (!tableName) continue;

    const columns: Column[] = [];
    const pkCols = new Set<string>();
    const uniqueCols = new Set<string>();
    const fks: Record<string, { table: string; column: string }> = {};

    for (const def of stmt.create_definitions ?? []) {
      if (def.resource === "column") {
        const name = colName(def.column);
        if (!name) continue;
        const rawType = dataTypeString(def.definition);
        const length = def.definition?.length;
        const col: Column = {
          name,
          kind: mapType(rawType),
          nullable: def.nullable?.value !== "not null",
          isPrimaryKey: def.primary_key === "primary key",
          isUnique: def.unique === "unique",
          isAutoIncrement:
            !!def.auto_increment ||
            String(rawType).toLowerCase().includes("serial"),
          maxLength: typeof length === "number" ? length : undefined,
          rawType: String(rawType) + (length ? `(${length})` : ""),
        };
        if (def.reference_definition) {
          const ref = def.reference_definition;
          const refTable =
            (Array.isArray(ref.table) ? ref.table[0]?.table : ref.table?.table) ??
            ref.table;
          const refCol = colName(ref.definition?.[0]) || "id";
          col.fk = { table: String(refTable), column: refCol };
        }
        columns.push(col);
      } else if (def.resource === "constraint") {
        const t = def.constraint_type;
        if (t === "primary key") {
          for (const c of def.definition ?? []) pkCols.add(colName(c));
        } else if (t === "unique" || t === "unique key") {
          for (const c of def.definition ?? []) uniqueCols.add(colName(c));
        } else if (t === "FOREIGN KEY" || t === "foreign key") {
          const localCols = (def.definition ?? []).map((c: any) => colName(c));
          const ref = def.reference_definition;
          const refTable =
            (Array.isArray(ref?.table) ? ref.table[0]?.table : ref?.table?.table) ??
            ref?.table;
          const refCols = (ref?.definition ?? []).map((c: any) => colName(c));
          localCols.forEach((c: string, i: number) => {
            if (c) fks[c] = { table: String(refTable), column: refCols[i] || "id" };
          });
        }
      }
    }

    for (const c of columns) {
      if (pkCols.has(c.name)) c.isPrimaryKey = true;
      if (uniqueCols.has(c.name)) c.isUnique = true;
      if (fks[c.name]) c.fk = fks[c.name];
    }

    tables.push({ name: tableName, columns });
  }

  return { tables, dialect: usedDialect };
}
