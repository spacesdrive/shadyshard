import { useState } from "react"
import { FileCheck2 } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { Button } from "@/components/ui/button"
import { detectFileSignature, type FileSignature } from "@/lib/file-signatures"

export default function MimeTypeInspector() {
  const [file, setFile] = useState<File | null>(null)
  const [signature, setSignature] = useState<FileSignature | null>(null)
  const [checked, setChecked] = useState(false)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setFile(selected)
    setChecked(false)
    const bytes = new Uint8Array(await selected.slice(0, 64).arrayBuffer())
    setSignature(detectFileSignature(bytes))
    setChecked(true)
  }

  return (
    <div className="space-y-5">
      {!file && <FileDropZone accept="*/*" onFiles={handleFile} hint="Any file" />}

      {file && checked && (
        <div className="space-y-4">
          <p className="truncate text-sm font-medium">{file.name}</p>

          <div className="border-border/60 flex items-start gap-3 rounded-lg border p-4">
            <FileCheck2 className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div>
              {signature ? (
                <>
                  <p className="font-medium">{signature.name}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    MIME type: <code className="font-mono">{signature.mimeType}</code>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Typical extension: .{signature.extension}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">Signature not recognized</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Browser-reported type:{" "}
                    <code className="font-mono">{file.type || "unknown"}</code>
                  </p>
                </>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null)
              setSignature(null)
              setChecked(false)
            }}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
