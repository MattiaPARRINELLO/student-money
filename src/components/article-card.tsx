import Link from "next/link"
import type { ArticleFrontmatter } from "@/lib/content"
import { formatDate, cn, formatCategory, getCategoryBadgeColor } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"

export default function ArticleCard(frontmatter: ArticleFrontmatter) {
  const categoryLabel = formatCategory(frontmatter.category)
  const badgeColor = getCategoryBadgeColor(frontmatter.category || "")

  return (
    <Link
      href={`/articles/${frontmatter.slug}`}
      className="group relative block h-full rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20"
    >
      <div className="flex flex-col gap-3 h-full">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors", badgeColor)}>
            {categoryLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(frontmatter.date)}
          </span>
        </div>

        <h3 className="text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {frontmatter.title}
        </h3>

        <p className="flex-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {frontmatter.excerpt}
        </p>

        <div className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-all">
          <span>Lire l&apos;article</span>
          <ArrowUpRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  )
}
