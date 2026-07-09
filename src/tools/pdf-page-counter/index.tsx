import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { Button } from "@/components/ui/button"
import { countPdfPages } from "@/lib/pdf"
import { formatBytes } from "@/lib/image"

export default function PdfPageCounter() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setFile(selected)
    try {
      setPageCount(await countPdfPages(selected))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this PDF.")
      setFile(null)
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

      {file && pageCount !== null && (
        <div className="space-y-4">
          <p className="truncate text-sm font-medium">{file.name}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="border-border/60 rounded-lg border p-4 text-center">
              <p className="text-2xl font-semibold tabular-nums">{pageCount}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Page{pageCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="border-border/60 rounded-lg border p-4 text-center">
              <p className="text-2xl font-semibold tabular-nums">
                {formatBytes(file.size)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">File size</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null)
              setPageCount(null)
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
