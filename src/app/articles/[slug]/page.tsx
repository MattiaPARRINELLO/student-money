import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getArticle, getArticles, type ArticleFrontmatter, CATEGORY_LABELS } from "@/lib/content"
import { renderMDX } from "@/lib/render-mdx"
import { formatDate } from "@/lib/utils"
import AdBanner from "@/components/ad-banner"
import ArticleCard from "@/components/article-card"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function generateJsonLd(frontmatter: ArticleFrontmatter): Record<string, unknown> {
  const baseUrl = "https://studentmoney.fr"
  const url = `${baseUrl}/articles/${frontmatter.slug}`

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    description: frontmatter.excerpt,
    datePublished: frontmatter.date,
    author: { "@type": "Organization", name: "Student-Money" },
    publisher: { "@type": "Organization", name: "Student-Money" },
    url,
  }
}

function generateFaqJsonLd(faq: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug, "published")
  if (!article) return { title: "Article introuvable" }

  const baseUrl = "https://studentmoney.fr"
  const url = `${baseUrl}/articles/${slug}`

  const metadata: Metadata = {
    title: article.frontmatter.title,
    description: article.frontmatter.excerpt,
    openGraph: {
      title: article.frontmatter.title,
      description: article.frontmatter.excerpt,
      type: "article",
      url,
    },
    alternates: { canonical: url },
  }

  if (article.frontmatter.tags) {
    metadata.keywords = article.frontmatter.tags
  }

  return metadata
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getArticle(slug, "published")
  if (!article) notFound()

  const { content, frontmatter } = await renderMDX(article.raw)
  const readingTime = estimateReadingTime(article.content)
  const categoryLabel = CATEGORY_LABELS[frontmatter.category] || frontmatter.category.charAt(0).toUpperCase() + frontmatter.category.slice(1)
  const relatedArticles = getArticles("published")
    .filter(a => a.frontmatter.slug !== slug && a.frontmatter.category === frontmatter.category)
    .slice(0, 3)

  const jsonLd = generateJsonLd(frontmatter)
  const faqJsonLd = frontmatter.faq ? generateFaqJsonLd(frontmatter.faq) : null

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 animate-fade-in-left"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux articles
        </Link>

        <div className="animate-fade-in-up">
          <Badge variant="secondary" className="mb-4">
            {categoryLabel}
          </Badge>
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
            {frontmatter.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} min de lecture
            </span>
          </div>
        </div>

        <div className="mt-8 prose prose-neutral max-w-none animate-fade-in-up animate-stagger-1 [&>h2]:mt-12 [&>h2]:text-2xl [&>h2]:font-bold [&>h3]:text-xl [&>p]:leading-relaxed">
          {content}
        </div>

        <AdBanner slot="article-bottom" />

        {frontmatter.faq && frontmatter.faq.length > 0 && (
          <section className="mt-16 rounded-2xl border bg-card/50 backdrop-blur p-8 animate-fade-in-up">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Questions fréquentes</h2>
            <div className="space-y-3">
              {frontmatter.faq.map((item, i) => (
                <details key={i} className="group rounded-xl border bg-background p-5 transition-all duration-200 hover:border-primary/30 open:border-primary/30 open:bg-primary/5">
                  <summary className="cursor-pointer font-medium list-none flex items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span className="text-muted-foreground text-lg leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {frontmatter.liens && frontmatter.liens.length > 0 && (
          <section className="mt-12 rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-8 animate-fade-in-up">
            <h2 className="mb-6 text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-primary">🔗</span>
              Liens utiles
            </h2>
            <div className="grid gap-3">
              {frontmatter.liens.map((lien, i) => (
                <a
                  key={i}
                  href={lien.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl border bg-background p-4 transition-all duration-200 hover:border-primary hover:shadow-md hover:translate-y-[-1px]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {lien.titre}
                      </p>
                      {lien.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{lien.description}</p>
                      )}
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold tracking-tight animate-fade-in-left">
              Articles similaires
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedArticles.map((a, i) => (
                <div key={a.frontmatter.slug} className={`animate-fade-in-up animate-stagger-${i + 1}`}>
                  <ArticleCard {...a.frontmatter} />
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}
