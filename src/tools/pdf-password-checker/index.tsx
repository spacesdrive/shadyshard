import { useState } from "react"
import { Lock, LockOpen } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { Button } from "@/components/ui/button"
import { loadPdf, EncryptedPdfError } from "@/lib/pdf"

type Result = "encrypted" | "not-encrypted" | "unreadable"

export default function PdfPasswordChecker() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setFile(selected)
    setResult(null)
    try {
      await loadPdf(selected)
      setResult("not-encrypted")
    } catch (e) {
      setResult(e instanceof EncryptedPdfError ? "encrypted" : "unreadable")
    }
  }

  return (
    <div className="space-y-5">
      {!file && (
        <FileDropZone accept="application/pdf" onFiles={handleFile} hint="One PDF file" />
      )}

      {file && result && (
        <div className="space-y-4">
          <p className="truncate text-sm font-medium">{file.name}</p>

          {result === "encrypted" && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
              <Lock className="size-4 shrink-0" />
              <span>This PDF is password-protected or encrypted.</span>
            </div>
          )}
          {result === "not-encrypted" && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              <LockOpen className="size-4 shrink-0" />
              <span>This PDF is not password-protected.</span>
            </div>
          )}
          {result === "unreadable" && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
              Could not read this file as a PDF.
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null)
              setResult(null)
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
