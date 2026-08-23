import { useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"

const EXAMPLE = `## Incident summary

The **queue worker** stopped draining at \`03:12 UTC\`.

- Root cause: a *stale* connection pool
  - The pool never reaped closed sockets
- Fix shipped in [PR 482](https://example.com/pr/482)

| Metric | Before | After |
| --- | --- | --- |
| Backlog | 40k | 0 |

\`\`\`bash
kubectl rollout restart deploy/worker
\`\`\`

> Follow-up ticket to add an alert on queue depth.`

/**
 * Inline conversions are done in a fixed order with each finished fragment
 * parked behind a placeholder, so a later rule cannot rewrite the output of
 * an earlier one. Without this, bold (which becomes a single asterisk in
 * Jira) would immediately be picked up again by the italic rule. The marker
 * is a private-use code point, which cannot appear in Markdown text.
 */
function convertInline(text: string): string {
  const parked: string[] = []
  const park = (value: string) => {
    parked.push(value)
    return `\ue000${parked.length - 1}\ue000`
  }

  let result = text
  result = result.replace(/`([^`]+)`/g, (_, code: string) => park(`{{${code}}}`))
  // The label class excludes an opening bracket as well as a closing one, and
  // an optional title has to begin with whitespace the URL run cannot match.
  // Both keep these linear: written as [^\]]+ and [^)\s]+[^)]*, a long run of
  // brackets or a parenthesis that never closes backtracks quadratically.
  result = result.replace(
    /!\[([^\][]*)\]\(\s*([^)\s]+)(?:\s+[^)]*)?\)/g,
    (_, alt: string, url: string) => park(alt ? `!${url}|alt=${alt}!` : `!${url}!`),
  )
  result = result.replace(
    /\[([^\][]+)\]\(\s*([^)\s]+)(?:\s+[^)]*)?\)/g,
    (_, label: string, url: string) => park(`[${label}|${url}]`),
  )
  result = result.replace(/\*\*([^*]+)\*\*/g, (_, inner: string) => park(`*${inner}*`))
  result = result.replace(/__([^_]+)__/g, (_, inner: string) => park(`*${inner}*`))
  result = result.replace(/~~([^~]+)~~/g, (_, inner: string) => park(`-${inner}-`))
  result = result.replace(/(?<![*\w])\*([^*\n]+)\*(?![*\w])/g, "_$1_")

  return result.replace(/\ue000(\d+)\ue000/g, (_, index: string) => parked[Number(index)])
}

/**
 * A separator row is made only of pipes, dashes, colons, and spaces, and has
 * at least one dash. Expressed as one character class plus a substring check
 * rather than as a pattern with two overlapping quantifiers, which backtracks
 * quadratically on a long line of dashes that turns out not to match.
 */
function isTableSeparator(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.includes("-") && /^[|\s:-]+$/.test(trimmed)
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => convertInline(cell.trim()))
}

function convert(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const output: string[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    const fence = /^\s*(?:```|~~~)\s*(\S*)\s*$/.exec(line)
    if (fence) {
      const language = fence[1]
      const body: string[] = []
      index++
      while (index < lines.length && !/^\s*(?:```|~~~)\s*$/.test(lines[index])) {
        body.push(lines[index])
        index++
      }
      index++
      const open = language ? `{code:${language}}` : "{noformat}"
      const close = language ? "{code}" : "{noformat}"
      output.push(open, ...body, close)
      continue
    }

    if (
      line.trim().startsWith("|") &&
      index + 1 < lines.length &&
      isTableSeparator(lines[index + 1])
    ) {
      output.push(`||${tableCells(line).join("||")}||`)
      index += 2
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        output.push(`|${tableCells(lines[index]).join("|")}|`)
        index++
      }
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      output.push(`h${heading[1].length}. ${convertInline(heading[2].trim())}`)
      index++
      continue
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      output.push("----")
      index++
      continue
    }

    const quote = /^\s*>\s?(.*)$/.exec(line)
    if (quote) {
      output.push(`bq. ${convertInline(quote[1])}`)
      index++
      continue
    }

    const bullet = /^(\s*)[-*+]\s+(.*)$/.exec(line)
    if (bullet) {
      const depth = Math.floor(bullet[1].replace(/\t/g, "  ").length / 2) + 1
      output.push(`${"*".repeat(depth)} ${convertInline(bullet[2])}`)
      index++
      continue
    }

    const numbered = /^(\s*)\d+[.)]\s+(.*)$/.exec(line)
    if (numbered) {
      const depth = Math.floor(numbered[1].replace(/\t/g, "  ").length / 2) + 1
      output.push(`${"#".repeat(depth)} ${convertInline(numbered[2])}`)
      index++
      continue
    }

    output.push(line.trim() === "" ? "" : convertInline(line))
    index++
  }

  return output.join("\n")
}

export default function MarkdownToJira() {
  const [input, setInput] = useState("")
  const output = useMemo(() => (input ? convert(input) : ""), [input])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="markdown-jira-input">Markdown</Label>
          <Textarea
            id="markdown-jira-input"
            name="markdown"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste the Markdown you want to put in a Jira ticket."
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="markdown-jira-output">Jira wiki markup</Label>
          <Textarea
            id="markdown-jira-output"
            name="jira"
            value={output}
            readOnly
            placeholder="The converted markup appears here."
            className="bg-muted/40 mt-1.5 min-h-72 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy Jira markup" />
        <Button variant="outline" size="sm" onClick={() => setInput(EXAMPLE)}>
          Load example
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
