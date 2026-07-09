import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { extractPdfText } from "@/lib/pdf-render"

export default function PdfTextExtractor() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setFile(selected)
    setError(null)
    setText("")
    setProcessing(true)
    try {
      const pages = await extractPdfText(selected)
      setText(
        pages
          .map((page, i) => `--- Page ${i + 1} ---\n${page.trim() || "(no text found)"}`)
          .join("\n\n"),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not extract text from this PDF.")
      setFile(null)
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
          <p className="truncate text-sm font-medium">{file.name}</p>

          <Textarea
            id="pdf-text-extractor-output"
            name="extractedText"
            value={processing ? "Extracting text..." : text}
            readOnly
            className="min-h-64 resize-y font-mono text-sm"
            aria-label="Extracted PDF text"
          />

          <div className="flex flex-wrap gap-2">
            <CopyButton value={text} label="Copy text" />
            <DownloadButton
              getBlob={() => new Blob([text], { type: "text/plain" })}
              filename={`${file.name.replace(/\.pdf$/i, "")}.txt`}
              label="Download .txt"
              disabled={!text}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setText("")
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
