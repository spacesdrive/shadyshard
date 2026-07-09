import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/image"

export default function FileSizeAnalyzer() {
  const [files, setFiles] = useState<File[]>([])

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles])
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const stats = useMemo(() => {
    if (files.length === 0) return null
    const total = files.reduce((sum, f) => sum + f.size, 0)
    const largest = files.reduce((max, f) => (f.size > max.size ? f : max), files[0])
    return { total, average: total / files.length, largest }
  }, [files])

  return (
    <div className="space-y-5">
      <FileDropZone accept="*/*" multiple onFiles={addFiles} hint="One or more files" />

      {files.length > 0 && (
        <>
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="border-border/60 rounded-lg border p-3 text-center">
                <p className="text-lg font-semibold tabular-nums">
                  {formatBytes(stats.total)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">Total</p>
              </div>
              <div className="border-border/60 rounded-lg border p-3 text-center">
                <p className="text-lg font-semibold tabular-nums">
                  {formatBytes(stats.average)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">Average</p>
              </div>
              <div className="border-border/60 rounded-lg border p-3 text-center">
                <p className="truncate text-lg font-semibold tabular-nums">
                  {formatBytes(stats.largest.size)}
                </p>
                <p className="text-muted-foreground mt-1 truncate text-xs">
                  Largest: {stats.largest.name}
                </p>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="border-border/60 flex items-center justify-between gap-2 rounded-lg border p-3 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="text-muted-foreground shrink-0 tabular-nums">
                  {formatBytes(file.size)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>

          <Button type="button" variant="outline" size="sm" onClick={() => setFiles([])}>
            Reset
          </Button>
        </>
      )}
    </div>
  )
}
