import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { loadImageFromFile, drawToCanvas, canvasToBlob } from "@/lib/image"

/**
 * Standard RGB transformation matrices for each color vision deficiency,
 * row-major. These are the commonly cited approximations used by design
 * review tools rather than a full LMS colour space conversion.
 */
const MATRICES: Record<string, number[]> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  protanomaly: [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  deuteranomaly: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  tritanomaly: [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817],
  achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
  achromatomaly: [0.618, 0.32, 0.062, 0.163, 0.775, 0.062, 0.163, 0.32, 0.516],
}

const TYPES = [
  { value: "protanopia", label: "Protanopia (no red cones)" },
  { value: "protanomaly", label: "Protanomaly (reduced red)" },
  { value: "deuteranopia", label: "Deuteranopia (no green cones)" },
  { value: "deuteranomaly", label: "Deuteranomaly (reduced green)" },
  { value: "tritanopia", label: "Tritanopia (no blue cones)" },
  { value: "tritanomaly", label: "Tritanomaly (reduced blue)" },
  { value: "achromatopsia", label: "Achromatopsia (no color)" },
  { value: "achromatomaly", label: "Achromatomaly (reduced color)" },
]

function simulate(source: HTMLCanvasElement, matrix: number[]): HTMLCanvasElement {
  const output = document.createElement("canvas")
  output.width = source.width
  output.height = source.height
  const context = output.getContext("2d")
  const sourceContext = source.getContext("2d")
  if (!context || !sourceContext) throw new Error("Canvas 2D context is not available.")

  const image = sourceContext.getImageData(0, 0, source.width, source.height)
  const pixels = image.data
  for (let i = 0; i < pixels.length; i += 4) {
    const red = pixels[i]
    const green = pixels[i + 1]
    const blue = pixels[i + 2]
    pixels[i] = matrix[0] * red + matrix[1] * green + matrix[2] * blue
    pixels[i + 1] = matrix[3] * red + matrix[4] * green + matrix[5] * blue
    pixels[i + 2] = matrix[6] * red + matrix[7] * green + matrix[8] * blue
  }
  context.putImageData(image, 0, 0)
  return output
}

export default function ColorBlindnessSimulator() {
  const [file, setFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [simulatedUrl, setSimulatedUrl] = useState<string | null>(null)
  const [type, setType] = useState("deuteranopia")
  const [error, setError] = useState<string | null>(null)
  const sourceCanvas = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!sourceCanvas.current) return
    try {
      const simulated = simulate(sourceCanvas.current, MATRICES[type])
      setSimulatedUrl(simulated.toDataURL("image/png"))
      setError(null)
    } catch (thrown) {
      setError(
        thrown instanceof Error ? thrown.message : "Could not simulate this image.",
      )
    }
  }, [type, file])

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    try {
      const image = await loadImageFromFile(selected)
      sourceCanvas.current = drawToCanvas(image, image.naturalWidth, image.naturalHeight)
      setOriginalUrl(URL.createObjectURL(selected))
      setFile(selected)
    } catch (thrown) {
      sourceCanvas.current = null
      setFile(null)
      setError(thrown instanceof Error ? thrown.message : "Could not read this image.")
    }
  }

  function reset() {
    sourceCanvas.current = null
    setFile(null)
    setOriginalUrl(null)
    setSimulatedUrl(null)
    setError(null)
  }

  const selectedLabel = TYPES.find((option) => option.value === type)?.label ?? type

  return (
    <div className="space-y-5">
      {!file && (
        <FileDropZone
          accept="image/png,image/jpeg,image/webp"
          onFiles={handleFile}
          hint="PNG, JPG, or WebP"
        />
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div className="space-y-4">
          <div className="max-w-sm">
            <Label htmlFor="cvd-type">Vision type</Label>
            <Select value={type} onValueChange={(next) => next && setType(next)}>
              <SelectTrigger id="cvd-type" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <figure>
              <img
                src={originalUrl ?? ""}
                alt="The original image as uploaded"
                className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
              />
              <figcaption className="text-muted-foreground mt-2 text-center text-xs">
                Original
              </figcaption>
            </figure>
            <figure>
              <img
                src={simulatedUrl ?? ""}
                alt={`The same image simulated as seen with ${selectedLabel}`}
                className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
              />
              <figcaption className="text-muted-foreground mt-2 text-center text-xs">
                {selectedLabel}
              </figcaption>
            </figure>
          </div>

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={() =>
                sourceCanvas.current
                  ? canvasToBlob(
                      simulate(sourceCanvas.current, MATRICES[type]),
                      "image/png",
                    )
                  : null
              }
              filename={`${file.name.replace(/\.[^.]+$/, "")}-${type}.png`}
              label="Download simulation"
            />
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
