import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="52" fill="#7c3aed" />
  <path d="M38 62l16 16 30-34" fill="none" stroke="#fff" stroke-width="10"
    stroke-linecap="round" stroke-linejoin="round" />
</svg>`

interface Rendered {
  dataUrl: string
  width: number
  height: number
}

function loadSvg(markup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!markup.trim()) {
      reject(new Error("Paste some SVG markup or upload an .svg file."))
      return
    }
    if (!/<svg[\s>]/i.test(markup)) {
      reject(new Error("This does not look like SVG markup: no <svg> element found."))
      return
    }
    const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }))
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(
        new Error("The browser could not render this SVG. Check it for syntax errors."),
      )
    }
    image.src = url
  })
}

function intrinsicSize(image: HTMLImageElement, markup: string) {
  if (image.naturalWidth > 0 && image.naturalHeight > 0) {
    return { width: image.naturalWidth, height: image.naturalHeight }
  }
  // Firefox reports 0 for an SVG with no width/height attributes, so fall
  // back to the viewBox, which is what determines the aspect ratio anyway.
  const viewBox = markup.match(
    /viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i,
  )
  if (viewBox) return { width: Number(viewBox[1]), height: Number(viewBox[2]) }
  return null
}

export default function SvgToPng() {
  const [markup, setMarkup] = useState(SAMPLE_SVG)
  const [width, setWidth] = useState("512")
  const [useBackground, setUseBackground] = useState(false)
  const [background, setBackground] = useState("#ffffff")
  const [rendered, setRendered] = useState<Rendered | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const outputWidth = Number(width)

    async function render() {
      if (!Number.isFinite(outputWidth) || outputWidth < 1 || outputWidth > 8000) {
        setRendered(null)
        setError("Output width must be a number between 1 and 8000.")
        return
      }
      try {
        const image = await loadSvg(markup)
        const size = intrinsicSize(image, markup)
        if (!size) {
          throw new Error(
            "This SVG has no width, height, or viewBox, so its aspect ratio is unknown.",
          )
        }
        const outputHeight = Math.max(
          1,
          Math.round((outputWidth * size.height) / size.width),
        )
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(outputWidth)
        canvas.height = outputHeight
        const context = canvas.getContext("2d")
        if (!context) throw new Error("Canvas 2D context is not available.")
        if (useBackground) {
          context.fillStyle = background
          context.fillRect(0, 0, canvas.width, canvas.height)
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        if (cancelled) return
        setRendered({
          dataUrl: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height,
        })
        setError(null)
      } catch (thrown) {
        if (cancelled) return
        setRendered(null)
        setError(thrown instanceof Error ? thrown.message : "Could not convert this SVG.")
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [markup, width, useBackground, background])

  async function handleFile(files: File[]) {
    setMarkup(await files[0].text())
  }

  return (
    <div className="space-y-5">
      <FileDropZone
        accept="image/svg+xml,.svg"
        onFiles={handleFile}
        hint="One .svg file"
      />

      <div>
        <Label htmlFor="svg-markup">SVG markup</Label>
        <Textarea
          id="svg-markup"
          name="markup"
          value={markup}
          onChange={(event) => setMarkup(event.target.value)}
          rows={8}
          className="mt-1.5 font-mono text-xs"
          placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...>'
        />
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <div className="w-40">
          <Label htmlFor="svg-width">Output width</Label>
          <Input
            id="svg-width"
            name="width"
            type="number"
            inputMode="numeric"
            value={width}
            onChange={(event) => setWidth(event.target.value)}
            className="mt-1.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="svg-background-toggle"
            name="useBackground"
            checked={useBackground}
            onCheckedChange={setUseBackground}
          />
          <Label htmlFor="svg-background-toggle" className="font-normal">
            Background color
          </Label>
        </div>
        {useBackground && (
          <div>
            <Label htmlFor="svg-background" className="sr-only">
              Background color
            </Label>
            <input
              id="svg-background"
              name="background"
              type="color"
              value={background}
              onChange={(event) => setBackground(event.target.value)}
              className="border-border/60 size-9 cursor-pointer rounded-lg border bg-transparent"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {rendered && (
        <div className="space-y-3">
          <div className="border-border/60 bg-muted/30 flex justify-center rounded-xl border p-4">
            <img
              src={rendered.dataUrl}
              alt="Preview of the rasterized PNG"
              className="max-h-72 object-contain"
            />
          </div>
          <p className="text-muted-foreground text-sm tabular-nums">
            Output size: {rendered.width} x {rendered.height} px
          </p>
          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={async () => (await fetch(rendered.dataUrl)).blob()}
              filename="image.png"
              label="Download PNG"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMarkup(SAMPLE_SVG)
                setWidth("512")
                setUseBackground(false)
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
