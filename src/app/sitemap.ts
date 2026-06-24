import { MetadataRoute } from "next"
import { getAllSlugs } from "@/lib/content"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://studentmoney.fr"
  const slugs = getAllSlugs("published")

  const articles = slugs.map(slug => ({
    url: `${baseUrl}/articles/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...articles,
  ]
}
