// Serialization writers for each output format.
import type { GeneratedDataset, OutputFormat, Row, Table } from "./types";

function escapeSqlString(v: string): string {
  return "'" + v.replace(/'/g, "''") + "'";
}

function sqlValue(v: unknown, dialect: string): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return dialect === "postgres" ? (v ? "TRUE" : "FALSE") : v ? "1" : "0";
  if (v instanceof Date) return escapeSqlString(v.toISOString());
  if (typeof v === "object") return escapeSqlString(JSON.stringify(v));
  return escapeSqlString(String(v));
}

function quoteIdent(name: string, dialect: string): string {
  if (dialect === "mysql") return "`" + name + "`";
  return '"' + name + '"';
}

export function toSql(
  dataset: GeneratedDataset,
  dialect: "postgres" | "mysql" | "sqlite" = "postgres",
): Record<string, string> {
  const result: Record<string, string> = {};
  const tableMap = new Map(dataset.schema.tables.map((t) => [t.name, t]));
  for (const tName of dataset.order) {
    const table = tableMap.get(tName);
    if (!table) continue;
    const rows = dataset.rows[tName] ?? [];
    if (rows.length === 0) {
      result[tName] = `-- No rows generated for ${tName}\n`;
      continue;
    }
    const cols = table.columns.map((c) => c.name);
    const colList = cols.map((c) => quoteIdent(c, dialect)).join(", ");
    const lines: string[] = [];
    lines.push(`-- ${tName} (${rows.length} rows)`);
    for (const r of rows) {
      const vals = cols.map((c) => sqlValue(r[c], dialect)).join(", ");
      lines.push(`INSERT INTO ${quoteIdent(tName, dialect)} (${colList}) VALUES (${vals});`);
    }
    result[tName] = lines.join("\n") + "\n";
  }
  return result;
}

function jsonSerializable(rows: Row[]): Row[] {
  return rows.map((r) => {
    const out: Row = {};
    for (const [k, v] of Object.entries(r)) {
      out[k] = v instanceof Date ? v.toISOString() : v;
    }
    return out;
  });
}

export function toJson(dataset: GeneratedDataset): Record<string, string> {
  const out: Record<string, string> = {};
  for (const tName of dataset.order) {
    out[tName] = JSON.stringify(jsonSerializable(dataset.rows[tName] ?? []), null, 2);
  }
  return out;
}

export function toCsv(dataset: GeneratedDataset): Record<string, string> {
  const out: Record<string, string> = {};
  const tableMap = new Map(dataset.schema.tables.map((t) => [t.name, t]));
  for (const tName of dataset.order) {
    const table = tableMap.get(tName);
    if (!table) continue;
    const cols = table.columns.map((c) => c.name);
    const rows = dataset.rows[tName] ?? [];
    const lines: string[] = [];
    lines.push(cols.join(","));
    for (const r of rows) {
      lines.push(
        cols
          .map((c) => {
            let v = r[c];
            if (v === null || v === undefined) return "";
            if (v instanceof Date) v = v.toISOString();
            if (typeof v === "object") v = JSON.stringify(v);
            const s = String(v);
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(","),
      );
    }
    out[tName] = lines.join("\n") + "\n";
  }
  return out;
}

export function toTypescript(dataset: GeneratedDataset): Record<string, string> {
  const out: Record<string, string> = {};
  for (const tName of dataset.order) {
    const data = jsonSerializable(dataset.rows[tName] ?? []);
    out[tName] = `export const ${safeIdent(tName)} = ${JSON.stringify(data, null, 2)} as const;\n`;
  }
  return out;
}

export function toPython(dataset: GeneratedDataset): Record<string, string> {
  const out: Record<string, string> = {};
  for (const tName of dataset.order) {
    const data = jsonSerializable(dataset.rows[tName] ?? []);
    // Python literal: True/False/None
    const pyLiteral = JSON.stringify(data, null, 2)
      .replace(/\btrue\b/g, "True")
      .replace(/\bfalse\b/g, "False")
      .replace(/\bnull\b/g, "None");
    out[tName] = `${safeIdent(tName)} = ${pyLiteral}\n`;
  }
  return out;
}

function safeIdent(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, "_");
}

export function combineSingle(perTable: Record<string, string>, format: OutputFormat): string {
  if (format === "json") {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(perTable)) obj[k] = JSON.parse(v);
    return JSON.stringify(obj, null, 2);
  }
  return Object.values(perTable).join("\n");
}

export function serialize(
  dataset: GeneratedDataset,
  format: OutputFormat,
  dialect: "postgres" | "mysql" | "sqlite" = "postgres",
): Record<string, string> {
  switch (format) {
    case "sql":
      return toSql(dataset, dialect);
    case "json":
      return toJson(dataset);
    case "csv":
      return toCsv(dataset);
    case "typescript":
      return toTypescript(dataset);
    case "python":
      return toPython(dataset);
  }
}
