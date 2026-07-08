import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PRESETS = [
  { label: "X post", limit: 280 },
  { label: "SMS segment", limit: 160 },
  { label: "Meta description", limit: 160 },
  { label: "Meta title", limit: 60 },
] as const

export default function CharacterCounter() {
  const [text, setText] = useState("")
  const [limit, setLimit] = useState<number>(280)

  const count = text.length
  const countNoSpaces = text.replace(/\s/g, "").length
  const remaining = limit - count
  const overLimit = remaining < 0

  return (
    <div className="space-y-4">
      <Textarea
        id="character-counter-input"
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here..."
        className="min-h-40 resize-y text-sm"
        aria-label="Text to count"
      />

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant={limit === preset.limit ? "default" : "outline"}
            size="sm"
            onClick={() => setLimit(preset.limit)}
          >
            {preset.label} ({preset.limit})
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="border-border/60 rounded-lg border p-3 text-center">
          <p className="text-2xl font-semibold tabular-nums">{count}</p>
          <p className="text-muted-foreground mt-1 text-xs">Characters</p>
        </div>
        <div className="border-border/60 rounded-lg border p-3 text-center">
          <p className="text-2xl font-semibold tabular-nums">{countNoSpaces}</p>
          <p className="text-muted-foreground mt-1 text-xs">No spaces</p>
        </div>
        <div
          className={cn(
            "rounded-lg border p-3 text-center",
            overLimit ? "border-destructive/40 bg-destructive/10" : "border-border/60",
          )}
        >
          <p
            className={cn(
              "text-2xl font-semibold tabular-nums",
              overLimit && "text-destructive",
            )}
          >
            {remaining}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {overLimit ? "Over limit" : "Remaining"}
          </p>
        </div>
      </div>
    </div>
  )
}
