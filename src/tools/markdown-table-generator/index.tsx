import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { parseDelimited } from "@/lib/csv"

type Alignment = "left" | "center" | "right"

const ALIGNMENTS: { value: Alignment; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
]

const DELIMITERS = [
  { value: "auto", label: "Detect automatically" },
  { value: ",", label: "Comma" },
  { value: "\t", label: "Tab" },
  { value: ";", label: "Semicolon" },
  { value: "|", label: "Pipe" },
]

function detectDelimiter(text: string): string {
  const firstLine = text.split("\n")[0] ?? ""
  const candidates = ["\t", ",", ";", "|"]
  let best = ","
  let bestCount = 0
  for (const candidate of candidates) {
    const count = firstLine.split(candidate).length - 1
    if (count > bestCount) {
      best = candidate
      bestCount = count
    }
  }
  return best
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ")
}

function separatorCell(alignment: Alignment, width: number): string {
  const dashes = "-".repeat(Math.max(3, width))
  if (alignment === "center") return `:${dashes.slice(2)}:`
  if (alignment === "right") return `${dashes.slice(1)}:`
  return dashes
}

function buildTable(
  rows: string[][],
  alignments: Alignment[],
  firstRowIsHeader: boolean,
  pad: boolean,
): string {
  const columnCount = Math.max(...rows.map((row) => row.length))
  const normalized = rows.map((row) =>
    Array.from({ length: columnCount }, (_, index) => escapeCell(row[index] ?? "")),
  )

  const header = firstRowIsHeader
    ? normalized[0]
    : Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`)
  const body = firstRowIsHeader ? normalized.slice(1) : normalized

  const widths = Array.from({ length: columnCount }, (_, index) =>
    pad ? Math.max(header[index].length, ...body.map((row) => row[index].length), 3) : 3,
  )

  const renderRow = (cells: string[]) =>
    `| ${cells.map((cell, index) => (pad ? cell.padEnd(widths[index]) : cell)).join(" | ")} |`

  const separator = `| ${alignments
    .slice(0, columnCount)
    .map((alignment, index) => separatorCell(alignment, widths[index]))
    .join(" | ")} |`

  return [renderRow(header), separator, ...body.map(renderRow)].join("\n")
}

const EXAMPLE = `Name,Role,Location
Ada,Engineer,London
Grace,Compiler author,New York`

export default function MarkdownTableGenerator() {
  const [input, setInput] = useState(EXAMPLE)
  const [delimiter, setDelimiter] = useState("auto")
  const [firstRowIsHeader, setFirstRowIsHeader] = useState(true)
  const [pad, setPad] = useState(true)
  const [alignment, setAlignment] = useState<Alignment>("left")

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null }

    const activeDelimiter = delimiter === "auto" ? detectDelimiter(input) : delimiter
    const rows = parseDelimited(input, activeDelimiter).filter((row) =>
      row.some((cell) => cell.trim() !== ""),
    )

    if (rows.length === 0) {
      return { output: "", error: "No rows were found in this input." }
    }
    if (firstRowIsHeader && rows.length < 2) {
      return {
        output: "",
        error: "Add at least one data row, or turn off the header row option.",
      }
    }

    const columnCount = Math.max(...rows.map((row) => row.length))
    const alignments = Array.from({ length: columnCount }, () => alignment)
    return {
      output: buildTable(rows, alignments, firstRowIsHeader, pad),
      error: null,
    }
  }, [input, delimiter, firstRowIsHeader, pad, alignment])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="markdown-table-input">CSV, TSV, or pasted spreadsheet rows</Label>
        <Textarea
          id="markdown-table-input"
          name="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="markdown-table-delimiter">Delimiter</Label>
          <Select
            value={delimiter}
            onValueChange={(value) => value && setDelimiter(value)}
          >
            <SelectTrigger id="markdown-table-delimiter" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELIMITERS.map((option) => (
                <SelectItem key={option.label} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="markdown-table-alignment">Column alignment</Label>
          <Select
            value={alignment}
            onValueChange={(value) => value && setAlignment(value as Alignment)}
          >
            <SelectTrigger id="markdown-table-alignment" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALIGNMENTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="markdown-table-header"
            name="firstRowIsHeader"
            checked={firstRowIsHeader}
            onCheckedChange={setFirstRowIsHeader}
          />
          <Label htmlFor="markdown-table-header" className="font-normal">
            First row is the header
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="markdown-table-pad"
            name="pad"
            checked={pad}
            onCheckedChange={setPad}
          />
          <Label htmlFor="markdown-table-pad" className="font-normal">
            Pad columns to equal width
          </Label>
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy Markdown" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: "text/markdown" })}
          filename="table.md"
          label="Download .md"
          disabled={!output}
        />
      </div>

      <div>
        <Label htmlFor="markdown-table-output">Markdown</Label>
        <Textarea
          id="markdown-table-output"
          name="markdown"
          value={output}
          readOnly
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
        />
      </div>
    </div>
  )
}
