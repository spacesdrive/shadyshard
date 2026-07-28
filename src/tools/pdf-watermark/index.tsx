import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { PageRangeInput } from "@/components/tool/PageRangeInput"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addTextWatermark, countPdfPages, pdfBytesToBlob } from "@/lib/pdf"
import { parsePageRange } from "@/lib/page-range"

type Scope = "all" | "range"

export default function PdfWatermark() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [scope, setScope] = useState<Scope>("all")
  const [range, setRange] = useState("")
  const [text, setText] = useState("CONFIDENTIAL")
  const [fontSize, setFontSize] = useState(60)
  const [rotation, setRotation] = useState(45)
  const [opacity, setOpacity] = useState(0.2)
  const [color, setColor] = useState("#ff0000")
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setFile(selected)
    try {
      setTotalPages(await countPdfPages(selected))
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "Could not read this PDF.")
      setFile(null)
    }
  }

  async function getWatermarkedBlob() {
    if (!file || totalPages === null) return null
    if (!text.trim()) {
      setError("Enter the watermark text.")
      return null
    }
    setProcessing(true)
    setError(null)
    try {
      const targets = scope === "all" ? "all" : parsePageRange(range, totalPages)
      const bytes = await addTextWatermark(file, targets, {
        text: text.trim(),
        fontSize,
        opacity,
        rotation,
        color,
      })
      return pdfBytesToBlob(bytes)
    } catch (thrown) {
      const message =
        thrown instanceof Error ? thrown.message : "Could not watermark this PDF."
      setError(
        /encode|WinAnsi/i.test(message)
          ? "The watermark text contains characters the standard PDF font cannot encode. Use plain Latin letters, digits, and punctuation."
          : message,
      )
      return null
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
        <div className="space-y-5">
          <p className="text-sm font-medium">{file.name}</p>

          <div>
            <Label htmlFor="watermark-text">Watermark text</Label>
            <Input
              id="watermark-text"
              name="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="mt-1.5"
              maxLength={60}
            />
          </div>

          <Tabs value={scope} onValueChange={(value) => setScope(value as Scope)}>
            <TabsList>
              <TabsTrigger value="all">All pages</TabsTrigger>
              <TabsTrigger value="range">Specific pages</TabsTrigger>
            </TabsList>
          </Tabs>

          {scope === "range" && (
            <PageRangeInput
              id="watermark-range"
              value={range}
              onChange={setRange}
              totalPages={totalPages}
              label="Pages to watermark"
            />
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Font size</span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {fontSize}pt
                </span>
              </div>
              <Slider
                aria-label="Watermark font size"
                className="mt-2"
                min={10}
                max={150}
                value={[fontSize]}
                onValueChange={(value) =>
                  setFontSize(Array.isArray(value) ? value[0] : value)
                }
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rotation</span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {rotation} degrees
                </span>
              </div>
              <Slider
                aria-label="Watermark rotation"
                className="mt-2"
                min={0}
                max={90}
                step={5}
                value={[rotation]}
                onValueChange={(value) =>
                  setRotation(Array.isArray(value) ? value[0] : value)
                }
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Opacity</span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <Slider
                aria-label="Watermark opacity"
                className="mt-2"
                min={0.05}
                max={1}
                step={0.05}
                value={[opacity]}
                onValueChange={(value) =>
                  setOpacity(Array.isArray(value) ? value[0] : value)
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="watermark-color">Watermark color</Label>
            <input
              id="watermark-color"
              name="color"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="border-border/60 mt-1.5 block size-9 cursor-pointer rounded-lg border bg-transparent"
            />
          </div>

          <div
            className="border-border/60 bg-card relative flex h-48 items-center justify-center overflow-hidden rounded-xl border"
            aria-hidden
          >
            <span
              className="font-bold whitespace-nowrap"
              style={{
                color,
                opacity,
                fontSize: `${fontSize / 2}px`,
                transform: `rotate(-${rotation}deg)`,
              }}
            >
              {text || "CONFIDENTIAL"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={getWatermarkedBlob}
              filename={`${file.name.replace(/\.pdf$/i, "")}-watermarked.pdf`}
              label={processing ? "Adding watermark..." : "Add watermark and download"}
              disabled={(scope === "range" && !range.trim()) || processing}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setTotalPages(null)
                setRange("")
                setError(null)
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
