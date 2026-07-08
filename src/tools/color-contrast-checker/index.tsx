import { useState } from "react"
import { Check, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!match) return null
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const linearize = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [rl, gl, bl] = [linearize(r), linearize(g), linearize(b)]
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

function contrastRatio(hexA: string, hexB: string): number | null {
  const rgbA = hexToRgb(hexA)
  const rgbB = hexToRgb(hexB)
  if (!rgbA || !rgbB) return null
  const lumA = relativeLuminance(rgbA)
  const lumB = relativeLuminance(rgbB)
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

function ResultRow({
  label,
  threshold,
  ratio,
}: {
  label: string
  threshold: number
  ratio: number
}) {
  const passes = ratio >= threshold
  return (
    <div className="border-border/60 flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
      <span>
        {label} (&ge;{threshold}:1)
      </span>
      {passes ? (
        <span className="flex items-center gap-1 text-emerald-500">
          <Check className="size-4" /> Pass
        </span>
      ) : (
        <span className="text-destructive flex items-center gap-1">
          <X className="size-4" /> Fail
        </span>
      )}
    </div>
  )
}

export default function ColorContrastChecker() {
  const [foreground, setForeground] = useState("#ffffff")
  const [background, setBackground] = useState("#7c3aed")

  const ratio = contrastRatio(foreground, background)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contrast-foreground">Text color</Label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="contrast-foreground"
              name="foreground"
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(foreground) ? foreground : "#000000"}
              onChange={(e) => setForeground(e.target.value)}
              className="border-border/60 size-9 shrink-0 cursor-pointer rounded-lg border bg-transparent"
              aria-label="Pick text color"
            />
            <Input
              id="contrast-foreground-hex"
              name="foregroundHex"
              value={foreground}
              onChange={(e) => setForeground(e.target.value)}
              className="font-mono text-sm"
              aria-label="Text color hex value"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="contrast-background">Background color</Label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="contrast-background"
              name="background"
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(background) ? background : "#000000"}
              onChange={(e) => setBackground(e.target.value)}
              className="border-border/60 size-9 shrink-0 cursor-pointer rounded-lg border bg-transparent"
              aria-label="Pick background color"
            />
            <Input
              id="contrast-background-hex"
              name="backgroundHex"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="font-mono text-sm"
              aria-label="Background color hex value"
            />
          </div>
        </div>
      </div>

      <div
        className="border-border/60 flex min-h-32 items-center justify-center rounded-xl border p-6 text-lg font-medium"
        style={{ color: foreground, background }}
      >
        The quick brown fox jumps over the lazy dog
      </div>

      {ratio !== null ? (
        <div className="space-y-3">
          <p className="text-center text-2xl font-semibold tabular-nums">
            {ratio.toFixed(2)}:1
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <ResultRow label="AA normal text" threshold={4.5} ratio={ratio} />
            <ResultRow label="AA large text" threshold={3} ratio={ratio} />
            <ResultRow label="AAA normal text" threshold={7} ratio={ratio} />
            <ResultRow label="AAA large text" threshold={4.5} ratio={ratio} />
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Enter two valid hex colors to see the contrast ratio.
        </p>
      )}
    </div>
  )
}
