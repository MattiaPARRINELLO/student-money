import { searchWeb } from "@/lib/search"

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
  try {
    const { topic } = await request.json()
    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      return Response.json(
        { error: "Le sujet doit contenir au moins 3 caractères." },
        { status: 400 }
      )
    }

    const cleanTopic = topic.trim()

    const { results: searchResults, urls: sourceUrls } = await searchWeb(cleanTopic)

    const apiKey = process.env.OPENSCODE_API_KEY

    if (!apiKey) {
      return Response.json(
        { error: "Clé API OpenCode non configurée (OPENSCODE_API_KEY)." },
        { status: 500 }
      )
    }

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
        max_tokens: 16000,
      }),
      signal: AbortSignal.timeout(120_000),
    })

    if (!response.ok) {
      const err = await response.text()
      return Response.json(
        { error: `Erreur API (${response.status}) : ${err.slice(0, 200)}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""

    if (!content || content.length < 100) {
      return Response.json(
        { error: "L'IA n'a pas généré assez de contenu. Réessaie avec un sujet plus précis." },
        { status: 500 }
      )
    }

    return Response.json({
      content,
      searched: searchResults.length > 0,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return Response.json(
      { error: `Erreur lors de la génération : ${message}` },
      { status: 500 }
    )
  }
}
