import { useState } from "react"
import { ArrowUp, ArrowDown, Trash2, AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { mergePdfs, pdfBytesToBlob } from "@/lib/pdf"
import { formatBytes } from "@/lib/image"

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  function addFiles(newFiles: File[]) {
    setError(null)
    setFiles((prev) => [...prev, ...newFiles])
  }

  function moveFile(index: number, direction: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function getMergedBlob() {
    if (files.length < 2) return null
    setProcessing(true)
    setError(null)
    try {
      const bytes = await mergePdfs(files)
      return pdfBytesToBlob(bytes)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not merge these PDFs.")
      return null
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-5">
      <FileDropZone
        accept="application/pdf"
        multiple
        onFiles={addFiles}
        hint="Two or more PDF files"
      />

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="border-border/60 flex items-center justify-between gap-2 rounded-lg border p-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs">{formatBytes(file.size)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move ${file.name} up`}
                  disabled={index === 0}
                  onClick={() => moveFile(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move ${file.name} down`}
                  disabled={index === files.length - 1}
                  onClick={() => moveFile(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <DownloadButton
          getBlob={getMergedBlob}
          filename="merged.pdf"
          label={processing ? "Merging..." : "Merge and download"}
          disabled={files.length < 2 || processing}
        />
        {files.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setFiles([])}>
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
