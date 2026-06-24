import Link from "next/link"
import { getArticles, getAllSlugs } from "@/lib/content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, FileEdit, Globe, Sparkles } from "lucide-react"
import PublishedArticlesManager from "@/components/admin/published-articles-manager"

export const dynamic = "force-dynamic"

export default function AdminDashboard() {
  const publishedArticles = getArticles("published")
  const draftSlugs = getAllSlugs("drafts")
  const latestArticle = publishedArticles[0]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Articles publiés</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{publishedArticles.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Brouillons en attente</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{draftSlugs.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dernier article</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {latestArticle ? latestArticle.frontmatter.title : "Aucun article"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/admin/nouveau" />}>
          <Sparkles className="mr-2 h-4 w-4" />
          Nouvel article
        </Button>
        <Button variant="outline" render={<Link href="/admin/drafts" />}>
          Voir les brouillons ({draftSlugs.length})
        </Button>
        <Button variant="outline" render={<Link href="/" />}>
          Voir le site
        </Button>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Tous les articles publiés</h2>
        <PublishedArticlesManager articles={publishedArticles.map(a => a.frontmatter)} />
      </div>
    </div>
  )
}
