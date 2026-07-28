import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  addPageNumbers,
  countPdfPages,
  pdfBytesToBlob,
  type PagePosition,
} from "@/lib/pdf"

const POSITIONS: { value: PagePosition; label: string }[] = [
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
]

const FORMATS = [
  { value: "{n}", label: "1" },
  { value: "Page {n}", label: "Page 1" },
  { value: "{n} of {total}", label: "1 of 24" },
  { value: "Page {n} of {total}", label: "Page 1 of 24" },
]

export default function PdfPageNumbers() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [position, setPosition] = useState<PagePosition>("bottom-center")
  const [format, setFormat] = useState("{n}")
  const [fontSize, setFontSize] = useState(11)
  const [margin, setMargin] = useState(28)
  const [startAt, setStartAt] = useState("1")
  const [skipFirst, setSkipFirst] = useState("0")
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

  const numericStart = Number(startAt)
  const numericSkip = Number(skipFirst)

  function validate(): string | null {
    if (totalPages === null) return null
    if (!Number.isInteger(numericStart) || numericStart < 0) {
      return "Starting number must be a whole number of 0 or more."
    }
    if (!Number.isInteger(numericSkip) || numericSkip < 0) {
      return "Pages to skip must be a whole number of 0 or more."
    }
    if (numericSkip >= totalPages) {
      return `Skipping ${numericSkip} pages would leave nothing to number in this ${totalPages}-page PDF.`
    }
    return null
  }

  const validationError = validate()

  async function getNumberedBlob() {
    if (!file || totalPages === null || validationError) return null
    setProcessing(true)
    setError(null)
    try {
      const bytes = await addPageNumbers(file, {
        position,
        fontSize,
        margin,
        startAt: numericStart,
        format,
        skipFirst: numericSkip,
      })
      return pdfBytesToBlob(bytes)
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "Could not number this PDF.")
      return null
    } finally {
      setProcessing(false)
    }
  }

  const numberedCount = totalPages === null ? 0 : Math.max(0, totalPages - numericSkip)
  const samplePosition = POSITIONS.find((item) => item.value === position)?.label ?? ""
  const sampleLabel = format
    .replaceAll("{n}", String(numericStart || 0))
    .replaceAll("{total}", String((numericStart || 0) + numberedCount - 1))

  return (
    <div className="space-y-5">
      {!file && (
        <FileDropZone accept="application/pdf" onFiles={handleFile} hint="One PDF file" />
      )}

      {(error || validationError) && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error ?? validationError}</span>
        </div>
      )}

      {file && totalPages !== null && (
        <div className="space-y-5">
          <p className="text-sm font-medium">
            {file.name} ({totalPages} {totalPages === 1 ? "page" : "pages"})
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="numbers-position">Position</Label>
              <Select
                value={position}
                onValueChange={(value) => value && setPosition(value as PagePosition)}
              >
                <SelectTrigger id="numbers-position" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numbers-format">Format</Label>
              <Select value={format} onValueChange={(value) => value && setFormat(value)}>
                <SelectTrigger id="numbers-format" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numbers-start">Start numbering at</Label>
              <Input
                id="numbers-start"
                name="startAt"
                type="number"
                inputMode="numeric"
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
                className="mt-1.5 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="numbers-skip">Leave first pages unnumbered</Label>
              <Input
                id="numbers-skip"
                name="skipFirst"
                type="number"
                inputMode="numeric"
                value={skipFirst}
                onChange={(event) => setSkipFirst(event.target.value)}
                className="mt-1.5 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Font size</span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {fontSize}pt
                </span>
              </div>
              <Slider
                aria-label="Page number font size"
                className="mt-2"
                min={6}
                max={24}
                value={[fontSize]}
                onValueChange={(value) =>
                  setFontSize(Array.isArray(value) ? value[0] : value)
                }
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Margin</span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {margin}pt
                </span>
              </div>
              <Slider
                aria-label="Page number margin"
                className="mt-2"
                min={8}
                max={80}
                value={[margin]}
                onValueChange={(value) =>
                  setMargin(Array.isArray(value) ? value[0] : value)
                }
              />
            </div>
          </div>

          <p className="border-border/60 bg-muted/30 rounded-lg border p-3 text-sm">
            {numberedCount} {numberedCount === 1 ? "page" : "pages"} will be numbered,
            starting with <span className="font-mono">{sampleLabel}</span> at the{" "}
            {samplePosition.toLowerCase()}.
          </p>

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={getNumberedBlob}
              filename={`${file.name.replace(/\.pdf$/i, "")}-numbered.pdf`}
              label={processing ? "Numbering..." : "Add numbers and download"}
              disabled={processing || Boolean(validationError)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setTotalPages(null)
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
