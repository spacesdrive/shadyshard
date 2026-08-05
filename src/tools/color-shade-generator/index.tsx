import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

interface Rgb {
  r: number
  g: number
  b: number
}

interface Oklch {
  l: number
  c: number
  h: number
}

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const LIGHTNESS_TARGETS = [
  0.97, 0.94, 0.88, 0.81, 0.73, 0.65, 0.57, 0.49, 0.42, 0.36, 0.27,
]
const CHROMA_FACTORS = [0.2, 0.32, 0.54, 0.74, 0.9, 1, 1, 0.95, 0.85, 0.74, 0.56]

const OUTPUT_FORMATS = [
  { value: "hex", label: "Hex list" },
  { value: "css", label: "CSS variables" },
  { value: "tailwind4", label: "Tailwind v4" },
  { value: "tailwind3", label: "Tailwind v3" },
] as const

type OutputFormat = (typeof OUTPUT_FORMATS)[number]["value"]

function parseHex(input: string): Rgb | null {
  const match = /^#?([a-f\d]{3}|[a-f\d]{6})$/i.exec(input.trim())
  if (!match) return null
  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((character) => character + character)
          .join("")
      : match[1]
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
  }
}

function toHex({ r, g, b }: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((channel) =>
        Math.round(Math.min(1, Math.max(0, channel)) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  )
}

function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055
}

function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const lr = srgbToLinear(r)
  const lg = srgbToLinear(g)
  const lb = srgbToLinear(b)

  const long = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const medium = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const short = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)

  const lightness = 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short
  const greenRed = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short
  const blueYellow = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short

  return {
    l: lightness,
    c: Math.hypot(greenRed, blueYellow),
    h: Math.atan2(blueYellow, greenRed),
  }
}

function oklchToRgb({ l, c, h }: Oklch): Rgb {
  const greenRed = Math.cos(h) * c
  const blueYellow = Math.sin(h) * c

  const long = (l + 0.3963377774 * greenRed + 0.2158037573 * blueYellow) ** 3
  const medium = (l - 0.1055613458 * greenRed - 0.0638541728 * blueYellow) ** 3
  const short = (l - 0.0894841775 * greenRed - 1.291485548 * blueYellow) ** 3

  return {
    r: linearToSrgb(4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short),
    g: linearToSrgb(-1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short),
    b: linearToSrgb(-0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short),
  }
}

function inGamut({ r, g, b }: Rgb): boolean {
  const epsilon = 0.0001
  return [r, g, b].every((channel) => channel >= -epsilon && channel <= 1 + epsilon)
}

/** Reduces chroma until the color fits in sRGB, keeping lightness and hue fixed. */
function clampToGamut(color: Oklch): Rgb {
  if (inGamut(oklchToRgb(color))) return oklchToRgb(color)
  let low = 0
  let high = color.c
  for (let iteration = 0; iteration < 20; iteration++) {
    const middle = (low + high) / 2
    if (inGamut(oklchToRgb({ ...color, c: middle }))) low = middle
    else high = middle
  }
  return oklchToRgb({ ...color, c: low })
}

function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

function contrastRatio(color: Rgb, against: number): number {
  const luminance = relativeLuminance(color)
  const lighter = Math.max(luminance, against)
  const darker = Math.min(luminance, against)
  return (lighter + 0.05) / (darker + 0.05)
}

function buildScale(
  base: Rgb,
): { step: number; hex: string; rgb: Rgb; isBase: boolean }[] {
  const baseOklch = rgbToOklch(base)
  let closestIndex = 0
  let smallestDistance = Infinity
  LIGHTNESS_TARGETS.forEach((target, index) => {
    const distance = Math.abs(target - baseOklch.l)
    if (distance < smallestDistance) {
      smallestDistance = distance
      closestIndex = index
    }
  })

  return STEPS.map((step, index) => {
    if (index === closestIndex) {
      return { step, hex: toHex(base), rgb: base, isBase: true }
    }
    const rgb = clampToGamut({
      l: LIGHTNESS_TARGETS[index],
      c: baseOklch.c * CHROMA_FACTORS[index],
      h: baseOklch.h,
    })
    return { step, hex: toHex(rgb), rgb, isBase: false }
  })
}

function formatOutput(
  scale: { step: number; hex: string }[],
  format: OutputFormat,
  name: string,
): string {
  const safeName =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") || "brand"
  switch (format) {
    case "hex":
      return scale.map((entry) => `${entry.step}: ${entry.hex}`).join("\n")
    case "css":
      return [
        ":root {",
        ...scale.map((entry) => `  --color-${safeName}-${entry.step}: ${entry.hex};`),
        "}",
      ].join("\n")
    case "tailwind4":
      return [
        "@theme {",
        ...scale.map((entry) => `  --color-${safeName}-${entry.step}: ${entry.hex};`),
        "}",
      ].join("\n")
    default:
      return [
        `${safeName}: {`,
        ...scale.map((entry) => `  ${entry.step}: "${entry.hex}",`),
        "},",
      ].join("\n")
  }
}

export default function ColorShadeGenerator() {
  const [value, setValue] = useState("#7c3aed")
  const [name, setName] = useState("brand")
  const [format, setFormat] = useState<OutputFormat>("hex")

  const base = useMemo(() => parseHex(value), [value])
  const scale = useMemo(() => (base ? buildScale(base) : []), [base])
  const output = useMemo(
    () => (scale.length ? formatOutput(scale, format, name) : ""),
    [scale, format, name],
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="shade-base-color">Base color</Label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="shade-base-picker"
              name="basePicker"
              type="color"
              value={base ? toHex(base) : "#000000"}
              onChange={(event) => setValue(event.target.value)}
              className="border-border/60 size-9 shrink-0 cursor-pointer rounded-md border bg-transparent"
              aria-label="Pick a base color"
            />
            <Input
              id="shade-base-color"
              name="baseColor"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="#7c3aed"
              className="font-mono text-sm"
              spellCheck={false}
              aria-invalid={base ? undefined : true}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="shade-name">Color name</Label>
          <Input
            id="shade-name"
            name="colorName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="brand"
            className="mt-1.5 font-mono text-sm"
            spellCheck={false}
          />
          <p className="text-muted-foreground mt-1 text-xs">
            Used as the variable prefix in the exported code.
          </p>
        </div>
      </div>

      {!base && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            Enter a three or six digit hex color such as #7c3aed to generate a scale.
          </span>
        </div>
      )}

      {scale.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {scale.map((entry) => {
            const onWhite = contrastRatio(entry.rgb, 1)
            const onBlack = contrastRatio(entry.rgb, 0)
            const useDarkText = onBlack >= onWhite
            return (
              <li
                key={entry.step}
                className="border-border/60 overflow-hidden rounded-lg border"
              >
                <div
                  className="flex h-16 items-start justify-between p-2 text-xs font-medium"
                  style={{
                    backgroundColor: entry.hex,
                    color: useDarkText ? "#000000" : "#ffffff",
                  }}
                >
                  <span>{entry.step}</span>
                  {entry.isBase && <span className="text-[10px]">base</span>}
                </div>
                <div className="p-2">
                  <p className="font-mono text-xs uppercase">{entry.hex}</p>
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    {Math.max(onWhite, onBlack) >= 4.5
                      ? `AA with ${useDarkText ? "black" : "white"} text`
                      : "Below AA for body text"}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div>
        <span className="text-sm font-medium">Export as</span>
        <Tabs
          value={format}
          onValueChange={(next) => setFormat(next as OutputFormat)}
          className="mt-1.5"
        >
          <TabsList>
            {OUTPUT_FORMATS.map((entry) => (
              <TabsTrigger key={entry.value} value={entry.value}>
                {entry.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div>
        <Label htmlFor="shade-output">Generated code</Label>
        <Textarea
          id="shade-output"
          name="output"
          value={output}
          readOnly
          placeholder="The exported scale will appear here."
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy scale" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setValue("#7c3aed")
            setName("brand")
            setFormat("hex")
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
