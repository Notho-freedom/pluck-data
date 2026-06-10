// Core data generator v3 — persona-aware, asset-aware, domain-aware, rich types.
import { Faker, allLocales, en, fr, base } from "@faker-js/faker";
import type {
  Column, GeneratedDataset, GenerateOptions, Row, RowSpec, Table, UnifiedSchema, AssetSpec, Persona,
} from "./types";
import { topoSort } from "./graph";
import { makePersona } from "./personas";
import { detectCoherence, isPeopleTable, valueFromPersona } from "./coherence";
import { detectDomain, domainValue, type Domain } from "./domain";
import { detectAssetColumn, generateAsset, resolveAssetSpec } from "./assets";
import { richValue } from "./types-rich";

function makeFaker(locale: string | undefined, seed: number | undefined): Faker {
  const localeKey = (locale && (allLocales as any)[locale]) ? (allLocales as any)[locale] : null;
  const faker = new Faker({ locale: localeKey ? [localeKey, en, base] : [en, fr, base] });
  if (typeof seed === "number") faker.seed(seed);
  return faker;
}

function pickByName(faker: Faker, col: Column, domain: Domain, table: string): unknown {
  const n = String(col.name ?? "").toLowerCase();
  if (n === "id" || n.endsWith("_id") || col.kind === "uuid") return faker.string.uuid();
  // Domain-specific first
  const d = domainValue({ faker, column: col.name, table, domain });
  if (d !== undefined) return d;
  if (/url|website|link/.test(n)) return faker.internet.url();
  if (/slug/.test(n)) return faker.lorem.slug();
  if (/password/.test(n)) return faker.internet.password({ length: 16 });
  if (/title|subject/.test(n)) return faker.lorem.sentence({ min: 3, max: 8 });
  if (/bio|about|description|content|body|message|comment|note/.test(n)) return faker.lorem.paragraph();
  if (/tag|category|kind|type/.test(n) && col.kind === "string")
    return faker.helpers.arrayElement(["alpha","beta","gamma","delta","omega"]);
  if (/status|state/.test(n) && col.kind === "string")
    return faker.helpers.arrayElement(["active","pending","archived","draft"]);
  if (/price|amount|total|cost|salary|fee/.test(n)) return Number(faker.commerce.price({ min: 1, max: 9999 }));
  if (/quantity|count|qty|stock/.test(n)) return faker.number.int({ min: 0, max: 500 });
  if (/age/.test(n)) return faker.number.int({ min: 18, max: 80 });
  if (/rating|score/.test(n)) return faker.number.float({ min: 0, max: 5, fractionDigits: 1 });
  if (/color|colour/.test(n)) return faker.color.human();
  if (/company|organisation|organization|brand/.test(n)) return faker.company.name();
  if (/job|position|role/.test(n)) return faker.person.jobTitle();
  if (/product/.test(n)) return faker.commerce.productName();
  if (/(created|inserted).?at/.test(n)) return faker.date.past({ years: 1 });
  if (/(updated|modified).?at/.test(n)) return faker.date.recent({ days: 30 });
  if (/(deleted|expired).?at/.test(n)) return null;
  return undefined;
}

function pickByType(faker: Faker, col: Column): unknown {
  switch (col.kind) {
    case "uuid":     return faker.string.uuid();
    case "string":   return faker.lorem.words({ min: 1, max: 3 }).slice(0, col.maxLength ?? 80);
    case "text":     return faker.lorem.paragraphs(2);
    case "integer":  return faker.number.int({ min: 1, max: 1_000_000 });
    case "bigint":   return faker.number.int({ min: 1, max: 9_999_999 });
    case "decimal":  return faker.number.float({ min: 0, max: 10000, fractionDigits: 2 });
    case "boolean":  return faker.datatype.boolean();
    case "date":     return faker.date.past({ years: 5 }).toISOString().slice(0, 10);
    case "datetime": return faker.date.past({ years: 2 });
    case "json":     return { value: faker.lorem.word() };
    case "enum":     return col.enumValues ? faker.helpers.arrayElement(col.enumValues) : null;
    default:         return faker.lorem.word();
  }
}

function pickPkColumn(table: Table): Column | undefined {
  return table.columns.find((c) => c.isPrimaryKey)
    ?? table.columns.find((c) => c.name.toLowerCase() === "id");
}

function heuristicPerParent(tableName: string): number {
  const n = tableName.toLowerCase();
  if (/messages?|events?|logs?|activity|activities|notifications?/.test(n)) return 12;
  if (/comments?|reactions?|likes?|views?/.test(n)) return 8;
  if (/items?|line_?items?|order_?lines?/.test(n)) return 4;
  if (/orders?|posts?|tasks?|sessions?/.test(n)) return 3;
  return 3;
}

function resolveRowCount(
  spec: RowSpec | undefined, table: Table, defaultRows: number, resolved: Map<string, number>,
): number {
  const clamp = (n: number) => Math.max(0, Math.min(100_000, Math.round(n)));
  if (spec === undefined) return clamp(defaultRows);
  if (typeof spec === "number") return clamp(spec);
  if (typeof spec === "object" && "count" in spec) return clamp(spec.count);
  if (typeof spec === "object" && "perParent" in spec) {
    const pc = resolved.get(spec.parent) ?? defaultRows;
    return clamp(pc * spec.perParent);
  }
  const fkCols = table.columns.filter((c) => c.fk);
  if (fkCols.length === 0) return clamp(defaultRows);
  const parent = fkCols[0]!.fk!.table;
  const parentCount = resolved.get(parent) ?? defaultRows;
  return clamp(parentCount * heuristicPerParent(table.name));
}

function resolveAssetForColumn(
  col: Column, table: string, options: GenerateOptions,
): AssetSpec | null {
  if (!detectAssetColumn(col)) return null;
  const explicit = options.assets?.[`${table}.${col.name}`] ?? options.assets?.[`*.${col.name}`];
  return resolveAssetSpec(explicit, col, table);
}

export function generate(
  schema: UnifiedSchema, options: GenerateOptions = {},
): GeneratedDataset & { warnings: string[]; domain: Domain; assetsUsed: Record<string, string> } {
  const faker = makeFaker(options.locale, options.seed);
  const { order, warnings } = topoSort(schema);
  const tableMap = new Map(schema.tables.map((t) => [t.name, t]));
  const rows: Record<string, Row[]> = {};
  const parentPks = new Map<string, unknown[]>();
  const resolvedCounts = new Map<string, number>();
  const domain: Domain = (options.domain as Domain) ?? detectDomain(schema);
  const useCoherence = options.coherence !== false;
  const assetsUsed: Record<string, string> = {};

  const defaultSpec = options.rowsPerTable?.default;
  const defaultRows =
    typeof defaultSpec === "number" ? defaultSpec
    : typeof defaultSpec === "object" && defaultSpec && "count" in defaultSpec ? defaultSpec.count
    : 10;

  for (const tName of order) {
    const table = tableMap.get(tName);
    if (!table) continue;
    const spec = options.rowsPerTable?.[tName];
    const n = resolveRowCount(spec, table, defaultRows, resolvedCounts);
    resolvedCounts.set(tName, n);

    const coherence = useCoherence ? detectCoherence(table) : null;
    const usePersonas = useCoherence && (coherence?.isPeople || isPeopleTable(table));

    // Precompute asset specs
    const assetMap = new Map<string, AssetSpec>();
    for (const c of table.columns) {
      const a = resolveAssetForColumn(c, tName, options);
      if (a) { assetMap.set(c.name, a); assetsUsed[`${tName}.${c.name}`] = a.strategy; }
    }

    const tableRows: Row[] = [];
    const seenUnique = new Map<string, Set<string>>();
    const pkCol = pickPkColumn(table);

    for (let i = 0; i < n; i++) {
      const persona: Persona | undefined = usePersonas
        ? makePersona(faker, options.locale, i)
        : undefined;
      const row: Row = {};

      for (const col of table.columns) {
        if (col.isAutoIncrement && pkCol === col) { row[col.name] = i + 1; continue; }
        let v: unknown;

        // 1) FK from parent pool
        if (col.fk) {
          const pool = parentPks.get(col.fk.table) ?? [];
          v = pool.length > 0
            ? faker.helpers.arrayElement(pool)
            : (col.nullable ? null : faker.string.uuid());
        }
        // 2) Asset column
        else if (assetMap.has(col.name)) {
          v = generateAsset(assetMap.get(col.name)!, { faker, persona, rowIndex: i, table: tName });
        }
        // 3) Persona-derived coherence
        else if (persona && coherence?.cols[col.name]) {
          v = valueFromPersona(persona, coherence.cols[col.name]!);
        }
        // 4) Enum
        else if (col.enumValues && col.enumValues.length > 0) {
          v = faker.helpers.arrayElement(col.enumValues);
        }
        // 5) Rich types (vector, geo, array, inet, interval, bytea)
        else {
          const rich = richValue(faker, col);
          if (rich !== undefined) v = rich;
          else {
            // 6) AI hint
            const aiHint = (col as any).aiHint as string | undefined;
            if (aiHint) v = pickByType(faker, col);
            // 7) By name (domain-aware)
            if (v === undefined) {
              const byName = pickByName(faker, col, domain, tName);
              if (byName !== undefined) v = byName;
            }
            // 8) Fallback by type
            if (v === undefined) v = pickByType(faker, col);
          }
        }

        // Uniqueness
        if (col.isUnique || col.isPrimaryKey) {
          const seen = seenUnique.get(col.name) ?? new Set<string>();
          let tries = 0;
          while (seen.has(String(v)) && tries < 10) {
            v = col.fk ? faker.string.uuid() : pickByType(faker, col);
            tries++;
          }
          seen.add(String(v));
          seenUnique.set(col.name, seen);
        }

        // maxLength
        if (typeof v === "string" && col.maxLength && v.length > col.maxLength) {
          v = v.slice(0, col.maxLength);
        }

        row[col.name] = v;
      }
      tableRows.push(row);
    }

    rows[tName] = tableRows;
    if (pkCol) parentPks.set(tName, tableRows.map((r) => r[pkCol.name]));
  }

  return { order, rows, schema, warnings, domain, assetsUsed };
}
