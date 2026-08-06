import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

type Direction = "toSpaces" | "toTabs"

const TAB_WIDTHS = [1, 2, 3, 4, 6, 8] as const

/**
 * Expands tabs to the next tab stop rather than to a fixed count, which is how
 * every editor and terminal actually renders them.
 */
function expandTabs(segment: string, tabWidth: number): string {
  let column = 0
  let expanded = ""
  for (const character of segment) {
    if (character === "\t") {
      const advance = tabWidth - (column % tabWidth)
      expanded += " ".repeat(advance)
      column += advance
    } else {
      expanded += character
      column += 1
    }
  }
  return expanded
}

function collapseToTabs(segment: string, tabWidth: number): string {
  const spaces = expandTabs(segment, tabWidth)
  const tabs = Math.floor(spaces.length / tabWidth)
  return "\t".repeat(tabs) + " ".repeat(spaces.length % tabWidth)
}

interface Options {
  direction: Direction
  tabWidth: number
  wholeLine: boolean
  trimTrailing: boolean
}

function convertLine(line: string, options: Options): string {
  // Expanding every tab on the line is only ever safe in the tabs-to-spaces
  // direction; collapsing spaces mid-line would eat alignment inside strings.
  const expandEverything = options.wholeLine && options.direction === "toSpaces"

  let converted: string
  if (expandEverything) {
    converted = expandTabs(line, options.tabWidth)
  } else {
    const rewrite = options.direction === "toSpaces" ? expandTabs : collapseToTabs
    const indent = /^[ \t]*/.exec(line)?.[0] ?? ""
    converted = rewrite(indent, options.tabWidth) + line.slice(indent.length)
  }

  return options.trimTrailing ? converted.replace(/[ \t]+$/, "") : converted
}

function convert(text: string, options: Options): string {
  if (!text) return ""
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => convertLine(line, options))
    .join("\n")
}

function hasMixedIndentation(text: string): boolean {
  return text
    .split(/\r\n?|\n/)
    .some((line) => /^(?=[ \t]*\t)(?=[ \t]* )[ \t]+\S/.test(line))
}

export default function IndentationConverter() {
  const [text, setText] = useState("")
  const [direction, setDirection] = useState<Direction>("toSpaces")
  const [tabWidth, setTabWidth] = useState(4)
  const [wholeLine, setWholeLine] = useState(false)
  const [trimTrailing, setTrimTrailing] = useState(true)

  const output = useMemo(
    () => convert(text, { direction, tabWidth, wholeLine, trimTrailing }),
    [text, direction, tabWidth, wholeLine, trimTrailing],
  )

  const mixed = useMemo(() => hasMixedIndentation(text), [text])

  function reset() {
    setText("")
    setDirection("toSpaces")
    setTabWidth(4)
    setWholeLine(false)
    setTrimTrailing(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <Tabs
          value={direction}
          onValueChange={(value) => setDirection(value as Direction)}
        >
          <TabsList>
            <TabsTrigger value="toSpaces">Tabs to spaces</TabsTrigger>
            <TabsTrigger value="toTabs">Spaces to tabs</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="indentation-converter-width">Tab width</Label>
          <Select
            value={String(tabWidth)}
            onValueChange={(value) => setTabWidth(Number(value))}
          >
            <SelectTrigger
              id="indentation-converter-width"
              name="tabWidth"
              className="w-32"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAB_WIDTHS.map((width) => (
                <SelectItem key={width} value={String(width)}>
                  {width} {width === 1 ? "space" : "spaces"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Switch
            id="indentation-converter-whole"
            name="wholeLine"
            checked={wholeLine}
            onCheckedChange={setWholeLine}
            disabled={direction === "toTabs"}
          />
          <Label htmlFor="indentation-converter-whole">
            Expand every tab on the line
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="indentation-converter-trim"
            name="trimTrailing"
            checked={trimTrailing}
            onCheckedChange={setTrimTrailing}
          />
          <Label htmlFor="indentation-converter-trim">Strip trailing whitespace</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="indentation-converter-input">Input</Label>
        <Textarea
          id="indentation-converter-input"
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={"function example() {\n\treturn true\n}"}
          className="min-h-48 resize-y font-mono text-sm"
        />
      </div>

      {mixed && (
        <p className="text-muted-foreground flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          At least one line mixes tabs and spaces in its indentation. Converting will
          normalise it, which may change how the line lines up in an editor set to a
          different tab width.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <CopyButton value={output} label="Copy result" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: "text/plain" })}
          filename="reindented.txt"
          disabled={!output}
        />
        <Button variant="outline" size="sm" onClick={reset} disabled={!text}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="indentation-converter-output">Output</Label>
        <Textarea
          id="indentation-converter-output"
          name="result"
          value={output}
          readOnly
          className="min-h-48 resize-y font-mono text-sm"
        />
      </div>
    </div>
  )
}
