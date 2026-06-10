// Core types for the DataSeed v3 engine. Pure types only.

export type ColumnKind =
  | "string"
  | "text"
  | "integer"
  | "bigint"
  | "decimal"
  | "boolean"
  | "date"
  | "datetime"
  | "uuid"
  | "json"
  | "enum"
  | "array"
  | "vector"
  | "geo-point"
  | "inet"
  | "interval"
  | "bytea"
  | "unknown";

export interface ForeignKey { table: string; column: string }

export interface Column {
  name: string;
  kind: ColumnKind;
  nullable: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  isAutoIncrement: boolean;
  defaultValue?: string | null;
  maxLength?: number;
  enumValues?: string[];
  fk?: ForeignKey;
  rawType?: string;
  /** For vector(N), array element kind, etc. */
  meta?: {
    vectorDim?: number;
    arrayOf?: ColumnKind;
    check?: string;        // raw CHECK expression (best-effort)
    min?: number;
    max?: number;
  };
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface UnifiedSchema {
  tables: Table[];
  dialect?: "postgres" | "mysql" | "sqlite";
  /** Parser that produced this schema (sql, prisma, drizzle, zod, openapi, json) */
  source?: string;
}

export type OutputFormat = "sql" | "json" | "csv" | "typescript" | "python";
export type OutputMode = "single" | "per-table";

export type RowSpec =
  | number
  | "auto"
  | { count: number }
  | { perParent: number; parent: string };

/** Per-column asset strategy. */
export type AssetStrategy =
  | "dicebear"
  | "pravatar"
  | "picsum"
  | "unsplash"
  | "ai"
  | "none";

export interface AssetSpec {
  strategy: AssetStrategy;
  /** Optional keyword for unsplash/AI (defaults to table-name derived) */
  keyword?: string;
  /** width, height for image URLs */
  width?: number;
  height?: number;
  /** dicebear style (avataaars, lorelei, notionists…) */
  style?: string;
}

export interface GenerateOptions {
  rowsPerTable?: Record<string, RowSpec> & { default?: RowSpec };
  /** Map "table.column" or "*.column" → asset strategy. */
  assets?: Record<string, AssetSpec | AssetStrategy>;
  locale?: string;
  seed?: number;
  realism?: "basic" | "enriched";
  ai_enrichment?: "off" | "validate" | "fill-gaps" | "full";
  /** Forced domain hint (medical, ecommerce, crm, finance, saas, education, logistics, realestate). */
  domain?: string;
  /** Enable persona-based coherence (default true) */
  coherence?: boolean;
}

export interface GenerateRequest {
  input: {
    type: "sql" | "prisma" | "drizzle" | "zod" | "openapi" | "json-schema" | "auto";
    files: Array<{ name: string; content: string }>;
  };
  output: {
    format: OutputFormat;
    mode?: OutputMode;
    sql_dialect?: "postgres" | "mysql" | "sqlite";
  };
  options?: GenerateOptions;
  /** Inline .dataseed.json — merged into options. */
  config?: Partial<GenerateOptions> & { schema?: string };
}

export type Row = Record<string, unknown>;

export interface GeneratedDataset {
  order: string[];
  rows: Record<string, Row[]>;
  schema: UnifiedSchema;
}

export interface GenerationReport {
  totalRows: number;
  perTable: Record<string, number>;
  durationMs: number;
  warnings: string[];
  order: string[];
  aiCalls: number;
  domain?: string;
  aiIssues?: string[];
  /** Per-column-cluster image strategy used. */
  assets?: Record<string, AssetStrategy>;
  parser?: string;
}

/** A persona is a coherent identity shared across columns of a single row. */
export interface Persona {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  avatarSeed: string;
  country: string;
  countryCode: string;
  city: string;
  zip: string;
  language: string;
  currency: string;
  timezone: string;
  gender: "male" | "female";
  ageYears: number;
}
