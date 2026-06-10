import { useEffect, useState } from "react";
import { Info, Wand2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export interface ParsedTable {
  name: string;
  columns: Array<{
    name: string;
    kind: string;
    isPrimaryKey: boolean;
    fk: { table: string; column: string } | null;
  }>;
}

export type RowSpec =
  | number
  | "auto"
  | { count: number }
  | { perParent: number; parent: string };

interface Props {
  schema: string;
  defaultRows: number;
  onDefaultChange: (n: number) => void;
  perTable: Record<string, RowSpec>;
  onPerTableChange: (next: Record<string, RowSpec>) => void;
  warnings: string[];
  onTablesResolved?: (tables: ParsedTable[]) => void;
}

type Preset = "balanced" | "sparse" | "dense" | "stress";

function heuristicPerParent(name: string): number {
  const n = name.toLowerCase();
  if (/messages?|events?|logs?|activity|activities|notifications?/.test(n)) return 12;
  if (/comments?|reactions?|likes?|views?/.test(n)) return 8;
  if (/items?|line_?items?|order_?lines?/.test(n)) return 4;
  if (/orders?|posts?|tasks?|sessions?/.test(n)) return 3;
  return 3;
}

function resolveCount(
  spec: RowSpec | undefined,
  table: ParsedTable,
  defaultRows: number,
  resolved: Map<string, number>,
): number {
  if (spec === undefined) return defaultRows;
  if (typeof spec === "number") return spec;
  if (typeof spec === "object" && "perParent" in spec) {
    const pc = resolved.get(spec.parent) ?? defaultRows;
    return Math.round(pc * spec.perParent);
  }
  // auto
  const fk = table.columns.find((c) => c.fk);
  if (!fk?.fk) return defaultRows;
  const pc = resolved.get(fk.fk.table) ?? defaultRows;
  return Math.round(pc * heuristicPerParent(table.name));
}

const _PRESETS_UNUSED = null;


export function TableRowsEditor({
  schema,
  defaultRows,
  onDefaultChange,
  perTable,
  onPerTableChange,
  warnings: _outerWarnings,
  onTablesResolved,
}: Props) {
  const [tables, setTables] = useState<ParsedTable[]>([]);
  const [analyzeErr, setAnalyzeErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!schema.trim()) {
      setTables([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/public/v1/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { type: "auto", files: [{ name: "schema.sql", content: schema }] },
          }),
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Parse error");
        setTables(data.tables || []);
        setAnalyzeErr(null);
        onTablesResolved?.(data.tables || []);
      } catch (e) {
        if ((e as any).name !== "AbortError") {
          setAnalyzeErr(e instanceof Error ? e.message : "Parse error");
          setTables([]);
        }
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]);

  // Compute resolved counts in declaration order (parents typically first; analyze returns them as declared).
  const resolved = new Map<string, number>();
  for (const t of tables) {
    const spec = perTable[t.name];
    resolved.set(t.name, resolveCount(spec, t, defaultRows, resolved));
  }
  const total = [...resolved.values()].reduce((a, b) => a + b, 0);

  const applyPreset = (p: Preset) => {
    const next: Record<string, RowSpec> = {};
    for (const t of tables) {
      const hasFK = t.columns.some((c) => c.fk);
      if (p === "balanced") {
        next[t.name] = hasFK ? "auto" : defaultRows;
      } else if (p === "sparse") {
        next[t.name] = hasFK ? "auto" : 10;
      } else if (p === "dense") {
        next[t.name] = hasFK ? "auto" : 100;
      } else {
        next[t.name] = hasFK ? "auto" : 500;
      }
    }
    onPerTableChange(next);
  };

  const setSpec = (name: string, spec: RowSpec | undefined) => {
    const next = { ...perTable };
    if (spec === undefined) delete next[name];
    else next[name] = spec;
    onPerTableChange(next);
  };

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border/80 bg-card/60 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Rows per table</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Each table gets its own row count. <b>Auto</b> scales child tables from their
                parent (e.g. 250 users → ~3 000 messages). Free tier caps each table at 100.
              </TooltipContent>
            </Tooltip>
          </div>
          <Select onValueChange={(v) => applyPreset(v as Preset)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Apply preset…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanced (auto)</SelectItem>
              <SelectItem value="sparse">Sparse (10)</SelectItem>
              <SelectItem value="dense">Dense (100)</SelectItem>
              <SelectItem value="stress">Stress (500)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Default
          </label>
          <Input
            type="number"
            min={1}
            max={10000}
            value={defaultRows}
            onChange={(e) => onDefaultChange(Math.max(1, Number(e.target.value) || 1))}
            className="h-8 w-24 text-sm"
          />
          <span className="text-[11px] text-muted-foreground">
            applied to root tables when set to <code>auto</code>
          </span>
        </div>

        {analyzeErr && (
          <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-300">
            ⚠ Couldn't parse schema yet: {analyzeErr}
          </p>
        )}

        {loading && !tables.length && (
          <p className="mt-4 text-xs text-muted-foreground">Parsing schema…</p>
        )}

        {tables.length > 0 && (
          <>
            <div className="mt-4 divide-y divide-border/60 rounded-lg border border-border/60 bg-background/40">
              {tables.map((t) => {
                const spec = perTable[t.name];
                const fkCol = t.columns.find((c) => c.fk);
                const isAuto = spec === "auto" || (spec === undefined && !!fkCol);
                const count = resolved.get(t.name) ?? 0;
                return (
                  <div key={t.name} className="flex items-center gap-2 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{t.name}</span>
                        {fkCol?.fk && (
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            → {fkCol.fk.table}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {isAuto ? (
                          <>
                            <Wand2 className="mr-1 inline h-3 w-3 text-primary" />
                            auto · {fkCol?.fk ? `~${heuristicPerParent(t.name)} per ${fkCol.fk.table}` : "default"}
                          </>
                        ) : (
                          <>fixed count</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant={isAuto ? "default" : "outline"}
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => setSpec(t.name, "auto")}
                        disabled={!fkCol}
                        title={!fkCol ? "No parent table — auto = default" : "Scale from parent"}
                      >
                        auto
                      </Button>
                      <Input
                        type="number"
                        min={0}
                        max={10000}
                        value={typeof spec === "number" ? spec : count}
                        onChange={(e) => setSpec(t.name, Math.max(0, Number(e.target.value) || 0))}
                        className="h-7 w-20 text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => onPerTableChange({})}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> Reset overrides
              </button>
              <span className="font-mono text-muted-foreground">
                {tables.length} table{tables.length > 1 ? "s" : ""} ·{" "}
                <span className="text-foreground">
                  ≈ {total.toLocaleString()} total rows
                </span>
              </span>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
