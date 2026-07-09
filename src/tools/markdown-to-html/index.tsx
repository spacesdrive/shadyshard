import { useMemo, useState } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const EXAMPLE = `# Heading

Some **bold** and *italic* text, plus a [link](https://example.com).

- List item one
- List item two
`

export default function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState(EXAMPLE)

  const html = useMemo(() => {
    const rawHtml = marked.parse(markdown, { async: false }) as string
    return DOMPurify.sanitize(rawHtml)
  }, [markdown])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="markdown-to-html-input">Markdown</Label>
          <Textarea
            id="markdown-to-html-input"
            name="markdown"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="markdown-to-html-output">HTML</Label>
          <Textarea
            id="markdown-to-html-output"
            name="html"
            value={html}
            readOnly
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={html} label="Copy HTML" />
        <DownloadButton
          getBlob={() => new Blob([html], { type: "text/html" })}
          filename="converted.html"
          label="Download .html"
          disabled={!html}
        />
      </div>
    </div>
  )
}
