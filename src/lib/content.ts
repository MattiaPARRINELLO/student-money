import fs from "fs"
import path from "path"
import matter from "gray-matter"

const CONTENT_DIR = path.join(process.cwd(), "content")

export interface ArticleFrontmatter {
  title: string
  slug: string
  date: string
  category: string
  excerpt: string
  coverImage?: string
  faq?: { question: string; answer: string }[]
  liens?: { titre: string; url: string; description: string }[]
  tags?: string[]
}

export interface Article {
  frontmatter: ArticleFrontmatter
  content: string
  raw: string
}

export function getArticles(type: "drafts" | "published"): Article[] {
  const dir = path.join(CONTENT_DIR, type)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".mdx"))

  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8")
      const { data, content } = matter(raw)
      return {
        frontmatter: data as ArticleFrontmatter,
        content,
        raw,
      }
    })
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

export function getArticle(slug: string, type: "drafts" | "published"): Article | null {
  const filePath = path.join(CONTENT_DIR, type, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)
  return {
    frontmatter: data as ArticleFrontmatter,
    content,
    raw,
  }
}

export function getAllSlugs(type: "drafts" | "published"): string[] {
  const dir = path.join(CONTENT_DIR, type)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith(".mdx")).map(f => f.replace(/\.mdx$/, ""))
}

export function getCategories(): string[] {
  const articles = getArticles("published")
  const cats = new Set(articles.map(a => a.frontmatter.category))
  return Array.from(cats).sort()
}

export const CATEGORY_LABELS: Record<string, string> = {
  bourses: "Bourses & Aides",
  logement: "Logement",
  bouffe: "Alimentation",
  transport: "Transport",
  jobs: "Jobs étudiants",
  banque: "Banque & Épargne",
}

export function formatCategory(cat?: string | null): string {
  if (!cat) return "Non classé"
  return CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)
}
