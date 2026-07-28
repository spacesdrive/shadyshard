import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { CopyButton } from "@/components/tool/CopyButton"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadImageFromFile, drawToCanvas } from "@/lib/image"

const SAMPLE_SIZE = 160
// 5 bits per channel groups near-identical shades together without merging
// colors a person would call different.
const BUCKET_SHIFT = 3

interface Swatch {
  hex: string
  share: number
}

function toHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0")
}

function extractPalette(canvas: HTMLCanvasElement, count: number): Swatch[] {
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas 2D context is not available.")
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height)

  const buckets = new Map<
    number,
    { red: number; green: number; blue: number; n: number }
  >()
  let counted = 0

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    const red = data[i]
    const green = data[i + 1]
    const blue = data[i + 2]
    const key =
      ((red >> BUCKET_SHIFT) << 10) |
      ((green >> BUCKET_SHIFT) << 5) |
      (blue >> BUCKET_SHIFT)
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.red += red
      bucket.green += green
      bucket.blue += blue
      bucket.n += 1
    } else {
      buckets.set(key, { red, green, blue, n: 1 })
    }
    counted += 1
  }

  if (counted === 0) throw new Error("This image has no visible pixels to sample.")

  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((bucket) => ({
      hex: `#${toHex(bucket.red / bucket.n)}${toHex(bucket.green / bucket.n)}${toHex(bucket.blue / bucket.n)}`,
      share: bucket.n / counted,
    }))
}

export default function ImagePaletteExtractor() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [count, setCount] = useState(6)
  const [palette, setPalette] = useState<Swatch[]>([])
  const [format, setFormat] = useState<"css" | "json">("css")
  const [error, setError] = useState<string | null>(null)
  const sampleCanvas = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!sampleCanvas.current) return
    try {
      setPalette(extractPalette(sampleCanvas.current, count))
      setError(null)
    } catch (thrown) {
      setPalette([])
      setError(
        thrown instanceof Error
          ? thrown.message
          : "Could not read colors from this image.",
      )
    }
  }, [count, file])

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    try {
      const image = await loadImageFromFile(selected)
      const scale = Math.min(
        SAMPLE_SIZE / image.naturalWidth,
        SAMPLE_SIZE / image.naturalHeight,
        1,
      )
      sampleCanvas.current = drawToCanvas(
        image,
        Math.max(1, Math.round(image.naturalWidth * scale)),
        Math.max(1, Math.round(image.naturalHeight * scale)),
      )
      setPreviewUrl(URL.createObjectURL(selected))
      setFile(selected)
    } catch (thrown) {
      sampleCanvas.current = null
      setFile(null)
      setError(thrown instanceof Error ? thrown.message : "Could not read this image.")
    }
  }

  const exported =
    format === "css"
      ? `:root {\n${palette.map((swatch, index) => `  --color-${index + 1}: ${swatch.hex};`).join("\n")}\n}`
      : JSON.stringify(
          palette.map((swatch) => swatch.hex),
          null,
          2,
        )

  return (
    <div className="space-y-5">
      {!file && (
        <FileDropZone
          accept="image/png,image/jpeg,image/webp"
          onFiles={handleFile}
          hint="PNG, JPG, or WebP"
        />
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div className="space-y-5">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview of the image the palette was taken from"
              className="border-border/60 max-h-64 w-full rounded-lg border object-contain"
            />
          )}

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Colors</span>
              <span className="text-muted-foreground text-sm tabular-nums">{count}</span>
            </div>
            <Slider
              aria-label="Number of colors to extract"
              className="mt-2"
              min={3}
              max={12}
              value={[count]}
              onValueChange={(value) => setCount(Array.isArray(value) ? value[0] : value)}
            />
          </div>

          {palette.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {palette.map((swatch) => (
                <li
                  key={swatch.hex}
                  className="border-border/60 flex items-center gap-3 rounded-lg border p-2"
                >
                  <span
                    className="border-border/60 size-10 shrink-0 rounded-md border"
                    style={{ background: swatch.hex }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm">{swatch.hex}</p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {(swatch.share * 100).toFixed(1)}% of pixels
                    </p>
                  </div>
                  <CopyButton
                    value={swatch.hex}
                    label={`Copy ${swatch.hex}`}
                    variant="ghost"
                    size="icon-sm"
                  />
                </li>
              ))}
            </ul>
          )}

          {palette.length > 0 && (
            <div>
              <Tabs
                value={format}
                onValueChange={(value) => setFormat(value as "css" | "json")}
              >
                <TabsList>
                  <TabsTrigger value="css">CSS variables</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
              </Tabs>
              <pre className="border-border/60 bg-muted/30 mt-3 overflow-auto rounded-lg border p-3 font-mono text-xs">
                {exported}
              </pre>
              <div className="mt-2 flex gap-2">
                <CopyButton value={exported} label="Copy palette" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    sampleCanvas.current = null
                    setFile(null)
                    setPreviewUrl(null)
                    setPalette([])
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
