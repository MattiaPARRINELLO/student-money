import { searchWebMulti } from "@/lib/search"

const ZEN_API = "https://opencode.ai/zen/go/v1/chat/completions"
const MODEL = "deepseek-v4-flash"

const SYSTEM_PROMPT = `Tu es un journaliste expert en finances étudiantes francophones.
Tu écris pour Student-Money, le blog de référence des étudiants français qui veulent économiser.

STYLE :
- Ton de pote qui s'y connaît, pas d'encyclopédie
- N'HÉSITE PAS à donner ton avis, à classer, à recommander
- Phrases naturelles, pas de formules robotiques
- Varie la structure : parfois 4 sections, parfois 6, pas de plan systématique
- Pas de témoignages fictifs, JAMAIS
- Public : étudiants 18-25 ans
- Pas d'appel aux commentaires ni de phrases d'interaction artificielles en fin d'article
- PRENDS POSITION : gauche sociale, défense des étudiants, critique des inégalités et du système, mais reste concret et pas militant

FORMAT DE SORTIE OBLIGATOIRE — MDX avec frontmatter YAML :
---
title: "TITRE_ACCROCHEUR_OPTIMISE_SEO"
slug: "slug-court-en-kebab-case"
date: "DATE_DU_JOUR_YYYY-MM-DD"
category: "CATEGORIE_PARMI_bourses|logement|bouffe|transport|jobs|banque|nouvelle_categorie_si_indispensable"
excerpt: "RÉSUMÉ_MAX_155_CARACTÈRES"
coverImage: "DESCRIPTION_IMAGE_DETAILLEE_EN_FRANCAIS"
faq:
  - question: "QUESTION_1"
    answer: "RÉPONSE_1"
  - question: "QUESTION_2"
    answer: "RÉPONSE_2"
  - question: "QUESTION_3"
    answer: "RÉPONSE_3"
  - question: "QUESTION_4"
    answer: "RÉPONSE_4"
  - question: "QUESTION_5"
    answer: "RÉPONSE_5"
liens:
  - titre: "NOM_DU_SITE"
    url: "https://..."
    description: "Courte description du site"
  - titre: "NOM_DU_SITE_2"
    url: "https://..."
    description: "Courte description du site 2"
tags:
  - "mot-cle-1"
  - "mot-cle-2"
  - "mot-cle-3"
---

Structure INDICATIVE (adaptable) :
## INTRODUCTION
(chiffre choc ou question, 120-180 mots)

## H2_TITRE_NATUREL_1
(contenu + liste à puces)

## H2_TITRE_NATUREL_2
(contenu + conseils)

... (pas forcément 5 sections, adapte au sujet)

## CONCLUSION
(avis personnel + call-to-action newsletter)

RÈGLES STRICTES :
- 1200-2000 mots au total
- Chaque section apporte une VRAIE valeur, pas de remplissage
- Utilise des chiffres, des prix, des données vérifiables
- CITATIONS OBLIGATOIRES : cite tes sources dans le texte avec des liens markdown
- LIENS UTILES : UNIQUEMENT dans le champ 'liens' du frontmatter, jamais dans le corps
- Catégories existantes : bourses, logement, bouffe, transport, jobs, banque. Utilise d'ABORD ces catégories. Crée une nouvelle catégorie UNIQUEMENT si vraiment aucun sujet existant ne correspond. Si tu crées une nouvelle catégorie, choisis un mot court en français sans espaces (ex: sante, mode, tech, etc.).
- La date doit être AUJOURD'HUI
- Réponds UNIQUEMENT avec le contenu MDX, pas de texte avant/après`

function buildUserPrompt(topic: string, searchResults: string, sourceUrls: string): string {
  const date = new Date().toISOString().split("T")[0]
  let prompt = `SUJET : ${topic}\nDATE : ${date}\n\n`
  if (searchResults) {
    prompt += `RÉSULTATS DE RECHERCHE WEB RÉCENTS :\n${searchResults}\n\n`
  }
  if (sourceUrls) {
    prompt += `SOURCES À CITER (utilise ces liens dans le corps du texte et dans la section LIENS UTILES) :\n${sourceUrls}\n\n`
  }
  prompt += `Écris l'article complet en MDX. Réponds UNIQUEMENT avec le contenu MDX.`
  return prompt
}

export async function POST(request: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { topic } = await request.json()
        if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Le sujet doit contenir au moins 3 caractères." })}\n\n`))
          controller.close()
          return
        }

        const cleanTopic = topic.trim()
        const apiKey = process.env.OPENSCODE_API_KEY

        if (!apiKey) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Clé API OpenCode non configurée." })}\n\n`))
          controller.close()
          return
        }

        // Step 1: Web search (multi-queries)
        controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({ phase: "search", message: "Recherche d'informations sur le web..." })}\n\n`))

        const searchStart = Date.now()
        const searchQueries = [
          cleanTopic,
          `${cleanTopic} étudiants France 2026`,
          `${cleanTopic} aides astuces conseils`,
        ]
        const { results: searchResults, urls: sourceUrls } = await searchWebMulti(searchQueries)

        const searchDuration = Date.now() - searchStart
        const sourceCount = searchResults.split("[")
          .filter(s => s.match(/^\d+\]/))
          .length + searchResults.split("---").length

        controller.enqueue(encoder.encode(`event: search\ndata: ${JSON.stringify({
          found: sourceCount,
          duration: searchDuration,
        })}\n\n`))

        // Step 2: Generate article via streaming
        controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({ phase: "generate", message: "L'IA rédige l'article..." })}\n\n`))

        const response = await fetch(ZEN_API, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: buildUserPrompt(cleanTopic, searchResults, sourceUrls) },
            ],
            temperature: 0.7,
            max_tokens: 32000,
            stream: true,
            stream_options: { include_usage: true },
          }),
          signal: AbortSignal.timeout(360_000),
        })

        if (!response.ok) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: `Erreur API (${response.status})` })}\n\n`))
          controller.close()
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Pas de réponse de l'API." })}\n\n`))
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ""
        let fullContent = ""

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
                fullContent += delta
                controller.enqueue(encoder.encode(`event: content\ndata: ${JSON.stringify({ text: delta })}\n\n`))
              }
            } catch {
              // skip malformed JSON lines
            }
          }
        }

        if (fullContent.length < 10) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "L'IA n'a pas généré assez de contenu. Réessaie." })}\n\n`))
        } else {
          controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ content: fullContent, length: fullContent.length })}\n\n`))
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
