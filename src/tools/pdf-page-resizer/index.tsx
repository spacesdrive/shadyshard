import { useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  countPdfPages,
  pdfBytesToBlob,
  resizePdfPages,
  PAPER_SIZES,
  type ResizeOptions,
} from "@/lib/pdf"

const POINTS_PER_MM = 25.4 / 72

function millimetres(points: number): number {
  return Math.round(points * POINTS_PER_MM)
}

export default function PdfPageResizer() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [paper, setPaper] = useState("a4")
  const [orientation, setOrientation] = useState<ResizeOptions["orientation"]>("auto")
  const [mode, setMode] = useState<ResizeOptions["mode"]>("fit")
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const size = PAPER_SIZES[paper]

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setFile(selected)
    try {
      setTotalPages(await countPdfPages(selected))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read this PDF.")
      setFile(null)
      setTotalPages(null)
    }
  }

  function reset() {
    setFile(null)
    setTotalPages(null)
    setError(null)
  }

  async function getResizedBlob() {
    if (!file) return null
    setProcessing(true)
    setError(null)
    try {
      const bytes = await resizePdfPages(file, {
        width: size.width,
        height: size.height,
        orientation,
        mode,
      })
      return pdfBytesToBlob(bytes)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not resize this PDF.")
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
        <div className="space-y-4">
          <p className="text-sm font-medium break-all">
            {file.name}{" "}
            <span className="text-muted-foreground font-normal">
              ({totalPages} {totalPages === 1 ? "page" : "pages"})
            </span>
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="resize-paper">Page size</Label>
              <Select
                value={paper}
                onValueChange={(value) => value && setPaper(value as string)}
              >
                <SelectTrigger id="resize-paper" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAPER_SIZES).map(([key, entry]) => (
                    <SelectItem key={key} value={key}>
                      {entry.label} ({millimetres(entry.width)} by{" "}
                      {millimetres(entry.height)} mm)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resize-orientation">Orientation</Label>
              <Select
                value={orientation}
                onValueChange={(value) =>
                  value && setOrientation(value as ResizeOptions["orientation"])
                }
              >
                <SelectTrigger id="resize-orientation" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Keep each page's own</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resize-mode">Scaling</Label>
              <Select
                value={mode}
                onValueChange={(value) =>
                  value && setMode(value as ResizeOptions["mode"])
                }
              >
                <SelectTrigger id="resize-mode" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fit">Fit, keeping proportions</SelectItem>
                  <SelectItem value="stretch">Stretch to fill</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">
            {mode === "fit"
              ? `Every page will be scaled to fit ${size.label} and centred, leaving even margins where the proportions differ.`
              : `Every page will be stretched to fill ${size.label} exactly, which distorts content whose proportions differ.`}
          </p>

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={getResizedBlob}
              filename={`${file.name.replace(/\.pdf$/i, "")}-${paper}.pdf`}
              label={processing ? "Working..." : `Download ${size.label} PDF`}
              disabled={processing}
            />
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="size-4" />
              Choose another file
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
