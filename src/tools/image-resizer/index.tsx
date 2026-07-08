import { useState } from "react"
import { Lock, Unlock } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { loadImageFromFile, drawToCanvas, canvasToBlob } from "@/lib/image"
import { downloadBlob } from "@/lib/download"

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null)
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [locked, setLocked] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    try {
      const img = await loadImageFromFile(selected)
      setFile(selected)
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
      setWidth(img.naturalWidth)
      setHeight(img.naturalHeight)
      setPreviewUrl(null)
      setResizedBlob(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this image.")
    }
  }

  function handleWidthChange(value: number) {
    setWidth(value)
    if (locked && naturalSize.width) {
      setHeight(Math.round((value * naturalSize.height) / naturalSize.width))
    }
  }

  function handleHeightChange(value: number) {
    setHeight(value)
    if (locked && naturalSize.height) {
      setWidth(Math.round((value * naturalSize.width) / naturalSize.height))
    }
  }

  async function handleResize() {
    if (!file || !width || !height) return
    const img = await loadImageFromFile(file)
    const canvas = drawToCanvas(img, width, height)
    setPreviewUrl(canvas.toDataURL())
    setResizedBlob(await canvasToBlob(canvas, file.type || "image/png"))
  }

  return (
    <div className="space-y-6">
      {!file && (
        <FileDropZone
          accept="image/*"
          onFiles={handleFile}
          hint="Any common image format"
        />
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {file && (
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div>
              <Label htmlFor="image-resizer-width">Width</Label>
              <Input
                id="image-resizer-width"
                name="width"
                type="number"
                min={1}
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
              onClick={() => setLocked((v) => !v)}
              className="mb-0.5"
            >
              {locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
            </Button>
            <div>
              <Label htmlFor="image-resizer-height">Height</Label>
              <Input
                id="image-resizer-height"
                name="height"
                type="number"
                min={1}
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleResize} disabled={!width || !height}>
              Resize
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!resizedBlob}
              onClick={() => {
                if (resizedBlob) downloadBlob(resizedBlob, `resized-${file.name}`)
              }}
            >
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setPreviewUrl(null)
                setResizedBlob(null)
              }}
            >
              Reset
            </Button>
          </div>

          {previewUrl && (
            <img
              src={previewUrl}
              alt={`Resized preview at ${width} by ${height} pixels`}
              className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
            />
          )}
        </div>
      )}
    </div>
  )
}
