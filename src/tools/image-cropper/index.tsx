import { useRef, useState, type PointerEvent } from "react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { loadImageFromFile, canvasToBlob } from "@/lib/image"

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageCropper() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
  const [selection, setSelection] = useState<Rect | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    try {
      const img = await loadImageFromFile(selected)
      setFile(selected)
      setImageUrl(URL.createObjectURL(selected))
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
      setSelection(null)
      setCroppedUrl(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this image.")
    }
  }

  function relativePosition(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: Math.min(Math.max(e.clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(e.clientY - rect.top, 0), rect.height),
    }
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    const pos = relativePosition(e)
    setDragStart(pos)
    setSelection({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragStart) return
    const pos = relativePosition(e)
    setSelection({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      width: Math.abs(pos.x - dragStart.x),
      height: Math.abs(pos.y - dragStart.y),
    })
  }

  function handlePointerUp() {
    setDragStart(null)
  }

  async function handleCrop() {
    if (
      !file ||
      !selection ||
      !imgRef.current ||
      selection.width < 1 ||
      selection.height < 1
    )
      return
    const displayed = imgRef.current
    const scaleX = naturalSize.width / displayed.clientWidth
    const scaleY = naturalSize.height / displayed.clientHeight

    const sourceX = selection.x * scaleX
    const sourceY = selection.y * scaleY
    const sourceWidth = selection.width * scaleX
    const sourceHeight = selection.height * scaleY

    const img = await loadImageFromFile(file)
    const canvas = document.createElement("canvas")
    canvas.width = sourceWidth
    canvas.height = sourceHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight,
    )
    setCroppedUrl(canvas.toDataURL())
  }

  async function getCroppedBlob(): Promise<Blob | null> {
    if (!file || !selection || !imgRef.current) return null
    const displayed = imgRef.current
    const scaleX = naturalSize.width / displayed.clientWidth
    const scaleY = naturalSize.height / displayed.clientHeight
    const img = await loadImageFromFile(file)
    const canvas = document.createElement("canvas")
    canvas.width = selection.width * scaleX
    canvas.height = selection.height * scaleY
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(
      img,
      selection.x * scaleX,
      selection.y * scaleY,
      selection.width * scaleX,
      selection.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    return canvasToBlob(canvas, file.type || "image/png")
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

      {file && imageUrl && (
        <div className="space-y-4">
          <div
            className="relative inline-block max-w-full touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Drag to select the area to crop"
              className="border-border/60 max-h-96 max-w-full rounded-lg border"
              draggable={false}
            />
            {selection && (
              <div
                className="border-primary bg-primary/20 pointer-events-none absolute border-2"
                style={{
                  left: selection.x,
                  top: selection.y,
                  width: selection.width,
                  height: selection.height,
                }}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleCrop}
              disabled={!selection || selection.width < 1 || selection.height < 1}
            >
              Crop
            </Button>
            <DownloadButton
              getBlob={getCroppedBlob}
              filename={`cropped-${file.name}`}
              disabled={!croppedUrl}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setImageUrl(null)
                setSelection(null)
                setCroppedUrl(null)
              }}
            >
              Reset
            </Button>
          </div>

          {croppedUrl && (
            <img
              src={croppedUrl}
              alt="Cropped result"
              className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
            />
          )}
        </div>
      )}
    </div>
  )
}
