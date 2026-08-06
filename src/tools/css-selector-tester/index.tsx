import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { parseHtml, nodeMarkup } from "@/lib/html-document"

const SAMPLE_MARKUP = `<section class="pricing">
  <div class="plan" data-tier="free">
    <h3>Free</h3><a class="cta" href="/signup">Start</a>
  </div>
  <div class="plan featured" data-tier="pro">
    <h3>Pro</h3><a class="cta" href="/checkout?plan=pro">Upgrade</a>
  </div>
</section>`

interface Match {
  descriptor: string
  markup: string
  text: string
  attribute: string | null
}

interface Result {
  matches: Match[]
  error: string | null
}

function describeElement(element: Element): string {
  const id = element.id ? `#${element.id}` : ""
  const classes = Array.from(element.classList)
    .map((name) => `.${name}`)
    .join("")
  return `${element.tagName.toLowerCase()}${id}${classes}`
}

function runSelector(markup: string, selector: string, attribute: string): Result {
  if (!markup.trim() || !selector.trim()) return { matches: [], error: null }

  const document = parseHtml(markup)
  const wanted = attribute.trim()

  let elements: Element[]
  try {
    elements = Array.from(document.querySelectorAll(selector))
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    return { matches: [], error: `Invalid CSS selector. ${detail}` }
  }

  return {
    error: null,
    matches: elements.map((element) => ({
      descriptor: describeElement(element),
      markup: nodeMarkup(element),
      text: (element.textContent ?? "").replace(/\s+/g, " ").trim(),
      attribute: wanted ? element.getAttribute(wanted) : null,
    })),
  }
}

export default function CssSelectorTester() {
  const [markup, setMarkup] = useState("")
  const [selector, setSelector] = useState("")
  const [attribute, setAttribute] = useState("")

  const result = useMemo(
    () => runSelector(markup, selector, attribute),
    [markup, selector, attribute],
  )

  const wantsAttribute = Boolean(attribute.trim())
  const copyValue = wantsAttribute
    ? result.matches.map((match) => match.attribute ?? "").join("\n")
    : result.matches.map((match) => match.markup).join("\n")
  const hasInput = Boolean(markup.trim() && selector.trim())

  function loadSample() {
    setMarkup(SAMPLE_MARKUP)
    setSelector(".plan.featured .cta")
    setAttribute("href")
  }

  function reset() {
    setMarkup("")
    setSelector("")
    setAttribute("")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={loadSample}>
          Load example
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={!markup && !selector && !attribute}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="css-selector-tester-markup">HTML markup</Label>
        <Textarea
          id="css-selector-tester-markup"
          name="markup"
          value={markup}
          onChange={(event) => setMarkup(event.target.value)}
          placeholder="<div class='card'><a href='/docs'>Docs</a></div>"
          className="min-h-48 resize-y font-mono text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="css-selector-tester-selector">CSS selector</Label>
          <Input
            id="css-selector-tester-selector"
            name="selector"
            value={selector}
            onChange={(event) => setSelector(event.target.value)}
            placeholder="a[href^='/docs']"
            className="font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="css-selector-tester-attribute">
            Attribute to extract (optional)
          </Label>
          <Input
            id="css-selector-tester-attribute"
            name="attribute"
            value={attribute}
            onChange={(event) => setAttribute(event.target.value)}
            placeholder="href"
            className="font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      {result.error && (
        <p
          role="alert"
          className="text-destructive flex items-start gap-2 text-sm break-words"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {result.error}
        </p>
      )}

      {hasInput && !result.error && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">
              {result.matches.length}{" "}
              {result.matches.length === 1 ? "element matches" : "elements match"}
            </p>
            <CopyButton
              value={copyValue}
              label={wantsAttribute ? "Copy values" : "Copy markup"}
            />
          </div>

          {result.matches.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              The selector is valid but matched nothing in this markup.
            </p>
          ) : (
            <ol className="space-y-2">
              {result.matches.map((match, index) => (
                <li
                  key={index}
                  className="border-border/60 space-y-1 rounded-lg border p-3 text-sm"
                >
                  <p className="text-muted-foreground text-xs">
                    {index + 1}. {match.descriptor}
                  </p>
                  {wantsAttribute && (
                    <p className="font-mono break-all">
                      {match.attribute ?? (
                        <span className="text-muted-foreground italic">
                          attribute not present
                        </span>
                      )}
                    </p>
                  )}
                  <p className="font-mono break-all">{match.markup}</p>
                  {match.text && (
                    <p className="text-muted-foreground break-words">{match.text}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
