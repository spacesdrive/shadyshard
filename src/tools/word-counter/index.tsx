import { useMemo, useState } from "react"
import { Copy, Trash2, Check } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

function countStats(text: string) {
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, "").length
  const sentences = trimmed
    ? (trimmed.match(/[^.!?]+[.!?]+|\S+$/g) ?? []).filter((s) => s.trim()).length
    : 0
  const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim()).length : 0
  const readingTimeMinutes = words > 0 ? Math.max(1, Math.round(words / 200)) : 0

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
  }
}

const STATS: { key: keyof ReturnType<typeof countStats>; label: string }[] = [
  { key: "words", label: "Words" },
  { key: "characters", label: "Characters" },
  { key: "charactersNoSpaces", label: "Characters (no spaces)" },
  { key: "sentences", label: "Sentences" },
  { key: "paragraphs", label: "Paragraphs" },
  { key: "readingTimeMinutes", label: "Reading time (min)" },
]

export default function WordCounter() {
  const [text, setText] = useState("")
  const [copied, setCopied] = useState(false)
  const stats = useMemo(() => countStats(text), [text])

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <Textarea
        id="word-counter-input"
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here..."
        className="min-h-56 resize-y font-mono text-sm"
        aria-label="Text to analyze"
      />

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy} disabled={!text}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy text"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setText("")} disabled={!text}>
          <Trash2 className="size-4" />
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {STATS.map(({ key, label }) => (
          <div key={key} className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">{stats[key]}</p>
            <p className="text-muted-foreground mt-1 text-xs">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
