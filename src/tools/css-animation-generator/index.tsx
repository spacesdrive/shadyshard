import { useEffect, useMemo, useRef, useState } from "react"
import { Play } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

interface Frame {
  offset: number
  transform?: string
  opacity?: string
}

interface Preset {
  name: string
  label: string
  frames: Frame[]
}

const PRESETS: Preset[] = [
  {
    name: "fade-in",
    label: "Fade in",
    frames: [
      { offset: 0, opacity: "0" },
      { offset: 1, opacity: "1" },
    ],
  },
  {
    name: "fade-out",
    label: "Fade out",
    frames: [
      { offset: 0, opacity: "1" },
      { offset: 1, opacity: "0" },
    ],
  },
  {
    name: "slide-in-left",
    label: "Slide in from left",
    frames: [
      { offset: 0, transform: "translateX(-100%)", opacity: "0" },
      { offset: 1, transform: "translateX(0)", opacity: "1" },
    ],
  },
  {
    name: "slide-in-right",
    label: "Slide in from right",
    frames: [
      { offset: 0, transform: "translateX(100%)", opacity: "0" },
      { offset: 1, transform: "translateX(0)", opacity: "1" },
    ],
  },
  {
    name: "slide-in-up",
    label: "Slide in from below",
    frames: [
      { offset: 0, transform: "translateY(100%)", opacity: "0" },
      { offset: 1, transform: "translateY(0)", opacity: "1" },
    ],
  },
  {
    name: "slide-in-down",
    label: "Slide in from above",
    frames: [
      { offset: 0, transform: "translateY(-100%)", opacity: "0" },
      { offset: 1, transform: "translateY(0)", opacity: "1" },
    ],
  },
  {
    name: "zoom-in",
    label: "Zoom in",
    frames: [
      { offset: 0, transform: "scale(0.5)", opacity: "0" },
      { offset: 1, transform: "scale(1)", opacity: "1" },
    ],
  },
  {
    name: "bounce",
    label: "Bounce",
    frames: [
      { offset: 0, transform: "translateY(0)" },
      { offset: 0.25, transform: "translateY(-30%)" },
      { offset: 0.5, transform: "translateY(0)" },
      { offset: 0.75, transform: "translateY(-15%)" },
      { offset: 1, transform: "translateY(0)" },
    ],
  },
  {
    name: "pulse",
    label: "Pulse",
    frames: [
      { offset: 0, transform: "scale(1)" },
      { offset: 0.5, transform: "scale(1.1)" },
      { offset: 1, transform: "scale(1)" },
    ],
  },
  {
    name: "shake",
    label: "Shake",
    frames: [
      { offset: 0, transform: "translateX(0)" },
      { offset: 0.2, transform: "translateX(-10px)" },
      { offset: 0.4, transform: "translateX(10px)" },
      { offset: 0.6, transform: "translateX(-6px)" },
      { offset: 0.8, transform: "translateX(6px)" },
      { offset: 1, transform: "translateX(0)" },
    ],
  },
  {
    name: "spin",
    label: "Spin",
    frames: [
      { offset: 0, transform: "rotate(0deg)" },
      { offset: 1, transform: "rotate(360deg)" },
    ],
  },
]

const EASINGS = [
  "ease",
  "linear",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "cubic-bezier(0.34, 1.56, 0.64, 1)",
]

const DIRECTIONS: PlaybackDirection[] = [
  "normal",
  "reverse",
  "alternate",
  "alternate-reverse",
]

const FILL_MODES: FillMode[] = ["none", "forwards", "backwards", "both"]

function frameToCss(frame: Frame): string {
  const declarations: string[] = []
  if (frame.transform) declarations.push(`transform: ${frame.transform};`)
  if (frame.opacity !== undefined) declarations.push(`opacity: ${frame.opacity};`)
  return `  ${Math.round(frame.offset * 100)}% {\n    ${declarations.join("\n    ")}\n  }`
}

export default function CssAnimationGenerator() {
  const [presetName, setPresetName] = useState("fade-in")
  const [duration, setDuration] = useState("1")
  const [delay, setDelay] = useState("0")
  const [easing, setEasing] = useState("ease-out")
  const [iterations, setIterations] = useState("1")
  const [infinite, setInfinite] = useState(false)
  const [direction, setDirection] = useState<PlaybackDirection>("normal")
  const [fillMode, setFillMode] = useState<FillMode>("both")
  const [replayCount, setReplayCount] = useState(0)

  const previewRef = useRef<HTMLDivElement>(null)

  const preset = PRESETS.find((entry) => entry.name === presetName) ?? PRESETS[0]

  const durationSeconds = Math.max(0.05, Number(duration) || 0.05)
  const delaySeconds = Math.max(0, Number(delay) || 0)
  const iterationCount = infinite
    ? Infinity
    : Math.max(1, Math.round(Number(iterations) || 1))

  useEffect(() => {
    const element = previewRef.current
    if (!element) return

    const animation = element.animate(
      preset.frames.map((frame) => ({
        offset: frame.offset,
        ...(frame.transform === undefined ? {} : { transform: frame.transform }),
        ...(frame.opacity === undefined ? {} : { opacity: frame.opacity }),
      })),
      {
        duration: durationSeconds * 1000,
        delay: delaySeconds * 1000,
        easing,
        iterations: iterationCount,
        direction,
        fill: fillMode,
      },
    )

    return () => animation.cancel()
  }, [
    preset,
    durationSeconds,
    delaySeconds,
    easing,
    iterationCount,
    direction,
    fillMode,
    replayCount,
  ])

  const css = useMemo(() => {
    const shorthandIterations = infinite ? "infinite" : String(iterationCount)
    return [
      `@keyframes ${preset.name} {`,
      preset.frames.map(frameToCss).join("\n"),
      "}",
      "",
      `.${preset.name} {`,
      `  animation: ${preset.name} ${durationSeconds}s ${easing} ${delaySeconds}s ${shorthandIterations} ${direction} ${fillMode};`,
      "}",
    ].join("\n")
  }, [
    preset,
    durationSeconds,
    easing,
    delaySeconds,
    iterationCount,
    infinite,
    direction,
    fillMode,
  ])

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="animation-preset">Animation</Label>
          <Select
            value={presetName}
            onValueChange={(next) => next && setPresetName(next as string)}
          >
            <SelectTrigger id="animation-preset" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((option) => (
                <SelectItem key={option.name} value={option.name}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="animation-easing">Timing function</Label>
          <Select
            value={easing}
            onValueChange={(next) => next && setEasing(next as string)}
          >
            <SelectTrigger id="animation-easing" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EASINGS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="animation-duration">Duration (seconds)</Label>
          <Input
            id="animation-duration"
            name="duration"
            type="number"
            min={0.05}
            step={0.05}
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="animation-delay">Delay (seconds)</Label>
          <Input
            id="animation-delay"
            name="delay"
            type="number"
            min={0}
            step={0.1}
            value={delay}
            onChange={(event) => setDelay(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="animation-iterations">Iterations</Label>
          <Input
            id="animation-iterations"
            name="iterations"
            type="number"
            min={1}
            step={1}
            value={iterations}
            disabled={infinite}
            onChange={(event) => setIterations(event.target.value)}
            className="mt-1.5"
          />
          <div className="mt-2 flex items-center gap-2">
            <Checkbox
              id="animation-infinite"
              name="infinite"
              checked={infinite}
              onCheckedChange={(checked) => setInfinite(checked === true)}
            />
            <Label htmlFor="animation-infinite" className="font-normal">
              Repeat forever
            </Label>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="animation-direction">Direction</Label>
            <Select
              value={direction}
              onValueChange={(next) => next && setDirection(next as PlaybackDirection)}
            >
              <SelectTrigger id="animation-direction" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="animation-fill">Fill mode</Label>
            <Select
              value={fillMode}
              onValueChange={(next) => next && setFillMode(next as FillMode)}
            >
              <SelectTrigger id="animation-fill" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILL_MODES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-border/60 bg-muted/30 flex h-48 items-center justify-center overflow-hidden rounded-xl border">
        <div
          ref={previewRef}
          className="bg-primary text-primary-foreground grid size-24 place-items-center rounded-xl text-sm font-medium"
        >
          Preview
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReplayCount((count) => count + 1)}
        >
          <Play className="size-4" />
          Replay
        </Button>
        <CopyButton value={css} label="Copy CSS" />
        <DownloadButton
          getBlob={() => new Blob([css], { type: "text/css" })}
          filename={`${preset.name}.css`}
        />
      </div>

      <div>
        <Label htmlFor="animation-css" className="sr-only">
          Generated CSS
        </Label>
        <Textarea
          id="animation-css"
          name="css"
          value={css}
          readOnly
          className="min-h-56 resize-y font-mono text-sm"
        />
      </div>
    </div>
  )
}
