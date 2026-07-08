import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CopyButton } from "@/components/tool/CopyButton"

export default function GradientGenerator() {
  const [colorA, setColorA] = useState("#7c3aed")
  const [colorB, setColorB] = useState("#06b6d4")
  const [angle, setAngle] = useState(90)
  const [type, setType] = useState<"linear" | "radial">("linear")

  const gradient =
    type === "linear"
      ? `linear-gradient(${angle}deg, ${colorA}, ${colorB})`
      : `radial-gradient(circle, ${colorA}, ${colorB})`
  const css = `background: ${gradient};`

  return (
    <div className="space-y-6">
      <div
        className="border-border/60 h-48 w-full rounded-xl border"
        style={{ background: gradient }}
        role="img"
        aria-label={`Gradient preview: ${gradient}`}
      />

      <div className="flex gap-2">
        <Button
          variant={type === "linear" ? "default" : "outline"}
          size="sm"
          onClick={() => setType("linear")}
        >
          Linear
        </Button>
        <Button
          variant={type === "radial" ? "default" : "outline"}
          size="sm"
          onClick={() => setType("radial")}
        >
          Radial
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="gradient-color-a">Color A</Label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="gradient-color-a"
              name="colorA"
              type="color"
              value={colorA}
              onChange={(e) => setColorA(e.target.value)}
              className="border-border/60 size-9 shrink-0 cursor-pointer rounded-lg border bg-transparent"
              aria-label="Pick color A"
            />
            <Input
              id="gradient-color-a-hex"
              name="colorAHex"
              value={colorA}
              onChange={(e) => setColorA(e.target.value)}
              className="font-mono text-sm"
              aria-label="Color A hex value"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="gradient-color-b">Color B</Label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="gradient-color-b"
              name="colorB"
              type="color"
              value={colorB}
              onChange={(e) => setColorB(e.target.value)}
              className="border-border/60 size-9 shrink-0 cursor-pointer rounded-lg border bg-transparent"
              aria-label="Pick color B"
            />
            <Input
              id="gradient-color-b-hex"
              name="colorBHex"
              value={colorB}
              onChange={(e) => setColorB(e.target.value)}
              className="font-mono text-sm"
              aria-label="Color B hex value"
            />
          </div>
        </div>
      </div>

      {type === "linear" && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Angle</span>
            <span className="text-muted-foreground text-sm tabular-nums">
              {angle}&deg;
            </span>
          </div>
          <Slider
            aria-label="Gradient angle"
            className="mt-2"
            min={0}
            max={360}
            value={[angle]}
            onValueChange={(value) => setAngle(Array.isArray(value) ? value[0] : value)}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Input
          id="gradient-css"
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
