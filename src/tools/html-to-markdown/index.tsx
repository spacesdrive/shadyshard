import { useMemo, useState } from "react"
import TurndownService from "turndown"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const EXAMPLE = `<h1>Heading</h1>
<p>Some <strong>bold</strong> and <em>italic</em> text, plus a <a href="https://example.com">link</a>.</p>
<ul>
  <li>List item one</li>
  <li>List item two</li>
</ul>`

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
})

export default function HtmlToMarkdown() {
  const [html, setHtml] = useState(EXAMPLE)

  const markdown = useMemo(() => {
    try {
      return turndownService.turndown(html)
    } catch {
      return ""
    }
  }, [html])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="html-to-markdown-input">HTML</Label>
          <Textarea
            id="html-to-markdown-input"
            name="html"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="html-to-markdown-output">Markdown</Label>
          <Textarea
            id="html-to-markdown-output"
            name="markdown"
            value={markdown}
            readOnly
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={markdown} label="Copy Markdown" />
        <DownloadButton
          getBlob={() => new Blob([markdown], { type: "text/markdown" })}
          filename="converted.md"
          label="Download .md"
          disabled={!markdown}
        />
      </div>
    </div>
  )
}
