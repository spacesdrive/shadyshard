import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react"
import { AlertCircle, Trash2, Undo2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { loadImageFromFile, canvasToBlob, formatBytes } from "@/lib/image"

type RedactionMode = "black" | "blur" | "pixelate"

interface Region {
  id: number
  x: number
  y: number
  width: number
  height: number
  mode: RedactionMode
  strength: number
}

const MODES: { value: RedactionMode; label: string }[] = [
  { value: "black", label: "Black box" },
  { value: "blur", label: "Blur" },
  { value: "pixelate", label: "Pixelate" },
]

function applyRegion(
  target: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  region: Region,
) {
  const { x, y, width, height, mode, strength } = region
  if (width < 1 || height < 1) return

  if (mode === "black") {
    target.fillStyle = "#000000"
    target.fillRect(x, y, width, height)
    return
  }

  if (mode === "pixelate") {
    const blockSize = Math.max(2, strength)
    const smallWidth = Math.max(1, Math.round(width / blockSize))
    const smallHeight = Math.max(1, Math.round(height / blockSize))
    const scratch = document.createElement("canvas")
    scratch.width = smallWidth
    scratch.height = smallHeight
    const scratchContext = scratch.getContext("2d")
    if (!scratchContext) return
    scratchContext.drawImage(source, x, y, width, height, 0, 0, smallWidth, smallHeight)
    target.save()
    target.imageSmoothingEnabled = false
    target.drawImage(scratch, 0, 0, smallWidth, smallHeight, x, y, width, height)
    target.restore()
    return
  }

  target.save()
  target.beginPath()
  target.rect(x, y, width, height)
  target.clip()
  target.filter = `blur(${Math.max(1, strength)}px)`
  target.drawImage(source, 0, 0)
  target.restore()
}

export default function ImageRedactor() {
  const [file, setFile] = useState<File | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [regions, setRegions] = useState<Region[]>([])
  const [mode, setMode] = useState<RedactionMode>("black")
  const [strength, setStrength] = useState(12)
  const [draft, setDraft] = useState<Region | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manual, setManual] = useState({ x: "0", y: "0", width: "100", height: "40" })

  const sourceRef = useRef<HTMLCanvasElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const nextIdRef = useRef(1)

  const visibleRegions = useMemo(
    () => (draft ? [...regions, draft] : regions),
    [regions, draft],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const source = sourceRef.current
    if (!canvas || !source) return
    const context = canvas.getContext("2d")
    if (!context) return

    canvas.width = source.width
    canvas.height = source.height
    context.filter = "none"
    context.drawImage(source, 0, 0)
    for (const region of visibleRegions) applyRegion(context, source, region)
  }, [visibleRegions])

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    try {
      const image = await loadImageFromFile(selected)
      const source = document.createElement("canvas")
      source.width = image.naturalWidth
      source.height = image.naturalHeight
      const context = source.getContext("2d")
      if (!context) throw new Error("Canvas 2D context is not available.")
      context.drawImage(image, 0, 0)
      sourceRef.current = source
      setFile(selected)
      setSize({ width: image.naturalWidth, height: image.naturalHeight })
      setRegions([])
      setDraft(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read this image.")
    }
  }

  function toImageCoordinates(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * size.width,
      y: ((event.clientY - rect.top) / rect.height) * size.height,
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (!sourceRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartRef.current = toImageCoordinates(event)
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const start = dragStartRef.current
    if (!start) return
    const current = toImageCoordinates(event)
    setDraft({
      id: 0,
      x: Math.round(Math.min(start.x, current.x)),
      y: Math.round(Math.min(start.y, current.y)),
      width: Math.round(Math.abs(current.x - start.x)),
      height: Math.round(Math.abs(current.y - start.y)),
      mode,
      strength,
    })
  }

  function handlePointerUp() {
    dragStartRef.current = null
    setDraft((current) => {
      if (current && current.width >= 2 && current.height >= 2) {
        setRegions((existing) => [...existing, { ...current, id: nextIdRef.current++ }])
      }
      return null
    })
  }

  function addManualRegion() {
    const x = Number(manual.x)
    const y = Number(manual.y)
    const width = Number(manual.width)
    const height = Number(manual.height)
    if (![x, y, width, height].every(Number.isFinite) || width < 1 || height < 1) {
      setError("Enter whole numbers, with a width and height of at least 1 pixel.")
      return
    }
    setError(null)
    setRegions((existing) => [
      ...existing,
      { id: nextIdRef.current++, x, y, width, height, mode, strength },
    ])
  }

  if (!file) {
    return (
      <div className="space-y-4">
        <FileDropZone
          accept="image/*"
          onFiles={handleFile}
          hint="PNG, JPEG, WebP, or GIF. The file stays in your browser."
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="truncate">{file.name}</span>
        <span className="tabular-nums">
          {size.width} x {size.height}
        </span>
        <span className="tabular-nums">{formatBytes(file.size)}</span>
      </div>

      <div>
        <span className="text-sm font-medium">Redaction style</span>
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as RedactionMode)}
          className="mt-1.5"
        >
          <TabsList>
            {MODES.map((entry) => (
              <TabsTrigger key={entry.value} value={entry.value}>
                {entry.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {mode !== "black" && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {mode === "blur" ? "Blur radius" : "Block size"}
            </span>
            <span className="text-muted-foreground text-sm tabular-nums">
              {strength}px
            </span>
          </div>
          <Slider
            aria-label={mode === "blur" ? "Blur radius" : "Pixelate block size"}
            className="mt-2"
            min={2}
            max={60}
            step={1}
            value={[strength]}
            onValueChange={(value) =>
              setStrength(Array.isArray(value) ? value[0] : value)
            }
          />
        </div>
      )}

      {mode !== "black" && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            Blur and pixelate transform the pixels rather than removing them, and text
            hidden this way has been recovered before. Use the black box for anything that
            genuinely must not be readable.
          </span>
        </div>
      )}

      <div className="border-border/60 overflow-hidden rounded-xl border">
        <canvas
          ref={canvasRef}
          className="block w-full cursor-crosshair touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="img"
          aria-label={`Redaction preview of ${file.name} with ${regions.length} regions applied`}
        />
      </div>

      <p className="text-muted-foreground text-sm">
        Drag across the image to cover an area. Each region uses the style and strength
        selected when you drew it.
      </p>

      <div className="border-border/60 rounded-lg border p-4">
        <h2 className="text-sm font-medium">Add a region by coordinates</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {(
            [
              { key: "x", label: "Left" },
              { key: "y", label: "Top" },
              { key: "width", label: "Width" },
              { key: "height", label: "Height" },
            ] as const
          ).map((field) => (
            <div key={field.key}>
              <Label htmlFor={`redactor-${field.key}`}>{field.label}</Label>
              <Input
                id={`redactor-${field.key}`}
                name={field.key}
                type="number"
                min={0}
                value={manual[field.key]}
                onChange={(event) =>
                  setManual((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                className="mt-1.5"
              />
            </div>
          ))}
        </div>
        <Button type="button" size="sm" className="mt-3" onClick={addManualRegion}>
          Add region
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {regions.length > 0 && (
        <div>
          <h2 className="text-sm font-medium">Regions</h2>
          <ul className="mt-2 space-y-1">
            {regions.map((region, index) => (
              <li
                key={region.id}
                className="border-border/60 flex items-center justify-between gap-2 rounded border px-2 py-1 text-xs"
              >
                <span className="font-mono tabular-nums">
                  {index + 1}. {region.mode} at {region.x}, {region.y} ({region.width} x{" "}
                  {region.height})
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove region ${index + 1}`}
                  onClick={() =>
                    setRegions((existing) =>
                      existing.filter((entry) => entry.id !== region.id),
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <DownloadButton
          getBlob={() =>
            canvasRef.current ? canvasToBlob(canvasRef.current, "image/png") : null
          }
          filename={`redacted-${file.name.replace(/\.[^.]+$/, "")}.png`}
          label="Download PNG"
          disabled={regions.length === 0}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={regions.length === 0}
          onClick={() => setRegions((existing) => existing.slice(0, -1))}
        >
          <Undo2 className="size-4" />
          Undo last
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={regions.length === 0}
          onClick={() => setRegions([])}
        >
          Clear regions
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            sourceRef.current = null
            setFile(null)
            setRegions([])
            setDraft(null)
            setError(null)
          }}
        >
          Choose another image
        </Button>
      </div>
    </div>
  )
}
