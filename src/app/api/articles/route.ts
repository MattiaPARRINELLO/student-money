import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  const filePath = path.join(process.cwd(), "content", "published", `${slug}.mdx`)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
  }

  fs.unlinkSync(filePath)
  return NextResponse.json({ success: true })
}
