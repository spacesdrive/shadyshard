import { useMemo, useState } from "react"
import { CircleAlert, CircleCheck, RotateCcw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"
import { parseHtml } from "@/lib/html-document"

const EXAMPLE = `<main>
  <h1>Choosing a bike lock</h1>
  <h2>How locks are rated</h2>
  <h4>Sold Secure ratings</h4>
  <h2></h2>
  <h3>U-locks</h3>
  <h1>About the author</h1>
</main>`

interface HeadingEntry {
  level: number
  text: string
  problems: string[]
}

interface Outline {
  headings: HeadingEntry[]
  documentProblems: string[]
  counts: number[]
}

/**
 * A heading's text as a reader and a screen reader would perceive it. Script
 * and style contents are part of textContent but are never rendered, so a
 * heading holding an inline script would otherwise be reported as having text
 * when it visibly has none.
 */
function headingText(element: Element): string {
  const clone = element.cloneNode(true) as Element
  for (const hidden of clone.querySelectorAll("script, style, template")) hidden.remove()
  return (clone.textContent ?? "").replace(/\s+/g, " ").trim()
}

function analyse(markup: string): Outline {
  const document = parseHtml(markup)
  const elements = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
  const counts = [0, 0, 0, 0, 0, 0]
  const headings: HeadingEntry[] = []
  let previousLevel: number | null = null

  for (const element of elements) {
    const level = Number(element.tagName.slice(1))
    counts[level - 1]++
    const text = headingText(element)
    const problems: string[] = []

    if (text === "") {
      const image = element.querySelector("img")
      const alt = image?.getAttribute("alt")?.trim()
      if (alt) {
        problems.push(
          `Holds only an image. Its accessible name comes from the alt text, "${alt}".`,
        )
      } else {
        problems.push(
          "This heading has no text, so it is announced as an empty heading and adds a level for nothing.",
        )
      }
    }

    if (previousLevel !== null && level > previousLevel + 1) {
      problems.push(
        `Jumps from h${previousLevel} to h${level}. Add the missing level or promote this heading to h${previousLevel + 1}.`,
      )
    }

    headings.push({ level, text, problems })
    previousLevel = level
  }

  const documentProblems: string[] = []
  if (elements.length === 0) {
    documentProblems.push("No headings were found in this markup.")
  } else {
    if (counts[0] === 0) {
      documentProblems.push(
        "There is no h1, so the page has no top-level title in its outline.",
      )
    }
    if (counts[0] > 1) {
      documentProblems.push(
        `There are ${counts[0]} h1 elements. Assistive technology and search engines both treat the h1 as the page title, so use exactly one.`,
      )
    }
    if (headings.length > 0 && headings[0].level !== 1) {
      documentProblems.push(
        `The first heading is an h${headings[0].level}. An outline should start at h1.`,
      )
    }
  }

  return { headings, documentProblems, counts }
}

function toText(outline: Outline): string {
  const lines = outline.headings.map(
    (heading) =>
      `${"  ".repeat(heading.level - 1)}h${heading.level}: ${heading.text || "(empty)"}`,
  )
  if (outline.documentProblems.length > 0) {
    lines.push(
      "",
      "Issues:",
      ...outline.documentProblems.map((problem) => `- ${problem}`),
    )
  }
  for (const heading of outline.headings) {
    for (const problem of heading.problems) {
      lines.push(`- h${heading.level} "${heading.text || "(empty)"}": ${problem}`)
    }
  }
  return `${lines.join("\n")}\n`
}

export default function HeadingStructureChecker() {
  const [input, setInput] = useState("")
  const outline = useMemo(() => (input.trim() ? analyse(input) : null), [input])

  const totalProblems = outline
    ? outline.documentProblems.length +
      outline.headings.reduce((total, heading) => total + heading.problems.length, 0)
    : 0

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="heading-checker-input">Page HTML</Label>
        <Textarea
          id="heading-checker-input"
          name="html"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste the page source, or the outer HTML copied from the elements panel."
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setInput(EXAMPLE)}>
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
        {outline && outline.headings.length > 0 && (
          <CopyButton value={toText(outline)} label="Copy outline" />
        )}
      </div>

      {outline && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {outline.counts.map((count, index) => (
              <div
                key={index}
                className="border-border/60 rounded-lg border p-3 text-center"
              >
                <p className="text-xl font-semibold tabular-nums">{count}</p>
                <p className="text-muted-foreground mt-1 text-xs">h{index + 1}</p>
              </div>
            ))}
          </div>

          {totalProblems === 0 ? (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                The outline starts at h1, skips no levels, and every heading has text.
              </span>
            </div>
          ) : (
            outline.documentProblems.length > 0 && (
              <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <CircleAlert className="size-4 shrink-0" aria-hidden />
                  Document-level issues
                </p>
                <ul className="mt-2 space-y-1.5">
                  {outline.documentProblems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              </div>
            )
          )}

          {outline.headings.length > 0 && (
            <ol className="border-border/60 divide-border/60 divide-y rounded-xl border">
              {outline.headings.map((heading, index) => (
                <li key={`${index}-${heading.level}`} className="p-3">
                  <div
                    className="flex items-baseline gap-2"
                    style={{ paddingInlineStart: `${(heading.level - 1) * 1.25}rem` }}
                  >
                    <span className="text-muted-foreground shrink-0 font-mono text-xs">
                      h{heading.level}
                    </span>
                    <span className="min-w-0 text-sm break-words">
                      {heading.text || (
                        <span className="text-muted-foreground italic">
                          empty heading
                        </span>
                      )}
                    </span>
                  </div>
                  {heading.problems.length > 0 && (
                    <ul
                      className="text-destructive mt-2 space-y-1 text-sm"
                      style={{ paddingInlineStart: `${(heading.level - 1) * 1.25}rem` }}
                    >
                      {heading.problems.map((problem) => (
                        <li key={problem}>{problem}</li>
                      ))}
                    </ul>
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
