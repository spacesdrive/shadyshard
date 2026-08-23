import { useEffect, useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { detectFileSignature } from "@/lib/file-signatures"
import { formatBytes } from "@/lib/image"

interface Decoded {
  bytes: Uint8Array<ArrayBuffer>
  declaredType: string | null
  detectedName: string | null
  detectedType: string | null
  extension: string
}

function decode(input: string): Decoded {
  const trimmed = input.trim()
  if (trimmed === "") throw new Error("Paste a Base64 string or a data URI.")

  let payload = trimmed
  let declaredType: string | null = null
  const dataUri = /^data:([^;,]*)(;[^,]*)?,/.exec(trimmed)
  if (dataUri) {
    if (!/;base64/i.test(dataUri[2] ?? "")) {
      throw new Error(
        "This data URI is not Base64 encoded, so there is nothing to decode.",
      )
    }
    declaredType = dataUri[1] || null
    payload = trimmed.slice(dataUri[0].length)
  }

  payload = payload.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/")
  if (payload === "") throw new Error("The Base64 payload is empty.")
  if (/[^A-Za-z0-9+/=]/.test(payload)) {
    throw new Error(
      "The string contains characters that are not part of the Base64 alphabet. Check for escaping such as backslashes or quotes.",
    )
  }
  const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")

  let binary: string
  try {
    binary = atob(padded)
  } catch {
    throw new Error("This is not a complete Base64 string. It may have been truncated.")
  }

  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index)
  }

  const signature = detectFileSignature(bytes)
  return {
    bytes,
    declaredType,
    detectedName: signature?.name ?? null,
    detectedType: signature?.mimeType ?? null,
    extension: signature?.extension ?? "bin",
  }
}

export default function Base64ToFile() {
  const [input, setInput] = useState("")
  const [filename, setFilename] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { decoded, error } = useMemo(() => {
    if (!input.trim()) return { decoded: null, error: null }
    try {
      return { decoded: decode(input), error: null }
    } catch (cause) {
      if (cause instanceof RangeError) {
        return {
          decoded: null,
          error: "This string is too large to decode in a browser tab.",
        }
      }
      return {
        decoded: null,
        error:
          cause instanceof Error ? cause.message : "This string could not be decoded.",
      }
    }
  }, [input])

  const mimeType =
    decoded?.detectedType ?? decoded?.declaredType ?? "application/octet-stream"
  const suggestedName = decoded ? `decoded.${decoded.extension}` : ""
  const effectiveName = filename.trim() || suggestedName

  useEffect(() => {
    if (!decoded || !mimeType.startsWith("image/")) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(
      new Blob([decoded.bytes as BlobPart], { type: mimeType }),
    )
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [decoded, mimeType])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="base64-file-input">Base64 or data URI</Label>
        <Textarea
          id="base64-file-input"
          name="base64"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="JVBERi0xLjQKJcfsj6IK... or data:application/pdf;base64,JVBERi0..."
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
        />
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {decoded && (
        <>
          <dl className="border-border/60 divide-border/60 grid divide-y rounded-xl border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="p-3">
              <dt className="text-muted-foreground text-xs">Decoded size</dt>
              <dd className="mt-0.5 text-sm font-medium">
                {formatBytes(decoded.bytes.length)}
              </dd>
            </div>
            <div className="p-3">
              <dt className="text-muted-foreground text-xs">Detected type</dt>
              <dd className="mt-0.5 text-sm font-medium">
                {decoded.detectedName ?? "Not a recognised binary format"}
              </dd>
            </div>
            <div className="p-3">
              <dt className="text-muted-foreground text-xs">Declared type</dt>
              <dd className="mt-0.5 text-sm font-medium">
                {decoded.declaredType ?? "None, this was not a data URI"}
              </dd>
            </div>
          </dl>

          {decoded.declaredType &&
            decoded.detectedType &&
            decoded.declaredType !== decoded.detectedType && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                The data URI claims {decoded.declaredType}, but the bytes are{" "}
                {decoded.detectedType}. The detected type is used for the download.
              </p>
            )}

          {previewUrl && (
            <div className="border-border/60 flex justify-center rounded-xl border p-4">
              <img
                src={previewUrl}
                alt="Preview of the decoded image"
                className="max-h-80 max-w-full rounded-lg"
              />
            </div>
          )}

          <div>
            <Label htmlFor="base64-file-name">Filename</Label>
            <Input
              id="base64-file-name"
              name="filename"
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              placeholder={suggestedName}
              className="mt-1.5"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={() => new Blob([decoded.bytes as BlobPart], { type: mimeType })}
              filename={effectiveName}
              label={`Download ${effectiveName}`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setFilename("")
              }}
            >
              Clear
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
