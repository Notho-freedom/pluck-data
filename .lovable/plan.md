## Objectif

Refonte radicale de la console (sortir du template sidebar+topbar), coloration syntaxique partout, animation de flux sur la landing, et création de toutes les pages du footer manquantes. Une seule passe.

---

## 1. Console — casser le moule "sidebar + topbar + cartes"

Abandon complet de `AppSidebar` / `AppTopbar` / `AppMobileNav` et des grilles de cartes bordées. Nouveau paradigme :

**Command Deck** — layout unique, non-conventionnel :
- Rail vertical ultra-fin à gauche (44px), sans labels, juste des glyphes monogrammes qui se déploient au hover en une lame flottante (pas un panneau fixe).
- Pas de topbar. À la place, une **command bar** flottante centrée en haut (style Raycast/Linear ⌘K permanent) qui sert à la fois de fil d'Ariane, recherche, actions, et déconnexion (via ⌘K → "sign out", pas de bouton coin-droit).
- Zone principale sans cartes. Les données sont posées sur le fond en **blocs typographiques** : gros chiffres en display serif (Instrument Serif), séparés par des filets fins et de l'espace, jamais dans des rectangles bordés.
- Densité "journal financier" : colonnes de texte, tabulations mono, indicateurs inline (points colorés, deltas).

**Pages retravaillées dans ce langage :**
- `dashboard` — hero chiffre du jour (requêtes, rows générées) en display serif géant, puis flux d'activité en liste type terminal log (timestamp mono + event), pas de widgets.
- `keys` — table sans bordures, lignes séparées par filets. Génération de clé en overlay pleine largeur qui glisse depuis le haut.
- `history` — timeline verticale (rail + points), chaque entrée dépliable inline avec le payload en syntax-highlighted.
- `presets` — grille éditoriale magazine (tailles inégales), miniatures schéma en ASCII-art coloré, pas de cartes.

**Comportement :**
- Déconnexion : uniquement via command bar (⌘K → sign out) + item glyphe en bas du rail au survol. Jamais en coin.
- Navigation active : soulignement animé sous le glyphe, pas de pastille de fond.
- Zéro `Card` / `border rounded-xl` sur les pages console.

## 2. Coloration syntaxique globale

Intégration `shikri`/`shiki` (thème custom aligné sur les tokens mint/noir) pour tous les blocs de code de l'app :
- Composant `<Code lang="sql|ts|json|bash|python" />` unique.
- Remplacement de tous les `<pre><code>` bruts : landing (hero terminal, exemples flow), `/docs`, `/product`, `/agents`, `/integrations`, `/changelog`, `/playground` (input schema + output), `/history` (payloads).
- Thème custom : fond transparent, keywords mint, strings ambre doux, comments gris-bleu, numbers lavande — cohérent avec la palette existante.

## 3. Landing — section "Flow" animée

Nouvelle section entre hero et features : **"Watch it think"**
- 3 colonnes horizontales : `SCHEMA` → `ENGINE` → `OUTPUT`.
- Flèche animée qui n'est pas une flèche : un **rail de particules** SVG qui pulse en continu, avec des tokens (nom de colonne, type) qui glissent le long du rail de gauche à droite, se transforment au passage dans l'"engine" (halo mint qui palpite), et atterrissent en lignes SQL colorées à droite.
- L'engine central : bloc rond avec anneaux concentriques qui tournent (SVG), micro-labels orbitaux ("parse", "infer", "persona", "coherence") qui apparaissent en séquence.
- Boucle infinie, ~6s par cycle, pause au hover.
- Rebuild aussi le mini-terminal existant du hero pour utiliser Shiki (vraie coloration, pas des spans hardcodés).

## 4. Pages footer à créer

D'après le footer actuel, à créer (celles NON exclues par l'utilisateur) :
- `/playground` ✅ existe
- `/docs` ✅ existe
- `/docs` (API reference) → route dédiée `/api-reference`
- `/changelog` ✅ existe
- `/mcp` — MCP server (page dédiée, distincte de `/agents`)
- `/rest-api` — REST API endpoints détaillés
- `/schema-formats` — formats supportés (SQL, Prisma, Drizzle, Zod, OpenAPI, JSON)
- `/examples` — galerie schémas + résultats
- `/about` — page société
- `/customers` — logos + cas clients

Exclus par demande utilisateur : Customers (déjà exclus? il a dit "à part Customer, Contact, Legal, Pricing, Sécurité, Status et Top"). **Interprétation :** on NE crée PAS : Customers, Contact, Legal, Pricing (existe déjà), Security, Status, Support. On crée : About, MCP server, REST API, Schema formats, Examples, API reference.

Toutes ces pages utilisent `PublicLayout` + le langage marketing existant (déjà validé). Code partout via Shiki.

## 5. Détails techniques

- `shiki` (v1, avec thème custom JSON généré depuis les CSS vars).
- Nouveau `src/components/code/Code.tsx` (SSR-safe, async highlighter singleton).
- Nouveau `src/components/console/CommandBar.tsx` + `Rail.tsx` + `ConsoleShell.tsx` remplaçant `AppSidebar`/`AppTopbar`/`AppMobileNav`.
- Nouveau `src/components/landing/FlowSection.tsx` (SVG + Motion pour rail de particules).
- Suppression de : `AppSidebar.tsx`, `AppTopbar.tsx`, `AppMobileNav.tsx`.
- `_authenticated.tsx` : monte `ConsoleShell`.
- Refonte `dashboard.tsx`, `keys.tsx`, `history.tsx`, `presets.tsx` — aucune `Card`, aucun `border rounded` sur les métriques.
- Mise à jour footer pour pointer les nouvelles routes.

## Livraison

Une seule passe complète : shell console + refonte des 4 pages console + Shiki intégré partout + section flow landing + 6 nouvelles pages footer + nettoyage.
