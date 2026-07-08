import { useState } from "react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { convertImageFile } from "@/lib/image"

export default function WebpToPng() {
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
      return await convertImageFile(file, "image/png")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not convert this image.")
      return null
    }
  }

  return (
    <div className="space-y-6">
      {!file && (
        <FileDropZone accept="image/webp" onFiles={handleFile} hint="WebP images only" />
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {file && previewUrl && (
        <div className="space-y-4">
          <img
            src={previewUrl}
            alt="Preview of the selected WebP"
            className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
          />
          <div className="flex gap-2">
            <DownloadButton
              getBlob={getBlob}
              filename={file.name.replace(/\.webp$/i, "") + ".png"}
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
