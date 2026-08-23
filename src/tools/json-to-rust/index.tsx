import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const RUST_KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "box",
  "break",
  "const",
  "continue",
  "crate",
  "dyn",
  "else",
  "enum",
  "extern",
  "false",
  "fn",
  "for",
  "if",
  "impl",
  "in",
  "let",
  "loop",
  "match",
  "mod",
  "move",
  "mut",
  "pub",
  "ref",
  "return",
  "self",
  "static",
  "struct",
  "super",
  "trait",
  "true",
  "type",
  "union",
  "unsafe",
  "use",
  "where",
  "while",
  "yield",
])

const UNKNOWN_TYPE = "serde_json::Value"

function words(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
}

function toSnakeCase(key: string): string {
  const parts = words(key).map((part) => part.toLowerCase())
  if (parts.length === 0) return "field"
  const name = parts.join("_")
  return /^[0-9]/.test(name) ? `field_${name}` : name
}

function toPascalCase(key: string): string {
  const parts = words(key).map(
    (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
  )
  const name = parts.join("")
  if (name === "") return "Item"
  return /^[0-9]/.test(name) ? `Type${name}` : name
}

/** "tags" -> "Tag", so an array of objects names its element struct sensibly. */
function singularize(name: string): string {
  if (/ies$/i.test(name)) return `${name.slice(0, -3)}y`
  if (/(ses|xes|zes|ches|shes)$/i.test(name)) return name.slice(0, -2)
  if (/[^s]s$/i.test(name)) return name.slice(0, -1)
  return name
}

function isPlainObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Widens two inferred Rust types into one that can hold both. */
function mergeTypes(existing: string | null, incoming: string): string {
  if (existing === null || existing === incoming) return incoming
  if (
    (existing === "i64" && incoming === "f64") ||
    (existing === "f64" && incoming === "i64")
  ) {
    return "f64"
  }
  return UNKNOWN_TYPE
}

interface FieldSpec {
  key: string
  value: JsonValue
  optional: boolean
}

/**
 * Collects the union of keys across every object in an array. A key that is
 * absent from at least one element, or null in any of them, is optional --
 * which is exactly the distinction serde needs to be told about.
 */
function mergeObjects(items: { [key: string]: JsonValue }[]): FieldSpec[] {
  const values = new Map<string, JsonValue>()
  const seenIn = new Map<string, number>()
  const nullable = new Set<string>()

  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      seenIn.set(key, (seenIn.get(key) ?? 0) + 1)
      if (value === null) nullable.add(key)
      const existing = values.get(key)
      if (existing === undefined || existing === null) {
        values.set(key, value)
      } else if (
        typeof existing === "number" &&
        typeof value === "number" &&
        !Number.isInteger(value)
      ) {
        values.set(key, value)
      } else if (isPlainObject(existing) && isPlainObject(value)) {
        values.set(key, { ...existing, ...value })
      }
    }
  }

  return [...values.entries()].map(([key, value]) => ({
    key,
    value,
    optional: nullable.has(key) || (seenIn.get(key) ?? 0) < items.length,
  }))
}

interface RustField {
  name: string
  rename: string | null
  type: string
}

interface RustStruct {
  name: string
  fields: RustField[]
}

interface Builder {
  structs: RustStruct[]
  usedNames: Set<string>
  allOptional: boolean
}

function uniqueName(preferred: string, builder: Builder): string {
  if (!builder.usedNames.has(preferred)) {
    builder.usedNames.add(preferred)
    return preferred
  }
  let suffix = 2
  while (builder.usedNames.has(`${preferred}${suffix}`)) suffix++
  const name = `${preferred}${suffix}`
  builder.usedNames.add(name)
  return name
}

function fieldFrom(spec: FieldSpec, builder: Builder): RustField {
  const snake = toSnakeCase(spec.key)
  const name = RUST_KEYWORDS.has(snake) ? `${snake}_` : snake
  const inner = rustType(spec.value, spec.key, builder)
  const optional = spec.optional || spec.value === null || builder.allOptional
  return {
    name,
    rename: name === spec.key ? null : spec.key,
    type: optional && !inner.startsWith("Option<") ? `Option<${inner}>` : inner,
  }
}

function registerStruct(specs: FieldSpec[], nameHint: string, builder: Builder): string {
  const name = uniqueName(toPascalCase(nameHint), builder)
  const slot: RustStruct = { name, fields: [] }
  builder.structs.push(slot)
  slot.fields = specs.map((spec) => fieldFrom(spec, builder))
  return name
}

function rustType(value: JsonValue, nameHint: string, builder: Builder): string {
  if (value === null) return UNKNOWN_TYPE
  if (typeof value === "string") return "String"
  if (typeof value === "boolean") return "bool"
  if (typeof value === "number") return Number.isInteger(value) ? "i64" : "f64"

  if (Array.isArray(value)) {
    if (value.length === 0) return `Vec<${UNKNOWN_TYPE}>`
    if (value.every(isPlainObject)) {
      const element = registerStruct(
        mergeObjects(value),
        singularize(toPascalCase(nameHint)),
        builder,
      )
      return `Vec<${element}>`
    }
    let element: string | null = null
    for (const item of value) {
      element = mergeTypes(element, rustType(item, singularize(nameHint), builder))
    }
    return `Vec<${element ?? UNKNOWN_TYPE}>`
  }

  const specs = Object.entries(value).map(([key, child]) => ({
    key,
    value: child,
    optional: child === null,
  }))
  return registerStruct(specs, nameHint, builder)
}

interface Options {
  rootName: string
  derives: string[]
  allOptional: boolean
}

function render(builder: Builder, options: Options, alias: string | null): string {
  const derive = `#[derive(${options.derives.join(", ")})]`
  const blocks = builder.structs.map((struct) => {
    const lines = struct.fields.map((field) => {
      const rename = field.rename ? `    #[serde(rename = "${field.rename}")]\n` : ""
      return `${rename}    pub ${field.name}: ${field.type},`
    })
    const body = lines.length > 0 ? `\n${lines.join("\n")}\n` : "\n"
    return `${derive}\npub struct ${struct.name} {${body}}`
  })

  const header = "use serde::{Deserialize, Serialize};\n"
  const parts = [header, ...(alias ? [alias] : []), ...blocks]
  return `${parts.join("\n")}\n`
}

function convert(json: string, options: Options): string {
  const parsed = JSON.parse(json) as JsonValue
  const builder: Builder = {
    structs: [],
    usedNames: new Set(),
    allOptional: options.allOptional,
  }

  const rootName = toPascalCase(options.rootName || "Root")
  let alias: string | null = null

  if (isPlainObject(parsed)) {
    builder.usedNames.add(rootName)
    const slot: RustStruct = { name: rootName, fields: [] }
    builder.structs.push(slot)
    slot.fields = Object.entries(parsed).map(([key, value]) =>
      fieldFrom({ key, value, optional: value === null }, builder),
    )
  } else {
    builder.usedNames.add(rootName)
    const type = rustType(parsed, singularize(rootName), builder)
    alias = `pub type ${rootName} = ${type};\n`
  }

  return render(builder, options, alias)
}

const SAMPLE = `{
  "userId": 42,
  "name": "Ada",
  "isActive": true,
  "score": 91.5,
  "profile": { "url": "https://example.com", "followers": 1200 },
  "tags": ["rust", "serde"]
}`

export default function JsonToRust() {
  const [input, setInput] = useState(SAMPLE)
  const [rootName, setRootName] = useState("Root")
  const [allOptional, setAllOptional] = useState(false)
  const [includeClone, setIncludeClone] = useState(true)

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null }
    const derives = [
      "Debug",
      ...(includeClone ? ["Clone"] : []),
      "Serialize",
      "Deserialize",
    ]
    try {
      return {
        output: convert(input, { rootName, derives, allOptional }),
        error: null,
      }
    } catch (cause) {
      return {
        output: "",
        error: cause instanceof Error ? cause.message : "Could not parse this JSON.",
      }
    }
  }, [input, rootName, allOptional, includeClone])

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="rust-root-name">Root struct name</Label>
          <Input
            id="rust-root-name"
            name="rootName"
            value={rootName}
            onChange={(event) => setRootName(event.target.value)}
            placeholder="Root"
            className="mt-1.5"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center gap-2 sm:self-end sm:pb-2">
          <Switch
            id="rust-all-optional"
            name="allOptional"
            checked={allOptional}
            onCheckedChange={setAllOptional}
          />
          <Label htmlFor="rust-all-optional" className="font-normal">
            Wrap every field in Option
          </Label>
        </div>
        <div className="flex items-center gap-2 sm:self-end sm:pb-2">
          <Switch
            id="rust-clone"
            name="includeClone"
            checked={includeClone}
            onCheckedChange={setIncludeClone}
          />
          <Label htmlFor="rust-clone" className="font-normal">
            Derive Clone
          </Label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="rust-json-input">JSON</Label>
          <Textarea
            id="rust-json-input"
            name="json"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste a JSON response or object."
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="rust-output">Rust structs</Label>
          <Textarea
            id="rust-output"
            name="result"
            value={output}
            readOnly
            placeholder="The generated structs appear here."
            className="bg-muted/40 mt-1.5 min-h-72 resize-y font-mono text-sm"
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

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy structs" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: "text/plain" })}
          filename="types.rs"
          disabled={!output}
        />
        <Button variant="outline" size="sm" onClick={() => setInput("")}>
          Clear
        </Button>
      </div>
    </div>
  )
}
