import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

const UNESCAPE_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char])
}

function unescapeHtml(text: string): string {
  return text.replace(
    /&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g,
    (entity) => UNESCAPE_MAP[entity],
  )
}

export default function HtmlEscape() {
  const [escapeInput, setEscapeInput] = useState("")
  const [unescapeInput, setUnescapeInput] = useState("")

  return (
    <Tabs defaultValue="escape">
      <TabsList>
        <TabsTrigger value="escape">Escape</TabsTrigger>
        <TabsTrigger value="unescape">Unescape</TabsTrigger>
      </TabsList>

      <TabsContent value="escape" className="mt-4 space-y-4">
        <Textarea
          id="html-escape-input"
          name="text"
          value={escapeInput}
          onChange={(e) => setEscapeInput(e.target.value)}
          placeholder='<div class="example">Hello & welcome</div>'
          className="min-h-32 resize-y font-mono text-sm"
          aria-label="Text to escape"
        />
        <CopyButton value={escapeHtml(escapeInput)} label="Copy escaped" />
        <Textarea
          id="html-escape-output"
          name="escaped"
          value={escapeHtml(escapeInput)}
          readOnly
          className="min-h-32 resize-y font-mono text-sm"
          aria-label="Escaped HTML output"
        />
      </TabsContent>

      <TabsContent value="unescape" className="mt-4 space-y-4">
        <Textarea
          id="html-unescape-input"
          name="html"
          value={unescapeInput}
          onChange={(e) => setUnescapeInput(e.target.value)}
          placeholder="&lt;div&gt;Hello &amp; welcome&lt;/div&gt;"
          className="min-h-32 resize-y font-mono text-sm"
          aria-label="HTML entities to unescape"
        />
        <CopyButton value={unescapeHtml(unescapeInput)} label="Copy unescaped" />
        <Textarea
          id="html-unescape-output"
          name="unescaped"
          value={unescapeHtml(unescapeInput)}
          readOnly
          className="min-h-32 resize-y font-mono text-sm"
          aria-label="Unescaped text output"
        />
      </TabsContent>
    </Tabs>
  )
}
