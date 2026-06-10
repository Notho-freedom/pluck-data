// Image / asset strategies. Returns URL strings; never blocks generation.
import type { AssetSpec, AssetStrategy, Column, Persona } from "./types";

const DICEBEAR_STYLES = ["avataaars","lorelei","notionists","fun-emoji","thumbs","personas","micah","adventurer"];

function tableKeyword(table: string): string {
  const n = table.toLowerCase().replace(/s$/, "");
  // Map common table names to evocative unsplash keywords
  const map: Record<string, string> = {
    product: "product", item: "product", order: "shopping",
    user: "portrait", profile: "portrait", customer: "portrait", patient: "portrait",
    post: "lifestyle", article: "writing", blog: "writing",
    listing: "interior", property: "architecture", house: "architecture",
    car: "automobile", vehicle: "automobile",
    food: "food", meal: "food", recipe: "food",
    book: "book", course: "education", lesson: "education",
    event: "event", venue: "venue",
    company: "office", brand: "office",
    place: "city", city: "city",
  };
  return map[n] ?? n.replace(/[^a-z0-9]/g, "") || "abstract";
}

export function detectAssetColumn(col: Column): boolean {
  const n = col.name.toLowerCase();
  return /avatar|photo|picture|image|thumbnail|thumb|cover|banner|logo|icon|asset|attachment/.test(n)
    && (col.kind === "string" || col.kind === "text" || col.kind === "unknown");
}

export function suggestStrategy(col: Column, table: string): AssetStrategy {
  const n = col.name.toLowerCase();
  if (/avatar/.test(n)) return "dicebear";
  if (/photo|picture/.test(n)) return "pravatar";
  if (/logo|icon/.test(n)) return "dicebear";
  if (/cover|banner|thumbnail|thumb|image/.test(n)) return "picsum";
  // tables of products/places → unsplash by keyword
  const t = table.toLowerCase();
  if (/product|listing|property|food|recipe|place|event|venue|car|book/.test(t)) return "unsplash";
  return "picsum";
}

export function resolveAssetSpec(input: AssetSpec | AssetStrategy | undefined, col: Column, table: string): AssetSpec {
  if (!input) return { strategy: suggestStrategy(col, table), width: 400, height: 400 };
  if (typeof input === "string") return { strategy: input, width: 400, height: 400 };
  return { width: 400, height: 400, ...input };
}

export interface AssetContext {
  faker: any;
  persona?: Persona;
  rowIndex: number;
  table: string;
}

export function generateAsset(spec: AssetSpec, ctx: AssetContext): string {
  const w = spec.width ?? 400;
  const h = spec.height ?? 400;
  const seed = spec.strategy === "dicebear" && ctx.persona
    ? ctx.persona.avatarSeed
    : `${ctx.table}-${ctx.rowIndex}-${ctx.faker.string.alphanumeric(6)}`;

  switch (spec.strategy) {
    case "dicebear": {
      const style = spec.style && DICEBEAR_STYLES.includes(spec.style)
        ? spec.style
        : ctx.faker.helpers.arrayElement(DICEBEAR_STYLES);
      return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
    }
    case "pravatar":
      return `https://i.pravatar.cc/${w}?u=${encodeURIComponent(seed)}`;
    case "picsum":
      return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
    case "unsplash": {
      const kw = spec.keyword ?? tableKeyword(ctx.table);
      return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(kw)}&sig=${ctx.rowIndex}`;
    }
    case "ai":
      // Lazy: defer to server-side AI image generation if enabled. For
      // worker safety we just return a deterministic picsum URL marked with
      // an `ai=` query so consumers can swap later.
      return `https://picsum.photos/seed/ai-${encodeURIComponent(seed)}/${w}/${h}?ai=1`;
    case "none":
    default:
      return "";
  }
}
