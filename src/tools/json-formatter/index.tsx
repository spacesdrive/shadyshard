import { useState } from "react"
import { Copy, Check, AlignLeft, Minimize2, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function JsonFormatter() {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function format(indent: number | null) {
    if (!input.trim()) {
      setError(null)
      return
    }
    try {
      const parsed = JSON.parse(input)
      setInput(
        indent === null ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent),
      )
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(input)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <Textarea
        id="json-formatter-input"
        name="json"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setError(null)
        }}
        placeholder='{"example": "Paste your JSON here..."}'
        className="min-h-64 resize-y font-mono text-sm"
        aria-label="JSON input"
        spellCheck={false}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="default" size="sm" onClick={() => format(2)} disabled={!input}>
          <AlignLeft className="size-4" />
          Format
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => format(null)}
          disabled={!input}
        >
          <Minimize2 className="size-4" />
          Minify
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopy} disabled={!input}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
