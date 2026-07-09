import { useState } from "react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { CopyButton } from "@/components/tool/CopyButton"
import { Button } from "@/components/ui/button"
import { detectFileSignature, toHexDump, type FileSignature } from "@/lib/file-signatures"

export default function FileSignatureInspector() {
  const [file, setFile] = useState<File | null>(null)
  const [hexDump, setHexDump] = useState("")
  const [signature, setSignature] = useState<FileSignature | null>(null)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setFile(selected)
    const bytes = new Uint8Array(await selected.slice(0, 256).arrayBuffer())
    setHexDump(toHexDump(bytes, 256))
    setSignature(detectFileSignature(bytes))
  }

  return (
    <div className="space-y-5">
      {!file && <FileDropZone accept="*/*" onFiles={handleFile} hint="Any file" />}

      {file && (
        <div className="space-y-4">
          <p className="truncate text-sm font-medium">{file.name}</p>

          <p className="text-sm">
            Matching signature:{" "}
            <span className="font-medium">
              {signature
                ? `${signature.name} (${signature.mimeType})`
                : "None recognized"}
            </span>
          </p>

          <pre className="border-border/60 overflow-x-auto rounded-lg border p-3 font-mono text-xs whitespace-pre">
            {hexDump}
          </pre>

          <div className="flex flex-wrap gap-2">
            <CopyButton value={hexDump} label="Copy hex dump" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setHexDump("")
                setSignature(null)
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
