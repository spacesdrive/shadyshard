import { useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { stripPdfMetadata, pdfBytesToBlob } from "@/lib/pdf"

export default function PdfMetadataRemover() {
  const [file, setFile] = useState<File | null>(null)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  function handleFile(files: File[]) {
    setError(null)
    setDone(false)
    setFile(files[0])
  }

  async function getCleanedBlob() {
    if (!file) return null
    setProcessing(true)
    setError(null)
    try {
      const bytes = await stripPdfMetadata(file)
      setDone(true)
      return pdfBytesToBlob(bytes)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove this PDF's metadata.")
      return null
    } finally {
      setProcessing(false)
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
          <p className="text-sm font-medium">{file.name}</p>

          {done && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Metadata removed. Download the cleaned file below.</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={getCleanedBlob}
              filename={`${file.name.replace(/\.pdf$/i, "")}-clean.pdf`}
              label={processing ? "Removing metadata..." : "Remove metadata and download"}
              disabled={processing}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setDone(false)
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
