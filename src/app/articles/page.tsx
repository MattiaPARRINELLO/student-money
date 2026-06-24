import { Metadata } from "next"
import Link from "next/link"
import { getArticles, getCategories, formatCategory } from "@/lib/content"
import ArticleCard from "@/components/article-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export const dynamic = "force-dynamic"

const ARTICLES_PER_PAGE = 9

export const metadata: Metadata = {
  title: "Articles — Student-Money",
  description: "Tous nos articles pour aider les étudiants à économiser au quotidien.",
}

interface PageProps {
  searchParams: Promise<{ page?: string; categorie?: string }>
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { page: pageParam, categorie } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10))
  const allArticles = getArticles("published")
  const categories = getCategories()

  const filtered = categorie
    ? allArticles.filter(a => a.frontmatter.category === categorie)
    : allArticles

  const totalPages = Math.max(1, Math.ceil(filtered.length / ARTICLES_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const start = (safePage - 1) * ARTICLES_PER_PAGE
  const pagedArticles = filtered.slice(start, start + ARTICLES_PER_PAGE)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="animate-fade-in-up">
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Articles</h1>
        <p className="mb-8 text-muted-foreground text-lg">
          Tous nos conseils et astuces pour faire des économies
        </p>
      </div>

      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2 animate-fade-in-up animate-stagger-1">
          <Link href="/articles">
            <Badge
              variant={!categorie ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105"
            >
              Tous
            </Badge>
          </Link>
          {categories.map((cat, i) => (
            <Link key={cat} href={`/articles?categorie=${cat}`}>
              <Badge
                variant={categorie === cat ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105"
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                {formatCategory(cat)}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {pagedArticles.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground animate-fade-in">
          Aucun article dans cette catégorie pour le moment.
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pagedArticles.map((article, i) => (
              <div key={article.frontmatter.slug} className={`animate-fade-in-up`} style={{ animationDelay: `${0.05 * i}s` }}>
                <ArticleCard {...article.frontmatter} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4 animate-fade-in-up">
              {safePage > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all hover:scale-105"
                  render={
                    <Link href={`/articles?page=${safePage - 1}${categorie ? `&categorie=${categorie}` : ""}`}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Précédent
                    </Link>
                  }
                />
              )}
              <span className="text-sm font-medium text-muted-foreground">
                Page {safePage} / {totalPages}
              </span>
              {safePage < totalPages && (
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all hover:scale-105"
                  render={
                    <Link href={`/articles?page=${safePage + 1}${categorie ? `&categorie=${categorie}` : ""}`}>
                      Suivant
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  }
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
