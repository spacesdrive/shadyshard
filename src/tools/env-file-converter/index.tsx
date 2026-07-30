import { useMemo, useState } from "react"
import { dump, load } from "js-yaml"
import { AlertCircle, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const OUTPUT_FORMATS = [
  { value: "env", label: "dotenv (.env)", filename: ".env", mime: "text/plain" },
  { value: "json", label: "JSON", filename: "env.json", mime: "application/json" },
  { value: "yaml", label: "YAML", filename: "env.yaml", mime: "text/yaml" },
  { value: "shell", label: "Shell exports", filename: "env.sh", mime: "text/x-sh" },
  {
    value: "docker",
    label: "Docker run flags",
    filename: "docker-env.txt",
    mime: "text/plain",
  },
  {
    value: "compose",
    label: "Docker Compose environment",
    filename: "compose-env.yaml",
    mime: "text/yaml",
  },
  {
    value: "configmap",
    label: "Kubernetes ConfigMap",
    filename: "configmap.yaml",
    mime: "text/yaml",
  },
]

const VALID_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/
const WHITESPACE = /\s/

type Entries = [string, string][]

interface ParseResult {
  entries: Entries
  error: string | null
  detected: string
}

/**
 * Drops an inline comment from an unquoted value. Written as a scan rather
 * than a `\s+#` replace: that pattern has to backtrack across every run of
 * whitespace that is not followed by a hash, which is quadratic on a long
 * pasted value.
 */
function stripInlineComment(value: string): string {
  for (let index = 1; index < value.length; index++) {
    if (value[index] === "#" && WHITESPACE.test(value[index - 1])) {
      return value.slice(0, index).trimEnd()
    }
  }
  return value
}

function unquote(raw: string): string {
  const value = raw.trim()
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
  }
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1)
  }
  // An unquoted value ends at the first unescaped hash that begins a comment.
  return stripInlineComment(value).trim()
}

function parseEnv(input: string): Entries {
  const entries: Entries = []
  for (const line of input.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const withoutExport = trimmed.replace(/^export\s+/, "")
    const separator = withoutExport.indexOf("=")
    if (separator === -1) continue
    entries.push([
      withoutExport.slice(0, separator).trim(),
      unquote(withoutExport.slice(separator + 1)),
    ])
  }
  return entries
}

function fromPlainObject(value: unknown): Entries {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected an object mapping variable names to values.")
  }
  return Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
    key,
    entry === null || entry === undefined ? "" : String(entry),
  ])
}

function parseInput(input: string, format: string): ParseResult {
  const trimmed = input.trim()
  if (!trimmed) return { entries: [], error: null, detected: "dotenv" }

  const looksLikeJson = trimmed.startsWith("{")
  const resolved =
    format === "auto" ? (looksLikeJson ? "json" : detectTextFormat(trimmed)) : format

  try {
    if (resolved === "json") {
      return {
        entries: fromPlainObject(JSON.parse(trimmed)),
        error: null,
        detected: "JSON",
      }
    }
    if (resolved === "yaml") {
      return { entries: fromPlainObject(load(trimmed)), error: null, detected: "YAML" }
    }
    return { entries: parseEnv(trimmed), error: null, detected: "dotenv" }
  } catch (e) {
    return {
      entries: [],
      error:
        e instanceof Error
          ? `Could not read the input as ${resolved.toUpperCase()}. ${e.message}`
          : "Could not read the input.",
      detected: resolved,
    }
  }
}

/**
 * dotenv and YAML both look like key/value lines, so they are told apart by
 * the separator: dotenv always uses "=" before any ":" on a line.
 */
function detectTextFormat(input: string): string {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
  const envLike = lines.filter((line) => {
    const equals = line.replace(/^export\s+/, "").indexOf("=")
    const colon = line.indexOf(":")
    return equals > 0 && (colon === -1 || equals < colon)
  })
  return envLike.length >= lines.length / 2 ? "env" : "yaml"
}

function quoteForEnv(value: string): string {
  if (value === "") return ""
  if (/[\s#"'\\$]/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`
  }
  return value
}

function quoteForShell(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

function render(entries: Entries, format: string, name: string): string {
  if (entries.length === 0) return ""
  const asObject = Object.fromEntries(entries)

  switch (format) {
    case "json":
      return JSON.stringify(asObject, null, 2)
    case "yaml":
      return dump(asObject, { lineWidth: 120 }).trimEnd()
    case "shell":
      return entries
        .map(([key, value]) => `export ${key}=${quoteForShell(value)}`)
        .join("\n")
    case "docker":
      return entries
        .map(([key, value]) => `-e ${key}=${quoteForShell(value)}`)
        .join(" \\\n")
    case "compose":
      return `environment:\n${entries
        .map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`)
        .join("\n")}`
    case "configmap":
      return dump(
        {
          apiVersion: "v1",
          kind: "ConfigMap",
          metadata: { name: name || "app-config" },
          data: asObject,
        },
        { lineWidth: 120 },
      ).trimEnd()
    default:
      return entries.map(([key, value]) => `${key}=${quoteForEnv(value)}`).join("\n")
  }
}

export default function EnvFileConverter() {
  const [input, setInput] = useState("")
  const [inputFormat, setInputFormat] = useState("auto")
  const [outputFormat, setOutputFormat] = useState("json")
  const [configMapName, setConfigMapName] = useState("app-config")

  const { entries, error, detected } = useMemo(
    () => parseInput(input, inputFormat),
    [input, inputFormat],
  )

  const invalidKeys = entries.map(([key]) => key).filter((key) => !VALID_KEY.test(key))

  const duplicateKeys = entries
    .map(([key]) => key)
    .filter((key, index, all) => all.indexOf(key) !== index)

  const output = useMemo(
    () => render(entries, outputFormat, configMapName),
    [entries, outputFormat, configMapName],
  )

  const target =
    OUTPUT_FORMATS.find((format) => format.value === outputFormat) ?? OUTPUT_FORMATS[0]

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="env-converter-input">Input</Label>
        <Textarea
          id="env-converter-input"
          name="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            '# database\nDATABASE_URL=postgres://localhost:5432/app\nAPI_TOKEN="a b c"\nDEBUG=false'
          }
          className="mt-1.5 min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="env-converter-in-format">Input format</Label>
          <Select
            value={inputFormat}
            onValueChange={(next) => next && setInputFormat(next as string)}
          >
            <SelectTrigger id="env-converter-in-format" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Detect automatically</SelectItem>
              <SelectItem value="env">dotenv (.env)</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
            </SelectContent>
          </Select>
          {inputFormat === "auto" && input.trim() && !error && (
            <p className="text-muted-foreground mt-1.5 text-xs">Read as {detected}.</p>
          )}
        </div>

        <div>
          <Label htmlFor="env-converter-out-format">Output format</Label>
          <Select
            value={outputFormat}
            onValueChange={(next) => next && setOutputFormat(next as string)}
          >
            <SelectTrigger id="env-converter-out-format" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTPUT_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {outputFormat === "configmap" && (
        <div>
          <Label htmlFor="env-converter-configmap-name">ConfigMap name</Label>
          <Input
            id="env-converter-configmap-name"
            name="configMapName"
            value={configMapName}
            onChange={(event) => setConfigMapName(event.target.value)}
            placeholder="app-config"
            className="mt-1.5 sm:max-w-xs"
          />
        </div>
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span className="wrap-anywhere">{error}</span>
        </div>
      )}

      {invalidKeys.length > 0 && (
        <p className="text-destructive text-sm">
          Not valid environment variable names: {invalidKeys.join(", ")}. Names must start
          with a letter or underscore and contain only letters, digits, and underscores.
        </p>
      )}

      {duplicateKeys.length > 0 && (
        <p className="text-destructive text-sm">
          Defined more than once: {Array.from(new Set(duplicateKeys)).join(", ")}. The
          last value of each wins in the output.
        </p>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="env-converter-output">
            Output
            <span className="text-muted-foreground ml-2 text-xs font-normal tabular-nums">
              {entries.length} {entries.length === 1 ? "variable" : "variables"}
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={output} label="Copy output" />
            <DownloadButton
              getBlob={() => new Blob([output], { type: target.mime })}
              filename={target.filename}
              disabled={!output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setInputFormat("auto")
                setOutputFormat("json")
                setConfigMapName("app-config")
              }}
              disabled={!input}
            >
              <Trash2 className="size-4" />
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="env-converter-output"
          name="output"
          value={output}
          readOnly
          className="min-h-44 resize-y font-mono text-sm"
          placeholder="Converted output appears here"
        />
      </div>
    </div>
  )
}
