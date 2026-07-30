import { useMemo, useState } from "react"
import { RefreshCw, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { secureRandomInt } from "@/lib/secure-random"

type Mode = "pick" | "shuffle" | "teams"

interface Group {
  title: string
  members: string[]
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function parseEntries(input: string, removeDuplicates: boolean): string[] {
  const entries = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  return removeDuplicates ? Array.from(new Set(entries)) : entries
}

function buildResult(
  entries: string[],
  mode: Mode,
  count: number,
  withReplacement: boolean,
  seed: number,
): Group[] {
  // seed is not used directly; changing it is what forces a fresh draw.
  void seed
  if (entries.length === 0) return []

  if (mode === "shuffle") {
    return [{ title: "Shuffled order", members: shuffled(entries) }]
  }

  if (mode === "teams") {
    const groups: Group[] = Array.from({ length: count }, (_, index) => ({
      title: `Group ${index + 1}`,
      members: [],
    }))
    shuffled(entries).forEach((entry, index) => {
      groups[index % count].members.push(entry)
    })
    return groups
  }

  if (withReplacement) {
    return [
      {
        title: "Winners",
        members: Array.from(
          { length: count },
          () => entries[secureRandomInt(entries.length)],
        ),
      },
    ]
  }

  return [{ title: "Winners", members: shuffled(entries).slice(0, count) }]
}

export default function RandomPicker() {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<Mode>("pick")
  const [count, setCount] = useState("1")
  const [removeDuplicates, setRemoveDuplicates] = useState(true)
  const [withReplacement, setWithReplacement] = useState(false)
  const [seed, setSeed] = useState(0)

  const entries = useMemo(
    () => parseEntries(input, removeDuplicates),
    [input, removeDuplicates],
  )

  const numericCount = Number(count)
  const maxCount = mode === "teams" ? Math.max(1, entries.length) : entries.length
  const countValid =
    Number.isInteger(numericCount) &&
    numericCount >= 1 &&
    (mode === "shuffle" ||
      withReplacement ||
      entries.length === 0 ||
      numericCount <= maxCount)

  const countError = countValid
    ? null
    : mode === "teams"
      ? `Enter a whole number of groups between 1 and ${maxCount}.`
      : `Enter a whole number between 1 and ${maxCount}, or switch on drawing with replacement.`

  const groups = useMemo(
    () =>
      countValid ? buildResult(entries, mode, numericCount, withReplacement, seed) : [],
    [countValid, entries, mode, numericCount, withReplacement, seed],
  )

  const asText = groups
    .map((group) =>
      groups.length > 1
        ? `${group.title}\n${group.members.map((member) => `  ${member}`).join("\n")}`
        : group.members.join("\n"),
    )
    .join("\n\n")

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="picker-input">Entries, one per line</Label>
        <Textarea
          id="picker-input"
          name="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={"Ada\nGrace\nAlan\nKatherine"}
          className="mt-1.5 min-h-44 resize-y text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1.5 text-xs tabular-nums">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
      </div>

      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as Mode)
          setCount(value === "teams" ? "2" : "1")
        }}
      >
        <TabsList>
          <TabsTrigger value="pick">Pick winners</TabsTrigger>
          <TabsTrigger value="shuffle">Shuffle</TabsTrigger>
          <TabsTrigger value="teams">Make groups</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode !== "shuffle" && (
        <div>
          <Label htmlFor="picker-count">
            {mode === "teams" ? "Number of groups" : "How many winners"}
          </Label>
          <Input
            id="picker-count"
            name="count"
            type="number"
            min={1}
            value={count}
            onChange={(event) => setCount(event.target.value)}
            aria-invalid={countError ? true : undefined}
            className="mt-1.5 sm:max-w-40"
          />
          {countError && <p className="text-destructive mt-1.5 text-sm">{countError}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="picker-duplicates"
            name="removeDuplicates"
            checked={removeDuplicates}
            onCheckedChange={setRemoveDuplicates}
          />
          <Label htmlFor="picker-duplicates" className="font-normal">
            Remove duplicate entries
          </Label>
        </div>
        {mode === "pick" && (
          <div className="flex items-center gap-2">
            <Switch
              id="picker-replacement"
              name="withReplacement"
              checked={withReplacement}
              onCheckedChange={setWithReplacement}
            />
            <Label htmlFor="picker-replacement" className="font-normal">
              Allow the same entry to win more than once
            </Label>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setSeed((value) => value + 1)} disabled={!entries.length}>
          <RefreshCw className="size-4" />
          {mode === "shuffle" ? "Shuffle again" : "Draw again"}
        </Button>
        <CopyButton value={asText} label="Copy result" />
        <DownloadButton
          getBlob={() => new Blob([asText], { type: "text/plain" })}
          filename="random-picker-result.txt"
          disabled={!asText}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setInput("")
            setMode("pick")
            setCount("1")
            setRemoveDuplicates(true)
            setWithReplacement(false)
          }}
          disabled={!input}
        >
          <Trash2 className="size-4" />
          Reset
        </Button>
      </div>

      {groups.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.title}
              className="border-border/60 bg-card rounded-lg border p-4"
            >
              <p className="text-muted-foreground mb-2 text-xs">
                {group.title}
                <span className="ml-2 tabular-nums">{group.members.length}</span>
              </p>
              <ol className="space-y-1 text-sm">
                {group.members.map((member, index) => (
                  <li key={`${member}-${index}`} className="wrap-anywhere">
                    <span className="text-muted-foreground mr-2 tabular-nums">
                      {index + 1}.
                    </span>
                    {member}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
