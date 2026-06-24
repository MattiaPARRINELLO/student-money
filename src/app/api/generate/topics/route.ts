import { searchWebMulti } from "@/lib/search"
import { getArticles } from "@/lib/content"

const ZEN_API = "https://opencode.ai/zen/go/v1/chat/completions"
const MODEL = "deepseek-v4-flash"

const TOPICS_PROMPT = `Tu es un rédacteur SEO expert en finances étudiantes francophones.
Le blog Student-Money couvre : bourses, logement, alimentation, transport, jobs étudiants, banque/épargne.

Tu reçois :
1. La liste des articles DÉJÀ PUBLIÉS sur le blog (à ne pas reproduire)
2. Des résultats de recherche web sur l'actualité étudiante

Propose 4 sujets d'articles ORIGINAUX qui n'ont PAS encore été traités.
Évite à tout prix les doublons avec les articles existants.

Catégories existantes : bourses, logement, bouffe, transport, jobs, banque. Donne la priorité à ces catégories existantes. Crée une nouvelle catégorie UNIQUEMENT si vraiment aucun sujet existant ne correspond (ex: sante, mode, tech, etc.).

Si les résultats de recherche web ne contiennent que des sujets déjà couverts,
réponds UNIQUEMENT par : {"sujets":[]}

Pour chaque sujet, donne UNIQUEMENT ce format JSON (ne mets AUCUNE virgule après le dernier élément d'un tableau ou objet) :
{"sujets":[{"titre":"Titre accrocheur optimisé SEO","description":"Résumé 1-2 phrases","categorie":"bourses|logement|bouffe|transport|jobs|banque"}]}

Réponds UNIQUEMENT avec le JSON, pas de texte avant/après.`

const SEARCH_BATCHES = [
  [
    "bourses étudiants aides 2026 France",
    "économie étudiants logement astuces 2026",
    "jobs étudiants été 2026",
  ],
  [
    "alternance apprentissage étudiant 2026",
    "impôts déclaration étudiant 2026",
    "mutuelle santé étudiante comparatif 2026",
    "bourse mobilité Erasmus stage 2026",
  ],
  [
    "réductions tarifs étudiants transport 2026",
    "micro-entreprise étudiant 2026",
    "aide logement CAF étudiante 2026",
    "épargne livret jeune étudiant 2026",
  ],
]

async function callTopicsLLM(apiKey: string, userPrompt: string, stream: boolean) {
  return fetch(ZEN_API, {
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
      stream,
      stream_options: stream ? { include_usage: true } : undefined,
    }),
    signal: AbortSignal.timeout(60000),
  })
}

function parseTopics(raw: string): object[] {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return []
  try {
    const cleaned = jsonMatch[0].replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")
    return JSON.parse(cleaned).sujets || []
  } catch {
    return []
  }
}

async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  encoder: TextEncoder,
  controller: ReadableStreamDefaultController,
): Promise<string> {
  const decoder = new TextDecoder()
  let buffer = ""
  let contentOutput = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      const json = line.slice(6).trim()
      if (json === "[DONE]") continue

      try {
        const parsed = JSON.parse(json)
        const delta = parsed.choices?.[0]?.delta?.content
        if (delta) {
          contentOutput += delta
          controller.enqueue(encoder.encode(`event: content\ndata: ${JSON.stringify({ text: delta })}\n\n`))
        }
      } catch {
        // skip
      }
    }
  }

  return contentOutput
}

export async function POST() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const apiKey = process.env.OPENSCODE_API_KEY

        if (!apiKey) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Clé API manquante." })}\n\n`))
          controller.close()
          return
        }

        const published = getArticles("published")
        const existingArticles = published.map(a =>
          `- "${a.frontmatter.title}" (${a.frontmatter.category})`
        ).join("\n")

        const date = new Date().toLocaleDateString("fr-FR", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })

        let sujets: object[] = []

        for (let attempt = 0; attempt < SEARCH_BATCHES.length; attempt++) {
          const isFirst = attempt === 0

          controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({
            phase: "search",
            message: isFirst ? "Recherche des tendances étudiantes..." : "Nouvelle recherche avec des angles différents...",
          })}\n\n`))

          const searchStart = Date.now()
          const { results: searchResults, urls: sourceUrls } = await searchWebMulti(SEARCH_BATCHES[attempt])
          const searchDuration = Date.now() - searchStart

          controller.enqueue(encoder.encode(`event: search\ndata: ${JSON.stringify({
            found: searchResults.length > 0,
            duration: searchDuration,
            length: searchResults.length,
          })}\n\n`))

          controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({
            phase: "generate",
            message: "L'IA analyse les résultats et propose des sujets...",
          })}\n\n`))

          let userPrompt = `DATE : ${date}\n\n`
          if (existingArticles) {
            userPrompt += `ARTICLES DÉJÀ PUBLIÉS (ne pas reproduire) :\n${existingArticles}\n\n`
          }
          userPrompt += `RÉSULTATS DE RECHERCHE WEB :\n${searchResults}\n\n`
          if (sourceUrls) {
            userPrompt += `SOURCES :\n${sourceUrls}\n\n`
          }
          userPrompt += `Propose 4 sujets originaux en JSON qui n'ont PAS été traités. Si aucun sujet frais, réponds {"sujets":[]}.`

          // Non-streaming check: does this batch yield fresh topics?
          const checkRes = await callTopicsLLM(apiKey, userPrompt, false)
          if (!checkRes.ok) continue

          const checkData = await checkRes.json()
          const checkRaw = checkData.choices?.[0]?.message?.content || ""
          const checkSujets = parseTopics(checkRaw)

          if (checkSujets.length === 0) continue

          sujets = checkSujets

          // Got fresh topics — stream them for the UI
          const streamRes = await callTopicsLLM(apiKey, userPrompt, true)
          if (!streamRes.ok || !streamRes.body) break

          const streamedContent = await processStream(
            streamRes.body.getReader(),
            encoder,
            controller,
          )
          const streamedSujets = parseTopics(streamedContent)
          if (streamedSujets.length > 0) {
            sujets = streamedSujets
          }
          break
        }

        if (sujets.length === 0) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Aucun sujet original trouvé après plusieurs recherches. Rafraîchis pour réessayer." })}\n\n`))
        } else {
          controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ sujets })}\n\n`))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur inconnue"
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
