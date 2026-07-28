import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const SAMPLE = `# Project title

Some introduction.

## Getting started

### Requirements

### Installation

## Usage

\`\`\`bash
# This heading is inside a code fence and is ignored
\`\`\`

## Usage

## License
`

interface Heading {
  level: number
  text: string
  anchor: string
}

/** Mirrors GitHub's heading slug rule, including its duplicate suffixes. */
function slugify(text: string, seen: Map<string, number>): string {
  const base = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
  const count = seen.get(base) ?? 0
  seen.set(base, count + 1)
  return count === 0 ? base : `${base}-${count}`
}

function parseHeadings(markdown: string): Heading[] {
  const seen = new Map<string, number>()
  const headings: Heading[] = []
  let inFence = false

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/)
    if (!match) continue

    const text = match[2]
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[`*_]/g, "")
      .trim()
    if (!text) continue

    headings.push({ level: match[1].length, text, anchor: slugify(text, seen) })
  }

  return headings
}

function buildToc(
  headings: Heading[],
  minLevel: number,
  maxLevel: number,
  ordered: boolean,
): string {
  const included = headings.filter(
    (heading) => heading.level >= minLevel && heading.level <= maxLevel,
  )
  if (included.length === 0) return ""

  const baseLevel = Math.min(...included.map((heading) => heading.level))
  return included
    .map((heading) => {
      const indent = "  ".repeat(heading.level - baseLevel)
      const marker = ordered ? "1." : "-"
      return `${indent}${marker} [${heading.text}](#${heading.anchor})`
    })
    .join("\n")
}

const LEVELS = [1, 2, 3, 4, 5, 6]

export default function MarkdownTocGenerator() {
  const [markdown, setMarkdown] = useState(SAMPLE)
  const [minLevel, setMinLevel] = useState(2)
  const [maxLevel, setMaxLevel] = useState(3)
  const [ordered, setOrdered] = useState(false)

  const headings = useMemo(() => parseHeadings(markdown), [markdown])
  const toc = useMemo(
    () => buildToc(headings, minLevel, maxLevel, ordered),
    [headings, minLevel, maxLevel, ordered],
  )

  const rangeInvalid = minLevel > maxLevel

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="toc-markdown">Markdown</Label>
        <Textarea
          id="toc-markdown"
          name="markdown"
          value={markdown}
          onChange={(event) => setMarkdown(event.target.value)}
          rows={12}
          className="mt-1.5 font-mono text-sm"
          placeholder="Paste your Markdown document here"
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-32">
          <Label htmlFor="toc-min-level">Minimum level</Label>
          <Select
            value={String(minLevel)}
            onValueChange={(value) => value && setMinLevel(Number(value))}
          >
            <SelectTrigger id="toc-min-level" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((level) => (
                <SelectItem key={level} value={String(level)}>
                  H{level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-32">
          <Label htmlFor="toc-max-level">Maximum level</Label>
          <Select
            value={String(maxLevel)}
            onValueChange={(value) => value && setMaxLevel(Number(value))}
          >
            <SelectTrigger id="toc-max-level" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((level) => (
                <SelectItem key={level} value={String(level)}>
                  H{level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Switch
            id="toc-ordered"
            name="ordered"
            checked={ordered}
            onCheckedChange={setOrdered}
          />
          <Label htmlFor="toc-ordered" className="font-normal">
            Numbered list
          </Label>
        </div>
      </div>

      {rangeInvalid ? (
        <p className="text-destructive text-sm">
          Minimum level must be the same as or above the maximum level.
        </p>
      ) : toc ? (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Table of contents ({toc.split("\n").length} entries)
            </span>
            <div className="flex gap-2">
              <CopyButton value={toc} label="Copy TOC" />
              <DownloadButton
                getBlob={() => new Blob([toc], { type: "text/markdown" })}
                filename="table-of-contents.md"
              />
            </div>
          </div>
          <Textarea
            id="toc-output"
            name="output"
            value={toc}
            readOnly
            rows={10}
            className="mt-2 font-mono text-sm"
            aria-label="Generated table of contents"
          />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          {headings.length === 0
            ? "No Markdown headings found. Headings must start at the beginning of a line with one to six hash characters."
            : `Found ${headings.length} heading${headings.length === 1 ? "" : "s"}, but none between H${minLevel} and H${maxLevel}.`}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setMarkdown("")
          setMinLevel(2)
          setMaxLevel(3)
          setOrdered(false)
        }}
      >
        Reset
      </Button>
    </div>
  )
}
