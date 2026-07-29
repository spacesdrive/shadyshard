import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { parseDelimited, toDelimited } from "@/lib/csv"

const DELIMITERS: { value: string; label: string; character: string | null }[] = [
  { value: "auto", label: "Detect automatically", character: null },
  { value: "comma", label: "Comma", character: "," },
  { value: "semicolon", label: "Semicolon", character: ";" },
  { value: "tab", label: "Tab", character: "\t" },
]

const LARGE_FILE_BYTES = 25 * 1024 * 1024

function detectDelimiter(text: string): string {
  const firstLine = text.slice(
    0,
    text.indexOf("\n") === -1 ? text.length : text.indexOf("\n"),
  )
  const candidates = [",", ";", "\t"]
  let best = ","
  let bestCount = -1
  for (const candidate of candidates) {
    const count = firstLine.split(candidate).length - 1
    if (count > bestCount) {
      best = candidate
      bestCount = count
    }
  }
  return best
}

function baseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "") || "data"
}

interface LoadedFile {
  name: string
  text: string
}

export default function CsvSplitter() {
  const [file, setFile] = useState<LoadedFile | null>(null)
  const [rowsPerFile, setRowsPerFile] = useState("1000")
  const [hasHeader, setHasHeader] = useState(true)
  const [repeatHeader, setRepeatHeader] = useState(true)
  const [delimiterChoice, setDelimiterChoice] = useState("auto")
  const [error, setError] = useState<string | null>(null)

  const delimiter = useMemo(() => {
    if (!file) return ","
    const chosen = DELIMITERS.find((entry) => entry.value === delimiterChoice)
    return chosen?.character ?? detectDelimiter(file.text)
  }, [file, delimiterChoice])

  const rows = useMemo(
    () => (file ? parseDelimited(file.text, delimiter) : []),
    [file, delimiter],
  )

  const size = Number(rowsPerFile)
  const sizeError =
    !Number.isInteger(size) || size < 1
      ? "Rows per file must be a whole number of 1 or more."
      : null

  const header = hasHeader && rows.length > 0 ? rows[0] : null
  const dataRows = header ? rows.slice(1) : rows

  const parts = useMemo(() => {
    if (sizeError || dataRows.length === 0) return []
    const chunks: { index: number; start: number; end: number; rows: string[][] }[] = []
    for (let start = 0; start < dataRows.length; start += size) {
      const slice = dataRows.slice(start, start + size)
      chunks.push({
        index: chunks.length + 1,
        start: start + 1,
        end: start + slice.length,
        rows: header && repeatHeader ? [header, ...slice] : slice,
      })
    }
    return chunks
  }, [dataRows, size, sizeError, header, repeatHeader])

  async function handleFiles(files: File[]) {
    const selected = files[0]
    setError(null)
    if (selected.size > LARGE_FILE_BYTES) {
      setError(
        `This file is ${(selected.size / 1024 / 1024).toFixed(1)} MB. Files above 25 MB may be slow or run out of memory in the browser.`,
      )
    }
    const text = await selected.text()
    if (!text.trim()) {
      setFile(null)
      setError("That file is empty.")
      return
    }
    setFile({ name: selected.name, text })
  }

  return (
    <div className="space-y-5">
      {!file && (
        <FileDropZone
          accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
          onFiles={handleFiles}
          hint="CSV, TSV, or plain delimited text"
        />
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <>
          <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {rows.length} rows, {rows[0]?.length ?? 0} columns
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setError(null)
              }}
            >
              <RotateCcw className="size-4" />
              Choose another file
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="csv-split-rows">Rows per file</Label>
              <Input
                id="csv-split-rows"
                name="rowsPerFile"
                type="number"
                min={1}
                step={1}
                value={rowsPerFile}
                onChange={(event) => setRowsPerFile(event.target.value)}
                className="mt-1.5"
                aria-invalid={sizeError ? true : undefined}
              />
              {sizeError && <p className="text-destructive mt-1 text-xs">{sizeError}</p>}
            </div>

            <div>
              <Label htmlFor="csv-split-delimiter">Delimiter</Label>
              <Select
                value={delimiterChoice}
                onValueChange={(next) => next && setDelimiterChoice(next as string)}
              >
                <SelectTrigger id="csv-split-delimiter" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIMITERS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Switch
                id="csv-split-header"
                name="hasHeader"
                checked={hasHeader}
                onCheckedChange={setHasHeader}
              />
              <Label htmlFor="csv-split-header" className="font-normal">
                First row is a header
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="csv-split-repeat"
                name="repeatHeader"
                checked={repeatHeader}
                disabled={!hasHeader}
                onCheckedChange={setRepeatHeader}
              />
              <Label htmlFor="csv-split-repeat" className="font-normal">
                Repeat the header in every part
              </Label>
            </div>
          </div>

          {parts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">
                {parts.length} {parts.length === 1 ? "part" : "parts"} from{" "}
                {dataRows.length} data rows
              </h3>
              <ul className="mt-2 space-y-2">
                {parts.map((part) => (
                  <li
                    key={part.index}
                    className="border-border/60 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm">
                        {baseName(file.name)}-part-{part.index}.csv
                      </p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        rows {part.start} to {part.end}
                      </p>
                    </div>
                    <DownloadButton
                      getBlob={() =>
                        new Blob([toDelimited(part.rows, delimiter)], {
                          type: "text/csv",
                        })
                      }
                      filename={`${baseName(file.name)}-part-${part.index}.csv`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parts.length === 0 && !sizeError && (
            <p className="text-muted-foreground text-sm">
              There are no data rows to split. If the file has no header row, switch off
              the header option.
            </p>
          )}
        </>
      )}
    </div>
  )
}
