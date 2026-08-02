import { useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { countPdfPages, nUpPdf, pdfBytesToBlob, NUP_LAYOUTS } from "@/lib/pdf"

type Orientation = "auto" | "portrait" | "landscape"

const PER_SHEET_OPTIONS = [2, 4, 6, 8, 9, 16]

/** PDF user space is 72 units per inch, and 1 inch is 25.4 mm. */
const POINTS_PER_MM = 72 / 25.4

function millimetresToPoints(value: string): number | null {
  const millimetres = Number(value)
  if (!Number.isFinite(millimetres) || millimetres < 0) return null
  return millimetres * POINTS_PER_MM
}

export default function PdfNUp() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [perSheet, setPerSheet] = useState("2")
  const [orientation, setOrientation] = useState<Orientation>("auto")
  const [margin, setMargin] = useState("10")
  const [gutter, setGutter] = useState("6")
  const [drawCellBorders, setDrawCellBorders] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const marginPoints = millimetresToPoints(margin)
  const gutterPoints = millimetresToPoints(gutter)
  const layout = NUP_LAYOUTS[Number(perSheet)]
  const sheetCount = totalPages === null ? null : Math.ceil(totalPages / Number(perSheet))

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setFile(selected)
    try {
      setTotalPages(await countPdfPages(selected))
    } catch (readError) {
      setError(
        readError instanceof Error ? readError.message : "Could not read this PDF.",
      )
      setFile(null)
      setTotalPages(null)
    }
  }

  function reset() {
    setFile(null)
    setTotalPages(null)
    setError(null)
  }

  async function getLaidOutBlob() {
    if (!file || marginPoints === null || gutterPoints === null) return null
    setProcessing(true)
    setError(null)
    try {
      const bytes = await nUpPdf(file, {
        perSheet: Number(perSheet),
        orientation,
        margin: marginPoints,
        gutter: gutterPoints,
        drawCellBorders,
      })
      return pdfBytesToBlob(bytes)
    } catch (layoutError) {
      setError(
        layoutError instanceof Error
          ? layoutError.message
          : "Could not lay out this PDF.",
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
        <div className="space-y-4">
          <p className="text-sm font-medium">
            {file.name} ({totalPages} {totalPages === 1 ? "page" : "pages"})
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nup-per-sheet">Pages per sheet</Label>
              <Select
                value={perSheet}
                onValueChange={(value) => value && setPerSheet(value as string)}
              >
                <SelectTrigger id="nup-per-sheet" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PER_SHEET_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option} pages ({NUP_LAYOUTS[option].columns} by{" "}
                      {NUP_LAYOUTS[option].rows})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nup-orientation">Sheet orientation</Label>
              <Select
                value={orientation}
                onValueChange={(value) => value && setOrientation(value as Orientation)}
              >
                <SelectTrigger id="nup-orientation" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatic</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nup-margin">Outer margin (mm)</Label>
              <Input
                id="nup-margin"
                name="margin"
                type="number"
                min={0}
                step={1}
                className="mt-1.5"
                value={margin}
                onChange={(event) => setMargin(event.target.value)}
              />
              {marginPoints === null && (
                <p className="text-destructive mt-1.5 text-sm">
                  Enter a margin of zero or more millimetres.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nup-gutter">Gap between pages (mm)</Label>
              <Input
                id="nup-gutter"
                name="gutter"
                type="number"
                min={0}
                step={1}
                className="mt-1.5"
                value={gutter}
                onChange={(event) => setGutter(event.target.value)}
              />
              {gutterPoints === null && (
                <p className="text-destructive mt-1.5 text-sm">
                  Enter a gap of zero or more millimetres.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="nup-borders"
              name="drawCellBorders"
              checked={drawCellBorders}
              onCheckedChange={setDrawCellBorders}
            />
            <Label htmlFor="nup-borders" className="font-normal">
              Draw a guide border around each page
            </Label>
          </div>

          {layout && sheetCount !== null && (
            <p className="text-muted-foreground text-sm">
              {totalPages} {totalPages === 1 ? "page" : "pages"} will become {sheetCount}{" "}
              {sheetCount === 1 ? "sheet" : "sheets"} in a {layout.columns} by{" "}
              {layout.rows} grid.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={getLaidOutBlob}
              filename={`${file.name.replace(/\.pdf$/i, "")}-${perSheet}up.pdf`}
              label={processing ? "Working..." : "Download laid-out PDF"}
              disabled={processing || marginPoints === null || gutterPoints === null}
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
