import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { drawToCanvas, formatBytes, loadImageFromFile } from "@/lib/image"

/** Widest the side-by-side comparison ever needs to be rendered. */
const PREVIEW_MAX_WIDTH = 800

interface Placeholder {
  dataUri: string
  bytes: number
  dominantColor: string
  width: number
  height: number
}

function averageColor(canvas: HTMLCanvasElement): string {
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return "#808080"
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
  let red = 0
  let green = 0
  let blue = 0
  const pixels = data.length / 4
  for (let offset = 0; offset < data.length; offset += 4) {
    red += data[offset]
    green += data[offset + 1]
    blue += data[offset + 2]
  }
  const channel = (total: number) =>
    Math.round(total / pixels)
      .toString(16)
      .padStart(2, "0")
  return `#${channel(red)}${channel(green)}${channel(blue)}`
}

function buildPlaceholder(
  image: HTMLImageElement,
  targetWidth: number,
  quality: number,
): Placeholder {
  const ratio = image.naturalHeight / image.naturalWidth
  const width = Math.max(4, Math.min(targetWidth, image.naturalWidth))
  const height = Math.max(1, Math.round(width * ratio))
  const canvas = drawToCanvas(image, width, height)
  const dataUri = canvas.toDataURL("image/jpeg", quality)
  /** A data URI's payload is base64, so the decoded size is three quarters of it. */
  const base64Length = dataUri.length - (dataUri.indexOf(",") + 1)
  return {
    dataUri,
    bytes: Math.round((base64Length * 3) / 4),
    dominantColor: averageColor(canvas),
    width,
    height,
  }
}

const SNIPPET_TABS = [
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "next", label: "Next.js" },
  { value: "uri", label: "Data URI" },
]

function snippetFor(tab: string, placeholder: Placeholder): string {
  switch (tab) {
    case "css":
      return `.lqip {
  background-image: url("${placeholder.dataUri}");
  background-size: cover;
  background-position: center;
  background-color: ${placeholder.dominantColor};
  filter: blur(12px);
  transform: scale(1.05);
}`
    case "html":
      return `<img
  src="/your-image.jpg"
  loading="lazy"
  decoding="async"
  width="0"
  height="0"
  alt=""
  style="background-image: url('${placeholder.dataUri}'); background-size: cover;"
/>`
    case "next":
      return `<Image
  src="/your-image.jpg"
  alt=""
  width={1200}
  height={${Math.round((1200 * placeholder.height) / placeholder.width)}}
  placeholder="blur"
  blurDataURL="${placeholder.dataUri}"
/>`
    default:
      return placeholder.dataUri
  }
}

export default function LqipGenerator() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState("")
  const [width, setWidth] = useState(24)
  const [quality, setQuality] = useState(0.5)
  const [tab, setTab] = useState("css")
  const [error, setError] = useState<string | null>(null)

  /**
   * The comparison image is redrawn through the same canvas the placeholder
   * uses rather than pointing at the selected file, so the page never renders
   * bytes it has not decoded itself.
   */
  const fullPreview = useMemo(() => {
    if (!image) return null
    const width = Math.min(image.naturalWidth, PREVIEW_MAX_WIDTH)
    const height = Math.max(
      1,
      Math.round((width * image.naturalHeight) / image.naturalWidth),
    )
    return drawToCanvas(image, width, height).toDataURL("image/jpeg", 0.85)
  }, [image])

  const placeholder = useMemo(
    () => (image ? buildPlaceholder(image, width, quality) : null),
    [image, width, quality],
  )

  async function handleFiles(files: File[]) {
    const file = files[0]
    if (!file) return
    setError(null)
    try {
      const loaded = await loadImageFromFile(file)
      setImage(loaded)
      setFileName(file.name)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not read that image.",
      )
    }
  }

  function reset() {
    setImage(null)
    setFileName("")
    setError(null)
  }

  return (
    <div className="space-y-5">
      {!image && (
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          hint="PNG, JPEG, WebP, or GIF"
        />
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {image && placeholder && (
        <div className="space-y-5">
          <p className="text-sm font-medium">
            {fileName} ({image.naturalWidth} by {image.naturalHeight} pixels)
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <span className="text-sm font-medium">Placeholder width: {width} px</span>
              <Slider
                aria-label="Placeholder width in pixels"
                className="mt-2"
                min={8}
                max={64}
                step={1}
                value={[width]}
                onValueChange={(value) =>
                  setWidth(Array.isArray(value) ? value[0] : value)
                }
              />
            </div>
            <div>
              <span className="text-sm font-medium">
                Quality: {Math.round(quality * 100)}%
              </span>
              <Slider
                aria-label="JPEG quality"
                className="mt-2"
                min={0.1}
                max={0.9}
                step={0.05}
                value={[quality]}
                onValueChange={(value) =>
                  setQuality(Array.isArray(value) ? value[0] : value)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">
                {formatBytes(placeholder.bytes)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Placeholder size</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">
                {placeholder.width} x {placeholder.height}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Placeholder pixels</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="font-mono text-lg font-semibold">
                {placeholder.dominantColor}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Dominant color</p>
            </div>
            <div className="border-border/60 flex flex-col items-center justify-center rounded-lg border p-3">
              <span
                className="border-border/60 size-8 rounded border"
                style={{ backgroundColor: placeholder.dominantColor }}
                aria-hidden
              />
              <p className="text-muted-foreground mt-1 text-xs">Swatch</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="text-sm font-medium">Blurred placeholder</span>
              <div className="border-border/60 mt-2 overflow-hidden rounded-lg border">
                <img
                  src={placeholder.dataUri}
                  alt="Blurred low quality placeholder"
                  className="block h-auto w-full"
                  style={{ filter: "blur(12px)", transform: "scale(1.05)" }}
                />
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">Full image</span>
              <div className="border-border/60 mt-2 overflow-hidden rounded-lg border">
                {fullPreview && (
                  <img
                    src={fullPreview}
                    alt="The full image at normal quality"
                    className="block h-auto w-full"
                  />
                )}
              </div>
            </div>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as string)}>
            <TabsList>
              {SNIPPET_TABS.map((entry) => (
                <TabsTrigger key={entry.value} value={entry.value}>
                  {entry.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div>
            <Label htmlFor="lqip-snippet">Snippet</Label>
            <Textarea
              id="lqip-snippet"
              name="snippet"
              readOnly
              className="mt-1.5 min-h-40 resize-y font-mono text-xs"
              value={snippetFor(tab, placeholder)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton value={snippetFor(tab, placeholder)} label="Copy snippet" />
            <CopyButton value={placeholder.dominantColor} label="Copy color" />
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="size-4" />
              Choose another image
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
