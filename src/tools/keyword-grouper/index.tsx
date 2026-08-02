import { useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { toDelimited } from "@/lib/csv"

const DEFAULT_STOP_WORDS =
  "a an and are as at be best but by can do does for free from get how i in is it my of on or the to top vs what when where which who why with you your"

interface Keyword {
  phrase: string
  volume: number | null
}

interface Group {
  label: string
  keywords: Keyword[]
  volume: number
}

function parseKeywords(text: string): Keyword[] {
  const seen = new Set<string>()
  const keywords: Keyword[] = []

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim()
    if (!line) continue

    /** Most keyword tools export "phrase<separator>volume"; a trailing number is the volume. */
    const match = line.match(/^(.*?)[,\t;]\s*"?([\d.,\s]+)"?$/)
    const phrase = (match ? match[1] : line).replace(/^"|"$/g, "").trim().toLowerCase()
    if (!phrase || seen.has(phrase)) continue
    seen.add(phrase)

    const volumeText = match ? match[2].replace(/[,\s]/g, "") : ""
    const volume =
      volumeText && Number.isFinite(Number(volumeText)) ? Number(volumeText) : null
    keywords.push({ phrase, volume })
  }

  return keywords
}

function phrasesIn(words: string[], maxLength: number): string[] {
  const phrases: string[] = []
  for (let length = 1; length <= maxLength; length++) {
    for (let start = 0; start + length <= words.length; start++) {
      phrases.push(words.slice(start, start + length).join(" "))
    }
  }
  return phrases
}

function groupKeywords(
  keywords: Keyword[],
  stopWords: Set<string>,
  maxPhraseLength: number,
  minGroupSize: number,
): { groups: Group[]; ungrouped: Keyword[] } {
  const significantWords = new Map<string, string[]>()
  for (const keyword of keywords) {
    significantWords.set(
      keyword.phrase,
      keyword.phrase
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 1 && !stopWords.has(word)),
    )
  }

  const counts = new Map<string, number>()
  for (const keyword of keywords) {
    const unique = new Set(
      phrasesIn(significantWords.get(keyword.phrase) ?? [], maxPhraseLength),
    )
    for (const phrase of unique) counts.set(phrase, (counts.get(phrase) ?? 0) + 1)
  }

  /**
   * Longest phrase first, then most keywords. Taking the most frequent phrase
   * first instead would let the broadest term swallow the whole list, since
   * every keyword containing "running shoes" also contains "shoes".
   */
  const candidates = [...counts.entries()]
    .filter(([, count]) => count >= minGroupSize)
    .sort((a, b) => {
      const lengthDifference = b[0].split(" ").length - a[0].split(" ").length
      if (lengthDifference !== 0) return lengthDifference
      if (b[1] !== a[1]) return b[1] - a[1]
      return a[0].localeCompare(b[0])
    })

  const assigned = new Set<string>()
  const groups: Group[] = []

  for (const [phrase] of candidates) {
    const members = keywords.filter((keyword) => {
      if (assigned.has(keyword.phrase)) return false
      const words = significantWords.get(keyword.phrase) ?? []
      return phrasesIn(words, maxPhraseLength).includes(phrase)
    })
    if (members.length < minGroupSize) continue
    for (const member of members) assigned.add(member.phrase)
    groups.push({
      label: phrase,
      keywords: members,
      volume: members.reduce((total, member) => total + (member.volume ?? 0), 0),
    })
  }

  groups.sort((a, b) => b.volume - a.volume || b.keywords.length - a.keywords.length)

  return {
    groups,
    ungrouped: keywords.filter((keyword) => !assigned.has(keyword.phrase)),
  }
}

function toCsv(groups: Group[], ungrouped: Keyword[], hasVolume: boolean): string {
  const header = hasVolume ? ["Group", "Keyword", "Volume"] : ["Group", "Keyword"]
  const rows: string[][] = [header]
  for (const group of groups) {
    for (const keyword of group.keywords) {
      rows.push(
        hasVolume
          ? [group.label, keyword.phrase, String(keyword.volume ?? "")]
          : [group.label, keyword.phrase],
      )
    }
  }
  for (const keyword of ungrouped) {
    rows.push(
      hasVolume
        ? ["Ungrouped", keyword.phrase, String(keyword.volume ?? "")]
        : ["Ungrouped", keyword.phrase],
    )
  }
  return toDelimited(rows, ",")
}

const SAMPLE = `running shoes for flat feet, 2400
best running shoes for flat feet, 1300
trail running shoes women, 3100
best trail running shoes, 5400
waterproof trail running shoes, 720
how to clean running shoes, 880
how to clean white sneakers, 1600
when to replace running shoes, 990`

export default function KeywordGrouper() {
  const [input, setInput] = useState(SAMPLE)
  const [stopWords, setStopWords] = useState(DEFAULT_STOP_WORDS)
  const [maxPhraseLength, setMaxPhraseLength] = useState("3")
  const [minGroupSize, setMinGroupSize] = useState("2")

  const keywords = useMemo(() => parseKeywords(input), [input])
  const hasVolume = keywords.some((keyword) => keyword.volume !== null)

  const { groups, ungrouped } = useMemo(
    () =>
      groupKeywords(
        keywords,
        new Set(stopWords.split(/[\s,]+/).filter(Boolean)),
        Number(maxPhraseLength),
        Math.max(1, Number(minGroupSize) || 1),
      ),
    [keywords, stopWords, maxPhraseLength, minGroupSize],
  )

  const csv = useMemo(
    () => toCsv(groups, ungrouped, hasVolume),
    [groups, ungrouped, hasVolume],
  )

  const plainText = useMemo(
    () =>
      groups
        .map(
          (group) =>
            `${group.label}${hasVolume ? ` (${group.volume.toLocaleString("en-US")})` : ""}\n${group.keywords
              .map((keyword) => `  ${keyword.phrase}`)
              .join("\n")}`,
        )
        .concat(
          ungrouped.length
            ? [`Ungrouped\n${ungrouped.map((k) => `  ${k.phrase}`).join("\n")}`]
            : [],
        )
        .join("\n\n"),
    [groups, ungrouped, hasVolume],
  )

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="keyword-input">Keywords, one per line</Label>
        <Textarea
          id="keyword-input"
          name="keywords"
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            "running shoes for flat feet, 2400\ntrail running shoes women, 3100"
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="keyword-phrase-length">Longest phrase to group on</Label>
          <Select
            value={maxPhraseLength}
            onValueChange={(value) => value && setMaxPhraseLength(value as string)}
          >
            <SelectTrigger id="keyword-phrase-length" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">One word</SelectItem>
              <SelectItem value="2">Two words</SelectItem>
              <SelectItem value="3">Three words</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="keyword-min-size">Smallest group</Label>
          <Input
            id="keyword-min-size"
            name="minGroupSize"
            type="number"
            min={1}
            className="mt-1.5"
            value={minGroupSize}
            onChange={(event) => setMinGroupSize(event.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="keyword-stop-words">Stop words</Label>
        <Textarea
          id="keyword-stop-words"
          name="stopWords"
          className="mt-1.5 min-h-20 resize-y font-mono text-sm"
          value={stopWords}
          onChange={(event) => setStopWords(event.target.value)}
        />
        <p className="text-muted-foreground mt-1.5 text-sm">
          Words ignored when looking for shared phrases. Add your brand name to keep it
          out of the group labels, or remove a word to let it form a group.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={plainText} label="Copy groups" />
        <DownloadButton
          getBlob={() => new Blob([csv], { type: "text/csv" })}
          filename="keyword-groups.csv"
          disabled={keywords.length === 0}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        {keywords.length} {keywords.length === 1 ? "keyword" : "keywords"} in{" "}
        {groups.length} {groups.length === 1 ? "group" : "groups"}, {ungrouped.length}{" "}
        ungrouped.
      </p>

      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.label} className="border-border/60 rounded-lg border">
            <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
              <h2 className="text-sm font-medium">{group.label}</h2>
              <span className="text-muted-foreground text-xs tabular-nums">
                {group.keywords.length}{" "}
                {group.keywords.length === 1 ? "keyword" : "keywords"}
                {hasVolume && `, ${group.volume.toLocaleString("en-US")} volume`}
              </span>
            </div>
            <ul className="divide-border/60 divide-y text-sm">
              {group.keywords.map((keyword) => (
                <li
                  key={keyword.phrase}
                  className="flex items-center justify-between gap-3 px-3 py-1.5"
                >
                  <span className="min-w-0 break-words">{keyword.phrase}</span>
                  {keyword.volume !== null && (
                    <span className="text-muted-foreground shrink-0 tabular-nums">
                      {keyword.volume.toLocaleString("en-US")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {ungrouped.length > 0 && (
          <div className="border-border/60 rounded-lg border">
            <div className="border-border/60 border-b px-3 py-2">
              <h2 className="text-sm font-medium">Ungrouped</h2>
            </div>
            <ul className="divide-border/60 divide-y text-sm">
              {ungrouped.map((keyword) => (
                <li key={keyword.phrase} className="px-3 py-1.5 break-words">
                  {keyword.phrase}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
