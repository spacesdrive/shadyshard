import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { PageRangeInput } from "@/components/tool/PageRangeInput"
import { Button } from "@/components/ui/button"
import { deletePages, pdfBytesToBlob, countPdfPages } from "@/lib/pdf"
import { parsePageRange } from "@/lib/page-range"

export default function PdfPageDeleter() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [range, setRange] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setFile(selected)
    try {
      setTotalPages(await countPdfPages(selected))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this PDF.")
      setFile(null)
    }
  }

  async function getResultBlob() {
    if (!file || totalPages === null) return null
    setProcessing(true)
    setError(null)
    try {
      const indices = parsePageRange(range, totalPages)
      if (indices.length >= totalPages) {
        setError("At least one page must remain in the output PDF.")
        return null
      }
      const bytes = await deletePages(file, indices)
      return pdfBytesToBlob(bytes)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete these pages.")
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

      {file && totalPages !== null && (
        <div className="space-y-4">
          <p className="text-sm font-medium">{file.name}</p>

          <PageRangeInput
            id="pdf-deleter-range"
            value={range}
            onChange={setRange}
            totalPages={totalPages}
            label="Pages to delete"
          />

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={getResultBlob}
              filename={`${file.name.replace(/\.pdf$/i, "")}-edited.pdf`}
              label={processing ? "Removing..." : "Remove and download"}
              disabled={!range.trim() || processing}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setTotalPages(null)
                setRange("")
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
