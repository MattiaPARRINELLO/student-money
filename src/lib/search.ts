function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim()
}

async function searchGoogle(query: string): Promise<{ results: string; urls: string; count: number }> {
  try {
    const q = encodeURIComponent(query + " France")
    const url = `https://news.google.com/rss/search?q=${q}&hl=fr&gl=FR&hl=fr`
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { results: "", urls: "", count: 0 }

    const xml = await res.text()
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || []
    const formatted: string[] = []
    const links: { href: string; title: string }[] = []

    for (const item of items.slice(0, 5)) {
      const title = stripHtml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "")
      const link = (item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "").trim()
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || ""
      const descRaw = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ""
      const desc = stripHtml(stripHtml(descRaw))
      const source = stripHtml(item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "")

      if (title && link) {
        const date = pubDate ? new Date(pubDate).toLocaleDateString("fr-FR") : ""
        formatted.push(`Titre: ${title}\nSource: ${source || "Google News"}\nDate: ${date}\n${desc.slice(0, 300)}\nLien: ${link}`)
        links.push({ href: link, title })
      }
    }

    return {
      results: formatted.length > 0 ? formatted.map((r, i) => `[${i + 1}] ${r}`).join("\n\n") : "",
      urls: links.length > 0 ? links.map(l => `- [${l.title}](${l.href})`).join("\n") : "",
      count: formatted.length,
    }
  } catch {
    return { results: "", urls: "", count: 0 }
  }
}

async function searchDuckDuckGo(query: string): Promise<{ results: string; urls: string; count: number }> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " France")}`
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { results: "", urls: "", count: 0 }

    const html = await res.text()
    if (html.includes("challenge") || html.includes("anomaly")) {
      return { results: "", urls: "", count: 0 }
    }

    const formatted: string[] = []
    const links: { href: string; title: string }[] = []
    const linkRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
    const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi

    const rawLinks = [...html.matchAll(linkRegex)]
    const rawSnippets = [...html.matchAll(snippetRegex)]

    for (let i = 0; i < Math.min(rawLinks.length, rawSnippets.length, 5); i++) {
      let href = rawLinks[i][1].trim()
      if (href.startsWith("//")) href = "https:" + href
      else if (href.startsWith("/")) href = "https://duckduckgo.com" + href
      const title = stripHtml(rawLinks[i][2])
      const snippet = stripHtml(rawSnippets[i][1])
      if (title && href) {
        formatted.push(`${title}\n${snippet}\nLien: ${href}`)
        links.push({ href, title })
      }
    }

    return {
      results: formatted.length > 0 ? formatted.map((r, i) => `[${i + 1}] ${r}`).join("\n\n") : "",
      urls: links.length > 0 ? links.map(l => `- [${l.title}](${l.href})`).join("\n") : "",
      count: formatted.length,
    }
  } catch {
    return { results: "", urls: "", count: 0 }
  }
}

export async function searchWeb(query: string): Promise<{ results: string; urls: string }> {
  const google = await searchGoogle(query)
  if (google.results) return { results: google.results, urls: google.urls }

  const duck = await searchDuckDuckGo(query)
  if (duck.results) return { results: duck.results, urls: duck.urls }

  return { results: "", urls: "" }
}

export async function searchWebMulti(queries: string[]): Promise<{ results: string; urls: string }> {
  const all: string[] = []
  const allUrls: string[] = []

  for (const q of queries) {
    const r = await searchWeb(q)
    if (r.results) {
      all.push(r.results)
      allUrls.push(r.urls)
    }
  }

  return {
    results: all.join("\n\n---\n\n"),
    urls: allUrls.join("\n"),
  }
}
