import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  const draftsDir = path.join(process.cwd(), "content", "drafts")
  const publishedDir = path.join(process.cwd(), "content", "published")
  const source = path.join(draftsDir, `${slug}.mdx`)
  const dest = path.join(publishedDir, `${slug}.mdx`)

  if (!fs.existsSync(source)) {
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
  }

  if (fs.existsSync(dest)) {
    return NextResponse.json({ error: "Un article avec ce slug existe déjà" }, { status: 409 })
  }

  fs.copyFileSync(source, dest)
  fs.unlinkSync(source)

  return NextResponse.json({ success: true, slug })
}
