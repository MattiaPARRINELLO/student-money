import type { ReactNode } from "react"
import type { ArticleFrontmatter } from "@/lib/content"
import { CATEGORY_LABELS } from "@/lib/content"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ArticleContentProps {
  frontmatter: ArticleFrontmatter
  content: ReactNode
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export default function ArticleContent({ frontmatter, content }: ArticleContentProps) {
  const categoryLabel = CATEGORY_LABELS[frontmatter.category] || frontmatter.category

  return (
    <article>
      <div className="mb-8">
        <Badge variant="secondary" className="mb-3">
          {categoryLabel}
        </Badge>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {frontmatter.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
          <span>·</span>
          <span>{estimateReadingTime(frontmatter.excerpt)} min de lecture</span>
        </div>
      </div>

      <div className="prose prose-neutral max-w-none">
        {content}
      </div>

      {frontmatter.faq && frontmatter.faq.length > 0 && (
        <section className="mt-12 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Questions fréquentes</h2>
          <div className="space-y-3">
            {frontmatter.faq.map((item, i) => (
              <details key={i} className="group rounded-md border p-4">
                <summary className="cursor-pointer font-medium">
                  {item.question}
                </summary>
                <p className="mt-2 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
