// Prisma schema parser — regex-based, worker-safe, no deps.
import type { Column, ColumnKind, Table, UnifiedSchema, ForeignKey } from "../types";

const TYPE_MAP: Record<string, ColumnKind> = {
  String: "string", Int: "integer", BigInt: "bigint",
  Float: "decimal", Decimal: "decimal", Boolean: "boolean",
  DateTime: "datetime", Json: "json", Bytes: "bytea", Uuid: "uuid",
};

interface PrismaField {
  name: string;
  type: string;
  isList: boolean;
  isOptional: boolean;
  attrs: string;
}

function parseFields(body: string): PrismaField[] {
  const out: PrismaField[] = [];
  for (const raw of body.split(/\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("//") || line.startsWith("@@")) continue;
    // name Type[]? @attrs...
    const m = line.match(/^(\w+)\s+([A-Za-z_][\w]*)(\[\])?(\?)?\s*(.*)$/);
    if (!m) continue;
    out.push({
      name: m[1]!, type: m[2]!,
      isList: !!m[3], isOptional: !!m[4],
      attrs: m[5] ?? "",
    });
  }
  return out;
}

function parseEnums(content: string): Map<string, string[]> {
  const enums = new Map<string, string[]>();
  const re = /enum\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    const name = m[1]!;
    const values = m[2]!.split(/\n/)
      .map((l) => l.trim()).filter((l) => l && !l.startsWith("//"))
      .map((l) => l.split(/\s+/)[0]!);
    enums.set(name, values);
  }
  return enums;
}

export function parsePrisma(files: Array<{ name: string; content: string }>): UnifiedSchema {
  const content = files.map((f) => f.content).join("\n");
  const enums = parseEnums(content);
  const tables: Table[] = [];
  const modelNames = new Set<string>();
  const modelRe = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  let m: RegExpExecArray | null;
  // First pass: collect model names
  const bodies: Array<{ name: string; body: string }> = [];
  while ((m = modelRe.exec(content))) {
    bodies.push({ name: m[1]!, body: m[2]! });
    modelNames.add(m[1]!);
  }
  for (const { name, body } of bodies) {
    const fields = parseFields(body);
    // Find @relation(fields: [x], references: [y]) to map FK scalar columns
    const relMap = new Map<string, ForeignKey>(); // scalarField → fk
    for (const f of fields) {
      const relMatch = f.attrs.match(/@relation\s*\(([^)]*)\)/);
      if (relMatch && modelNames.has(f.type)) {
        const inner = relMatch[1]!;
        const fk = inner.match(/fields:\s*\[(\w+)\]/);
        const refs = inner.match(/references:\s*\[(\w+)\]/);
        if (fk && refs) relMap.set(fk[1]!, { table: f.type, column: refs[1]! });
      }
    }
    const columns: Column[] = [];
    for (const f of fields) {
      // Skip pure relation fields (no scalar) — they reference a model with no @relation columns mapping
      if (modelNames.has(f.type) && !f.attrs.includes("@relation")) continue;
      if (modelNames.has(f.type) && f.attrs.includes("@relation")) continue;
      const isEnum = enums.has(f.type);
      const kind: ColumnKind = isEnum ? "enum" : (TYPE_MAP[f.type] ?? "unknown");
      const col: Column = {
        name: f.name,
        kind: f.isList ? "array" : kind,
        nullable: f.isOptional,
        isPrimaryKey: /@id\b/.test(f.attrs),
        isUnique: /@unique\b/.test(f.attrs),
        isAutoIncrement: /autoincrement\(\)/.test(f.attrs),
        rawType: f.type + (f.isList ? "[]" : ""),
        enumValues: isEnum ? enums.get(f.type) : undefined,
        meta: f.isList ? { arrayOf: kind } : undefined,
      };
      // @default(uuid()/cuid()/now())
      if (/uuid\(\)|cuid\(\)/.test(f.attrs)) col.kind = "uuid";
      if (relMap.has(f.name)) col.fk = relMap.get(f.name)!;
      // VarChar(N)
      const lenMatch = f.attrs.match(/@db\.VarChar\((\d+)\)/);
      if (lenMatch) col.maxLength = Number(lenMatch[1]);
      columns.push(col);
    }
    tables.push({ name, columns });
  }
  return { tables, dialect: "postgres", source: "prisma" };
}
