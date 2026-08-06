import { useEffect, useRef, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import JsBarcode from "jsbarcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { canvasToBlob } from "@/lib/image"

const FORMATS = [
  { value: "CODE128", label: "Code 128", hint: "Any ASCII text, general purpose" },
  { value: "EAN13", label: "EAN-13", hint: "12 or 13 digits, retail products" },
  { value: "EAN8", label: "EAN-8", hint: "7 or 8 digits, small retail packaging" },
  { value: "UPC", label: "UPC-A", hint: "11 or 12 digits, North American retail" },
  { value: "CODE39", label: "Code 39", hint: "Digits, capitals, and a few symbols" },
  { value: "ITF14", label: "ITF-14", hint: "13 or 14 digits, shipping cartons" },
  { value: "MSI", label: "MSI", hint: "Digits only, inventory and shelf labels" },
] as const

type Format = (typeof FORMATS)[number]["value"]

const DEFAULTS = { value: "SHADYSHARD-001", format: "CODE128" as Format }

export default function BarcodeGenerator() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [value, setValue] = useState(DEFAULTS.value)
  const [format, setFormat] = useState<Format>(DEFAULTS.format)
  const [barWidth, setBarWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [showText, setShowText] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [svgMarkup, setSvgMarkup] = useState("")

  const selected = FORMATS.find((entry) => entry.value === format)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    if (!value.trim()) {
      svg.replaceChildren()
      setSvgMarkup("")
      setError(null)
      return
    }

    let valid = true
    try {
      JsBarcode(svg, value, {
        format,
        width: barWidth,
        height,
        displayValue: showText,
        fontSize: 16,
        margin: 10,
        background: "#ffffff",
        lineColor: "#000000",
        valid: (isValid) => {
          valid = isValid
        },
      })
    } catch {
      valid = false
    }

    if (valid) {
      setError(null)
      // JsBarcode writes to the element imperatively, so the markup has to be
      // captured here rather than derived during render.
      setSvgMarkup(new XMLSerializer().serializeToString(svg))
    } else {
      svg.replaceChildren()
      setSvgMarkup("")
      setError(
        `"${value}" is not a valid ${selected?.label ?? format} value. Expected: ${selected?.hint ?? "a supported value"}.`,
      )
    }
  }, [value, format, barWidth, height, showText, selected])

  async function toPng(): Promise<Blob | null> {
    const svg = svgRef.current
    if (!svg || error) return null

    const markup = new XMLSerializer().serializeToString(svg)
    const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }))
    try {
      const image = new Image()
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error("The barcode could not be rasterised."))
        image.src = url
      })

      const canvas = document.createElement("canvas")
      canvas.width = image.naturalWidth * 2
      canvas.height = image.naturalHeight * 2
      const context = canvas.getContext("2d")
      if (!context) return null
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      return canvasToBlob(canvas, "image/png")
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  function reset() {
    setValue(DEFAULTS.value)
    setFormat(DEFAULTS.format)
    setBarWidth(2)
    setHeight(100)
    setShowText(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="barcode-value">Value to encode</Label>
          <Input
            id="barcode-value"
            name="value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="0123456789012"
            className="font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode-format">Symbology</Label>
          <Select value={format} onValueChange={(next) => setFormat(next as Format)}>
            <SelectTrigger id="barcode-format" name="format" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && <p className="text-muted-foreground text-xs">{selected.hint}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <span className="text-sm font-medium">Bar width: {barWidth}</span>
          <Slider
            value={[barWidth]}
            min={1}
            max={5}
            step={1}
            onValueChange={(next) => setBarWidth(Array.isArray(next) ? next[0] : next)}
            aria-label="Bar width"
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Height: {height} px</span>
          <Slider
            value={[height]}
            min={40}
            max={200}
            step={10}
            onValueChange={(next) => setHeight(Array.isArray(next) ? next[0] : next)}
            aria-label="Barcode height"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="barcode-show-text"
            name="showText"
            checked={showText}
            onCheckedChange={setShowText}
          />
          <Label htmlFor="barcode-show-text">Show the value below the bars</Label>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="border-border/60 flex justify-center overflow-x-auto rounded-lg border bg-white p-4">
        <svg ref={svgRef} role="img" aria-label={`Barcode for ${value || "no value"}`} />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <DownloadButton
          getBlob={() => new Blob([svgMarkup], { type: "image/svg+xml" })}
          filename="barcode.svg"
          label="Download SVG"
          disabled={!svgMarkup}
        />
        <DownloadButton
          getBlob={toPng}
          filename="barcode.png"
          label="Download PNG"
          disabled={!svgMarkup}
        />
      </div>
    </div>
  )
}
