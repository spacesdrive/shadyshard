import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { toDelimited } from "@/lib/csv"

const OUTPUT_FORMATS = [
  { value: "csv", label: "CSV", extension: "csv", mime: "text/csv" },
  { value: "tsv", label: "TSV", extension: "tsv", mime: "text/tab-separated-values" },
  { value: "json", label: "JSON objects", extension: "json", mime: "application/json" },
  { value: "rows", label: "JSON rows", extension: "json", mime: "application/json" },
  { value: "markdown", label: "Markdown", extension: "md", mime: "text/markdown" },
] as const

type OutputFormat = (typeof OUTPUT_FORMATS)[number]["value"]

function cellText(cell: HTMLTableCellElement): string {
  return (cell.textContent ?? "").replace(/\s+/g, " ").trim()
}

/**
 * Expands a table into a rectangular grid. A cell with colspan or rowspan
 * occupies several grid positions, so the column index has to skip over
 * positions an earlier row already claimed rather than counting cells.
 */
function tableToGrid(table: HTMLTableElement, repeatMerged: boolean): string[][] {
  const grid: string[][] = []

  Array.from(table.rows).forEach((row, rowIndex) => {
    if (!grid[rowIndex]) grid[rowIndex] = []
    let column = 0

    Array.from(row.cells).forEach((cell) => {
      while (grid[rowIndex][column] !== undefined) column++
      const text = cellText(cell)
      const colspan = Math.max(1, cell.colSpan)
      const rowspan = Math.max(1, cell.rowSpan)

      for (let dr = 0; dr < rowspan; dr++) {
        for (let dc = 0; dc < colspan; dc++) {
          if (!grid[rowIndex + dr]) grid[rowIndex + dr] = []
          const isOrigin = dr === 0 && dc === 0
          grid[rowIndex + dr][column + dc] = isOrigin || repeatMerged ? text : ""
        }
      }
      column += colspan
    })
  })

  const width = grid.reduce((max, row) => Math.max(max, row.length), 0)
  return grid.map((row) => {
    const filled = Array.from({ length: width }, (_, index) => row[index] ?? "")
    return filled
  })
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|")
}

function toMarkdown(grid: string[][], hasHeader: boolean): string {
  if (grid.length === 0) return ""
  const width = grid[0].length
  const header = hasHeader
    ? grid[0]
    : Array.from({ length: width }, (_, index) => `Column ${index + 1}`)
  const body = hasHeader ? grid.slice(1) : grid
  const lines = [
    `| ${header.map(escapeMarkdownCell).join(" | ")} |`,
    `| ${Array.from({ length: width }, () => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.map(escapeMarkdownCell).join(" | ")} |`),
  ]
  return lines.join("\n")
}

function toJsonObjects(grid: string[][]): string {
  if (grid.length === 0) return "[]"
  const [header, ...rows] = grid
  const keys = header.map((key, index) => key || `column_${index + 1}`)
  const records = rows.map((row) =>
    Object.fromEntries(keys.map((key, index) => [key, row[index] ?? ""])),
  )
  return JSON.stringify(records, null, 2)
}

export default function HtmlTableConverter() {
  const [html, setHtml] = useState("")
  const [tableIndex, setTableIndex] = useState(0)
  const [format, setFormat] = useState<OutputFormat>("csv")
  const [hasHeader, setHasHeader] = useState(true)
  const [repeatMerged, setRepeatMerged] = useState(true)

  const tables = useMemo(() => {
    if (!html.trim()) return []
    const document = new DOMParser().parseFromString(html, "text/html")
    return Array.from(document.querySelectorAll("table"))
  }, [html])

  const activeIndex = tableIndex < tables.length ? tableIndex : 0
  const grid = useMemo(
    () => (tables[activeIndex] ? tableToGrid(tables[activeIndex], repeatMerged) : []),
    [tables, activeIndex, repeatMerged],
  )

  const output = useMemo(() => {
    if (grid.length === 0) return ""
    switch (format) {
      case "csv":
        return toDelimited(grid, ",")
      case "tsv":
        return toDelimited(grid, "\t")
      case "json":
        return hasHeader ? toJsonObjects(grid) : JSON.stringify(grid, null, 2)
      case "rows":
        return JSON.stringify(grid, null, 2)
      default:
        return toMarkdown(grid, hasHeader)
    }
  }, [grid, format, hasHeader])

  const selectedFormat = OUTPUT_FORMATS.find((entry) => entry.value === format)!
  const showsNoTables = html.trim().length > 0 && tables.length === 0

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="html-table-input">HTML</Label>
        <Textarea
          id="html-table-input"
          name="html"
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          placeholder="<table><tr><th>Name</th><th>Role</th></tr><tr><td>Ada</td><td>Engineer</td></tr></table>"
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {showsNoTables && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            No table element was found in this markup. Paste the HTML that contains a
            complete table element, including its opening and closing tags.
          </span>
        </div>
      )}

      {tables.length > 1 && (
        <div className="max-w-sm">
          <Label htmlFor="html-table-select">Table to convert</Label>
          <Select
            value={String(activeIndex)}
            onValueChange={(value) => value && setTableIndex(Number(value))}
          >
            <SelectTrigger id="html-table-select" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tables.map((table, index) => (
                <SelectItem key={index} value={String(index)}>
                  Table {index + 1} ({table.rows.length} rows)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <span className="text-sm font-medium">Output format</span>
        <Tabs
          value={format}
          onValueChange={(value) => setFormat(value as OutputFormat)}
          className="mt-1.5"
        >
          <TabsList>
            {OUTPUT_FORMATS.map((entry) => (
              <TabsTrigger key={entry.value} value={entry.value}>
                {entry.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="html-table-header"
            name="hasHeader"
            checked={hasHeader}
            onCheckedChange={setHasHeader}
          />
          <Label htmlFor="html-table-header" className="font-normal">
            First row is a header
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="html-table-merged"
            name="repeatMerged"
            checked={repeatMerged}
            onCheckedChange={setRepeatMerged}
          />
          <Label htmlFor="html-table-merged" className="font-normal">
            Repeat merged cell values
          </Label>
        </div>
      </div>

      {grid.length > 0 && (
        <p className="text-muted-foreground text-sm tabular-nums">
          {grid.length} rows by {grid[0].length} columns
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy result" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: selectedFormat.mime })}
          filename={`table.${selectedFormat.extension}`}
          disabled={!output}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setHtml("")
            setTableIndex(0)
          }}
        >
          Reset
        </Button>
      </div>

      <div>
        <Label htmlFor="html-table-output">Result</Label>
        <Textarea
          id="html-table-output"
          name="output"
          value={output}
          readOnly
          placeholder="Converted table data will appear here."
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
        />
      </div>
    </div>
  )
}
