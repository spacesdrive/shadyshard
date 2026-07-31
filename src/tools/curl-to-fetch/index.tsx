import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { CopyButton } from "@/components/tool/CopyButton"

const SAMPLE = `curl 'https://api.example.com/v1/items' \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer sk-example-token' \\
  -d '{"name":"Widget","quantity":3}'`

/** Flags that take a value we care about, in their long and short forms. */
const VALUE_FLAGS = new Set([
  "-X",
  "--request",
  "-H",
  "--header",
  "-d",
  "--data",
  "--data-raw",
  "--data-binary",
  "--data-ascii",
  "--data-urlencode",
  "--json",
  "-u",
  "--user",
  "-b",
  "--cookie",
  "-F",
  "--form",
  "-A",
  "--user-agent",
  "-e",
  "--referer",
  "--url",
])

/** Flags with no fetch equivalent. Recognised so their value is not read as the URL. */
const IGNORED_VALUE_FLAGS = new Set([
  "-o",
  "--output",
  "-w",
  "--write-out",
  "--connect-timeout",
  "--max-time",
  "-m",
  "--retry",
  "--resolve",
  "--cacert",
  "--cert",
  "--key",
  "--proxy",
  "-x",
])

interface ParsedRequest {
  url: string
  method: string
  headers: [string, string][]
  body: string | null
  formFields: [string, string][]
}

class CurlParseError extends Error {}

/** Splits a command the way a POSIX shell would, honouring quotes and escapes. */
function tokenize(command: string): string[] {
  const tokens: string[] = []
  let current = ""
  let started = false
  let quote: '"' | "'" | null = null

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index]

    if (quote === "'") {
      if (char === "'") quote = null
      else current += char
      continue
    }

    if (quote === '"') {
      if (char === "\\" && index + 1 < command.length) {
        const next = command[index + 1]
        // Inside double quotes a backslash only escapes a few characters.
        if (next === '"' || next === "\\" || next === "$" || next === "`") {
          current += next
          index += 1
        } else if (next === "\n") {
          index += 1
        } else {
          current += char
        }
      } else if (char === '"') {
        quote = null
      } else {
        current += char
      }
      continue
    }

    if (char === "'" || char === '"') {
      quote = char
      started = true
      continue
    }

    if (char === "\\" && index + 1 < command.length) {
      const next = command[index + 1]
      current += next === "\n" ? "" : next
      index += 1
      started = true
      continue
    }

    if (/\s/.test(char)) {
      if (current || started) {
        tokens.push(current)
        current = ""
        started = false
      }
      continue
    }

    current += char
    started = true
  }

  if (quote) throw new CurlParseError("The command has an unclosed quote.")
  if (current || started) tokens.push(current)

  return tokens
}

function splitHeader(raw: string): [string, string] {
  const separator = raw.indexOf(":")
  if (separator === -1) return [raw.trim(), ""]
  return [raw.slice(0, separator).trim(), raw.slice(separator + 1).trim()]
}

function encodeBasicAuth(credentials: string): string {
  const pair = credentials.includes(":") ? credentials : `${credentials}:`
  try {
    return btoa(pair)
  } catch {
    // btoa only accepts Latin-1, so fall back to a UTF-8 safe path.
    const bytes = new TextEncoder().encode(pair)
    return btoa(String.fromCharCode(...bytes))
  }
}

function parseCurl(command: string): ParsedRequest {
  const tokens = tokenize(command.trim()).filter((token) => token !== "")
  if (tokens.length === 0) throw new CurlParseError("Paste a cURL command to convert.")

  const start = tokens[0] === "curl" ? 1 : 0
  if (start === 0 && !tokens[0].startsWith("http")) {
    throw new CurlParseError("The command should start with curl.")
  }

  let url = ""
  let method = ""
  const headers: [string, string][] = []
  const dataParts: string[] = []
  const formFields: [string, string][] = []
  let jsonBody: string | null = null

  for (let index = start; index < tokens.length; index += 1) {
    const token = tokens[index]

    if (IGNORED_VALUE_FLAGS.has(token)) {
      index += 1
      continue
    }

    if (VALUE_FLAGS.has(token)) {
      const value = tokens[index + 1]
      if (value === undefined) {
        throw new CurlParseError(`The ${token} flag is missing its value.`)
      }
      index += 1

      switch (token) {
        case "-X":
        case "--request":
          method = value.toUpperCase()
          break
        case "-H":
        case "--header":
          headers.push(splitHeader(value))
          break
        case "--json":
          jsonBody = value
          break
        case "--data-urlencode": {
          const separator = value.indexOf("=")
          dataParts.push(
            separator === -1
              ? encodeURIComponent(value)
              : `${value.slice(0, separator)}=${encodeURIComponent(value.slice(separator + 1))}`,
          )
          break
        }
        case "-u":
        case "--user":
          headers.push(["Authorization", `Basic ${encodeBasicAuth(value)}`])
          break
        case "-b":
        case "--cookie":
          headers.push(["Cookie", value])
          break
        case "-A":
        case "--user-agent":
          headers.push(["User-Agent", value])
          break
        case "-e":
        case "--referer":
          headers.push(["Referer", value])
          break
        case "-F":
        case "--form": {
          const separator = value.indexOf("=")
          formFields.push(
            separator === -1
              ? [value, ""]
              : [value.slice(0, separator), value.slice(separator + 1)],
          )
          break
        }
        case "--url":
          url = value
          break
        default:
          dataParts.push(value)
      }
      continue
    }

    if (token.startsWith("-")) continue

    if (!url) url = token
  }

  if (!url) {
    throw new CurlParseError("No URL was found in the command.")
  }

  if (jsonBody !== null) {
    if (!headers.some(([name]) => name.toLowerCase() === "content-type")) {
      headers.push(["Content-Type", "application/json"])
    }
    if (!headers.some(([name]) => name.toLowerCase() === "accept")) {
      headers.push(["Accept", "application/json"])
    }
  }

  const body =
    jsonBody !== null ? jsonBody : dataParts.length > 0 ? dataParts.join("&") : null

  if (!method) {
    method = body !== null || formFields.length > 0 ? "POST" : "GET"
  }

  return { url, method, headers, body, formFields }
}

function quote(value: string): string {
  return JSON.stringify(value)
}

function buildFetchCode(request: ParsedRequest, useAwait: boolean): string {
  const lines: string[] = []
  const options: string[] = [`  method: ${quote(request.method)},`]

  if (request.headers.length > 0) {
    options.push("  headers: {")
    for (const [name, value] of request.headers) {
      options.push(`    ${quote(name)}: ${quote(value)},`)
    }
    options.push("  },")
  }

  if (request.formFields.length > 0) {
    lines.push("const formData = new FormData()")
    for (const [name, value] of request.formFields) {
      const isFileReference = value.startsWith("@")
      lines.push(
        isFileReference
          ? `formData.append(${quote(name)}, /* File for ${quote(value.slice(1))} */ file)`
          : `formData.append(${quote(name)}, ${quote(value)})`,
      )
    }
    lines.push("")
    options.push("  body: formData,")
  } else if (request.body !== null) {
    options.push(`  body: ${quote(request.body)},`)
  }

  const call = `fetch(${quote(request.url)}, {\n${options.join("\n")}\n})`

  if (useAwait) {
    lines.push(`const response = await ${call}`)
    lines.push("")
    lines.push("if (!response.ok) {")
    lines.push("  throw new Error(`Request failed with status ${response.status}`)")
    lines.push("}")
    lines.push("")
    lines.push("const data = await response.json()")
    lines.push("console.log(data)")
  } else {
    lines.push(`${call}`)
    lines.push("  .then((response) => {")
    lines.push("    if (!response.ok) {")
    lines.push("      throw new Error(`Request failed with status ${response.status}`)")
    lines.push("    }")
    lines.push("    return response.json()")
    lines.push("  })")
    lines.push("  .then((data) => console.log(data))")
    lines.push("  .catch((error) => console.error(error))")
  }

  return lines.join("\n")
}

export default function CurlToFetch() {
  const [input, setInput] = useState("")
  const [useAwait, setUseAwait] = useState(true)

  const result = useMemo(() => {
    if (!input.trim()) return { code: "", error: null, request: null }
    try {
      const request = parseCurl(input)
      return { code: buildFetchCode(request, useAwait), error: null, request }
    } catch (error) {
      return {
        code: "",
        request: null,
        error:
          error instanceof CurlParseError
            ? error.message
            : "Could not read this as a cURL command.",
      }
    }
  }, [input, useAwait])

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="curl-input">cURL command</Label>
          <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE)}>
            Load example
          </Button>
        </div>
        <Textarea
          id="curl-input"
          name="curlCommand"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="curl 'https://api.example.com/v1/items' -H 'Accept: application/json'"
          className="min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={result.error ? true : undefined}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="curl-await"
          name="useAwait"
          checked={useAwait}
          onCheckedChange={setUseAwait}
        />
        <Label htmlFor="curl-await" className="font-normal">
          Use async/await instead of a promise chain
        </Label>
      </div>

      {result.error && <p className="text-destructive text-sm">{result.error}</p>}

      {result.request && (
        <div className="border-border/60 flex flex-wrap gap-x-6 gap-y-2 rounded-lg border p-3 text-sm">
          <span>
            <span className="text-muted-foreground">Method </span>
            <span className="font-mono">{result.request.method}</span>
          </span>
          <span className="min-w-0">
            <span className="text-muted-foreground">URL </span>
            <span className="font-mono break-all">{result.request.url}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Headers </span>
            <span className="font-mono tabular-nums">
              {result.request.headers.length}
            </span>
          </span>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="curl-output">JavaScript fetch</Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={result.code} label="Copy code" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setUseAwait(true)
              }}
              disabled={!input}
            >
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="curl-output"
          name="fetchCode"
          value={result.code}
          readOnly
          placeholder="The generated fetch call appears here."
          className="min-h-52 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
