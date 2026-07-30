import { useMemo, useState } from "react"
import { AlertCircle, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { formatBytes } from "@/lib/image"

const INDENT_OPTIONS = [
  { value: "2", label: "Two spaces", text: "  " },
  { value: "4", label: "Four spaces", text: "    " },
  { value: "tab", label: "Tab", text: "\t" },
]

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;")
}

function openTag(element: Element, selfClosing: boolean): string {
  const attributes = Array.from(element.attributes)
    .map((attribute) => ` ${attribute.name}="${escapeAttribute(attribute.value)}"`)
    .join("")
  return `<${element.nodeName}${attributes}${selfClosing ? " />" : ">"}`
}

function isMeaningful(node: Node): boolean {
  return node.nodeType !== Node.TEXT_NODE || (node.nodeValue ?? "").trim() !== ""
}

function serializeNode(
  node: Node,
  indent: string,
  depth: number,
  minify: boolean,
): string {
  const pad = minify ? "" : indent.repeat(depth)
  const newline = minify ? "" : "\n"

  if (node.nodeType === Node.TEXT_NODE) {
    const value = (node.nodeValue ?? "").trim()
    return value ? `${pad}${escapeText(value)}${newline}` : ""
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${node.nodeValue ?? ""}-->${newline}`
  }
  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${pad}<![CDATA[${node.nodeValue ?? ""}]]>${newline}`
  }
  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const instruction = node as ProcessingInstruction
    return `${pad}<?${instruction.target} ${instruction.data}?>${newline}`
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ""

  const element = node as Element
  const children = Array.from(element.childNodes).filter(isMeaningful)

  if (children.length === 0) {
    return `${pad}${openTag(element, true)}${newline}`
  }

  // An element whose content is only text stays on one line so its value is
  // never changed by the indentation added around it.
  const textOnly = children.every((child) => child.nodeType === Node.TEXT_NODE)
  if (textOnly) {
    const value = children.map((child) => (child.nodeValue ?? "").trim()).join(" ")
    return `${pad}${openTag(element, false)}${escapeText(value)}</${element.nodeName}>${newline}`
  }

  const inner = children
    .map((child) => serializeNode(child, indent, depth + 1, minify))
    .join("")
  return `${pad}${openTag(element, false)}${newline}${inner}${pad}</${element.nodeName}>${newline}`
}

interface FormatResult {
  output: string
  error: string | null
  elementCount: number
}

function formatXml(input: string, indent: string, minify: boolean): FormatResult {
  const trimmed = input.trim()
  if (!trimmed) return { output: "", error: null, elementCount: 0 }

  const document = new DOMParser().parseFromString(trimmed, "application/xml")
  const failure = document.querySelector("parsererror")
  if (failure) {
    return {
      output: "",
      error: (failure.textContent ?? "").trim() || "This is not well-formed XML.",
      elementCount: 0,
    }
  }

  const declaration = trimmed.match(/^<\?xml[^?]*\?>/)?.[0] ?? ""
  const body = Array.from(document.childNodes)
    .map((node) => serializeNode(node, indent, 0, minify))
    .join("")
    .trimEnd()

  const output = declaration ? `${declaration}${minify ? "" : "\n"}${body}` : body

  return {
    output,
    error: null,
    elementCount: document.getElementsByTagName("*").length,
  }
}

export default function XmlFormatter() {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<"format" | "minify">("format")
  const [indentKey, setIndentKey] = useState("2")

  const indent = INDENT_OPTIONS.find((option) => option.value === indentKey)?.text ?? "  "

  const { output, error, elementCount } = useMemo(
    () => formatXml(input, indent, mode === "minify"),
    [input, indent, mode],
  )

  const inputBytes = new TextEncoder().encode(input).length
  const outputBytes = new TextEncoder().encode(output).length

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="xml-formatter-input">XML input</Label>
        <Textarea
          id="xml-formatter-input"
          name="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={'<catalog><book id="1"><title>Dune</title></book></catalog>'}
          className="mt-1.5 min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as "format" | "minify")}
        >
          <TabsList>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="minify">Minify</TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === "format" && (
          <div className="min-w-44">
            <Label htmlFor="xml-formatter-indent">Indentation</Label>
            <Select
              value={indentKey}
              onValueChange={(next) => next && setIndentKey(next as string)}
            >
              <SelectTrigger id="xml-formatter-indent" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span className="wrap-anywhere">{error}</span>
        </div>
      )}

      {output && (
        <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-sm tabular-nums">
          <span>
            {elementCount} {elementCount === 1 ? "element" : "elements"}
          </span>
          <span>Input {formatBytes(inputBytes)}</span>
          <span>Output {formatBytes(outputBytes)}</span>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="xml-formatter-output">Result</Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={output} label="Copy XML" />
            <DownloadButton
              getBlob={() => new Blob([output], { type: "application/xml" })}
              filename="formatted.xml"
              disabled={!output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setMode("format")
                setIndentKey("2")
              }}
              disabled={!input}
            >
              <Trash2 className="size-4" />
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="xml-formatter-output"
          name="output"
          value={output}
          readOnly
          className="min-h-44 resize-y font-mono text-sm"
          placeholder="Formatted XML appears here"
        />
      </div>
    </div>
  )
}
