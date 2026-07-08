import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { CopyButton } from "@/components/tool/CopyButton"

const DIRECTIONS = ["row", "row-reverse", "column", "column-reverse"] as const
const JUSTIFY = [
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
  "space-evenly",
] as const
const ALIGN = ["stretch", "flex-start", "center", "flex-end"] as const

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div>
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => (
          <Button
            key={option}
            variant={value === option ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default function FlexboxPlayground() {
  const [direction, setDirection] = useState<(typeof DIRECTIONS)[number]>("row")
  const [justify, setJustify] = useState<(typeof JUSTIFY)[number]>("flex-start")
  const [align, setAlign] = useState<(typeof ALIGN)[number]>("stretch")
  const [gap, setGap] = useState(12)
  const [itemCount, setItemCount] = useState(4)

  const css = `display: flex;\nflex-direction: ${direction};\njustify-content: ${justify};\nalign-items: ${align};\ngap: ${gap}px;`

  return (
    <div className="space-y-6">
      <div
        className="border-border/60 bg-muted/30 min-h-56 rounded-xl border p-4"
        style={{
          display: "flex",
          flexDirection: direction,
          justifyContent: justify,
          alignItems: align,
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: itemCount }, (_, i) => (
          <div
            key={i}
            className="bg-primary/15 text-primary flex size-14 items-center justify-center rounded-lg text-sm font-medium"
          >
            {i + 1}
          </div>
        ))}
      </div>

      <OptionGroup
        label="flex-direction"
        options={DIRECTIONS}
        value={direction}
        onChange={setDirection}
      />
      <OptionGroup
        label="justify-content"
        options={JUSTIFY}
        value={justify}
        onChange={setJustify}
      />
      <OptionGroup
        label="align-items"
        options={ALIGN}
        value={align}
        onChange={setAlign}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Gap</span>
            <span className="text-muted-foreground text-sm tabular-nums">{gap}px</span>
          </div>
          <Slider
            aria-label="Gap"
            className="mt-2"
            min={0}
            max={48}
            value={[gap]}
            onValueChange={(v) => setGap(Array.isArray(v) ? v[0] : v)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Items</span>
            <span className="text-muted-foreground text-sm tabular-nums">
              {itemCount}
            </span>
          </div>
          <Slider
            aria-label="Number of items"
            className="mt-2"
            min={1}
            max={8}
            value={[itemCount]}
            onValueChange={(v) => setItemCount(Array.isArray(v) ? v[0] : v)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          id="flexbox-css"
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
