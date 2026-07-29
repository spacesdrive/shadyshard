import { useMemo, useState } from "react"
import { AlertCircle, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

type Direction = "to-json" | "to-jsonl"

interface LineError {
  line: number
  message: string
}

interface Conversion {
  output: string
  records: number
  errors: LineError[]
  fatal: string | null
}

function linesToArray(input: string, pretty: boolean): Conversion {
  const records: unknown[] = []
  const errors: LineError[] = []

  input.split("\n").forEach((line, index) => {
    if (!line.trim()) return
    try {
      records.push(JSON.parse(line))
    } catch (thrown) {
      errors.push({
        line: index + 1,
        message: thrown instanceof Error ? thrown.message : "Invalid JSON",
      })
    }
  })

  return {
    output: records.length ? JSON.stringify(records, null, pretty ? 2 : 0) : "",
    records: records.length,
    errors,
    fatal: null,
  }
}

function arrayToLines(input: string): Conversion {
  if (!input.trim()) return { output: "", records: 0, errors: [], fatal: null }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (thrown) {
    return {
      output: "",
      records: 0,
      errors: [],
      fatal: thrown instanceof Error ? thrown.message : "Invalid JSON",
    }
  }

  const records = Array.isArray(parsed) ? parsed : [parsed]
  return {
    output: records.map((record) => JSON.stringify(record)).join("\n"),
    records: records.length,
    errors: [],
    fatal: null,
  }
}

export default function JsonlConverter() {
  const [direction, setDirection] = useState<Direction>("to-json")
  const [input, setInput] = useState("")
  const [pretty, setPretty] = useState(true)

  const result = useMemo(
    () => (direction === "to-json" ? linesToArray(input, pretty) : arrayToLines(input)),
    [direction, input, pretty],
  )

  const toJson = direction === "to-json"

  return (
    <div className="space-y-5">
      <Tabs value={direction} onValueChange={(value) => setDirection(value as Direction)}>
        <TabsList>
          <TabsTrigger value="to-json">JSONL to JSON</TabsTrigger>
          <TabsTrigger value="to-jsonl">JSON to JSONL</TabsTrigger>
        </TabsList>
      </Tabs>

      <div>
        <Label htmlFor="jsonl-input">{toJson ? "JSON Lines input" : "JSON input"}</Label>
        <Textarea
          id="jsonl-input"
          name="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            toJson
              ? '{"id":1,"name":"Ada"}\n{"id":2,"name":"Grace"}'
              : '[{"id":1,"name":"Ada"},{"id":2,"name":"Grace"}]'
          }
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {toJson && (
        <div className="flex items-center gap-2">
          <Switch
            id="jsonl-pretty"
            name="pretty"
            checked={pretty}
            onCheckedChange={setPretty}
          />
          <Label htmlFor="jsonl-pretty" className="font-normal">
            Indent the JSON array
          </Label>
        </div>
      )}

      {result.fatal && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{result.fatal}</span>
        </div>
      )}

      {result.errors.length > 0 && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              {result.errors.length} {result.errors.length === 1 ? "line" : "lines"} could
              not be parsed
            </span>
          </div>
          <ul className="mt-2 space-y-1">
            {result.errors.slice(0, 10).map((error) => (
              <li key={error.line} className="font-mono text-xs">
                Line {error.line}: {error.message}
              </li>
            ))}
          </ul>
          {result.errors.length > 10 && (
            <p className="mt-2 text-xs">
              Showing the first 10 of {result.errors.length} errors.
            </p>
          )}
        </div>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="jsonl-output">
            Output
            <span className="text-muted-foreground ml-2 text-xs font-normal tabular-nums">
              {result.records} {result.records === 1 ? "record" : "records"}
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={result.output} label="Copy output" />
            <DownloadButton
              getBlob={() =>
                new Blob([result.output], {
                  type: toJson ? "application/json" : "application/x-ndjson",
                })
              }
              filename={toJson ? "records.json" : "records.jsonl"}
              disabled={!result.output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("")}
              disabled={!input}
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
          </div>
        </div>
        <Textarea
          id="jsonl-output"
          name="output"
          value={result.output}
          readOnly
          className="min-h-56 resize-y font-mono text-sm"
          placeholder="The converted records appear here"
        />
      </div>
    </div>
  )
}
