// Core data generator: column → value mapping using Faker + heuristics + FK resolution.
import { Faker, allLocales, en, fr, base } from "@faker-js/faker";
import type {
  Column,
  GeneratedDataset,
  GenerateOptions,
  Row,
  Table,
  UnifiedSchema,
} from "./types";
import { topoSort } from "./graph";

function makeFaker(locale: string | undefined, seed: number | undefined): Faker {
  const localeKey = (locale && (allLocales as any)[locale]) ? (allLocales as any)[locale] : null;
  const faker = new Faker({
    locale: localeKey ? [localeKey, en, base] : [en, fr, base],
  });
  if (typeof seed === "number") faker.seed(seed);
  return faker;
}

function pickByName(faker: Faker, col: Column): unknown {
  const n = String(col.name ?? "").toLowerCase();
  // Fast pattern matches by column name
  if (n === "id" || n.endsWith("_id") || col.kind === "uuid") return faker.string.uuid();
  if (/email/.test(n)) return faker.internet.email();
  if (/(first.?name|prenom)/.test(n)) return faker.person.firstName();
  if (/(last.?name|surname|nom)/.test(n)) return faker.person.lastName();
  if (/full.?name|^name$|display.?name|username/.test(n)) return faker.person.fullName();
  if (/avatar|picture|photo|image|thumbnail|cover/.test(n))
    return `https://picsum.photos/seed/${faker.string.alphanumeric(8)}/400/400`;
  if (/phone|mobile|tel/.test(n)) return faker.phone.number();
  if (/address|street/.test(n)) return faker.location.streetAddress();
  if (/city|ville/.test(n)) return faker.location.city();
  if (/country|pays/.test(n)) return faker.location.country();
  if (/zip|postal|cp/.test(n)) return faker.location.zipCode();
  if (/lat/.test(n)) return faker.location.latitude();
  if (/lng|lon/.test(n)) return faker.location.longitude();
  if (/url|website|link/.test(n)) return faker.internet.url();
  if (/slug/.test(n)) return faker.lorem.slug();
  if (/password/.test(n)) return faker.internet.password({ length: 16 });
  if (/title|subject/.test(n)) return faker.lorem.sentence({ min: 3, max: 8 });
  if (/bio|about|description|content|body|message|comment|note/.test(n))
    return faker.lorem.paragraph();
  if (/tag|category|kind|type/.test(n) && col.kind === "string")
    return faker.helpers.arrayElement(["alpha", "beta", "gamma", "delta", "omega"]);
  if (/status|state/.test(n) && col.kind === "string")
    return faker.helpers.arrayElement(["active", "pending", "archived", "draft"]);
  if (/price|amount|total|cost|salary|fee/.test(n))
    return Number(faker.commerce.price({ min: 1, max: 9999 }));
  if (/quantity|count|qty|stock/.test(n)) return faker.number.int({ min: 0, max: 500 });
  if (/age/.test(n)) return faker.number.int({ min: 18, max: 80 });
  if (/rating|score/.test(n)) return faker.number.float({ min: 0, max: 5, fractionDigits: 1 });
  if (/color|colour/.test(n)) return faker.color.human();
  if (/company|organisation|organization|brand/.test(n)) return faker.company.name();
  if (/job|position|role|title/.test(n)) return faker.person.jobTitle();
  if (/product/.test(n)) return faker.commerce.productName();
  if (/(created|inserted).?at/.test(n)) return faker.date.past({ years: 1 });
  if (/(updated|modified).?at/.test(n)) return faker.date.recent({ days: 30 });
  if (/(deleted|expired).?at/.test(n)) return null;
  return undefined;
}

function pickByType(faker: Faker, col: Column): unknown {
  switch (col.kind) {
    case "uuid":
      return faker.string.uuid();
    case "string":
      return faker.lorem.words({ min: 1, max: 3 }).slice(0, col.maxLength ?? 80);
    case "text":
      return faker.lorem.paragraphs(2);
    case "integer":
      return faker.number.int({ min: 1, max: 1_000_000 });
    case "bigint":
      return faker.number.int({ min: 1, max: 9_999_999 });
    case "decimal":
      return faker.number.float({ min: 0, max: 10000, fractionDigits: 2 });
    case "boolean":
      return faker.datatype.boolean();
    case "date":
      return faker.date.past({ years: 5 }).toISOString().slice(0, 10);
    case "datetime":
      return faker.date.past({ years: 2 });
    case "json":
      return { value: faker.lorem.word() };
    case "enum":
      return col.enumValues ? faker.helpers.arrayElement(col.enumValues) : null;
    default:
      return faker.lorem.word();
  }
}

function pickByHint(faker: Faker, hint: string): unknown {
  switch (hint) {
    case "name": return faker.person.fullName();
    case "email": return faker.internet.email();
    case "bio": return faker.person.bio();
    case "title": return faker.lorem.sentence({ min: 3, max: 8 });
    case "company": return faker.company.name();
    case "product": return faker.commerce.productName();
    case "address": return faker.location.streetAddress();
    case "phone": return faker.phone.number();
    case "url": return faker.internet.url();
    case "sentence": return faker.lorem.sentence();
    case "paragraph": return faker.lorem.paragraph();
    case "uuid": return faker.string.uuid();
    case "date": return faker.date.past({ years: 1 });
    case "price": return Number(faker.commerce.price({ min: 1, max: 9999 }));
    default: return undefined;
  }
}

function valueFor(
  faker: Faker,
  col: Column,
  parentPks: Map<string, unknown[]>,
): unknown {
  if (col.fk) {
    const pool = parentPks.get(col.fk.table) ?? [];
    if (pool.length === 0) return col.nullable ? null : faker.string.uuid();
    return faker.helpers.arrayElement(pool);
  }
  if (col.enumValues && col.enumValues.length > 0) {
    return faker.helpers.arrayElement(col.enumValues);
  }
  const aiHint = (col as any).aiHint as string | undefined;
  if (aiHint) {
    const v = pickByHint(faker, aiHint);
    if (v !== undefined) return v;
  }
  const byName = pickByName(faker, col);
  if (byName !== undefined) return byName;
  return pickByType(faker, col);
}

function pickPkColumn(table: Table): Column | undefined {
  return (
    table.columns.find((c) => c.isPrimaryKey) ??
    table.columns.find((c) => c.name.toLowerCase() === "id")
  );
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
  spec: RowSpec | undefined,
  table: Table,
  defaultRows: number,
  resolved: Map<string, number>,
): number {
  const clamp = (n: number) => Math.max(0, Math.min(100_000, Math.round(n)));
  if (spec === undefined) return clamp(defaultRows);
  if (typeof spec === "number") return clamp(spec);
  if (typeof spec === "object" && "count" in spec) return clamp(spec.count);
  if (typeof spec === "object" && "perParent" in spec) {
    const pc = resolved.get(spec.parent) ?? defaultRows;
    return clamp(pc * spec.perParent);
  }
  // "auto"
  const fkCols = table.columns.filter((c) => c.fk);
  if (fkCols.length === 0) return clamp(defaultRows);
  // Pick the primary parent: first FK that is also unique-ish or the first one
  const parent = fkCols[0]!.fk!.table;
  const parentCount = resolved.get(parent) ?? defaultRows;
  return clamp(parentCount * heuristicPerParent(table.name));
}

export function generate(
  schema: UnifiedSchema,
  options: GenerateOptions = {},
): GeneratedDataset & { warnings: string[] } {
  const faker = makeFaker(options.locale, options.seed);
  const { order, warnings } = topoSort(schema);
  const tableMap = new Map(schema.tables.map((t) => [t.name, t]));
  const rows: Record<string, Row[]> = {};
  const parentPks = new Map<string, unknown[]>();
  const resolvedCounts = new Map<string, number>();

  const defaultSpec = options.rowsPerTable?.default;
  const defaultRows =
    typeof defaultSpec === "number"
      ? defaultSpec
      : typeof defaultSpec === "object" && defaultSpec && "count" in defaultSpec
        ? defaultSpec.count
        : 10;

  for (const tName of order) {
    const table = tableMap.get(tName);
    if (!table) continue;
    const spec = options.rowsPerTable?.[tName];
    const n = resolveRowCount(spec, table, defaultRows, resolvedCounts);
    resolvedCounts.set(tName, n);
      const row: Row = {};
      for (const col of table.columns) {
        // Skip auto-increment columns; let the DB assign — but for SQL output we
        // include them only when not autoincrement. For JSON we still emit value.
        if (col.isAutoIncrement && pkCol === col) {
          row[col.name] = i + 1;
          continue;
        }
        let v = valueFor(faker, col, parentPks);

        // Enforce uniqueness with retries
        if (col.isUnique || col.isPrimaryKey) {
          const seen = seenUnique.get(col.name) ?? new Set<string>();
          let tries = 0;
          while (seen.has(String(v)) && tries < 10) {
            v = valueFor(faker, col, parentPks);
            tries++;
          }
          seen.add(String(v));
          seenUnique.set(col.name, seen);
        }

        // Enforce maxLength for strings
        if (typeof v === "string" && col.maxLength && v.length > col.maxLength) {
          v = v.slice(0, col.maxLength);
        }

        row[col.name] = v;
      }
      tableRows.push(row);
    }

    rows[tName] = tableRows;

    if (pkCol) {
      parentPks.set(
        tName,
        tableRows.map((r) => r[pkCol.name]),
      );
    }
  }

  return { order, rows, schema, warnings };
}
