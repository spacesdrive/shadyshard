import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { toDelimited } from "@/lib/csv"

const FORMATS = [
  { value: "csv", label: "CSV", extension: "csv", mime: "text/csv" },
  { value: "tsv", label: "TSV", extension: "tsv", mime: "text/tab-separated-values" },
  { value: "json", label: "JSON objects", extension: "json", mime: "application/json" },
] as const

type Format = (typeof FORMATS)[number]["value"]

function splitLines(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0)
}

/**
 * Finds column boundaries by looking for character positions that are blank on
 * every row. A run of such positions is a gap, and the first position after it
 * starts the next field.
 */
function detectWidths(lines: string[]): number[] {
  if (lines.length === 0) return []
  const longest = Math.max(...lines.map((line) => line.length))

  const blank: boolean[] = []
  for (let position = 0; position < longest; position += 1) {
    blank[position] = lines.every((line) => (line[position] ?? " ") === " ")
  }

  const starts = [0]
  for (let position = 1; position < longest; position += 1) {
    if (blank[position - 1] && !blank[position]) starts.push(position)
  }

  return starts.map((start, index) =>
    index === starts.length - 1 ? longest - start : starts[index + 1] - start,
  )
}

function parseWidths(text: string): { widths: number[]; error: string | null } {
  const parts = text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length === 0) return { widths: [], error: null }

  const widths: number[] = []
  for (const part of parts) {
    const value = Number(part)
    if (!Number.isInteger(value) || value < 1) {
      return { widths: [], error: `"${part}" is not a whole number of characters.` }
    }
    widths.push(value)
  }
  return { widths, error: null }
}

function sliceRow(line: string, widths: number[], trim: boolean): string[] {
  const fields: string[] = []
  let cursor = 0
  for (const width of widths) {
    const field = line.slice(cursor, cursor + width)
    fields.push(trim ? field.trim() : field)
    cursor += width
  }
  if (cursor < line.length) {
    const rest = line.slice(cursor)
    fields.push(trim ? rest.trim() : rest)
  }
  return fields
}

export default function FixedWidthToCsv() {
  const [text, setText] = useState("")
  const [widthsText, setWidthsText] = useState("")
  const [format, setFormat] = useState<Format>("csv")
  const [hasHeader, setHasHeader] = useState(true)
  const [trimFields, setTrimFields] = useState(true)

  const lines = useMemo(() => splitLines(text), [text])
  const parsedWidths = useMemo(() => parseWidths(widthsText), [widthsText])

  const widths = useMemo(() => {
    if (parsedWidths.widths.length > 0) return parsedWidths.widths
    return detectWidths(lines)
  }, [parsedWidths.widths, lines])

  const rows = useMemo(
    () => lines.map((line) => sliceRow(line, widths, trimFields)),
    [lines, widths, trimFields],
  )

  const output = useMemo(() => {
    if (rows.length === 0) return ""

    if (format === "json") {
      const header = hasHeader
        ? rows[0].map((field, index) => field || `column_${index + 1}`)
        : rows[0].map((_, index) => `column_${index + 1}`)
      const body = hasHeader ? rows.slice(1) : rows
      const records = body.map((row) =>
        Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])),
      )
      return JSON.stringify(records, null, 2)
    }

    return toDelimited(rows, format === "tsv" ? "\t" : ",")
  }, [rows, format, hasHeader])

  const selectedFormat = FORMATS.find((entry) => entry.value === format)

  function reset() {
    setText("")
    setWidthsText("")
    setFormat("csv")
    setHasHeader(true)
    setTrimFields(true)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fixed-width-input">Fixed width text</Label>
        <Textarea
          id="fixed-width-input"
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={
            "ID        NAME                CITY\n0001      Ada Lovelace        London"
          }
          className="min-h-48 resize-y font-mono text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fixed-width-widths">
            Column widths (leave blank to detect)
          </Label>
          <Input
            id="fixed-width-widths"
            name="widths"
            value={widthsText}
            onChange={(event) => setWidthsText(event.target.value)}
            placeholder="10,20,8"
            className="font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fixed-width-format">Output format</Label>
          <Select value={format} onValueChange={(value) => setFormat(value as Format)}>
            <SelectTrigger id="fixed-width-format" name="format" className="w-full">
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
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Switch
            id="fixed-width-header"
            name="hasHeader"
            checked={hasHeader}
            onCheckedChange={setHasHeader}
          />
          <Label htmlFor="fixed-width-header">First row is a header</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="fixed-width-trim"
            name="trimFields"
            checked={trimFields}
            onCheckedChange={setTrimFields}
          />
          <Label htmlFor="fixed-width-trim">Trim padding from each field</Label>
        </div>
      </div>

      {parsedWidths.error && (
        <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {parsedWidths.error}
        </p>
      )}

      {widths.length > 0 && (
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
          <p className="text-muted-foreground text-sm">
            {parsedWidths.widths.length > 0 ? "Using your widths: " : "Detected widths: "}
            <span className="text-foreground font-mono">{widths.join(", ")}</span>
          </p>
          {parsedWidths.widths.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWidthsText(widths.join(","))}
            >
              <Wand2 className="size-4" />
              Edit these widths
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {rows.length} {rows.length === 1 ? "row" : "rows"}, {widths.length}{" "}
          {widths.length === 1 ? "column" : "columns"}
        </p>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={output} label="Copy output" />
          <DownloadButton
            getBlob={() =>
              new Blob([output], { type: selectedFormat?.mime ?? "text/plain" })
            }
            filename={`converted.${selectedFormat?.extension ?? "txt"}`}
            disabled={!output}
          />
          <Button variant="outline" size="sm" onClick={reset} disabled={!text}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      <Textarea
        id="fixed-width-output"
        name="output"
        value={output}
        readOnly
        className="min-h-48 resize-y font-mono text-sm"
        aria-label="Converted output"
      />
    </div>
  )
}
