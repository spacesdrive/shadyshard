import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { canvasToBlob, loadImageFromFile } from "@/lib/image"

const POSITIONS = [
  { value: "tiled", label: "Tiled diagonally" },
  { value: "center", label: "Center" },
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
]

const EXPORT_FORMATS = [
  { value: "image/png", label: "PNG (lossless)", extension: "png" },
  { value: "image/jpeg", label: "JPEG (smaller)", extension: "jpg" },
]

interface Settings {
  text: string
  position: string
  fontScale: number
  opacity: number
  rotation: number
  color: string
}

const DEFAULTS: Settings = {
  text: "CONFIDENTIAL",
  position: "tiled",
  fontScale: 5,
  opacity: 0.35,
  rotation: -30,
  color: "#ffffff",
}

function anchorPoint(
  position: string,
  width: number,
  height: number,
  margin: number,
): { x: number; y: number; align: CanvasTextAlign; baseline: CanvasTextBaseline } {
  const [vertical, horizontal] = position.split("-")

  const x =
    horizontal === "left" ? margin : horizontal === "right" ? width - margin : width / 2
  const align: CanvasTextAlign =
    horizontal === "left" ? "left" : horizontal === "right" ? "right" : "center"

  const y =
    vertical === "top" ? margin : vertical === "bottom" ? height - margin : height / 2
  const baseline: CanvasTextBaseline =
    vertical === "top" ? "top" : vertical === "bottom" ? "bottom" : "middle"

  return { x, y, align, baseline }
}

function drawWatermark(
  image: HTMLImageElement,
  settings: Settings,
  canvas: HTMLCanvasElement,
) {
  const width = image.naturalWidth
  const height = image.naturalHeight
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) return

  context.clearRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  if (!settings.text.trim()) return

  const fontSize = Math.max(10, (Math.min(width, height) * settings.fontScale) / 100)
  context.font = `600 ${fontSize}px system-ui, sans-serif`
  context.fillStyle = settings.color
  context.globalAlpha = settings.opacity
  // A contrasting outline keeps light text readable over a light photo.
  context.strokeStyle = "rgba(0, 0, 0, 0.35)"
  context.lineWidth = Math.max(1, fontSize / 24)

  const radians = (settings.rotation * Math.PI) / 180

  if (settings.position === "tiled") {
    const metrics = context.measureText(settings.text)
    const stepX = metrics.width + fontSize * 2
    const stepY = fontSize * 3
    const diagonal = Math.sqrt(width * width + height * height)

    context.save()
    context.translate(width / 2, height / 2)
    context.rotate(radians)
    context.textAlign = "center"
    context.textBaseline = "middle"

    for (let y = -diagonal; y < diagonal; y += stepY) {
      for (let x = -diagonal; x < diagonal; x += stepX) {
        context.strokeText(settings.text, x, y)
        context.fillText(settings.text, x, y)
      }
    }
    context.restore()
    context.globalAlpha = 1
    return
  }

  const margin = Math.max(12, fontSize * 0.6)
  const { x, y, align, baseline } = anchorPoint(settings.position, width, height, margin)

  context.save()
  context.translate(x, y)
  context.rotate(radians)
  context.textAlign = align
  context.textBaseline = baseline
  context.strokeText(settings.text, 0, 0)
  context.fillText(settings.text, 0, 0)
  context.restore()
  context.globalAlpha = 1
}

export default function ImageWatermark() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState("image")
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [exportFormat, setExportFormat] = useState("image/png")
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (image && canvasRef.current) {
      drawWatermark(image, settings, canvasRef.current)
    }
  }, [image, settings])

  async function handleFile(files: File[]) {
    const file = files[0]
    setError(null)
    try {
      setImage(await loadImageFromFile(file))
      setFileName(file.name.replace(/\.[^.]+$/, "") || "image")
    } catch {
      setImage(null)
      setError("Could not read this file as an image. Try a PNG, JPG, or WebP.")
    }
  }

  function update(patch: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...patch }))
  }

  const selectedFormat =
    EXPORT_FORMATS.find((format) => format.value === exportFormat) ?? EXPORT_FORMATS[0]
  const textError = settings.text.trim() === "" ? "Enter the watermark text." : null

  return (
    <div className="space-y-5">
      {!image && (
        <FileDropZone
          accept="image/jpeg,image/png,image/webp"
          onFiles={handleFile}
          hint="JPG, PNG, or WebP"
        />
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {image && (
        <>
          <canvas
            ref={canvasRef}
            className="border-border/60 max-h-96 w-full rounded-lg border object-contain"
            role="img"
            aria-label={`Preview of ${fileName} with the watermark applied`}
          />

          <div>
            <Label htmlFor="watermark-text">Watermark text</Label>
            <Input
              id="watermark-text"
              name="text"
              value={settings.text}
              onChange={(event) => update({ text: event.target.value })}
              placeholder="For rental application only, 2026"
              className="mt-1.5"
              aria-invalid={textError ? true : undefined}
            />
            {textError && <p className="text-destructive mt-1.5 text-sm">{textError}</p>}
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
                  {POSITIONS.map((position) => (
                    <SelectItem key={position.value} value={position.value}>
                      {position.label}
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
                className="mt-1.5 h-9 w-full"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Text size</span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {settings.fontScale}%
                </span>
              </div>
              <Slider
                aria-label="Watermark text size"
                className="mt-2"
                min={2}
                max={20}
                step={1}
                value={[settings.fontScale]}
                onValueChange={(value) =>
                  update({ fontScale: Array.isArray(value) ? value[0] : value })
                }
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Opacity</span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {Math.round(settings.opacity * 100)}%
                </span>
              </div>
              <Slider
                aria-label="Watermark opacity"
                className="mt-2"
                min={0.05}
                max={1}
                step={0.05}
                value={[settings.opacity]}
                onValueChange={(value) =>
                  update({ opacity: Array.isArray(value) ? value[0] : value })
                }
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rotation</span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {settings.rotation}deg
                </span>
              </div>
              <Slider
                aria-label="Watermark rotation in degrees"
                className="mt-2"
                min={-90}
                max={90}
                step={5}
                value={[settings.rotation]}
                onValueChange={(value) =>
                  update({ rotation: Array.isArray(value) ? value[0] : value })
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-44 flex-1">
              <Label htmlFor="watermark-format">Download as</Label>
              <Select
                value={exportFormat}
                onValueChange={(next) => next && setExportFormat(next as string)}
              >
                <SelectTrigger id="watermark-format" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DownloadButton
              getBlob={() =>
                canvasRef.current
                  ? canvasToBlob(canvasRef.current, exportFormat, 0.92)
                  : null
              }
              filename={`${fileName}-watermarked.${selectedFormat.extension}`}
              disabled={Boolean(textError)}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImage(null)
                setSettings(DEFAULTS)
                setExportFormat("image/png")
                setFileName("image")
              }}
            >
              Reset
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
