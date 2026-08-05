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
import { DownloadButton } from "@/components/tool/DownloadButton"
import { parseDelimited, toDelimited } from "@/lib/csv"

const DELIMITERS = [
  { value: ",", label: "Comma" },
  { value: ";", label: "Semicolon" },
  { value: "\t", label: "Tab" },
  { value: "|", label: "Pipe" },
] as const

const POSITION_KEY = "__position__"

interface CellChange {
  column: string
  before: string
  after: string
}

interface ChangedRow {
  key: string
  changes: CellChange[]
}

interface DiffResult {
  columns: string[]
  added: { key: string; values: Record<string, string> }[]
  removed: { key: string; values: Record<string, string> }[]
  changed: ChangedRow[]
  unchanged: number
  warnings: string[]
}

interface ParsedTable {
  header: string[]
  rows: Record<string, string>[]
}

function parseTable(text: string, delimiter: string, hasHeader: boolean): ParsedTable {
  const grid = parseDelimited(text, delimiter)
  if (grid.length === 0) return { header: [], rows: [] }

  const width = grid.reduce((max, row) => Math.max(max, row.length), 0)
  const header = hasHeader
    ? grid[0].map((name, index) => name.trim() || `Column ${index + 1}`)
    : Array.from({ length: width }, (_, index) => `Column ${index + 1}`)
  const body = hasHeader ? grid.slice(1) : grid

  const rows = body.map((row) =>
    Object.fromEntries(header.map((name, index) => [name, row[index] ?? ""])),
  )
  return { header, rows }
}

function buildIndex(
  rows: Record<string, string>[],
  keyColumn: string,
): { index: Map<string, Record<string, string>>; duplicates: string[] } {
  const index = new Map<string, Record<string, string>>()
  const duplicates: string[] = []
  rows.forEach((row, position) => {
    const key =
      keyColumn === POSITION_KEY ? `Row ${position + 1}` : (row[keyColumn] ?? "")
    if (index.has(key)) {
      if (!duplicates.includes(key)) duplicates.push(key)
      return
    }
    index.set(key, row)
  })
  return { index, duplicates }
}

function diff(
  original: ParsedTable,
  updated: ParsedTable,
  keyColumn: string,
): DiffResult {
  const columns = Array.from(new Set([...original.header, ...updated.header]))
  const warnings: string[] = []

  const onlyInOriginal = original.header.filter((name) => !updated.header.includes(name))
  const onlyInUpdated = updated.header.filter((name) => !original.header.includes(name))
  if (onlyInOriginal.length) {
    warnings.push(`Columns only in the original file: ${onlyInOriginal.join(", ")}.`)
  }
  if (onlyInUpdated.length) {
    warnings.push(`Columns only in the updated file: ${onlyInUpdated.join(", ")}.`)
  }

  const left = buildIndex(original.rows, keyColumn)
  const right = buildIndex(updated.rows, keyColumn)
  if (left.duplicates.length) {
    warnings.push(
      `Duplicate keys in the original file were skipped: ${left.duplicates.slice(0, 5).join(", ")}.`,
    )
  }
  if (right.duplicates.length) {
    warnings.push(
      `Duplicate keys in the updated file were skipped: ${right.duplicates.slice(0, 5).join(", ")}.`,
    )
  }

  const added: DiffResult["added"] = []
  const removed: DiffResult["removed"] = []
  const changed: ChangedRow[] = []
  let unchanged = 0

  for (const [key, row] of left.index) {
    const other = right.index.get(key)
    if (!other) {
      removed.push({ key, values: row })
      continue
    }
    const changes = columns
      .map((column) => ({
        column,
        before: row[column] ?? "",
        after: other[column] ?? "",
      }))
      .filter((change) => change.before !== change.after)
    if (changes.length) changed.push({ key, changes })
    else unchanged++
  }

  for (const [key, row] of right.index) {
    if (!left.index.has(key)) added.push({ key, values: row })
  }

  return { columns, added, removed, changed, unchanged, warnings }
}

function buildReport(result: DiffResult): string {
  const rows: string[][] = [["change", "key", "column", "before", "after"]]
  for (const entry of result.added) {
    rows.push(["added", entry.key, "", "", ""])
  }
  for (const entry of result.removed) {
    rows.push(["removed", entry.key, "", "", ""])
  }
  for (const entry of result.changed) {
    for (const change of entry.changes) {
      rows.push(["changed", entry.key, change.column, change.before, change.after])
    }
  }
  return toDelimited(rows, ",")
}

export default function CsvDiff() {
  const [original, setOriginal] = useState("")
  const [updated, setUpdated] = useState("")
  const [delimiter, setDelimiter] = useState<string>(",")
  const [hasHeader, setHasHeader] = useState(true)
  const [keyColumn, setKeyColumn] = useState<string>(POSITION_KEY)

  const originalTable = useMemo(
    () => parseTable(original, delimiter, hasHeader),
    [original, delimiter, hasHeader],
  )
  const updatedTable = useMemo(
    () => parseTable(updated, delimiter, hasHeader),
    [updated, delimiter, hasHeader],
  )

  const keyOptions = useMemo(
    () => Array.from(new Set([...originalTable.header, ...updatedTable.header])),
    [originalTable.header, updatedTable.header],
  )
  const activeKey = keyOptions.includes(keyColumn) ? keyColumn : POSITION_KEY

  const result = useMemo(() => {
    if (originalTable.rows.length === 0 && updatedTable.rows.length === 0) return null
    return diff(originalTable, updatedTable, activeKey)
  }, [originalTable, updatedTable, activeKey])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="csv-diff-original">Original CSV</Label>
          <Textarea
            id="csv-diff-original"
            name="original"
            value={original}
            onChange={(event) => setOriginal(event.target.value)}
            placeholder={"id,name,plan\n1,Ada,pro\n2,Grace,free"}
            className="mt-1.5 min-h-40 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="csv-diff-updated">Updated CSV</Label>
          <Textarea
            id="csv-diff-updated"
            name="updated"
            value={updated}
            onChange={(event) => setUpdated(event.target.value)}
            placeholder={"id,name,plan\n1,Ada,team\n3,Alan,free"}
            className="mt-1.5 min-h-40 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="csv-diff-delimiter">Delimiter</Label>
          <Select
            value={delimiter}
            onValueChange={(value) => value && setDelimiter(value as string)}
          >
            <SelectTrigger id="csv-diff-delimiter" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELIMITERS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="csv-diff-key">Match rows by</Label>
          <Select
            value={activeKey}
            onValueChange={(value) => value && setKeyColumn(value as string)}
          >
            <SelectTrigger id="csv-diff-key" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={POSITION_KEY}>Row position</SelectItem>
              {keyOptions.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="csv-diff-header"
          name="hasHeader"
          checked={hasHeader}
          onCheckedChange={setHasHeader}
        />
        <Label htmlFor="csv-diff-header" className="font-normal">
          Both files start with a header row
        </Label>
      </div>

      {result?.warnings.map((warning) => (
        <div
          key={warning}
          className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{warning}</span>
        </div>
      ))}

      {result ? (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: "Added", value: result.added.length },
              { label: "Removed", value: result.removed.length },
              { label: "Changed", value: result.changed.length },
              { label: "Unchanged", value: result.unchanged },
            ].map((entry) => (
              <div key={entry.label} className="border-border/60 rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">{entry.label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{entry.value}</p>
              </div>
            ))}
          </div>

          {result.changed.length > 0 && (
            <div>
              <h2 className="text-sm font-medium">Changed cells</h2>
              <ul className="mt-2 space-y-2">
                {result.changed.slice(0, 100).map((row) => (
                  <li key={row.key} className="border-border/60 rounded-lg border p-3">
                    <p className="font-mono text-sm font-medium break-words">{row.key}</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {row.changes.map((change) => (
                        <li key={change.column} className="flex flex-wrap gap-x-2">
                          <span className="text-muted-foreground">{change.column}:</span>
                          <span className="text-destructive line-through">
                            {change.before || "(empty)"}
                          </span>
                          <span aria-hidden>to</span>
                          <span className="font-medium">{change.after || "(empty)"}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              {result.changed.length > 100 && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Showing the first 100 changed rows. Download the report for all of them.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                { title: "Added rows", entries: result.added },
                { title: "Removed rows", entries: result.removed },
              ] as const
            ).map((section) => (
              <div key={section.title}>
                <h2 className="text-sm font-medium">{section.title}</h2>
                {section.entries.length === 0 ? (
                  <p className="text-muted-foreground mt-2 text-sm">None.</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {section.entries.slice(0, 50).map((entry) => (
                      <li
                        key={entry.key}
                        className="border-border/60 rounded border px-2 py-1 font-mono text-xs break-words"
                      >
                        {entry.key || "(empty key)"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          Paste both versions of the file to see what changed.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <DownloadButton
          getBlob={() =>
            result ? new Blob([buildReport(result)], { type: "text/csv" }) : null
          }
          filename="csv-diff-report.csv"
          label="Download report"
          disabled={!result}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setOriginal("")
            setUpdated("")
            setKeyColumn(POSITION_KEY)
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
