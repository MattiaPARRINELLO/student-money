# Student-Money

Blog dynamique généré par IA pour aider les étudiants à faire des économies. Articles auto-générés via Hermes Agent, validation manuelle, publication instantanée, newsletter, AdSense.

## Spec technique — pour l'agent builder

Ce document sert de spécification complète. L'agent doit lire intégralement ce fichier avant de commencer à coder. L'ordre des étapes ci-dessous est l'ordre de build recommandé.

---

## 0. Prérequis serveur

| Prérequis | Valeur |
|---|---|
| **Node.js** | 22.x (cPanel Node.js App, choix de 6 à 22) |
| **Hermes Agent** | Installé sur le serveur (`curl -fsSL https://hermes-agent.nousresearch.com/install.sh \| bash`) |
| **SMTP** | SMTP de l'hébergeur (serveur SMTP fourni par l'hébergement cPanel) |
| **Domaine** | Déjà acquis et pointé |

### Configuration Hermes

Avant d'utiliser `hermes -z`, l'agent doit :
1. Installer Hermes sur le serveur (commande ci-dessus)
2. Configurer les clés API des modèles (fichier `~/.config/hermes/config.toml` ou via `hermes config`)
3. Configurer au moins un modèle compatible OpenAI (l'utilisateur a une clé API opencode compatible OpenAI)
4. Le modèle recommandé pour la génération d'articles : `openai/gpt-4o-mini` ou tout modèle compatible OpenAI-SDK disponible

---

## 1. Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | Next.js | 15.x (compatible Node 18 à 22) |
| Langage | TypeScript | ^5 |
| Routing | App Router (app directory) |
| Rendu | SSR dynamique (pas de `output: 'export'`) |
| Contenu | Fichiers `.mdx` sur le filesystem |
| Rendu MDX | `next-mdx-remote` v5 (compatible React 19 / Next 15) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Composants UI | shadcn/ui (new-york style, neutral color) |
| Icônes | lucide-react |
| Newsletter | PHP scripts maison (sur le même hébergement) |

Fichier `package.json` à créer avec ces dépendances minimales :

```json
{
  "name": "student-money",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-mdx-remote": "^5.0.0",
    "gray-matter": "^4.0.3",
    "lucide-react": "^0.400.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 2. Arborescence complète

```
student-money/
├── content/
│   ├── drafts/                    # Articles en attente validation
│   └── published/                 # Articles publiés (live)
├── pipeline/
│   ├── generate.ts                # Script de génération Hermes
│   ├── helpers.ts                 # Utilitaires (lire/écrire fichiers, envoyer email)
│   └── prompts/
│       └── article.md             # Template de prompt pour Hermes
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Layout racine
│   │   ├── page.tsx               # Page d'accueil
│   │   ├── globals.css            # Tailwind + shadcn base
│   │   ├── sitemap.ts             # Sitemap dynamique
│   │   ├── robots.ts              # Robots.txt
│   │   ├── articles/
│   │   │   ├── page.tsx           # Liste paginée d'articles
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Article individuel (SSR dynamique)
│   │   ├── admin/
│   │   │   ├── layout.tsx         # Layout admin avec auth check
│   │   │   ├── page.tsx           # Dashboard admin
│   │   │   └── drafts/
│   │   │       ├── page.tsx       # Liste des drafts
│   │   │       └── [slug]/
│   │   │           └── page.tsx   # Preview + Publier (client component)
│   │   └── api/
│   │       ├── publish/
│   │       │   └── route.ts       # POST /api/publish – déplace draft → published
│   │       └── newsletter/
│   │           └── route.ts       # POST /api/newsletter – enregistre email
│   ├── components/
│   │   ├── ui/                    # Composants shadcn/ui générés
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   └── footer.tsx
│   │   ├── article-card.tsx       # Carte pour liste d'articles
│   │   ├── article-content.tsx    # Rendu MDX avec pub in-article
│   │   ├── ad-banner.tsx          # Composant AdSense
│   │   └── newsletter-form.tsx    # Formulaire inline
│   ├── lib/
│   │   ├── content.ts             # Lecture des .mdx (drafts et published)
│   │   ├── render-mdx.ts          # next-mdx-remote config + rendu
│   │   └── utils.ts               # cn(), formatDate(), slugify()
│   └── middleware.ts              # Basic auth pour /admin/*
├── scripts/
│   └── newsletter/
│       ├── subscribe.php          # POST : enregistre email dans JSON
│       └── send.php               # Cron : envoie newsletter
├── public/
│   └── images/                    # Images statiques (logo, placeholder)
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## 3. Format des fichiers MDX

Chaque article est un fichier `.mdx` avec un frontmatter YAML obligatoire.

### Exemple `content/published/bourses-crous-2026.mdx`

```mdx
---
title: "Bourses Crous 2026 : comment maximiser ton aide"
slug: "bourses-crous-2026"
date: "2026-06-20"
category: "bourses"
excerpt: "Découvre les astuces pour obtenir la bourse Crous maximale en 2026 et les nouvelles aides disponibles."
coverImage: "Un étudiant souriant devant son ordinateur avec une notification de bourse"
faq:
  - question: "Quel est le plafond de revenus pour la bourse Crous ?"
    answer: "Le plafond dépend de l'échelon. Pour l'échelon 0 bis..."
  - question: "Comment faire une demande de bourse ?"
    answer: "La demande se fait via le DSE sur messervices.etudiant.gouv.fr..."
tags: ["bourse", "crous", "aide financière"]
---

## Introduction

Texte de l'article en Markdown...

## Première section

Contenu...

## FAQ

### Quel est le plafond de revenus pour la bourse Crous ?

Le plafond dépend de l'échelon...

### Comment faire une demande de bourse ?

La demande se fait via le DSE...
```

### Règles du frontmatter

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `title` | string | Oui | Titre de l'article (optimisé SEO) |
| `slug` | string | Oui | kebab-case, unique |
| `date` | string | Oui | Format `YYYY-MM-DD` |
| `category` | string | Oui | `bourses`, `logement`, `bouffe`, `transport`, `jobs`, `banque` |
| `excerpt` | string | Oui | Max 155-160 caractères |
| `coverImage` | string | Non | Description pour OG image / alt text |
| `faq` | array | Non | `[{ question, answer }]` pour JSON-LD |
| `tags` | string[] | Non | Mots-clés pour SEO |

---

## 4. Étapes de build (dans l'ordre)

### Étape 1 — Init Next.js + Tailwind + shadcn/ui

1. Créer le projet Next.js avec TypeScript :
   ```bash
   npx create-next-app@15 student-money --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   cd student-money
   ```

2. Installer les dépendances supplémentaires :
   ```bash
   npm install next-mdx-remote gray-matter
   npm install lucide-react
   npm install clsx tailwind-merge class-variance-authority
   npm install nodemailer
   npm install -D @types/nodemailer
   ```

3. Initialiser shadcn/ui (new-york style, neutral color) :
   ```bash
   npx shadcn@latest init
   ```
   - Style : `new-york`
   - Base color : `neutral`
   - CSS variables : `yes`

4. Ajouter les composants shadcn nécessaires :
   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add input
   npx shadcn@latest add badge
   npx shadcn@latest add separator
   npx shadcn@latest add skeleton
   npx shadcn@latest add dialog
   ```

5. Créer `src/lib/utils.ts` avec la fonction `cn()` :
   ```ts
   import { clsx, type ClassValue } from "clsx"
   import { twMerge } from "tailwind-merge"

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }

   export function formatDate(date: string): string {
     return new Date(date).toLocaleDateString("fr-FR", {
       year: "numeric", month: "long", day: "numeric"
     })
   }

   export function slugify(text: string): string {
     return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
   }
   ```

6. Créer les dossiers :
   ```bash
   mkdir -p content/drafts content/published
   mkdir -p pipeline/prompts
   mkdir -p scripts/newsletter
   mkdir -p public/images
   mkdir -p src/components/layout
   ```

---

### Étape 2 — Layout global

Fichier `src/app/globals.css` : importer les styles Tailwind (générés par `create-next-app`).

Fichier `src/components/layout/header.tsx` :
- Logo "Student-Money" à gauche
- Navigation : Accueil, Articles, Catégories (dropdown), Newsletter
- Responsive : burger menu sur mobile (utiliser `lucide-react` pour l'icône Menu/X)
- Sticky en haut

Fichier `src/components/layout/footer.tsx` :
- Liens : Accueil, À propos, Newsletter, Contact
- Copyright 2026
- Mentions légales (placeholder)

Fichier `src/app/layout.tsx` :
- `<html lang="fr">`
- Metadata de base : `title: "Student-Money — Le blog qui fait économiser les étudiants"`, `description`
- Inclure `<Header />` et `<Footer />`
- Script Google AdSense en fin de body (placeholder, à activer plus tard)
- Le corps doit avoir `min-h-screen flex flex-col`, le `main` doit avoir `flex-1`

---

### Étape 3 — Librairie de lecture de contenu

Fichier `src/lib/content.ts` :

```ts
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const CONTENT_DIR = path.join(process.cwd(), "content")

export interface ArticleFrontmatter {
  title: string
  slug: string
  date: string
  category: string
  excerpt: string
  coverImage?: string
  faq?: { question: string; answer: string }[]
  tags?: string[]
}

export interface Article {
  frontmatter: ArticleFrontmatter
  content: string   // Le corps Markdown brut (sans le frontmatter)
  raw: string       // Le fichier MDX complet (pour next-mdx-remote)
}

export function getArticles(type: "drafts" | "published"): Article[] {
  const dir = path.join(CONTENT_DIR, type)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".mdx"))

  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8")
      const { data, content } = matter(raw)
      return {
        frontmatter: data as ArticleFrontmatter,
        content,
        raw,
      }
    })
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

export function getArticle(slug: string, type: "drafts" | "published"): Article | null {
  const filePath = path.join(CONTENT_DIR, type, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)
  return {
    frontmatter: data as ArticleFrontmatter,
    content,
    raw,
  }
}

export function getAllSlugs(type: "drafts" | "published"): string[] {
  const dir = path.join(CONTENT_DIR, type)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith(".mdx")).map(f => f.replace(/\.mdx$/, ""))
}

export function getCategories(): string[] {
  const articles = getArticles("published")
  const cats = new Set(articles.map(a => a.frontmatter.category))
  return Array.from(cats).sort()
}

export const CATEGORY_LABELS: Record<string, string> = {
  bourses: "Bourses & Aides",
  logement: "Logement",
  bouffe: "Alimentation",
  transport: "Transport",
  jobs: "Jobs étudiants",
  banque: "Banque & Épargne",
}
```

---

### Étape 4 — Rendu MDX dynamique

Fichier `src/lib/render-mdx.ts` :

```ts
import { compileMDX } from "next-mdx-remote/rsc"
import type { ArticleFrontmatter } from "./content"
import AdBanner from "@/components/ad-banner"

// Composants disponibles dans le MDX
const components = {
  AdBanner,
  // Ajouter d'autres composants customs ici si besoin
}

export async function renderMDX(raw: string) {
  const { content, frontmatter } = await compileMDX<ArticleFrontmatter>({
    source: raw,
    components,
    options: {
      parseFrontmatter: true,
    },
  })

  return { content, frontmatter }
}
```

---

### Étape 5 — Pages articles (SSR dynamique)

Fichier `src/app/articles/[slug]/page.tsx` :

- `generateMetadata` dynamique basé sur le slug et le frontmatter, avec :
  - `title`, `description` (= excerpt)
  - `openGraph` (title, description, type: article)
  - JSON-LD structuré pour `BlogPosting` et `FAQ` si présent
- Le composant page :
  - Lit l'article depuis `content/published/` avec `getArticle(slug, "published")`
  - Si article non trouvé → `notFound()`
  - Rend le contenu MDX avec `renderMDX(article.raw)`
  - Affiche : catégorie (badge), date, temps de lecture estimé
  - Insère `<AdBanner />` après le 2e paragraphe (via le composant MDX ou manuellement dans le JSX)
  - FAQ section en bas si `frontmatter.faq` existe (rendu en accordéon simple)
  - Article connexes en bas (3 articles de la même catégorie)

**Important** : Cette page doit être **dynamique** (SSR). Ne PAS utiliser `generateStaticParams`. Next.js par défaut SSR les pages dynamiques, c'est le comportement souhaité. Pour forcer le dynamique :

```ts
export const dynamic = "force-dynamic"
```

Fichier `src/app/articles/page.tsx` :
- Liste tous les articles de `content/published/`
- Pagination simple (9 par page, paramètre `?page=X` dans les searchParams)
- Chaque article affiché via `<ArticleCard />`

---

### Étape 6 — Page d'accueil

Fichier `src/app/page.tsx` :

- **Hero** : Titre accrocheur "Le blog qui fait économiser les étudiants" + sous-titre + CTA "Voir les articles"
- **Derniers articles** (6 plus récents depuis `content/published/`) en grille 3 colonnes desktop, 1 colonne mobile
- **Catégories** : lien vers chaque catégorie avec un badge et le nombre d'articles
- **CTA Newsletter** : Formulaire d'inscription inline

---

### Étape 7 — Composants réutilisables

Fichier `src/components/article-card.tsx` :
- Props : `ArticleFrontmatter`
- Affiche : catégorie (badge coloré), date, titre (lien vers `/articles/[slug]`), excerpt
- Carte cliquable entière (lien wrapper)
- Hover : légère élévation

Fichier `src/components/article-content.tsx` :
- Props : `frontmatter: ArticleFrontmatter`, `content: ReactNode` (venant de renderMDX)
- Affiche le header de l'article (titre H1, métadonnées)
- Rendu du contenu MDX
- FAQ en accordéon si présente
- Insère les pubs AdSense

Fichier `src/components/ad-banner.tsx` :
- Composant qui rend le code AdSense (placeholder au début, à configurer avec l'ID pub réel plus tard)
- Props : `slot` (string, pour identifier l'emplacement)
- Accepte les attributs requis par Google : `data-ad-client`, `data-ad-slot`, `data-ad-format`
- En dev, affiche un rectangle gris avec "Publicité" en texte centré
- En prod, rend le `<ins>` tag Google

Fichier `src/components/newsletter-form.tsx` :
- Input email + bouton "Je m'inscris"
- Appelle `POST /api/newsletter` avec `{ email }`
- Affiche un message de succès ou d'erreur
- Validation email basique côté client

---

### Étape 8 — Admin avec basic auth

**Middleware** `src/middleware.ts` :

Protéger toutes les routes sous `/admin` avec HTTP Basic Auth. Ne pas utiliser de bibliothèque externe, coder la vérification manuellement :

```ts
import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  // Ne protéger que /admin
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next()

  const auth = req.headers.get("authorization")
  if (!auth) {
    return new NextResponse("Authentification requise", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin Student-Money"' },
    })
  }

  const [user, pass] = atob(auth.split(" ")[1]).split(":")
  // À remplacer par tes identifiants
  if (user !== "admin" || pass !== "studentmoney2026") {
    return new NextResponse("Accès refusé", { status: 403 })
  }

  return NextResponse.next()
}

export const config = { matcher: "/admin/:path*" }
```

**Dashboard** `src/app/admin/page.tsx` :
- Affiche : nombre d'articles publiés, nombre de drafts en attente, dernière génération
- Liens : Voir les drafts, Voir le site → Accueil

**Liste des drafts** `src/app/admin/drafts/page.tsx` :
- Liste tous les fichiers dans `content/drafts/`
- Pour chaque draft : titre, date, catégorie, bouton "Prévisualiser" → `/admin/drafts/[slug]`

**Preview + Publish** `src/app/admin/drafts/[slug]/page.tsx` :

C'est un **Client Component** (car il y a des interactions : publier/supprimer).

- Affiche l'article complet (titre, contenu rendu en MDX)
- Bouton **"Publier"** (vert) → appelle `POST /api/publish` avec `{ slug }`
  - Après succès : redirige vers `/admin/drafts` avec un message flash
- Bouton **"Supprimer"** (rouge, avec confirmation dialog) → appelle `DELETE /api/drafts?slug=xxx`
- Si le draft n'existe pas → message d'erreur

---

### Étape 9 — API Routes

**`src/app/api/publish/route.ts`** :

```ts
import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  const draftsDir = path.join(process.cwd(), "content", "drafts")
  const publishedDir = path.join(process.cwd(), "content", "published")
  const source = path.join(draftsDir, `${slug}.mdx`)
  const dest = path.join(publishedDir, `${slug}.mdx`)

  if (!fs.existsSync(source)) {
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
  }

  if (fs.existsSync(dest)) {
    return NextResponse.json({ error: "Un article avec ce slug existe déjà" }, { status: 409 })
  }

  fs.copyFileSync(source, dest)
  fs.unlinkSync(source)

  // Revalidate homepage et liste articles (si ISR activé)
  // Pour du pure SSR, pas besoin

  return NextResponse.json({ success: true, slug })
}
```

**`src/app/api/drafts/route.ts`** (DELETE) :

```ts
import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  const filePath = path.join(process.cwd(), "content", "drafts", `${slug}.mdx`)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  return NextResponse.json({ success: true })
}
```

**`src/app/api/newsletter/route.ts`** :

```ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 })
  }

  // Appeler le script PHP d'inscription
  const response = await fetch("http://localhost/student-money/scripts/newsletter/subscribe.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

> **Note** : L'URL `http://localhost/student-money/scripts/newsletter/subscribe.php` devra être ajustée selon le vrai chemin sur l'hébergement. L'API PHP sera servie par Apache sur le même serveur, la route Next.js fait le pont.

---

### Étape 10 — Pipeline Hermes

**Template de prompt** `pipeline/prompts/article.md` :

```
Tu es un blogueur expert en finances étudiantes francophones.
Ta mission : écrire un article de blog optimisé SEO pour le site Student-Money.

SUJET : {topic}

INSTRUCTIONS :
1. Fais des recherches web sur le sujet pour trouver des infos récentes et vérifiées.
2. Écris un article complet en français, style direct et bienveillant.
3. Le public cible : étudiants français de 18-25 ans.
4. Structure obligatoire :

---
title: "TITRE_ACCROCHEUR"
slug: "slug-en-kebab-case"
date: "DATE_DU_JOUR_YYYY-MM-DD"
category: "CATEGORIE_PARMI_bourses|logement|bouffe|transport|jobs|banque"
excerpt: "RÉSUMÉ_155_CARACTÈRES_MAX"
coverImage: "DESCRIPTION_IMAGE_DETAILLEE"
faq:
  - question: "QUESTION_1"
    answer: "RÉPONSE_1"
  - question: "QUESTION_2"
    answer: "RÉPONSE_2"
  - question: "QUESTION_3"
    answer: "RÉPONSE_3"
  - question: "QUESTION_4"
    answer: "RÉPONSE_4"
  - question: "QUESTION_5"
    answer: "RÉPONSE_5"
tags:
  - "mot-clé-1"
  - "mot-clé-2"
  - "mot-clé-3"
---

## INTRODUCTION (~150 mots, accrocheuse)

## SECTION 1 (H2)
Contenu avec des conseils actionnables...

## SECTION 2 (H2)
...

## SECTION 3 (H2)
...

## SECTION 4 (H2)
...

## SECTION 5 (H2)
...

## CONCLUSION
Résumé + call-to-action (ex: "Inscris-toi à la newsletter pour plus d'astuces")

## FAQ
### QUESTION 1 ?
RÉPONSE 1

### QUESTION 2 ?
RÉPONSE 2

...

RÈGLES STRICTES :
- Longueur : 1200-2000 mots
- Utilise des listes à puces, des chiffres clés
- Pas de phrases creuses, que du conseil actionnable
- Chaque section doit apporter une vraie valeur
- La FAQ doit répondre aux vraies questions des étudiants
- Optimise le titre pour le SEO (mot-clé principal en début de titre)
- Le slug doit être court et contenir le mot-clé principal
- Sauvegarde le fichier complet (frontmatter + contenu) dans /chemin/absolu/student-money/content/drafts/[slug].mdx
- En sortie finale, réponds UNIQUEMENT le slug de l'article généré
```

**Script de génération** `pipeline/generate.ts` :

```ts
import { execSync } from "child_process"
import { sendNotification } from "./helpers"

const PROJECT_DIR = process.env.PROJECT_DIR || "/home/user/student-money"

async function main() {
  // 1. Lancer Hermes en mode one-shot
  const prompt = `Cherche des sujets tendance sur les économies étudiantes.
  Propose 3 sujets différents.
  Pour chaque sujet, donne : le titre, la catégorie, pourquoi c'est tendance.
  Choisis ensuite le meilleur sujet et écris l'article complet en suivant les instructions.`

  console.log("[pipeline] Lancement de Hermes...")
  const slug = execSync(
    `hermes -z "${prompt}"`,
    {
      cwd: PROJECT_DIR,
      encoding: "utf-8",
      timeout: 600_000, // 10 minutes
    }
  ).trim()

  console.log(`[pipeline] Slug généré : ${slug}`)

  // 2. Envoyer email de notification
  await sendNotification(slug)

  console.log("[pipeline] Terminé.")
}

main().catch(console.error)
```

**Helpers** `pipeline/helpers.ts` :

```ts
import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"

// Config SMTP de l'hébergeur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.votre-hebergeur.com", // À configurer
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true pour 465, false pour 587
  auth: {
    user: process.env.SMTP_USER || "noreply@studentmoney.fr", // Ton email
    pass: process.env.SMTP_PASS || "", // Mot de passe / app password
  },
})

export async function sendNotification(slug: string) {
  const draftPath = path.join(process.cwd(), "content", "drafts", `${slug}.mdx`)
  const content = fs.readFileSync(draftPath, "utf-8")
  const titleMatch = content.match(/title:\s*"(.+)"/)
  const title = titleMatch ? titleMatch[1] : slug

  await transporter.sendMail({
    from: '"Student-Money" <noreply@studentmoney.fr>',
    to: "ton-email@example.com", // Ton email perso pour recevoir les notifs
    subject: `✏️ Nouvel article à valider : "${title}"`,
    html: `
      <h1>Nouvel article généré</h1>
      <p><strong>${title}</strong></p>
      <p>Slug : <code>${slug}</code></p>
      <p>
        <a href="https://studentmoney.fr/admin/drafts/${slug}">
          👉 Valider l'article
        </a>
      </p>
    `,
  })
}
```

---

### Étape 11 — Newsletter (PHP)

**`scripts/newsletter/subscribe.php`** :

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email invalide']);
    exit;
}

$subscribersFile = __DIR__ . '/subscribers.json';
$subscribers = [];

if (file_exists($subscribersFile)) {
    $subscribers = json_decode(file_get_contents($subscribersFile), true) ?? [];
}

// Éviter les doublons
if (in_array($email, $subscribers)) {
    echo json_encode(['success' => true, 'message' => 'Déjà inscrit']);
    exit;
}

$subscribers[] = $email;
file_put_contents($subscribersFile, json_encode($subscribers, JSON_PRETTY_PRINT));

echo json_encode(['success' => true]);
```

**`scripts/newsletter/send.php`** :

```php
<?php
// Cron : 0 10 * * 1 php /home/.../student-money/scripts/newsletter/send.php

$subscribersFile = __DIR__ . '/subscribers.json';
if (!file_exists($subscribersFile)) {
    echo "Aucun abonné.\n";
    exit;
}

$subscribers = json_decode(file_get_contents($subscribersFile), true);
if (empty($subscribers)) {
    echo "Aucun abonné.\n";
    exit;
}

// Trouver le dernier article publié
$publishedDir = __DIR__ . '/../../content/published';
$files = glob($publishedDir . '/*.mdx');
if (empty($files)) {
    echo "Aucun article publié.\n";
    exit;
}

// Trier par date de modification
usort($files, function($a, $b) { return filemtime($b) - filemtime($a); });
$latestFile = $files[0];

// Extraire le titre et l'excerpt
$content = file_get_contents($latestFile);
preg_match('/title:\s*"(.+)"/', $content, $titleMatch);
preg_match('/excerpt:\s*"(.+)"/', $content, $excerptMatch);
preg_match('/slug:\s*"(.+)"/', $content, $slugMatch);

$title = $titleMatch[1] ?? 'Nouvel article';
$excerpt = $excerptMatch[1] ?? '';
$slug = $slugMatch[1] ?? '';

$subject = "🤑 Student-Money : " . $title;
$siteUrl = "https://studentmoney.fr";
$articleUrl = $siteUrl . "/articles/" . $slug;

$headers = "From: Student-Money <noreply@studentmoney.fr>\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

$message = "
<html>
<body style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
  <h1 style='color: #1a1a2e;'>$title</h1>
  <p style='color: #555;'>$excerpt</p>
  <a href='$articleUrl' style='display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;'>
    Lire l'article
  </a>
  <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
  <p style='color: #999; font-size: 12px;'>
    Tu reçois cet email car tu es inscrit à la newsletter Student-Money.
    <br><a href='$siteUrl/unsubscribe'>Se désinscrire</a>
  </p>
</body>
</html>
";

foreach ($subscribers as $email) {
    mail($email, $subject, $message, $headers);
}

echo "Newsletter envoyée à " . count($subscribers) . " abonnés.\n";
```

---

### Étape 12 — SEO

**`src/app/sitemap.ts`** :

```ts
import { MetadataRoute } from "next"
import { getAllSlugs } from "@/lib/content"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://studentmoney.fr"
  const slugs = getAllSlugs("published")

  const articles = slugs.map(slug => ({
    url: `${baseUrl}/articles/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...articles,
  ]
}
```

**`src/app/robots.ts`** :

```ts
import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: "https://studentmoney.fr/sitemap.xml",
  }
}
```

**Metadata dans les articles** : Chaque page `[slug]/page.tsx` doit exporter `generateMetadata` qui crée :
- `title` : le titre de l'article
- `description` : l'excerpt
- `openGraph` : title, description, type: "article"
- `other` : JSON-LD pour BlogPosting ET FAQ (si le frontmatter contient `faq`)
- `alternates.canonical` : URL canonique de l'article

Le JSON-LD doit être une string JSON valide, placée dans une balise `<script type="application/ld+json">`.

---

### Étape 13 — AdSense

**Composant `src/components/ad-banner.tsx`** :

```tsx
export default function AdBanner({ slot }: { slot?: string }) {
  // En développement, afficher un placeholder
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="my-8 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 text-gray-400">
        Publicité — AdSense (slot: {slot || "auto"})
      </div>
    )
  }

  return (
    <div className="my-8">
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Remplacer par ton ID
        data-ad-slot={slot || "auto"}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
```

**Placement des pubs** :
- Après le 2e paragraphe de chaque article (via le composant MDX personnalisé)
- Entre les articles sur la page d'accueil (tous les 3 articles)
- Sidebar ? Pas nécessaire en mobile-first, à voir plus tard

**Script AdSense** : À ajouter dans le `<head>` du layout racine :
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script>
```

---

### Étape 14 — Génération des articles seed

Après avoir construit toutes les étapes ci-dessus, l'agent doit générer 3-5 articles de démarrage :

```bash
# Pour chaque catégorie, générer un article
node pipeline/generate.ts  # Bourses
node pipeline/generate.ts  # Logement
node pipeline/generate.ts  # Alimentation
node pipeline/generate.ts  # Transport
node pipeline/generate.ts  # Banque/Épargne
```

Puis les publier manuellement (ou via l'API) :
```bash
# Déplacer les fichiers générés de drafts/ vers published/
cp content/drafts/article-1.mdx content/published/
# ... etc
```

---

### Étape 15 — Déploiement sur cPanel Node.js

1. **Builder le projet** :
   ```bash
   npm run build
   ```

2. **Configurer l'app Node.js dans cPanel** :
   - Aller dans **Setup Node.js App** (Software section)
   - Cliquer **Create Application**
   - Mode : **Production**
   - Application root : `/home/.../student-money`
   - Application URL : le domaine
   - Application startup file : `node_modules/.bin/next`
   - Passer le flag `start` dans les arguments (ou utiliser `npm start`)
   - Node.js version : 22.x

3. **Démarrer l'app** :
   ```bash
   npm start
   ```

4. **Configurer le cron pour le pipeline** :
   Dans cPanel → Cron Jobs :
   ```
   0 8 * * * cd /home/.../student-money && /home/.../nodevenv/.../bin/node pipeline/generate.ts >> /home/.../logs/pipeline.log 2>&1
   ```
   (Remplacer les chemins `...` par les vrais chemins cPanel)

   Cron newsletter :
   ```
   0 10 * * 1 php /home/.../public_html/student-money/scripts/newsletter/send.php
   ```

5. **Redémarrage après modif** : cPanel redémarre automatiquement l'app si on la reconfigure. Sinon, depuis SSH : redémarrer le process Node.js via cPanel.

---

## 5. Catégories d'articles

| Slug | Label | Description |
|---|---|---|
| `bourses` | Bourses & Aides | Crous, aides régionales, subventions |
| `logement` | Logement | Colocation, APL, meublé, résidences |
| `bouffe` | Alimentation | Courses pas chères, batch cooking, tickets restau |
| `transport` | Transport | Abonnements, covoiturage, vélo |
| `jobs` | Jobs étudiants | Jobs étudiants, freelancing, alternance |
| `banque` | Banque & Épargne | Banques en ligne, cashback, livrets |

---

## 6. Variable d'environnement (`.env.local`)

```env
# SMTP pour les notifications
SMTP_HOST=smtp.ton-hebergeur.com
SMTP_PORT=587
SMTP_USER=noreply@studentmoney.fr
SMTP_PASS=ton-mot-de-passe-smtp

# Email qui reçoit les notifications de nouveaux articles
NOTIF_EMAIL=ton-email@example.com

# URL du site
NEXT_PUBLIC_SITE_URL=https://studentmoney.fr

# Chemin du projet (pour le cron)
PROJECT_DIR=/home/.../student-money
```

---

## 7. Commandes de vérification

Après avoir terminé TOUTES les étapes ci-dessus :

```bash
# Vérifier que le build passe
npm run build

# Vérifier que le site démarre
npm run dev
# → Visiter http://localhost:3000
# → Visiter http://localhost:3000/admin
# → Visiter http://localhost:3000/admin/drafts

# Vérifier que les types passent
npx tsc --noEmit

# Vérifier le lint
npm run lint
```

---

## Résumé pour l'agent

1. **Lire ce fichier en entier** avant de commencer
2. **Suivre les étapes dans l'ordre** (1 → 15)
3. **Node 22** recommandé (dispo jusqu'à 22 chez toi) — ne pas utiliser de features expérimentales
4. **shadcn/ui** en new-york / neutral
5. **Tout le contenu est en français** (UI, articles, métadonnées)
6. **Hermes CLI** : `hermes -z "prompt"` pour le mode one-shot non-interactif
7. **SSR dynamique** — pas de static export
8. **Pas de base de données** — tout est fichiers MDX + fichiers JSON
9. **Vérifier build + types + lint** après chaque étape majeure
10. **Générer 5 articles seed** pour ne pas démarrer avec un site vide
11. **Ne pas coder les pubs AdSense réelles** — placeholder uniquement
12. **Poser des questions** en cas de doute sur un détail technique
