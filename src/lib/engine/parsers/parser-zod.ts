// Zod schema parser — best-effort regex covering z.object({...}).
import type { Column, ColumnKind, Table, UnifiedSchema } from "../types";

const TYPE_RE: Record<string, ColumnKind> = {
  string: "string", number: "decimal", bigint: "bigint",
  boolean: "boolean", date: "datetime",
  any: "unknown", unknown: "unknown",
};

export function parseZod(files: Array<{ name: string; content: string }>): UnifiedSchema {
  const content = files.map((f) => f.content).join("\n");
  const tables: Table[] = [];
  // export const Users = z.object({ ... });
  const objRe = /(?:export\s+)?const\s+(\w+)\s*=\s*z\.object\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = objRe.exec(content))) {
    const tableName = m[1]!;
    const body = m[2]!;
    const columns: Column[] = [];
    // field: z.string().email().optional()
    const fieldRe = /(\w+):\s*z\.(\w+)\(\s*([^)]*)\)((?:\.\w+\([^)]*\))*)/g;
    let fm: RegExpExecArray | null;
    while ((fm = fieldRe.exec(body))) {
      const name = fm[1]!;
      const zType = fm[2]!;
      const chain = fm[4] ?? "";
      let kind: ColumnKind = TYPE_RE[zType] ?? "unknown";
      const col: Column = {
        name, kind,
        nullable: chain.includes(".optional(") || chain.includes(".nullable("),
        isPrimaryKey: name === "id",
        isUnique: name === "id",
        isAutoIncrement: false,
        rawType: `z.${zType}`,
      };
      if (chain.includes(".uuid(")) col.kind = "uuid";
      if (chain.includes(".email(")) col.kind = "string";
      if (chain.includes(".int(")) col.kind = "integer";
      const maxM = chain.match(/\.max\((\d+)\)/);
      if (maxM) col.maxLength = Number(maxM[1]);
      // z.enum([...])
      if (zType === "enum") {
        col.kind = "enum";
        const inner = fm[3] ?? "";
        const vals = [...inner.matchAll(/["'`]([^"'`]+)["'`]/g)].map((x) => x[1]!);
        if (vals.length) col.enumValues = vals;
      }
      columns.push(col);
    }
    if (columns.length) tables.push({ name: tableName, columns });
  }
  return { tables, dialect: "postgres", source: "zod" };
}
