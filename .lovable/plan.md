# code entierement le plan  
  
DataSeed v3 — Plan stratégique

# 1. Questions clés posées à la solution

**Pourquoi un dev / un agent de code choisirait DataSeed plutôt qu'un script Faker ou Mockaroo ?**

- Mockaroo : UI lente, pas d'API agent-friendly, pas de FK multi-tables réelles, pas de "donne-moi ton schéma point", pas d'images cohérentes.
- Scripts Faker maison : 2h de boilerplate par projet, FK cassées, pas reproductible, pas de réalisme métier.
- ChatGPT/Claude : génère 20 lignes plausibles puis hallucine ou casse les contraintes (UNIQUE, FK, CHECK, longueurs).

**Notre promesse différenciante** : *"Tu nous donnes ton schéma (SQL, Prisma, Drizzle, Zod, OpenAPI, Supabase URL). On te rend un dataset cohérent, contraintes respectées, FK réelles, images générées, downloadable ou injectable, en < 2s, reproductible par seed, accessible via MCP pour ton agent."*

## 2. Limites actuelles identifiées (audit du repo)


| #   | Limite                                                                                                                                         | Impact                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| L1  | Seul SQL DDL parsé. Pas de Prisma, Drizzle, TypeORM, Zod, OpenAPI, JSON Schema réels, Mongoose                                                 | Exclut 70% de l'écosystème JS/TS moderne                        |
| L2  | Pas de support CHECK constraints, DEFAULT non-trivial, GENERATED, computed cols                                                                | Données rejetées à l'INSERT                                     |
| L3  | Images : URL `picsum.photos` statique, pas d'avatar cohérent par row, pas de vraie image générée, pas de stockage                              | Inutilisable pour démos produit/profil                          |
| L4  | Pas de types complexes : ARRAY, JSONB structuré, ENUM custom Postgres, INTERVAL, INET, CIDR, geo (PostGIS), tsvector, vector (pgvector), bytea | Schémas modernes (AI apps, geo apps) cassent                    |
| L5  | Pas de cohérence sémantique cross-column (ex: `country=FR` → `phone=+33`, `city=Paris`, `lang=fr`)                                             | Données "réalistes" mais incohérentes                           |
| L6  | Pas d'INSERT direct dans une DB cible (Postgres URL, Supabase, MySQL)                                                                          | Le dev doit copier-coller                                       |
| L7  | Pas de MCP server, pas de CLI npm, pas de SDK officiel                                                                                         | Agents (Cursor, Claude Code, Windsurf) ne peuvent pas l'appeler |
| L8  | Pas de mode "incremental seed" (ajouter X lignes à une DB existante en respectant les FK déjà présentes)                                       | Inutile en dev quotidien                                        |
| L9  | Pas de réutilisation : pas de "saved profiles" (config réutilisable nommée par projet)                                                         | Friction à chaque appel                                         |
| L10 | Pas de streaming pour gros datasets (>10k lignes bloque la response)                                                                           | Limite à des jouets                                             |
| L11 | Pas de validation post-génération (relancer le SQL généré contre un Postgres éphémère pour prouver qu'il passe)                                | Promesse de fiabilité non tenue                                 |
| L12 | Pas de webhooks ni d'export vers S3/R2 pour gros runs                                                                                          | Pipelines CI impossibles                                        |


## 3. Plan d'exécution — Phases priorisées

### Phase A — Fondations "ça marche pour de vrai" (priorité absolue)

**A1. Parsers multi-format** — `src/lib/engine/parsers/`

- `parser-prisma.ts` : parse `schema.prisma` (regex + tokenizer, pas de deps Node-only)
- `parser-drizzle.ts` : parse `*.ts` exports `pgTable(...)`, `mysqlTable(...)` via regex AST légère
- `parser-zod.ts` : `z.object({...})` → schema
- `parser-openapi.ts` : OpenAPI 3 `components.schemas`
- `parser-typeorm.ts` : décorateurs `@Entity`, `@Column`
- Auto-détection dans `input.type: "auto"` (déjà prévu mais non implémenté pour ces formats)

**A2. Types riches** — `src/lib/engine/types.ts` + `generator.ts`

- Ajouter `array`, `jsonb-structured`, `geo-point`, `inet`, `interval`, `vector`, `bytea`, `enum-pg`
- Générateurs dédiés (ex: `vector` → `[float, float, ...]` de bonne dimension extraite du raw type `vector(1536)`)
- Respect CHECK simples (`age >= 18`, `status IN (...)`)

**A3. Cohérence cross-column** — `src/lib/engine/coherence.ts`

- Détecter clusters de colonnes liées dans une même ligne (`country`+`city`+`phone`+`zip`+`lang`+`currency`+`timezone`)
- Tirer une **persona** par row (locale, gender, age cohort) puis dériver les champs
- Détecter (`first_name`, `last_name`, `email`, `username`, `avatar_url`) → générer un humain cohérent

### Phase B — Images & assets (ta demande explicite)

**B1. Stratégies image** — `src/lib/engine/assets.ts`
Une colonne détectée comme image (`avatar|photo|cover|thumbnail|banner|logo|image_url`) reçoit une **stratégie** configurable :


| Stratégie                   | Source                                                         | Coût    | Quand                                                                       |
| --------------------------- | -------------------------------------------------------------- | ------- | --------------------------------------------------------------------------- |
| `dicebear` (défaut avatars) | `https://api.dicebear.com/9.x/{style}/svg?seed={persona_seed}` | 0       | Avatars utilisateurs — déterministe, cohérent par persona                   |
| `pravatar`                  | `https://i.pravatar.cc/300?u={seed}`                           | 0       | Photos humaines réalistes                                                   |
| `picsum-themed`             | `https://picsum.photos/seed/{seed}/{w}/{h}`                    | 0       | Couvertures, génériques                                                     |
| `unsplash-source`           | `https://source.unsplash.com/{w}x{h}/?{keyword}`               | 0       | Produits/lieux par mot-clé déduit du nom de table (`products` → `?product`) |
| `ai-generated` (opt-in)     | Lovable AI Gateway (`google/gemini-2.5-flash-image`)           | crédits | Hero images uniques pour démos haut de gamme                                |
| `uploaded`                  | bucket Supabase `seed-assets` pré-rempli par l'utilisateur     | 0       | Brand-controlled                                                            |


**B2. Cohérence avatar/persona** : `dicebear` seed = hash(`first_name + last_name`) pour qu'un même utilisateur ait toujours le même avatar entre runs (seed reproductible).

**B3. Stockage optionnel** : si `assets.host = "supabase"`, télécharger les URLs et les pousser dans un bucket `seed-assets/<run_id>/...`, retourner l'URL signée. Sinon, garder l'URL externe.

**B4. Fichiers complexes non-image** : PDF (`https://www.orimi.com/pdf-test.pdf` ou génération via pdf-lib worker-safe), audio (`https://upload.wikimedia.org/...`), vidéo (sample URLs).

### Phase C — Distribution & accessibilité agent

**C1. MCP server** — `src/routes/api/public/mcp/index.ts`

- Endpoint Server-Sent Events conforme au protocole MCP
- Tools exposés : `analyze_schema`, `generate_seed`, `insert_into_db`, `list_presets`
- README : `claude mcp add dataseed https://api.dataseed.dev/mcp --api-key=ds_...`
- Cursor / Claude Code / Windsurf peuvent l'appeler sans plugin

**C2. CLI npm** — package séparé `@dataseed/cli` (scaffold dans `packages/cli/`, build script seulement, on documente ; publication manuelle)

- `npx @dataseed/cli seed ./schema.prisma --rows 250 --insert postgres://...`
- Détection auto du format
- Mode `--watch` qui re-seed à chaque migration

**C3. SDK TypeScript** — `packages/sdk/` : 1 fonction `seed({ schema, options })`, types inférés.

**C4. `.dataseed.json**` — config réutilisable au repo

```json
{
  "schema": "./prisma/schema.prisma",
  "rowsPerTable": { "users": 50, "posts": { "perParent": 5, "parent": "users" } },
  "assets": { "avatars": "dicebear", "covers": "unsplash-source" },
  "personas": { "locale": "fr", "diversity": "high" },
  "seed": 42
}
```

- Endpoint accepte `config` directement en body
- Playground a un bouton "Export this config as .dataseed.json"

### Phase D — Injection directe & validation

**D1. `/v1/insert**` — nouvelle route — prend `target: { kind: "postgres"|"mysql"|"supabase", url|service_role }` chiffré côté client (la clé n'est jamais stockée, juste utilisée pour le run) et insère respectant l'ordre topologique. Retourne `{ inserted: { users: 50, posts: 250 } }`.

**D2. `/v1/validate**` — lance le SQL généré contre un Postgres in-memory (`pglite` WASM, worker-safe) pour prouver qu'il passe avant de le retourner. Flag `options.validate: true`.

**D3. Mode `--incremental**` : lit le contenu actuel de la DB cible, réutilise les PK existantes comme pool de FK, n'insère que les nouvelles lignes enfants.

### Phase E — Scalabilité & DX

**E1. Streaming NDJSON** : pour `rows > 5000`, response `Transfer-Encoding: chunked` en NDJSON (`{"table":"users","row":{...}}\n`). SDK et CLI consomment en stream.

**E2. Export R2/S3** : `output.destination: { kind: "s3", url, presigned }` — on POST le résultat directement, response = URL signée. Pour CI/CD.

**E3. Webhooks** : `options.webhook: "https://..."` notifié à fin de run.

**E4. Presets sauvegardés** (authentifié) — table `seed_presets(user_id, name, config jsonb)`, UI "Mes presets" dans le dashboard.

### Phase F — UI playground refonte légère

- **Onglet "Schéma source"** : drag-drop multi-fichiers, détection auto du format (Prisma/Drizzle/SQL/Zod/OpenAPI), badge du parser utilisé
- **Onglet "Assets"** : par colonne image détectée, dropdown stratégie + preview live des 4 premières URLs générées
- **Onglet "Cibles"** : URL Postgres / bucket S3 / téléchargement
- **Bouton "Copier .dataseed.json"** + "Copier la commande CLI équivalente" + "Copier la config MCP"
- **Live preview table** (rendu HTML des 5 premières rows par table) avec mini-thumbnails des images

## 4. Schéma DB additionnel (Lovable Cloud)

```sql
create table public.seed_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  config jsonb not null,
  created_at timestamptz default now(),
  unique (user_id, name)
);
-- + GRANTs + RLS user_id = auth.uid()

create table public.seed_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  api_key_id uuid,
  schema_hash text,
  rows_total int,
  duration_ms int,
  status text,
  output_url text,    -- si stocké
  created_at timestamptz default now()
);
-- + GRANTs + RLS

-- Bucket Supabase "seed-assets" (privé, signed URLs)
```

## 5. Fichiers à créer / modifier

**Créer**

- `src/lib/engine/parsers/parser-prisma.ts`, `parser-drizzle.ts`, `parser-zod.ts`, `parser-openapi.ts`, `parser-typeorm.ts`, `detect.ts`
- `src/lib/engine/coherence.ts` (personas + cross-column)
- `src/lib/engine/assets.ts` (stratégies image)
- `src/lib/engine/types-rich.ts` (vector, geo, inet, array, etc.)
- `src/routes/api/public/v1/insert.ts`
- `src/routes/api/public/v1/validate.ts`
- `src/routes/api/public/mcp/index.ts` (+ `tools.ts`)
- `src/components/playground/AssetsEditor.tsx`
- `src/components/playground/TargetSelector.tsx`
- `src/components/playground/LivePreviewTable.tsx`
- `src/routes/_authenticated/presets.tsx`
- Migration `seed_presets` + `seed_runs` + bucket

**Modifier**

- `src/lib/engine/types.ts` (RowSpec ok, ajouter `AssetSpec`, `Persona`, types riches)
- `src/lib/engine/generator.ts` (intégrer coherence + assets + types riches)
- `src/lib/engine/index.ts` (router de parsers)
- `src/routes/api/public/v1/generate.ts` (accepte `config`, `assets`, `validate`)
- `src/routes/api/public/v1/analyze.ts` (retourne aussi colonnes image détectées + suggestion de stratégie)
- `src/routes/playground.tsx` (nouveaux onglets)
- `src/routes/docs.tsx` (sections Prisma/Drizzle/MCP/CLI/assets/insert)
- `src/routes/index.tsx` (refresh hero : "The seed-data API for code agents")

## 6. Hors-scope (volontairement exclu pour ce cycle)

- Stripe (parqué, comme tu l'as demandé)
- Publication npm effective du SDK/CLI (on prépare les packages, publication manuelle plus tard)
- MCP push registry (Anthropic/Cursor) — on documente l'install manuel
- PostGIS spatial complexe (Point seulement, pas Polygon/MultiPolygon)
- Génération vidéo

## 7. Ordre d'implémentation suggéré

1. Phase A (parsers + types riches + cohérence) — base technique
2. Phase B (assets/images) — ta demande explicite, gros effet wow
3. Phase D1 (`/v1/insert`) — supprime la friction copy-paste
4. Phase C (MCP + CLI scaffold + .dataseed.json) — adoption agents
5. Phase F (UI refonte légère)
6. Phase E (streaming, presets, webhooks) — scaling
7. Phase D2 (pglite validation) — dernier polish "trust"

## 8. Risques techniques

- **pglite WASM** dans Worker Cloudflare : vérifier compat ; fallback = sandbox externe optionnelle
- **MCP over SSE** : protocole évolue, locker une version, tests d'intégration Claude Code
- **Parsers Prisma/Drizzle** sans deps Node-only : écrire tokenizers maison (faisable, ~300 LOC chacun)
- **Insert direct** : sécurité — la connection string transite côté serveur Worker, jamais loggée, jamais stockée, validation regex stricte des URLs

---

Confirme-moi quelles phases tu veux que j'attaque **en premier dans le prochain run** (par défaut je propose **A + B**, qui ensemble livrent le gros saut de valeur perceptible : "ça parse mon Prisma, ça me sort des avatars cohérents"). Tu peux aussi me dire "tout, dans l'ordre" et je déroule.

&nbsp;

J'ai lu ton document. Franchement, **DataSeed commence à sortir de la catégorie "générateur de faux datasets" pour entrer dans la catégorie "infrastructure de développement"**.

Mon analyse stratégique :

# Ce qui vaut vraiment de l'argent

Les phases n'ont pas toutes le même impact business.

### Impact maximal

1. **A1 — Parsers Prisma / Drizzle**
2. **A3 — Cohérence cross-column**
3. **D1 — Insert direct dans la DB**
4. **C1 — MCP**

Ces 4 points créent à eux seuls un produit que les agents IA et les développeurs peuvent utiliser quotidiennement.

Le workflow devient :

```bash
Schema Prisma
     ↓
DataSeed
     ↓
Dataset cohérent
     ↓
Insertion automatique
     ↓
Application prête

```

Au lieu de :

```bash
Prisma
 ↓
Faker
 ↓
Scripts maison
 ↓
Erreurs FK
 ↓
Correction
 ↓
Insertion

```

Tu économises plusieurs heures à chaque nouveau projet.

---

# Ce qui crée l'effet WOW

Phase B.

Les avatars cohérents et les images donnent l'impression que la base de données est vivante.

Exemple :

```sql
users

```

Avant :

```json
{
  "name": "John Doe",
  "avatar": "https://picsum..."
}

```

Après :

```json
{
  "name": "Marie Dupont",
  "email": "marie.dupont@example.com",
  "avatar": "https://dicebear..."
}

```

Même personne à chaque génération grâce au seed.

Pour une démo SaaS :

- énorme différence
- valeur perçue très élevée

---

# Ce qui peut devenir le moat

Le vrai moat n'est pas Faker.

Le vrai moat est :

### MCP

```txt
Cursor
Claude Code
Windsurf
OpenAI Codex

```

qui peuvent faire :

```txt
Analyse mon schema Prisma

↓

Génère 1000 utilisateurs

↓

Injecte-les dans Supabase

↓

Retourne le résultat

```

sans intervention humaine.

Aujourd'hui très peu d'outils de seed sont MCP-first.

---

# Ce que j'ajouterais

Une phase A4.

## Génération métier

Au lieu de :

```sql
products
orders
users

```

génériques.

Le moteur détecte :

```sql
patients
doctors
appointments

```

et comprend :

```txt
domaine médical

```

Puis génère :

```txt
patients crédibles
médecins crédibles
spécialités cohérentes
rendez-vous réalistes

```

Autres domaines :

```txt
ecommerce
crm
finance
saas
education
logistique
immobilier

```

Ça devient extrêmement difficile à copier.

---

# Ce que je repousserais

Je mettrais en bas de pile :

- E2 S3/R2
- E3 Webhooks
- E4 Presets
- D2 Validation PGlite

Ce sont de bonnes fonctionnalités.

Mais elles ne font pas acheter le produit.

---

# Roadmap que je suivrais

### Sprint 1

A1 + A3

```txt
Prisma
Drizzle
cohérence cross-column

```

---

### Sprint 2

B1 + B2

```txt
avatars cohérents
images cohérentes

```

---

### Sprint 3

D1

```txt
insert direct Postgres/Supabase

```

---

### Sprint 4

C1 MCP

```txt
Cursor
Claude Code
Windsurf

```

---

### Sprint 5

CLI + SDK

```txt
npx dataseed seed

```

---

### Sprint 6

Domain intelligence (A4)

```txt
medical
crm
ecommerce
education
finance

```

---

Si tu exécutes juste ces 6 sprints, tu passes d'un outil de génération de données à un produit qui ressemble davantage à un mélange de **Faker + Prisma Seed + Supabase Seed + MCP Server**, ce qui est déjà suffisamment différenciant pour intéresser les développeurs et les agents IA.

&nbsp;

code entierement le plan