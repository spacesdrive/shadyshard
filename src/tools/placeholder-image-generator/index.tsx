import { useEffect, useRef, useState } from "react"
import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { canvasToBlob } from "@/lib/image"

const MAX_SIDE = 4096

const PRESETS = [
  { label: "Open Graph card", width: 1200, height: 630 },
  { label: "Hero banner", width: 1920, height: 600 },
  { label: "Blog thumbnail", width: 800, height: 450 },
  { label: "Square avatar", width: 400, height: 400 },
  { label: "Product tile", width: 600, height: 600 },
  { label: "Favicon", width: 512, height: 512 },
]

const FORMATS = [
  { value: "image/png", label: "PNG", extension: "png" },
  { value: "image/jpeg", label: "JPEG", extension: "jpg" },
  { value: "image/webp", label: "WebP", extension: "webp" },
]

function draw(
  width: number,
  height: number,
  background: string,
  foreground: string,
  label: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas 2D context is not available.")

  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  if (label) {
    const shortestSide = Math.min(width, height)
    let fontSize = Math.max(10, shortestSide / 6)
    context.fillStyle = foreground
    context.textAlign = "center"
    context.textBaseline = "middle"

    // Shrink until the label fits inside a comfortable margin on both sides.
    do {
      context.font = `600 ${fontSize}px system-ui, sans-serif`
      if (context.measureText(label).width <= width * 0.86) break
      fontSize -= 1
    } while (fontSize > 8)

    context.fillText(label, width / 2, height / 2)
  }

  return canvas
}

export default function PlaceholderImageGenerator() {
  const [width, setWidth] = useState("1200")
  const [height, setHeight] = useState("630")
  const [background, setBackground] = useState("#1f2937")
  const [foreground, setForeground] = useState("#e5e7eb")
  const [label, setLabel] = useState("")
  const [format, setFormat] = useState("image/png")
  const previewRef = useRef<HTMLCanvasElement>(null)

  const numericWidth = Number(width)
  const numericHeight = Number(height)
  const sizeValid =
    Number.isInteger(numericWidth) &&
    Number.isInteger(numericHeight) &&
    numericWidth >= 1 &&
    numericHeight >= 1 &&
    numericWidth <= MAX_SIDE &&
    numericHeight <= MAX_SIDE

  const sizeError = sizeValid
    ? null
    : `Width and height must be whole numbers between 1 and ${MAX_SIDE} pixels.`

  const resolvedLabel = label.trim() || `${numericWidth} x ${numericHeight}`

  useEffect(() => {
    const target = previewRef.current
    if (!target || !sizeValid) return

    const rendered = draw(
      numericWidth,
      numericHeight,
      background,
      foreground,
      resolvedLabel,
    )
    target.width = rendered.width
    target.height = rendered.height
    target.getContext("2d")?.drawImage(rendered, 0, 0)
  }, [numericWidth, numericHeight, background, foreground, resolvedLabel, sizeValid])

  const target = FORMATS.find((entry) => entry.value === format) ?? FORMATS[0]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => {
              setWidth(String(preset.width))
              setHeight(String(preset.height))
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="placeholder-width">Width in pixels</Label>
          <Input
            id="placeholder-width"
            name="width"
            type="number"
            min={1}
            max={MAX_SIDE}
            value={width}
            onChange={(event) => setWidth(event.target.value)}
            aria-invalid={sizeError ? true : undefined}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="placeholder-height">Height in pixels</Label>
          <Input
            id="placeholder-height"
            name="height"
            type="number"
            min={1}
            max={MAX_SIDE}
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            aria-invalid={sizeError ? true : undefined}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="placeholder-background">Background</Label>
          <Input
            id="placeholder-background"
            name="background"
            type="color"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
            className="mt-1.5 h-9 w-full p-1"
          />
        </div>
        <div>
          <Label htmlFor="placeholder-foreground">Text colour</Label>
          <Input
            id="placeholder-foreground"
            name="foreground"
            type="color"
            value={foreground}
            onChange={(event) => setForeground(event.target.value)}
            className="mt-1.5 h-9 w-full p-1"
          />
        </div>
      </div>

      {sizeError && <p className="text-destructive text-sm">{sizeError}</p>}

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <Label htmlFor="placeholder-label">Label</Label>
          <Input
            id="placeholder-label"
            name="label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={sizeValid ? `${numericWidth} x ${numericHeight}` : "Label"}
            className="mt-1.5"
          />
          <p className="text-muted-foreground mt-1.5 text-xs">
            Leave empty to show the dimensions.
          </p>
        </div>
        <div className="sm:min-w-36">
          <Label htmlFor="placeholder-format">Format</Label>
          <Select
            value={format}
            onValueChange={(next) => next && setFormat(next as string)}
          >
            <SelectTrigger id="placeholder-format" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {sizeValid && (
        <div>
          <p className="mb-1.5 text-sm font-medium">Preview</p>
          <canvas
            ref={previewRef}
            className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <DownloadButton
          getBlob={() =>
            sizeValid
              ? canvasToBlob(
                  draw(
                    numericWidth,
                    numericHeight,
                    background,
                    foreground,
                    resolvedLabel,
                  ),
                  target.value,
                  0.92,
                )
              : null
          }
          filename={`placeholder-${numericWidth}x${numericHeight}.${target.extension}`}
          label={`Download ${target.label}`}
          disabled={!sizeValid}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setWidth("1200")
            setHeight("630")
            setBackground("#1f2937")
            setForeground("#e5e7eb")
            setLabel("")
            setFormat("image/png")
          }}
        >
          <Trash2 className="size-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}
