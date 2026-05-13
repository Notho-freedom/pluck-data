// Build dependency graph and topologically sort tables (parents first).
import type { UnifiedSchema } from "./types";

export function topoSort(schema: UnifiedSchema): { order: string[]; warnings: string[] } {
  const warnings: string[] = [];
  const tableNames = new Set(schema.tables.map((t) => t.name));
  const deps = new Map<string, Set<string>>();

  for (const t of schema.tables) {
    const set = new Set<string>();
    for (const c of t.columns) {
      if (c.fk && tableNames.has(c.fk.table) && c.fk.table !== t.name) {
        set.add(c.fk.table);
      }
    }
    deps.set(t.name, set);
  }

  const order: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(name: string) {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      warnings.push(`Cycle detected involving ${name}; FK may be broken in some rows.`);
      return;
    }
    visiting.add(name);
    for (const d of deps.get(name) ?? []) visit(d);
    visiting.delete(name);
    visited.add(name);
    order.push(name);
  }

  for (const t of schema.tables) visit(t.name);
  return { order, warnings };
}
