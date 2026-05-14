
# Finalisation DataSeed API

## 1. Bug critique à corriger d'abord (ce que tu vois dans le résultat)

Cause: `node-sql-parser` retourne désormais les noms de colonnes comme `{ expr: { value: 'id' } }`. Le parser actuel fait `String(c)` → `[object Object]`. Ensuite, `mapType` ne reconnaît plus le type (objet aussi) → kind devient `unknown` → générateur retombe sur des lorem mais surtout les colonnes portent toutes le même nom `[object Object]` donc se collisionnent et n'écrivent qu'une seule valeur (la dernière, un timestamp pour `created_at`).

Correctif (`src/lib/engine/parser-sql.ts`):

- Helper `colName` robuste qui descend `column.expr.value`, `column.value`, `column.column`, ou `String`.
- Helper `extractDataType` qui gère `definition.dataType` quand c'est un objet imbriqué.
- Tester avec le schéma users/messages — vérifier que `INSERT INTO "users" ("id", "email", "full_name", "created_at") VALUES ('uuid', 'mail@…', 'Jean Dupont', '2024…')` est correct.
- Bonus: parser `REFERENCES users(id)` inline (clé étrangère) — déjà géré, vérifier qu'il fonctionne avec la nouvelle extraction.

## 2. Phase 2 — Enrichissement (APIs gratuites + cache)

- `src/lib/engine/enrichers/` : modules `randomuser.ts`, `dummyjson.ts`, `picsum.ts`.
- Détection: si table s'appelle `users|customers|members` → randomuser; `products|items` → dummyjson products; colonne avatar/image → picsum seed.
- Cache mémoire process (Map LRU 200 entrées, TTL 1h) — pas de table DB, suffisant pour Workers.
- Activé seulement si `options.realism === "enriched"`.

## 3. Phase 3 — IA (Lovable AI Gateway)

Server function `analyzeSchema` et `validateDataset` dans `src/lib/engine/ai.ts`:

- Modèle: `google/gemini-3-flash-preview` (rapide, gratuit pendant la promo).
- **Analyse** (1 appel): tool-calling structuré → `{ domain, columnHints: { "table.col": "generator_name" } }`.
- **Validation** (1 appel): échantillon 5 lignes/table → `{ ok, issues[], patches[] }`.
- Modes: `off | validate | fill-gaps | full` (déjà cadré dans le plan).
- Échec IA = warning, pas erreur (le moteur algo reste autonome).

## 4. Phase 4 — Auth, clés API, quotas

Tables déjà créées (`profiles`, `api_keys`, `usage_logs`, `user_roles`). À ajouter:

- Migration: table `quotas(plan PK, monthly_rows, monthly_ai_calls, rate_limit_per_min)` + seed 3 plans (free/pro/enterprise).
- Server functions (`src/lib/keys.functions.ts`):
  - `createApiKey({ name })` → renvoie clé brute UNE seule fois (`ds_live_<32 hex>`), stocke `sha256(key)` + prefix 8 chars.
  - `listApiKeys()`, `revokeApiKey(id)`.
  - `getUsageSummary()` — agrège `usage_logs` du mois.
- Middleware clé API dans `src/routes/api/public/v1/generate.ts`:
  - Lit `X-API-Key`, hash, lookup en DB (admin client).
  - Vérifie quota mensuel (somme `rows_generated` du mois).
  - Logge la requête (status, durée, lignes, IA).
  - 401 si manquante, 402 si quota dépassé, 429 si rate-limit (in-memory token bucket par clé).
- Public endpoint reste callable sans clé seulement depuis l'origine (playground) — détection via header `Origin` matchant le domaine, sinon clé requise.

## 5. Pages console (refonte présentation produit)

Routes à créer/refondre:

- `/` — **Landing pro** (pas le playground) : hero + démo animée schéma→données + 3 features + tarifs + CTA login. Réelle présentation produit, design soigné, semantic tokens, animations subtiles.
- `/playground` — l'éditeur actuel (déplacé depuis `/`), amélioré avec:
  - Loading skeleton sur le panneau Résultat (pas un texte "Génération…").
  - Onglets Schéma / Options / cURL.
  - Bouton "Télécharger" (.sql, .json, .csv, .ts, .py).
  - Bouton "Copier".
  - Sélecteur dialecte SQL, locale, mode IA.
- `/docs` — documentation statique des endpoints (`/v1/generate`, `/v1/analyze`, `/v1/formats`, `/v1/usage`), exemples curl + JS + Python, table des codes erreurs.
- `/login`, `/signup` — auth Lovable Cloud (email/password + Google).
- `/_authenticated.tsx` — guard.
- `/_authenticated/dashboard` — usage du mois (lignes générées, appels IA, top endpoints) avec petits graphes (chart shadcn).
- `/_authenticated/keys` — créer / révoquer clés. Modale "copy once".
- `/_authenticated/history` — 50 derniers logs.

## 6. UX loading propre

- Skeleton shadcn sur les cartes pendant la génération.
- Progress text : "Parsing schema…" → "Generating rows…" → "Serializing…" (basé sur le timing, pas du fake).
- Toast d'erreur avec sonner.
- Spinner sur les boutons (icône lucide `Loader2` qui spin).

## 7. Détails techniques

- `src/routes/api/public/v1/analyze.ts`, `formats.ts`, `usage.ts` — petits endpoints listant le moteur.
- `src/lib/engine/parser-sql.ts` — réécrit `colName`, ajoute extraction `dataType` robuste + tests inline (commentaires) avec le schéma users/messages.
- `src/lib/engine/index.ts` — expose `analyzeOnly(schema)` pour l'endpoint /analyze et le mode IA.
- Le bug d'hydration cURL (préviewt SSR vs client window.location) → remplacé par un placeholder statique `https://your-domain` côté SSR + remplacement client-side dans un `useEffect`.
- Tous les composants utilisent les semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-muted`).
- Animations: `motion` (déjà dispo via framer si pas installé sinon CSS pur).

## 8. Découpage des commits (un seul tour, dans cet ordre)

1. Fix parser SQL + endpoint /analyze.
2. Migration quotas + server functions clés/usage.
3. Middleware clé API + guards quota dans /v1/generate + endpoints /formats /usage.
4. Auth pages (login/signup) + layout `_authenticated`.
5. Pages dashboard / keys / history.
6. Refonte landing + extraction playground vers /playground + loading propre.
7. Page /docs.
8. Phase 2 enrichers + Phase 3 IA (à la fin pour ne pas bloquer le reste si IA flaky).

## Out of scope (volontairement)

- Webhooks de génération asynchrone (>10k lignes).
- Templates communautaires.
- Export ORM-ready Prisma/Drizzle.
- Mode incremental.
- CLI npm.

À garder pour une phase ultérieure si tu valides la base.

---

Si le plan te va, je l'implémente d'un coup dans l'ordre ci-dessus.
