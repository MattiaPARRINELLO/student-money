"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Check, X, ExternalLink, RefreshCw, Sun, Webhook, Bot } from "lucide-react"

export default function AdminDiscordPage() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null)
  const [dailyResult, setDailyResult] = useState<string | null>(null)
  const [status, setStatus] = useState<Record<string, boolean> | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  useEffect(() => {
    fetch("/api/discord/status")
      .then(r => r.json())
      .then(data => setStatus(data))
      .catch(() => setStatus({}))
      .finally(() => setLoadingStatus(false))
  }, [])

  async function testWebhook() {
    if (!webhookUrl) return
    setTestResult(null)
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "✅ **Test réussi !** Student-Money est bien connecté à Discord.",
        }),
      })
      setTestResult(res.ok ? "ok" : "error")
    } catch {
      setTestResult("error")
    }
  }

  async function triggerDaily() {
    setDailyResult("⏳ Envoi en cours...")
    try {
      const res = await fetch("/api/discord/daily")
      const data = await res.json()
      setDailyResult(`✅ ${data.topics ?? "?"} sujets envoyés dans le salon Discord.`)
    } catch {
      setDailyResult("❌ Erreur lors de l'envoi.")
    }
  }

  const isConfigured = status?.bot_token && status?.app_id && status?.public_key && status?.channel_id
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://studentmoney.fr"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="h-8 w-8" />
          Configuration Discord
        </h1>
        <p className="mt-2 text-muted-foreground">
          Reçois chaque matin des suggestions d&apos;articles dans Discord et publie-les en un clic.
        </p>
      </div>

      {!isConfigured && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Guide d&apos;installation (5 minutes)
            </CardTitle>
            <CardDescription>
              Ajoute les variables dans ton fichier <code className="rounded bg-muted px-1 py-0.5 text-xs">{".env.local"}</code> ou dans le dashboard de ton hébergeur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              {[
                ["Crée une application sur le Discord Developer Portal", "Va sur developer portal → New Application → nomme-la \"Student Money\""],
                ["Récupère le Token du bot", "Onglet Bot → Add Bot → Reset Token → copie-le dans DISCORD_BOT_TOKEN"],
                ["Récupère Application ID et Public Key", "Onglet General Information → copie dans DISCORD_APP_ID et DISCORD_PUBLIC_KEY"],
                ["Ajoute le bot à ton serveur", "Onglet OAuth2 → URL Generator → scope: bot → permissions: Send Messages, Read Messages, Use Slash Commands → ouvre le lien"],
                ["Configure l'Interactions Endpoint URL", "General Information → Interactions Endpoint URL → mets l'URL ci-dessous"],
                ["Copie l'ID du salon", "Clic droit sur le salon Discord → Copier l'ID → mets-le dans DISCORD_CHANNEL_ID"],
              ].map(([title, desc], i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border bg-muted/50 p-3">
              <p className="mb-1 text-xs font-medium">Interactions Endpoint URL :</p>
              <code className="block break-all rounded bg-muted px-2 py-1 text-xs">{siteUrl}/api/discord/interactions</code>
            </div>

            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="mb-1 text-xs font-medium">Variables à ajouter dans .env.local :</p>
              <pre className="overflow-x-auto rounded bg-muted px-2 py-1 text-xs">DISCORD_BOT_TOKEN=ton_token_ici
DISCORD_APP_ID=ton_app_id
DISCORD_PUBLIC_KEY=ta_public_key
DISCORD_CHANNEL_ID=id_du_salon
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... (optionnel)</pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sun className="h-5 w-5" />
            Message matinal
          </CardTitle>
          <CardDescription>
            Envoie les suggestions d&apos;articles dans le salon Discord configuré.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={triggerDaily} disabled={!isConfigured}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Envoyer les sujets maintenant
            </Button>
            {!isConfigured && (
              <p className="text-sm text-muted-foreground">
                Configure d&apos;abord les variables d&apos;environnement.
              </p>
            )}
          </div>

          {dailyResult && (
            <p className="text-sm">{dailyResult}</p>
          )}

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="mb-2 text-sm font-medium">⏰ Automatisation quotidienne</p>
            <p className="mb-2 text-sm text-muted-foreground">
              Ajoute cette URL à un service de cron gratuit (cron-job.org, cronhooks.io, ou le cron de ton hébergeur) :
            </p>
            <code className="block rounded bg-muted p-2 text-xs break-all">{siteUrl}/api/discord/daily</code>
            <p className="mt-2 text-xs text-muted-foreground">
              Configure-le pour qu&apos;il s&apos;exécute tous les jours à 8h du matin.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Webhook className="h-5 w-5" />
            Webhook de notification
          </CardTitle>
          <CardDescription>
            Optionnel : reçois une notification quand un article est publié.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="webhook" className="text-sm font-medium">Webhook URL</label>
            <div className="flex gap-2">
              <Input
                id="webhook"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={testWebhook} disabled={!webhookUrl}>
                Tester
              </Button>
            </div>
          </div>

          {testResult === "ok" && (
            <p className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" /> Message de test envoyé !
            </p>
          )}
          {testResult === "error" && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <X className="h-4 w-4" /> Erreur : vérifie l&apos;URL.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            Statut de la connexion
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStatus ? (
            <p className="text-sm text-muted-foreground">Vérification...</p>
          ) : (
            <div className="space-y-2">
              {[
                ["Token du bot", "bot_token"],
                ["Application ID", "app_id"],
                ["Public Key", "public_key"],
                ["Salon Discord", "channel_id"],
                ["Endpoint interactions", "interactions_ok"],
              ].map(([label, key]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{label}</span>
                  {status?.[key] ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">OK</Badge>
                  ) : (
                    <Badge variant="outline">Non configuré</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
