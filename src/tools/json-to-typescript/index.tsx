import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const RESERVED_SAFE_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/

function pascalCase(name: string): string {
  const words = name.match(/[A-Za-z0-9]+/g) ?? ["Type"]
  return words.map((word) => word[0].toUpperCase() + word.slice(1)).join("")
}

function singular(name: string): string {
  if (name.endsWith("ies")) return `${name.slice(0, -3)}y`
  if (name.endsWith("sses") || name.endsWith("shes")) return name.slice(0, -2)
  if (name.endsWith("s") && !name.endsWith("ss")) return name.slice(0, -1)
  return name
}

function unionOf(members: Set<string>): string {
  if (members.size === 0) return "unknown"
  const sorted = [...members].sort()
  return sorted.join(" | ")
}

interface InterfaceBuilder {
  addObject(
    shape: Map<string, { types: Set<string>; optional: boolean }>,
    name: string,
  ): string
  render(): string
}

function createInterfaceBuilder(keyword: "interface" | "type"): InterfaceBuilder {
  const blocks: string[] = []
  const usedNames = new Set<string>()

  function uniqueName(preferred: string): string {
    let name = preferred || "Type"
    let counter = 2
    while (usedNames.has(name)) {
      name = `${preferred}${counter}`
      counter++
    }
    usedNames.add(name)
    return name
  }

  return {
    addObject(shape, name) {
      const typeName = uniqueName(name)
      const lines = [...shape.entries()].map(([key, field]) => {
        const safeKey = RESERVED_SAFE_KEY.test(key) ? key : JSON.stringify(key)
        return `  ${safeKey}${field.optional ? "?" : ""}: ${unionOf(field.types)}`
      })
      const body = lines.length > 0 ? `\n${lines.join("\n")}\n` : ""
      const header =
        keyword === "interface" ? `interface ${typeName} {` : `type ${typeName} = {`
      blocks.unshift(`${header}${body}}`)
      return typeName
    },
    render() {
      return blocks.map((block) => `export ${block}`).join("\n\n")
    },
  }
}

function isPlainObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function describeValue(
  value: JsonValue,
  name: string,
  builder: InterfaceBuilder,
): string {
  if (value === null) return "null"
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]"

    const objects = value.filter(isPlainObject)
    if (objects.length === value.length) {
      const typeName = buildObjectType(objects, singular(name), builder)
      return `${typeName}[]`
    }

    const members = new Set(
      value.map((item) => describeValue(item, singular(name), builder)),
    )
    const union = unionOf(members)
    return members.size > 1 ? `(${union})[]` : `${union}[]`
  }
  if (isPlainObject(value)) {
    return buildObjectType([value], name, builder)
  }
  return typeof value === "number"
    ? "number"
    : typeof value === "boolean"
      ? "boolean"
      : "string"
}

function buildObjectType(
  samples: { [key: string]: JsonValue }[],
  name: string,
  builder: InterfaceBuilder,
): string {
  const shape = new Map<string, { types: Set<string>; optional: boolean }>()

  for (const sample of samples) {
    for (const [key, value] of Object.entries(sample)) {
      const field = shape.get(key) ?? { types: new Set<string>(), optional: false }
      field.types.add(describeValue(value, pascalCase(key), builder))
      shape.set(key, field)
    }
  }

  for (const [key, field] of shape) {
    field.optional = samples.some((sample) => !Object.hasOwn(sample, key))
  }

  return builder.addObject(shape, pascalCase(name))
}

function generate(json: string, rootName: string, useTypeAlias: boolean): string {
  const parsed = JSON.parse(json) as JsonValue
  const builder = createInterfaceBuilder(useTypeAlias ? "type" : "interface")
  const safeRoot = pascalCase(rootName || "Root")

  if (isPlainObject(parsed)) {
    buildObjectType([parsed], safeRoot, builder)
    return builder.render()
  }

  const rendered = describeValue(parsed, safeRoot, builder)
  const alias = `export type ${safeRoot} = ${rendered}`
  const blocks = builder.render()
  return blocks ? `${blocks}\n\n${alias}` : alias
}

const EXAMPLE = `{
  "id": 42,
  "name": "Ada Lovelace",
  "active": true,
  "tags": ["math", "computing"],
  "profile": { "city": "London", "website": null },
  "posts": [
    { "title": "Notes", "views": 1200 },
    { "title": "Sketch", "views": 800, "pinned": true }
  ]
}`

export default function JsonToTypescript() {
  const [json, setJson] = useState(EXAMPLE)
  const [rootName, setRootName] = useState("Root")
  const [useTypeAlias, setUseTypeAlias] = useState(false)

  const { output, error } = useMemo(() => {
    if (!json.trim()) return { output: "", error: null }
    try {
      return { output: generate(json, rootName, useTypeAlias), error: null }
    } catch (e) {
      return {
        output: "",
        error: e instanceof Error ? e.message : "This JSON could not be parsed.",
      }
    }
  }, [json, rootName, useTypeAlias])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="json-to-ts-root">Root type name</Label>
          <Input
            id="json-to-ts-root"
            name="rootName"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            placeholder="Root"
            className="mt-1.5 max-w-60 font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center gap-2 pb-1">
          <Switch
            id="json-to-ts-alias"
            name="useTypeAlias"
            checked={useTypeAlias}
            onCheckedChange={setUseTypeAlias}
          />
          <Label htmlFor="json-to-ts-alias" className="font-normal">
            Use type aliases instead of interfaces
          </Label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="json-to-ts-input">JSON</Label>
          <Textarea
            id="json-to-ts-input"
            name="json"
            value={json}
            onChange={(e) => setJson(e.target.value)}
            className="mt-1.5 min-h-80 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="json-to-ts-output">TypeScript</Label>
          <Textarea
            id="json-to-ts-output"
            name="typescript"
            value={output}
            readOnly
            className="mt-1.5 min-h-80 resize-y font-mono text-sm"
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
        <CopyButton value={output} label="Copy TypeScript" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: "text/plain" })}
          filename="types.ts"
          label="Download .ts"
          disabled={!output}
        />
      </div>
    </div>
  )
}
