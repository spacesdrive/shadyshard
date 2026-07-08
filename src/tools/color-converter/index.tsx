import { useMemo, useState } from "react"
import { Copy, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Rgb {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): Rgb | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!match) return null
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  }
}

function rgbToHex({ r, g, b }: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((c) =>
        Math.round(Math.min(255, Math.max(0, c)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  )
}

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h /= 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function parseInput(value: string): Rgb | null {
  const trimmed = value.trim()
  if (trimmed.startsWith("#") || /^[a-f\d]{6}$/i.test(trimmed)) {
    return hexToRgb(trimmed)
  }
  const rgbMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(trimmed)
  if (rgbMatch) {
    return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) }
  }
  const hslMatch = /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/i.exec(trimmed)
  if (hslMatch) {
    const h = Number(hslMatch[1]) / 360
    const s = Number(hslMatch[2]) / 100
    const l = Number(hslMatch[3]) / 100
    if (s === 0) {
      const gray = Math.round(l * 255)
      return { r: gray, g: gray, b: gray }
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const hueToRgb = (t: number) => {
      let tt = t
      if (tt < 0) tt += 1
      if (tt > 1) tt -= 1
      if (tt < 1 / 6) return p + (q - p) * 6 * tt
      if (tt < 1 / 2) return q
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
      return p
    }
    return {
      r: Math.round(hueToRgb(h + 1 / 3) * 255),
      g: Math.round(hueToRgb(h) * 255),
      b: Math.round(hueToRgb(h - 1 / 3) * 255),
    }
  }
  return null
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const id = `color-converter-${label.toLowerCase()}`
  return (
    <div>
      <Label htmlFor={id} className="text-muted-foreground text-xs">
        {label}
      </Label>
      <div className="mt-1.5 flex gap-2">
        <Input id={id} name={id} value={value} readOnly className="font-mono text-sm" />
        <Button
          variant="outline"
          size="icon"
          aria-label={`Copy ${label}`}
          onClick={async () => {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
    </div>
  )
}

export default function ColorConverter() {
  const [value, setValue] = useState("#7c3aed")
  const rgb = useMemo(() => parseInput(value), [value])
  const hex = rgb ? rgbToHex(rgb) : null
  const hsl = rgb ? rgbToHsl(rgb) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          id="color-converter-picker"
          name="color-picker"
          type="color"
          value={hex ?? "#000000"}
          onChange={(e) => setValue(e.target.value)}
          className="border-border/60 size-14 shrink-0 cursor-pointer rounded-lg border bg-transparent"
          aria-label="Pick a color"
        />
        <Input
          id="color-converter-input"
          name="color"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#7c3aed, rgb(124, 58, 237), or hsl(262, 83%, 58%)"
          className="font-mono text-sm"
          aria-label="Color value"
          spellCheck={false}
        />
      </div>

      {rgb && hex && hsl ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <CopyField label="HEX" value={hex} />
          <CopyField label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
          <CopyField label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Enter a valid HEX, RGB, or HSL color to see conversions.
        </p>
      )}
    </div>
  )
}
