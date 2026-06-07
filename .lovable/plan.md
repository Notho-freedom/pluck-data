# Pourquoi un plan

Le résumé de la session précédente prétendait que les composants `Typewriter`, `AnimatedTerminal`, `ScrollReveal`, `CountUp`, `ProgressSteps`, `ExampleGallery`, `OnboardingChecklist` et `examples.ts` avaient été créés. **Aucun de ces fichiers n'existe réellement** dans le projet (`src/components/` ne contient que `Navbar.tsx` et `ui/`). C'est pour ça que tu ne vois aucune animation avancée. On reprend proprement, on livre vraiment, et on met Stripe complètement de côté.

# Ce qui sera livré dans ce tour

## 1. Bibliothèque d'animations (vraie, pas du fade-in basique)

Nouveau dossier `src/components/animations/`:

- **Typewriter.tsx** — typing char-par-char avec curseur clignotant, support de plusieurs phrases en rotation, vitesse + delay configurables, respecte `prefers-reduced-motion`.
- **AnimatedTerminal.tsx** — simule un terminal qui tape une commande SQL puis "exécute" et révèle ligne-par-ligne la sortie JSON/SQL générée, avec scanline et caret.
- **ScrollReveal.tsx** — `IntersectionObserver`, déclenche `opacity + translateY + blur` une seule fois, props `delay`, `direction`, `as`.
- **CountUp.tsx** — anime un nombre vers sa valeur cible avec easing, déclenché à l'entrée dans la vue, formatte (k/M/ms/%).
- **Magnetic.tsx** — bouton/élément magnétique (suit légèrement le curseur), utilisé sur les CTAs principaux.
- **AuroraBackground.tsx** — gradient animé conic-gradient + blob radiaux qui dérivent lentement, pour le hero et la section finale.
- **GradientText.tsx** — texte avec gradient animé (déplacement du gradient en boucle).

Mises à jour de `src/styles.css`:
- Keyframes: `aurora-drift`, `gradient-shift`, `scanline`, `float-slow`, `reveal-up`, `glow-pulse`, `marquee`.
- Utilitaires: `.animate-aurora`, `.animate-gradient`, `.animate-scanline`, `.animate-float`, `.animate-glow-pulse`, `.animate-marquee`.
- Media query `@media (prefers-reduced-motion: reduce)` qui désactive tout proprement.

## 2. Skeletons et écrans de progression

Nouveau dossier `src/components/skeletons/`:

- **TableSkeleton.tsx**, **CardSkeleton.tsx**, **MetricSkeleton.tsx** — basés sur `ui/skeleton` mais avec shimmer mint discret.
- **ProgressSteps.tsx** dans `src/components/` — composant multi-étapes (Parsing → Inferring → Generating → Serializing → Done) avec icônes Lucide, barre de progression linéaire, état actif/done/pending. Utilisé dans le Playground à la place du skeleton générique actuel.
- Auth (login/signup): boutons avec spinner + état "Signing you in…" / "Creating your account…" plutôt que juste désactivé.
- Export (copy/download): toast progressif + petit spinner sur le bouton pendant la sérialisation des gros payloads.

## 3. Onboarding guidé

Nouveau dossier `src/components/onboarding/`:

- **ExampleGallery.tsx** — galerie de 6 exemples cliquables (Chat app, E-commerce, SaaS billing, Blog CMS, CRM, Analytics events), chaque carte pré-remplit le Playground via état + query param `?example=chat`.
- **OnboardingChecklist.tsx** — checklist sur le Dashboard (3 étapes: créer une clé, faire un premier appel, exporter un format), basée sur `hasKey`/`hasCall` que renvoie déjà `getUsageSummary` (à étendre).
- **HowItWorks.tsx** — section landing "3 étapes animées" avec connexion entre les étapes (ligne qui se dessine au scroll).
- **TryItIn10s.tsx** — bloc sticky landing avec snippet cURL + bouton "Copy".

Nouveau fichier de données: `src/lib/examples.ts` — 6 presets `{ id, label, description, schema, suggestedFormat, suggestedLocale }`.

## 4. Refonte landing et dashboard pour intégrer tout ça

- `src/routes/index.tsx`:
  - Hero: `Typewriter` sur le titre ("Schema in." → "JSON out." → "SQL out." → "CSV out."), `AuroraBackground` derrière, CTAs magnétiques.
  - Section terminal: remplacée par `AnimatedTerminal` (vrai typing + révélation).
  - Bande de stats: 4 `CountUp` (80 ms, 100k lignes, 10 locales, 5 formats).
  - Toutes les sections wrappées dans `ScrollReveal` avec délais en cascade.
  - Section "How it works" remplacée par le composant animé.
  - Footer + CTA finale: `AuroraBackground` + texte gradient animé.

- `src/routes/playground.tsx`:
  - Ajout de `ExampleGallery` en haut (collapsible).
  - Loader remplacé par `ProgressSteps`.
  - Lecture `?example=` au mount pour pré-charger.
  - Bouton "Generate" magnétique + `glow-pulse` quand prêt.
  - Sortie révélée avec fade-in ligne-par-ligne (limité aux 80 premières lignes pour la perf).

- `src/routes/_authenticated/dashboard.tsx`:
  - Ajout d'`OnboardingChecklist` en haut si l'utilisateur n'a pas tout fait.
  - `CountUp` sur les Stats au lieu de chiffres statiques.
  - Skeletons mint shimmer au lieu de gris plat.

## 5. Évolutions transverses

- `src/lib/keys.functions.ts` — `getUsageSummary` renvoie aussi `hasKey: boolean` et `hasCall: boolean` (count rapide sur `api_keys` et `usage_logs`).
- `src/components/Navbar.tsx` — logo avec léger `glow-pulse`, lien actif souligné en mint.
- Transitions de page: wrapper `PageTransition` (fade + slight slide) appliqué au `<Outlet />` du `__root.tsx`.

## 6. Stripe

**Mis complètement de côté** pour ce tour. Aucune route `/billing`, aucun hook payment, aucune migration `stripe_customer_id`. Je te reproposerai Stripe BYOK (tes propres clés) quand tu seras prêt, jamais avant.

# Hors scope (volontairement)

- Stripe / billing / quotas payants.
- Nouveaux parsers (Prisma, TS interfaces).
- Streaming >50k lignes.
- CLI npm.
- HIBP / CSP headers.

# Détails techniques

- Toutes les animations respectent `prefers-reduced-motion`.
- Pas de nouvelle dépendance: tout est fait en CSS keyframes + React state + `IntersectionObserver` natif. `motion` reste optionnel — pas installé si pas déjà présent.
- Tokens sémantiques uniquement: pas de `text-white`, `bg-black`. Les nouvelles couleurs (si besoin) sont ajoutées dans `:root` de `src/styles.css`.
- Aucune modification backend / DB / RLS / engine. Pure UI + presentation.

Si tu valides, j'enchaîne tout dans cet ordre: animations lib → styles.css → skeletons → onboarding → landing → playground → dashboard.
