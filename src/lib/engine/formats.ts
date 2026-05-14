// Output formats list (for /v1/formats endpoint).
export const SUPPORTED_FORMATS = [
  { id: "sql", label: "SQL (INSERT)", extension: "sql", mime: "application/sql" },
  { id: "json", label: "JSON", extension: "json", mime: "application/json" },
  { id: "csv", label: "CSV", extension: "csv", mime: "text/csv" },
  { id: "typescript", label: "TypeScript seed", extension: "ts", mime: "text/typescript" },
  { id: "python", label: "Python", extension: "py", mime: "text/x-python" },
] as const;

export const SUPPORTED_DIALECTS = ["postgres", "mysql", "sqlite"] as const;
export const SUPPORTED_LOCALES = ["en", "fr", "es", "de", "it", "pt_BR", "ja"] as const;
