import { useMemo, useState } from "react"
import { dump } from "js-yaml"
import { Button } from "@/components/ui/button"
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

const OUTPUT_FORMATS = [
  { value: "json", label: "JSON", filename: "env.json", mimeType: "application/json" },
  { value: "yaml", label: "YAML mapping", filename: "env.yaml", mimeType: "text/yaml" },
  {
    value: "compose",
    label: "Docker Compose environment list",
    filename: "compose-environment.yaml",
    mimeType: "text/yaml",
  },
  {
    value: "shell",
    label: "Shell export lines",
    filename: "env.sh",
    mimeType: "text/plain",
  },
  { value: "env", label: ".env file", filename: ".env", mimeType: "text/plain" },
  {
    value: "example",
    label: ".env.example (values blanked)",
    filename: ".env.example",
    mimeType: "text/plain",
  },
]

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

function parseEnv(input: string): [string, string][] {
  const entries: [string, string][] = []
  const lines = input.replace(/\r\n?/g, "\n").split("\n")

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) continue

    const withoutExport = trimmed.replace(/^export\s+/, "")
    const separator = withoutExport.indexOf("=")
    if (separator === -1) {
      throw new Error(`Line ${index + 1} has no "=" and is not a comment: "${trimmed}"`)
    }

    const key = withoutExport.slice(0, separator).trim()
    if (!KEY_PATTERN.test(key)) {
      throw new Error(
        `Line ${index + 1} has "${key}" as a variable name. Names may contain only letters, digits, and underscores, and cannot start with a digit.`,
      )
    }

    const rawValue = withoutExport.slice(separator + 1).trim()
    let value: string

    if (rawValue.startsWith('"') && rawValue.endsWith('"') && rawValue.length >= 2) {
      value = rawValue
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\")
    } else if (
      rawValue.startsWith("'") &&
      rawValue.endsWith("'") &&
      rawValue.length >= 2
    ) {
      value = rawValue.slice(1, -1)
    } else {
      value = rawValue.split(" #")[0].trim()
    }

    entries.push([key, value])
  }

  if (entries.length === 0) {
    throw new Error("No variables were found. Expected lines in the form KEY=value.")
  }

  return entries
}

function parseJsonInput(input: string): [string, string][] {
  const parsed: unknown = JSON.parse(input)
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON input must be an object of key and value pairs.")
  }
  return Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [
    key,
    value === null ? "" : String(value),
  ])
}

function quoteEnvValue(value: string): string {
  if (value === "") return ""
  if (/[\s#"'\\]|^$/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`
  }
  return value
}

function quoteShellValue(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

function serialise(entries: [string, string][], format: string): string {
  switch (format) {
    case "json":
      return JSON.stringify(Object.fromEntries(entries), null, 2)
    case "yaml":
      return dump(Object.fromEntries(entries))
    case "compose":
      return dump({
        environment: entries.map(([key, value]) => `${key}=${value}`),
      })
    case "shell":
      return entries
        .map(([key, value]) => `export ${key}=${quoteShellValue(value)}`)
        .join("\n")
    case "example":
      return entries.map(([key]) => `${key}=`).join("\n")
    default:
      return entries.map(([key, value]) => `${key}=${quoteEnvValue(value)}`).join("\n")
  }
}

export default function EnvFileConverter() {
  const [input, setInput] = useState("")
  const [outputFormat, setOutputFormat] = useState("json")

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: null, count: 0 }
    try {
      const entries = input.trimStart().startsWith("{")
        ? parseJsonInput(input)
        : parseEnv(input)
      return {
        output: serialise(entries, outputFormat),
        error: null,
        count: entries.length,
      }
    } catch (error) {
      return {
        output: "",
        count: 0,
        error:
          error instanceof Error ? error.message : "Could not read this as a .env file.",
      }
    }
  }, [input, outputFormat])

  const selectedFormat =
    OUTPUT_FORMATS.find((format) => format.value === outputFormat) ?? OUTPUT_FORMATS[0]

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="env-input">.env or JSON input</Label>
        <Textarea
          id="env-input"
          name="envInput"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            '# Database\nDATABASE_URL=postgres://localhost:5432/app\nAPI_KEY="example key"'
          }
          className="mt-1.5 min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={result.error ? true : undefined}
        />
      </div>

      <div className="max-w-sm">
        <Label htmlFor="env-format">Convert to</Label>
        <Select
          value={outputFormat}
          onValueChange={(next) => next && setOutputFormat(next as string)}
        >
          <SelectTrigger id="env-format" className="mt-1.5 w-full">
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

      {result.error && <p className="text-destructive text-sm">{result.error}</p>}

      {result.count > 0 && (
        <p className="text-muted-foreground text-sm">
          {result.count} {result.count === 1 ? "variable" : "variables"} parsed.
        </p>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="env-output">Result</Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={result.output} label="Copy result" />
            <DownloadButton
              getBlob={() => new Blob([result.output], { type: selectedFormat.mimeType })}
              filename={selectedFormat.filename}
              disabled={!result.output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setOutputFormat("json")
              }}
              disabled={!input}
            >
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="env-output"
          name="envOutput"
          value={result.output}
          readOnly
          placeholder="The converted output appears here."
          className="min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
