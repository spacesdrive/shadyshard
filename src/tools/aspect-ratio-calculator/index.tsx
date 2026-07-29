import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CopyButton } from "@/components/tool/CopyButton"

const PRESETS = [
  { label: "16:9", width: 16, height: 9 },
  { label: "4:3", width: 4, height: 3 },
  { label: "3:2", width: 3, height: 2 },
  { label: "1:1", width: 1, height: 1 },
  { label: "21:9", width: 21, height: 9 },
  { label: "9:16", width: 9, height: 16 },
  { label: "2:3", width: 2, height: 3 },
]

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b)
}

function simplifyRatio(width: number, height: number): string {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return `${(width / height).toFixed(3)} : 1`
  }
  const divisor = greatestCommonDivisor(width, height) || 1
  return `${width / divisor} : ${height / divisor}`
}

type Axis = "width" | "height"

export default function AspectRatioCalculator() {
  const [sourceWidth, setSourceWidth] = useState("1920")
  const [sourceHeight, setSourceHeight] = useState("1080")
  const [targetValue, setTargetValue] = useState("1280")
  const [targetAxis, setTargetAxis] = useState<Axis>("width")
  const [roundToPixels, setRoundToPixels] = useState(true)

  const width = Number(sourceWidth)
  const height = Number(sourceHeight)
  const target = Number(targetValue)

  const sourceError =
    !Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0
      ? "Enter an original width and height greater than zero."
      : null
  const targetError =
    !sourceError && (!Number.isFinite(target) || target <= 0)
      ? "Enter a new size greater than zero."
      : null

  const ratio = sourceError ? 0 : width / height
  const rawOther =
    targetError || sourceError
      ? 0
      : targetAxis === "width"
        ? target / ratio
        : target * ratio
  const other = roundToPixels ? Math.round(rawOther) : Number(rawOther.toFixed(2))

  const resultWidth = targetAxis === "width" ? target : other
  const resultHeight = targetAxis === "width" ? other : target
  const solved = !sourceError && !targetError

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setSourceWidth(String(preset.width))
    setSourceHeight(String(preset.height))
  }

  function setAxis(axis: Axis) {
    if (axis === targetAxis) return
    setTargetValue(String(axis === "width" ? resultWidth : resultHeight))
    setTargetAxis(axis)
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="text-sm font-medium">Common ratios</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ratio-source-width">Original width</Label>
          <Input
            id="ratio-source-width"
            name="sourceWidth"
            type="number"
            min={1}
            value={sourceWidth}
            onChange={(event) => setSourceWidth(event.target.value)}
            className="mt-1.5"
            aria-invalid={sourceError ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="ratio-source-height">Original height</Label>
          <Input
            id="ratio-source-height"
            name="sourceHeight"
            type="number"
            min={1}
            value={sourceHeight}
            onChange={(event) => setSourceHeight(event.target.value)}
            className="mt-1.5"
            aria-invalid={sourceError ? true : undefined}
          />
        </div>
      </div>

      {sourceError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{sourceError}</span>
        </div>
      )}

      {!sourceError && (
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
          <div>
            <p className="text-muted-foreground text-xs">Aspect ratio</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {simplifyRatio(width, height)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs tabular-nums">
              {ratio.toFixed(4)} to 1
            </p>
          </div>
          <div
            className="bg-primary/15 border-primary/40 rounded border"
            style={{
              width: ratio >= 1 ? 96 : 96 * ratio,
              height: ratio >= 1 ? 96 / ratio : 96,
            }}
            aria-hidden
          />
        </div>
      )}

      <div>
        <span className="text-sm font-medium">Solve for</span>
        <div className="mt-2 flex gap-2">
          <Button
            variant={targetAxis === "width" ? "default" : "outline"}
            size="sm"
            onClick={() => setAxis("width")}
            aria-pressed={targetAxis === "width"}
          >
            I know the width
          </Button>
          <Button
            variant={targetAxis === "height" ? "default" : "outline"}
            size="sm"
            onClick={() => setAxis("height")}
            aria-pressed={targetAxis === "height"}
          >
            I know the height
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ratio-target">
            New {targetAxis === "width" ? "width" : "height"}
          </Label>
          <Input
            id="ratio-target"
            name="target"
            type="number"
            min={1}
            value={targetValue}
            onChange={(event) => setTargetValue(event.target.value)}
            className="mt-1.5"
            aria-invalid={targetError ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="ratio-result">
            Matching {targetAxis === "width" ? "height" : "width"}
          </Label>
          <Input
            id="ratio-result"
            name="result"
            value={solved ? String(other) : ""}
            readOnly
            className="mt-1.5 tabular-nums"
          />
        </div>
      </div>

      {targetError && <p className="text-destructive text-sm">{targetError}</p>}

      <div className="flex items-center gap-2">
        <Switch
          id="ratio-round"
          name="roundToPixels"
          checked={roundToPixels}
          onCheckedChange={setRoundToPixels}
        />
        <Label htmlFor="ratio-round" className="font-normal">
          Round to whole pixels
        </Label>
      </div>

      {solved && (
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
          <div>
            <p className="text-muted-foreground text-xs">Result</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {resultWidth} x {resultHeight}
            </p>
          </div>
          <CopyButton value={`${resultWidth}x${resultHeight}`} label="Copy dimensions" />
        </div>
      )}
    </div>
  )
}
