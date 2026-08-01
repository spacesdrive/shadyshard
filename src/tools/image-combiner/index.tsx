import { useEffect, useMemo, useState } from "react"
import { AlertCircle, ArrowDown, ArrowUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

const FORMATS: { value: string; label: string; mime: string; extension: string }[] = [
  { value: "png", label: "PNG", mime: "image/png", extension: "png" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg", extension: "jpg" },
  { value: "webp", label: "WebP", mime: "image/webp", extension: "webp" },
]

interface Entry {
  id: string
  name: string
  image: HTMLImageElement
}

interface Placement {
  entry: Entry
  x: number
  y: number
  width: number
  height: number
}

interface Layout {
  width: number
  height: number
  placements: Placement[]
}

/**
 * Horizontal joins scale every image to a common height and vertical joins to a
 * common width, so the seam between two differently sized photos lines up.
 */
function buildLayout(
  entries: Entry[],
  direction: "horizontal" | "vertical",
  gap: number,
  matchSize: boolean,
): Layout {
  const placements: Placement[] = []

  if (direction === "horizontal") {
    const target = matchSize
      ? Math.min(...entries.map((entry) => entry.image.naturalHeight))
      : 0
    let x = 0
    let maxHeight = 0

    for (const entry of entries) {
      const scale = matchSize ? target / entry.image.naturalHeight : 1
      const width = Math.round(entry.image.naturalWidth * scale)
      const height = Math.round(entry.image.naturalHeight * scale)
      placements.push({ entry, x, y: 0, width, height })
      x += width + gap
      maxHeight = Math.max(maxHeight, height)
    }

    return { width: Math.max(0, x - gap), height: maxHeight, placements }
  }

  const target = matchSize
    ? Math.min(...entries.map((entry) => entry.image.naturalWidth))
    : 0
  let y = 0
  let maxWidth = 0

  for (const entry of entries) {
    const scale = matchSize ? target / entry.image.naturalWidth : 1
    const width = Math.round(entry.image.naturalWidth * scale)
    const height = Math.round(entry.image.naturalHeight * scale)
    placements.push({ entry, x: 0, y, width, height })
    y += height + gap
    maxWidth = Math.max(maxWidth, width)
  }

  return { width: maxWidth, height: Math.max(0, y - gap), placements }
}

function render(layout: Layout, background: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, layout.width)
  canvas.height = Math.max(1, layout.height)

  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas 2D context is not available.")

  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (const placement of layout.placements) {
    context.drawImage(
      placement.entry.image,
      placement.x,
      placement.y,
      placement.width,
      placement.height,
    )
  }

  return canvas
}

export default function ImageCombiner() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [direction, setDirection] = useState<"horizontal" | "vertical">("horizontal")
  const [gap, setGap] = useState(0)
  const [matchSize, setMatchSize] = useState(true)
  const [background, setBackground] = useState("#ffffff")
  const [formatId, setFormatId] = useState("png")
  const [previewUrl, setPreviewUrl] = useState("")
  const [previewSize, setPreviewSize] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const format = FORMATS.find((entry) => entry.value === formatId) ?? FORMATS[0]

  const layout = useMemo(
    () => (entries.length > 0 ? buildLayout(entries, direction, gap, matchSize) : null),
    [entries, direction, gap, matchSize],
  )

  useEffect(() => {
    if (!layout || entries.length === 0) {
      setPreviewUrl("")
      return
    }

    let cancelled = false
    let created = ""

    canvasToBlob(render(layout, background), format.mime, 0.92)
      .then((blob) => {
        if (cancelled) return
        created = URL.createObjectURL(blob)
        setPreviewUrl(created)
        setPreviewSize(blob.size)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError("The combined image could not be rendered.")
      })

    return () => {
      cancelled = true
      if (created) URL.revokeObjectURL(created)
    }
  }, [layout, background, format.mime, entries.length])

  async function handleFiles(files: File[]) {
    setError(null)
    const loaded: Entry[] = []

    for (const file of files) {
      try {
        loaded.push({
          id: `${file.name}-${file.size}-${loaded.length}-${entries.length}`,
          name: file.name,
          image: await loadImageFromFile(file),
        })
      } catch {
        setError(`"${file.name}" could not be read as an image and was skipped.`)
      }
    }

    if (loaded.length > 0) setEntries((current) => [...current, ...loaded])
  }

  function move(index: number, offset: number) {
    setEntries((current) => {
      const next = [...current]
      const target = index + offset
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function remove(index: number) {
    setEntries((current) => current.filter((_, position) => position !== index))
  }

  return (
    <div className="space-y-5">
      <FileDropZone
        accept="image/*"
        multiple
        onFiles={handleFiles}
        hint="Select or drop two or more images, in any order"
      />

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {entries.length > 0 && (
        <div className="border-border/60 divide-border/60 divide-y rounded-lg border">
          {entries.map((entry, index) => (
            <div key={entry.id} className="flex items-center gap-2 p-2">
              <span className="text-muted-foreground w-6 shrink-0 text-center text-xs tabular-nums">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{entry.name}</span>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {entry.image.naturalWidth} x {entry.image.naturalHeight}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${entry.name} earlier`}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, 1)}
                disabled={index === entries.length - 1}
                aria-label={`Move ${entry.name} later`}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                aria-label={`Remove ${entry.name}`}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <>
          <Tabs
            value={direction}
            onValueChange={(value) => setDirection(value as "horizontal" | "vertical")}
          >
            <TabsList>
              <TabsTrigger value="horizontal">Side by side</TabsTrigger>
              <TabsTrigger value="vertical">Stacked</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="combine-gap">Gap between images (px)</Label>
              <Input
                id="combine-gap"
                name="gap"
                type="number"
                min="0"
                max="200"
                step="1"
                value={gap}
                onChange={(event) =>
                  setGap(Math.min(200, Math.max(0, Number(event.target.value) || 0)))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="combine-background">Background colour</Label>
              <Input
                id="combine-background"
                name="background"
                type="color"
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                className="mt-1.5 h-9 w-full p-1"
              />
            </div>
            <div>
              <Label htmlFor="combine-format">Output format</Label>
              <Select
                value={formatId}
                onValueChange={(value) => value && setFormatId(value as string)}
              >
                <SelectTrigger id="combine-format" className="mt-1.5 w-full">
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
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="combine-match"
              name="matchSize"
              checked={matchSize}
              onCheckedChange={setMatchSize}
            />
            <Label htmlFor="combine-match" className="font-normal">
              {direction === "horizontal"
                ? "Scale every image to the same height"
                : "Scale every image to the same width"}
            </Label>
          </div>
        </>
      )}

      {previewUrl && layout && (
        <div className="space-y-3">
          <div className="border-border/60 overflow-auto rounded-lg border p-3">
            <img
              src={previewUrl}
              alt="The combined result"
              className="mx-auto block max-w-full"
            />
          </div>
          <p className="text-muted-foreground text-sm">
            {layout.width} by {layout.height} pixels, {formatBytes(previewSize)}
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <DownloadButton
            getBlob={() =>
              layout ? canvasToBlob(render(layout, background), format.mime, 0.92) : null
            }
            filename={`combined.${format.extension}`}
            label="Download combined image"
          />
          <Button variant="outline" size="sm" onClick={() => setEntries([])}>
            Remove all
          </Button>
        </div>
      )}
    </div>
  )
}
