import { useState } from "react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { convertImageFile } from "@/lib/image"

export default function PngToWebp() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [quality, setQuality] = useState(0.85)
  const [error, setError] = useState<string | null>(null)

  function handleFile(files: File[]) {
    setError(null)
    setFile(files[0])
    setPreviewUrl(URL.createObjectURL(files[0]))
  }

  async function getBlob() {
    if (!file) return null
    try {
      return await convertImageFile(file, "image/webp", quality)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not convert this image.")
      return null
    }
  }

  return (
    <div className="space-y-6">
      {!file && (
        <FileDropZone accept="image/png" onFiles={handleFile} hint="PNG images only" />
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {file && previewUrl && (
        <div className="space-y-4">
          <img
            src={previewUrl}
            alt="Preview of the selected PNG"
            className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
          />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">WebP quality</span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <Slider
              aria-label="WebP quality"
              className="mt-2"
              min={0.1}
              max={1}
              step={0.05}
              value={[quality]}
              onValueChange={(value) =>
                setQuality(Array.isArray(value) ? value[0] : value)
              }
            />
          </div>

          <div className="flex gap-2">
            <DownloadButton
              getBlob={getBlob}
              filename={file.name.replace(/\.png$/i, "") + ".webp"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setPreviewUrl(null)
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
