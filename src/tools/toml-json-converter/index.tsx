import { useMemo, useState } from "react"
import { AlertCircle, ArrowLeftRight, RotateCcw } from "lucide-react"
import { parse as parseToml, stringify as stringifyToml, TomlError } from "smol-toml"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

type Direction = "tomlToJson" | "jsonToToml"

const SAMPLE_TOML = `[package]
name = "shadyshard"
version = "0.1.0"
edition = "2024"

[dependencies]
serde = { version = "1.0", features = ["derive"] }

[[bin]]
name = "cli"
path = "src/main.rs"`

/** TOML integers outside the safe range come back as BigInt, which JSON.stringify rejects. */
function jsonReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value
}

interface Conversion {
  output: string
  error: string | null
}

function convert(input: string, direction: Direction): Conversion {
  if (!input.trim()) return { output: "", error: null }

  if (direction === "tomlToJson") {
    try {
      return { output: JSON.stringify(parseToml(input), jsonReplacer, 2), error: null }
    } catch (error) {
      if (error instanceof TomlError) {
        return {
          output: "",
          error: `TOML syntax error on line ${error.line}, column ${error.column}. ${error.message}`,
        }
      }
      return {
        output: "",
        error: error instanceof Error ? error.message : "The TOML could not be parsed.",
      }
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    return { output: "", error: `Not valid JSON. ${detail}` }
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      output: "",
      error:
        "TOML documents must be an object at the top level, not an array or a scalar.",
    }
  }

  try {
    return { output: stringifyToml(parsed as Record<string, unknown>), error: null }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    return { output: "", error: `This JSON cannot be represented as TOML. ${detail}` }
  }
}

export default function TomlJsonConverter() {
  const [input, setInput] = useState("")
  const [direction, setDirection] = useState<Direction>("tomlToJson")

  const conversion = useMemo(() => convert(input, direction), [input, direction])

  const toTargetJson = direction === "tomlToJson"
  const sourceLabel = toTargetJson ? "TOML" : "JSON"
  const targetLabel = toTargetJson ? "JSON" : "TOML"

  function swap() {
    setDirection(toTargetJson ? "jsonToToml" : "tomlToJson")
    if (conversion.output) setInput(conversion.output)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={swap}>
          <ArrowLeftRight className="size-4" />
          Convert {targetLabel} to {sourceLabel}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDirection("tomlToJson")
            setInput(SAMPLE_TOML)
          }}
        >
          Load example
        </Button>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="toml-json-input">{sourceLabel} input</Label>
          <Textarea
            id="toml-json-input"
            name="input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={toTargetJson ? 'title = "Example"' : '{ "title": "Example" }'}
            className="min-h-64 resize-y font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="toml-json-output">{targetLabel} output</Label>
            <div className="flex gap-2">
              <CopyButton value={conversion.output} label="Copy" />
              <DownloadButton
                getBlob={() =>
                  new Blob([conversion.output], {
                    type: toTargetJson ? "application/json" : "application/toml",
                  })
                }
                filename={toTargetJson ? "config.json" : "config.toml"}
                disabled={!conversion.output}
              />
            </div>
          </div>
          <Textarea
            id="toml-json-output"
            name="output"
            value={conversion.output}
            readOnly
            className="min-h-64 resize-y font-mono text-sm"
          />
        </div>
      </div>

      {conversion.error && (
        <p
          role="alert"
          className="text-destructive flex items-start gap-2 text-sm break-words"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {conversion.error}
        </p>
      )}
    </div>
  )
}
