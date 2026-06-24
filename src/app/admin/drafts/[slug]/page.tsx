"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { formatDate, formatCategory } from "@/lib/utils"

interface ArticleFrontmatter {
  title: string
  slug: string
  date: string
  category: string
  excerpt: string
  coverImage?: string
  faq?: { question: string; answer: string }[]
  tags?: string[]
}

interface DraftData {
  frontmatter: ArticleFrontmatter
  content: string
  raw: string
}

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Send, Trash2 } from "lucide-react"

export default function DraftPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [draft, setDraft] = useState<DraftData | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const fetchDraft = useCallback(async () => {
    try {
      const res = await fetch(`/api/drafts?slug=${encodeURIComponent(slug)}`)
      if (res.ok) {
        const data = await res.json()
        setDraft(data)
      } else {
        setError("Brouillon introuvable.")
      }
    } catch {
      setError("Erreur lors du chargement du brouillon.")
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchDraft()
  }, [fetchDraft])

  async function handlePublish() {
    setPublishing(true)
    setError("")
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      if (res.ok) {
        router.push("/admin/drafts")
      } else {
        const data = await res.json()
        setError(data.error || "Erreur lors de la publication.")
      }
    } catch {
      setError("Erreur réseau.")
    } finally {
      setPublishing(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/drafts?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/admin/drafts")
      } else {
        const data = await res.json()
        setError(data.error || "Erreur lors de la suppression.")
      }
    } catch {
      setError("Erreur réseau.")
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-muted-foreground">Chargement du brouillon...</p>
  }

  if (error && !draft) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-destructive">{error}</p>
        <Link href="/admin/drafts">
          <Button variant="outline" render={<Link href="/admin/drafts" />}>
            Retour aux brouillons
          </Button>
        </Link>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-muted-foreground">Brouillon introuvable.</p>
        <Link href="/admin/drafts">
          <Button variant="outline" render={<Link href="/admin/drafts" />}>
            Retour aux brouillons
          </Button>
        </Link>
      </div>
    )
  }

  const categoryLabel = formatCategory(draft.frontmatter.category)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/drafts">
          <Button variant="outline" size="sm" render={<Link href="/admin/drafts" />}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-1 h-4 w-4" />
            Supprimer
          </Button>
          <Button onClick={handlePublish} disabled={publishing} className="bg-green-600 hover:bg-green-700">
            <Send className="mr-1 h-4 w-4" />
            {publishing ? "Publication..." : "Publier"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <article className="prose prose-neutral max-w-none">
        <Badge variant="secondary" className="mb-3">
          {categoryLabel}
        </Badge>
        <h1>{draft.frontmatter.title}</h1>
        <p className="text-sm text-muted-foreground">{formatDate(draft.frontmatter.date)}</p>
        <p className="text-muted-foreground">{draft.frontmatter.excerpt}</p>
        <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-muted p-4 text-xs">
          {draft.content}
        </pre>
      </article>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce brouillon ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le brouillon &quot;{draft.frontmatter.title}&quot; sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
