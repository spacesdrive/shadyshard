import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { Button } from "@/components/ui/button"
import { loadPdfjsDocument, renderPageToCanvas, canvasToPngBlob } from "@/lib/pdf-render"

export default function PdfThumbnailViewer() {
  const [file, setFile] = useState<File | null>(null)
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const thumbnailUrlsRef = useRef(thumbnailUrls)
  thumbnailUrlsRef.current = thumbnailUrls

  useEffect(() => {
    return () => {
      thumbnailUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  async function handleFile(files: File[]) {
    const selected = files[0]
    setFile(selected)
    setError(null)
    setThumbnailUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url))
      return []
    })
    setLoading(true)
    try {
      const pdfDoc = await loadPdfjsDocument(selected)
      const urls: string[] = []
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const canvas = await renderPageToCanvas(pdfDoc, i, 0.4)
        const blob = await canvasToPngBlob(canvas)
        urls.push(URL.createObjectURL(blob))
      }
      setThumbnailUrls(urls)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not render this PDF.")
      setFile(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {!file && (
        <FileDropZone accept="application/pdf" onFiles={handleFile} hint="One PDF file" />
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div className="space-y-4">
          <p className="truncate text-sm font-medium">{file.name}</p>

          {loading && <p className="text-muted-foreground text-sm">Rendering pages...</p>}

          {thumbnailUrls.length > 0 && (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {thumbnailUrls.map((url, index) => (
                <li key={index} className="flex flex-col items-center gap-1">
                  <img
                    src={url}
                    alt={`Page ${index + 1} thumbnail`}
                    className="border-border/60 aspect-[3/4] w-full rounded border object-cover"
                  />
                  <span className="text-muted-foreground text-xs">{index + 1}</span>
                </li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null)
              setThumbnailUrls((prev) => {
                prev.forEach((url) => URL.revokeObjectURL(url))
                return []
              })
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
