import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
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

const SPLIT_OPTIONS: { value: string; label: string; delimiter: string | null }[] = [
  { value: "newline", label: "New line", delimiter: "\n" },
  { value: "comma", label: "Comma", delimiter: "," },
  { value: "semicolon", label: "Semicolon", delimiter: ";" },
  { value: "tab", label: "Tab", delimiter: "\t" },
  { value: "space", label: "Space", delimiter: " " },
  { value: "custom", label: "Custom", delimiter: null },
]

const JOIN_OPTIONS: { value: string; label: string; delimiter: string | null }[] = [
  { value: "comma-space", label: "Comma and space", delimiter: ", " },
  { value: "comma", label: "Comma", delimiter: "," },
  { value: "newline", label: "New line", delimiter: "\n" },
  { value: "semicolon", label: "Semicolon", delimiter: ";" },
  { value: "pipe", label: "Pipe", delimiter: "|" },
  { value: "tab", label: "Tab", delimiter: "\t" },
  { value: "space", label: "Space", delimiter: " " },
  { value: "custom", label: "Custom", delimiter: null },
]

const WRAP_OPTIONS: { value: string; label: string; open: string; close: string }[] = [
  { value: "none", label: "No quotes", open: "", close: "" },
  { value: "single", label: "Single quotes", open: "'", close: "'" },
  { value: "double", label: "Double quotes", open: '"', close: '"' },
  { value: "backtick", label: "Backticks", open: "`", close: "`" },
  { value: "square", label: "Square brackets", open: "[", close: "]" },
]

const SURROUND_OPTIONS: { value: string; label: string; open: string; close: string }[] =
  [
    { value: "none", label: "Nothing", open: "", close: "" },
    { value: "square", label: "Square brackets", open: "[", close: "]" },
    { value: "parens", label: "Parentheses", open: "(", close: ")" },
    { value: "braces", label: "Curly braces", open: "{", close: "}" },
  ]

interface Settings {
  splitBy: string
  customSplit: string
  joinWith: string
  customJoin: string
  wrap: string
  surround: string
  trim: boolean
  removeEmpty: boolean
  deduplicate: boolean
  sort: boolean
}

const DEFAULTS: Settings = {
  splitBy: "newline",
  customSplit: "",
  joinWith: "comma-space",
  customJoin: "",
  wrap: "none",
  surround: "none",
  trim: true,
  removeEmpty: true,
  deduplicate: false,
  sort: false,
}

const PRESETS: { label: string; settings: Partial<Settings> }[] = [
  {
    label: "SQL IN list",
    settings: { joinWith: "comma-space", wrap: "single", surround: "parens" },
  },
  {
    label: "JSON array",
    settings: { joinWith: "comma-space", wrap: "double", surround: "square" },
  },
  { label: "CSV row", settings: { joinWith: "comma", wrap: "none", surround: "none" } },
  {
    label: "One per line",
    settings: { joinWith: "newline", wrap: "none", surround: "none" },
  },
]

function resolveSplit(settings: Settings): string {
  const option = SPLIT_OPTIONS.find((entry) => entry.value === settings.splitBy)
  return option?.delimiter ?? settings.customSplit
}

function resolveJoin(settings: Settings): string {
  const option = JOIN_OPTIONS.find((entry) => entry.value === settings.joinWith)
  return option?.delimiter ?? settings.customJoin
}

function convert(input: string, settings: Settings): { items: string[]; output: string } {
  const splitDelimiter = resolveSplit(settings)
  let items = splitDelimiter ? input.split(splitDelimiter) : [input]

  if (settings.trim) items = items.map((item) => item.trim())
  if (settings.removeEmpty) items = items.filter((item) => item !== "")
  if (settings.deduplicate) items = Array.from(new Set(items))
  if (settings.sort) items = [...items].sort((a, b) => a.localeCompare(b))

  const wrap =
    WRAP_OPTIONS.find((entry) => entry.value === settings.wrap) ?? WRAP_OPTIONS[0]
  const surround =
    SURROUND_OPTIONS.find((entry) => entry.value === settings.surround) ??
    SURROUND_OPTIONS[0]

  const joined = items
    .map((item) => `${wrap.open}${item}${wrap.close}`)
    .join(resolveJoin(settings))

  return {
    items,
    output: items.length ? `${surround.open}${joined}${surround.close}` : "",
  }
}

export default function ListDelimiterConverter() {
  const [input, setInput] = useState("")
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  const { items, output } = useMemo(() => convert(input, settings), [input, settings])

  const splitDelimiter = resolveSplit(settings)
  const splitError =
    settings.splitBy === "custom" && !settings.customSplit
      ? "Enter the delimiter to split on, for example a pipe character."
      : null

  function update(patch: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...patch }))
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="delimiter-input">Input list</Label>
        <Textarea
          id="delimiter-input"
          name="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={"alpha\nbravo\ncharlie"}
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => update(preset.settings)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="delimiter-split">Split input on</Label>
          <Select
            value={settings.splitBy}
            onValueChange={(next) => next && update({ splitBy: next as string })}
          >
            <SelectTrigger id="delimiter-split" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPLIT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {settings.splitBy === "custom" && (
            <Input
              id="delimiter-split-custom"
              name="customSplit"
              value={settings.customSplit}
              onChange={(event) => update({ customSplit: event.target.value })}
              placeholder="Custom split delimiter"
              aria-label="Custom split delimiter"
              aria-invalid={splitError ? true : undefined}
              className="mt-2"
            />
          )}
        </div>

        <div>
          <Label htmlFor="delimiter-join">Join output with</Label>
          <Select
            value={settings.joinWith}
            onValueChange={(next) => next && update({ joinWith: next as string })}
          >
            <SelectTrigger id="delimiter-join" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOIN_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {settings.joinWith === "custom" && (
            <Input
              id="delimiter-join-custom"
              name="customJoin"
              value={settings.customJoin}
              onChange={(event) => update({ customJoin: event.target.value })}
              placeholder="Custom join delimiter"
              aria-label="Custom join delimiter"
              className="mt-2"
            />
          )}
        </div>

        <div>
          <Label htmlFor="delimiter-wrap">Wrap each item in</Label>
          <Select
            value={settings.wrap}
            onValueChange={(next) => next && update({ wrap: next as string })}
          >
            <SelectTrigger id="delimiter-wrap" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WRAP_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="delimiter-surround">Surround the result with</Label>
          <Select
            value={settings.surround}
            onValueChange={(next) => next && update({ surround: next as string })}
          >
            <SelectTrigger id="delimiter-surround" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SURROUND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {[
          { id: "trim", label: "Trim each item", key: "trim" as const },
          { id: "empty", label: "Remove empty items", key: "removeEmpty" as const },
          { id: "dedupe", label: "Remove duplicates", key: "deduplicate" as const },
          { id: "sort", label: "Sort alphabetically", key: "sort" as const },
        ].map((toggle) => (
          <div key={toggle.id} className="flex items-center gap-2">
            <Switch
              id={`delimiter-${toggle.id}`}
              name={toggle.key}
              checked={settings[toggle.key]}
              onCheckedChange={(checked) => update({ [toggle.key]: checked })}
            />
            <Label htmlFor={`delimiter-${toggle.id}`} className="font-normal">
              {toggle.label}
            </Label>
          </div>
        ))}
      </div>

      {splitError && <p className="text-destructive text-sm">{splitError}</p>}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="delimiter-output">
            Output
            <span className="text-muted-foreground ml-2 text-xs font-normal tabular-nums">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={output} label="Copy output" />
            <DownloadButton
              getBlob={() => new Blob([output], { type: "text/plain" })}
              filename="list.txt"
              disabled={!output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setSettings(DEFAULTS)
              }}
              disabled={!input && settings === DEFAULTS}
            >
              <Trash2 className="size-4" />
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="delimiter-output"
          name="output"
          value={output}
          readOnly
          className="min-h-40 resize-y font-mono text-sm"
          placeholder={splitDelimiter ? "Converted list appears here" : ""}
        />
      </div>
    </div>
  )
}
