# Réécriture Express + EJS — Student Money Blog

## Contexte

Tu remplaces **Next.js 15 (App Router, React, shadcn/ui)** par **Express + EJS + Tailwind CDN**.

### Pourquoi ?
- Déploiement sur cPanel mutualisé (CloudLinux, RAM max 4GB)
- Next.js ne build pas (out of memory) et Passenger plante
- Express tient dans 30-60MB RAM, zéro build

### Ce qui est conservé
- `content/published/*.mdx` — 8 articles seed
- `content/drafts/*.mdx` — 1 draft
- `scripts/newsletter/*.php` — scripts newsletter
- `.env.local` — variables d'env (À NE PAS COMMIT)
- `pipeline/` — dossier pipeline Hermes (optionnel)

### Ce qui est supprimé
- `src/` (tout le code Next.js)
- `next.config.ts`, `tsconfig.json`, `components.json`
- `node_modules/` (à réinstaller avec Express)
- `.next/`

## Stack cible

| Technologie | Choix |
|-------------|-------|
| Serveur | Express.js 4 |
| Langage | JavaScript (ESM ou CommonJS, au choix, mais unifié) |
| Templates | EJS (fichiers `.ejs` dans `views/`) |
| CSS | Tailwind v4 CDN (`https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4`) |
| Icons | Lucide via CDN (`https://unpkg.com/lucide-static@latest`) |
| Markdown | `marked` + `gray-matter` (pas next-mdx-remote) |
| Auth | `jose` (JWT, comme avant) |
| Discord | `tweetnacl` (éd25519 verify) |
| Email | `nodemailer` |
| Démarrage | `node server.js` (port 3000, configurable via PORT env) |

## Structure attendue

```
student-money/
├── server.js              # Point d'entrée Express
├── src/
│   ├── app.js             # Configuration Express (middleware, routes)
│   ├── routes/
│   │   ├── public.js      # Pages publiques (accueil, articles, article/[slug])
│   │   ├── admin.js       # Pages admin (dashboard, drafts, nouveau, discord, login)
│   │   └── api/
│   │       ├── auth.js        # POST /api/auth/login, /api/auth/logout
│   │       ├── articles.js    # DELETE /api/articles
│   │       ├── publish.js     # POST /api/publish
│   │       ├── drafts.js      # GET/DELETE /api/drafts
│   │       ├── save-draft.js  # POST /api/save-draft
│   │       ├── newsletter.js  # POST /api/newsletter
│   │       ├── generate.js         # POST /api/generate
│   │       ├── generate/stream.js  # POST /api/generate/stream (SSE)
│   │       ├── generate/topics.js  # POST /api/generate/topics
│   │       └── discord/
│   │           ├── interactions.js # POST /api/discord/interactions
│   │           ├── daily.js        # GET /api/discord/daily
│   │           └── status.js       # GET /api/discord/status
│   ├── middleware/
│   │   ├── auth.js        # Vérification cookie JWT pour /admin/*
│   │   └── seo.js         # Métadonnées par route
│   ├── lib/
│   │   ├── content.js     # getArticles(), getArticle(), getCategories(), getAllSlugs(), formatCategory()
│   │   ├── search.js      # searchWeb(), searchWebMulti() — Google News RSS + DuckDuckGo fallback
│   │   ├── auth.js        # createSession(), verifySession() — JWT avec jose
│   │   ├── discord.js     # sendChannelMessage(), verifyDiscordRequest(), createInteractionResponse(), editInteractionResponse()
│   │   └── utils.js       # cn(), slugify(), formatDate() (fr-FR)
│   └── views/
│       ├── partials/
│       │   ├── header.ejs     # Navigation responsive, glass morphism
│       │   ├── footer.ejs     # 3 colonnes, lien newsletter
│       │   ├── head.ejs       # <head> avec meta, CSS CDN, title
│       │   └── scripts.ejs    # Scripts JS communs
│       ├── index.ejs          # Page d'accueil (hero, articles, catégories)
│       ├── articles.ejs       # Liste paginée + filtre catégorie
│       ├── article.ejs        # Article seul + FAQ + JSON-LD
│       ├── admin/
│       │   ├── login.ejs      # Formulaire login
│       │   ├── dashboard.ejs  # Stats, articles publiés, drafts
│       │   ├── drafts.ejs     # Liste des drafts
│       │   ├── draft.ejs      # Preview + Publier/Supprimer
│       │   ├── nouveau.ejs    # Interface génération streaming
│       │   └── discord.ejs    # Guide config Discord
│       └── sitemap.ejs        # Template XML (ou générer directement)
└── public/
    └── (dossier pour fichiers statiques si besoin)
```

## Fonctionnalités à recréer (identiques à l'existant)

### 1. Pages publiques

**GET /** — Accueil
- Hero avec gradient animé, CTA "Voir les articles"
- Grille des 6 derniers articles (ArticleCard avec glass morphism, badge couleur par catégorie)
- Grille des catégories avec compteurs
- Section newsletter
- Animations CSS (fade-in-up, stagger, float, gradient-shift)
- JSON-LD: WebSite

**GET /articles** — Liste articles
- Pagination: `?page=X` (9 par page)
- Filtre par catégorie: `?categorie=logement`
- ArticleCard en grille responsive
- Staggered entrance animations

**GET /articles/:slug** — Article
- Header: badge catégorie, h1, date formatée fr-FR, temps de lecture
- Contenu markdown rendu avec `marked` + `gray-matter`
- Tableaux supportés (marked le fait nativement)
- Citations avec liens
- Section FAQ (accordéon details/summary)
- Articles similaires (même catégorie, 3 max)
- Publicité AdBanner (placeholder ou configurable)
- JSON-LD: BlogPosting + FAQPage
- Meta OG + twitter card
- Canonical URL

### 2. Admin (protégé par JWT)

Toutes les routes `/admin/*` vérifient le cookie `admin_session`.

**GET /admin/login** — Formulaire login
- Email + password, eye toggle, loading state
- POST vérifie ADMIN_EMAIL / ADMIN_PASSWORD (.env)

**POST /admin/auth/login** — Login
- Vérifie credentials, crée JWT (jose, 24h), set httpOnly cookie
- Redirect vers `?redirect=` ou /admin

**GET /admin/auth/logout**
- Clear cookie

**GET /admin** — Dashboard
- Stats cards: articles publiés, drafts, dernier article
- Liste articles publiés avec bouton Supprimer (DELETE /api/articles)
- Bouton Nouvel article, Voir les drafts

**GET /admin/drafts** — Liste drafts
- Titre, date, catégorie
- Bouton Preview par draft

**GET /admin/drafts/:slug** — Preview draft
- Affiche le contenu brut
- Bouton Publier (POST /api/publish)
- Bouton Supprimer (DELETE /api/drafts)

**GET /admin/nouveau** — Génération d'article (2 étapes)
- Étape 1: input sujet + "Générer" → POST /api/generate/topics → affiche cartes sujets
- Étape 2: clic sur un sujet → POST /api/generate/stream (SSE) → streaming du MDX
- Éditeur textarea
- Bouton Sauvegarder (POST /api/save-draft)

**GET /admin/discord** — Config bot Discord
- Guide 6 étapes, test webhook, trigger daily manuel, status cards

### 3. API Routes

**POST /api/auth/login**
Body: `{ email, password }` → Vérifie env vars → Retourne JWT dans cookie

**POST /api/auth/logout**
Clear cookie

**POST /api/publish**
Body: `{ slug }` → Renomme `content/drafts/{slug}.mdx` → `content/published/{slug}.mdx`

**GET /api/drafts**
Query: `?slug=...` → Lit le fichier et retourne le contenu

**DELETE /api/drafts**
Body: `{ slug }` → Supprime `content/drafts/{slug}.mdx`

**DELETE /api/articles**
Body: `{ slug }` → Supprime `content/published/{slug}.mdx`

**POST /api/save-draft**
Body: `{ slug, content }` → Écrit `content/drafts/{slug}.mdx`

**POST /api/newsletter**
Body: `{ email }` → Valide email → POST vers subscribe.php → retourne résultat

**POST /api/generate (non-streaming)**
Body: `{ topic }` → searchWeb → Zen API (opencode.ai/zen/go/v1/chat/completions, deepseek-v4-pro) → Retourne MDX complet

**POST /api/generate/stream (SSE)**
Body: `{ topic }` → searchWebMulti(3 queries) → Streame l'appel Zen API avec `stream: true`
Events SSE:
- `event: status` → phases search/generate
- `event: search` → source count + duration
- `event: content` → chunks de texte
- `event: done` → contenu final
- `event: error` → message d'erreur

**POST /api/generate/topics**
Body: `{ theme }` → searchWebMulti(searchQuery) → Zen API (deepseek-v4-flash, tokens 8000) → JSON `{ sujets: [{titre, categorie, description}] }`

**POST /api/discord/interactions**
Vérifie signature Ed25519 (tweetnacl)
- type 1 → PONG
- type 3 button click → custom_id `t0`..`t4` → DEFERRED_UPDATE_MESSAGE → recherche + génération + sauvegarde + publication → editInteractionResponse
- Gère aussi `cancel_*`

**GET /api/discord/daily** (cron)
- searchWebMulti(published slugs + thèmes) → Zen API (deepseek-v4-flash) → sujets → buildTopicButtons → sendChannelMessage (Discord)

**GET /api/discord/status**
Retourne `{ configured: bool, botToken: bool, appId: bool, publicKey: bool, channelId: bool }`

**GET /sitemap.xml**
- Liste toutes les URLs (/, /articles, chaque /articles/:slug)
- Dernière modification

**GET /robots.txt**
- Allow /, Disallow /admin/

### 4. Styles et animations (idem Next.js)

**Animations CSS à inclure dans le layout (global) :**
```css
@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(34,197,94,0.2); } 50% { box-shadow: 0 0 40px rgba(34,197,94,0.4); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes slide-down { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
/* + stagger-1 à stagger-8 avec 100ms delay */
```

**Thème :** Primary green (emerald), palette neutral, glass morphism (backdrop-blur, bg-white/70)

**Header :** Sticky, backdrop-blur, scroll detection qui change l'ombre, Sparkles icon, dropdown staggered

**ArticleCard :** Glass morphism, rounded-xl, border, shadow hover, translateY au hover, badge coloré par catégorie (déterminé par hash du nom de catégorie, même pool de 14 couleurs que l'existant)

**Hero :** Dégradé animé (bg-gradient-to-br from-emerald-50 to-neutral-100 avec gradient-shift), orbes flottantes (divs circulaires avec blur-3xl), texte en gradient

## Détails d'implémentation

### Contenu existant (ne pas créer, juste lire)

Les fichiers MDX dans `content/published/` et `content/drafts/` ont ce format frontmatter :
```yaml
---
title: "Titre SEO"
slug: "slug-kebab"
date: "2026-06-20"
category: "bourses"  # ou logement, bouffe, transport, jobs, banque (ou nouveau)
excerpt: "Résumé max 155 caractères"
coverImage: "Description image"
faq:
  - question: "Q1"
    answer: "R1"
  # 5 items
liens:
  - titre: "Nom"
    url: "https://..."
    description: "..."
tags: ["tag1", "tag2"]
---
```

Le corps est en Markdown standard avec tableaux supportés.

### Catégories dynamiques

```js
const CATEGORY_LABELS = {
  bourses: "Bourses & Aides",
  logement: "Logement",
  bouffe: "Alimentation",
  transport: "Transport",
  jobs: "Jobs étudiants",
  banque: "Banque & Épargne",
}

function formatCategory(cat) {
  if (!cat) return "Non classé"
  return CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)
}
```

Les couleurs de badge sont hash-based (déterministe par catégorie) :
```js
const CATEGORY_COLORS = [
  { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  { badge: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  // ... 14 palettes
]
const colorIndex = cat.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % CATEGORY_COLORS.length
```

### Sitemap dynamique

```js
// GET /sitemap.xml
const slugs = getAllSlugs("published")
const urls = [
  { loc: "/", lastmod: "..." },
  { loc: "/articles", lastmod: "..." },
  ...slugs.map(s => ({ loc: `/articles/${s}`, lastmod: articleDate })),
]
// Générer XML valide
```

### Formatage dates

Toujours en français (fr-FR) :
```js
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric"
  })
}
```

### Temps de lecture

```js
function readingTime(text) {
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
```

### Auth

```js
import { SignJWT, jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET)
const COOKIE_NAME = "admin_session"

async function createSession() { /* JWT with 24h expiry */ }
async function verifySession(token) { /* jwtVerify */ return boolean }
```

Middleware pour /admin/* : lit le cookie, vérifie, redirect vers /admin/login si invalide.

### Discord

Conserver exactement les mêmes helpers dans `lib/discord.js` :
- `discordFetch(method, path, body)` — Bot auth
- `interactionFetch(method, path, body)` — no auth (pour callbacks)
- `sendChannelMessage(channelId, content, components)`
- `editMessage(channelId, messageId, content, components)`
- `createInteractionResponse(interactionId, token, type, data)`
- `editInteractionResponse(token, content, components)`
- `verifyDiscordRequest(publicKey, signature, timestamp, rawBody)` — tweetnacl
- `buildTopicButtons(topics)` — boutons t0..t4
- `buildConfirmButtons(slug)` — publish/cancel
- `categoryEmoji(cat)`

**IMPORTANT :** `interactionFetch` ne doit PAS appeler `.json()` sur une réponse vide (204). Lire le body en text et retourner null si vide.

### Recherche web

Conserver exactement `lib/search.js` :
- `searchGoogle(query)` → Google News RSS, User-Agent navigateur réel
- `searchDuckDuckGo(query)` → Fallback html.duckduckgo.com
- `searchWeb(query)` → Google puis fallback
- `searchWebMulti(queries)` → Parcours chaque query, concatène résultats
- Chaque retourne `{ results: string, urls: string }` (ou `{ results, urls, count }`)

### Génération IA (Zen API)

Tous les prompts et appels API sont identiques au code Next.js existant. Voir les fichiers source dans `src/app/api/generate/` et `src/app/api/discord/interactions/route.ts` pour les prompts exacts.

L'URL API : `https://opencode.ai/zen/go/v1/chat/completions`

Header: `Authorization: Bearer ${process.env.OPENSCODE_API_KEY}`

Prompts système : identiques (style pote qui s'y connaît, français, format MDX obligatoire, citations, pas de catégories inventées sauf si nécessaire).

### package.json

```json
{
  "name": "student-money",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "express": "^4.21",
    "ejs": "^3.1",
    "gray-matter": "^4.0",
    "marked": "^15",
    "jose": "^6",
    "tweetnacl": "^1.0",
    "nodemailer": "^9"
  }
}
```

### .gitignore

```
node_modules/
.env.local
content/subscribers.json
```

### Déploiement

Le fichier `server.js` doit contenir :

```js
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`✓ Student Money sur http://localhost:${PORT}`))
```

Pas de Passenger, pas de PM2 nécessaire. L'utilisateur lance `node server.js` via SSH avec nohup.

## Instructions finales

1. **Ne PAS modifier les fichiers existants** dans `content/`, `scripts/`, `.env.local`
2. **Supprimer le dossier `src/`** (tout le code Next.js)
3. **Supprimer `next.config.ts`**, `tsconfig.json`, `components.json`
4. **Créer la structure complète Express + EJS** dans `src/`
5. **Tout le texte visible du site doit être en français**
6. **Utiliser Tailwind via CDN** (`@tailwindcss/browser` v4), pas de build CSS
7. **Lucide icons via CDN** (`unpkg.com/lucide-static`)
8. **Les articles .mdx sont rendus avec `marked`** (pas next-mdx-remote)
9. **Les tableaux dans les articles sont supportés** (marked le fait nativement)
10. **JSON-LD structuré** sur les pages articles (BlogPosting + FAQPage)
11. **Animations CSS** (fade-in-up, float, gradient-shift, stagger, pulse-glow)
12. **Header glass morphism** avec scroll detection (backdrop-blur, shadow change)
13. **Hero gradient animé** sur l'accueil
14. **Couleurs de badges hash-based** par catégorie
15. **Tester que le serveur démarre** avec `node server.js` et que les routes répondent
16. **Style de code** : propre, lisible, pas de commentaires inutiles
