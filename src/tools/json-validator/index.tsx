import { useMemo, useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface ValidationResult {
  valid: boolean
  message: string
  type?: string
  size?: number
  location?: { line: number; column: number }
}

function locateError(
  input: string,
  errorMessage: string,
): { line: number; column: number } | undefined {
  const match = /position (\d+)/.exec(errorMessage)
  if (!match) return undefined
  const position = Number(match[1])
  const before = input.slice(0, position)
  const line = before.split("\n").length
  const column = position - before.lastIndexOf("\n")
  return { line, column }
}

function describeType(value: unknown): string {
  if (Array.isArray(value))
    return `array (${value.length} item${value.length === 1 ? "" : "s"})`
  if (value === null) return "null"
  if (typeof value === "object") {
    const keyCount = Object.keys(value as object).length
    return `object (${keyCount} key${keyCount === 1 ? "" : "s"})`
  }
  return typeof value
}

function validate(input: string): ValidationResult | null {
  if (!input.trim()) return null
  try {
    const parsed = JSON.parse(input)
    return {
      valid: true,
      message: "Valid JSON",
      type: describeType(parsed),
      size: new TextEncoder().encode(input).length,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON"
    return {
      valid: false,
      message,
      location: locateError(input, message),
    }
  }
}

export default function JsonValidator() {
  const [input, setInput] = useState("")
  const result = useMemo(() => validate(input), [input])

  return (
    <div className="space-y-4">
      <Textarea
        id="json-validator-input"
        name="json"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"example": "Paste your JSON here..."}'
        className="min-h-64 resize-y font-mono text-sm"
        aria-label="JSON to validate"
        spellCheck={false}
      />

      {result && (
        <div
          className={
            result.valid
              ? "flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm"
          }
        >
          {result.valid ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <div>
            <p className="font-medium">{result.valid ? "Valid JSON" : "Invalid JSON"}</p>
            {result.valid ? (
              <p className="mt-0.5 opacity-90">
                Parses to a top-level {result.type}, {result.size} bytes.
              </p>
            ) : (
              <p className="mt-0.5 opacity-90">
                {result.message}
                {result.location &&
                  ` (line ${result.location.line}, column ${result.location.column})`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
