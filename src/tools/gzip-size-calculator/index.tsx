import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { formatBytes } from "@/lib/image"

const FORMATS: { id: CompressionFormat; label: string; description: string }[] = [
  { id: "gzip", label: "gzip", description: "What most servers send" },
  { id: "deflate", label: "deflate", description: "zlib container" },
  { id: "deflate-raw", label: "raw deflate", description: "No container bytes" },
]

interface Measurement {
  rawBytes: number
  sizes: Record<string, number>
  label: string
}

async function compressedSize(data: Blob, format: CompressionFormat): Promise<number> {
  const stream = data.stream().pipeThrough(new CompressionStream(format))
  return (await new Response(stream).blob()).size
}

async function measure(data: Blob, label: string): Promise<Measurement> {
  const sizes: Record<string, number> = {}
  for (const format of FORMATS) {
    sizes[format.id] = await compressedSize(data, format.id)
  }
  return { rawBytes: data.size, sizes, label }
}

export default function GzipSizeCalculator() {
  const [input, setInput] = useState("")
  const [droppedFile, setDroppedFile] = useState<File | null>(null)
  const [measurement, setMeasurement] = useState<Measurement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (droppedFile) return

    if (!input) {
      setMeasurement(null)
      return
    }

    let cancelled = false
    const blob = new Blob([input], { type: "text/plain" })
    measure(blob, "Pasted text")
      .then((result) => {
        if (!cancelled) {
          setMeasurement(result)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setError("This browser could not run gzip compression.")
      })

    return () => {
      cancelled = true
    }
  }, [input, droppedFile])

  async function handleFile(files: File[]) {
    const file = files[0]
    setDroppedFile(file)
    setInput("")
    setError(null)
    try {
      setMeasurement(await measure(file, file.name))
    } catch {
      setError("Could not read and compress this file.")
    }
  }

  function reset() {
    setInput("")
    setDroppedFile(null)
    setMeasurement(null)
    setError(null)
  }

  const gzipSize = measurement?.sizes.gzip ?? 0
  const saving =
    measurement && measurement.rawBytes > 0
      ? ((measurement.rawBytes - gzipSize) / measurement.rawBytes) * 100
      : 0

  return (
    <div className="space-y-5">
      <FileDropZone
        accept="*/*"
        onFiles={handleFile}
        hint="Any file, or paste text below"
      />

      <div>
        <Label htmlFor="gzip-input">Text to measure</Label>
        <Textarea
          id="gzip-input"
          name="content"
          value={input}
          onChange={(event) => {
            setDroppedFile(null)
            setInput(event.target.value)
          }}
          placeholder="Paste CSS, JavaScript, JSON, HTML, or any other text."
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {measurement && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Measuring <span className="font-medium">{measurement.label}</span>
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">
                {formatBytes(measurement.rawBytes)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Raw size</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold text-emerald-500 tabular-nums">
                {formatBytes(gzipSize)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Gzipped</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">
                {saving > 0 ? `${saving.toFixed(1)}%` : "0%"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Smaller</p>
            </div>
          </div>

          <div className="border-border/60 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Compressed size for each available algorithm
              </caption>
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Algorithm
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Size
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Ratio
                  </th>
                </tr>
              </thead>
              <tbody>
                {FORMATS.map((format) => {
                  const size = measurement.sizes[format.id]
                  const ratio = measurement.rawBytes > 0 ? measurement.rawBytes / size : 0
                  return (
                    <tr key={format.id} className="border-border/60 border-t">
                      <td className="px-3 py-2">
                        <span className="font-medium">{format.label}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {format.description}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                        {size.toLocaleString("en-US")} B
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                        {ratio > 0 ? `${ratio.toFixed(2)}x` : "-"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={reset}
        disabled={!input && !droppedFile}
      >
        Reset
      </Button>
    </div>
  )
}
