import { useState } from "react"
import { AlertCircle, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { formatBytes } from "@/lib/image"

const INLINE_WARNING_BYTES = 8 * 1024

interface Encoded {
  name: string
  mimeType: string
  originalBytes: number
  base64: string
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

function extensionFor(mimeType: string): string {
  const subtype = mimeType.split("/")[1] ?? "png"
  return subtype === "svg+xml" ? "svg" : subtype.replace(/[^a-z0-9]/g, "") || "png"
}

interface Decoded {
  blob: Blob
  mimeType: string
  previewUri: string
}

function decodeToBlob(input: string): Decoded {
  const trimmed = input.trim()
  const match = trimmed.match(/^data:([^;,]+)?(;base64)?,/i)
  const mimeType = match?.[1] ?? "image/png"
  const payload = (match ? trimmed.slice(match[0].length) : trimmed).replace(/\s+/g, "")

  let binary: string
  try {
    binary = atob(payload)
  } catch {
    throw new Error(
      "This is not valid Base64. Paste the whole data URI, or just the Base64 that follows the comma.",
    )
  }

  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return {
    blob: new Blob([bytes], { type: mimeType }),
    mimeType,
    previewUri: `data:${mimeType};base64,${payload}`,
  }
}

interface SnippetProps {
  id: string
  label: string
  value: string
}

function Snippet({ id, label, value }: SnippetProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <CopyButton value={value} label={`Copy ${label}`} size="icon-sm" />
      </div>
      <Textarea
        id={id}
        name={id}
        value={value}
        readOnly
        className="min-h-20 resize-y font-mono text-xs"
      />
    </div>
  )
}

export default function ImageToBase64() {
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [encoded, setEncoded] = useState<Encoded | null>(null)
  const [decodeInput, setDecodeInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleFile(files: File[]) {
    const file = files[0]
    setError(null)
    if (!file.type.startsWith("image/")) {
      setError(`This file is ${file.type || "of an unknown type"}, not an image.`)
      return
    }
    try {
      const dataUri = await readAsDataUri(file)
      setEncoded({
        name: file.name,
        mimeType: file.type,
        originalBytes: file.size,
        base64: dataUri.slice(dataUri.indexOf(",") + 1),
        dataUri,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this file.")
    }
  }

  let decoded: Decoded | null = null
  let decodeError: string | null = null
  if (mode === "decode" && decodeInput.trim()) {
    try {
      decoded = decodeToBlob(decodeInput)
    } catch (e) {
      decodeError = e instanceof Error ? e.message : "Could not decode this input."
    }
  }

  return (
    <div className="space-y-5">
      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as "encode" | "decode")
          setError(null)
        }}
      >
        <TabsList>
          <TabsTrigger value="encode">Image to Base64</TabsTrigger>
          <TabsTrigger value="decode">Base64 to image</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mode === "encode" && (
        <div className="space-y-5">
          {!encoded ? (
            <FileDropZone
              accept="image/*"
              onFiles={handleFile}
              hint="PNG, JPEG, WebP, GIF, or SVG"
            />
          ) : (
            <>
              <div className="border-border/60 flex flex-wrap items-center gap-4 rounded-lg border p-4">
                <img
                  src={encoded.dataUri}
                  alt={`Preview of ${encoded.name}`}
                  className="bg-muted size-16 rounded object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{encoded.name}</p>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {formatBytes(encoded.originalBytes)} original,{" "}
                    {formatBytes(encoded.dataUri.length)} as a data URI, an increase of{" "}
                    {Math.round(
                      (encoded.dataUri.length / encoded.originalBytes - 1) * 100,
                    )}{" "}
                    percent
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEncoded(null)}>
                  <Trash2 className="size-4" />
                  Choose another
                </Button>
              </div>

              {encoded.originalBytes > INLINE_WARNING_BYTES && (
                <p className="text-muted-foreground text-sm">
                  At {formatBytes(encoded.originalBytes)} this image is large enough that
                  inlining it will usually cost more than the request it saves. Consider
                  linking to it as a separate file instead.
                </p>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <Snippet id="image-to-base64-raw" label="Base64" value={encoded.base64} />
                <Snippet
                  id="image-to-base64-datauri"
                  label="Data URI"
                  value={encoded.dataUri}
                />
                <Snippet
                  id="image-to-base64-css"
                  label="CSS"
                  value={`background-image: url("${encoded.dataUri}");`}
                />
                <Snippet
                  id="image-to-base64-html"
                  label="HTML"
                  value={`<img src="${encoded.dataUri}" alt="" />`}
                />
                <Snippet
                  id="image-to-base64-markdown"
                  label="Markdown"
                  value={`![](${encoded.dataUri})`}
                />
              </div>
            </>
          )}
        </div>
      )}

      {mode === "decode" && (
        <div className="space-y-5">
          <div>
            <Label htmlFor="image-to-base64-decode">Data URI or Base64</Label>
            <Textarea
              id="image-to-base64-decode"
              name="decodeInput"
              value={decodeInput}
              onChange={(event) => setDecodeInput(event.target.value)}
              placeholder="data:image/png;base64,iVBORw0KGgo..."
              className="mt-1.5 min-h-40 resize-y font-mono text-xs"
              spellCheck={false}
            />
          </div>

          {decodeError && <p className="text-destructive text-sm">{decodeError}</p>}

          {decoded && (
            <div className="border-border/60 flex flex-wrap items-center gap-4 rounded-lg border p-4">
              <img
                src={decoded.previewUri}
                alt="Decoded image preview"
                className="bg-muted size-16 rounded object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{decoded.mimeType}</p>
                <p className="text-muted-foreground text-xs tabular-nums">
                  {formatBytes(decoded.blob.size)} decoded
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <DownloadButton
                  getBlob={() => decoded?.blob ?? null}
                  filename={`decoded.${extensionFor(decoded.mimeType)}`}
                />
                <Button variant="outline" size="sm" onClick={() => setDecodeInput("")}>
                  <Trash2 className="size-4" />
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
