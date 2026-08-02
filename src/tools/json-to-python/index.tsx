import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

type Target = "pydantic" | "dataclass" | "typeddict"

const TARGETS: { value: Target; label: string }[] = [
  { value: "pydantic", label: "Pydantic v2 BaseModel" },
  { value: "dataclass", label: "Dataclass" },
  { value: "typeddict", label: "TypedDict" },
]

const PYTHON_KEYWORDS = new Set([
  "False",
  "None",
  "True",
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
])

interface ModelField {
  name: string
  alias: string | null
  type: string
  optional: boolean
}

interface Model {
  name: string
  fields: ModelField[]
}

function toPascalCase(value: string): string {
  const parts = value.split(/[^A-Za-z0-9]+/).filter(Boolean)
  if (parts.length === 0) return "Model"
  const joined = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
  return /^[0-9]/.test(joined) ? `Model${joined}` : joined
}

function toSnakeCase(value: string): string {
  const snake = value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase()
  if (!snake) return "field"
  if (/^[0-9]/.test(snake) || PYTHON_KEYWORDS.has(snake)) return `${snake}_`
  return snake
}

/** Strips a trailing plural "s" so a list of "items" produces an Item class. */
function singularize(value: string): string {
  if (/ies$/i.test(value)) return `${value.slice(0, -3)}y`
  if (/(s|sh|ch|x|z)es$/i.test(value)) return value.slice(0, -2)
  if (/[^s]s$/i.test(value)) return value.slice(0, -1)
  return value
}

class ModelBuilder {
  readonly models: Model[] = []
  private readonly usedNames = new Set<string>()

  private uniqueName(base: string): string {
    let name = base
    let counter = 2
    while (this.usedNames.has(name)) {
      name = `${base}${counter}`
      counter += 1
    }
    this.usedNames.add(name)
    return name
  }

  /** Returns the Python type annotation for `value`, generating classes as needed. */
  typeOf(value: unknown, hint: string): string {
    if (value === null) return "None"
    if (typeof value === "boolean") return "bool"
    if (typeof value === "number") return Number.isInteger(value) ? "int" : "float"
    if (typeof value === "string") return "str"

    if (Array.isArray(value)) {
      if (value.length === 0) return "list[Any]"
      const itemHint = singularize(hint)
      const itemTypes = new Set(value.map((item) => this.typeOf(item, itemHint)))
      const withoutNone = [...itemTypes].filter((type) => type !== "None")
      if (withoutNone.length === 0) return "list[None]"
      if (withoutNone.length > 1) return "list[Any]"
      const itemType = withoutNone[0]
      return itemTypes.has("None") ? `list[Optional[${itemType}]]` : `list[${itemType}]`
    }

    if (typeof value === "object") {
      return this.addModel(value as Record<string, unknown>, hint)
    }

    return "Any"
  }

  addModel(source: Record<string, unknown>, hint: string): string {
    const name = this.uniqueName(toPascalCase(hint))
    const fields: ModelField[] = []
    const takenFieldNames = new Set<string>()

    for (const [key, value] of Object.entries(source)) {
      let fieldName = toSnakeCase(key)
      while (takenFieldNames.has(fieldName)) fieldName = `${fieldName}_`
      takenFieldNames.add(fieldName)

      const type = this.typeOf(value, key)
      fields.push({
        name: fieldName,
        alias: fieldName === key ? null : key,
        type: type === "None" ? "Any" : type,
        optional: value === null,
      })
    }

    const model: Model = { name, fields }
    this.models.push(model)
    return name
  }
}

function annotation(field: ModelField): string {
  return field.optional ? `Optional[${field.type}]` : field.type
}

function collectImports(models: Model[], target: Target): string[] {
  const body = models
    .flatMap((model) => model.fields.map((field) => annotation(field)))
    .join(" ")
  const typing: string[] = []
  if (body.includes("Any")) typing.push("Any")
  if (body.includes("Optional[")) typing.push("Optional")

  const lines: string[] = []
  if (target === "dataclass") lines.push("from dataclasses import dataclass")
  if (typing.length > 0) lines.push(`from typing import ${typing.join(", ")}`)
  if (target === "typeddict") lines.push("from typing import TypedDict")
  if (target === "pydantic") {
    const needsField = models.some((model) =>
      model.fields.some((field) => field.alias !== null),
    )
    lines.push(
      needsField
        ? "from pydantic import BaseModel, ConfigDict, Field"
        : "from pydantic import BaseModel",
    )
  }
  return lines
}

function renderModel(model: Model, target: Target): string {
  const lines: string[] = []
  const hasAlias = model.fields.some((field) => field.alias !== null)

  if (target === "dataclass") lines.push("@dataclass")
  const base =
    target === "pydantic" ? "(BaseModel)" : target === "typeddict" ? "(TypedDict)" : ""
  lines.push(`class ${model.name}${base}:`)

  if (target === "pydantic" && hasAlias) {
    lines.push("    model_config = ConfigDict(populate_by_name=True)")
    lines.push("")
  }

  if (model.fields.length === 0) {
    lines.push("    pass")
    return lines.join("\n")
  }

  /** Dataclasses reject a defaulted field before a required one, so optionals go last. */
  const ordered =
    target === "dataclass"
      ? [
          ...model.fields.filter((field) => !field.optional),
          ...model.fields.filter((field) => field.optional),
        ]
      : model.fields

  for (const field of ordered) {
    const type = annotation(field)
    if (target === "pydantic") {
      if (field.alias) {
        const parts = [`alias=${JSON.stringify(field.alias)}`]
        if (field.optional) parts.unshift("default=None")
        lines.push(`    ${field.name}: ${type} = Field(${parts.join(", ")})`)
      } else {
        lines.push(`    ${field.name}: ${type}${field.optional ? " = None" : ""}`)
      }
    } else if (target === "dataclass") {
      lines.push(`    ${field.name}: ${type}${field.optional ? " = None" : ""}`)
    } else {
      lines.push(`    ${field.name}: ${type}`)
    }
  }

  return lines.join("\n")
}

interface GeneratedCode {
  code: string
  renamed: { from: string; to: string }[]
}

function generate(json: string, rootName: string, target: Target): GeneratedCode {
  const parsed: unknown = JSON.parse(json)
  const root = Array.isArray(parsed) ? parsed[0] : parsed

  if (root === null || typeof root !== "object" || Array.isArray(root)) {
    throw new Error(
      "The top level must be a JSON object, or an array of objects, so there are fields to model.",
    )
  }

  const builder = new ModelBuilder()
  builder.addModel(root as Record<string, unknown>, rootName || "Model")

  /** A nested class is pushed before its parent finishes, so this is already definition-before-use order. */
  const ordered = builder.models
  const imports = collectImports(ordered, target)
  const body = ordered.map((model) => renderModel(model, target)).join("\n\n\n")

  const renamed = ordered.flatMap((model) =>
    model.fields
      .filter((field) => field.alias !== null)
      .map((field) => ({ from: field.alias as string, to: field.name })),
  )

  return { code: `${imports.join("\n")}\n\n\n${body}\n`, renamed }
}

const SAMPLE = `{
  "id": 42,
  "full-name": "Ada Lovelace",
  "email": "ada@example.com",
  "score": 91.5,
  "active": true,
  "manager": null,
  "address": { "city": "London", "postcode": "NW1 4NP" },
  "tags": ["engineering", "founder"]
}`

export default function JsonToPython() {
  const [input, setInput] = useState(SAMPLE)
  const [rootName, setRootName] = useState("User")
  const [target, setTarget] = useState<Target>("pydantic")

  const result = useMemo(() => {
    if (!input.trim()) return { code: "", renamed: [], error: null }
    try {
      const generated = generate(input, rootName, target)
      return { ...generated, error: null }
    } catch (error) {
      return {
        code: "",
        renamed: [] as { from: string; to: string }[],
        error: error instanceof Error ? error.message : "That input is not valid JSON.",
      }
    }
  }, [input, rootName, target])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="python-root-name">Root class name</Label>
          <Input
            id="python-root-name"
            name="rootName"
            className="mt-1.5"
            value={rootName}
            onChange={(event) => setRootName(event.target.value)}
            placeholder="User"
          />
        </div>
        <div>
          <Label htmlFor="python-target">Output style</Label>
          <Select
            value={target}
            onValueChange={(value) => value && setTarget(value as Target)}
          >
            <SelectTrigger id="python-target" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGETS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="python-json-input">JSON sample</Label>
        <Textarea
          id="python-json-input"
          name="json"
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste a JSON object or an array of objects"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result.code} label="Copy Python" />
        <DownloadButton
          getBlob={() => new Blob([result.code], { type: "text/x-python" })}
          filename="models.py"
          disabled={!result.code}
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

      {result.renamed.length > 0 && target !== "pydantic" && (
        <p className="text-muted-foreground text-sm">
          Renamed to valid Python names:{" "}
          {result.renamed.map((entry) => `${entry.from} to ${entry.to}`).join(", ")}. Only
          Pydantic output can keep the original key through an alias.
        </p>
      )}

      <div>
        <Label htmlFor="python-output">Generated Python</Label>
        <Textarea
          id="python-output"
          name="python"
          readOnly
          className="mt-1.5 min-h-64 resize-y font-mono text-sm"
          value={result.code}
          placeholder="The generated classes appear here."
        />
      </div>
    </div>
  )
}
