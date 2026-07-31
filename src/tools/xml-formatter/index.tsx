import { useMemo, useState } from "react"
import { CheckCircle2 } from "lucide-react"
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

const INDENT_OPTIONS = [
  { value: "2", label: "2 spaces", indent: "  " },
  { value: "4", label: "4 spaces", indent: "    " },
  { value: "tab", label: "Tab", indent: "\t" },
  { value: "minify", label: "Minify to one line", indent: "" },
]

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;").replace(/\n/g, "&#10;")
}

function openTag(element: Element): string {
  const attributes = Array.from(element.attributes)
    .map((attribute) => ` ${attribute.name}="${escapeAttribute(attribute.value)}"`)
    .join("")
  return `<${element.tagName}${attributes}`
}

function significantChildren(node: Node): Node[] {
  return Array.from(node.childNodes).filter(
    (child) => child.nodeType !== Node.TEXT_NODE || (child.nodeValue ?? "").trim() !== "",
  )
}

function serializeNode(node: Node, depth: number, indent: string): string[] {
  const pad = indent.repeat(depth)

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.nodeValue ?? "").trim()
    return text ? [`${pad}${escapeText(text)}`] : []
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return [`${pad}<!--${node.nodeValue ?? ""}-->`]
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return [`${pad}<![CDATA[${node.nodeValue ?? ""}]]>`]
  }

  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const instruction = node as ProcessingInstruction
    return [`${pad}<?${instruction.target} ${instruction.data}?>`]
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return []

  const element = node as Element
  const children = significantChildren(element)

  if (children.length === 0) {
    return [`${pad}${openTag(element)} />`]
  }

  const onlyTextChild =
    children.length === 1 && children[0].nodeType === Node.TEXT_NODE
      ? (children[0].nodeValue ?? "").trim()
      : null

  if (onlyTextChild !== null) {
    return [`${pad}${openTag(element)}>${escapeText(onlyTextChild)}</${element.tagName}>`]
  }

  const lines = [`${pad}${openTag(element)}>`]
  for (const child of children) {
    lines.push(...serializeNode(child, depth + 1, indent))
  }
  lines.push(`${pad}</${element.tagName}>`)
  return lines
}

function formatXml(input: string, indent: string): string {
  const doc = new DOMParser().parseFromString(input, "application/xml")
  const parseError = doc.querySelector("parsererror")
  if (parseError) {
    const detail = (parseError.textContent ?? "").replace(/\s+/g, " ").trim()
    throw new Error(detail || "This is not well-formed XML.")
  }

  const declaration = input.trimStart().startsWith("<?xml")
    ? input.trimStart().slice(0, input.trimStart().indexOf("?>") + 2)
    : null

  const nodes = Array.from(doc.childNodes).flatMap((node) =>
    serializeNode(node, 0, indent),
  )
  const body =
    indent === "" ? nodes.map((line) => line.trim()).join("") : nodes.join("\n")

  if (!declaration) return body
  return indent === "" ? `${declaration}${body}` : `${declaration}\n${body}`
}

export default function XmlFormatter() {
  const [input, setInput] = useState("")
  const [indentChoice, setIndentChoice] = useState("2")

  const indent =
    INDENT_OPTIONS.find((option) => option.value === indentChoice)?.indent ?? "  "

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: null }
    try {
      return { output: formatXml(input, indent), error: null }
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : "This is not well-formed XML.",
      }
    }
  }, [input, indent])

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="xml-input">XML input</Label>
        <Textarea
          id="xml-input"
          name="xmlInput"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={'<catalog><book id="1"><title>Example</title></book></catalog>'}
          className="mt-1.5 min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={result.error ? true : undefined}
        />
      </div>

      <div className="max-w-sm">
        <Label htmlFor="xml-indent">Output style</Label>
        <Select
          value={indentChoice}
          onValueChange={(next) => next && setIndentChoice(next as string)}
        >
          <SelectTrigger id="xml-indent" className="mt-1.5 w-full">
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

      {result.error && (
        <p className="text-destructive text-sm" role="alert">
          {result.error}
        </p>
      )}

      {result.output && !result.error && (
        <p className="flex items-center gap-2 text-sm text-emerald-500">
          <CheckCircle2 className="size-4" aria-hidden />
          Well-formed XML
        </p>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="xml-output">Result</Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={result.output} label="Copy XML" />
            <DownloadButton
              getBlob={() => new Blob([result.output], { type: "application/xml" })}
              filename="formatted.xml"
              disabled={!result.output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setIndentChoice("2")
              }}
              disabled={!input}
            >
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="xml-output"
          name="xmlOutput"
          value={result.output}
          readOnly
          placeholder="The formatted XML appears here."
          className="min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
