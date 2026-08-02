import { useRef, useState } from "react"
import { AlertCircle, RotateCcw, Wand2 } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cropPdfMargins, pdfBytesToBlob } from "@/lib/pdf"
import { loadPdfjsDocument, renderPageToCanvas } from "@/lib/pdf-render"

/** PDF user space is 72 units per inch, and 1 inch is 25.4 mm. */
const POINTS_PER_MM = 72 / 25.4
const PREVIEW_SCALE = 1.5

type Edge = "top" | "right" | "bottom" | "left"

const EDGES: { key: Edge; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "right", label: "Right" },
  { key: "bottom", label: "Bottom" },
  { key: "left", label: "Left" },
]

type Margins = Record<Edge, string>

const ZERO_MARGINS: Margins = { top: "0", right: "0", bottom: "0", left: "0" }

interface PageInfo {
  widthPoints: number
  heightPoints: number
  previewWidth: number
  dataUrl: string
}

/**
 * Scans inward from each edge of a rendered page for the first row or column
 * containing a pixel darker than the background, which is where the content
 * begins. Returns the margin on each edge in canvas pixels.
 */
function detectContentMargins(canvas: HTMLCanvasElement): Record<Edge, number> | null {
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return null

  const { width, height } = canvas
  const { data } = context.getImageData(0, 0, width, height)
  const threshold = 245

  function hasContent(x: number, y: number): boolean {
    const offset = (y * width + x) * 4
    const alpha = data[offset + 3]
    if (alpha < 16) return false
    return (
      data[offset] < threshold ||
      data[offset + 1] < threshold ||
      data[offset + 2] < threshold
    )
  }

  let top = 0
  outer: for (; top < height; top++) {
    for (let x = 0; x < width; x++) if (hasContent(x, top)) break outer
  }
  if (top === height) return null

  let bottom = height - 1
  outer: for (; bottom > top; bottom--) {
    for (let x = 0; x < width; x++) if (hasContent(x, bottom)) break outer
  }

  let left = 0
  outer: for (; left < width; left++) {
    for (let y = top; y <= bottom; y++) if (hasContent(left, y)) break outer
  }

  let right = width - 1
  outer: for (; right > left; right--) {
    for (let y = top; y <= bottom; y++) if (hasContent(right, y)) break outer
  }

  return {
    top,
    right: width - 1 - right,
    bottom: height - 1 - bottom,
    left,
  }
}

export default function PdfMarginCropper() {
  const [file, setFile] = useState<File | null>(null)
  const [page, setPage] = useState<PageInfo | null>(null)
  const [margins, setMargins] = useState<Margins>(ZERO_MARGINS)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setMargins(ZERO_MARGINS)
    setProcessing(true)
    try {
      const document = await loadPdfjsDocument(selected)
      const canvas = await renderPageToCanvas(document, 1, PREVIEW_SCALE)
      const first = await document.getPage(1)
      const unscaled = first.getViewport({ scale: 1 })
      canvasRef.current = canvas
      setPage({
        widthPoints: unscaled.width,
        heightPoints: unscaled.height,
        previewWidth: canvas.width,
        dataUrl: canvas.toDataURL("image/png"),
      })
      setFile(selected)
    } catch (readError) {
      setError(
        readError instanceof Error ? readError.message : "Could not read this PDF.",
      )
      setFile(null)
      setPage(null)
    } finally {
      setProcessing(false)
    }
  }

  function detect() {
    const canvas = canvasRef.current
    if (!canvas || !page) return
    const detected = detectContentMargins(canvas)
    if (!detected) {
      setError("No content was found on the first page, so margins cannot be detected.")
      return
    }
    setError(null)
    /** Keep a 2 mm safety pad so descenders and thin rules are not clipped. */
    const pad = 2
    const pointsPerPixel = page.widthPoints / page.previewWidth
    const toMillimetres = (pixels: number) =>
      Math.max(0, (pixels * pointsPerPixel) / POINTS_PER_MM - pad)
    setMargins({
      top: toMillimetres(detected.top).toFixed(1),
      right: toMillimetres(detected.right).toFixed(1),
      bottom: toMillimetres(detected.bottom).toFixed(1),
      left: toMillimetres(detected.left).toFixed(1),
    })
  }

  function reset() {
    setFile(null)
    setPage(null)
    setMargins(ZERO_MARGINS)
    setError(null)
    canvasRef.current = null
  }

  function pointsFor(edge: Edge): number | null {
    const value = Number(margins[edge])
    if (!Number.isFinite(value) || value < 0) return null
    return value * POINTS_PER_MM
  }

  const marginPoints = EDGES.map((edge) => pointsFor(edge.key))
  const marginsValid = marginPoints.every((value) => value !== null)
  const remainingWidth =
    page && marginsValid
      ? page.widthPoints - (pointsFor("left") as number) - (pointsFor("right") as number)
      : null
  const remainingHeight =
    page && marginsValid
      ? page.heightPoints - (pointsFor("top") as number) - (pointsFor("bottom") as number)
      : null
  const fitsOnPage =
    remainingWidth !== null &&
    remainingHeight !== null &&
    remainingWidth > 0 &&
    remainingHeight > 0

  async function getCroppedBlob() {
    if (!file || !marginsValid) return null
    setProcessing(true)
    setError(null)
    try {
      const bytes = await cropPdfMargins(file, {
        top: pointsFor("top") as number,
        right: pointsFor("right") as number,
        bottom: pointsFor("bottom") as number,
        left: pointsFor("left") as number,
      })
      return pdfBytesToBlob(bytes)
    } catch (cropError) {
      setError(
        cropError instanceof Error ? cropError.message : "Could not crop this PDF.",
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

      {file && page && (
        <div className="space-y-4">
          <p className="text-sm font-medium">{file.name}</p>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {EDGES.map((edge) => (
                  <div key={edge.key}>
                    <Label htmlFor={`crop-${edge.key}`}>{edge.label} (mm)</Label>
                    <Input
                      id={`crop-${edge.key}`}
                      name={edge.key}
                      type="number"
                      min={0}
                      step={0.5}
                      className="mt-1.5"
                      value={margins[edge.key]}
                      onChange={(event) =>
                        setMargins((current) => ({
                          ...current,
                          [edge.key]: event.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={detect}>
                  <Wand2 className="size-4" />
                  Detect margins
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMargins(ZERO_MARGINS)}
                >
                  Clear values
                </Button>
              </div>

              {!marginsValid && (
                <p className="text-destructive text-sm">
                  Every margin must be zero or a positive number of millimetres.
                </p>
              )}

              {marginsValid && !fitsOnPage && (
                <p className="text-destructive text-sm">
                  Those margins remove the whole page. Reduce them and try again.
                </p>
              )}

              {marginsValid && fitsOnPage && (
                <p className="text-muted-foreground text-sm">
                  Page size goes from {(page.widthPoints / POINTS_PER_MM).toFixed(0)} by{" "}
                  {(page.heightPoints / POINTS_PER_MM).toFixed(0)} mm to{" "}
                  {((remainingWidth as number) / POINTS_PER_MM).toFixed(0)} by{" "}
                  {((remainingHeight as number) / POINTS_PER_MM).toFixed(0)} mm.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <DownloadButton
                  getBlob={getCroppedBlob}
                  filename={`${file.name.replace(/\.pdf$/i, "")}-cropped.pdf`}
                  label={processing ? "Working..." : "Download cropped PDF"}
                  disabled={processing || !marginsValid || !fitsOnPage}
                />
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="size-4" />
                  Choose another file
                </Button>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Preview of page 1</span>
              <div className="border-border/60 bg-muted/30 relative mt-2 overflow-hidden rounded-lg border">
                <img
                  src={page.dataUrl}
                  alt="First page of the PDF with the crop area outlined"
                  className="block h-auto w-full"
                />
                {marginsValid && fitsOnPage && (
                  <div
                    className="border-primary bg-primary/10 pointer-events-none absolute border-2"
                    style={{
                      top: `${((pointsFor("top") as number) / page.heightPoints) * 100}%`,
                      bottom: `${((pointsFor("bottom") as number) / page.heightPoints) * 100}%`,
                      left: `${((pointsFor("left") as number) / page.widthPoints) * 100}%`,
                      right: `${((pointsFor("right") as number) / page.widthPoints) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
