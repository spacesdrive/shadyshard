import { useState } from "react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { loadImageFromFile, drawToCanvas, canvasToBlob, formatBytes } from "@/lib/image"

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [quality, setQuality] = useState(0.8)
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    await compress(selected, quality)
  }

  async function compress(sourceFile: File, q: number) {
    try {
      const img = await loadImageFromFile(sourceFile)
      const canvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight)
      const type = sourceFile.type === "image/png" ? "image/png" : "image/jpeg"
      const blob = await canvasToBlob(canvas, type, q)
      setCompressedBlob(blob)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not compress this image.")
    }
  }

  function handleQualityChange(value: number) {
    setQuality(value)
    if (file) compress(file, value)
  }

  return (
    <div className="space-y-6">
      {!file && (
        <FileDropZone
          accept="image/jpeg,image/png,image/webp"
          onFiles={handleFile}
          hint="JPG, PNG, or WebP"
        />
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {file && previewUrl && (
        <div className="space-y-4">
          <img
            src={previewUrl}
            alt="Preview of the selected image"
            className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
          />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quality</span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <Slider
              aria-label="Compression quality"
              className="mt-2"
              min={0.1}
              max={1}
              step={0.05}
              value={[quality]}
              onValueChange={(value) =>
                handleQualityChange(Array.isArray(value) ? value[0] : value)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">
                {formatBytes(file.size)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Original</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold text-emerald-500 tabular-nums">
                {compressedBlob ? formatBytes(compressedBlob.size) : "-"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Compressed</p>
            </div>
          </div>

          <div className="flex gap-2">
            <DownloadButton
              getBlob={() => compressedBlob}
              filename={`compressed-${file.name}`}
              disabled={!compressedBlob}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setPreviewUrl(null)
                setCompressedBlob(null)
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
