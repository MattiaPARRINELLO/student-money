import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  const filePath = path.join(process.cwd(), "content", "drafts", `${slug}.mdx`)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Brouillon non trouvé" }, { status: 404 })
  }

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return NextResponse.json({ frontmatter: data, content, raw })
}

export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  const filePath = path.join(process.cwd(), "content", "drafts", `${slug}.mdx`)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  return NextResponse.json({ success: true })
}
