"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownPreviewProps {
  content: string
  isStreaming?: boolean
}

export function MarkdownPreview({ content, isStreaming }: MarkdownPreviewProps) {
  // Strip frontmatter (YAML between ---)
  const body = content.replace(/^---[\s\S]*?---\n*/, "")

  if (!body.trim()) {
    return null
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-img:rounded-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {body + (isStreaming ? "\n\n---" : "")}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
      )}
    </div>
  )
}
