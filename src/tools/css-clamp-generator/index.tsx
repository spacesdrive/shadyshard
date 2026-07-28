import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"

interface NumberFieldProps {
  id: string
  label: string
  value: string
  suffix: string
  onChange: (value: string) => void
}

function NumberField({ id, label, value, suffix, onChange }: NumberFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5 flex items-center gap-2">
        <Input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="text-sm"
        />
        <span className="text-muted-foreground text-sm">{suffix}</span>
      </div>
    </div>
  )
}

function round(value: number): string {
  return String(Number(value.toFixed(4)))
}

const DEFAULTS = {
  minViewport: "320",
  maxViewport: "1280",
  minSize: "16",
  maxSize: "32",
  rootSize: "16",
}

export default function CssClampGenerator() {
  const [minViewport, setMinViewport] = useState(DEFAULTS.minViewport)
  const [maxViewport, setMaxViewport] = useState(DEFAULTS.maxViewport)
  const [minSize, setMinSize] = useState(DEFAULTS.minSize)
  const [maxSize, setMaxSize] = useState(DEFAULTS.maxSize)
  const [rootSize, setRootSize] = useState(DEFAULTS.rootSize)
  const [previewViewport, setPreviewViewport] = useState(768)

  const numbers = {
    minViewport: Number(minViewport),
    maxViewport: Number(maxViewport),
    minSize: Number(minSize),
    maxSize: Number(maxSize),
    rootSize: Number(rootSize),
  }

  const allFilled = Object.values(numbers).every((value) => Number.isFinite(value))

  let error: string | null = null
  if (!allFilled) {
    error = "Every field needs a number."
  } else if (numbers.rootSize <= 0) {
    error = "Root font size must be greater than 0."
  } else if (numbers.minViewport <= 0 || numbers.maxViewport <= 0) {
    error = "Viewport widths must be greater than 0."
  } else if (numbers.maxViewport <= numbers.minViewport) {
    error = "Maximum viewport width must be larger than the minimum viewport width."
  } else if (numbers.minSize === numbers.maxSize) {
    error =
      "Minimum and maximum size are equal, so a fixed value is simpler than clamp()."
  }

  let css = ""
  let computedSize: number | null = null

  if (!error) {
    const slope =
      (numbers.maxSize - numbers.minSize) / (numbers.maxViewport - numbers.minViewport)
    const intercept = numbers.minSize - slope * numbers.minViewport
    const smaller = Math.min(numbers.minSize, numbers.maxSize)
    const larger = Math.max(numbers.minSize, numbers.maxSize)

    const minRem = round(smaller / numbers.rootSize)
    const maxRem = round(larger / numbers.rootSize)
    const interceptRem = round(intercept / numbers.rootSize)
    const slopeVw = round(slope * 100)

    const sign = Number(slopeVw) < 0 ? "-" : "+"
    css = `clamp(${minRem}rem, ${interceptRem}rem ${sign} ${Math.abs(Number(slopeVw))}vw, ${maxRem}rem)`

    const raw = intercept + slope * previewViewport
    computedSize = Math.min(Math.max(raw, smaller), larger)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id="clamp-min-viewport"
          label="Minimum viewport"
          value={minViewport}
          suffix="px"
          onChange={setMinViewport}
        />
        <NumberField
          id="clamp-max-viewport"
          label="Maximum viewport"
          value={maxViewport}
          suffix="px"
          onChange={setMaxViewport}
        />
        <NumberField
          id="clamp-min-size"
          label="Size at minimum viewport"
          value={minSize}
          suffix="px"
          onChange={setMinSize}
        />
        <NumberField
          id="clamp-max-size"
          label="Size at maximum viewport"
          value={maxSize}
          suffix="px"
          onChange={setMaxSize}
        />
        <NumberField
          id="clamp-root-size"
          label="Root font size"
          value={rootSize}
          suffix="px"
          onChange={setRootSize}
        />
      </div>

      {error ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              id="clamp-output"
              name="output"
              value={css}
              readOnly
              className="font-mono text-sm"
              aria-label="Generated clamp value"
            />
            <CopyButton value={css} label="Copy clamp value" size="icon" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Preview viewport width</span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {previewViewport}px
              </span>
            </div>
            <Slider
              aria-label="Preview viewport width"
              className="mt-2"
              min={240}
              max={2000}
              step={10}
              value={[previewViewport]}
              onValueChange={(value) =>
                setPreviewViewport(Array.isArray(value) ? value[0] : value)
              }
            />
          </div>

          <div className="border-border/60 bg-muted/30 rounded-xl border p-6">
            <p
              className="leading-tight font-medium"
              style={{ fontSize: `${computedSize}px` }}
            >
              The quick brown fox
            </p>
            <p className="text-muted-foreground mt-3 text-sm tabular-nums">
              Computes to {computedSize?.toFixed(2)}px at {previewViewport}px wide
            </p>
          </div>
        </>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setMinViewport(DEFAULTS.minViewport)
          setMaxViewport(DEFAULTS.maxViewport)
          setMinSize(DEFAULTS.minSize)
          setMaxSize(DEFAULTS.maxSize)
          setRootSize(DEFAULTS.rootSize)
          setPreviewViewport(768)
        }}
      >
        Reset
      </Button>
    </div>
  )
}
