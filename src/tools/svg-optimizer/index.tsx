import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"
import { formatBytes } from "@/lib/image"

function optimizeSvg(svg: string, removeMetadata: boolean): string {
  let result = svg
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")

  if (removeMetadata) {
    result = result
      .replace(/<metadata[\s\S]*?<\/metadata>/gi, "")
      .replace(/<title[\s\S]*?<\/title>/gi, "")
      .replace(/<desc[\s\S]*?<\/desc>/gi, "")
  }

  return result
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim()
}

export default function SvgOptimizer() {
  const [input, setInput] = useState("")
  const [removeMetadata, setRemoveMetadata] = useState(true)

  const output = input ? optimizeSvg(input, removeMetadata) : ""
  const originalBytes = new TextEncoder().encode(input).length
  const optimizedBytes = new TextEncoder().encode(output).length
  const savedPercent =
    originalBytes > 0
      ? Math.round(((originalBytes - optimizedBytes) / originalBytes) * 100)
      : 0

  return (
    <div className="space-y-4">
      <Textarea
        id="svg-optimizer-input"
        name="svg"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="<svg>...</svg>"
        className="min-h-48 resize-y font-mono text-xs"
        aria-label="SVG markup to optimize"
        spellCheck={false}
      />

      <div className="flex items-center gap-2">
        <Switch
          id="svg-optimizer-metadata"
          name="removeMetadata"
          checked={removeMetadata}
          onCheckedChange={setRemoveMetadata}
        />
        <Label htmlFor="svg-optimizer-metadata" className="font-normal">
          Remove title, desc, and metadata tags
        </Label>
      </div>

      {input && (
        <div className="grid grid-cols-3 gap-3">
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold tabular-nums">
              {formatBytes(originalBytes)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Original</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold tabular-nums">
              {formatBytes(optimizedBytes)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Optimized</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold text-emerald-500 tabular-nums">
              {savedPercent}%
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Saved</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <CopyButton value={output} label="Copy optimized SVG" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          Reset
        </Button>
      </div>

      <Textarea
        id="svg-optimizer-output"
        name="optimized"
        value={output}
        readOnly
        className="min-h-32 resize-y font-mono text-xs"
        aria-label="Optimized SVG output"
      />
    </div>
  )
}
