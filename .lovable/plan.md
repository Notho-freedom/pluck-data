
# DataSeed — Finition v3 + Refonte corporate

Trois chantiers en parallèle : (1) terminer ce qui restait du plan v3, (2) refondre le site avec une posture corporate haut de gamme et de vraies illustrations, (3) tester l'ensemble bout en bout.

---

## 1. Finir le plan v3 (ce qui restait ouvert)

### 1.1 UI Playground refondue (Phase F)
- Nouveau layout en 3 onglets : **Schéma source** / **Assets & cohérence** / **Cibles & export**
- `AssetsEditor.tsx` : par colonne image détectée → dropdown stratégie (`dicebear`, `pravatar`, `picsum-themed`, `unsplash-source`, `ai-generated`, `uploaded`) + preview live des 4 premières URLs
- `TargetSelector.tsx` : Téléchargement / Postgres URL / Supabase URL+service_role / S3 presigned — clé jamais persistée
- `LivePreviewTable.tsx` : rendu HTML des 5 premières lignes par table avec mini-thumbnails images
- Boutons « Copier `.dataseed.json` », « Copier commande CLI », « Copier config MCP »
- Onglet Persona/locale : sélecteur diversité (low/medium/high) + seed reproductible

### 1.2 Presets sauvegardés (E4)
- Route `_authenticated/presets.tsx` : liste / créer / dupliquer / supprimer
- Hook avec table `seed_presets` déjà migrée
- Bouton « Charger ce preset » dans le Playground

### 1.3 MCP — finition
- Vérifier endpoint `/api/mcp` SSE conforme, tester avec un client MCP minimal
- Doc d'install Cursor / Claude Code / Windsurf dans `docs.tsx`
- Tools exposés : `analyze_schema`, `generate_seed`, `insert_into_db`, `list_presets`

### 1.4 Insert direct (D1) — finition UI
- Bouton « Insert into DB » dans le Playground qui appelle `/v1/insert`
- Validation regex stricte des connection strings côté client avant envoi
- Affichage du résultat `{ inserted: { users: 50, ... } }`

### 1.5 Streaming + history (E1, E4)
- `/v1/generate` : si `rows > 5000` → NDJSON streaming
- Page `_authenticated/history.tsx` enrichie : lit `seed_runs`, affiche durée / lignes / format / re-télécharger

### 1.6 `.dataseed.json` config loader
- `/v1/generate` accepte `config` (le JSON entier) en plus des champs séparés
- Bouton « Importer .dataseed.json » dans le Playground

---

## 2. Refonte corporate du site

Posture cible : **infrastructure de données pour équipes sérieuses** — pas un jouet, pas un SaaS pastel. Référence visuelle : Vercel + Linear + Stripe Docs + Resend, fond sombre profond, accents froids, beaucoup d'air, typographie éditoriale.

### 2.1 Design system
- Palette assombrie : fond `oklch(0.14 0.02 240)`, surfaces `oklch(0.18 0.02 240)`, accent vert émeraude conservé mais désaturé (`oklch(0.72 0.14 160)`), accent froid bleu acier secondaire
- Typo : conserver Inter body + ajouter une display serif type Instrument Serif pour les titres de section (effet éditorial / rapport annuel)
- Grain subtil + bordures `1px` couleur surface élevée, ombres très douces, radius réduits (8px max)
- Retirer les dégradés multicolores type aurora du hero → remplacer par un **fond produit** (illustration générée, voir 2.3)

### 2.2 Structure landing (refonte complète `index.tsx`)
1. **Hero corporate** : H1 sobre « The seed-data infrastructure for code agents », sous-titre métier, 2 CTA (Playground / Read the docs), à droite : illustration produit générée
2. **Logos bar** « Built for teams using » : Prisma, Drizzle, Supabase, Neon, Postgres, Cursor, Claude, OpenAI (icônes SVG)
3. **Section « What it solves »** — 3 colonnes avec illustrations 1:1 générées (Schema in / Coherent data out / Direct injection)
4. **Section « Built-in intelligence »** — alternance zigzag avec captures produit + illustrations : Multi-format parsers, Persona-coherent rows, Domain awareness (medical / e-commerce / CRM), Rich types (vector, geo, jsonb)
5. **Section « For your agents »** — bloc MCP avec terminal animé, exemples Cursor/Claude Code/Windsurf
6. **Section « How it integrates »** — schéma flow illustré (Schéma → DataSeed → DB cible)
7. **Section sociale légère** — quote stylisée (sans fake logos), métriques honnêtes (formats supportés, types riches, …) — pas la barre stats supprimée précédemment
8. **CTA final** + footer dense corporate (Product / Developers / Company / Legal)

### 2.3 Illustrations générées (le « lourd »)
Tier `premium` ImageGen, style cohérent : **isométrique sombre, lignes fines turquoise/émeraude, lueurs douces, fond transparent ou fondu vers le bg du site**. ~6 illustrations :
- `hero-product.png` (1920×1080) — composition produit principale, schéma → flow de données → DB
- `solves-schema.png`, `solves-coherence.png`, `solves-inject.png` (1024×1024) — trio section 3
- `intelligence-personas.png`, `intelligence-domain.png`, `intelligence-types.png` (1024×768) — zigzag
- `mcp-agents.png` (1280×720) — section agents
- `flow-diagram.png` (1600×900) — schéma d'intégration

Fondus : appliqués via CSS `mask-image: linear-gradient(...)` pour fondre proprement dans le background sombre, plus halos `radial-gradient` derrière chaque illustration. Composant réutilisable `<BlendedImage>`.

### 2.4 Navigation & pages annexes
- Navbar plus dense : Product / Solutions / Developers (docs, API, MCP, CLI) / Pricing (placeholder) / Login
- Docs page : restructurer en sidebar gauche (Getting started / Schema formats / Assets / Direct insert / MCP / API reference / CLI)
- Footer corporate complet

---

## 3. Tests bout en bout

- `bun run build` → 0 erreur, 0 warning typecheck bloquant
- Playground : test SQL 250 rows → vérifier répartition réelle = annoncée, avatars cohérents
- Playground : test Prisma schema → parsé correctement
- Playground : test Zod / Drizzle / OpenAPI — au moins 1 schéma de chaque
- `/v1/analyze` + `/v1/generate` + `/v1/insert` (mock) via fetch directs
- MCP endpoint `/api/mcp` : ping initial + appel tool
- Auth flow + presets save/load
- Capture preview desktop + mobile, vérifier fondus images, pas de scroll horizontal nulle part
- Vérifier les pages `docs`, `playground`, `dashboard`, `presets`, `history`

---

## Détails techniques

**Fichiers à créer**
- `src/components/playground/AssetsEditor.tsx`, `TargetSelector.tsx`, `LivePreviewTable.tsx`, `PresetSelector.tsx`
- `src/components/illustrations/BlendedImage.tsx`
- `src/components/landing/LogosBar.tsx`, `SolvesSection.tsx`, `IntelligenceSection.tsx`, `AgentsSection.tsx`, `FlowSection.tsx`, `CorporateFooter.tsx`
- `src/routes/_authenticated/presets.tsx`
- `src/assets/illustrations/*.png` (8 illustrations générées tier premium)

**Fichiers à modifier**
- `src/styles.css` — nouveaux tokens corporate (surface levels, serif display, halos)
- `src/routes/index.tsx` — refonte complète
- `src/routes/playground.tsx` — onglets + nouveaux composants
- `src/routes/docs.tsx` — sidebar + sections MCP/CLI/assets
- `src/routes/_authenticated/history.tsx` — lecture `seed_runs`
- `src/components/Navbar.tsx` — nav dense
- `src/routes/api/public/v1/generate.ts` — accepter `config` complet + NDJSON si rows > 5000
- `src/lib/mcp/tools/index.ts` — ajouter `insert_into_db`, `list_presets`

**Hors-scope (confirmé)** : Stripe, publication npm du SDK/CLI, génération vidéo, PostGIS complexe, validation pglite (D2).

**Ordre d'exécution** : (a) génération des 8 illustrations en parallèle, (b) design system + composant `BlendedImage`, (c) refonte `index.tsx` + navbar + footer, (d) refonte playground + presets + UI insert, (e) MCP finition + docs refonte, (f) streaming + history, (g) tests bout en bout + captures preview.
