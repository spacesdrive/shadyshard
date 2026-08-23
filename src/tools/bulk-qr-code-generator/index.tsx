import { useState } from "react"
import QRCode from "qrcode"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { parseDelimited } from "@/lib/csv"
import { downloadBlob } from "@/lib/download"
import { contactSheetPdf, pdfBytesToBlob } from "@/lib/pdf"

const ERROR_LEVELS = ["L", "M", "Q", "H"] as const
type ErrorLevel = (typeof ERROR_LEVELS)[number]

const EXAMPLE = `https://example.com/table/1,Table 1
https://example.com/table/2,Table 2
https://example.com/table/3,Table 3`

interface Entry {
  value: string
  caption: string
  dataUrl: string
}

function parseEntries(text: string): { value: string; caption: string }[] {
  return parseDelimited(text, ",")
    .map((row) => ({ value: (row[0] ?? "").trim(), caption: (row[1] ?? "").trim() }))
    .filter((entry) => entry.value !== "")
}

async function buildSheet(entries: Entry[]): Promise<Blob> {
  return pdfBytesToBlob(
    await contactSheetPdf(
      entries.map((entry) => ({
        dataUrl: entry.dataUrl,
        caption: entry.caption || entry.value,
      })),
    ),
  )
}

export default function BulkQrCodeGenerator() {
  const [input, setInput] = useState("")
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M")
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  async function generate() {
    const parsed = parseEntries(input)
    setError(null)
    setEntries([])

    if (parsed.length === 0) {
      setError("Add at least one line with a value to encode.")
      return
    }

    setWorking(true)
    try {
      const generated: Entry[] = []
      for (const entry of parsed) {
        const dataUrl = await QRCode.toDataURL(entry.value, {
          width: size,
          errorCorrectionLevel: errorLevel,
          margin: 2,
        })
        generated.push({ ...entry, dataUrl })
      }
      setEntries(generated)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `One of the values could not be encoded: ${cause.message}`
          : "One of the values could not be encoded as a QR code.",
      )
    } finally {
      setWorking(false)
    }
  }

  function reset() {
    setInput("")
    setEntries([])
    setError(null)
  }

  function downloadPng(entry: Entry) {
    const binary = atob(entry.dataUrl.slice(entry.dataUrl.indexOf(",") + 1))
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index++)
      bytes[index] = binary.charCodeAt(index)
    const name = (entry.caption || entry.value)
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .slice(0, 60)
    downloadBlob(
      new Blob([bytes as BlobPart], { type: "image/png" }),
      `${name || "qr-code"}.png`,
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="bulk-qr-input">Values, one per line</Label>
        <Textarea
          id="bulk-qr-input"
          name="values"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={"https://example.com/a\nhttps://example.com/b,Second label"}
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1.5 text-sm">
          Add a comma and a caption to label a code. Wrap a value containing a comma in
          double quotes.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Code size</span>
            <span className="text-muted-foreground text-sm tabular-nums">{size}px</span>
          </div>
          <Slider
            aria-label="QR code size in pixels"
            className="mt-2"
            min={128}
            max={512}
            step={32}
            value={[size]}
            onValueChange={(value) => setSize(Array.isArray(value) ? value[0] : value)}
          />
        </div>
        <div>
          <span className="text-sm font-medium">Error correction</span>
          <div
            className="mt-2 flex gap-1.5"
            role="group"
            aria-label="Error correction level"
          >
            {ERROR_LEVELS.map((level) => (
              <Button
                key={level}
                variant={level === errorLevel ? "default" : "outline"}
                size="sm"
                onClick={() => setErrorLevel(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void generate()} disabled={working}>
          {working ? "Generating..." : "Generate codes"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setInput(EXAMPLE)}>
          Load example
        </Button>
        {entries.length > 0 && (
          <DownloadButton
            getBlob={() => buildSheet(entries)}
            filename="qr-codes.pdf"
            label="Download PDF sheet"
          />
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={!input && !entries.length}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {entries.length > 0 && (
        <>
          <p className="text-muted-foreground text-sm">
            {entries.length} {entries.length === 1 ? "code" : "codes"} generated.
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {entries.map((entry, index) => (
              <li
                key={`${entry.value}-${index}`}
                className="border-border/60 flex flex-col items-center gap-2 rounded-xl border p-3"
              >
                <img
                  src={entry.dataUrl}
                  alt={`QR code for ${entry.caption || entry.value}`}
                  className="w-full max-w-32 rounded bg-white"
                />
                <p className="w-full truncate text-center text-xs" title={entry.value}>
                  {entry.caption || entry.value}
                </p>
                <Button variant="outline" size="sm" onClick={() => downloadPng(entry)}>
                  PNG
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
