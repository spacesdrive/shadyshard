import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { formatBytes } from "@/lib/image"

const SNIPPET_FORMATS = [
  { value: "datauri", label: "Data URI" },
  { value: "raw", label: "Raw Base64 only" },
  { value: "html", label: "HTML img tag" },
  { value: "css", label: "CSS background-image" },
  { value: "markdown", label: "Markdown image" },
]

interface EncodedImage {
  name: string
  originalBytes: number
  dataUri: string
}

function readAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read this file."))
    reader.readAsDataURL(file)
  })
}

function buildSnippet(encoded: EncodedImage, format: string): string {
  const base64 = encoded.dataUri.slice(encoded.dataUri.indexOf(",") + 1)
  switch (format) {
    case "raw":
      return base64
    case "html":
      return `<img src="${encoded.dataUri}" alt="${encoded.name}" />`
    case "css":
      return `background-image: url("${encoded.dataUri}");`
    case "markdown":
      return `![${encoded.name}](${encoded.dataUri})`
    default:
      return encoded.dataUri
  }
}

export default function ImageToBase64() {
  const [encoded, setEncoded] = useState<EncodedImage | null>(null)
  const [format, setFormat] = useState("datauri")
  const [error, setError] = useState<string | null>(null)

  async function handleFile(files: File[]) {
    const file = files[0]
    setError(null)

    if (!file.type.startsWith("image/")) {
      setEncoded(null)
      setError(
        `"${file.name}" does not look like an image. Choose a PNG, JPG, WebP, GIF, SVG, or ICO file.`,
      )
      return
    }

    try {
      setEncoded({
        name: file.name,
        originalBytes: file.size,
        dataUri: await readAsDataUri(file),
      })
    } catch {
      setEncoded(null)
      setError("Could not read this file.")
    }
  }

  const snippet = encoded ? buildSnippet(encoded, format) : ""

  return (
    <div className="space-y-5">
      {!encoded && (
        <FileDropZone
          accept="image/*"
          onFiles={handleFile}
          hint="PNG, JPG, WebP, GIF, SVG, or ICO"
        />
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {encoded && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={encoded.dataUri}
              alt={`Preview of ${encoded.name}`}
              className="border-border/60 h-24 w-24 shrink-0 rounded-lg border object-contain p-2"
            />
            <div className="min-w-0 space-y-1 text-sm">
              <p className="truncate font-medium">{encoded.name}</p>
              <p className="text-muted-foreground">
                {formatBytes(encoded.originalBytes)} original,{" "}
                {formatBytes(encoded.dataUri.length)} encoded
              </p>
              <p className="text-muted-foreground text-xs">
                {encoded.originalBytes > 0
                  ? `${Math.round((encoded.dataUri.length / encoded.originalBytes - 1) * 100)}% larger as text`
                  : ""}
              </p>
            </div>
          </div>

          <div className="max-w-sm">
            <Label htmlFor="base64-format">Output format</Label>
            <Select
              value={format}
              onValueChange={(next) => next && setFormat(next as string)}
            >
              <SelectTrigger id="base64-format" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SNIPPET_FORMATS.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="base64-output">Encoded output</Label>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={snippet} label="Copy" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEncoded(null)
                    setFormat("datauri")
                    setError(null)
                  }}
                >
                  Choose another image
                </Button>
              </div>
            </div>
            <Textarea
              id="base64-output"
              name="encodedOutput"
              value={snippet}
              readOnly
              className="min-h-48 resize-y font-mono text-xs break-all"
              spellCheck={false}
            />
          </div>
        </>
      )}
    </div>
  )
}
