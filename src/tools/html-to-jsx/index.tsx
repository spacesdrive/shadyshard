import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import DOMPurify from "dompurify"
import { nodeToJsx } from "@/lib/jsx"

const SAMPLE = `<div class="card" style="padding: 16px; border-radius: 8px">
  <img src="/logo.png" alt="Logo" width="48">
  <label for="email">Email</label>
  <input id="email" type="email" required>
  <!-- call to action -->
  <button class="btn" onclick="submitForm()">Send</button>
</div>`

/**
 * Markup is sanitized rather than parsed straight into a document. Scripts
 * and inline handlers cannot survive the translation to JSX anyway, so
 * removing them costs nothing and keeps pasted markup from carrying an
 * executable payload into whatever component the output is dropped into.
 * iframes are added back because embedding one is a legitimate reason to
 * convert markup in the first place.
 */
const SANITIZE_CONFIG = {
  RETURN_DOM: true,
  ADD_TAGS: ["iframe", "style", "#comment"],
  ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"],
}

/** Reads what the sanitizer just stripped so the tool can report it. */
function describeRemovals(): string[] {
  const elements = new Set<string>()
  const attributes = new Set<string>()

  for (const entry of DOMPurify.removed) {
    const removal = entry as { element?: Node; attribute?: Attr }
    if (removal.attribute) {
      attributes.add(removal.attribute.name.toLowerCase())
    } else if (removal.element && removal.element.nodeType === Node.ELEMENT_NODE) {
      elements.add(`<${removal.element.nodeName.toLowerCase()}>`)
    }
  }

  return [...elements, ...attributes].sort()
}

function indentBlock(code: string, spaces: number): string {
  const pad = " ".repeat(spaces)
  return code
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n")
}

interface ConversionResult {
  code: string
  removed: string[]
  error: string | null
}

function convert(
  html: string,
  wrapInComponent: boolean,
  componentName: string,
  stripComments: boolean,
): ConversionResult {
  const body = DOMPurify.sanitize(html, SANITIZE_CONFIG) as unknown as HTMLElement
  const removed = describeRemovals()

  const blocks = Array.from(body.childNodes)
    .map((node) => nodeToJsx(node, { indentUnit: "  ", stripComments }))
    .filter(Boolean)

  if (blocks.length === 0) {
    return {
      code: "",
      removed,
      error: "No elements were found in that markup.",
    }
  }

  /** JSX allows one root, so more than one top-level node needs a fragment. */
  const jsx =
    blocks.length === 1
      ? blocks[0]
      : `<>\n${blocks.map((block) => indentBlock(block, 2)).join("\n")}\n</>`

  if (!wrapInComponent) return { code: jsx, removed, error: null }

  const safeName = /^[A-Za-z_$][\w$]*$/.test(componentName) ? componentName : "Component"
  const returned =
    blocks.length === 1 && !jsx.includes("\n") ? jsx : `(\n${indentBlock(jsx, 4)}\n  )`

  return {
    code: `export default function ${safeName}() {\n  return ${returned}\n}\n`,
    removed,
    error: null,
  }
}

export default function HtmlToJsx() {
  const [html, setHtml] = useState(SAMPLE)
  const [wrapInComponent, setWrapInComponent] = useState(true)
  const [componentName, setComponentName] = useState("Card")
  const [stripComments, setStripComments] = useState(false)

  const result = useMemo(() => {
    if (!html.trim()) {
      return { code: "", removed: [], error: null } as ConversionResult
    }
    return convert(html, wrapInComponent, componentName, stripComments)
  }, [html, wrapInComponent, componentName, stripComments])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="jsx-html-input">HTML</Label>
        <Textarea
          id="jsx-html-input"
          name="html"
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          placeholder="Paste your HTML here"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch
              id="jsx-wrap"
              name="wrapInComponent"
              checked={wrapInComponent}
              onCheckedChange={setWrapInComponent}
            />
            <Label htmlFor="jsx-wrap" className="font-normal">
              Wrap in a component
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="jsx-strip-comments"
              name="stripComments"
              checked={stripComments}
              onCheckedChange={setStripComments}
            />
            <Label htmlFor="jsx-strip-comments" className="font-normal">
              Remove comments
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="jsx-component-name">Component name</Label>
          <Input
            id="jsx-component-name"
            name="componentName"
            className="mt-1.5"
            value={componentName}
            onChange={(event) => setComponentName(event.target.value)}
            disabled={!wrapInComponent}
            placeholder="Card"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result.code} label="Copy JSX" />
        <DownloadButton
          getBlob={() => new Blob([result.code], { type: "text/plain" })}
          filename={
            wrapInComponent ? `${componentName || "Component"}.tsx` : "snippet.jsx"
          }
          disabled={!result.code}
        />
        <Button variant="outline" size="sm" onClick={() => setHtml("")} disabled={!html}>
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

      {result.removed.length > 0 && (
        <p className="text-muted-foreground text-sm">
          Removed while converting: {result.removed.join(", ")}. An inline handler cannot
          become a JSX prop, since React needs a function there, so attach those in your
          component instead.
        </p>
      )}

      <div>
        <Label htmlFor="jsx-output">JSX</Label>
        <Textarea
          id="jsx-output"
          name="jsx"
          readOnly
          className="mt-1.5 min-h-56 resize-y font-mono text-sm"
          value={result.code}
          placeholder="The converted JSX appears here."
        />
      </div>
    </div>
  )
}
