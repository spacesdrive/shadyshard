import { useMemo, useState } from "react"
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

const SEPARATORS: { value: string; label: string; split: (text: string) => string[] }[] =
  [
    { value: "line", label: "One item per line", split: (text) => text.split("\n") },
    { value: "comma", label: "Comma separated", split: (text) => text.split(",") },
    {
      value: "semicolon",
      label: "Semicolon separated",
      split: (text) => text.split(";"),
    },
    { value: "space", label: "Whitespace separated", split: (text) => text.split(/\s+/) },
  ]

interface Options {
  separator: string
  ignoreCase: boolean
  trim: boolean
}

function toItems(text: string, options: Options): string[] {
  const split = SEPARATORS.find((entry) => entry.value === options.separator)?.split
  const raw = split ? split(text) : text.split("\n")
  return raw
    .map((item) => (options.trim ? item.trim() : item))
    .filter((item) => item !== "")
}

/** Comparison key, kept separate from the display value so casing survives output. */
function keyOf(item: string, ignoreCase: boolean): string {
  return ignoreCase ? item.toLowerCase() : item
}

interface Comparison {
  onlyA: string[]
  onlyB: string[]
  inBoth: string[]
  union: string[]
  countA: number
  countB: number
  duplicatesA: number
  duplicatesB: number
}

function compare(textA: string, textB: string, options: Options): Comparison {
  const itemsA = toItems(textA, options)
  const itemsB = toItems(textB, options)

  const keysA = new Set(itemsA.map((item) => keyOf(item, options.ignoreCase)))
  const keysB = new Set(itemsB.map((item) => keyOf(item, options.ignoreCase)))

  const seen = new Set<string>()
  const onlyA: string[] = []
  const onlyB: string[] = []
  const inBoth: string[] = []
  const union: string[] = []

  for (const item of itemsA) {
    const key = keyOf(item, options.ignoreCase)
    if (seen.has(key)) continue
    seen.add(key)
    union.push(item)
    if (keysB.has(key)) inBoth.push(item)
    else onlyA.push(item)
  }

  for (const item of itemsB) {
    const key = keyOf(item, options.ignoreCase)
    if (seen.has(key)) continue
    seen.add(key)
    union.push(item)
    onlyB.push(item)
  }

  return {
    onlyA,
    onlyB,
    inBoth,
    union,
    countA: itemsA.length,
    countB: itemsB.length,
    duplicatesA: itemsA.length - keysA.size,
    duplicatesB: itemsB.length - keysB.size,
  }
}

interface ResultPanelProps {
  id: string
  title: string
  items: string[]
}

function ResultPanel({ id, title, items }: ResultPanelProps) {
  const value = items.join("\n")

  return (
    <div className="border-border/60 flex flex-col rounded-lg border">
      <div className="bg-muted/50 border-border/60 flex items-center justify-between gap-2 border-b px-3 py-2">
        <h2 className="text-sm font-medium">{title}</h2>
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {items.length.toLocaleString("en-US")}
        </span>
      </div>
      <Textarea
        id={id}
        name={id}
        value={value}
        readOnly
        placeholder="Nothing in this group."
        className="mt-0 min-h-40 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
        spellCheck={false}
      />
      <div className="border-border/60 flex flex-wrap gap-2 border-t p-2">
        <CopyButton value={value} label="Copy" />
        <DownloadButton
          getBlob={() => new Blob([value], { type: "text/plain" })}
          filename={`${id}.txt`}
          disabled={items.length === 0}
        />
      </div>
    </div>
  )
}

export default function ListComparer() {
  const [textA, setTextA] = useState("apple\nbanana\ncherry\ndate")
  const [textB, setTextB] = useState("banana\ncherry\nelderberry\nfig")
  const [separator, setSeparator] = useState("line")
  const [ignoreCase, setIgnoreCase] = useState(true)
  const [trim, setTrim] = useState(true)

  const result = useMemo(
    () => compare(textA, textB, { separator, ignoreCase, trim }),
    [textA, textB, separator, ignoreCase, trim],
  )

  function reset() {
    setTextA("")
    setTextB("")
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="list-a">List A</Label>
          <Textarea
            id="list-a"
            name="listA"
            value={textA}
            onChange={(event) => setTextA(event.target.value)}
            placeholder="Paste the first list."
            className="mt-1.5 min-h-44 resize-y font-mono text-sm"
            spellCheck={false}
          />
          <p className="text-muted-foreground mt-1 text-xs">
            {result.countA.toLocaleString("en-US")} items
            {result.duplicatesA > 0 &&
              `, ${result.duplicatesA} duplicated within the list`}
          </p>
        </div>
        <div>
          <Label htmlFor="list-b">List B</Label>
          <Textarea
            id="list-b"
            name="listB"
            value={textB}
            onChange={(event) => setTextB(event.target.value)}
            placeholder="Paste the second list."
            className="mt-1.5 min-h-44 resize-y font-mono text-sm"
            spellCheck={false}
          />
          <p className="text-muted-foreground mt-1 text-xs">
            {result.countB.toLocaleString("en-US")} items
            {result.duplicatesB > 0 &&
              `, ${result.duplicatesB} duplicated within the list`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="w-56">
          <Label htmlFor="list-separator">Items are separated by</Label>
          <Select
            value={separator}
            onValueChange={(value) => value && setSeparator(value as string)}
          >
            <SelectTrigger id="list-separator" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEPARATORS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Switch
            id="list-ignore-case"
            name="ignoreCase"
            checked={ignoreCase}
            onCheckedChange={setIgnoreCase}
          />
          <Label htmlFor="list-ignore-case" className="font-normal">
            Ignore case
          </Label>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Switch id="list-trim" name="trim" checked={trim} onCheckedChange={setTrim} />
          <Label htmlFor="list-trim" className="font-normal">
            Trim surrounding spaces
          </Label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ResultPanel id="only-in-a" title="Only in list A" items={result.onlyA} />
        <ResultPanel id="only-in-b" title="Only in list B" items={result.onlyB} />
        <ResultPanel id="in-both" title="In both lists" items={result.inBoth} />
        <ResultPanel
          id="combined"
          title="Combined, duplicates removed"
          items={result.union}
        />
      </div>

      <Button variant="outline" size="sm" onClick={reset} disabled={!textA && !textB}>
        Reset
      </Button>
    </div>
  )
}
