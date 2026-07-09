import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { compressPdf, pdfBytesToBlob } from "@/lib/pdf"
import { formatBytes } from "@/lib/image"

export default function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [compressedSize, setCompressedSize] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setFile(selected)
    setCompressedSize(null)
  }

  async function getCompressedBlob() {
    if (!file) return null
    setProcessing(true)
    setError(null)
    try {
      const bytes = await compressPdf(file)
      setCompressedSize(bytes.byteLength)
      return pdfBytesToBlob(bytes)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not compress this PDF.")
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
          <div className="grid grid-cols-2 gap-3">
            <div className="border-border/60 rounded-lg border p-4 text-center">
              <p className="text-lg font-semibold tabular-nums">
                {formatBytes(file.size)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Original</p>
            </div>
            <div className="border-border/60 rounded-lg border p-4 text-center">
              <p className="text-lg font-semibold text-emerald-500 tabular-nums">
                {compressedSize !== null ? formatBytes(compressedSize) : "-"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Compressed</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={getCompressedBlob}
              filename={`${file.name.replace(/\.pdf$/i, "")}-compressed.pdf`}
              label={processing ? "Compressing..." : "Compress and download"}
              disabled={processing}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setCompressedSize(null)
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
