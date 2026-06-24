import Link from "next/link"
import { getArticles, getCategories, formatCategory } from "@/lib/content"
import ArticleCard from "@/components/article-card"
import NewsletterForm from "@/components/newsletter-form"
import AdBanner from "@/components/ad-banner"
import { Button } from "@/components/ui/button"
import {
  ArrowRight, Sparkles, PiggyBank, GraduationCap, Zap, Home,
  UtensilsCrossed, TrainFront, Briefcase, Heart, Laptop, Shirt,
  Dumbbell, Gamepad2, Plane, BookOpen, Music, Camera, Smile,
  Stethoscope, Banknote, CreditCard, Shield, Star, Tag,
} from "lucide-react"

export const dynamic = "force-dynamic"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  bourses: <GraduationCap className="h-6 w-6" />,
  logement: <Home className="h-6 w-6" />,
  bouffe: <UtensilsCrossed className="h-6 w-6" />,
  transport: <TrainFront className="h-6 w-6" />,
  jobs: <Briefcase className="h-6 w-6" />,
  banque: <PiggyBank className="h-6 w-6" />,
}

const CATEGORY_KEYWORD_ICONS: [RegExp, React.ReactNode][] = [
  [/sant[ée]|mutuelle|m[ée]decin|hopital/, <Stethoscope key="sante" className="h-6 w-6" />],
  [/mode|v[êe]tement|fringues/, <Shirt key="mode" className="h-6 w-6" />],
  [/techno|numerique|digital|appli|logiciel/, <Laptop key="tech" className="h-6 w-6" />],
  [/sport|muscu|salle/, <Dumbbell key="sport" className="h-6 w-6" />],
  [/jeu|jeux|gaming/, <Gamepad2 key="jeux" className="h-6 w-6" />],
  [/voyage|vacances|week-end/, <Plane key="voyage" className="h-6 w-6" />],
  [/culture|livre|lecture/, <BookOpen key="culture" className="h-6 w-6" />],
  [/musique|concert/, <Music key="musique" className="h-6 w-6" />],
  [/photo|vid[ée]o/, <Camera key="photo" className="h-6 w-6" />],
  [/bien-.*tre|mental|psycho/, <Smile key="bienetre" className="h-6 w-6" />],
  [/assurance|pr[ée]voyance/, <Shield key="assurance" className="h-6 w-6" />],
  [/carte|cr[ée]dit|pr[êe]t/, <CreditCard key="credit" className="h-6 w-6" />],
  [/[ée]pargne|investir/, <Banknote key="epargne" className="h-6 w-6" />],
]

const ICON_POOL = [
  <Heart key="heart" className="h-6 w-6" />,
  <Star key="star" className="h-6 w-6" />,
  <Zap key="zap" className="h-6 w-6" />,
  <Sparkles key="sparkles" className="h-6 w-6" />,
  <Shield key="shield" className="h-6 w-6" />,
  <BookOpen key="book" className="h-6 w-6" />,
  <Smile key="smile" className="h-6 w-6" />,
  <Tag key="tag" className="h-6 w-6" />,
]

function getCategoryIcon(cat: string): React.ReactNode {
  if (CATEGORY_ICONS[cat]) return CATEGORY_ICONS[cat]
  for (const [regex, icon] of CATEGORY_KEYWORD_ICONS) {
    if (regex.test(cat)) return icon
  }
  let hash = 0
  for (let i = 0; i < cat.length; i++) {
    hash = ((hash << 5) - hash) + cat.charCodeAt(i)
    hash |= 0
  }
  return ICON_POOL[Math.abs(hash) % ICON_POOL.length]
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  bourses: "from-amber-500/10 via-yellow-500/5 to-orange-500/10",
  logement: "from-blue-500/10 via-cyan-500/5 to-indigo-500/10",
  bouffe: "from-emerald-500/10 via-green-500/5 to-teal-500/10",
  transport: "from-violet-500/10 via-purple-500/5 to-fuchsia-500/10",
  jobs: "from-orange-500/10 via-red-500/5 to-rose-500/10",
  banque: "from-pink-500/10 via-rose-500/5 to-red-500/10",
}

export default async function HomePage() {
  const articles = getArticles("published")
  const latestArticles = articles.slice(0, 6)
  const categories = getCategories()
  const categoryCounts: Record<string, number> = {}
  articles.forEach(a => {
    categoryCounts[a.frontmatter.category] = (categoryCounts[a.frontmatter.category] || 0) + 1
  })

  return (
    <div className="overflow-hidden">
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 animate-gradient" />
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />

        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/80 backdrop-blur px-3 py-1 text-xs font-medium text-primary mb-6 animate-scale-in">
              <Zap className="h-3 w-3" />
              Nouveau — Astuces 2026
            </span>
          </div>
          <h1 className="animate-fade-in-up animate-stagger-1 mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Le blog qui fait économiser
            </span>
            <br />
            <span className="text-foreground">les étudiants</span>
          </h1>
          <p className="animate-fade-in-up animate-stagger-2 mb-10 text-lg text-muted-foreground sm:text-xl leading-relaxed max-w-2xl mx-auto">
            Bourses, logement, alimentation, transport : toutes les astuces pour
            garder plus d&apos;argent dans ton compte en banque.
          </p>
          <div className="animate-fade-in-up animate-stagger-3 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="text-base rounded-full px-8 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-105 hover:-translate-y-0.5"
              render={
                <Link href="/articles">
                  Voir les articles
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              }
            />
            <Link
              href="/#newsletter"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Ou rejoins la newsletter →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div className="animate-fade-in-left">
            <h2 className="text-3xl font-bold tracking-tight">Derniers articles</h2>
            <p className="mt-1 text-muted-foreground">
              Nos conseils frais pour ton porte-monnaie
            </p>
          </div>
          <Link
            href="/articles"
            className="animate-fade-in-right hidden text-sm font-medium text-primary hover:underline underline-offset-4 sm:flex items-center gap-1 transition-all hover:gap-2"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latestArticles.length === 0 ? (
          <p className="animate-fade-in py-16 text-center text-muted-foreground">
            Aucun article pour le moment. Revenez bientôt !
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article, i) => (
              <div key={article.frontmatter.slug} className={`animate-fade-in-up animate-stagger-${i + 1}`}>
                <ArticleCard {...article.frontmatter} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden animate-fade-in-up">
          <Link
            href="/articles"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            Voir tous les articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <AdBanner slot="home-middle" />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 animate-fade-in-left">
          <h2 className="text-3xl font-bold tracking-tight">Catégories</h2>
          <p className="mt-1 text-muted-foreground">
            Trouve les conseils qui t&apos;intéressent
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <Link
              key={cat}
              href={`/articles?categorie=${cat}`}
              className={`animate-fade-in-up animate-stagger-${i + 1} group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[cat] || "from-primary/5 to-accent/5"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110">
                  {getCategoryIcon(cat)}
                </div>
                <div>
                  <p className="font-semibold transition-colors group-hover:text-primary">
                    {formatCategory(cat)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {categoryCounts[cat] || 0} article{(categoryCounts[cat] || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-1" />
            </Link>
          ))}
          {categories.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground animate-fade-in">
              Les catégories apparaîtront ici une fois les premiers articles publiés.
            </p>
          )}
        </div>
      </section>

      <section id="newsletter" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-background" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/80 backdrop-blur px-3 py-1 text-xs font-medium text-primary mb-6 animate-fade-in-up">
            <Sparkles className="h-3 w-3" />
            Newsletter hebdomadaire
          </span>
          <h2 className="animate-fade-in-up animate-stagger-1 mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Reste au courant des meilleures astuces
          </h2>
          <p className="animate-fade-in-up animate-stagger-2 mb-8 text-muted-foreground text-lg">
            Reçois chaque semaine nos conseils pour économiser directement dans ta boîte mail.
          </p>
          <div className="animate-fade-in-up animate-stagger-3">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  )
}
