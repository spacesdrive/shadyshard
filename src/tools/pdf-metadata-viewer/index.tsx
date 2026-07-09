import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { Button } from "@/components/ui/button"
import { readPdfMetadata, type PdfMetadata } from "@/lib/pdf"

const FIELDS: { key: keyof PdfMetadata; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "subject", label: "Subject" },
  { key: "keywords", label: "Keywords" },
  { key: "creator", label: "Creator" },
  { key: "producer", label: "Producer" },
  { key: "creationDate", label: "Creation date" },
  { key: "modificationDate", label: "Modification date" },
]

export default function PdfMetadataViewer() {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setFile(selected)
    try {
      setMetadata(await readPdfMetadata(selected))
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

      {file && metadata && (
        <div className="space-y-4">
          <p className="text-sm font-medium">{file.name}</p>

          <dl className="divide-border/60 divide-y text-sm">
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">Page count</dt>
              <dd className="font-medium">{metadata.pageCount}</dd>
            </div>
            {FIELDS.map(({ key, label }) => (
              <div key={key} className="flex justify-between gap-4 py-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium break-all">
                  {metadata[key] || (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null)
              setMetadata(null)
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
