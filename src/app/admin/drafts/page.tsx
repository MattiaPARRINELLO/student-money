import Link from "next/link"
import { getArticles, formatCategory } from "@/lib/content"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"

export const dynamic = "force-dynamic"

export default function DraftsPage() {
  const drafts = getArticles("drafts")

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Brouillons ({drafts.length})</h2>
        <Link href="/admin">
          <Button variant="outline" render={<Link href="/admin" />}>
            Retour au dashboard
          </Button>
        </Link>
      </div>

      {drafts.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          Aucun brouillon en attente. Lance le pipeline pour générer des articles.
        </p>
      ) : (
        <div className="space-y-3">
          {drafts.map(draft => (
            <div
              key={draft.frontmatter.slug}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <h3 className="font-medium">{draft.frontmatter.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {formatCategory(draft.frontmatter.category)}
                  </Badge>
                  <span>{formatDate(draft.frontmatter.date)}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/admin/drafts/${draft.frontmatter.slug}`} />}
              >
                <Eye className="mr-1 h-4 w-4" />
                Prévisualiser
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
