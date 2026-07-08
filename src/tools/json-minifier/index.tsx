import { useState } from "react"
import { Copy, Check, Minimize2, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface MinifyResult {
  output: string
  originalBytes: number
  minifiedBytes: number
}

export default function JsonMinifier() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<MinifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleMinify() {
    if (!input.trim()) {
      setResult(null)
      setError(null)
      return
    }
    try {
      const parsed = JSON.parse(input)
      const output = JSON.stringify(parsed)
      setResult({
        output,
        originalBytes: new TextEncoder().encode(input).length,
        minifiedBytes: new TextEncoder().encode(output).length,
      })
      setError(null)
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : "Invalid JSON")
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const savedBytes = result ? result.originalBytes - result.minifiedBytes : 0
  const savedPercent =
    result && result.originalBytes > 0
      ? Math.round((savedBytes / result.originalBytes) * 100)
      : 0

  return (
    <div className="space-y-4">
      <Textarea
        id="json-minifier-input"
        name="json"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setResult(null)
          setError(null)
        }}
        placeholder='{"example": "Paste your JSON here..."}'
        className="min-h-56 resize-y font-mono text-sm"
        aria-label="JSON to minify"
        spellCheck={false}
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleMinify} disabled={!input}>
          <Minimize2 className="size-4" />
          Minify
        </Button>
        <Button variant="outline" onClick={handleCopy} disabled={!result}>
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

      {result && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">{result.originalBytes}</p>
              <p className="text-muted-foreground mt-1 text-xs">Original bytes</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">{result.minifiedBytes}</p>
              <p className="text-muted-foreground mt-1 text-xs">Minified bytes</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold text-emerald-500 tabular-nums">
                {savedPercent}%
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Saved</p>
            </div>
          </div>
          <Textarea
            id="json-minifier-output"
            name="minified"
            value={result.output}
            readOnly
            className="min-h-24 resize-y font-mono text-sm"
            aria-label="Minified JSON output"
          />
        </>
      )}
    </div>
  )
}
