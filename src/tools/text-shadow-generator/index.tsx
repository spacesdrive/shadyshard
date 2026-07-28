import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { CopyButton } from "@/components/tool/CopyButton"

interface ShadowLayer {
  id: number
  offsetX: number
  offsetY: number
  blur: number
  color: string
  opacity: number
}

function newLayer(id: number): ShadowLayer {
  return { id, offsetX: 2, offsetY: 2, blur: 4, color: "#000000", opacity: 0.5 }
}

function layerCss(layer: ShadowLayer): string {
  const channels = [1, 3, 5].map((start) =>
    parseInt(layer.color.slice(start, start + 2), 16),
  )
  const rgba = `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${layer.opacity})`
  return `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${rgba}`
}

interface LayerSliderProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix: string
  onChange: (value: number) => void
}

function LayerSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: LayerSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-sm tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        id={id}
        aria-label={label}
        className="mt-2"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
      />
    </div>
  )
}

export default function TextShadowGenerator() {
  const [layers, setLayers] = useState<ShadowLayer[]>([newLayer(1)])
  const [nextId, setNextId] = useState(2)
  const [sampleText, setSampleText] = useState("Shadow text")
  const [fontSize, setFontSize] = useState(48)
  const [textColor, setTextColor] = useState("#ffffff")

  const shadowValue = layers.map(layerCss).join(", ")
  const css = `text-shadow: ${shadowValue};`

  function updateLayer(id: number, patch: Partial<ShadowLayer>) {
    setLayers((current) =>
      current.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-border/60 bg-muted/30 flex min-h-40 items-center justify-center rounded-xl border p-6">
        <span
          className="text-center leading-tight font-bold break-words"
          style={{ fontSize: `${fontSize}px`, color: textColor, textShadow: shadowValue }}
        >
          {sampleText || "Shadow text"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Label htmlFor="shadow-sample">Sample text</Label>
          <Input
            id="shadow-sample"
            name="sampleText"
            value={sampleText}
            onChange={(event) => setSampleText(event.target.value)}
            className="mt-1.5 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="shadow-text-color">Text color</Label>
          <input
            id="shadow-text-color"
            name="textColor"
            type="color"
            value={textColor}
            onChange={(event) => setTextColor(event.target.value)}
            className="border-border/60 mt-1.5 block size-9 cursor-pointer rounded-lg border bg-transparent"
          />
        </div>
        <LayerSlider
          id="shadow-font-size"
          label="Font size"
          value={fontSize}
          min={16}
          max={120}
          suffix="px"
          onChange={setFontSize}
        />
      </div>

      <div className="space-y-4">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className="border-border/60 space-y-4 rounded-xl border p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Layer {index + 1}</span>
              {layers.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove layer ${index + 1}`}
                  onClick={() =>
                    setLayers((current) => current.filter((item) => item.id !== layer.id))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <LayerSlider
                id={`shadow-x-${layer.id}`}
                label="Offset X"
                value={layer.offsetX}
                min={-40}
                max={40}
                suffix="px"
                onChange={(value) => updateLayer(layer.id, { offsetX: value })}
              />
              <LayerSlider
                id={`shadow-y-${layer.id}`}
                label="Offset Y"
                value={layer.offsetY}
                min={-40}
                max={40}
                suffix="px"
                onChange={(value) => updateLayer(layer.id, { offsetY: value })}
              />
              <LayerSlider
                id={`shadow-blur-${layer.id}`}
                label="Blur"
                value={layer.blur}
                min={0}
                max={60}
                suffix="px"
                onChange={(value) => updateLayer(layer.id, { blur: value })}
              />
            </div>

            <div className="flex flex-wrap items-end gap-6">
              <div>
                <Label htmlFor={`shadow-color-${layer.id}`}>Shadow color</Label>
                <input
                  id={`shadow-color-${layer.id}`}
                  name={`color-${layer.id}`}
                  type="color"
                  value={layer.color}
                  onChange={(event) =>
                    updateLayer(layer.id, { color: event.target.value })
                  }
                  className="border-border/60 mt-1.5 block size-9 cursor-pointer rounded-lg border bg-transparent"
                />
              </div>
              <div className="min-w-40 flex-1">
                <LayerSlider
                  id={`shadow-opacity-${layer.id}`}
                  label="Opacity"
                  value={layer.opacity}
                  min={0}
                  max={1}
                  step={0.05}
                  suffix=""
                  onChange={(value) => updateLayer(layer.id, { opacity: value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setLayers((current) => [...current, newLayer(nextId)])
            setNextId((id) => id + 1)
          }}
        >
          <Plus className="size-4" />
          Add layer
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setLayers([newLayer(nextId)])
            setNextId((id) => id + 1)
            setFontSize(48)
            setTextColor("#ffffff")
            setSampleText("Shadow text")
          }}
        >
          Reset
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          id="shadow-css"
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
