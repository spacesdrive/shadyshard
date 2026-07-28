import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { CopyButton } from "@/components/tool/CopyButton"
import { Input } from "@/components/ui/input"

type Curve = [number, number, number, number]

const PRESETS: { name: string; curve: Curve }[] = [
  { name: "linear", curve: [0, 0, 1, 1] },
  { name: "ease", curve: [0.25, 0.1, 0.25, 1] },
  { name: "ease-in", curve: [0.42, 0, 1, 1] },
  { name: "ease-out", curve: [0, 0, 0.58, 1] },
  { name: "ease-in-out", curve: [0.42, 0, 0.58, 1] },
]

// The plot is 100 wide and 200 tall so control points can sit outside the
// 0-1 range vertically, which is what produces overshoot and bounce curves.
const PLOT_WIDTH = 100
const Y_MIN = -0.5
const Y_MAX = 1.5

const toPlotX = (x: number) => x * PLOT_WIDTH
const toPlotY = (y: number) => (Y_MAX - y) * PLOT_WIDTH

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function round(value: number) {
  return Number(value.toFixed(2))
}

interface HandleSliderProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function HandleSlider({ id, label, value, min, max, onChange }: HandleSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-sm tabular-nums">{value}</span>
      </div>
      <Slider
        id={id}
        aria-label={label}
        className="mt-2"
        min={min}
        max={max}
        step={0.01}
        value={[value]}
        onValueChange={(next) => onChange(round(Array.isArray(next) ? next[0] : next))}
      />
    </div>
  )
}

export default function CubicBezierGenerator() {
  const [curve, setCurve] = useState<Curve>([0.25, 0.1, 0.25, 1])
  const [dragging, setDragging] = useState<0 | 1 | null>(null)
  const plotRef = useRef<SVGSVGElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const [x1, y1, x2, y2] = curve
  const css = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`

  const play = useCallback(() => {
    const dot = dotRef.current
    const track = trackRef.current
    if (!dot || !track) return
    const distance = track.clientWidth - dot.offsetWidth
    dot.animate(
      [{ transform: "translateX(0px)" }, { transform: `translateX(${distance}px)` }],
      { duration: 1200, easing: css },
    )
  }, [css])

  useEffect(() => {
    play()
  }, [play])

  function updateHandle(index: 0 | 1, event: PointerEvent<SVGSVGElement>) {
    const plot = plotRef.current
    if (!plot) return
    const bounds = plot.getBoundingClientRect()
    const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1)
    const rawY = Y_MAX - ((event.clientY - bounds.top) / bounds.height) * (Y_MAX - Y_MIN)
    const y = clamp(rawY, Y_MIN, Y_MAX)
    setCurve((current) => {
      const next: Curve = [...current]
      next[index * 2] = round(x)
      next[index * 2 + 1] = round(y)
      return next
    })
  }

  function setCoordinate(index: 0 | 1 | 2 | 3, value: number) {
    setCurve((current) => {
      const next: Curve = [...current]
      next[index] = value
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg
          ref={plotRef}
          viewBox={`-8 -8 ${PLOT_WIDTH + 16} ${PLOT_WIDTH * 2 + 16}`}
          className="border-border/60 bg-muted/30 h-72 w-full touch-none rounded-xl border"
          role="img"
          aria-label={`Cubic bezier curve with control points at ${x1}, ${y1} and ${x2}, ${y2}`}
          onPointerMove={(event) => {
            if (dragging !== null) updateHandle(dragging, event)
          }}
          onPointerUp={() => setDragging(null)}
          onPointerLeave={() => setDragging(null)}
        >
          <rect
            x={0}
            y={toPlotY(1)}
            width={PLOT_WIDTH}
            height={PLOT_WIDTH}
            className="fill-background stroke-border"
            strokeWidth={0.5}
          />
          <line
            x1={toPlotX(x1)}
            y1={toPlotY(y1)}
            x2={0}
            y2={toPlotY(0)}
            className="stroke-muted-foreground"
            strokeWidth={0.8}
          />
          <line
            x1={toPlotX(x2)}
            y1={toPlotY(y2)}
            x2={PLOT_WIDTH}
            y2={toPlotY(1)}
            className="stroke-muted-foreground"
            strokeWidth={0.8}
          />
          <path
            d={`M 0 ${toPlotY(0)} C ${toPlotX(x1)} ${toPlotY(y1)}, ${toPlotX(x2)} ${toPlotY(y2)}, ${PLOT_WIDTH} ${toPlotY(1)}`}
            className="stroke-primary"
            fill="none"
            strokeWidth={2}
          />
          <circle
            cx={toPlotX(x1)}
            cy={toPlotY(y1)}
            r={4}
            className="fill-primary cursor-grab"
            onPointerDown={(event) => {
              event.preventDefault()
              setDragging(0)
            }}
          />
          <circle
            cx={toPlotX(x2)}
            cy={toPlotY(y2)}
            r={4}
            className="fill-primary cursor-grab"
            onPointerDown={(event) => {
              event.preventDefault()
              setDragging(1)
            }}
          />
        </svg>

        <div className="space-y-4">
          <HandleSlider
            id="bezier-x1"
            label="Point 1 X"
            value={x1}
            min={0}
            max={1}
            onChange={(value) => setCoordinate(0, value)}
          />
          <HandleSlider
            id="bezier-y1"
            label="Point 1 Y"
            value={y1}
            min={Y_MIN}
            max={Y_MAX}
            onChange={(value) => setCoordinate(1, value)}
          />
          <HandleSlider
            id="bezier-x2"
            label="Point 2 X"
            value={x2}
            min={0}
            max={1}
            onChange={(value) => setCoordinate(2, value)}
          />
          <HandleSlider
            id="bezier-y2"
            label="Point 2 Y"
            value={y2}
            min={Y_MIN}
            max={Y_MAX}
            onChange={(value) => setCoordinate(3, value)}
          />
        </div>
      </div>

      <div>
        <span className="text-sm font-medium">Presets</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.name}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurve(preset.curve)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-sm font-medium">Preview</span>
        <div
          ref={trackRef}
          className="border-border/60 bg-muted/30 mt-2 rounded-xl border p-4"
        >
          <div ref={dotRef} className="bg-primary size-8 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          id="bezier-output"
          name="output"
          value={css}
          readOnly
          className="min-w-56 flex-1 font-mono text-sm"
          aria-label="Generated cubic-bezier value"
        />
        <CopyButton value={css} label="Copy easing" size="icon" />
        <Button type="button" variant="outline" size="sm" onClick={play}>
          <Play className="size-4" />
          Replay
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCurve([0.25, 0.1, 0.25, 1])}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
