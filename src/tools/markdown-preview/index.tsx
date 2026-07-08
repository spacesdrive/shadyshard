import { useMemo, useState } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"

const EXAMPLE = `# Heading

Some **bold** and *italic* text, plus a [link](https://example.com).

- List item one
- List item two

> A blockquote

\`\`\`js
console.log("code block")
\`\`\`
`

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(EXAMPLE)

  const html = useMemo(() => {
    const rawHtml = marked.parse(markdown, { async: false }) as string
    return DOMPurify.sanitize(rawHtml)
  }, [markdown])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium">Markdown</span>
            <CopyButton value={markdown} label="Copy markdown" size="sm" />
          </div>
          <Textarea
            id="markdown-preview-input"
            name="markdown"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-96 resize-y font-mono text-sm"
            aria-label="Markdown source"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium">Preview</span>
            <CopyButton value={html} label="Copy HTML" size="sm" />
          </div>
          <div
            className="border-input prose-sm [&_a]:text-primary [&_blockquote]:border-border [&_blockquote]:text-muted-foreground [&_code]:bg-muted [&_pre]:bg-muted min-h-96 overflow-y-auto rounded-lg border bg-transparent p-3 text-sm [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:px-1 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-3 [&_ul]:list-disc"
            // Sanitized via DOMPurify immediately above - safe to render.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}
