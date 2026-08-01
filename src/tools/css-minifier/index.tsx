import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { formatBytes } from "@/lib/image"

type Token =
  | { type: "text"; value: string }
  | { type: "comment"; value: string }
  | { type: "open" }
  | { type: "close" }
  | { type: "semi" }

interface ParseResult {
  tokens: Token[]
  error: string | null
}

function lineOf(css: string, index: number): number {
  let line = 1
  for (let i = 0; i < index; i++) {
    if (css[i] === "\n") line++
  }
  return line
}

/**
 * Splits CSS into structural tokens without interpreting selectors or values.
 * Strings and comments are copied verbatim so a quoted brace or semicolon
 * never changes the nesting depth, which is what makes the brace-balance
 * check below trustworthy.
 */
function tokenize(css: string): ParseResult {
  const tokens: Token[] = []
  let buffer = ""
  let depth = 0
  let error: string | null = null

  function flush() {
    const trimmed = buffer.trim()
    if (trimmed) tokens.push({ type: "text", value: trimmed })
    buffer = ""
  }

  for (let i = 0; i < css.length; i++) {
    const char = css[i]

    if (char === '"' || char === "'") {
      const quote = char
      const start = i
      buffer += char
      i++
      let closed = false
      while (i < css.length) {
        if (css[i] === "\\" && i + 1 < css.length) {
          buffer += css[i] + css[i + 1]
          i += 2
          continue
        }
        buffer += css[i]
        if (css[i] === quote) {
          closed = true
          break
        }
        i++
      }
      if (!closed && !error) {
        error = `Unterminated ${quote === '"' ? "double" : "single"}-quoted string starting on line ${lineOf(css, start)}.`
      }
      continue
    }

    if (char === "/" && css[i + 1] === "*") {
      flush()
      const end = css.indexOf("*/", i + 2)
      if (end === -1) {
        if (!error) {
          error = `Unterminated comment starting on line ${lineOf(css, i)}.`
        }
        tokens.push({ type: "comment", value: css.slice(i) + " */" })
        break
      }
      tokens.push({ type: "comment", value: css.slice(i, end + 2) })
      i = end + 1
      continue
    }

    if (char === "{") {
      flush()
      depth++
      tokens.push({ type: "open" })
      continue
    }

    if (char === "}") {
      flush()
      depth--
      if (depth < 0 && !error) {
        error = `Unexpected closing brace on line ${lineOf(css, i)} with no matching opening brace.`
        depth = 0
      }
      tokens.push({ type: "close" })
      continue
    }

    if (char === ";") {
      flush()
      tokens.push({ type: "semi" })
      continue
    }

    if (/\s/.test(char)) {
      if (buffer && !buffer.endsWith(" ")) buffer += " "
      continue
    }

    buffer += char
  }

  flush()

  if (!error && depth > 0) {
    error = `${depth} block${depth === 1 ? " is" : "s are"} never closed. Check for a missing closing brace.`
  }

  return { tokens, error }
}

function formatCss(tokens: Token[], indent: string): string {
  let out = ""
  let depth = 0

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const pad = indent.repeat(depth)

    if (token.type === "comment") {
      out += pad + token.value + "\n"
      continue
    }

    if (token.type === "text") {
      const next = tokens[i + 1]
      if (next?.type === "open") {
        out += pad + token.value + " {\n"
        depth++
        i++
        continue
      }
      out += pad + token.value + ";\n"
      if (next?.type === "semi") i++
      continue
    }

    if (token.type === "open") {
      out += pad + "{\n"
      depth++
      continue
    }

    if (token.type === "close") {
      depth = Math.max(0, depth - 1)
      out += indent.repeat(depth) + "}\n"
      if (depth === 0) out += "\n"
    }
  }

  return out.trim() + "\n"
}

/**
 * Tightens "prop : value" to "prop:value". Only applied when the part before
 * the first colon is a bare property name, so a descendant selector such as
 * "li :first-child" and a colon inside a quoted value are both left alone.
 */
const PROPERTY_NAME = /^-{0,2}[A-Za-z][A-Za-z0-9-]*$/

function tightenDeclaration(value: string): string {
  const colon = value.indexOf(":")
  if (colon === -1) return value

  const property = value.slice(0, colon).trimEnd()
  if (!PROPERTY_NAME.test(property)) return value

  return `${property}:${value.slice(colon + 1).trimStart()}`
}

function minifyCss(tokens: Token[], keepComments: boolean): string {
  let out = ""

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.type === "comment") {
      if (keepComments) out += token.value
      continue
    }

    if (token.type === "text") {
      const next = tokens[i + 1]
      if (next?.type === "open") {
        out += token.value + "{"
        i++
        continue
      }
      out += tightenDeclaration(token.value)
      if (next?.type === "semi") {
        out += ";"
        i++
      }
      continue
    }

    if (token.type === "open") {
      out += "{"
      continue
    }

    if (token.type === "close") {
      if (out.endsWith(";")) out = out.slice(0, -1)
      out += "}"
      continue
    }
  }

  return out
}

const INDENTS: { value: string; label: string; text: string }[] = [
  { value: "2", label: "2 spaces", text: "  " },
  { value: "4", label: "4 spaces", text: "    " },
  { value: "tab", label: "Tab", text: "\t" },
]

const SAMPLE = `/* Card styles */
.card, .card--wide {
  display: flex;
  padding: 1rem 1.25rem;
  border-radius: 12px;
}

@media (min-width: 640px) {
  .card { padding: 1.5rem }
}
`

export default function CssMinifier() {
  const [input, setInput] = useState(SAMPLE)
  const [mode, setMode] = useState("minify")
  const [indent, setIndent] = useState("2")
  const [keepComments, setKeepComments] = useState(false)

  const parsed = useMemo(() => tokenize(input), [input])

  const output = useMemo(() => {
    if (!input.trim()) return ""
    const indentText = INDENTS.find((entry) => entry.value === indent)?.text ?? "  "
    return mode === "minify"
      ? minifyCss(parsed.tokens, keepComments)
      : formatCss(parsed.tokens, indentText)
  }, [input, mode, indent, keepComments, parsed.tokens])

  const inputBytes = new Blob([input]).size
  const outputBytes = new Blob([output]).size
  const saved = inputBytes > 0 ? ((inputBytes - outputBytes) / inputBytes) * 100 : 0

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)}>
        <TabsList>
          <TabsTrigger value="minify">Minify</TabsTrigger>
          <TabsTrigger value="format">Format</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-end gap-4">
        {mode === "format" ? (
          <div className="w-40">
            <Label htmlFor="css-indent">Indentation</Label>
            <Select
              value={indent}
              onValueChange={(value) => value && setIndent(value as string)}
            >
              <SelectTrigger id="css-indent" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDENTS.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Switch
              id="css-keep-comments"
              name="keepComments"
              checked={keepComments}
              onCheckedChange={setKeepComments}
            />
            <Label htmlFor="css-keep-comments" className="font-normal">
              Keep comments
            </Label>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="css-input">CSS input</Label>
          <Textarea
            id="css-input"
            name="css"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste a stylesheet here."
            className="mt-1.5 min-h-64 resize-y font-mono text-sm"
            spellCheck={false}
            aria-invalid={parsed.error ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="css-output">
            {mode === "minify" ? "Minified CSS" : "Formatted CSS"}
          </Label>
          <Textarea
            id="css-output"
            name="result"
            value={output}
            readOnly
            placeholder="The result appears here."
            className="bg-muted/40 mt-1.5 min-h-64 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      {parsed.error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{parsed.error}</span>
        </div>
      )}

      {output && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold tabular-nums">
              {formatBytes(inputBytes)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Input</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold tabular-nums">
              {formatBytes(outputBytes)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Output</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold tabular-nums">
              {saved > 0 ? `${saved.toFixed(1)}%` : "0%"}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Smaller</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy result" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: "text/css" })}
          filename={mode === "minify" ? "styles.min.css" : "styles.css"}
          disabled={!output}
        />
        <Button variant="outline" size="sm" onClick={() => setInput("")}>
          Clear
        </Button>
      </div>
    </div>
  )
}
