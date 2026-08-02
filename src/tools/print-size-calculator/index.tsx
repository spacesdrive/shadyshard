import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CENTIMETRES_PER_INCH = 2.54

const DPI_OPTIONS = ["300", "240", "200", "150", "100", "72"]

const COMMON_SIZES: { label: string; width: number; height: number }[] = [
  { label: "4 by 6 in", width: 4, height: 6 },
  { label: "5 by 7 in", width: 5, height: 7 },
  { label: "8 by 10 in", width: 8, height: 10 },
  { label: "A4 (8.3 by 11.7 in)", width: 8.27, height: 11.69 },
  { label: "11 by 14 in", width: 11, height: 14 },
  { label: "16 by 20 in", width: 16, height: 20 },
  { label: "A2 (16.5 by 23.4 in)", width: 16.54, height: 23.39 },
  { label: "24 by 36 in", width: 24, height: 36 },
]

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b)
}

function aspectRatio(width: number, height: number): string {
  const divisor = greatestCommonDivisor(Math.round(width), Math.round(height))
  if (divisor === 0) return "-"
  return `${Math.round(width) / divisor} to ${Math.round(height) / divisor}`
}

interface Rating {
  label: string
  description: string
  className: string
}

function rate(dpi: number): Rating {
  if (dpi >= 300) {
    return {
      label: "Photo quality",
      description: "Sharp when held in the hand. This is what print shops ask for.",
      className: "border-border/60 bg-muted/40",
    }
  }
  if (dpi >= 200) {
    return {
      label: "Good",
      description: "Fine for a framed print viewed from a step back.",
      className: "border-border/60 bg-muted/40",
    }
  }
  if (dpi >= 150) {
    return {
      label: "Acceptable",
      description: "Usable for a large print seen from a distance, soft up close.",
      className: "border-border/60 bg-muted/40",
    }
  }
  if (dpi >= 100) {
    return {
      label: "Poster quality",
      description: "Normal for posters and banners viewed across a room.",
      className: "border-border/60 bg-muted/40",
    }
  }
  return {
    label: "Too low for print",
    description:
      "Visible softness at any normal viewing distance. Use a larger source image.",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  }
}

function parsePositive(value: string): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function format(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

export default function PrintSizeCalculator() {
  const [mode, setMode] = useState("pixels")
  const [pixelWidth, setPixelWidth] = useState("6000")
  const [pixelHeight, setPixelHeight] = useState("4000")
  const [dpi, setDpi] = useState("300")
  const [printWidth, setPrintWidth] = useState("16")
  const [printHeight, setPrintHeight] = useState("20")
  const [unit, setUnit] = useState("in")

  const dpiValue = parsePositive(dpi)

  const fromPixels = useMemo(() => {
    const width = parsePositive(pixelWidth)
    const height = parsePositive(pixelHeight)
    if (!width || !height || !dpiValue) return null
    return {
      widthInches: width / dpiValue,
      heightInches: height / dpiValue,
      megapixels: (width * height) / 1_000_000,
      ratio: aspectRatio(width, height),
    }
  }, [pixelWidth, pixelHeight, dpiValue])

  const fromSize = useMemo(() => {
    const width = parsePositive(printWidth)
    const height = parsePositive(printHeight)
    if (!width || !height || !dpiValue) return null
    const widthInches = unit === "cm" ? width / CENTIMETRES_PER_INCH : width
    const heightInches = unit === "cm" ? height / CENTIMETRES_PER_INCH : height
    const pixelsWide = Math.ceil(widthInches * dpiValue)
    const pixelsHigh = Math.ceil(heightInches * dpiValue)
    return {
      pixelsWide,
      pixelsHigh,
      megapixels: (pixelsWide * pixelsHigh) / 1_000_000,
      ratio: aspectRatio(pixelsWide, pixelsHigh),
    }
  }, [printWidth, printHeight, dpiValue, unit])

  const rating = dpiValue ? rate(dpiValue) : null

  const sizeTable = useMemo(() => {
    const width = parsePositive(pixelWidth)
    const height = parsePositive(pixelHeight)
    if (!width || !height) return []
    return COMMON_SIZES.map((size) => {
      /** Compare against the print's long edge so orientation does not matter. */
      const longEdge = Math.max(width, height)
      const shortEdge = Math.min(width, height)
      const achievable = Math.min(
        longEdge / Math.max(size.width, size.height),
        shortEdge / Math.min(size.width, size.height),
      )
      return { ...size, dpi: achievable }
    })
  }, [pixelWidth, pixelHeight])

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)}>
        <TabsList>
          <TabsTrigger value="pixels">Pixels to print size</TabsTrigger>
          <TabsTrigger value="size">Print size to pixels</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "pixels" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="print-pixel-width">Image width (pixels)</Label>
            <Input
              id="print-pixel-width"
              name="pixelWidth"
              type="number"
              min={1}
              className="mt-1.5"
              value={pixelWidth}
              onChange={(event) => setPixelWidth(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="print-pixel-height">Image height (pixels)</Label>
            <Input
              id="print-pixel-height"
              name="pixelHeight"
              type="number"
              min={1}
              className="mt-1.5"
              value={pixelHeight}
              onChange={(event) => setPixelHeight(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="print-dpi">DPI</Label>
            <Select
              value={dpi}
              onValueChange={(value) => value && setDpi(value as string)}
            >
              <SelectTrigger id="print-dpi" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DPI_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option} DPI
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="print-width">Print width</Label>
            <Input
              id="print-width"
              name="printWidth"
              type="number"
              min={0}
              step={0.1}
              className="mt-1.5"
              value={printWidth}
              onChange={(event) => setPrintWidth(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="print-height">Print height</Label>
            <Input
              id="print-height"
              name="printHeight"
              type="number"
              min={0}
              step={0.1}
              className="mt-1.5"
              value={printHeight}
              onChange={(event) => setPrintHeight(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="print-unit">Unit</Label>
            <Select
              value={unit}
              onValueChange={(value) => value && setUnit(value as string)}
            >
              <SelectTrigger id="print-unit" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Inches</SelectItem>
                <SelectItem value="cm">Centimetres</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="print-dpi-target">DPI</Label>
            <Select
              value={dpi}
              onValueChange={(value) => value && setDpi(value as string)}
            >
              <SelectTrigger id="print-dpi-target" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DPI_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option} DPI
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {rating && (
        <div className={`rounded-lg border p-3 text-sm ${rating.className}`}>
          <span className="font-medium">
            {dpi} DPI: {rating.label}.
          </span>{" "}
          {rating.description}
        </div>
      )}

      {mode === "pixels" && fromPixels && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-xl font-semibold tabular-nums">
              {format(fromPixels.widthInches)} x {format(fromPixels.heightInches)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Inches</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-xl font-semibold tabular-nums">
              {format(fromPixels.widthInches * CENTIMETRES_PER_INCH, 1)} x{" "}
              {format(fromPixels.heightInches * CENTIMETRES_PER_INCH, 1)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Centimetres</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-xl font-semibold tabular-nums">
              {format(fromPixels.megapixels, 1)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Megapixels</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-xl font-semibold tabular-nums">{fromPixels.ratio}</p>
            <p className="text-muted-foreground mt-1 text-xs">Aspect ratio</p>
          </div>
        </div>
      )}

      {mode === "size" && fromSize && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-xl font-semibold tabular-nums">
              {fromSize.pixelsWide.toLocaleString("en-US")}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Pixels wide</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-xl font-semibold tabular-nums">
              {fromSize.pixelsHigh.toLocaleString("en-US")}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Pixels high</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-xl font-semibold tabular-nums">
              {format(fromSize.megapixels, 1)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Megapixels needed</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-xl font-semibold tabular-nums">{fromSize.ratio}</p>
            <p className="text-muted-foreground mt-1 text-xs">Aspect ratio</p>
          </div>
        </div>
      )}

      {mode === "pixels" && sizeTable.length > 0 && (
        <div className="border-border/60 overflow-x-auto rounded-lg border">
          <h2 className="border-border/60 border-b px-3 py-2 text-sm font-medium">
            What this image prints at, by size
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left">
                <th scope="col" className="px-3 py-2 font-medium">
                  Print size
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Effective DPI
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Quality
                </th>
              </tr>
            </thead>
            <tbody>
              {sizeTable.map((size) => (
                <tr key={size.label} className="border-border/60 border-t">
                  <td className="px-3 py-2">{size.label}</td>
                  <td className="px-3 py-2 tabular-nums">{Math.round(size.dpi)}</td>
                  <td className="px-3 py-2">{rate(size.dpi).label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {((mode === "pixels" && !fromPixels) || (mode === "size" && !fromSize)) && (
        <p className="text-destructive text-sm">
          Enter a positive number in every field to see a result.
        </p>
      )}
    </div>
  )
}
