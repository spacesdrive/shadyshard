import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { splitPdfEvery, pdfBytesToBlob, countPdfPages } from "@/lib/pdf"

interface SplitResult {
  bytes: Uint8Array
  startPage: number
  endPage: number
}

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [pagesPerFile, setPagesPerFile] = useState("1")
  const [results, setResults] = useState<SplitResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setResults([])
    setFile(selected)
    try {
      setTotalPages(await countPdfPages(selected))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this PDF.")
      setFile(null)
    }
  }

  async function handleSplit() {
    if (!file) return
    const perFile = Number(pagesPerFile)
    if (!Number.isInteger(perFile) || perFile < 1) {
      setError("Enter a whole number of at least 1 for pages per file.")
      return
    }
    setProcessing(true)
    setError(null)
    try {
      setResults(await splitPdfEvery(file, perFile))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not split this PDF.")
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
          <p className="text-sm">
            <span className="font-medium">{file.name}</span> - {totalPages} page
            {totalPages === 1 ? "" : "s"}
          </p>

          <div className="w-40">
            <Label htmlFor="pdf-split-per-file">Pages per file</Label>
            <Input
              id="pdf-split-per-file"
              name="pagesPerFile"
              type="number"
              min="1"
              max={totalPages}
              value={pagesPerFile}
              onChange={(e) => setPagesPerFile(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSplit} disabled={processing}>
              {processing ? "Splitting..." : "Split PDF"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setTotalPages(null)
                setResults([])
              }}
            >
              Reset
            </Button>
          </div>

          {results.length > 0 && (
            <ul className="space-y-2">
              {results.map((result, index) => (
                <li
                  key={index}
                  className="border-border/60 flex items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                >
                  <span>
                    Pages {result.startPage}-{result.endPage}
                  </span>
                  <DownloadButton
                    getBlob={() => pdfBytesToBlob(result.bytes)}
                    filename={`${file.name.replace(/\.pdf$/i, "")}-part-${index + 1}.pdf`}
                    label="Download"
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
