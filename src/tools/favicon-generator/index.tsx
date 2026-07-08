import { useState } from "react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { loadImageFromFile, drawToCanvas, canvasToBlob } from "@/lib/image"

const SIZES = [16, 32, 48, 180, 192, 512]

export default function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [previews, setPreviews] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    try {
      const img = await loadImageFromFile(selected)
      const next: Record<number, string> = {}
      for (const size of SIZES) {
        next[size] = drawToCanvas(img, size, size).toDataURL()
      }
      setFile(selected)
      setPreviews(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this image.")
    }
  }

  async function getBlobForSize(size: number) {
    if (!file) return null
    const img = await loadImageFromFile(file)
    const canvas = drawToCanvas(img, size, size)
    return canvasToBlob(canvas, "image/png")
  }

  return (
    <div className="space-y-6">
      {!file && (
        <FileDropZone
          accept="image/*"
          onFiles={handleFile}
          hint="A square image works best"
        />
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {file && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {SIZES.map((size) => (
              <div
                key={size}
                className="border-border/60 flex flex-col items-center gap-2 rounded-lg border p-4"
              >
                <img
                  src={previews[size]}
                  alt={`${size} by ${size} favicon preview`}
                  className="border-border/60 rounded border"
                  style={{ width: Math.min(size, 64), height: Math.min(size, 64) }}
                />
                <span className="text-muted-foreground text-xs">
                  {size}&times;{size}
                </span>
                <DownloadButton
                  getBlob={() => getBlobForSize(size)}
                  filename={`favicon-${size}x${size}.png`}
                  label="Download"
                />
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null)
              setPreviews({})
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
