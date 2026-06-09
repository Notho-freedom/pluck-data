// Core types for the DataSeed generation engine.
// Pure types — safe to import from anywhere (client or server).

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
  | "unknown";

export interface ForeignKey {
  table: string;
  column: string;
}

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
  /** Original DB type token, e.g. "VARCHAR(255)" */
  rawType?: string;
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface UnifiedSchema {
  tables: Table[];
  /** Optional source dialect for SQL output. */
  dialect?: "postgres" | "mysql" | "sqlite";
}

export type OutputFormat = "sql" | "json" | "csv" | "typescript" | "python";
export type OutputMode = "single" | "per-table";

/**
 * Row count spec per table.
 * - number: fixed row count
 * - "auto": resolved from FK graph + heuristics
 * - { perParent, parent }: rows = parentCount × perParent
 * - { count }: same as number
 */
export type RowSpec =
  | number
  | "auto"
  | { count: number }
  | { perParent: number; parent: string };

export interface GenerateOptions {
  /** Per-table row counts. Special key `default` applies to any unspecified table. */
  rowsPerTable?: Record<string, RowSpec> & { default?: RowSpec };
  locale?: string;
  seed?: number;
  realism?: "basic" | "enriched";
  ai_enrichment?: "off" | "validate" | "fill-gaps" | "full";
}

export interface GenerateRequest {
  input: {
    type: "sql" | "json-schema" | "auto";
    files: Array<{ name: string; content: string }>;
  };
  output: {
    format: OutputFormat;
    mode?: OutputMode;
    sql_dialect?: "postgres" | "mysql" | "sqlite";
  };
  options?: GenerateOptions;
}

export type Row = Record<string, unknown>;

export interface GeneratedDataset {
  /** Tables in topological order (parents first). */
  order: string[];
  /** rows[tableName] = array of generated rows */
  rows: Record<string, Row[]>;
  schema: UnifiedSchema;
}

export interface GenerationReport {
  totalRows: number;
  perTable: Record<string, number>;
  durationMs: number;
  warnings: string[];
}
