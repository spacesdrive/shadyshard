import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"

const CORNERS = [
  { key: "topLeft", label: "Top left" },
  { key: "topRight", label: "Top right" },
  { key: "bottomRight", label: "Bottom right" },
  { key: "bottomLeft", label: "Bottom left" },
] as const

type CornerKey = (typeof CORNERS)[number]["key"]

export default function BorderRadiusGenerator() {
  const [radii, setRadii] = useState<Record<CornerKey, number>>({
    topLeft: 24,
    topRight: 24,
    bottomRight: 24,
    bottomLeft: 24,
  })

  const css = `border-radius: ${radii.topLeft}px ${radii.topRight}px ${radii.bottomRight}px ${radii.bottomLeft}px;`

  return (
    <div className="space-y-6">
      <div className="border-border/60 bg-muted/30 flex items-center justify-center rounded-xl border p-12">
        <div
          className="bg-primary size-32"
          style={{
            borderRadius: `${radii.topLeft}px ${radii.topRight}px ${radii.bottomRight}px ${radii.bottomLeft}px`,
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CORNERS.map(({ key, label }) => (
          <div key={key}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{label}</span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {radii[key]}px
              </span>
            </div>
            <Slider
              aria-label={label}
              className="mt-2"
              min={0}
              max={100}
              value={[radii[key]]}
              onValueChange={(v) =>
                setRadii((prev) => ({ ...prev, [key]: Array.isArray(v) ? v[0] : v }))
              }
            />
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          setRadii({ topLeft: 24, topRight: 24, bottomRight: 24, bottomLeft: 24 })
        }
      >
        Reset to uniform
      </Button>

      <div className="flex gap-2">
        <Input
          id="border-radius-css"
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
