import { NextResponse } from "next/server"
import { getArticles } from "@/lib/content"
import { searchWebMulti } from "@/lib/search"
import { sendChannelMessage, buildTopicButtons, categoryEmoji, TopicButton } from "@/lib/discord"

const ZEN_API = "https://opencode.ai/zen/go/v1/chat/completions"
const MODEL = "deepseek-v4-flash"

const TOPICS_PROMPT = `Tu es un rédacteur SEO expert en finances étudiantes francophones.

Tu reçois :
1. Les articles DÉJÀ PUBLIÉS sur le blog
2. Des résultats de recherche web sur l'actualité étudiante

Propose EXACTEMENT 4 sujets d'articles ORIGINAUX qui n'ont PAS encore été traités.
Évite à tout prix les doublons avec les articles existants.

Catégories existantes UNIQUEMENT : bourses, logement, bouffe, transport, jobs, banque.

Si les résultats de recherche web ne contiennent que des sujets déjà couverts,
réponds UNIQUEMENT par : {"sujets":[]}

Pour chaque sujet, donne UNIQUEMENT ce format JSON (pas de virgule après le dernier élément) :
{"sujets":[{"titre":"Titre accrocheur optimisé SEO","description":"Résumé 1-2 phrases","categorie":"bourses|logement|bouffe|transport|jobs|banque"}]}

Réponds UNIQUEMENT avec le JSON.`

async function fetchTopics(): Promise<TopicButton[]> {
  const apiKey = process.env.OPENSCODE_API_KEY
  if (!apiKey) return []

  const publishedArticles = getArticles("published")
  const existing = publishedArticles.map(a => `- "${a.frontmatter.title}" (${a.frontmatter.category})`).join("\n")

  const searchResults = await searchWebMulti([
    "bourses étudiants aides 2026 France",
    "jobs étudiants été 2026",
    "logement étudiant astuces 2026",
    "économie étudiants transport banque 2026",
  ])

  const date = new Date().toISOString().split("T")[0]
  let userPrompt = `DATE : ${date}\n\nARTICLES DÉJÀ PUBLIÉS :\n${existing || "Aucun"}\n\n`
  if (searchResults) {
    userPrompt += `RÉSULTATS DE RECHERCHE WEB :\n${searchResults}\n\n`
  }
  userPrompt += `Propose 4 sujets originaux non traités.`

  try {
    const res = await fetch(ZEN_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: TOPICS_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 8000,
      }),
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) return []
    const json = await res.json()
    const raw = json.choices?.[0]?.message?.content || ""
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return []
    const cleaned = jsonMatch[0].replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")
    return JSON.parse(cleaned).sujets || []
  } catch {
    return []
  }
}

export async function GET() {
  const channelId = process.env.DISCORD_CHANNEL_ID
  if (!channelId) {
    return NextResponse.json({ error: "DISCORD_CHANNEL_ID non configuré" }, { status: 500 })
  }

  const topics = await fetchTopics()

  if (topics.length === 0) {
    await sendChannelMessage(
      channelId,
      "🌅 **Bonjour !** Aucun nouveau sujet trouvé aujourd'hui. Tous les sujets d'actualité semblent déjà couverts.",
    )
    return NextResponse.json({ topics: 0 })
  }

  const topicLines = topics
    .map((t, i) => `${i + 1}. ${categoryEmoji(t.categorie)} **${t.titre}** — ${t.description}`)
    .join("\n")

  const message = `🌅 **Bonjour ! Voici les sujets du jour :**\n\n${topicLines}\n\n📌 *Clique sur un bouton ci-dessous pour générer et publier l'article automatiquement.*`

  const buttons = buildTopicButtons(topics)
  await sendChannelMessage(channelId, message, buttons)

  return NextResponse.json({ topics: topics.length })
}
