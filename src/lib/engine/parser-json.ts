// JSON Schema → UnifiedSchema. Supports a simple subset:
// either a top-level object with `tables: { tableName: { columns: {...} } }`
// or a JSON Schema where each `definitions` / `properties` entry is a table.
import type { Column, ColumnKind, Table, UnifiedSchema } from "./types";

function mapJsonType(t: string | string[] | undefined, fmt?: string): ColumnKind {
  const type = Array.isArray(t) ? t.find((x) => x !== "null") : t;
  if (!type) return "unknown";
  if (fmt === "uuid") return "uuid";
  if (fmt === "date-time") return "datetime";
  if (fmt === "date") return "date";
  if (fmt === "email") return "string";
  switch (type) {
    case "integer":
      return "integer";
    case "number":
      return "decimal";
    case "boolean":
      return "boolean";
    case "string":
      return "string";
    case "object":
    case "array":
      return "json";
  }
  return "unknown";
}

export function parseJsonSchema(
  files: Array<{ name: string; content: string }>,
): UnifiedSchema {
  const tables: Table[] = [];

  for (const f of files) {
    let parsed: any;
    try {
      parsed = JSON.parse(f.content);
    } catch (e) {
      throw new Error(`Invalid JSON in ${f.name}: ${(e as Error).message}`);
    }

    // Format A: { tables: { name: { columns: {...} } } }
    if (parsed.tables && typeof parsed.tables === "object") {
      for (const [tName, tDef] of Object.entries<any>(parsed.tables)) {
        tables.push(buildTable(tName, tDef.columns ?? tDef.properties ?? {}, tDef.required ?? []));
      }
      continue;
    }

    // Format B: top-level JSON Schema with `definitions`
    const defs = parsed.definitions ?? parsed.$defs;
    if (defs && typeof defs === "object") {
      for (const [tName, tDef] of Object.entries<any>(defs)) {
        tables.push(buildTable(tName, tDef.properties ?? {}, tDef.required ?? []));
      }
      continue;
    }

    // Format C: single object schema → infer one table from filename
    if (parsed.properties) {
      const tName = f.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_");
      tables.push(buildTable(tName, parsed.properties, parsed.required ?? []));
    }
  }

  return { tables, dialect: "postgres" };
}

function buildTable(name: string, props: Record<string, any>, required: string[]): Table {
  const requiredSet = new Set(required);
  const columns: Column[] = Object.entries(props).map(([colName, def]) => {
    const col: Column = {
      name: colName,
      kind: mapJsonType(def.type, def.format),
      nullable: !requiredSet.has(colName),
      isPrimaryKey: colName === "id" || !!def.primaryKey,
      isUnique: !!def.unique || colName === "id",
      isAutoIncrement: false,
      maxLength: typeof def.maxLength === "number" ? def.maxLength : undefined,
      enumValues: Array.isArray(def.enum) ? def.enum.map(String) : undefined,
      rawType: def.format || def.type,
    };
    if (col.enumValues) col.kind = "enum";
    if (def.foreignKey || def.$ref) {
      const ref = def.foreignKey || def.$ref;
      const refStr = typeof ref === "string" ? ref : `${ref.table}.${ref.column}`;
      const [t, c] = refStr.replace(/^#\/(definitions|\$defs)\//, "").split(".");
      col.fk = { table: t, column: c || "id" };
    }
    return col;
  });
  return { name, columns };
}
