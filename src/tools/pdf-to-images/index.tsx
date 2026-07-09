import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { loadPdfjsDocument, renderPageToCanvas, canvasToPngBlob } from "@/lib/pdf-render"

export default function PdfToImages() {
  const [file, setFile] = useState<File | null>(null)
  const [scale, setScale] = useState("1.5")
  const [pageBlobs, setPageBlobs] = useState<Blob[]>([])
  const [pageUrls, setPageUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  useEffect(() => {
    const urls = pageBlobs.map((blob) => URL.createObjectURL(blob))
    setPageUrls(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [pageBlobs])

  function handleFile(files: File[]) {
    setFile(files[0])
    setPageBlobs([])
    setError(null)
  }

  async function convert() {
    if (!file) return
    setError(null)
    setPageBlobs([])
    try {
      const pdfDoc = await loadPdfjsDocument(file)
      setProgress({ done: 0, total: pdfDoc.numPages })
      const blobs: Blob[] = []
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const canvas = await renderPageToCanvas(pdfDoc, i, Number(scale))
        blobs.push(await canvasToPngBlob(canvas))
        setProgress({ done: i, total: pdfDoc.numPages })
      }
      setPageBlobs(blobs)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not convert this PDF.")
    } finally {
      setProgress(null)
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

          <div className="w-48">
            <Label htmlFor="pdf-to-images-scale">Resolution</Label>
            <Select value={scale} onValueChange={(value) => value && setScale(value)}>
              <SelectTrigger id="pdf-to-images-scale" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Standard (1x)</SelectItem>
                <SelectItem value="1.5">High (1.5x)</SelectItem>
                <SelectItem value="2">Very high (2x)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={convert} disabled={progress !== null}>
              {progress
                ? `Rendering ${progress.done}/${progress.total}...`
                : "Convert to images"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setPageBlobs([])
              }}
            >
              Reset
            </Button>
          </div>

          {progress && (
            <Progress
              value={(progress.done / progress.total) * 100}
              aria-label="Conversion progress"
            />
          )}

          {pageBlobs.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pageBlobs.map((blob, index) => (
                <li
                  key={index}
                  className="border-border/60 flex flex-col items-center gap-2 rounded-lg border p-2"
                >
                  <img
                    src={pageUrls[index]}
                    alt={`Page ${index + 1} of ${file.name}`}
                    className="max-h-40 w-full rounded object-contain"
                  />
                  <DownloadButton
                    getBlob={() => blob}
                    filename={`${file.name.replace(/\.pdf$/i, "")}-page-${index + 1}.png`}
                    label={`Page ${index + 1}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
