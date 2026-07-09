import { useState } from "react"
import { ArrowUp, ArrowDown, AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { reorderPages, pdfBytesToBlob, countPdfPages } from "@/lib/pdf"

export default function PdfPageReorder() {
  const [file, setFile] = useState<File | null>(null)
  const [order, setOrder] = useState<number[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setFile(selected)
    try {
      const total = await countPdfPages(selected)
      setOrder(Array.from({ length: total }, (_, i) => i))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this PDF.")
      setFile(null)
    }
  }

  function move(position: number, direction: -1 | 1) {
    setOrder((prev) => {
      if (!prev) return prev
      const next = [...prev]
      const target = position + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[position], next[target]] = [next[target], next[position]]
      return next
    })
  }

  async function getReorderedBlob() {
    if (!file || !order) return null
    setProcessing(true)
    setError(null)
    try {
      const bytes = await reorderPages(file, order)
      return pdfBytesToBlob(bytes)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reorder these pages.")
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

      {file && order && (
        <div className="space-y-4">
          <p className="text-sm font-medium">{file.name}</p>

          <ol className="max-h-96 space-y-2 overflow-y-auto">
            {order.map((pageIndex, position) => (
              <li
                key={pageIndex}
                className="border-border/60 flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm"
              >
                <span>Page {pageIndex + 1}</span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move page ${pageIndex + 1} up`}
                    disabled={position === 0}
                    onClick={() => move(position, -1)}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move page ${pageIndex + 1} down`}
                    disabled={position === order.length - 1}
                    onClick={() => move(position, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={getReorderedBlob}
              filename={`${file.name.replace(/\.pdf$/i, "")}-reordered.pdf`}
              label={processing ? "Reordering..." : "Reorder and download"}
              disabled={processing}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setOrder(null)
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
