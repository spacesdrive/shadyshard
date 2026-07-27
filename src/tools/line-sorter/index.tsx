import { useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { secureRandomInt } from "@/lib/secure-random"

const ORDERS = [
  { value: "az", label: "Alphabetical (A to Z)" },
  { value: "za", label: "Alphabetical (Z to A)" },
  { value: "numeric-asc", label: "Numeric (low to high)" },
  { value: "numeric-desc", label: "Numeric (high to low)" },
  { value: "length-asc", label: "Length (short to long)" },
  { value: "length-desc", label: "Length (long to short)" },
  { value: "reverse", label: "Reverse current order" },
  { value: "random", label: "Random shuffle" },
] as const

type Order = (typeof ORDERS)[number]["value"]

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "variant" })
const caseInsensitiveCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "accent",
})

function leadingNumber(line: string): number | null {
  const match = line.trim().match(/^-?\d+(\.\d+)?/)
  return match ? Number(match[0]) : null
}

/**
 * Fisher-Yates driven by a seeded generator rather than by `secureRandomInt`
 * directly, so the shuffle stays a pure function of (lines, seed) and can be
 * re-derived on every render. The seed itself comes from the browser's
 * cryptographic generator, and a new one is drawn per "Shuffle again" click.
 */
function shuffle(lines: string[], seed: number): string[] {
  const result = [...lines]
  let state = seed >>> 0

  for (let i = result.length - 1; i > 0; i--) {
    state = (state + 0x6d2b79f5) >>> 0
    let random = Math.imul(state ^ (state >>> 15), 1 | state)
    random = (random + Math.imul(random ^ (random >>> 7), 61 | random)) ^ random
    const j = Math.floor((((random ^ (random >>> 14)) >>> 0) / 4294967296) * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function sortLines(
  lines: string[],
  order: Order,
  ignoreCase: boolean,
  shuffleSeed: number,
): string[] {
  const compare = ignoreCase ? caseInsensitiveCollator : collator

  switch (order) {
    case "az":
      return [...lines].sort((a, b) => compare.compare(a, b))
    case "za":
      return [...lines].sort((a, b) => compare.compare(b, a))
    case "length-asc":
      return [...lines].sort((a, b) => a.length - b.length)
    case "length-desc":
      return [...lines].sort((a, b) => b.length - a.length)
    case "reverse":
      return [...lines].reverse()
    case "random":
      return shuffle(lines, shuffleSeed)
    case "numeric-asc":
    case "numeric-desc": {
      const numbered: { line: string; value: number }[] = []
      const unnumbered: string[] = []
      for (const line of lines) {
        const value = leadingNumber(line)
        if (value === null) unnumbered.push(line)
        else numbered.push({ line, value })
      }
      numbered.sort((a, b) =>
        order === "numeric-asc" ? a.value - b.value : b.value - a.value,
      )
      return [...numbered.map((entry) => entry.line), ...unnumbered]
    }
  }
}

export default function LineSorter() {
  const [text, setText] = useState("")
  const [order, setOrder] = useState<Order>("az")
  const [ignoreCase, setIgnoreCase] = useState(true)
  const [trimLines, setTrimLines] = useState(true)
  const [removeBlank, setRemoveBlank] = useState(true)
  const [shuffleSeed, setShuffleSeed] = useState(() => secureRandomInt(2 ** 31))

  const result = useMemo(() => {
    let lines = text.split("\n")
    if (trimLines) lines = lines.map((line) => line.trim())
    if (removeBlank) lines = lines.filter((line) => line.trim() !== "")
    if (lines.length === 1 && lines[0] === "") return ""
    return sortLines(lines, order, ignoreCase, shuffleSeed).join("\n")
  }, [text, order, ignoreCase, trimLines, removeBlank, shuffleSeed])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="line-sorter-input">Lines</Label>
        <Textarea
          id="line-sorter-input"
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"banana\napple\ncherry"}
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[16rem_1fr] sm:items-end">
        <div>
          <Label htmlFor="line-sorter-order">Order</Label>
          <Select
            value={order}
            onValueChange={(value) => value && setOrder(value as Order)}
          >
            <SelectTrigger id="line-sorter-order" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {order === "random" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setShuffleSeed(secureRandomInt(2 ** 31))}
          >
            Shuffle again
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="line-sorter-case"
            name="ignoreCase"
            checked={ignoreCase}
            onCheckedChange={setIgnoreCase}
          />
          <Label htmlFor="line-sorter-case" className="font-normal">
            Ignore case
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="line-sorter-trim"
            name="trimLines"
            checked={trimLines}
            onCheckedChange={setTrimLines}
          />
          <Label htmlFor="line-sorter-trim" className="font-normal">
            Trim whitespace
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="line-sorter-blank"
            name="removeBlank"
            checked={removeBlank}
            onCheckedChange={setRemoveBlank}
          />
          <Label htmlFor="line-sorter-blank" className="font-normal">
            Remove blank lines
          </Label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result} label="Copy result" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setText("")}
          disabled={!text}
        >
          Clear
        </Button>
      </div>

      <div>
        <Label htmlFor="line-sorter-output">Sorted</Label>
        <Textarea
          id="line-sorter-output"
          name="result"
          value={result}
          readOnly
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
        />
      </div>
    </div>
  )
}
