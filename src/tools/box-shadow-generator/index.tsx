import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { CopyButton } from "@/components/tool/CopyButton"

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function SliderField({ label, value, min, max, onChange }: SliderFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-sm tabular-nums">{value}px</span>
      </div>
      <Slider
        aria-label={label}
        className="mt-2"
        min={min}
        max={max}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
    </div>
  )
}

export default function BoxShadowGenerator() {
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(10)
  const [blur, setBlur] = useState(20)
  const [spread, setSpread] = useState(0)
  const [color, setColor] = useState("#000000")
  const [opacity, setOpacity] = useState(0.25)
  const [inset, setInset] = useState(false)

  const rgb = [0, 2, 4].map((i) => parseInt(color.slice(1 + i, 3 + i), 16))
  const rgba = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`
  const css = `box-shadow: ${inset ? "inset " : ""}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba};`

  return (
    <div className="space-y-6">
      <div className="border-border/60 bg-muted/30 flex items-center justify-center rounded-xl border p-12">
        <div
          className="bg-card size-32 rounded-xl"
          style={{
            boxShadow: `${inset ? "inset " : ""}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${rgba}`,
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SliderField
          label="Offset X"
          value={offsetX}
          min={-50}
          max={50}
          onChange={setOffsetX}
        />
        <SliderField
          label="Offset Y"
          value={offsetY}
          min={-50}
          max={50}
          onChange={setOffsetY}
        />
        <SliderField label="Blur" value={blur} min={0} max={100} onChange={setBlur} />
        <SliderField
          label="Spread"
          value={spread}
          min={-50}
          max={50}
          onChange={setSpread}
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div>
          <Label htmlFor="box-shadow-color">Color</Label>
          <input
            id="box-shadow-color"
            name="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="border-border/60 mt-1.5 size-9 cursor-pointer rounded-lg border bg-transparent"
            aria-label="Shadow color"
          />
        </div>
        <div className="min-w-40 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Opacity</span>
            <span className="text-muted-foreground text-sm tabular-nums">
              {Math.round(opacity * 100)}%
            </span>
          </div>
          <Slider
            aria-label="Shadow opacity"
            className="mt-2"
            min={0}
            max={1}
            step={0.05}
            value={[opacity]}
            onValueChange={(v) => setOpacity(Array.isArray(v) ? v[0] : v)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="box-shadow-inset"
            name="inset"
            checked={inset}
            onCheckedChange={setInset}
          />
          <Label htmlFor="box-shadow-inset" className="font-normal">
            Inset
          </Label>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          id="box-shadow-css"
          name="css"
          value={css}
          readOnly
          className="font-mono text-sm"
          aria-label="Generated CSS"
        />
        <CopyButton value={css} label="Copy CSS" size="icon" />
      </div>
    </div>
  )
}
