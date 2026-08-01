import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { loadImageFromFile, canvasToBlob, formatBytes } from "@/lib/image"
import { downloadBlob } from "@/lib/download"

const PRESETS: { label: string; rows: number; columns: number }[] = [
  { label: "3 x 3 grid", rows: 3, columns: 3 },
  { label: "3 x 1 strip", rows: 1, columns: 3 },
  { label: "2 x 2 grid", rows: 2, columns: 2 },
  { label: "1 x 3 column", rows: 3, columns: 1 },
]

const FORMATS: { value: string; label: string; mime: string; extension: string }[] = [
  { value: "png", label: "PNG", mime: "image/png", extension: "png" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg", extension: "jpg" },
  { value: "webp", label: "WebP", mime: "image/webp", extension: "webp" },
]

interface Tile {
  row: number
  column: number
  url: string
  width: number
  height: number
  size: number
  blob: Blob
}

export default function ImageSplitter() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [baseName, setBaseName] = useState("image")
  const [rows, setRows] = useState(3)
  const [columns, setColumns] = useState(3)
  const [formatId, setFormatId] = useState("png")
  const [tiles, setTiles] = useState<Tile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  const format = FORMATS.find((entry) => entry.value === formatId) ?? FORMATS[0]

  useEffect(() => {
    return () => {
      for (const tile of tiles) URL.revokeObjectURL(tile.url)
    }
  }, [tiles])

  async function handleFile(files: File[]) {
    const file = files[0]
    setError(null)
    try {
      const loaded = await loadImageFromFile(file)
      setImage(loaded)
      setBaseName(file.name.replace(/\.[^.]+$/, "") || "image")
      setTiles([])
    } catch {
      setError("That file could not be read as an image. Try a PNG, JPEG, or WebP.")
    }
  }

  async function split() {
    if (!image) return

    setWorking(true)
    setError(null)

    try {
      const tileWidth = Math.floor(image.naturalWidth / columns)
      const tileHeight = Math.floor(image.naturalHeight / rows)

      if (tileWidth < 1 || tileHeight < 1) {
        setError(
          `A ${columns} by ${rows} split makes tiles smaller than one pixel for an image this size.`,
        )
        return
      }

      const next: Tile[] = []

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const canvas = document.createElement("canvas")
          canvas.width = tileWidth
          canvas.height = tileHeight
          const context = canvas.getContext("2d")
          if (!context) throw new Error("Canvas 2D context is not available.")

          context.drawImage(
            image,
            column * tileWidth,
            row * tileHeight,
            tileWidth,
            tileHeight,
            0,
            0,
            tileWidth,
            tileHeight,
          )

          const blob = await canvasToBlob(canvas, format.mime, 0.92)
          next.push({
            row: row + 1,
            column: column + 1,
            url: URL.createObjectURL(blob),
            width: tileWidth,
            height: tileHeight,
            size: blob.size,
            blob,
          })
        }
      }

      setTiles(next)
    } catch {
      setError("The image could not be split. It may be too large for this device.")
    } finally {
      setWorking(false)
    }
  }

  function downloadTile(tile: Tile) {
    downloadBlob(tile.blob, `${baseName}-r${tile.row}c${tile.column}.${format.extension}`)
  }

  function downloadAll() {
    for (const tile of tiles) downloadTile(tile)
  }

  function reset() {
    setImage(null)
    setTiles([])
    setError(null)
  }

  return (
    <div className="space-y-5">
      <FileDropZone
        accept="image/*"
        onFiles={handleFile}
        hint="PNG, JPEG, WebP, GIF, or AVIF"
      />

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {image && (
        <>
          <p className="text-muted-foreground text-sm">
            Loaded {image.naturalWidth} by {image.naturalHeight} pixels. Each tile will be{" "}
            {Math.floor(image.naturalWidth / columns)} by{" "}
            {Math.floor(image.naturalHeight / rows)} pixels.
          </p>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={
                  rows === preset.rows && columns === preset.columns
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => {
                  setRows(preset.rows)
                  setColumns(preset.columns)
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="split-columns">Columns</Label>
              <Input
                id="split-columns"
                name="columns"
                type="number"
                min="1"
                max="10"
                step="1"
                value={columns}
                onChange={(event) =>
                  setColumns(Math.min(10, Math.max(1, Number(event.target.value) || 1)))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="split-rows">Rows</Label>
              <Input
                id="split-rows"
                name="rows"
                type="number"
                min="1"
                max="10"
                step="1"
                value={rows}
                onChange={(event) =>
                  setRows(Math.min(10, Math.max(1, Number(event.target.value) || 1)))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="split-format">Output format</Label>
              <Select
                value={formatId}
                onValueChange={(value) => value && setFormatId(value as string)}
              >
                <SelectTrigger id="split-format" className="mt-1.5 w-full">
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

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={split} disabled={working}>
              {working ? "Splitting" : `Split into ${rows * columns} tiles`}
            </Button>
            {tiles.length > 0 && (
              <Button variant="outline" size="sm" onClick={downloadAll}>
                Download all {tiles.length} tiles
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={reset}>
              Start over
            </Button>
          </div>
        </>
      )}

      {tiles.length > 0 && (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {tiles.map((tile) => (
            <div
              key={`${tile.row}-${tile.column}`}
              className="border-border/60 overflow-hidden rounded-lg border"
            >
              <img
                src={tile.url}
                alt={`Tile in row ${tile.row}, column ${tile.column}`}
                className="block w-full"
              />
              <div className="flex items-center justify-between gap-1 p-1.5">
                <span className="text-muted-foreground truncate text-xs">
                  {formatBytes(tile.size)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadTile(tile)}
                  aria-label={`Download the tile in row ${tile.row}, column ${tile.column}`}
                >
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
