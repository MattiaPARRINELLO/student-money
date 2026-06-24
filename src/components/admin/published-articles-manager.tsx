"use client"

import { useState } from "react"
import Link from "next/link"
import type { ArticleFrontmatter } from "@/lib/content"
import { formatDate, formatCategory, getCategoryBadgeColor, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Trash2, ExternalLink } from "lucide-react"

interface Props {
  articles: ArticleFrontmatter[]
}

export default function PublishedArticlesManager({ articles }: Props) {
  const [list, setList] = useState(articles)
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const deleteArticle = list.find(a => a.slug === deleteSlug)

  async function handleDelete() {
    if (!deleteSlug) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/articles?slug=${encodeURIComponent(deleteSlug)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setList(prev => prev.filter(a => a.slug !== deleteSlug))
      }
    } catch {
      // silent
    } finally {
      setDeleting(false)
      setDeleteSlug(null)
    }
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <FileText className="h-12 w-12" />
        <p>Aucun article publié pour le moment.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {list.map((article, i) => (
          <div
            key={article.slug}
            className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3 transition-all duration-200 hover:shadow-sm animate-fade-in-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                  getCategoryBadgeColor(article.category || "")
                )}>
                  {formatCategory(article.category)}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(article.date)}</span>
              </div>
              <Link href={`/articles/${article.slug}`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">
                {article.title}
              </Link>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" render={<Link href={`/articles/${article.slug}`} />}>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteSlug(article.slug)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!deleteSlug} onOpenChange={(open) => { if (!open) setDeleteSlug(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet article ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. L&apos;article &quot;{deleteArticle?.title}&quot; sera définitivement supprimé du site.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSlug(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
