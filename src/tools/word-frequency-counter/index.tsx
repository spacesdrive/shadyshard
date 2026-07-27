import { useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { objectsToDelimited } from "@/lib/csv"

const STOP_WORDS = new Set(
  `a about after all also am an and any are as at be because been before being between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its itself just me more most my no nor not of off on once only or other our out over own same she should so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who whom why will with you your`.split(
    " ",
  ),
)

interface WordCount {
  word: string
  count: number
  share: string
}

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+(?:['\u2019-][\p{L}\p{N}]+)*/gu) ?? []
}

function countWords(
  text: string,
  removeStopWords: boolean,
  minLength: number,
): { rows: WordCount[]; totalCounted: number } {
  const counts = new Map<string, number>()
  let totalCounted = 0

  for (const token of tokenize(text)) {
    if (token.length < minLength) continue
    if (removeStopWords && STOP_WORDS.has(token)) continue
    counts.set(token, (counts.get(token) ?? 0) + 1)
    totalCounted++
  }

  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word, count]) => ({
      word,
      count,
      share: totalCounted > 0 ? `${((count / totalCounted) * 100).toFixed(2)}%` : "0%",
    }))

  return { rows, totalCounted }
}

export default function WordFrequencyCounter() {
  const [text, setText] = useState("")
  const [removeStopWords, setRemoveStopWords] = useState(true)
  const [minLength, setMinLength] = useState("3")
  const [limit, setLimit] = useState("50")

  const parsedMinLength = Math.max(1, Number(minLength) || 1)
  const parsedLimit = Math.max(1, Number(limit) || 1)

  const { rows, totalCounted } = useMemo(
    () => countWords(text, removeStopWords, parsedMinLength),
    [text, removeStopWords, parsedMinLength],
  )

  const visible = rows.slice(0, parsedLimit)
  const csv = objectsToDelimited(
    rows.map((row) => ({ word: row.word, count: String(row.count), share: row.share })),
    ",",
  )

  return (
    <div className="space-y-4">
      <Textarea
        id="word-frequency-input"
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste an article, transcript, or draft here..."
        className="min-h-56 resize-y text-sm"
        aria-label="Text to analyze"
      />

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 pb-2">
          <Switch
            id="word-frequency-stop-words"
            name="removeStopWords"
            checked={removeStopWords}
            onCheckedChange={setRemoveStopWords}
          />
          <Label htmlFor="word-frequency-stop-words" className="font-normal">
            Ignore common stop words
          </Label>
        </div>
        <div className="w-36">
          <Label htmlFor="word-frequency-min-length">Minimum length</Label>
          <Input
            id="word-frequency-min-length"
            name="minLength"
            type="number"
            min={1}
            max={20}
            value={minLength}
            onChange={(e) => setMinLength(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="w-36">
          <Label htmlFor="word-frequency-limit">Show top</Label>
          <Input
            id="word-frequency-limit"
            name="limit"
            type="number"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {text.trim() && (
        <p className="text-muted-foreground text-sm">
          {rows.length} distinct word{rows.length === 1 ? "" : "s"} across {totalCounted}{" "}
          counted word{totalCounted === 1 ? "" : "s"}.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={csv} label="Copy CSV" />
        <DownloadButton
          getBlob={() => new Blob([csv], { type: "text/csv" })}
          filename="word-frequency.csv"
          label="Download CSV"
          disabled={rows.length === 0}
        />
      </div>

      {visible.length > 0 && (
        <div className="border-border/60 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="p-2 text-left font-medium">
                  Word
                </th>
                <th scope="col" className="p-2 text-right font-medium">
                  Count
                </th>
                <th scope="col" className="p-2 text-right font-medium">
                  Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {visible.map((row) => (
                <tr key={row.word}>
                  <td className="p-2 font-mono break-all">{row.word}</td>
                  <td className="p-2 text-right tabular-nums">{row.count}</td>
                  <td className="text-muted-foreground p-2 text-right tabular-nums">
                    {row.share}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
