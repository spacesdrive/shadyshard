import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react"
import { Eraser, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { canvasToBlob } from "@/lib/image"

const WIDTH = 800
const HEIGHT = 300

type Stroke = { x: number; y: number }[]

export default function SignaturePad() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [drawing, setDrawing] = useState(false)
  const [penWidth, setPenWidth] = useState(3)
  const [inkColor, setInkColor] = useState("#111827")
  const [whiteBackground, setWhiteBackground] = useState(false)

  const paint = useCallback(
    (target: HTMLCanvasElement, withBackground: boolean) => {
      const context = target.getContext("2d")
      if (!context) return
      context.clearRect(0, 0, WIDTH, HEIGHT)
      if (withBackground) {
        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, WIDTH, HEIGHT)
      }
      context.strokeStyle = inkColor
      context.lineWidth = penWidth
      context.lineCap = "round"
      context.lineJoin = "round"

      for (const stroke of strokes) {
        if (stroke.length === 0) continue
        context.beginPath()
        context.moveTo(stroke[0].x, stroke[0].y)
        if (stroke.length === 1) {
          context.lineTo(stroke[0].x + 0.1, stroke[0].y)
        } else {
          for (let i = 1; i < stroke.length - 1; i += 1) {
            const midX = (stroke[i].x + stroke[i + 1].x) / 2
            const midY = (stroke[i].y + stroke[i + 1].y) / 2
            context.quadraticCurveTo(stroke[i].x, stroke[i].y, midX, midY)
          }
          const last = stroke[stroke.length - 1]
          context.lineTo(last.x, last.y)
        }
        context.stroke()
      }
    },
    [strokes, inkColor, penWidth],
  )

  useEffect(() => {
    if (canvasRef.current) paint(canvasRef.current, false)
  }, [paint])

  function pointFrom(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const bounds = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * WIDTH,
      y: ((event.clientY - bounds.top) / bounds.height) * HEIGHT,
    }
  }

  function startStroke(event: PointerEvent<HTMLCanvasElement>) {
    const point = pointFrom(event)
    if (!point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrawing(true)
    setStrokes((current) => [...current, [point]])
  }

  function extendStroke(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing) return
    const point = pointFrom(event)
    if (!point) return
    setStrokes((current) => {
      if (current.length === 0) return current
      const next = current.slice(0, -1)
      return [...next, [...current[current.length - 1], point]]
    })
  }

  function exportBlob() {
    const target = document.createElement("canvas")
    target.width = WIDTH
    target.height = HEIGHT
    paint(target, whiteBackground)
    return canvasToBlob(target, "image/png")
  }

  return (
    <div className="space-y-5">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        aria-label="Signature drawing area. Draw with a pointer, stylus, or finger."
        className="border-border/60 bg-card w-full cursor-crosshair touch-none rounded-xl border"
        onPointerDown={startStroke}
        onPointerMove={extendStroke}
        onPointerUp={() => setDrawing(false)}
        onPointerCancel={() => setDrawing(false)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pen thickness</span>
            <span className="text-muted-foreground text-sm tabular-nums">
              {penWidth}px
            </span>
          </div>
          <Slider
            aria-label="Pen thickness"
            className="mt-2"
            min={1}
            max={12}
            value={[penWidth]}
            onValueChange={(value) =>
              setPenWidth(Array.isArray(value) ? value[0] : value)
            }
          />
        </div>

        <div>
          <Label htmlFor="signature-ink">Ink color</Label>
          <input
            id="signature-ink"
            name="inkColor"
            type="color"
            value={inkColor}
            onChange={(event) => setInkColor(event.target.value)}
            className="border-border/60 mt-1.5 block size-9 cursor-pointer rounded-lg border bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2 sm:mt-6">
          <Switch
            id="signature-background"
            name="whiteBackground"
            checked={whiteBackground}
            onCheckedChange={setWhiteBackground}
          />
          <Label htmlFor="signature-background" className="font-normal">
            White background
          </Label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <DownloadButton
          getBlob={exportBlob}
          filename="signature.png"
          label="Download PNG"
          disabled={strokes.length === 0}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={strokes.length === 0}
          onClick={() => setStrokes((current) => current.slice(0, -1))}
        >
          <Undo2 className="size-4" />
          Undo stroke
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={strokes.length === 0}
          onClick={() => setStrokes([])}
        >
          <Eraser className="size-4" />
          Clear
        </Button>
      </div>

      {strokes.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Draw your signature in the box above to enable the download.
        </p>
      )}
    </div>
  )
}
