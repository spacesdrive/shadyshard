import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { parseHtml, parseXml, nodeMarkup } from "@/lib/html-document"

const SAMPLE_MARKUP = `<article class="post">
  <h1 id="title">Release notes</h1>
  <ul class="links">
    <li><a href="/changelog" rel="nofollow">Changelog</a></li>
    <li><a href="https://example.com/docs">Documentation</a></li>
  </ul>
  <p data-role="summary">Two fixes and one new export format.</p>
</article>`

type SourceMode = "html" | "xml"

interface NodeMatch {
  label: string
  value: string
}

interface Evaluation {
  resultType: string
  matches: NodeMatch[]
  scalar: string | null
  error: string | null
}

const NODE_TYPE_LABELS: Record<number, string> = {
  [Node.ELEMENT_NODE]: "element",
  [Node.ATTRIBUTE_NODE]: "attribute",
  [Node.TEXT_NODE]: "text",
  [Node.CDATA_SECTION_NODE]: "cdata",
  [Node.PROCESSING_INSTRUCTION_NODE]: "processing instruction",
  [Node.COMMENT_NODE]: "comment",
  [Node.DOCUMENT_NODE]: "document",
}

function describeNode(node: Node): string {
  const kind = NODE_TYPE_LABELS[node.nodeType] ?? "node"
  return `${node.nodeName.toLowerCase()} (${kind})`
}

const EMPTY: Evaluation = { resultType: "", matches: [], scalar: null, error: null }

function evaluate(markup: string, expression: string, mode: SourceMode): Evaluation {
  if (!markup.trim() || !expression.trim()) return EMPTY

  let document: Document
  if (mode === "xml") {
    const parsed = parseXml(markup)
    if (!parsed.document) return { ...EMPTY, error: parsed.error }
    document = parsed.document
  } else {
    document = parseHtml(markup)
  }

  let result: XPathResult
  try {
    result = document.evaluate(expression, document, null, XPathResult.ANY_TYPE, null)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    return { ...EMPTY, error: `Invalid XPath expression. ${detail}` }
  }

  if (result.resultType === XPathResult.NUMBER_TYPE) {
    return { ...EMPTY, resultType: "number", scalar: String(result.numberValue) }
  }
  if (result.resultType === XPathResult.STRING_TYPE) {
    return { ...EMPTY, resultType: "string", scalar: result.stringValue }
  }
  if (result.resultType === XPathResult.BOOLEAN_TYPE) {
    return { ...EMPTY, resultType: "boolean", scalar: String(result.booleanValue) }
  }

  const matches: NodeMatch[] = []
  for (let node = result.iterateNext(); node; node = result.iterateNext()) {
    matches.push({ label: describeNode(node), value: nodeMarkup(node) })
  }
  return { ...EMPTY, resultType: "node set", matches }
}

export default function XPathTester() {
  const [markup, setMarkup] = useState("")
  const [expression, setExpression] = useState("")
  const [mode, setMode] = useState<SourceMode>("html")

  const evaluation = useMemo(
    () => evaluate(markup, expression, mode),
    [markup, expression, mode],
  )

  const resultText =
    evaluation.scalar ?? evaluation.matches.map((match) => match.value).join("\n")
  const hasInput = Boolean(markup.trim() && expression.trim())

  function loadSample() {
    setMode("html")
    setMarkup(SAMPLE_MARKUP)
    setExpression("//a/@href")
  }

  function reset() {
    setMarkup("")
    setExpression("")
    setMode("html")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={mode} onValueChange={(value) => setMode(value as SourceMode)}>
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="xml">XML</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={loadSample}>
          Load example
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={!markup && !expression}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="xpath-tester-markup">
          {mode === "xml" ? "XML document" : "HTML markup"}
        </Label>
        <Textarea
          id="xpath-tester-markup"
          name="markup"
          value={markup}
          onChange={(event) => setMarkup(event.target.value)}
          placeholder={
            mode === "xml"
              ? "<root><item>one</item></root>"
              : "<div><a href='/docs'>Docs</a></div>"
          }
          className="min-h-48 resize-y font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="xpath-tester-expression">XPath expression</Label>
        <Input
          id="xpath-tester-expression"
          name="expression"
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          placeholder="//a[@rel='nofollow']"
          className="font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {evaluation.error && (
        <p
          role="alert"
          className="text-destructive flex items-start gap-2 text-sm break-words"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {evaluation.error}
        </p>
      )}

      {hasInput && !evaluation.error && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">
              {evaluation.scalar !== null
                ? `Result type: ${evaluation.resultType}`
                : `${evaluation.matches.length} ${evaluation.matches.length === 1 ? "match" : "matches"}`}
            </p>
            <CopyButton value={resultText} label="Copy result" />
          </div>

          {evaluation.scalar !== null ? (
            <p className="border-border/60 bg-muted/40 rounded-lg border p-3 font-mono text-sm break-all">
              {evaluation.scalar}
            </p>
          ) : evaluation.matches.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              The expression is valid but matched no nodes in this document.
            </p>
          ) : (
            <ol className="space-y-2">
              {evaluation.matches.map((match, index) => (
                <li
                  key={index}
                  className="border-border/60 rounded-lg border p-3 text-sm"
                >
                  <p className="text-muted-foreground mb-1 text-xs">
                    {index + 1}. {match.label}
                  </p>
                  <p className="font-mono break-all">{match.value}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
