import { useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const BLANK_MODES = [
  { value: "skip", label: "Leave blank lines untouched" },
  { value: "remove", label: "Remove blank lines" },
  { value: "include", label: "Treat blank lines like any other" },
] as const

type BlankMode = (typeof BLANK_MODES)[number]["value"]

interface Options {
  prefix: string
  suffix: string
  blankMode: BlankMode
  numbered: boolean
  startAt: number
  padWidth: number
  skipLastSuffix: boolean
}

function build(text: string, options: Options): string {
  if (!text) return ""

  let lines = text.replace(/\r\n?/g, "\n").split("\n")
  if (options.blankMode === "remove") {
    lines = lines.filter((line) => line.trim())
  }

  const isTarget = (line: string) =>
    options.blankMode === "include" || line.trim().length > 0

  let lastTargetIndex = -1
  lines.forEach((line, index) => {
    if (isTarget(line)) lastTargetIndex = index
  })

  let counter = options.startAt

  return lines
    .map((line, index) => {
      if (!isTarget(line)) return line

      const number = options.numbered
        ? `${String(counter).padStart(options.padWidth, "0")}. `
        : ""
      if (options.numbered) counter += 1

      const suffix =
        options.skipLastSuffix && index === lastTargetIndex ? "" : options.suffix
      return `${number}${options.prefix}${line}${suffix}`
    })
    .join("\n")
}

export default function LinePrefixSuffixAdder() {
  const [text, setText] = useState("")
  const [prefix, setPrefix] = useState("")
  const [suffix, setSuffix] = useState("")
  const [blankMode, setBlankMode] = useState<BlankMode>("skip")
  const [numbered, setNumbered] = useState(false)
  const [startAt, setStartAt] = useState("1")
  const [padWidth, setPadWidth] = useState("1")
  const [skipLastSuffix, setSkipLastSuffix] = useState(false)

  const output = useMemo(
    () =>
      build(text, {
        prefix,
        suffix,
        blankMode,
        numbered,
        startAt: Number(startAt) || 0,
        padWidth: Math.min(Math.max(Number(padWidth) || 1, 1), 10),
        skipLastSuffix,
      }),
    [text, prefix, suffix, blankMode, numbered, startAt, padWidth, skipLastSuffix],
  )

  function reset() {
    setText("")
    setPrefix("")
    setSuffix("")
    setBlankMode("skip")
    setNumbered(false)
    setStartAt("1")
    setPadWidth("1")
    setSkipLastSuffix(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="line-prefix-input">Lines</Label>
        <Textarea
          id="line-prefix-input"
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={"alpha\nbravo\ncharlie"}
          className="min-h-40 resize-y font-mono text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="line-prefix-prefix">Prefix</Label>
          <Input
            id="line-prefix-prefix"
            name="prefix"
            value={prefix}
            onChange={(event) => setPrefix(event.target.value)}
            placeholder="- "
            className="font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="line-prefix-suffix">Suffix</Label>
          <Input
            id="line-prefix-suffix"
            name="suffix"
            value={suffix}
            onChange={(event) => setSuffix(event.target.value)}
            placeholder=","
            className="font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="line-prefix-blank-mode">Blank lines</Label>
        <Select
          value={blankMode}
          onValueChange={(value) => setBlankMode(value as BlankMode)}
        >
          <SelectTrigger id="line-prefix-blank-mode" name="blankMode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLANK_MODES.map((entry) => (
              <SelectItem key={entry.value} value={entry.value}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Switch
            id="line-prefix-numbered"
            name="numbered"
            checked={numbered}
            onCheckedChange={setNumbered}
          />
          <Label htmlFor="line-prefix-numbered">Add line numbers</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="line-prefix-skip-last"
            name="skipLastSuffix"
            checked={skipLastSuffix}
            onCheckedChange={setSkipLastSuffix}
          />
          <Label htmlFor="line-prefix-skip-last">Omit suffix on the last line</Label>
        </div>
      </div>

      {numbered && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="line-prefix-start">Start numbering at</Label>
            <Input
              id="line-prefix-start"
              name="startAt"
              type="number"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="line-prefix-pad">Pad numbers to width</Label>
            <Input
              id="line-prefix-pad"
              name="padWidth"
              type="number"
              min={1}
              max={10}
              value={padWidth}
              onChange={(event) => setPadWidth(event.target.value)}
              className="font-mono text-sm"
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <CopyButton value={output} label="Copy result" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: "text/plain" })}
          filename="lines.txt"
          disabled={!output}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={!text && !prefix && !suffix}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="line-prefix-output">Result</Label>
        <Textarea
          id="line-prefix-output"
          name="result"
          value={output}
          readOnly
          className="min-h-40 resize-y font-mono text-sm"
        />
      </div>
    </div>
  )
}
