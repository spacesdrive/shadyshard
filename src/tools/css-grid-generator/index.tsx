import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { CopyButton } from "@/components/tool/CopyButton"

export default function CssGridGenerator() {
  const [columns, setColumns] = useState(3)
  const [rows, setRows] = useState(2)
  const [gap, setGap] = useState(12)

  const css = `display: grid;\ngrid-template-columns: repeat(${columns}, 1fr);\ngrid-template-rows: repeat(${rows}, 1fr);\ngap: ${gap}px;`

  return (
    <div className="space-y-6">
      <div
        className="border-border/60 bg-muted/30 rounded-xl border p-4"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: `${gap}px`,
          minHeight: 220,
        }}
      >
        {Array.from({ length: columns * rows }, (_, i) => (
          <div
            key={i}
            className="bg-primary/15 text-primary flex items-center justify-center rounded-lg text-sm font-medium"
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Columns</span>
            <span className="text-muted-foreground text-sm tabular-nums">{columns}</span>
          </div>
          <Slider
            aria-label="Number of columns"
            className="mt-2"
            min={1}
            max={8}
            value={[columns]}
            onValueChange={(v) => setColumns(Array.isArray(v) ? v[0] : v)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rows</span>
            <span className="text-muted-foreground text-sm tabular-nums">{rows}</span>
          </div>
          <Slider
            aria-label="Number of rows"
            className="mt-2"
            min={1}
            max={6}
            value={[rows]}
            onValueChange={(v) => setRows(Array.isArray(v) ? v[0] : v)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Gap</span>
            <span className="text-muted-foreground text-sm tabular-nums">{gap}px</span>
          </div>
          <Slider
            aria-label="Grid gap"
            className="mt-2"
            min={0}
            max={48}
            value={[gap]}
            onValueChange={(v) => setGap(Array.isArray(v) ? v[0] : v)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          id="css-grid-output"
          name="css"
          value={css}
          readOnly
          className="font-mono text-xs"
          aria-label="Generated CSS"
        />
        <CopyButton value={css} label="Copy CSS" size="icon" />
      </div>
    </div>
  )
}
