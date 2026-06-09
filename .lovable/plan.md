
# Plan — UX fixes + smart generation config

## 1. Landing page cleanup (`src/routes/index.tsx`)

- **Terminal horizontal scroll**: in `AnimatedTerminal`, the `<pre>` blocks use `overflow-x-auto` and the side-by-side grid forces overflow at this viewport. Wrap long lines (`whitespace-pre-wrap break-words`), reduce font to `text-[12px]`, and stack the two panes (`grid md:grid-cols-2 → grid-cols-1 lg:grid-cols-2`) so nothing scrolls horizontally on common widths.
- **Stats band**: delete the `StatBand` block (lines ~121-128) and its helper. Keep the "works with every stack" strip directly under the terminal.

## 2. The real problem — "rows" is ambiguous

Today `options.rowsPerTable.default = 250` means **250 rows per table**, so 3 tables = 750 rows. The UI exposes a single "Rows / table" input, which is exactly the confusion the user hit (250 → 300 in the report because 3 tables × 100, capped).

We'll fix this on two fronts: **terminology** + **per-table control** + **smart defaults**.

### 2a. Terminology

- Rename the field everywhere from "Rows" → **"Rows per table"** with a tooltip: "Each table gets this many rows unless you override it below."
- In the playground header, show: `≈ N tables × M rows = TOTAL rows` live as the user types.
- In the report, show **rows per table** as the primary number, with `Total` as secondary.

### 2b. Per-table row count UI (Playground)

After the user pastes/loads a schema, parse it client-side (call the existing `/api/public/v1/analyze` endpoint — already returns `tables[]`) and render a compact table:

```text
┌─ Tables detected ───────────────────────────┐
│ users          [ 250 ] rows                 │
│ conversations  [ 250 ] rows  ✕ link to users│
│ messages       [auto] rows  — 5/user (~1250)│
└─────────────────────────────────────────────┘
   Reset · Apply preset: [Realistic ▾]
```

- Each row: numeric input + an `auto` toggle.
- "Auto" uses **relationship-aware defaults** (see 2c).
- A "Realistic / Sparse / Dense / Stress-test" preset dropdown bulk-fills sensible numbers.

### 2c. Smart defaults (engine)

Extend `src/lib/engine/generator.ts` + `types.ts` so `rowsPerTable` accepts:

- a **number** → fixed count (today's behaviour)
- `"auto"` → resolved from the table's role in the FK graph:
  - **Root tables** (no incoming FKs, e.g. `users`): use `default` (e.g. 250).
  - **1-to-many child** (e.g. `conversations.user_id`): `parentCount × ratio`, ratio defaults per heuristic (2-5 conversations / user).
  - **Many-to-many join / message-like**: `parentCount × 5..20`.
  - Heuristic uses table name (`messages`, `comments`, `events`, `logs`, `orders`, `items`) + column patterns.
- Per-table objects: `{ count: 250 }` or `{ perParent: 5, parent: "users" }`.

This makes "250 users" actually produce ~250 users, ~750 conversations, ~3.7k messages — which matches what a developer wants from "a chat app with 250 users".

## 3. Schema-in / data-out config layer

Add an optional **`.dataseed.json`** config users can paste/upload alongside their schema (also accepted in the API body as `options.tableConfig`). It lets advanced users pin behaviour without UI:

```json
{
  "tables": {
    "users":         { "rows": 250 },
    "conversations": { "rows": { "perParent": 3, "parent": "users" } },
    "messages":      { "rows": { "perParent": 12, "parent": "conversations" } }
  },
  "columns": {
    "users.email":   { "faker": "internet.email", "unique": true },
    "users.country": { "values": ["FR", "BE", "CH"] }
  },
  "locale": "fr",
  "seed": 42
}
```

- Playground gets a small "Advanced config" collapsible that shows/edits this JSON, auto-synced with the per-table UI above.
- `/v1/generate` accepts it; documented in `/docs`.

## 4. Quality-of-life additions

- **Inline schema linter**: after parsing, surface warnings (orphan FK, missing PK, ambiguous types) in a top banner of the playground — not just buried in `report.warnings`.
- **Output preview tabs**: when in `per-table` mode, render a tab per table with row count; today we only collapse to a single string.
- **"Insert into my DB" snippet**: after generation, offer a one-click copy of `psql`/`mysql` command using the produced file.
- **Estimator before submit**: client-side estimate of total rows + payload size + warning if it'll exceed the free-tier 100/table cap.

## 5. Engine + API changes (technical)

Files touched:

- `src/lib/engine/types.ts` — extend `GenerateOptions.rowsPerTable` value type to `number | "auto" | { perParent: number; parent: string } | { count: number }`. Add `tableConfig`, `columnConfig`.
- `src/lib/engine/generator.ts` — resolve row counts per table after topo sort using FK graph + heuristics; apply `columnConfig` overrides (faker path, enum values, unique).
- `src/lib/engine/graph.ts` — expose `incomingEdges(table)` helper for the resolver.
- `src/routes/api/public/v1/generate.ts` — pass through the new fields; same 1 MB cap; same anon 100/table cap applied *after* resolution.
- `src/routes/playground.tsx` — add `TableRowsEditor` (calls `/v1/analyze` on schema change, debounced), totals badge, presets dropdown, advanced JSON drawer, output tabs.
- `src/routes/docs.tsx` — document `rowsPerTable` auto/perParent shapes and `.dataseed.json`.
- `src/routes/index.tsx` — terminal wrap fix + remove stats band.

## 6. Out of scope for this round

- Stripe / billing (still parked).
- Saved configs in DB (could come later as `user_configs` table).
- File-upload of `.sql` (already partially there; not changing).

## Acceptance checklist

- [ ] Landing terminal does not scroll horizontally at ≥1024px and wraps cleanly below.
- [ ] Stats band gone.
- [ ] Pasting the chat schema + setting `users=250` produces ~250 users, with conversations/messages scaled by relationship — and report shows per-table + total clearly.
- [ ] Per-table editor appears after schema is parsed; "auto" resolves visibly.
- [ ] `/v1/generate` accepts the new `rowsPerTable` shapes; existing flat-number requests still work.
- [ ] Docs updated with the new shape + a `.dataseed.json` example.
