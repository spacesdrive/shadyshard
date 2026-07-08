import { useState } from "react"
import { ClipboardPaste } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

function detectFormat(text: string): string {
  if (!text.trim()) return "Empty"
  if (/^https?:\/\/\S+$/i.test(text.trim())) return "URL"
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) return "Email address"
  try {
    JSON.parse(text)
    return "JSON"
  } catch {
    // not JSON
  }
  return "Plain text"
}

export default function ClipboardInspector() {
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleRead() {
    setError(null)
    try {
      const text = await navigator.clipboard.readText()
      setContent(text)
    } catch {
      setError(
        "Couldn't read the clipboard automatically - paste into the box below instead.",
      )
    }
  }

  const byteSize = new TextEncoder().encode(content).length

  return (
    <div className="space-y-4">
      <Button size="sm" onClick={handleRead}>
        <ClipboardPaste className="size-4" />
        Read clipboard
      </Button>

      {error && <p className="text-muted-foreground text-sm">{error}</p>}

      <Textarea
        id="clipboard-inspector-input"
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Click Read clipboard, or paste here directly..."
        className="min-h-40 resize-y font-mono text-sm"
        aria-label="Clipboard content"
      />

      {content && (
        <div className="grid grid-cols-3 gap-3">
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold tabular-nums">{content.length}</p>
            <p className="text-muted-foreground mt-1 text-xs">Characters</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold tabular-nums">{byteSize}</p>
            <p className="text-muted-foreground mt-1 text-xs">Bytes</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold">{detectFormat(content)}</p>
            <p className="text-muted-foreground mt-1 text-xs">Detected format</p>
          </div>
        </div>
      )}
    </div>
  )
}
