import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { load as parseYaml } from "js-yaml"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { FileDropZone } from "@/components/tool/FileDropZone"

type Json = Record<string, unknown>

const METHODS = ["get", "post", "put", "patch", "delete", "head", "options", "trace"]

function asObject(value: unknown): Json | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : null
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

/** Collapses a description to a single line so it survives inside a Markdown table cell. */
function cell(value: unknown): string {
  const text = asString(value).replace(/\s+/g, " ").trim()
  return text.replace(/\|/g, "\\|") || "-"
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

class SpecReader {
  private readonly document: Json

  constructor(document: Json) {
    this.document = document
  }

  /** Follows a local $ref one level; an external reference is left as-is. */
  resolve(value: unknown): { schema: Json | null; name: string | null } {
    const object = asObject(value)
    if (!object) return { schema: null, name: null }

    const ref = asString(object.$ref)
    if (!ref) return { schema: object, name: null }
    if (!ref.startsWith("#/")) return { schema: null, name: ref }

    const segments = ref.slice(2).split("/")
    let current: unknown = this.document
    for (const segment of segments) {
      const step = asObject(current)
      if (!step) return { schema: null, name: segments[segments.length - 1] }
      current = step[segment.replace(/~1/g, "/").replace(/~0/g, "~")]
    }
    return { schema: asObject(current), name: segments[segments.length - 1] }
  }

  /** A short human-readable type for a schema, e.g. "array of User" or "string (date-time)". */
  typeOf(value: unknown): string {
    const { schema, name } = this.resolve(value)
    if (!schema) return name ?? "-"

    const type = asString(schema.type)
    if (type === "array") {
      const items = this.resolve(schema.items)
      const itemName = items.name ?? (items.schema ? this.typeOf(schema.items) : "any")
      return `array of ${itemName}`
    }
    if (name && !type) return name
    if (!type) {
      if (schema.properties) return name ?? "object"
      if (schema.oneOf) return "one of several schemas"
      if (schema.allOf) return "combined schema"
      return name ?? "-"
    }
    const format = asString(schema.format)
    const enumValues = Array.isArray(schema.enum)
      ? ` (${schema.enum.map((item) => String(item)).join(", ")})`
      : ""
    return `${name ?? type}${format ? ` (${format})` : ""}${enumValues}`
  }
}

interface Options {
  includeToc: boolean
  includeSchemas: boolean
}

function renderParameters(reader: SpecReader, parameters: unknown[]): string[] {
  const rows = parameters
    .map((entry) => reader.resolve(entry).schema)
    .filter((entry): entry is Json => entry !== null)
    .filter((entry) => asString(entry.in) !== "body")

  if (rows.length === 0) return []

  const lines = [
    "| Name | In | Type | Required | Description |",
    "| --- | --- | --- | --- | --- |",
  ]
  for (const parameter of rows) {
    /** Swagger 2 puts type on the parameter; OpenAPI 3 nests it under schema. */
    const type = parameter.schema
      ? reader.typeOf(parameter.schema)
      : asString(parameter.type) || "-"
    lines.push(
      `| \`${cell(parameter.name)}\` | ${cell(parameter.in)} | ${type} | ${parameter.required === true ? "yes" : "no"} | ${cell(parameter.description)} |`,
    )
  }
  return ["**Parameters**", "", ...lines, ""]
}

function renderRequestBody(reader: SpecReader, operation: Json): string[] {
  const requestBody = reader.resolve(operation.requestBody).schema
  if (requestBody) {
    const content = asObject(requestBody.content)
    if (!content) return []
    const lines = ["| Content type | Schema |", "| --- | --- |"]
    for (const [mediaType, media] of Object.entries(content)) {
      const schema = asObject(media)?.schema
      lines.push(`| \`${mediaType}\` | ${reader.typeOf(schema)} |`)
    }
    const required = requestBody.required === true ? " (required)" : ""
    return [`**Request body**${required}`, "", ...lines, ""]
  }

  const bodyParameter = (Array.isArray(operation.parameters) ? operation.parameters : [])
    .map((entry) => reader.resolve(entry).schema)
    .find((entry) => entry !== null && asString(entry.in) === "body")

  if (!bodyParameter) return []
  return [
    `**Request body**${bodyParameter.required === true ? " (required)" : ""}`,
    "",
    `Schema: ${reader.typeOf(bodyParameter.schema)}`,
    "",
  ]
}

function renderResponses(reader: SpecReader, operation: Json): string[] {
  const responses = asObject(operation.responses)
  if (!responses) return []

  const lines = ["| Code | Description | Schema |", "| --- | --- | --- |"]
  for (const [code, value] of Object.entries(responses)) {
    const response = reader.resolve(value).schema
    if (!response) {
      lines.push(`| \`${code}\` | - | - |`)
      continue
    }
    const content = asObject(response.content)
    const schema = content
      ? Object.values(content)
          .map((media) => reader.typeOf(asObject(media)?.schema))
          .filter((entry) => entry !== "-")
          .join(", ")
      : reader.typeOf(response.schema)
    lines.push(`| \`${code}\` | ${cell(response.description)} | ${schema || "-"} |`)
  }
  return ["**Responses**", "", ...lines, ""]
}

function renderSchemas(reader: SpecReader, document: Json): string[] {
  const components = asObject(document.components)
  const schemas = asObject(components?.schemas) ?? asObject(document.definitions) ?? null
  if (!schemas) return []

  const lines = ["## Schemas", ""]
  for (const [name, value] of Object.entries(schemas)) {
    const schema = asObject(value)
    if (!schema) continue
    lines.push(`### ${name}`, "")
    if (schema.description) lines.push(cell(schema.description), "")

    const properties = asObject(schema.properties)
    if (!properties) {
      lines.push(`Type: ${reader.typeOf(schema)}`, "")
      continue
    }

    const required = Array.isArray(schema.required)
      ? new Set(schema.required.map((entry) => String(entry)))
      : new Set<string>()

    lines.push(
      "| Property | Type | Required | Description |",
      "| --- | --- | --- | --- |",
    )
    for (const [property, definition] of Object.entries(properties)) {
      lines.push(
        `| \`${property}\` | ${reader.typeOf(definition)} | ${required.has(property) ? "yes" : "no"} | ${cell(asObject(definition)?.description)} |`,
      )
    }
    lines.push("")
  }
  return lines
}

function toMarkdown(document: Json, options: Options): string {
  const reader = new SpecReader(document)
  const info = asObject(document.info) ?? {}
  const paths = asObject(document.paths)

  if (!paths) {
    throw new Error(
      "No paths section was found. This does not look like an OpenAPI or Swagger specification.",
    )
  }

  const lines: string[] = []
  lines.push(`# ${asString(info.title) || "API Reference"}`, "")
  if (info.version) lines.push(`Version ${asString(info.version)}`, "")
  if (info.description) lines.push(asString(info.description).trim(), "")

  const servers = Array.isArray(document.servers) ? document.servers : []
  if (servers.length > 0) {
    lines.push("## Servers", "")
    for (const entry of servers) {
      const server = asObject(entry)
      if (!server) continue
      const description = asString(server.description)
      lines.push(`- \`${asString(server.url)}\`${description ? ` ${description}` : ""}`)
    }
    lines.push("")
  } else if (document.host) {
    lines.push(
      "## Servers",
      "",
      `- \`${asString(document.schemes ? String((document.schemes as unknown[])[0]) : "https")}://${asString(document.host)}${asString(document.basePath)}\``,
      "",
    )
  }

  interface Endpoint {
    path: string
    method: string
    operation: Json
    heading: string
  }

  const endpoints: Endpoint[] = []
  for (const [path, value] of Object.entries(paths)) {
    const pathItem = asObject(value)
    if (!pathItem) continue
    for (const method of METHODS) {
      const operation = asObject(pathItem[method])
      if (!operation) continue
      endpoints.push({
        path,
        method,
        operation,
        heading: `${method.toUpperCase()} ${path}`,
      })
    }
  }

  if (endpoints.length === 0) {
    throw new Error("The paths section contains no operations to document.")
  }

  if (options.includeToc) {
    lines.push("## Endpoints", "")
    for (const endpoint of endpoints) {
      const summary = asString(endpoint.operation.summary)
      lines.push(
        `- [${endpoint.heading}](#${slugify(endpoint.heading)})${summary ? ` ${summary}` : ""}`,
      )
    }
    lines.push("")
  }

  for (const endpoint of endpoints) {
    const { operation } = endpoint
    lines.push(`## ${endpoint.heading}`, "")

    const summary = asString(operation.summary)
    if (summary) lines.push(summary, "")
    const description = asString(operation.description)
    if (description) lines.push(description.trim(), "")

    if (operation.deprecated === true) lines.push("This operation is deprecated.", "")

    const tags = Array.isArray(operation.tags) ? operation.tags.map(String) : []
    if (tags.length > 0) lines.push(`Tags: ${tags.join(", ")}`, "")

    const pathItem = asObject(paths[endpoint.path])
    const shared = Array.isArray(pathItem?.parameters) ? pathItem.parameters : []
    const own = Array.isArray(operation.parameters) ? operation.parameters : []
    lines.push(...renderParameters(reader, [...shared, ...own]))
    lines.push(...renderRequestBody(reader, operation))
    lines.push(...renderResponses(reader, operation))
  }

  if (options.includeSchemas) lines.push(...renderSchemas(reader, document))

  return `${lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()}\n`
}

function parseSpec(text: string): Json {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = parseYaml(text)
  }
  const document = asObject(parsed)
  if (!document) throw new Error("The specification must be a JSON or YAML object.")
  if (!document.openapi && !document.swagger) {
    throw new Error(
      'No "openapi" or "swagger" version field was found, so this is not a specification the tool can read.',
    )
  }
  return document
}

const SAMPLE = `openapi: 3.0.3
info:
  title: Bookshelf API
  version: 1.2.0
  description: A small example specification.
servers:
  - url: https://api.example.com/v1
paths:
  /books:
    get:
      summary: List books
      parameters:
        - name: limit
          in: query
          required: false
          schema:
            type: integer
          description: Maximum number of books to return.
      responses:
        "200":
          description: A list of books.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Book"
components:
  schemas:
    Book:
      type: object
      required: [id, title]
      properties:
        id:
          type: integer
        title:
          type: string
        published:
          type: string
          format: date`

export default function OpenApiToMarkdown() {
  const [input, setInput] = useState(SAMPLE)
  const [includeToc, setIncludeToc] = useState(true)
  const [includeSchemas, setIncludeSchemas] = useState(true)

  const result = useMemo(() => {
    if (!input.trim()) return { markdown: "", error: null as string | null }
    try {
      return {
        markdown: toMarkdown(parseSpec(input), { includeToc, includeSchemas }),
        error: null,
      }
    } catch (error) {
      return {
        markdown: "",
        error:
          error instanceof Error
            ? error.message
            : "That specification could not be parsed.",
      }
    }
  }, [input, includeToc, includeSchemas])

  return (
    <div className="space-y-4">
      <FileDropZone
        accept=".json,.yaml,.yml,application/json,text/yaml"
        onFiles={async (files) => {
          if (files[0]) setInput(await files[0].text())
        }}
        hint="OpenAPI or Swagger files (.json, .yaml, .yml)"
      />

      <div>
        <Label htmlFor="openapi-input">Specification</Label>
        <Textarea
          id="openapi-input"
          name="spec"
          className="mt-1.5 min-h-56 resize-y font-mono text-sm"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste an OpenAPI or Swagger specification in JSON or YAML"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="openapi-toc"
            name="includeToc"
            checked={includeToc}
            onCheckedChange={setIncludeToc}
          />
          <Label htmlFor="openapi-toc" className="font-normal">
            Endpoint index
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="openapi-schemas"
            name="includeSchemas"
            checked={includeSchemas}
            onCheckedChange={setIncludeSchemas}
          />
          <Label htmlFor="openapi-schemas" className="font-normal">
            Schema reference
          </Label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result.markdown} label="Copy Markdown" />
        <DownloadButton
          getBlob={() => new Blob([result.markdown], { type: "text/markdown" })}
          filename="api-reference.md"
          disabled={!result.markdown}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {result.error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <div>
        <Label htmlFor="openapi-output">Markdown</Label>
        <Textarea
          id="openapi-output"
          name="markdown"
          readOnly
          className="mt-1.5 min-h-72 resize-y font-mono text-sm"
          value={result.markdown}
          placeholder="The generated Markdown appears here."
        />
      </div>
    </div>
  )
}
