import { useEffect, useState } from "react"
import { AlertCircle, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { formatBytes } from "@/lib/image"

const ALGORITHMS: { id: CompressionFormat; label: string }[] = [
  { id: "gzip", label: "Gzip" },
  { id: "deflate", label: "Deflate" },
  { id: "deflate-raw", label: "Raw deflate" },
]

const compressionSupported = typeof CompressionStream !== "undefined"

async function compressedSize(
  bytes: Uint8Array<ArrayBuffer>,
  format: CompressionFormat,
): Promise<number> {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream(format))
  return (await new Response(stream).arrayBuffer()).byteLength
}

interface Measurement {
  rawBytes: number
  sizes: Record<string, number>
}

export default function GzipSizeCalculator() {
  const [source, setSource] = useState<"text" | "file">("text")
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [budgetKb, setBudgetKb] = useState("")
  const [measurement, setMeasurement] = useState<Measurement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!compressionSupported) return

    let cancelled = false

    async function measure() {
      const bytes =
        source === "text"
          ? new TextEncoder().encode(text)
          : file
            ? new Uint8Array(await file.arrayBuffer())
            : null

      if (!bytes || bytes.byteLength === 0) {
        if (!cancelled) setMeasurement(null)
        return
      }

      const sizes: Record<string, number> = {}
      for (const algorithm of ALGORITHMS) {
        sizes[algorithm.id] = await compressedSize(bytes, algorithm.id)
      }
      if (!cancelled) setMeasurement({ rawBytes: bytes.byteLength, sizes })
    }

    measure().catch((e: unknown) => {
      if (!cancelled) {
        setError(e instanceof Error ? e.message : "Could not compress this input.")
      }
    })

    return () => {
      cancelled = true
    }
  }, [source, text, file])

  const budget = Number(budgetKb)
  const budgetValid = budgetKb.trim() !== "" && Number.isFinite(budget) && budget > 0
  const budgetError =
    budgetKb.trim() !== "" && !budgetValid
      ? "Enter a budget as a positive number of kilobytes, for example 65."
      : null

  function reset() {
    setText("")
    setFile(null)
    setBudgetKb("")
    setMeasurement(null)
    setError(null)
  }

  if (!compressionSupported) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <span>
          This browser does not support the Compression Streams API, which this tool uses
          to compress locally. Try a current version of Chrome, Edge, Firefox, or Safari.
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Tabs
        value={source}
        onValueChange={(value) => {
          setSource(value as "text" | "file")
          setMeasurement(null)
          setError(null)
        }}
      >
        <TabsList>
          <TabsTrigger value="text">Paste text</TabsTrigger>
          <TabsTrigger value="file">Drop a file</TabsTrigger>
        </TabsList>
      </Tabs>

      {source === "text" ? (
        <div>
          <Label htmlFor="gzip-input">Content to measure</Label>
          <Textarea
            id="gzip-input"
            name="input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste CSS, JavaScript, HTML, JSON, or any other text"
            className="mt-1.5 min-h-44 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      ) : file ? (
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-muted-foreground text-xs">{formatBytes(file.size)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setFile(null)}>
            <Trash2 className="size-4" />
            Choose another
          </Button>
        </div>
      ) : (
        <FileDropZone
          accept="*/*"
          onFiles={(files) => {
            setFile(files[0])
            setError(null)
          }}
          hint="Any file, for example a built .js or .css bundle"
        />
      )}

      <div>
        <Label htmlFor="gzip-budget">Budget in KB (optional)</Label>
        <Input
          id="gzip-budget"
          name="budget"
          type="number"
          min={1}
          step="any"
          inputMode="decimal"
          value={budgetKb}
          onChange={(event) => setBudgetKb(event.target.value)}
          placeholder="65"
          aria-invalid={budgetError ? true : undefined}
          className="mt-1.5 sm:max-w-40"
        />
        {budgetError && <p className="text-destructive mt-1.5 text-sm">{budgetError}</p>}
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {measurement && (
        <div className="space-y-4">
          <div className="border-border/60 rounded-lg border p-4">
            <p className="text-muted-foreground text-xs">Uncompressed</p>
            <p className="text-2xl font-semibold tabular-nums">
              {formatBytes(measurement.rawBytes)}
            </p>
            <p className="text-muted-foreground text-xs tabular-nums">
              {measurement.rawBytes.toLocaleString()} bytes
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {ALGORITHMS.map((algorithm) => {
              const size = measurement.sizes[algorithm.id]
              const ratio = size / measurement.rawBytes
              const withinBudget = budgetValid ? size <= budget * 1024 : null
              return (
                <div
                  key={algorithm.id}
                  className="border-border/60 bg-card space-y-2 rounded-lg border p-4"
                >
                  <p className="text-muted-foreground text-xs">{algorithm.label}</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {formatBytes(size)}
                  </p>
                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.min(100, ratio * 100)}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {(ratio * 100).toFixed(1)} percent of the original,{" "}
                    {formatBytes(measurement.rawBytes - size)} saved
                  </p>
                  {withinBudget !== null && (
                    <p
                      className={
                        withinBudget
                          ? "text-sm font-medium"
                          : "text-destructive text-sm font-medium"
                      }
                    >
                      {withinBudget
                        ? `Within the ${budget} KB budget`
                        : `Over the ${budget} KB budget by ${formatBytes(size - budget * 1024)}`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <Button variant="outline" size="sm" onClick={reset}>
            <Trash2 className="size-4" />
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
