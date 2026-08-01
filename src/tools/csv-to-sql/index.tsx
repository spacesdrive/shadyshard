import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
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
import { parseDelimited } from "@/lib/csv"

interface Dialect {
  value: string
  label: string
  /** Wraps a table or column name so a reserved word or a space is safe. */
  quote: (name: string) => string
  types: { integer: string; decimal: string; text: string }
}

const DIALECTS: Dialect[] = [
  {
    value: "mysql",
    label: "MySQL / MariaDB",
    quote: (name) => `\`${name.replace(/`/g, "``")}\``,
    types: { integer: "INT", decimal: "DOUBLE", text: "VARCHAR(255)" },
  },
  {
    value: "postgres",
    label: "PostgreSQL",
    quote: (name) => `"${name.replace(/"/g, '""')}"`,
    types: { integer: "integer", decimal: "double precision", text: "text" },
  },
  {
    value: "sqlite",
    label: "SQLite",
    quote: (name) => `"${name.replace(/"/g, '""')}"`,
    types: { integer: "INTEGER", decimal: "REAL", text: "TEXT" },
  },
  {
    value: "mssql",
    label: "SQL Server",
    quote: (name) => `[${name.replace(/]/g, "]]")}]`,
    types: { integer: "int", decimal: "float", text: "nvarchar(255)" },
  },
]

const DELIMITERS: { value: string; label: string; char: string }[] = [
  { value: "comma", label: "Comma", char: "," },
  { value: "semicolon", label: "Semicolon", char: ";" },
  { value: "tab", label: "Tab", char: "\t" },
  { value: "pipe", label: "Pipe", char: "|" },
]

type ColumnType = "integer" | "decimal" | "text"

function inferColumnType(values: string[]): ColumnType {
  const present = values.filter((value) => value.trim() !== "")
  if (present.length === 0) return "text"

  let allIntegers = true
  for (const value of present) {
    if (!/^-?\d+(\.\d+)?$/.test(value.trim())) return "text"
    if (!/^-?\d+$/.test(value.trim())) allIntegers = false
  }
  return allIntegers ? "integer" : "decimal"
}

function sqlLiteral(value: string, type: ColumnType, nullForEmpty: boolean): string {
  if (value.trim() === "" && nullForEmpty) return "NULL"
  if (type !== "text" && value.trim() !== "") return value.trim()
  return `'${value.replace(/'/g, "''")}'`
}

interface BuildOptions {
  tableName: string
  dialect: Dialect
  hasHeader: boolean
  includeCreate: boolean
  batchInsert: boolean
  nullForEmpty: boolean
}

function buildSql(rows: string[][], options: BuildOptions): string {
  const { dialect, tableName } = options
  const headerRow = options.hasHeader ? rows[0] : null
  const dataRows = options.hasHeader ? rows.slice(1) : rows
  const columnCount = Math.max(...rows.map((row) => row.length))

  const columns = Array.from({ length: columnCount }, (_, index) => {
    const name = headerRow?.[index]?.trim()
    return name && name !== "" ? name : `column_${index + 1}`
  })

  const types = columns.map((_, index) =>
    inferColumnType(dataRows.map((row) => row[index] ?? "")),
  )

  const table = dialect.quote(tableName)
  const quotedColumns = columns.map((name) => dialect.quote(name))
  const statements: string[] = []

  if (options.includeCreate) {
    const definitions = columns.map(
      (_, index) => `  ${quotedColumns[index]} ${dialect.types[types[index]]}`,
    )
    statements.push(`CREATE TABLE ${table} (\n${definitions.join(",\n")}\n);`)
  }

  const valueRows = dataRows.map((row) => {
    const cells = columns.map((_, index) =>
      sqlLiteral(row[index] ?? "", types[index], options.nullForEmpty),
    )
    return `(${cells.join(", ")})`
  })

  if (valueRows.length > 0) {
    const prefix = `INSERT INTO ${table} (${quotedColumns.join(", ")}) VALUES`
    if (options.batchInsert) {
      statements.push(`${prefix}\n${valueRows.map((row) => `  ${row}`).join(",\n")};`)
    } else {
      for (const row of valueRows) statements.push(`${prefix} ${row};`)
    }
  }

  return statements.join("\n\n") + "\n"
}

const SAMPLE = `id,name,email,signup_score
1,Ada Lovelace,ada@example.com,98.5
2,Alan Turing,alan@example.com,97
3,Grace Hopper,grace@example.com,99.2`

export default function CsvToSql() {
  const [input, setInput] = useState(SAMPLE)
  const [tableName, setTableName] = useState("users")
  const [dialectId, setDialectId] = useState("postgres")
  const [delimiterId, setDelimiterId] = useState("comma")
  const [hasHeader, setHasHeader] = useState(true)
  const [includeCreate, setIncludeCreate] = useState(true)
  const [batchInsert, setBatchInsert] = useState(true)
  const [nullForEmpty, setNullForEmpty] = useState(true)

  const dialect = DIALECTS.find((entry) => entry.value === dialectId) ?? DIALECTS[0]
  const delimiter = DELIMITERS.find((entry) => entry.value === delimiterId)?.char ?? ","

  const { output, error, rowCount } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null, rowCount: 0 }
    if (!tableName.trim()) {
      return { output: "", error: "Enter a table name.", rowCount: 0 }
    }

    const rows = parseDelimited(input, delimiter).filter((row) =>
      row.some((cell) => cell.trim() !== ""),
    )

    if (rows.length === 0) {
      return { output: "", error: "No rows were found in this input.", rowCount: 0 }
    }
    if (hasHeader && rows.length === 1) {
      return {
        output: "",
        error:
          "Only a header row was found. Add at least one data row, or turn off the header option.",
        rowCount: 0,
      }
    }

    const sql = buildSql(rows, {
      tableName: tableName.trim(),
      dialect,
      hasHeader,
      includeCreate,
      batchInsert,
      nullForEmpty,
    })

    return {
      output: sql,
      error: null,
      rowCount: hasHeader ? rows.length - 1 : rows.length,
    }
  }, [
    input,
    tableName,
    dialect,
    delimiter,
    hasHeader,
    includeCreate,
    batchInsert,
    nullForEmpty,
  ])

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="sql-table">Table name</Label>
          <Input
            id="sql-table"
            name="tableName"
            value={tableName}
            onChange={(event) => setTableName(event.target.value)}
            placeholder="users"
            className="mt-1.5"
            spellCheck={false}
            aria-invalid={!tableName.trim() ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="sql-dialect">SQL dialect</Label>
          <Select
            value={dialectId}
            onValueChange={(value) => value && setDialectId(value as string)}
          >
            <SelectTrigger id="sql-dialect" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIALECTS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sql-delimiter">Input delimiter</Label>
          <Select
            value={delimiterId}
            onValueChange={(value) => value && setDelimiterId(value as string)}
          >
            <SelectTrigger id="sql-delimiter" className="mt-1.5 w-full">
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
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="sql-header"
            name="hasHeader"
            checked={hasHeader}
            onCheckedChange={setHasHeader}
          />
          <Label htmlFor="sql-header" className="font-normal">
            First row is a header
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="sql-create"
            name="includeCreate"
            checked={includeCreate}
            onCheckedChange={setIncludeCreate}
          />
          <Label htmlFor="sql-create" className="font-normal">
            Include CREATE TABLE
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="sql-batch"
            name="batchInsert"
            checked={batchInsert}
            onCheckedChange={setBatchInsert}
          />
          <Label htmlFor="sql-batch" className="font-normal">
            One multi-row insert
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="sql-null"
            name="nullForEmpty"
            checked={nullForEmpty}
            onCheckedChange={setNullForEmpty}
          />
          <Label htmlFor="sql-null" className="font-normal">
            Empty cells become NULL
          </Label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="sql-input">CSV input</Label>
          <Textarea
            id="sql-input"
            name="csv"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste rows exported from a spreadsheet."
            className="mt-1.5 min-h-64 resize-y font-mono text-sm"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="sql-output">SQL</Label>
          <Textarea
            id="sql-output"
            name="result"
            value={output}
            readOnly
            placeholder="The generated statements appear here."
            className="bg-muted/40 mt-1.5 min-h-64 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {output && (
        <p className="text-muted-foreground text-sm">
          {rowCount.toLocaleString("en-US")} data {rowCount === 1 ? "row" : "rows"}{" "}
          converted.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy SQL" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: "application/sql" })}
          filename={`${tableName.trim() || "table"}.sql`}
          disabled={!output}
        />
        <Button variant="outline" size="sm" onClick={() => setInput("")}>
          Clear
        </Button>
      </div>
    </div>
  )
}
