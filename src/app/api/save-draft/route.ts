import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const { slug, content } = await request.json()

    if (!slug || !content) {
      return Response.json({ error: "Slug et contenu requis." }, { status: 400 })
    }

    if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
      return Response.json({ error: "Slug invalide (lettres minuscules, chiffres et tirets uniquement)." }, { status: 400 })
    }

    if (typeof content !== "string" || content.length < 100) {
      return Response.json({ error: "Contenu trop court." }, { status: 400 })
    }

    const cwd = process.env.PROJECT_DIR || process.cwd()
    const draftsDir = path.join(cwd, "content", "drafts")
    const filePath = path.join(draftsDir, `${slug}.mdx`)

    if (!existsSync(draftsDir)) {
      await mkdir(draftsDir, { recursive: true })
    }

    await writeFile(filePath, content, "utf-8")

    return Response.json({ slug, saved: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return Response.json({ error: message }, { status: 500 })
  }
}
