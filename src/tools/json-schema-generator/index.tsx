import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
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

const DRAFTS = [
  {
    value: "2020-12",
    label: "Draft 2020-12",
    uri: "https://json-schema.org/draft/2020-12/schema",
  },
  { value: "07", label: "Draft-07", uri: "http://json-schema.org/draft-07/schema#" },
]

const STRING_FORMATS: { format: string; pattern: RegExp }[] = [
  { format: "date-time", pattern: /^\d{4}-\d{2}-\d{2}[Tt].+/ },
  { format: "date", pattern: /^\d{4}-\d{2}-\d{2}$/ },
  { format: "time", pattern: /^\d{2}:\d{2}(:\d{2})?/ },
  {
    format: "uuid",
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
  { format: "email", pattern: /^[^\s@]+@[^\s@.]+\.[^\s@]+$/ },
  { format: "uri", pattern: /^https?:\/\/\S+$/ },
  { format: "ipv4", pattern: /^(\d{1,3}\.){3}\d{1,3}$/ },
]

interface Options {
  detectFormats: boolean
  includeRequired: boolean
}

type Schema = Record<string, unknown>

function detectFormat(value: string): string | null {
  for (const candidate of STRING_FORMATS) {
    if (candidate.pattern.test(value)) return candidate.format
  }
  return null
}

function inferSchema(value: unknown, options: Options): Schema {
  if (value === null) return { type: "null" }

  if (Array.isArray(value)) {
    if (value.length === 0) return { type: "array", items: {} }
    const itemSchemas = value.map((item) => inferSchema(item, options))
    return { type: "array", items: mergeSchemas(itemSchemas) }
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
    const properties: Record<string, Schema> = {}
    for (const [key, propertyValue] of entries) {
      properties[key] = inferSchema(propertyValue, options)
    }
    const schema: Schema = { type: "object", properties }
    if (options.includeRequired && entries.length > 0) {
      schema.required = entries.map(([key]) => key)
    }
    schema.additionalProperties = false
    return schema
  }

  if (typeof value === "number") {
    return { type: Number.isInteger(value) ? "integer" : "number" }
  }

  if (typeof value === "string") {
    const schema: Schema = { type: "string" }
    if (options.detectFormats) {
      const format = detectFormat(value)
      if (format) schema.format = format
    }
    return schema
  }

  return { type: typeof value }
}

/**
 * Combines the schemas inferred from several array elements into one. Objects
 * are merged key by key so that a mixed array does not lose the keys that only
 * appear in some of its elements; a key missing from any element stops being
 * required.
 */
function mergeSchemas(schemas: Schema[]): Schema {
  if (schemas.length === 1) return schemas[0]

  const types = new Set(schemas.map((schema) => schema.type as string))
  const objectSchemas = schemas.filter((schema) => schema.type === "object")

  if (objectSchemas.length === schemas.length) {
    const properties: Record<string, Schema[]> = {}
    for (const schema of objectSchemas) {
      for (const [key, propertySchema] of Object.entries(
        (schema.properties ?? {}) as Record<string, Schema>,
      )) {
        properties[key] = [...(properties[key] ?? []), propertySchema]
      }
    }

    const merged: Record<string, Schema> = {}
    for (const [key, candidates] of Object.entries(properties)) {
      merged[key] = mergeSchemas(candidates)
    }

    const requiredLists = objectSchemas.map(
      (schema) => new Set((schema.required as string[] | undefined) ?? []),
    )
    const required = Object.keys(merged).filter((key) =>
      requiredLists.every((list) => list.has(key)),
    )

    const result: Schema = {
      type: "object",
      properties: merged,
      additionalProperties: false,
    }
    if (requiredLists.some((list) => list.size > 0) && required.length > 0) {
      result.required = required
    }
    return result
  }

  if (types.size === 1 && types.has("array")) {
    const itemSchemas = schemas.map((schema) => schema.items as Schema)
    return { type: "array", items: mergeSchemas(itemSchemas) }
  }

  // Numbers widen rather than becoming a union, since integer is a subset.
  if (types.size === 2 && types.has("integer") && types.has("number")) {
    return { type: "number" }
  }

  if (types.size === 1) {
    const [only] = types
    const formats = new Set(schemas.map((schema) => schema.format).filter(Boolean))
    return formats.size === 1 ? { type: only, format: [...formats][0] } : { type: only }
  }

  return { type: [...types].sort() }
}

export default function JsonSchemaGenerator() {
  const [input, setInput] = useState("")
  const [draft, setDraft] = useState("2020-12")
  const [detectFormats, setDetectFormats] = useState(true)
  const [includeRequired, setIncludeRequired] = useState(true)

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: null }
    let parsed: unknown
    try {
      parsed = JSON.parse(input)
    } catch (error) {
      return {
        output: "",
        error:
          error instanceof Error
            ? `Invalid JSON: ${error.message}`
            : "This is not valid JSON.",
      }
    }

    const selectedDraft = DRAFTS.find((entry) => entry.value === draft) ?? DRAFTS[0]
    const schema = {
      $schema: selectedDraft.uri,
      ...inferSchema(parsed, { detectFormats, includeRequired }),
    }
    return { output: JSON.stringify(schema, null, 2), error: null }
  }, [input, draft, detectFormats, includeRequired])

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="schema-input">JSON sample</Label>
        <Textarea
          id="schema-input"
          name="jsonSample"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            '{\n  "id": 1,\n  "email": "person@example.com",\n  "tags": ["a", "b"]\n}'
          }
          className="mt-1.5 min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={result.error ? true : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="schema-draft">Schema draft</Label>
          <Select
            value={draft}
            onValueChange={(next) => next && setDraft(next as string)}
          >
            <SelectTrigger id="schema-draft" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DRAFTS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col justify-end gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="schema-formats"
              name="detectFormats"
              checked={detectFormats}
              onCheckedChange={setDetectFormats}
            />
            <Label htmlFor="schema-formats" className="font-normal">
              Detect string formats
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="schema-required"
              name="includeRequired"
              checked={includeRequired}
              onCheckedChange={setIncludeRequired}
            />
            <Label htmlFor="schema-required" className="font-normal">
              List required properties
            </Label>
          </div>
        </div>
      </div>

      {result.error && <p className="text-destructive text-sm">{result.error}</p>}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="schema-output">Generated schema</Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={result.output} label="Copy schema" />
            <DownloadButton
              getBlob={() => new Blob([result.output], { type: "application/json" })}
              filename="schema.json"
              disabled={!result.output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setDraft("2020-12")
                setDetectFormats(true)
                setIncludeRequired(true)
              }}
              disabled={!input}
            >
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="schema-output"
          name="schemaOutput"
          value={result.output}
          readOnly
          placeholder="The generated JSON Schema appears here."
          className="min-h-52 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
