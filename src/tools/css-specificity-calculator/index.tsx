import { useMemo, useState } from "react"
import { Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type Triple = [number, number, number]

interface Part {
  text: string
  column: 0 | 1 | 2
}

interface Analysis {
  selector: string
  triple: Triple
  parts: Part[]
}

const COLUMN_LABELS = ["ID", "Class", "Element"] as const

/** Pseudo-classes whose specificity is that of their most specific argument. */
const MOST_SPECIFIC_ARGUMENT = new Set(["is", "not", "has", "matches", "any"])

const IDENTIFIER = /[\w-]/

function readIdentifier(input: string, start: number): [string, number] {
  let index = start
  let value = ""
  while (index < input.length) {
    const char = input[index]
    if (char === "\\" && index + 1 < input.length) {
      value += char + input[index + 1]
      index += 2
      continue
    }
    if (!IDENTIFIER.test(char)) break
    value += char
    index += 1
  }
  return [value, index]
}

/** Reads a parenthesised group starting at `start` (the opening bracket). */
function readGroup(input: string, start: number): [string, number] {
  let depth = 0
  let index = start
  let value = ""
  while (index < input.length) {
    const char = input[index]
    if (char === "(") {
      depth += 1
      if (depth === 1) {
        index += 1
        continue
      }
    } else if (char === ")") {
      depth -= 1
      if (depth === 0) return [value, index + 1]
    }
    value += char
    index += 1
  }
  return [value, index]
}

function addTriple(target: Triple, source: Triple): void {
  target[0] += source[0]
  target[1] += source[1]
  target[2] += source[2]
}

function compareTriples(a: Triple, b: Triple): number {
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index]
  }
  return 0
}

/** Splits on commas that are not inside brackets or parentheses. */
function splitTopLevel(input: string, separator: string): string[] {
  const results: string[] = []
  let depth = 0
  let current = ""
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    if (char === "(" || char === "[") depth += 1
    if (char === ")" || char === "]") depth -= 1
    if (char === separator && depth === 0) {
      results.push(current)
      current = ""
      continue
    }
    current += char
  }
  results.push(current)
  return results.filter((entry) => entry.trim() !== "")
}

function tripleOf(selector: string): Triple {
  return analyzeSelector(selector).triple
}

function mostSpecificArgument(group: string): Triple {
  const candidates = splitTopLevel(group, ",").map(tripleOf)
  if (candidates.length === 0) return [0, 0, 0]
  return candidates.reduce((best, candidate) =>
    compareTriples(candidate, best) > 0 ? candidate : best,
  )
}

function analyzeSelector(selector: string): Analysis {
  const triple: Triple = [0, 0, 0]
  const parts: Part[] = []
  let index = 0

  while (index < selector.length) {
    const char = selector[index]

    if (char === "#") {
      const [name, next] = readIdentifier(selector, index + 1)
      if (name) {
        triple[0] += 1
        parts.push({ text: `#${name}`, column: 0 })
      }
      index = name ? next : index + 1
      continue
    }

    if (char === ".") {
      const [name, next] = readIdentifier(selector, index + 1)
      if (name) {
        triple[1] += 1
        parts.push({ text: `.${name}`, column: 1 })
      }
      index = name ? next : index + 1
      continue
    }

    if (char === "[") {
      let end = selector.indexOf("]", index)
      if (end === -1) end = selector.length - 1
      triple[1] += 1
      parts.push({ text: selector.slice(index, end + 1), column: 1 })
      index = end + 1
      continue
    }

    if (char === ":") {
      const isPseudoElement = selector[index + 1] === ":"
      const nameStart = index + (isPseudoElement ? 2 : 1)
      const [name, afterName] = readIdentifier(selector, nameStart)
      let cursor = afterName
      let group: string | null = null

      if (selector[cursor] === "(") {
        const [content, afterGroup] = readGroup(selector, cursor)
        group = content
        cursor = afterGroup
      }

      const lowered = name.toLowerCase()
      const text = selector.slice(index, cursor)

      // The legacy pseudo-elements ::before and friends may be written with one
      // colon, so match by name rather than by colon count alone.
      const legacyPseudoElements = new Set([
        "before",
        "after",
        "first-line",
        "first-letter",
      ])

      if (isPseudoElement || legacyPseudoElements.has(lowered)) {
        triple[2] += 1
        parts.push({ text, column: 2 })
      } else if (lowered === "where") {
        // :where() deliberately contributes nothing to any column.
        parts.push({ text: `${text} (zero)`, column: 1 })
      } else if (MOST_SPECIFIC_ARGUMENT.has(lowered) && group !== null) {
        const inner = mostSpecificArgument(group)
        addTriple(triple, inner)
        const column: 0 | 1 | 2 =
          inner[0] > 0 ? 0 : inner[2] > 0 && inner[1] === 0 ? 2 : 1
        parts.push({ text, column })
      } else if (
        (lowered === "nth-child" || lowered === "nth-last-child") &&
        group !== null &&
        / of /i.test(group)
      ) {
        triple[1] += 1
        addTriple(triple, mostSpecificArgument(group.split(/ of /i)[1]))
        parts.push({ text, column: 1 })
      } else {
        triple[1] += 1
        parts.push({ text, column: 1 })
      }

      index = cursor > index ? cursor : index + 1
      continue
    }

    if (char === "*") {
      parts.push({ text: "* (zero)", column: 2 })
      index += 1
      continue
    }

    if (/[\s>+~,]/.test(char)) {
      index += 1
      continue
    }

    const [name, next] = readIdentifier(selector, index)
    if (name) {
      triple[2] += 1
      parts.push({ text: name, column: 2 })
      index = next
      continue
    }

    index += 1
  }

  return { selector: selector.trim(), triple, parts }
}

export default function CssSpecificityCalculator() {
  const [input, setInput] = useState("")

  const analyses = useMemo(() => {
    const selectors = input
      .split("\n")
      .flatMap((line) => splitTopLevel(line, ","))
      .map((selector) => selector.trim())
      .filter(Boolean)
    return selectors.map(analyzeSelector)
  }, [input])

  const winner = useMemo(() => {
    if (analyses.length < 2) return null
    const best = analyses.reduce((current, candidate) =>
      compareTriples(candidate.triple, current.triple) >= 0 ? candidate : current,
    )
    const ties = analyses.filter(
      (analysis) => compareTriples(analysis.triple, best.triple) === 0,
    )
    return ties.length === 1 ? best : null
  }, [analyses])

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="specificity-input">CSS selectors, one per line</Label>
        <Textarea
          id="specificity-input"
          name="selectors"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={"#sidebar .widget a\nnav ul li a.active\n:where(.theme) .button"}
          className="mt-1.5 min-h-36 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {analyses.length > 0 && (
        <ul className="space-y-3">
          {analyses.map((analysis, index) => (
            <li
              key={`${analysis.selector}-${index}`}
              className="border-border/60 rounded-lg border p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <code className="min-w-0 font-mono text-sm break-all">
                  {analysis.selector}
                </code>
                <span className="flex shrink-0 items-center gap-2">
                  {winner === analysis && (
                    <Badge className="gap-1">
                      <Trophy className="size-3" aria-hidden />
                      Wins
                    </Badge>
                  )}
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {analysis.triple.join(" - ")}
                  </span>
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                {analysis.triple.map((value, column) => (
                  <div key={column} className="bg-muted/40 rounded-md px-2 py-1.5">
                    <dt className="text-muted-foreground text-xs">
                      {COLUMN_LABELS[column]}
                    </dt>
                    <dd className="text-base font-semibold tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>

              {analysis.parts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {analysis.parts.map((part, partIndex) => (
                    <Badge
                      key={`${part.text}-${partIndex}`}
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      {part.text}
                      <span className="text-muted-foreground ml-1">
                        {part.text.includes("(zero)") ? "0" : COLUMN_LABELS[part.column]}
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
        Reset
      </Button>
    </div>
  )
}
