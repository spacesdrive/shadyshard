import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

interface Options {
  ignoreCase: boolean
  trim: boolean
  sort: boolean
}

interface ListStats {
  values: string[]
  duplicates: string[]
}

interface Comparison {
  onlyA: string[]
  onlyB: string[]
  both: string[]
  either: string[]
  statsA: ListStats
  statsB: ListStats
}

function parse(input: string, options: Options): ListStats {
  const raw = input
    .split(/\r?\n/)
    .map((line) => (options.trim ? line.trim() : line))
    .filter((line) => line !== "")

  const seen = new Map<string, string>()
  const duplicates: string[] = []
  for (const entry of raw) {
    const key = options.ignoreCase ? entry.toLowerCase() : entry
    if (seen.has(key)) {
      if (!duplicates.includes(seen.get(key) as string)) {
        duplicates.push(seen.get(key) as string)
      }
      continue
    }
    seen.set(key, entry)
  }

  return { values: Array.from(seen.values()), duplicates }
}

function compare(listA: string, listB: string, options: Options): Comparison {
  const statsA = parse(listA, options)
  const statsB = parse(listB, options)

  const key = (value: string) => (options.ignoreCase ? value.toLowerCase() : value)
  const keysA = new Set(statsA.values.map(key))
  const keysB = new Set(statsB.values.map(key))

  const order = (values: string[]) =>
    options.sort
      ? [...values].sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
        )
      : values

  const both = statsA.values.filter((value) => keysB.has(key(value)))

  return {
    onlyA: order(statsA.values.filter((value) => !keysB.has(key(value)))),
    onlyB: order(statsB.values.filter((value) => !keysA.has(key(value)))),
    both: order(both),
    either: order([
      ...statsA.values,
      ...statsB.values.filter((value) => !keysA.has(key(value))),
    ]),
    statsA,
    statsB,
  }
}

interface ResultPanelProps {
  id: string
  title: string
  description: string
  values: string[]
}

function ResultPanel({ id, title, description, values }: ResultPanelProps) {
  const text = values.join("\n")
  return (
    <div className="border-border/60 bg-card space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Label htmlFor={id}>
            {title}
            <span className="text-muted-foreground ml-2 text-xs font-normal tabular-nums">
              {values.length}
            </span>
          </Label>
          <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
        </div>
        <div className="flex gap-2">
          <CopyButton value={text} label={`Copy ${title}`} size="icon-sm" />
          <DownloadButton
            getBlob={() => new Blob([text], { type: "text/plain" })}
            filename={`${id}.txt`}
            label="Download"
            disabled={!text}
          />
        </div>
      </div>
      <Textarea
        id={id}
        name={id}
        value={text}
        readOnly
        className="min-h-36 resize-y font-mono text-sm"
        placeholder="No matching entries"
      />
    </div>
  )
}

export default function ListComparison() {
  const [listA, setListA] = useState("")
  const [listB, setListB] = useState("")
  const [options, setOptions] = useState<Options>({
    ignoreCase: true,
    trim: true,
    sort: false,
  })

  const result = useMemo(() => compare(listA, listB, options), [listA, listB, options])

  function update(patch: Partial<Options>) {
    setOptions((current) => ({ ...current, ...patch }))
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="list-comparison-a">
            List A
            <span className="text-muted-foreground ml-2 text-xs font-normal tabular-nums">
              {result.statsA.values.length} unique
            </span>
          </Label>
          <Textarea
            id="list-comparison-a"
            name="listA"
            value={listA}
            onChange={(event) => setListA(event.target.value)}
            placeholder={"ada@example.com\ngrace@example.com"}
            className="mt-1.5 min-h-44 resize-y font-mono text-sm"
            spellCheck={false}
          />
          {result.statsA.duplicates.length > 0 && (
            <p className="text-muted-foreground mt-1.5 text-xs">
              {result.statsA.duplicates.length} duplicate{" "}
              {result.statsA.duplicates.length === 1 ? "entry" : "entries"} within list A:{" "}
              {result.statsA.duplicates.slice(0, 5).join(", ")}
              {result.statsA.duplicates.length > 5 ? ", and more" : ""}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="list-comparison-b">
            List B
            <span className="text-muted-foreground ml-2 text-xs font-normal tabular-nums">
              {result.statsB.values.length} unique
            </span>
          </Label>
          <Textarea
            id="list-comparison-b"
            name="listB"
            value={listB}
            onChange={(event) => setListB(event.target.value)}
            placeholder={"grace@example.com\nalan@example.com"}
            className="mt-1.5 min-h-44 resize-y font-mono text-sm"
            spellCheck={false}
          />
          {result.statsB.duplicates.length > 0 && (
            <p className="text-muted-foreground mt-1.5 text-xs">
              {result.statsB.duplicates.length} duplicate{" "}
              {result.statsB.duplicates.length === 1 ? "entry" : "entries"} within list B:{" "}
              {result.statsB.duplicates.slice(0, 5).join(", ")}
              {result.statsB.duplicates.length > 5 ? ", and more" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {[
          { id: "case", label: "Ignore case", key: "ignoreCase" as const },
          { id: "trim", label: "Trim whitespace", key: "trim" as const },
          { id: "sort", label: "Sort results", key: "sort" as const },
        ].map((toggle) => (
          <div key={toggle.id} className="flex items-center gap-2">
            <Switch
              id={`list-comparison-${toggle.id}`}
              name={toggle.key}
              checked={options[toggle.key]}
              onCheckedChange={(checked) => update({ [toggle.key]: checked })}
            />
            <Label htmlFor={`list-comparison-${toggle.id}`} className="font-normal">
              {toggle.label}
            </Label>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setListA("")
            setListB("")
            setOptions({ ignoreCase: true, trim: true, sort: false })
          }}
          disabled={!listA && !listB}
        >
          <Trash2 className="size-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ResultPanel
          id="only-in-a"
          title="Only in A"
          description="Present in the first list and missing from the second"
          values={result.onlyA}
        />
        <ResultPanel
          id="only-in-b"
          title="Only in B"
          description="Present in the second list and missing from the first"
          values={result.onlyB}
        />
        <ResultPanel
          id="in-both"
          title="In both"
          description="The intersection of the two lists"
          values={result.both}
        />
        <ResultPanel
          id="in-either"
          title="In either"
          description="The combined set, with each value listed once"
          values={result.either}
        />
      </div>
    </div>
  )
}
