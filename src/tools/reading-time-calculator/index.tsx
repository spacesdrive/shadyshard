import { useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

export default function ReadingTimeCalculator() {
  const [text, setText] = useState("")
  const [wpm, setWpm] = useState(200)

  const wordCount = useMemo(() => {
    const trimmed = text.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }, [text])

  const totalSeconds = Math.round((wordCount / wpm) * 60)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return (
    <div className="space-y-6">
      <Textarea
        id="reading-time-input"
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste an article or draft here..."
        className="min-h-56 resize-y text-sm"
        aria-label="Text to estimate reading time for"
      />

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Reading speed</span>
          <span className="text-muted-foreground text-sm tabular-nums">{wpm} WPM</span>
        </div>
        <Slider
          aria-label="Reading speed in words per minute"
          className="mt-2"
          min={100}
          max={400}
          step={10}
          value={[wpm]}
          onValueChange={(value) => setWpm(Array.isArray(value) ? value[0] : value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border-border/60 rounded-lg border p-4 text-center">
          <p className="text-3xl font-semibold tabular-nums">
            {minutes}
            <span className="text-muted-foreground text-lg">m</span> {seconds}
            <span className="text-muted-foreground text-lg">s</span>
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Estimated reading time</p>
        </div>
        <div className="border-border/60 rounded-lg border p-4 text-center">
          <p className="text-3xl font-semibold tabular-nums">{wordCount}</p>
          <p className="text-muted-foreground mt-1 text-xs">Words</p>
        </div>
      </div>
    </div>
  )
}
