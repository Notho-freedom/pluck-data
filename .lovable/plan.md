# DataSeed — Refonte multi-pages public + refonte totale App

Trois chantiers : (1) éclater le site public en vrai site marketing multi-pages avec illustrations premium, (2) refondre l'app authentifiée avec un design mature type console d'infra, (3) finir les chantiers v3 restés ouverts (playground onglets, presets, insert UI, streaming, MCP finition).

---

## 1. Site public multi-pages

Aujourd'hui tout est empilé sur `/`. On éclate en pages dédiées, chacune avec ses métadonnées, ses illustrations et son angle produit.

**Nouvelles routes**

- `/` — Hero corporate resserré, promesse + preuve produit + CTA. Plus court, plus dense.
- `/product` — Le moteur : parsers multi-formats, cohérence persona, domaines, types riches, assets. Zigzag illustré.
- `/agents` — MCP + Cursor / Claude Code / Windsurf. Terminal animé, exemples de configs, tools exposés.
- `/integrations` — Postgres, MySQL, SQLite, Supabase, Neon, Prisma, Drizzle, Zod, OpenAPI. Matrice + cartes.
- `/docs` — refondue en sidebar gauche (Getting started / Schema formats / Assets / Direct insert / MCP / API reference / CLI).
- `/pricing` — placeholder honnête (Free playground / Pro / Team) sans fake prix, juste la structure.
- `/changelog` — page statique, entrées v3.0, v3.1…
- `/company` — About / Security / Contact (single page condensée).

**Navigation & chrome**

- Navbar dense : Product · Agents · Integrations · Docs · Pricing · Changelog · [Login] [Open playground].
- Footer corporate 4 colonnes conservé.
- Bandeau logos-tech en bas de chaque page publique (déjà existant, généralisé).

**Illustrations premium supplémentaires** (tier `premium`, style isométrique sombre cohérent avec l'existant, fondus via `<BlendedImage>`) :

- `product-parsers.jpg`, `product-personas.jpg`, `product-assets.jpg`, `product-types.jpg`
- `agents-mcp.jpg` (terminal + IDE stylisés), `agents-flow.jpg`
- `integrations-matrix.jpg` (constellation de logos stylisés)
- `docs-hero.jpg`
- 1 illustration OG partagée par page (`og-*.jpg`) pour metadata sociales

**SEO**

- `head()` par route : title/description/og distincts, JSON-LD `SoftwareApplication` sur `/`, `TechArticle` sur `/docs/*`.
- H1 unique par page, alt textes explicites, canonical.

---

## 2. Refonte totale de l'App (zone `_authenticated`)

Objectif : passer du "dashboard SaaS générique" à une **console d'infrastructure de données** — inspiration Linear / Vercel / Neon console. Mature, dense mais respirable, zéro glow multicolore, zéro carte pastel.

**Design system app (extension `styles.css`)**

- App shell dédié : fond `oklch(0.12 0.015 245)`, panneaux `oklch(0.16 0.015 245)`, séparateurs `1px oklch(0.22 …)`.
- Densité 13–14px, mono JetBrains pour identifiants / IDs / connection strings, Instrument Serif réservé aux titres de page uniquement.
- Accents : émeraude désaturé (actions), acier (secondaire), ambre pour warnings, rouge sobre pour destructive.
- Composants console : `StatCard` sobre (nombre + delta + sparkline mono), `DataTable` dense zebra-less, `EmptyState` illustré, `CommandMenu` (Cmd-K), `Kbd` component.

**Layout app**

- Sidebar gauche fixe 240px : logo compact, sections (Overview / Playground / Presets / History / API Keys / Docs) + user menu bas.
- Topbar mince : breadcrumb, `⌘K`, environnement (Dev/Prod placeholder), avatar.
- Page container max 1280px, padding généreux, transitions instant.

**Pages app refondues**

- `/dashboard` → **Overview** : dernières générations, quota API, presets récents, quickstart cards (Playground / Import schema / Connect DB / Install MCP). Vraie densité utile, pas de faux graphes.
- `/playground` → **3 onglets** (Schéma source / Assets & cohérence / Cibles & export) — cf §3.1.
- `/presets` (nouveau) — liste + CRUD sur `seed_presets`.
- `/history` — enrichie, lit `seed_runs`, filtres format/date, re-download, re-run.
- `/keys` — conservée, restylée console.
- Ajout `⌘K` global (command menu) : nav rapide + actions (New generation, Copy MCP config, Open docs…).

**Onboarding**

- Première visite `/dashboard` : checklist 4 étapes (Run first generation → Save preset → Connect DB → Install MCP), dismissible, persistée dans `seed_presets` ou localStorage.

---

## 3. Finition v3 (intégrée)

Reprend les items non terminés du plan précédent :

- **3.1 Playground onglets** : `AssetsEditor.tsx`, `TargetSelector.tsx`, `LivePreviewTable.tsx`, `PresetSelector.tsx`, sélecteur persona/locale, boutons copier `.dataseed.json` / CLI / MCP config.
- **3.2 Presets** : route `_authenticated/presets.tsx` + hook CRUD sur `seed_presets`.
- **3.3 Insert direct UI** : bouton "Insert into DB" appelant `/v1/insert`, validation regex des connection strings, affichage résultat.
- **3.4 Streaming + history** : `/v1/generate` NDJSON si `rows > 5000`, `history.tsx` lit `seed_runs`.
- **3.5 `.dataseed.json` loader** : `/v1/generate` accepte `config` complet, bouton "Import .dataseed.json" dans playground.
- **3.6 MCP finition** : vérif `/api/mcp` SSE avec client minimal, doc install Cursor/Claude Code/Windsurf dans `/docs`, tools `insert_into_db` + `list_presets`.

---

## 4. Illustrations à générer (bilan total)

Premium tier, cohérentes avec les 6 existantes (isométrique sombre, émeraude/turquoise, halos doux). ~10 nouvelles :

- 4 produit (parsers / personas / assets / types)
- 2 agents (mcp / flow)
- 1 integrations
- 1 docs
- 1 empty-state générique app
- 1 hero secondaire pour `/pricing` ou `/company`

Toutes exposées via `<BlendedImage>` existant.

---

## 5. Tests bout-en-bout

- `bun run build` → 0 erreur.
- Toutes les nouvelles routes publiques : chargement, meta, pas de scroll horizontal, illustrations fondues correctement.
- App : sidebar + topbar + `⌘K` fonctionnels, dashboard réel (pas de données mockées), playground 3 onglets opérationnels.
- Playground : SQL 250 rows, Prisma, Zod, Drizzle, OpenAPI — 1 test chacun.
- `/v1/analyze` + `/v1/generate` (NDJSON) + `/v1/insert` (mock) via fetch.
- MCP : ping + `analyze_schema` + `generate_seed` + `list_presets`.
- Presets save/load/delete, history read.
- Captures desktop + mobile de chaque page publique et de l'app.

---

## Ordre d'exécution

1. Génération des ~10 illustrations en parallèle
2. Extension design system (tokens app shell, sidebar, densité)
3. AppShell + sidebar + topbar + `⌘K` + refonte Dashboard/History/Keys
4. Playground 3 onglets + Presets + Insert UI + streaming
5. Éclatement site public : nouvelles routes (`/product`, `/agents`, `/integrations`, `/pricing`, `/changelog`, `/company`) + refonte `/` resserrée + navbar/footer
6. Refonte `/docs` en sidebar
7. MCP finition + tools additionnels
8. Tests bout-en-bout + captures
9. publication npm SDK/CLI

**Hors-scope** : Stripe réel, vidéos, PostGIS complexe, validation pglite.