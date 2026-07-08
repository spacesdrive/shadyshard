import { useState } from "react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { convertImageFile } from "@/lib/image"

export default function ExifRemover() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFile(files: File[]) {
    setError(null)
    setFile(files[0])
    setPreviewUrl(URL.createObjectURL(files[0]))
  }

  async function getBlob() {
    if (!file) return null
    try {
      return await convertImageFile(file, file.type || "image/jpeg", 0.95)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not process this image.")
      return null
    }
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
            alt="Preview of the selected photo"
            className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
          />
          <p className="text-muted-foreground text-sm">
            Downloading will re-encode this image, stripping any embedded EXIF metadata.
          </p>
          <div className="flex gap-2">
            <DownloadButton getBlob={getBlob} filename={`cleaned-${file.name}`} />
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
