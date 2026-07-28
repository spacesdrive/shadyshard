import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"

const UNITS = ["px", "rem", "em", "pt", "%"] as const
type Unit = (typeof UNITS)[number]

const PT_PER_PX = 72 / 96

function toPixels(value: number, unit: Unit, rootSize: number, parentSize: number) {
  switch (unit) {
    case "px":
      return value
    case "rem":
      return value * rootSize
    case "em":
      return value * parentSize
    case "pt":
      return value / PT_PER_PX
    case "%":
      return (value / 100) * parentSize
  }
}

function fromPixels(pixels: number, unit: Unit, rootSize: number, parentSize: number) {
  switch (unit) {
    case "px":
      return pixels
    case "rem":
      return pixels / rootSize
    case "em":
      return pixels / parentSize
    case "pt":
      return pixels * PT_PER_PX
    case "%":
      return (pixels / parentSize) * 100
  }
}

function format(value: number): string {
  return String(Number(value.toFixed(4)))
}

export default function CssUnitConverter() {
  const [value, setValue] = useState("24")
  const [unit, setUnit] = useState<Unit>("px")
  const [rootSize, setRootSize] = useState("16")
  const [parentSize, setParentSize] = useState("16")

  const numericValue = Number(value)
  const numericRoot = Number(rootSize)
  const numericParent = Number(parentSize)

  let error: string | null = null
  if (value.trim() === "" || !Number.isFinite(numericValue)) {
    error = "Enter a number to convert."
  } else if (!Number.isFinite(numericRoot) || numericRoot <= 0) {
    error = "Root font size must be a number greater than 0."
  } else if (!Number.isFinite(numericParent) || numericParent <= 0) {
    error = "Parent font size must be a number greater than 0."
  }

  const pixels = error ? null : toPixels(numericValue, unit, numericRoot, numericParent)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="unit-value">Value</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="unit-value"
              name="value"
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="text-sm"
            />
            <Label htmlFor="unit-unit" className="sr-only">
              Unit to convert from
            </Label>
            <Select value={unit} onValueChange={(next) => next && setUnit(next as Unit)}>
              <SelectTrigger id="unit-unit" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="unit-root-size">Root font size</Label>
            <Input
              id="unit-root-size"
              name="rootSize"
              type="number"
              inputMode="decimal"
              value={rootSize}
              onChange={(event) => setRootSize(event.target.value)}
              className="mt-1.5 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="unit-parent-size">Parent font size</Label>
            <Input
              id="unit-parent-size"
              name="parentSize"
              type="number"
              inputMode="decimal"
              value={parentSize}
              onChange={(event) => setParentSize(event.target.value)}
              className="mt-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <ul className="divide-border/60 border-border/60 divide-y rounded-lg border">
          {UNITS.map((target) => {
            const converted = `${format(fromPixels(pixels as number, target, numericRoot, numericParent))}${target}`
            return (
              <li
                key={target}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <span className="text-muted-foreground text-sm">{target}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm tabular-nums">{converted}</span>
                  <CopyButton
                    value={converted}
                    label={`Copy ${target} value`}
                    variant="ghost"
                    size="icon-sm"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setValue("16")
          setUnit("px")
          setRootSize("16")
          setParentSize("16")
        }}
      >
        Reset
      </Button>
    </div>
  )
}
