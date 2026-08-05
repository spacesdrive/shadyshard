import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const SEPARATORS = [
  { value: ".", label: "Dot  (user.name)" },
  { value: "_", label: "Underscore  (user_name)" },
  { value: "/", label: "Slash  (user/name)" },
] as const

type Direction = "flatten" | "unflatten"
type OutputShape = "json" | "lines"

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function flattenInto(
  value: unknown,
  prefix: string,
  separator: string,
  brackets: boolean,
  target: Record<string, unknown>,
) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      target[prefix] = []
      return
    }
    value.forEach((item, index) => {
      const key = brackets
        ? `${prefix}[${index}]`
        : prefix
          ? `${prefix}${separator}${index}`
          : String(index)
      flattenInto(item, key, separator, brackets, target)
    })
    return
  }

  if (isPlainObject(value)) {
    const keys = Object.keys(value)
    if (keys.length === 0) {
      target[prefix] = {}
      return
    }
    for (const key of keys) {
      const path = prefix ? `${prefix}${separator}${key}` : key
      flattenInto(value[key], path, separator, brackets, target)
    }
    return
  }

  target[prefix] = value
}

type PathToken = { kind: "key"; value: string } | { kind: "index"; value: number }

function tokenizePath(path: string, separator: string, brackets: boolean): PathToken[] {
  const tokens: PathToken[] = []
  for (const segment of path.split(separator)) {
    if (!brackets) {
      tokens.push({ kind: "key", value: segment })
      continue
    }
    const match = /^([^[\]]*)((?:\[\d+\])*)$/.exec(segment)
    if (!match) {
      tokens.push({ kind: "key", value: segment })
      continue
    }
    if (match[1]) tokens.push({ kind: "key", value: match[1] })
    for (const index of match[2].matchAll(/\[(\d+)\]/g)) {
      tokens.push({ kind: "index", value: Number(index[1]) })
    }
  }
  return tokens
}

function unflatten(
  flat: Record<string, unknown>,
  separator: string,
  brackets: boolean,
): unknown {
  const root: Record<string, unknown> = {}

  for (const [path, value] of Object.entries(flat)) {
    const tokens = tokenizePath(path, separator, brackets)
    if (tokens.length === 0) continue

    let cursor: Record<string, unknown> | unknown[] = root
    tokens.forEach((token, index) => {
      const isLast = index === tokens.length - 1
      const key = token.value
      const container = cursor as Record<string | number, unknown>

      if (isLast) {
        container[key] = value
        return
      }

      const nextIsIndex = tokens[index + 1].kind === "index"
      const existing = container[key]
      if (nextIsIndex ? !Array.isArray(existing) : !isPlainObject(existing)) {
        container[key] = nextIsIndex ? [] : {}
      }
      cursor = container[key] as Record<string, unknown> | unknown[]
    })
  }

  return root
}

function toLines(flat: Record<string, unknown>): string {
  return Object.entries(flat)
    .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
    .join("\n")
}

interface Result {
  output: string
  flat: Record<string, unknown> | null
  error: string | null
}

function convert(
  input: string,
  direction: Direction,
  separator: string,
  brackets: boolean,
  shape: OutputShape,
): Result {
  if (!input.trim()) return { output: "", flat: null, error: null }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (error) {
    return {
      output: "",
      flat: null,
      error: error instanceof Error ? error.message : "This is not valid JSON.",
    }
  }

  if (direction === "flatten") {
    const flat: Record<string, unknown> = {}
    flattenInto(parsed, "", separator, brackets, flat)
    return {
      output: shape === "lines" ? toLines(flat) : JSON.stringify(flat, null, 2),
      flat,
      error: null,
    }
  }

  if (!isPlainObject(parsed)) {
    return {
      output: "",
      flat: null,
      error: "Unflattening needs a JSON object whose keys are the flattened paths.",
    }
  }

  return {
    output: JSON.stringify(unflatten(parsed, separator, brackets), null, 2),
    flat: null,
    error: null,
  }
}

export default function JsonFlattener() {
  const [input, setInput] = useState("")
  const [direction, setDirection] = useState<Direction>("flatten")
  const [separator, setSeparator] = useState<string>(".")
  const [brackets, setBrackets] = useState(true)
  const [shape, setShape] = useState<OutputShape>("json")

  const result = useMemo(
    () => convert(input, direction, separator, brackets, shape),
    [input, direction, separator, brackets, shape],
  )

  return (
    <div className="space-y-4">
      <div>
        <span className="text-sm font-medium">Direction</span>
        <Tabs
          value={direction}
          onValueChange={(value) => setDirection(value as Direction)}
          className="mt-1.5"
        >
          <TabsList>
            <TabsTrigger value="flatten">Flatten</TabsTrigger>
            <TabsTrigger value="unflatten">Unflatten</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <Label htmlFor="json-flattener-input">
          {direction === "flatten" ? "Nested JSON" : "Flattened JSON"}
        </Label>
        <Textarea
          id="json-flattener-input"
          name="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            direction === "flatten"
              ? '{ "user": { "name": "Ada", "tags": ["admin", "owner"] } }'
              : '{ "user.name": "Ada", "user.tags[0]": "admin" }'
          }
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={result.error ? true : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="json-flattener-separator">Separator</Label>
          <Select
            value={separator}
            onValueChange={(value) => value && setSeparator(value as string)}
          >
            <SelectTrigger id="json-flattener-separator" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEPARATORS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="flex items-center gap-2 pb-2">
            <Switch
              id="json-flattener-brackets"
              name="brackets"
              checked={brackets}
              onCheckedChange={setBrackets}
            />
            <Label htmlFor="json-flattener-brackets" className="font-normal">
              Bracket notation for array indexes
            </Label>
          </div>
        </div>
      </div>

      {direction === "flatten" && (
        <div>
          <span className="text-sm font-medium">Output</span>
          <Tabs
            value={shape}
            onValueChange={(value) => setShape(value as OutputShape)}
            className="mt-1.5"
          >
            <TabsList>
              <TabsTrigger value="json">JSON object</TabsTrigger>
              <TabsTrigger value="lines">Key and value lines</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {result.error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      {result.flat && (
        <p className="text-muted-foreground text-sm tabular-nums">
          {Object.keys(result.flat).length} keys
        </p>
      )}

      <div>
        <Label htmlFor="json-flattener-output">Result</Label>
        <Textarea
          id="json-flattener-output"
          name="output"
          value={result.output}
          readOnly
          placeholder="The converted JSON will appear here."
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result.output} label="Copy result" />
        <DownloadButton
          getBlob={() =>
            new Blob([result.output], {
              type: shape === "lines" ? "text/plain" : "application/json",
            })
          }
          filename={
            direction === "flatten" && shape === "lines" ? "flattened.txt" : "output.json"
          }
          disabled={!result.output}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => setInput("")}>
          Reset
        </Button>
      </div>
    </div>
  )
}
