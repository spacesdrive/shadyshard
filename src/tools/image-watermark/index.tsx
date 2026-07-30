import { useEffect, useRef, useState } from "react"
import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { loadImageFromFile, canvasToBlob, formatBytes } from "@/lib/image"

const POSITIONS = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top centre" },
  { value: "top-right", label: "Top right" },
  { value: "middle-left", label: "Middle left" },
  { value: "middle-center", label: "Centre" },
  { value: "middle-right", label: "Middle right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom centre" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "tile", label: "Tiled across the image" },
]

const FORMATS = [
  { value: "image/png", label: "PNG", extension: "png" },
  { value: "image/jpeg", label: "JPEG", extension: "jpg" },
]

interface Settings {
  text: string
  position: string
  sizePercent: number
  opacity: number
  rotation: number
  color: string
  outline: boolean
  marginPercent: number
}

const DEFAULTS: Settings = {
  text: "",
  position: "bottom-right",
  sizePercent: 5,
  opacity: 60,
  rotation: 0,
  color: "#ffffff",
  outline: true,
  marginPercent: 3,
}

function anchorFor(
  position: string,
  width: number,
  height: number,
  margin: number,
): { x: number; y: number; align: CanvasTextAlign; baseline: CanvasTextBaseline } {
  const [vertical, horizontal] = position.split("-")
  const x =
    horizontal === "left" ? margin : horizontal === "right" ? width - margin : width / 2
  const y =
    vertical === "top" ? margin : vertical === "bottom" ? height - margin : height / 2
  return {
    x,
    y,
    align: horizontal === "left" ? "left" : horizontal === "right" ? "right" : "center",
    baseline: vertical === "top" ? "top" : vertical === "bottom" ? "bottom" : "middle",
  }
}

function drawWatermark(image: HTMLImageElement, settings: Settings): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas 2D context is not available.")

  context.drawImage(image, 0, 0)
  if (!settings.text) return canvas

  const shortestSide = Math.min(canvas.width, canvas.height)
  const fontSize = Math.max(8, (shortestSide * settings.sizePercent) / 100)
  const margin = (shortestSide * settings.marginPercent) / 100

  context.font = `600 ${fontSize}px system-ui, sans-serif`
  context.fillStyle = settings.color
  context.globalAlpha = settings.opacity / 100
  context.strokeStyle = settings.color.toLowerCase() === "#000000" ? "#ffffff" : "#000000"
  context.lineWidth = Math.max(1, fontSize / 16)
  context.lineJoin = "round"

  const radians = (settings.rotation * Math.PI) / 180

  function stamp(
    x: number,
    y: number,
    align: CanvasTextAlign,
    baseline: CanvasTextBaseline,
  ) {
    if (!context) return
    context.save()
    context.translate(x, y)
    context.rotate(radians)
    context.textAlign = align
    context.textBaseline = baseline
    if (settings.outline) context.strokeText(settings.text, 0, 0)
    context.fillText(settings.text, 0, 0)
    context.restore()
  }

  if (settings.position === "tile") {
    const metrics = context.measureText(settings.text)
    const stepX = Math.max(fontSize * 2, metrics.width + fontSize * 2)
    const stepY = fontSize * 3
    for (let y = stepY; y < canvas.height + stepY; y += stepY) {
      for (let x = 0; x < canvas.width + stepX; x += stepX) {
        stamp(x, y, "left", "middle")
      }
    }
  } else {
    const anchor = anchorFor(settings.position, canvas.width, canvas.height, margin)
    stamp(anchor.x, anchor.y, anchor.align, anchor.baseline)
  }

  return canvas
}

export default function ImageWatermark() {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [error, setError] = useState<string | null>(null)
  const [format, setFormat] = useState("image/png")
  const previewRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const target = previewRef.current
    if (!image || !target) return

    const rendered = drawWatermark(image, settings)
    target.width = rendered.width
    target.height = rendered.height
    target.getContext("2d")?.drawImage(rendered, 0, 0)
  }, [image, settings])

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    try {
      const loaded = await loadImageFromFile(selected)
      setFile(selected)
      setImage(loaded)
      setSettings((current) => ({
        ...current,
        text: current.text || "Sample watermark",
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this image.")
    }
  }

  function update(patch: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...patch }))
  }

  function reset() {
    setFile(null)
    setImage(null)
    setSettings(DEFAULTS)
    setError(null)
  }

  const target = FORMATS.find((entry) => entry.value === format) ?? FORMATS[0]
  const textMissing = Boolean(image) && settings.text.trim() === ""

  return (
    <div className="space-y-5">
      {!image && (
        <FileDropZone
          accept="image/*"
          onFiles={handleFile}
          hint="PNG, JPEG, WebP, or GIF"
        />
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {image && file && (
        <div className="space-y-5">
          <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {image.naturalWidth} by {image.naturalHeight} pixels,{" "}
                {formatBytes(file.size)}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              <Trash2 className="size-4" />
              Choose another
            </Button>
          </div>

          <div>
            <Label htmlFor="watermark-text">Watermark text</Label>
            <Input
              id="watermark-text"
              name="text"
              value={settings.text}
              onChange={(event) => update({ text: event.target.value })}
              placeholder="Copyright 2026 Your Name"
              aria-invalid={textMissing ? true : undefined}
              className="mt-1.5"
            />
            {textMissing && (
              <p className="text-destructive mt-1.5 text-sm">
                Enter the text to stamp onto the image.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="watermark-position">Position</Label>
              <Select
                value={settings.position}
                onValueChange={(next) => next && update({ position: next as string })}
              >
                <SelectTrigger id="watermark-position" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="watermark-color">Text colour</Label>
              <Input
                id="watermark-color"
                name="color"
                type="color"
                value={settings.color}
                onChange={(event) => update({ color: event.target.value })}
                className="mt-1.5 h-9 w-full p-1"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <span className="text-sm font-medium">
                Text size: {settings.sizePercent} percent of the shortest side
              </span>
              <Slider
                aria-label="Text size as a percentage of the shortest side"
                value={[settings.sizePercent]}
                min={1}
                max={25}
                step={1}
                onValueChange={(value) => update({ sizePercent: (value as number[])[0] })}
                className="mt-3"
              />
            </div>

            <div>
              <span className="text-sm font-medium">
                Opacity: {settings.opacity} percent
              </span>
              <Slider
                aria-label="Watermark opacity"
                value={[settings.opacity]}
                min={5}
                max={100}
                step={5}
                onValueChange={(value) => update({ opacity: (value as number[])[0] })}
                className="mt-3"
              />
            </div>

            <div>
              <span className="text-sm font-medium">
                Rotation: {settings.rotation} degrees
              </span>
              <Slider
                aria-label="Watermark rotation in degrees"
                value={[settings.rotation]}
                min={-90}
                max={90}
                step={5}
                onValueChange={(value) => update({ rotation: (value as number[])[0] })}
                className="mt-3"
              />
            </div>

            <div>
              <span className="text-sm font-medium">
                Margin: {settings.marginPercent} percent
              </span>
              <Slider
                aria-label="Margin from the image edge as a percentage"
                value={[settings.marginPercent]}
                min={0}
                max={15}
                step={1}
                onValueChange={(value) =>
                  update({ marginPercent: (value as number[])[0] })
                }
                className="mt-3"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Switch
                id="watermark-outline"
                name="outline"
                checked={settings.outline}
                onCheckedChange={(checked) => update({ outline: checked })}
              />
              <Label htmlFor="watermark-outline" className="font-normal">
                Contrast outline
              </Label>
            </div>

            <div className="min-w-36">
              <Label htmlFor="watermark-format">Export format</Label>
              <Select
                value={format}
                onValueChange={(next) => next && setFormat(next as string)}
              >
                <SelectTrigger id="watermark-format" className="mt-1.5 w-full">
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

          <div>
            <p className="mb-1.5 text-sm font-medium">Preview</p>
            <canvas
              ref={previewRef}
              className="border-border/60 bg-muted max-h-96 w-full rounded-lg border object-contain"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={() =>
                image
                  ? canvasToBlob(drawWatermark(image, settings), target.value, 0.92)
                  : null
              }
              filename={`watermarked-${file.name.replace(/\.[^.]+$/, "")}.${target.extension}`}
              label={`Download ${target.label}`}
              disabled={textMissing}
            />
            <Button variant="outline" size="sm" onClick={() => setSettings(DEFAULTS)}>
              <Trash2 className="size-4" />
              Reset settings
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
