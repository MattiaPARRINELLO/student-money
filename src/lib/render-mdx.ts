import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import type { ArticleFrontmatter } from "./content"
import AdBanner from "@/components/ad-banner"

const components = {
  AdBanner,
}

export async function renderMDX(raw: string) {
  const { content, frontmatter } = await compileMDX<ArticleFrontmatter>({
    source: raw,
    components,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  })

  return { content, frontmatter }
}
