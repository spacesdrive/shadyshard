import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

type OpType = "equal" | "remove" | "add"

interface Op {
  type: OpType
  text: string
  leftNumber?: number
  rightNumber?: number
}

interface CompareOptions {
  ignoreCase: boolean
  ignoreWhitespace: boolean
  ignoreBlankLines: boolean
}

// A full longest common subsequence table is quadratic in memory, so very
// large inputs are rejected with a message rather than freezing the tab.
const MAX_CELLS = 4_000_000

function normalize(line: string, options: CompareOptions): string {
  let key = line
  if (options.ignoreWhitespace) key = key.trim().replace(/\s+/g, " ")
  if (options.ignoreCase) key = key.toLowerCase()
  return key
}

function lcsMatrix(left: string[], right: string[]): Uint32Array {
  const width = right.length + 1
  const table = new Uint32Array((left.length + 1) * width)
  for (let i = left.length - 1; i >= 0; i--) {
    for (let j = right.length - 1; j >= 0; j--) {
      table[i * width + j] =
        left[i] === right[j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1])
    }
  }
  return table
}

function diffTokens<T>(
  left: T[],
  right: T[],
  keyOf: (value: T) => string,
): { type: OpType; value: T }[] {
  const leftKeys = left.map(keyOf)
  const rightKeys = right.map(keyOf)

  let prefix = 0
  while (
    prefix < left.length &&
    prefix < right.length &&
    leftKeys[prefix] === rightKeys[prefix]
  ) {
    prefix++
  }

  let suffix = 0
  while (
    suffix < left.length - prefix &&
    suffix < right.length - prefix &&
    leftKeys[left.length - 1 - suffix] === rightKeys[right.length - 1 - suffix]
  ) {
    suffix++
  }

  const middleLeft = left.slice(prefix, left.length - suffix)
  const middleRight = right.slice(prefix, right.length - suffix)
  const middleLeftKeys = leftKeys.slice(prefix, left.length - suffix)
  const middleRightKeys = rightKeys.slice(prefix, right.length - suffix)

  const result: { type: OpType; value: T }[] = []
  for (let i = 0; i < prefix; i++) result.push({ type: "equal", value: left[i] })

  const table = lcsMatrix(middleLeftKeys, middleRightKeys)
  const width = middleRightKeys.length + 1
  let i = 0
  let j = 0
  while (i < middleLeft.length && j < middleRight.length) {
    if (middleLeftKeys[i] === middleRightKeys[j]) {
      result.push({ type: "equal", value: middleLeft[i] })
      i++
      j++
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      result.push({ type: "remove", value: middleLeft[i] })
      i++
    } else {
      result.push({ type: "add", value: middleRight[j] })
      j++
    }
  }
  while (i < middleLeft.length) result.push({ type: "remove", value: middleLeft[i++] })
  while (j < middleRight.length) result.push({ type: "add", value: middleRight[j++] })

  for (let k = left.length - suffix; k < left.length; k++) {
    result.push({ type: "equal", value: left[k] })
  }

  return result
}

interface NumberedLine {
  text: string
  number: number
}

function toLines(source: string, options: CompareOptions): NumberedLine[] {
  const lines = source.split(/\r?\n/).map((text, index) => ({ text, number: index + 1 }))
  return options.ignoreBlankLines ? lines.filter((line) => line.text.trim()) : lines
}

function buildOps(
  left: NumberedLine[],
  right: NumberedLine[],
  options: CompareOptions,
): Op[] {
  const diff = diffTokens(left, right, (line) => normalize(line.text, options))
  const ops: Op[] = []
  let leftIndex = 0
  let rightIndex = 0

  for (const { type, value } of diff) {
    if (type === "equal") {
      ops.push({
        type,
        text: value.text,
        leftNumber: left[leftIndex].number,
        rightNumber: right[rightIndex].number,
      })
      leftIndex++
      rightIndex++
    } else if (type === "remove") {
      ops.push({ type, text: value.text, leftNumber: left[leftIndex].number })
      leftIndex++
    } else {
      ops.push({ type, text: value.text, rightNumber: right[rightIndex].number })
      rightIndex++
    }
  }

  return ops
}

interface WordPart {
  text: string
  changed: boolean
}

function splitWords(line: string): string[] {
  return line.split(/(\s+)/).filter((token) => token !== "")
}

function wordParts(
  from: string,
  to: string,
  options: CompareOptions,
): { left: WordPart[]; right: WordPart[] } {
  const diff = diffTokens(splitWords(from), splitWords(to), (word) =>
    options.ignoreCase ? word.toLowerCase() : word,
  )
  const left: WordPart[] = []
  const right: WordPart[] = []
  for (const { type, value } of diff) {
    if (type === "equal") {
      left.push({ text: value, changed: false })
      right.push({ text: value, changed: false })
    } else if (type === "remove") {
      left.push({ text: value, changed: true })
    } else {
      right.push({ text: value, changed: true })
    }
  }
  return { left, right }
}

interface RowSide {
  number: number
  parts: WordPart[]
  changed: boolean
}

interface Row {
  left: RowSide | null
  right: RowSide | null
}

// Word level highlighting is only meaningful when a removed line is shown
// against the added line it was actually edited into, so pair by word
// overlap rather than by position: a removed line sitting next to an
// unrelated insertion would otherwise light up every word as changed.
function similarity(left: string, right: string): number {
  const leftWords = splitWords(left).filter((word) => word.trim())
  const rightWords = splitWords(right).filter((word) => word.trim())
  if (leftWords.length === 0 && rightWords.length === 0) return 1
  if (leftWords.length === 0 || rightWords.length === 0) return 0

  const remaining = new Map<string, number>()
  for (const word of leftWords) remaining.set(word, (remaining.get(word) ?? 0) + 1)

  let common = 0
  for (const word of rightWords) {
    const count = remaining.get(word) ?? 0
    if (count > 0) {
      common++
      remaining.set(word, count - 1)
    }
  }
  return (2 * common) / (leftWords.length + rightWords.length)
}

const PAIR_THRESHOLD = 0.3
const MAX_PAIR_COMPARISONS = 10_000

function pairChangedLines(removed: Op[], added: Op[]): Map<number, number> {
  const pairs = new Map<number, number>()
  if (removed.length * added.length > MAX_PAIR_COMPARISONS) {
    const count = Math.min(removed.length, added.length)
    for (let index = 0; index < count; index++) pairs.set(index, index)
    return pairs
  }

  // Pairs must not cross, or the side by side view would show lines out of
  // order, so each search starts after the previously paired line.
  let firstCandidate = 0
  for (let left = 0; left < removed.length; left++) {
    let bestIndex = -1
    let bestScore = PAIR_THRESHOLD
    for (let right = firstCandidate; right < added.length; right++) {
      const score = similarity(removed[left].text, added[right].text)
      if (score > bestScore) {
        bestScore = score
        bestIndex = right
      }
    }
    if (bestIndex !== -1) {
      pairs.set(left, bestIndex)
      firstCandidate = bestIndex + 1
    }
  }
  return pairs
}

function buildRows(ops: Op[], options: CompareOptions): Row[] {
  const rows: Row[] = []
  let index = 0

  while (index < ops.length) {
    const op = ops[index]

    if (op.type === "equal") {
      const parts = [{ text: op.text, changed: false }]
      rows.push({
        left: { number: op.leftNumber ?? 0, parts, changed: false },
        right: { number: op.rightNumber ?? 0, parts, changed: false },
      })
      index++
      continue
    }

    const removed: Op[] = []
    const added: Op[] = []
    while (index < ops.length && ops[index].type === "remove") removed.push(ops[index++])
    while (index < ops.length && ops[index].type === "add") added.push(ops[index++])

    const pairs = pairChangedLines(removed, added)

    const addOnlyRow = (op: Op): Row => ({
      left: null,
      right: {
        number: op.rightNumber ?? 0,
        parts: [{ text: op.text, changed: true }],
        changed: true,
      },
    })

    let nextAdded = 0
    for (let left = 0; left < removed.length; left++) {
      const partner = pairs.get(left)
      if (partner === undefined) {
        rows.push({
          left: {
            number: removed[left].leftNumber ?? 0,
            parts: [{ text: removed[left].text, changed: true }],
            changed: true,
          },
          right: null,
        })
        continue
      }

      while (nextAdded < partner) rows.push(addOnlyRow(added[nextAdded++]))

      const parts = wordParts(removed[left].text, added[partner].text, options)
      rows.push({
        left: {
          number: removed[left].leftNumber ?? 0,
          parts: parts.left,
          changed: true,
        },
        right: {
          number: added[partner].rightNumber ?? 0,
          parts: parts.right,
          changed: true,
        },
      })
      nextAdded = partner + 1
    }
    while (nextAdded < added.length) rows.push(addOnlyRow(added[nextAdded++]))
  }

  return rows
}

const CONTEXT_LINES = 3

function toUnifiedDiff(ops: Op[]): string {
  const changedIndexes = ops
    .map((op, index) => (op.type === "equal" ? -1 : index))
    .filter((index) => index !== -1)
  if (changedIndexes.length === 0) return ""

  const hunks: { start: number; end: number }[] = []
  for (const index of changedIndexes) {
    const start = Math.max(0, index - CONTEXT_LINES)
    const end = Math.min(ops.length - 1, index + CONTEXT_LINES)
    const last = hunks[hunks.length - 1]
    if (last && start <= last.end + 1) last.end = Math.max(last.end, end)
    else hunks.push({ start, end })
  }

  const output: string[] = ["--- original", "+++ revised"]
  for (const hunk of hunks) {
    const slice = ops.slice(hunk.start, hunk.end + 1)
    const leftLines = slice.filter((op) => op.type !== "add")
    const rightLines = slice.filter((op) => op.type !== "remove")
    const leftStart = leftLines[0]?.leftNumber ?? 0
    const rightStart = rightLines[0]?.rightNumber ?? 0
    output.push(
      `@@ -${leftStart},${leftLines.length} +${rightStart},${rightLines.length} @@`,
    )
    for (const op of slice) {
      const marker = op.type === "equal" ? " " : op.type === "remove" ? "-" : "+"
      output.push(`${marker}${op.text}`)
    }
  }
  return output.join("\n")
}

const ADDED_STYLE = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
const REMOVED_STYLE = "bg-destructive/10 text-destructive"
const ADDED_WORD_STYLE = "rounded bg-emerald-500/30 px-0.5"
const REMOVED_WORD_STYLE = "rounded bg-destructive/30 px-0.5"

function LineParts({ parts, wordStyle }: { parts: WordPart[]; wordStyle: string }) {
  return (
    <>
      {parts.map((part, index) =>
        part.changed ? (
          <span key={index} className={wordStyle}>
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  )
}

export default function TextDiff() {
  const [original, setOriginal] = useState("")
  const [revised, setRevised] = useState("")
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreBlankLines, setIgnoreBlankLines] = useState(false)

  const analysis = useMemo(() => {
    if (!original && !revised) return null

    const options: CompareOptions = { ignoreCase, ignoreWhitespace, ignoreBlankLines }
    const leftLines = toLines(original, options)
    const rightLines = toLines(revised, options)
    if ((leftLines.length + 1) * (rightLines.length + 1) > MAX_CELLS) {
      return {
        error: `These texts are too large to compare here (${leftLines.length} and ${rightLines.length} lines). Compare a smaller section, or use a local diff tool.`,
      } as const
    }

    const ops = buildOps(leftLines, rightLines, options)
    return {
      ops,
      rows: buildRows(ops, options),
      unified: toUnifiedDiff(ops),
      added: ops.filter((op) => op.type === "add").length,
      removed: ops.filter((op) => op.type === "remove").length,
      unchanged: ops.filter((op) => op.type === "equal").length,
    } as const
  }, [original, revised, ignoreCase, ignoreWhitespace, ignoreBlankLines])

  function handleReset() {
    setOriginal("")
    setRevised("")
    setIgnoreCase(false)
    setIgnoreWhitespace(false)
    setIgnoreBlankLines(false)
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="text-diff-original">Original</Label>
          <Textarea
            id="text-diff-original"
            name="original"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste the original version here..."
            className="mt-1.5 min-h-52 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="text-diff-revised">Revised</Label>
          <Textarea
            id="text-diff-revised"
            name="revised"
            value={revised}
            onChange={(e) => setRevised(e.target.value)}
            placeholder="Paste the revised version here..."
            className="mt-1.5 min-h-52 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="text-diff-ignore-case"
            name="ignoreCase"
            checked={ignoreCase}
            onCheckedChange={setIgnoreCase}
          />
          <Label htmlFor="text-diff-ignore-case" className="font-normal">
            Ignore case
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="text-diff-ignore-whitespace"
            name="ignoreWhitespace"
            checked={ignoreWhitespace}
            onCheckedChange={setIgnoreWhitespace}
          />
          <Label htmlFor="text-diff-ignore-whitespace" className="font-normal">
            Ignore whitespace
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="text-diff-ignore-blank"
            name="ignoreBlankLines"
            checked={ignoreBlankLines}
            onCheckedChange={setIgnoreBlankLines}
          />
          <Label htmlFor="text-diff-ignore-blank" className="font-normal">
            Ignore blank lines
          </Label>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {analysis && "error" in analysis && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{analysis.error}</span>
        </div>
      )}

      {analysis && !("error" in analysis) && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              {analysis.added} added
            </Badge>
            <Badge
              variant="outline"
              className="border-destructive/30 bg-destructive/10 text-destructive"
            >
              {analysis.removed} removed
            </Badge>
            <Badge variant="outline">{analysis.unchanged} unchanged</Badge>
            <CopyButton value={analysis.unified} label="Copy unified diff" />
            <DownloadButton
              getBlob={() =>
                analysis.unified
                  ? new Blob([`${analysis.unified}\n`], {
                      type: "text/plain;charset=utf-8",
                    })
                  : null
              }
              filename="changes.diff"
              disabled={!analysis.unified}
            />
          </div>

          {analysis.added === 0 && analysis.removed === 0 ? (
            <p className="text-muted-foreground text-sm">
              No differences found with the current options.
            </p>
          ) : (
            <Tabs defaultValue="side-by-side">
              <TabsList>
                <TabsTrigger value="side-by-side">Side by side</TabsTrigger>
                <TabsTrigger value="unified">Unified</TabsTrigger>
              </TabsList>

              <TabsContent value="side-by-side">
                <div className="border-border/60 overflow-x-auto rounded-lg border">
                  <table className="w-full border-collapse font-mono text-xs">
                    <caption className="sr-only">
                      Original text on the left, revised text on the right, aligned line
                      by line
                    </caption>
                    <thead>
                      <tr className="border-border/60 border-b text-left">
                        <th scope="col" colSpan={2} className="p-2 font-medium">
                          Original
                        </th>
                        <th scope="col" colSpan={2} className="p-2 font-medium">
                          Revised
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.rows.map((row, index) => (
                        <tr key={index} className="align-top">
                          <td className="text-muted-foreground w-10 px-2 py-0.5 text-right select-none">
                            {row.left?.number ?? ""}
                          </td>
                          <td
                            className={`w-1/2 px-2 py-0.5 break-words whitespace-pre-wrap ${row.left?.changed ? REMOVED_STYLE : ""}`}
                          >
                            {row.left && (
                              <LineParts
                                parts={row.left.parts}
                                wordStyle={REMOVED_WORD_STYLE}
                              />
                            )}
                          </td>
                          <td className="text-muted-foreground w-10 px-2 py-0.5 text-right select-none">
                            {row.right?.number ?? ""}
                          </td>
                          <td
                            className={`w-1/2 px-2 py-0.5 break-words whitespace-pre-wrap ${row.right?.changed ? ADDED_STYLE : ""}`}
                          >
                            {row.right && (
                              <LineParts
                                parts={row.right.parts}
                                wordStyle={ADDED_WORD_STYLE}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="unified">
                <pre className="border-border/60 max-h-[32rem] overflow-auto rounded-lg border p-3 font-mono text-xs">
                  {analysis.ops.map((op, index) => (
                    <span
                      key={index}
                      className={`block ${op.type === "add" ? ADDED_STYLE : op.type === "remove" ? REMOVED_STYLE : ""}`}
                    >
                      {op.type === "equal" ? " " : op.type === "remove" ? "-" : "+"}
                      {op.text}
                    </span>
                  ))}
                </pre>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  )
}
