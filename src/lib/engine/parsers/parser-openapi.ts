// OpenAPI 3 parser — reads components.schemas → tables.
import type { Column, ColumnKind, Table, UnifiedSchema } from "../types";

function map(t: string | undefined, fmt?: string): ColumnKind {
  if (fmt === "uuid") return "uuid";
  if (fmt === "date-time") return "datetime";
  if (fmt === "date") return "date";
  switch (t) {
    case "integer": return "integer";
    case "number":  return "decimal";
    case "boolean": return "boolean";
    case "string":  return "string";
    case "array":   return "array";
    case "object":  return "json";
  }
  return "unknown";
}

export function parseOpenApi(files: Array<{ name: string; content: string }>): UnifiedSchema {
  const tables: Table[] = [];
  for (const f of files) {
    let doc: any;
    try { doc = JSON.parse(f.content); } catch { continue; }
    const schemas = doc?.components?.schemas;
    if (!schemas || typeof schemas !== "object") continue;
    for (const [name, schema] of Object.entries<any>(schemas)) {
      if (!schema?.properties) continue;
      const required = new Set<string>(schema.required ?? []);
      const columns: Column[] = Object.entries<any>(schema.properties).map(([colName, def]) => {
        const ref = def?.$ref || def?.allOf?.[0]?.$ref;
        const col: Column = {
          name: colName,
          kind: map(def.type, def.format),
          nullable: !required.has(colName),
          isPrimaryKey: colName === "id",
          isUnique: colName === "id",
          isAutoIncrement: false,
          maxLength: typeof def.maxLength === "number" ? def.maxLength : undefined,
          enumValues: Array.isArray(def.enum) ? def.enum.map(String) : undefined,
          rawType: def.format || def.type || "",
        };
        if (col.enumValues) col.kind = "enum";
        if (ref && typeof ref === "string") {
          const t = ref.replace(/^#\/components\/schemas\//, "");
          col.fk = { table: t, column: "id" };
        }
        return col;
      });
      tables.push({ name, columns });
    }
  }
  return { tables, dialect: "postgres", source: "openapi" };
}
