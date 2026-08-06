import { useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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

const MODES = [
  { value: "unwrap", label: "Join wrapped lines, keep paragraphs" },
  { value: "flatten", label: "Remove every line break" },
  { value: "collapse", label: "Collapse runs of blank lines" },
] as const

type Mode = (typeof MODES)[number]["value"]

interface Options {
  mode: Mode
  rejoinHyphens: boolean
  collapseSpaces: boolean
  trimLines: boolean
}

function normalizeEndings(text: string): string {
  return text.replace(/\r\n?/g, "\n")
}

function joinParagraph(lines: string[], rejoinHyphens: boolean): string {
  return lines.reduce((joined, line, index) => {
    if (index === 0) return line
    if (rejoinHyphens && /-$/.test(joined) && /^[a-z]/.test(line)) {
      return `${joined.slice(0, -1)}${line}`
    }
    return `${joined} ${line}`
  }, "")
}

function transform(text: string, options: Options): string {
  if (!text) return ""

  let lines = normalizeEndings(text).split("\n")
  if (options.trimLines) lines = lines.map((line) => line.trim())

  let result: string
  if (options.mode === "flatten") {
    result = joinParagraph(
      lines.filter((line) => line.trim()),
      options.rejoinHyphens,
    )
  } else if (options.mode === "collapse") {
    result = lines.join("\n").replace(/\n{3,}/g, "\n\n")
  } else {
    const paragraphs: string[][] = [[]]
    for (const line of lines) {
      if (line.trim()) {
        paragraphs[paragraphs.length - 1].push(line)
      } else if (paragraphs[paragraphs.length - 1].length) {
        paragraphs.push([])
      }
    }
    result = paragraphs
      .filter((paragraph) => paragraph.length)
      .map((paragraph) => joinParagraph(paragraph, options.rejoinHyphens))
      .join("\n\n")
  }

  return options.collapseSpaces ? result.replace(/[^\S\n]{2,}/g, " ") : result
}

function countLines(text: string): number {
  return text ? normalizeEndings(text).split("\n").length : 0
}

export default function LineBreakRemover() {
  const [text, setText] = useState("")
  const [mode, setMode] = useState<Mode>("unwrap")
  const [rejoinHyphens, setRejoinHyphens] = useState(false)
  const [collapseSpaces, setCollapseSpaces] = useState(true)
  const [trimLines, setTrimLines] = useState(true)

  const output = useMemo(
    () => transform(text, { mode, rejoinHyphens, collapseSpaces, trimLines }),
    [text, mode, rejoinHyphens, collapseSpaces, trimLines],
  )

  function reset() {
    setText("")
    setMode("unwrap")
    setRejoinHyphens(false)
    setCollapseSpaces(true)
    setTrimLines(true)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="line-break-remover-input">Text</Label>
        <Textarea
          id="line-break-remover-input"
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste text that is wrapped at a fixed width..."
          className="min-h-48 resize-y font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="line-break-remover-mode">Mode</Label>
        <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
          <SelectTrigger id="line-break-remover-mode" name="mode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODES.map((entry) => (
              <SelectItem key={entry.value} value={entry.value}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            id: "line-break-remover-hyphens",
            name: "rejoinHyphens",
            label: "Rejoin hyphenated words",
            checked: rejoinHyphens,
            onChange: setRejoinHyphens,
            disabled: mode === "collapse",
          },
          {
            id: "line-break-remover-spaces",
            name: "collapseSpaces",
            label: "Collapse repeated spaces",
            checked: collapseSpaces,
            onChange: setCollapseSpaces,
            disabled: false,
          },
          {
            id: "line-break-remover-trim",
            name: "trimLines",
            label: "Trim each line",
            checked: trimLines,
            onChange: setTrimLines,
            disabled: false,
          },
        ].map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <Switch
              id={option.id}
              name={option.name}
              checked={option.checked}
              onCheckedChange={option.onChange}
              disabled={option.disabled}
            />
            <Label htmlFor={option.id}>{option.label}</Label>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {countLines(text)} {countLines(text) === 1 ? "line" : "lines"} in,{" "}
          {countLines(output)} out
        </p>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={output} label="Copy result" />
          <DownloadButton
            getBlob={() => new Blob([output], { type: "text/plain" })}
            filename="unwrapped.txt"
            disabled={!output}
          />
          <Button variant="outline" size="sm" onClick={reset} disabled={!text}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      <Textarea
        id="line-break-remover-output"
        name="result"
        value={output}
        readOnly
        className="min-h-48 resize-y font-mono text-sm"
        aria-label="Text with line breaks removed"
      />
    </div>
  )
}
