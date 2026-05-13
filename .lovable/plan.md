
# DataSeed API — Plateforme de génération de données de démo

## Concept

Une **API** (le produit principal) qui prend en entrée un schéma (SQL DDL ou JSON Schema) et retourne des données de démonstration cohérentes, avec relations préservées (FK), dans le format demandé. Une **interface web** sert de documentation, playground de test, et console de gestion des clés API — mais consomme la même API publique que les développeurs externes.

---

## 1. Stack technique

- **Frontend + API**: TanStack Start (déjà en place) — server routes sous `src/routes/api/` pour les endpoints publics, server functions pour la console.
- **Backend**: Lovable Cloud (auth, base Postgres pour comptes/clés/quotas/logs).
- **Parsing SQL**: `node-sql-parser` (compatible Workers, supporte MySQL/Postgres/SQLite DDL).
- **Validation JSON Schema**: `ajv`.
- **Génération de fake data**: `@faker-js/faker` (locales fr/en/es...).
- **APIs gratuites enrichissantes** (appelées côté serveur, mises en cache):
  - randomuser.me (profils complets avec photos)
  - DummyJSON (produits, recettes, posts, commentaires)
  - JSONPlaceholder (posts, todos, albums)
  - FakerAPI.it (champs variés FR)
  - Lorem Picsum / ui-avatars (images)
  - api.quotable.io (citations)
- **IA**: Lovable AI Gateway (`google/gemini-3-flash-preview` par défaut) pour 2 rôles précis (voir §4).

---

## 2. Endpoints API publics

Tous sous `src/routes/api/public/v1/` (auth par clé API via header `X-API-Key`).

| Méthode | Path | Rôle |
|---|---|---|
| POST | `/v1/generate` | Endpoint principal: schéma → données |
| POST | `/v1/analyze` | Parse un schéma et renvoie le modèle interprété (tables, colonnes, FK détectées) — utile pour debug |
| GET | `/v1/formats` | Liste formats sortie supportés |
| GET | `/v1/providers` | Liste APIs gratuites et générateurs disponibles |
| GET | `/v1/usage` | Quota restant pour la clé |

### Payload `/v1/generate`

```json
{
  "input": {
    "type": "sql" | "json-schema" | "auto",
    "files": [
      { "name": "users.sql", "content": "CREATE TABLE users (...);" },
      { "name": "messages.sql", "content": "..." }
    ]
  },
  "output": {
    "format": "sql" | "json" | "csv" | "typescript" | "python",
    "mode": "single" | "per-table",   // un fichier global ou un par table
    "sql_dialect": "postgres" | "mysql" | "sqlite"  // si format=sql
  },
  "options": {
    "rows_per_table": { "default": 10, "users": 50, "messages": 200 },
    "locale": "fr_FR",
    "seed": 42,                       // reproductible
    "ai_enrichment": "off" | "validate" | "fill-gaps" | "full",
    "realism": "basic" | "enriched"   // enriched = appels APIs externes
  }
}
```

### Réponse

- `mode=single` → un fichier (string) + métadonnées
- `mode=per-table` → archive (zip base64) ou objet `{ tableName: content }`
- Toujours: rapport de génération (lignes par table, providers utilisés, warnings IA, durée, crédits consommés)

---

## 3. Pipeline de génération (cœur du moteur)

```text
[1] Parse multi-fichiers
     └─ SQL → node-sql-parser → AST → modèle unifié
     └─ JSON Schema → ajv → modèle unifié
[2] Construction graphe de dépendances (FK)
     └─ Tri topologique (parents avant enfants)
     └─ Détection cycles → cassage avec FK nullable d'abord
[3] Mapping colonnes → générateurs
     └─ Heuristique nom + type:
        email→faker.email, avatar→picsum, name→faker.name,
        phone→faker.phone, address→faker.address,
        created_at→faker.date.past, status→enum check...
     └─ Si la table matche un dataset connu (users, products, posts,
        comments, recipes…) → fetch API gratuite + cache
[4] Génération ligne par ligne
     └─ Respect contraintes: NOT NULL, UNIQUE, CHECK, length,
        enum, default
     └─ FK: tirage aléatoire pondéré dans PK parent déjà générées
     └─ Tables d'association N-M: produit cartésien échantillonné
[5] Enrichissement IA (optionnel, selon ai_enrichment)
     └─ Voir §4
[6] Sérialisation
     └─ Format → writer dédié (sql/json/csv/ts/py)
     └─ Échappement strict (anti-injection dans les INSERT)
[7] Packaging (single ou per-table) + rapport
```

---

## 4. Rôles précis de l'IA (Lovable AI Gateway)

Pour économiser les crédits, l'IA n'est appelée que ciblé:

1. **Analyse contextuelle du schéma** (1 appel par requête, court): l'IA reçoit la liste des tables/colonnes et suggère le **domaine métier** (chat app, e-commerce, blog…) + un mapping enrichi colonne→générateur quand l'heuristique est ambiguë (ex: `bio`, `description`, `slug`, `tagline`). Sortie en tool-calling structuré.
2. **Validateur final** (1 appel): échantillon des données générées + intent → l'IA renvoie `{ ok: bool, issues: [...], patches: [...] }`. Si `issues`, le moteur applique les patches (regénère certaines colonnes / lignes) selon le mode:
   - `off`: pas d'IA
   - `validate`: IA juge mais ne corrige pas (juste warnings dans le rapport)
   - `fill-gaps`: IA ne remplit que ce que l'algo n'a pas su générer
   - `full`: les deux ci-dessus + correction proactive

L'IA ne génère **jamais** les milliers de lignes elle-même.

---

## 5. Console web (consomme l'API)

Routes TanStack:

- `/` — landing avec pitch, exemple animé schéma → données
- `/playground` — éditeur SQL/JSON, choix format, bouton "Generate" qui appelle `/v1/generate`, preview + download
- `/docs` — documentation interactive des endpoints (façon Scalar/Stoplight, statique)
- `/login`, `/signup` — auth Lovable Cloud (email/password + Google)
- `/_authenticated/dashboard` — vue d'ensemble usage
- `/_authenticated/keys` — gérer ses clés API (créer, révoquer, scopes)
- `/_authenticated/history` — historique des requêtes (anonymisé)
- `/_authenticated/billing` — quotas et plans

---

## 6. Auth, clés API, quotas

Tables Lovable Cloud:
- `profiles(id, email, plan, created_at)`
- `user_roles(user_id, role)` — pattern recommandé (admin/user)
- `api_keys(id, user_id, key_hash, name, scopes, last_used_at, revoked_at)`
- `usage_logs(id, api_key_id, endpoint, rows_generated, ai_calls, status, duration_ms, created_at)`
- `quotas(plan, monthly_rows, monthly_ai_calls, rate_limit_per_min)`

Plans: **Free** (10k lignes/mois, 100 appels IA), **Pro** (1M lignes, 5k IA), **Enterprise** (custom).

Rate-limit: in-memory token bucket par clé + persistance d'un compteur en DB. Surface erreurs 429 + 402 proprement.

Sécurité:
- SQL reçu **jamais exécuté** — uniquement parsé en AST.
- Validation taille fichiers (max 1 MB par fichier, 10 fichiers).
- Validation `rows_per_table` plafonné selon plan.
- Échappement strict dans les writers SQL.
- HTTPS, CORS configuré, signatures de webhooks si on en ajoute.
- Clés API stockées hashées (SHA-256), affichées **une seule fois** à la création.

---

## 7. Suggestions à valider en plus du brief

1. **Mode "incremental"**: l'utilisateur peut renvoyer des données existantes pour générer uniquement de nouvelles lignes liées (ex: 100 messages de plus pour les users existants).
2. **Webhooks**: pour les gros volumes (>10k lignes), génération asynchrone + callback.
3. **Templates communautaires**: bibliothèque de schémas types (saas, e-commerce, chat, blog) en un clic.
4. **Export "ORM-ready"**: seed.ts pour Prisma/Drizzle, fixtures Django/Rails.
5. **Preserve mode**: `seed` fixe + même schéma = mêmes données → reproductible pour CI/CD.
6. **Compagnon CLI** (phase 2): `npx dataseed gen ./schema.sql -o seed.sql`.
7. **Détection PII**: refus ou anonymisation si l'IA détecte des champs ressemblant à des données réelles dans le schéma.

---

## 8. Découpage de livraison (phases)

**Phase 1 — MVP API**
- Auth + clés API + dashboard minimal
- Parsing SQL (Postgres) + JSON Schema
- Moteur algo (Faker + heuristiques + FK)
- Formats: SQL, JSON
- Playground basique

**Phase 2 — Enrichissement**
- Intégration APIs gratuites (randomuser, dummyjson, picsum, quotable)
- Cache des réponses externes
- Formats CSV, TypeScript, Python
- Mode per-table + zip

**Phase 3 — IA**
- Analyse contextuelle (1 appel, tool-calling)
- Validateur + auto-patch
- Modes `validate` / `fill-gaps` / `full`

**Phase 4 — Pro**
- Quotas avancés, billing, plans
- Historique détaillé
- Templates, génération asynchrone, webhooks

---

## Détails techniques clés

- Server routes publics: `src/routes/api/public/v1/*.ts` (bypass auth Lovable, on gère nous-mêmes via `X-API-Key`).
- Server functions internes pour la console (avec `requireSupabaseAuth`).
- Parsing/génération côté serveur uniquement (Worker compatible — `node-sql-parser` et `@faker-js/faker` sont pure-JS).
- IA via fetch direct vers `https://ai.gateway.lovable.dev/v1/chat/completions` avec `process.env.LOVABLE_API_KEY` (pas de stream pour ces appels courts).
- Cache APIs externes: table `external_cache(provider, query_hash, payload, fetched_at)` — TTL 7 jours.
- Tests: jeu de schémas réels (chat, e-commerce, blog) en fixtures + assertions sur intégrité FK.

Dis-moi si tu veux ajuster les phases, supprimer/ajouter des suggestions, ou démarrer directement la Phase 1.
