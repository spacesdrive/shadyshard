import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { canvasToBlob } from "@/lib/image"

const PRESETS = [
  { label: "1920 x 1080", width: 1920, height: 1080 },
  { label: "1200 x 630", width: 1200, height: 630 },
  { label: "800 x 600", width: 800, height: 600 },
  { label: "600 x 600", width: 600, height: 600 },
  { label: "300 x 250", width: 300, height: 250 },
]

const FORMATS = [
  { value: "image/png", label: "PNG", extension: "png" },
  { value: "image/jpeg", label: "JPEG", extension: "jpg" },
  { value: "image/webp", label: "WebP", extension: "webp" },
  { value: "svg", label: "SVG", extension: "svg" },
]

const MAX_DIMENSION = 4000

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildSvg(
  width: number,
  height: number,
  background: string,
  textColor: string,
  label: string,
): string {
  const fontSize = Math.max(12, Math.round(Math.min(width, height) / 8))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}"><rect width="${width}" height="${height}" fill="${background}"/><text x="50%" y="50%" fill="${textColor}" font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="600" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text></svg>`
}

export default function PlaceholderImageGenerator() {
  const [width, setWidth] = useState("1200")
  const [height, setHeight] = useState("630")
  const [background, setBackground] = useState("#334155")
  const [textColor, setTextColor] = useState("#e2e8f0")
  const [label, setLabel] = useState("")
  const [format, setFormat] = useState("image/png")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const widthValue = Number(width)
  const heightValue = Number(height)

  const sizeError =
    !Number.isInteger(widthValue) ||
    !Number.isInteger(heightValue) ||
    widthValue < 1 ||
    heightValue < 1
      ? "Enter a whole number of pixels for both width and height."
      : widthValue > MAX_DIMENSION || heightValue > MAX_DIMENSION
        ? `Keep both dimensions at or below ${MAX_DIMENSION} pixels.`
        : null

  const resolvedLabel = label.trim() || `${widthValue} x ${heightValue}`

  const svgMarkup = useMemo(
    () =>
      sizeError
        ? ""
        : buildSvg(widthValue, heightValue, background, textColor, resolvedLabel),
    [sizeError, widthValue, heightValue, background, textColor, resolvedLabel],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || sizeError) return

    canvas.width = widthValue
    canvas.height = heightValue
    const context = canvas.getContext("2d")
    if (!context) return

    context.fillStyle = background
    context.fillRect(0, 0, widthValue, heightValue)

    const fontSize = Math.max(12, Math.round(Math.min(widthValue, heightValue) / 8))
    context.fillStyle = textColor
    context.font = `600 ${fontSize}px system-ui, sans-serif`
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(resolvedLabel, widthValue / 2, heightValue / 2)
  }, [sizeError, widthValue, heightValue, background, textColor, resolvedLabel])

  const selectedFormat = FORMATS.find((entry) => entry.value === format) ?? FORMATS[0]
  const isSvg = format === "svg"

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="placeholder-width">Width in pixels</Label>
          <Input
            id="placeholder-width"
            name="width"
            type="number"
            min="1"
            max={MAX_DIMENSION}
            value={width}
            onChange={(event) => setWidth(event.target.value)}
            className="mt-1.5"
            aria-invalid={sizeError ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="placeholder-height">Height in pixels</Label>
          <Input
            id="placeholder-height"
            name="height"
            type="number"
            min="1"
            max={MAX_DIMENSION}
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            className="mt-1.5"
            aria-invalid={sizeError ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="placeholder-background">Background colour</Label>
          <Input
            id="placeholder-background"
            name="background"
            type="color"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
            className="mt-1.5 h-9 w-full"
          />
        </div>
        <div>
          <Label htmlFor="placeholder-text-color">Text colour</Label>
          <Input
            id="placeholder-text-color"
            name="textColor"
            type="color"
            value={textColor}
            onChange={(event) => setTextColor(event.target.value)}
            className="mt-1.5 h-9 w-full"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="placeholder-label">Label (optional)</Label>
        <Input
          id="placeholder-label"
          name="label"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder={`Defaults to ${widthValue || 0} x ${heightValue || 0}`}
          className="mt-1.5"
        />
      </div>

      {sizeError && <p className="text-destructive text-sm">{sizeError}</p>}

      {!sizeError && (
        <>
          <canvas
            ref={canvasRef}
            className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
            role="img"
            aria-label={`Placeholder image preview, ${resolvedLabel}`}
          />

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-40 flex-1">
              <Label htmlFor="placeholder-format">Format</Label>
              <Select
                value={format}
                onValueChange={(next) => next && setFormat(next as string)}
              >
                <SelectTrigger id="placeholder-format" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>
                      {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DownloadButton
              getBlob={() =>
                isSvg
                  ? new Blob([svgMarkup], { type: "image/svg+xml" })
                  : canvasRef.current
                    ? canvasToBlob(canvasRef.current, format, 0.92)
                    : null
              }
              filename={`placeholder-${widthValue}x${heightValue}.${selectedFormat.extension}`}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWidth("1200")
                setHeight("630")
                setBackground("#334155")
                setTextColor("#e2e8f0")
                setLabel("")
                setFormat("image/png")
              }}
            >
              Reset
            </Button>
          </div>

          {isSvg && (
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="placeholder-svg">Inline SVG markup</Label>
                <CopyButton value={svgMarkup} label="Copy SVG" />
              </div>
              <Textarea
                id="placeholder-svg"
                name="svgMarkup"
                value={svgMarkup}
                readOnly
                spellCheck={false}
                className="min-h-28 resize-y font-mono text-xs break-all"
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
