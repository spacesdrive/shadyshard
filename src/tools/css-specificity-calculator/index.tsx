import { useMemo, useState } from "react"
import { Trash2, Trophy } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Score = [number, number, number]

interface Part {
  text: string
  kind: "id" | "class" | "element" | "ignored"
}

interface Analysis {
  selector: string
  score: Score
  parts: Part[]
  hasImportant: boolean
  isInline: boolean
}

/** Pseudo-classes whose score comes from their most specific argument. */
const ARGUMENT_SCORED = new Set(["is", "not", "has", "matches", "-webkit-any"])
/** Pseudo-elements written with the legacy single-colon syntax. */
const LEGACY_PSEUDO_ELEMENTS = new Set(["before", "after", "first-line", "first-letter"])

function addScores(base: Score, extra: Score): Score {
  return [base[0] + extra[0], base[1] + extra[1], base[2] + extra[2]]
}

function compareScores(a: Score, b: Score): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

/** Splits a functional pseudo-class argument list on top-level commas. */
function splitArguments(value: string): string[] {
  const results: string[] = []
  let depth = 0
  let current = ""
  for (const character of value) {
    if (character === "(") depth++
    if (character === ")") depth--
    if (character === "," && depth === 0) {
      results.push(current)
      current = ""
      continue
    }
    current += character
  }
  if (current.trim()) results.push(current)
  return results
}

function scoreSelector(selector: string, parts: Part[]): Score {
  let score: Score = [0, 0, 0]
  let index = 0

  while (index < selector.length) {
    const rest = selector.slice(index)

    const whitespaceOrCombinator = rest.match(/^(\s*[>+~]\s*|\s+|\*)/)
    if (whitespaceOrCombinator) {
      index += whitespaceOrCombinator[0].length
      continue
    }

    const id = rest.match(/^#[-\w -￿]+/)
    if (id) {
      parts.push({ text: id[0], kind: "id" })
      score = addScores(score, [1, 0, 0])
      index += id[0].length
      continue
    }

    const className = rest.match(/^\.[-\w -￿]+/)
    if (className) {
      parts.push({ text: className[0], kind: "class" })
      score = addScores(score, [0, 1, 0])
      index += className[0].length
      continue
    }

    const attribute = rest.match(/^\[[^\]]*\]/)
    if (attribute) {
      parts.push({ text: attribute[0], kind: "class" })
      score = addScores(score, [0, 1, 0])
      index += attribute[0].length
      continue
    }

    const pseudoElement = rest.match(/^::[-\w]+(\([^)]*\))?/)
    if (pseudoElement) {
      parts.push({ text: pseudoElement[0], kind: "element" })
      score = addScores(score, [0, 0, 1])
      index += pseudoElement[0].length
      continue
    }

    const functional = rest.match(/^:(-?[-\w]+)\(/)
    if (functional) {
      const open = index + functional[0].length - 1
      let depth = 0
      let close = open
      for (; close < selector.length; close++) {
        if (selector[close] === "(") depth++
        if (selector[close] === ")") {
          depth--
          if (depth === 0) break
        }
      }
      const name = functional[1].toLowerCase()
      const inner = selector.slice(open + 1, close)
      const text = selector.slice(index, close + 1)

      if (name === "where") {
        parts.push({ text, kind: "ignored" })
      } else if (ARGUMENT_SCORED.has(name)) {
        const scored = splitArguments(inner)
          .map((argument) => scoreSelector(argument.trim(), []))
          .sort(compareScores)
        const best: Score = scored[scored.length - 1] ?? [0, 0, 0]
        parts.push({
          text,
          kind: best[0] > 0 ? "id" : best[1] > 0 ? "class" : "element",
        })
        score = addScores(score, best)
      } else if (name === "nth-child" || name === "nth-last-child") {
        // The of S form of nth-child adds the specificity of S on top of the
        // pseudo-class itself.
        const ofClause = inner.split(/\bof\b/i)[1]
        const extra: Score = ofClause ? scoreSelector(ofClause.trim(), []) : [0, 0, 0]
        parts.push({ text, kind: "class" })
        score = addScores(addScores(score, [0, 1, 0]), extra)
      } else {
        parts.push({ text, kind: "class" })
        score = addScores(score, [0, 1, 0])
      }

      index = close + 1
      continue
    }

    const pseudoClass = rest.match(/^:(-?[-\w]+)/)
    if (pseudoClass) {
      const isLegacyPseudoElement = LEGACY_PSEUDO_ELEMENTS.has(
        pseudoClass[1].toLowerCase(),
      )
      parts.push({
        text: pseudoClass[0],
        kind: isLegacyPseudoElement ? "element" : "class",
      })
      score = addScores(score, isLegacyPseudoElement ? [0, 0, 1] : [0, 1, 0])
      index += pseudoClass[0].length
      continue
    }

    const element = rest.match(/^[-\w -￿]+(\|[-\w -￿]+)?/)
    if (element) {
      parts.push({ text: element[0], kind: "element" })
      score = addScores(score, [0, 0, 1])
      index += element[0].length
      continue
    }

    index++
  }

  return score
}

function analyse(line: string): Analysis {
  const hasImportant = /!\s*important/i.test(line)
  const selector = line
    .replace(/!\s*important/gi, "")
    .replace(/\{[\s\S]*$/, "")
    .trim()
  const isInline = /^(style\s*=|inline)$/i.test(selector)
  const parts: Part[] = []
  const score = isInline ? ([0, 0, 0] as Score) : scoreSelector(selector, parts)
  return { selector, score, parts, hasImportant, isInline }
}

const PART_STYLES: Record<Part["kind"], string> = {
  id: "bg-primary/15 text-primary",
  class: "bg-muted text-foreground",
  element: "bg-muted/60 text-muted-foreground",
  ignored: "bg-muted/40 text-muted-foreground line-through",
}

export default function CssSpecificityCalculator() {
  const [input, setInput] = useState("")

  const analyses = useMemo(
    () =>
      input
        .split(/\r?\n/)
        .flatMap((line) => splitArguments(line))
        .map((line) => line.trim())
        .filter(Boolean)
        .map(analyse),
    [input],
  )

  const winningScore = analyses.reduce<Score | null>(
    (best, entry) =>
      best === null || compareScores(entry.score, best) > 0 ? entry.score : best,
    null,
  )

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="specificity-input">Selectors, one per line</Label>
        <Textarea
          id="specificity-input"
          name="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            "#sidebar .card a:hover\n.card a\nnav ul li a\n:where(.theme) .card a"
          }
          className="mt-1.5 min-h-36 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <Trash2 className="size-4" />
          Reset
        </Button>
      </div>

      {analyses.length > 0 && (
        <div className="space-y-3">
          {analyses.map((entry, index) => {
            const isWinner =
              analyses.length > 1 &&
              winningScore !== null &&
              compareScores(entry.score, winningScore) === 0
            return (
              <div
                key={`${entry.selector}-${index}`}
                className="border-border/60 bg-card space-y-3 rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <code className="text-sm wrap-anywhere">{entry.selector}</code>
                  <div className="flex items-center gap-2">
                    {isWinner && (
                      <Badge variant="secondary">
                        <Trophy className="size-3" aria-hidden />
                        Most specific
                      </Badge>
                    )}
                    <span className="font-mono text-lg font-semibold tabular-nums">
                      {entry.score.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {entry.parts.map((part, partIndex) => (
                    <span
                      key={`${part.text}-${partIndex}`}
                      className={`rounded px-1.5 py-0.5 font-mono text-xs ${PART_STYLES[part.kind]}`}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>

                <p className="text-muted-foreground text-xs">
                  {entry.score[0]} {entry.score[0] === 1 ? "ID" : "IDs"}, {entry.score[1]}{" "}
                  {entry.score[1] === 1
                    ? "class, attribute, or pseudo-class"
                    : "classes, attributes, or pseudo-classes"}
                  , {entry.score[2]}{" "}
                  {entry.score[2] === 1
                    ? "element or pseudo-element"
                    : "elements or pseudo-elements"}
                </p>

                {entry.hasImportant && (
                  <p className="text-sm">
                    Marked important, so it outranks every normal declaration in the same
                    origin regardless of the score above.
                  </p>
                )}
              </div>
            )
          })}

          <p className="text-muted-foreground text-sm">
            An inline style attribute is not scored here because it always beats a
            selector in a stylesheet. When two selectors score the same, the one that
            appears later in the stylesheet wins.
          </p>
        </div>
      )}
    </div>
  )
}
