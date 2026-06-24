"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Loader2,
  Save,
  Copy,
  Check,
  ArrowLeft,
  Search,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Globe,
  PenLine,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { MarkdownPreview } from "@/components/markdown-preview"
import AdBanner from "@/components/ad-banner"

const CATEGORY_LABELS: Record<string, string> = {
  bourses: "Bourses & Aides",
  logement: "Logement",
  bouffe: "Alimentation",
  transport: "Transport",
  jobs: "Jobs étudiants",
  banque: "Banque & Épargne",
}

function formatCategory(cat: string): string {
  return CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)
}

function topicBadgeColor(cat: string): string {
  const palettes = [
    "bg-yellow-100 text-yellow-800 border-yellow-300",
    "bg-blue-100 text-blue-800 border-blue-300",
    "bg-green-100 text-green-800 border-green-300",
    "bg-purple-100 text-purple-800 border-purple-300",
    "bg-orange-100 text-orange-800 border-orange-300",
    "bg-pink-100 text-pink-800 border-pink-300",
    "bg-cyan-100 text-cyan-800 border-cyan-300",
    "bg-lime-100 text-lime-800 border-lime-300",
    "bg-rose-100 text-rose-800 border-rose-300",
    "bg-indigo-100 text-indigo-800 border-indigo-300",
    "bg-teal-100 text-teal-800 border-teal-300",
    "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
    "bg-amber-100 text-amber-800 border-amber-300",
    "bg-violet-100 text-violet-800 border-violet-300",
  ]
  let hash = 0
  for (let i = 0; i < cat.length; i++) {
    hash = ((hash << 5) - hash) + cat.charCodeAt(i)
    hash |= 0
  }
  return palettes[Math.abs(hash) % palettes.length]
}

interface Topic {
  titre: string
  description: string
  categorie: string
}

export default function NouvelArticlePage() {
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)

  // Step 1: Topic proposals
  const [topics, setTopics] = useState<Topic[]>([])
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [topicsPhase, setTopicsPhase] = useState<"idle" | "search" | "generate">("search")
  const [topicsRawOutput, setTopicsRawOutput] = useState("")
  const [topicsError, setTopicsError] = useState("")

  // Step 2: Article generation
  const [selectedTopic, setSelectedTopic] = useState("")
  const [generating, setGenerating] = useState(false)
  const [streamedContent, setStreamedContent] = useState("")
  const [streamingPhase, setStreamingPhase] = useState<"idle" | "search" | "generate">("idle")
  const [searchFound, setSearchFound] = useState<number | null>(null)
  const [generateError, setGenerateError] = useState("")

  // Save state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const extractSlug = (content: string) => {
    const m = content.match(/slug:\s*"([^"]+)"/) || content.match(/slug:\s*'([^']+)'/)
    return m ? m[1] : `article-${Date.now()}`
  }

  const fetchTopics = useCallback(async () => {
    setLoadingTopics(true)
    setTopicsError("")
    setTopics([])
    setTopicsRawOutput("")
    setTopicsPhase("search")

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const res = await fetch("/api/generate/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error("Erreur de connexion")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let rawOutput = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() || ""

        for (const part of parts) {
          if (!part.trim()) continue
          const lines = part.split("\n")
          let eventType = "message"
          let dataStr = ""

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim()
            else if (line.startsWith("data: ")) dataStr = line.slice(6).trim()
          }

          if (!dataStr) continue

          try {
            const data = JSON.parse(dataStr)

            switch (eventType) {
              case "status":
                if (data.phase === "search") setTopicsPhase("search")
                if (data.phase === "generate") setTopicsPhase("generate")
                break
              case "search":
                break
              case "content":
                rawOutput += data.text
                setTopicsRawOutput(rawOutput)
                break
              case "done":
                setTopics(data.sujets || [])
                setLoadingTopics(false)
                setTopicsPhase("idle")
                break
              case "error":
                setTopicsError(data.error)
                setLoadingTopics(false)
                setTopicsPhase("idle")
                break
            }
          } catch {
            // skip
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return
      setTopicsError(e instanceof Error ? e.message : "Erreur de streaming")
      setLoadingTopics(false)
      setTopicsPhase("idle")
    }
  }, [])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const handleStreamGenerate = useCallback(async (topic: Topic) => {
    if (generating) return
    abortRef.current?.abort()
    setSelectedTopic(topic.titre)
    setGenerating(true)
    setStreamedContent("")
    setGenerateError("")
    setSaved(false)
    setStreamingPhase("search")
    setSearchFound(null)

    abortRef.current = new AbortController()

    try {
      const res = await fetch("/api/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.titre }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error("Erreur de connexion au stream")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ""
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const parts = buf.split("\n\n")
        buf = parts.pop() || ""

        for (const part of parts) {
          if (!part.trim()) continue
          const lines = part.split("\n")
          let eventType = "message"
          let dataStr = ""

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim()
            else if (line.startsWith("data: ")) dataStr = line.slice(6).trim()
          }

          if (!dataStr) continue

          try {
            const data = JSON.parse(dataStr)

            switch (eventType) {
              case "status":
                if (data.phase === "search") setStreamingPhase("search")
                if (data.phase === "generate") setStreamingPhase("generate")
                break
              case "search":
                setSearchFound(data.found ? 1 : 0)
                break
              case "content":
                accumulated += data.text
                setStreamedContent(accumulated)
                break
              case "done":
                setStreamedContent(accumulated)
                setGenerating(false)
                setStreamingPhase("idle")
                break
              case "error":
                setGenerateError(data.error)
                setGenerating(false)
                setStreamingPhase("idle")
                break
            }
          } catch {
            // skip
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return
      setGenerateError(e instanceof Error ? e.message : "Erreur de streaming")
    } finally {
      setGenerating(false)
      setStreamingPhase("idle")
    }
  }, [generating])

  const handleCancel = () => {
    abortRef.current?.abort()
    setGenerating(false)
    setStreamingPhase("idle")
    setStreamedContent("")
  }

  const handleSave = async () => {
    if (!streamedContent || saving) return
    setSaving(true)
    const slug = extractSlug(streamedContent)

    try {
      const res = await fetch("/api/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content: streamedContent }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur de sauvegarde")
      }
      setSaved(true)
      setTimeout(() => router.push(`/admin/drafts/${slug}`), 800)
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Erreur de sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(streamedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au dashboard
      </Link>

      {/* Header card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Générer un nouvel article
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            L&apos;IA analyse l&apos;actualité pour proposer des sujets tendance.
            Tu peux aussi rafraîchir pour avoir de nouveaux sujets.
          </p>
          <Button
            onClick={fetchTopics}
            disabled={loadingTopics}
            size="lg"
            className="h-12"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loadingTopics && "animate-spin")} />
            {loadingTopics ? "Analyse en cours..." : "Proposer de nouveaux sujets"}
          </Button>
        </CardContent>
      </Card>

      {/* Streaming topic generation */}
      {loadingTopics && (
        <Card className="animate-fade-in-up overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 animate-gradient" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {topicsPhase === "search" ? (
                <>
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="inline-flex items-center gap-1">
                    Recherche des tendances
                    <span className="inline-flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="inline-flex items-center gap-1">
                    Génération des sujets
                    <span className="inline-flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topicsPhase === "generate" && topicsRawOutput && (
              <div className="rounded-lg border bg-muted/30 p-4 max-h-[400px] overflow-y-auto">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                  {topicsRawOutput}
                  <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                </pre>
              </div>
            )}
            <AdBanner slot="generation-topics" />
          </CardContent>
        </Card>
      )}

      {topicsError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive animate-fade-in-up">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {topicsError}
        </div>
      )}

      {/* Topic cards */}
      {!loadingTopics && topics.length > 0 && !streamedContent && (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Choisis un sujet à développer
          </h2>
          <div className="grid gap-3">
            {topics.map((t, i) => (
              <button
                key={i}
                onClick={() => handleStreamGenerate(t)}
                disabled={generating}
                className={cn(
                  "text-left group rounded-xl border bg-card p-4 transition-all duration-300",
                  "hover:border-primary hover:shadow-lg hover:translate-y-[-2px]",
                  generating && "opacity-50 pointer-events-none",
                  selectedTopic === t.titre && "border-primary ring-2 ring-primary/20",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Badge
                      variant="outline"
                          className={cn("text-xs border mb-1.5", topicBadgeColor(t.categorie || ""))}
                    >
                      {formatCategory(t.categorie)}
                    </Badge>
                    <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
                      {t.titre}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={fetchTopics} className="text-muted-foreground">
            <RefreshCw className="h-3 w-3 mr-1" />
            Proposer d&apos;autres sujets
          </Button>
        </div>
      )}

      {/* Article streaming generation */}
      {generating && (
        <Card className="animate-fade-in-up overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 animate-gradient" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <PenLine className="h-5 w-5 text-primary" />
                <span className="inline-flex items-center gap-1">
                  {streamingPhase === "search" ? "Recherche d'informations" : "Rédaction en cours"}
                  <span className="inline-flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </span>
              </span>
              <Button variant="ghost" size="sm" onClick={handleCancel} className="text-muted-foreground">
                Annuler
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {streamingPhase === "search" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <Globe className="h-10 w-10 text-blue-500" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                  </span>
                </div>
                <span className="text-muted-foreground">Recherche d&apos;informations sur le web...</span>
              </div>
            )}

            {streamingPhase === "generate" && searchFound !== null && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                searchFound > 0
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              )}>
                <Search className="h-4 w-4" />
                {searchFound > 0
                  ? `${searchFound} source(s) trouvée(s) — l'IA les utilise`
                  : "Aucune source — l'IA rédige avec ses connaissances"}
              </div>
            )}

            <AdBanner slot="generation-article" />

            {streamedContent && (
              <div className="rounded-lg border bg-background p-6 max-h-[600px] overflow-y-auto">
                <MarkdownPreview content={streamedContent} isStreaming={generating} />
              </div>
            )}

            {!streamedContent && streamingPhase === "generate" && (
              <div className="flex flex-col items-center gap-4 py-12">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
                <span className="text-muted-foreground">L&apos;IA écrit l&apos;article...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {generateError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive animate-fade-in-up">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {generateError}
        </div>
      )}

      {/* Completed article */}
      {streamedContent && !generating && (
        <Card className="animate-fade-in-up">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" />
              Aperçu & Édition
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={copied}>
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copié" : "Copier"}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || saved}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : saved ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                {saving ? "Sauvegarde..." : saved ? "Sauvegardé !" : "Sauvegarder"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={streamedContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setStreamedContent(e.target.value)
                setSaved(false)
              }}
              className="w-full h-[600px] rounded-lg border bg-background p-4 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
              spellCheck={false}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
