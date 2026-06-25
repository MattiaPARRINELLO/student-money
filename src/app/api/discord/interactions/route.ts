import { NextRequest, NextResponse } from "next/server"
import {
  verifyDiscordRequest,
  createInteractionResponse,
  editInteractionResponse,
} from "@/lib/discord"
import { searchWebMulti } from "@/lib/search"

const ZEN_API = "https://opencode.ai/zen/go/v1/chat/completions"
const MODEL = "deepseek-v4-flash"

const SYSTEM_PROMPT = `Tu es un journaliste expert en finances étudiantes francophones.
Tu écris pour Student-Money, le blog de référence des étudiants français qui veulent économiser.

STYLE :
- Ton de pote qui s'y connaît
- N'HÉSITE PAS à donner ton avis, à classer, à recommander
- Phrases naturelles, pas de formules robotiques
- Varie la structure : parfois 4 sections, parfois 6
- Pas de témoignages fictifs, JAMAIS
- Public : étudiants 18-25 ans
- Pas d'appel aux commentaires
- PRENDS POSITION : gauche sociale, défense des étudiants

FORMAT DE SORTIE OBLIGATOIRE — MDX avec frontmatter YAML :
---
title: "TITRE_ACCROCHEUR_OPTIMISE_SEO"
slug: "slug-court-en-kebab-case"
date: "DATE_DU_JOUR_YYYY-MM-DD"
category: "CATEGORIE_PARMI_bourses|logement|bouffe|transport|jobs|banque"
excerpt: "RÉSUMÉ_MAX_155_CARACTÈRES"
coverImage: "DESCRIPTION_IMAGE"
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
  - titre: "NOM"
    url: "https://..."
    description: "..."
tags:
  - "mot-cle-1"
  - "mot-cle-2"
---

## INTRODUCTION
(chiffre choc ou question, 120-180 mots)

## H2_TITRE_NATUREL_1
(contenu + liste à puces)

## H2_TITRE_NATUREL_2
(contenu + conseils)

## CONCLUSION
(avis personnel + call-to-action newsletter)

RÈGLES STRICTES :
- 1200-2000 mots au total
- Utilise des chiffres, des prix, des données vérifiables
- CITATIONS OBLIGATOIRES : cite tes sources dans le texte avec des liens markdown
- Catégories existantes UNIQUEMENT : bourses, logement, bouffe, transport, jobs, banque
- La date doit être AUJOURD'HUI
- Réponds UNIQUEMENT avec le contenu MDX, pas de texte avant/après`

async function generateArticle(topic: string): Promise<{ raw: string; slug: string; title: string } | null> {
  try {
    const apiKey = process.env.OPENSCODE_API_KEY
    if (!apiKey) return null

    const searchQueries = [
      topic,
      `${topic} étudiants France 2026`,
      `${topic} aides astuces conseils`,
    ]
    const searchResults = await searchWebMulti(searchQueries)
    const date = new Date().toISOString().split("T")[0]
    let userPrompt = `SUJET : ${topic}\nDATE : ${date}\n\n`
    if (searchResults) {
      userPrompt += `RÉSULTATS DE RECHERCHE WEB :\n${searchResults}\n\n`
    }
    userPrompt += `Écris l'article complet en MDX.`

    const res = await fetch(ZEN_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 16000,
      }),
      signal: AbortSignal.timeout(120000),
    })

    if (!res.ok) {
      console.error("[generateArticle] API error:", res.status, await res.text().catch(() => ""))
      return null
    }

    const json = await res.json()
    const raw = json.choices?.[0]?.message?.content
    if (!raw) {
      console.error("[generateArticle] No content in response:", JSON.stringify(json).slice(0, 200))
      return null
    }

    const slugMatch = raw.match(/slug:\s*"([^"]+)"/)
    const titleMatch = raw.match(/title:\s*"([^"]+)"/)
    const slug = slugMatch?.[1] || topic.toLowerCase().replace(/\s+/g, "-").slice(0, 50)
    const title = titleMatch?.[1] || topic

    return { raw, slug, title }
  } catch (err) {
    console.error("[generateArticle] Error:", err)
    return null
  }
}

async function saveArticle(raw: string, slug: string): Promise<boolean> {
  try {
    const fs = await import("fs")
    const path = await import("path")
    const dir = path.join(process.cwd(), "content", "drafts")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, `${slug}.mdx`), raw, "utf-8")
    return true
  } catch {
    return false
  }
}

async function publishArticle(slug: string): Promise<boolean> {
  try {
    const fs = await import("fs")
    const path = await import("path")
    const source = path.join(process.cwd(), "content", "drafts", `${slug}.mdx`)
    const dest = path.join(process.cwd(), "content", "published", `${slug}.mdx`)
    const dir = path.dirname(dest)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    if (!fs.existsSync(source)) return false
    fs.renameSync(source, dest)
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY
  if (!publicKey) {
    return NextResponse.json({ error: "Discord non configuré" }, { status: 500 })
  }

  const signature = request.headers.get("x-signature-ed25519") || ""
  const timestamp = request.headers.get("x-signature-timestamp") || ""
  const rawBody = await request.text()

  if (!verifyDiscordRequest(publicKey, signature, timestamp, rawBody)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 })
  }

  const body = JSON.parse(rawBody)

  if (body.type === 1) {
    return NextResponse.json({ type: 1 })
  }

  if (body.type === 3) {
    const customId: string = body.data?.custom_id || ""
    const token: string = body.token
      if (customId.startsWith("t")) {
        try {
          await createInteractionResponse(body.id, token, 5)
        } catch {
          return NextResponse.json({})
        }

        const topicIndex = Number(customId.slice(1))
        const msgContent: string = body.message?.content || ""
        const topicLines = msgContent.split("\n").filter(l => /^\d+\./.test(l))
        const topicMatch = topicLines[topicIndex]?.match(/^\d+\.\s*[^\s]+\s*\*{2}([^*]+)\*{2}/)
        const topic = topicMatch?.[1]?.trim() || "Article étudiant"

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studentmoney.fr"

        try {
          await editInteractionResponse(token, "⏳ **Recherche web et génération en cours...**", [
            { type: 1, components: [{ type: 2, style: 2, label: "Génération...", custom_id: "loading", disabled: true }] },
          ])
        } catch {
          return NextResponse.json({})
        }

        const result = await generateArticle(topic)
        if (!result) {
          await editInteractionResponse(token, "❌ **Erreur lors de la génération de l'article.**")
          return NextResponse.json({})
        }

        const saved = await saveArticle(result.raw, result.slug)
        if (!saved) {
          await editInteractionResponse(token, "❌ **Erreur lors de la sauvegarde du brouillon.**")
          return NextResponse.json({})
        }

        const published = await publishArticle(result.slug)
        if (!published) {
          await editInteractionResponse(token, `📝 **Brouillon sauvegardé !**\n📄 ${result.title}\n🗂️ \`/admin/drafts/${result.slug}\``)
          return NextResponse.json({})
        }

        await editInteractionResponse(token, `✅ **Article publié !**\n📄 **${result.title}**\n🔗 ${siteUrl}/articles/${result.slug}`)
        return NextResponse.json({})
    }

    if (customId.startsWith("cancel_")) {
      try {
        await createInteractionResponse(body.id, token, 6)
      } catch {
        return NextResponse.json({})
      }
      await editInteractionResponse(token, "❌ Génération annulée.")
      return NextResponse.json({})
    }
  }

  return NextResponse.json({})
}
