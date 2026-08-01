import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"

const NUMERALS: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
]

const VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}

function toRoman(value: number): string {
  let remaining = value
  let out = ""
  for (const [amount, numeral] of NUMERALS) {
    while (remaining >= amount) {
      out += numeral
      remaining -= amount
    }
  }
  return out
}

interface RomanParse {
  value: number | null
  error: string | null
}

function fromRoman(raw: string): RomanParse {
  const roman = raw.trim().toUpperCase()
  if (!roman) return { value: null, error: null }

  const invalid = [...roman].find((char) => !(char in VALUES))
  if (invalid) {
    return {
      value: null,
      error: `"${invalid}" is not a Roman numeral. Use only I, V, X, L, C, D, and M.`,
    }
  }

  let total = 0
  for (let i = 0; i < roman.length; i++) {
    const current = VALUES[roman[i]]
    const next = VALUES[roman[i + 1]]
    total += next && next > current ? -current : current
  }

  if (toRoman(total) !== roman) {
    return {
      value: null,
      error: `This is not written in standard form. ${total.toLocaleString("en-US")} is normally written ${toRoman(total)}.`,
    }
  }

  return { value: total, error: null }
}

function NumberMode() {
  const [input, setInput] = useState("2026")

  const { output, error } = useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return { output: "", error: null }

    if (!/^\d+$/.test(trimmed)) {
      return { output: "", error: "Enter a whole number with no decimal point or sign." }
    }

    const value = Number(trimmed)
    if (value < 1) {
      return {
        output: "",
        error:
          "Roman numerals start at 1. There is no numeral for zero or a negative number.",
      }
    }
    if (value > 3999) {
      return {
        output: "",
        error:
          "Standard Roman numerals stop at 3999, since anything larger needs the overline notation that multiplies a numeral by a thousand.",
      }
    }

    return { output: toRoman(value), error: null }
  }, [input])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="roman-number">Number</Label>
        <Input
          id="roman-number"
          name="number"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="1 to 3999"
          className="mt-1.5"
          inputMode="numeric"
          aria-invalid={error ? true : undefined}
        />
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {output && (
        <>
          <div className="border-border/60 rounded-lg border p-6 text-center">
            <p className="font-mono text-3xl font-semibold tracking-widest break-all">
              {output}
            </p>
          </div>
          <CopyButton value={output} label="Copy numeral" />
        </>
      )}
    </div>
  )
}

function RomanMode() {
  const [input, setInput] = useState("MMXXVI")
  const { value, error } = useMemo(() => fromRoman(input), [input])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="roman-numeral">Roman numeral</Label>
        <Input
          id="roman-numeral"
          name="numeral"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="MMXXVI"
          className="mt-1.5 font-mono tracking-widest uppercase"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
        />
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value !== null && (
        <>
          <div className="border-border/60 rounded-lg border p-6 text-center">
            <p className="text-3xl font-semibold tabular-nums">
              {value.toLocaleString("en-US")}
            </p>
          </div>
          <CopyButton value={String(value)} label="Copy number" />
        </>
      )}
    </div>
  )
}

const SEPARATORS: { value: string; label: string; char: string }[] = [
  { value: "dot", label: "Dot", char: " . " },
  { value: "slash", label: "Slash", char: " / " },
  { value: "dash", label: "Dash", char: " - " },
  { value: "space", label: "Space", char: " " },
]

function DateMode() {
  const [date, setDate] = useState("")
  const [separatorId, setSeparatorId] = useState("dot")

  const separator = SEPARATORS.find((entry) => entry.value === separatorId)?.char ?? " . "

  const { output, parts, error } = useMemo(() => {
    if (!date) return { output: "", parts: null, error: null }

    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return { output: "", parts: null, error: "Pick a date first." }

    const year = Number(match[1])
    if (year < 1 || year > 3999) {
      return {
        output: "",
        parts: null,
        error: "Standard Roman numerals only cover the years 1 to 3999.",
      }
    }

    const day = toRoman(Number(match[3]))
    const month = toRoman(Number(match[2]))
    const romanYear = toRoman(year)

    return {
      output: [day, month, romanYear].join(separator),
      parts: { day, month, year: romanYear },
      error: null,
    }
  }, [date, separator])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="roman-date">Date</Label>
          <Input
            id="roman-date"
            name="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="roman-separator">Separator</Label>
          <Select
            value={separatorId}
            onValueChange={(value) => value && setSeparatorId(value as string)}
          >
            <SelectTrigger id="roman-separator" className="mt-1.5 w-full">
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
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {output && parts && (
        <>
          <div className="border-border/60 rounded-lg border p-6 text-center">
            <p className="font-mono text-2xl font-semibold tracking-widest break-all sm:text-3xl">
              {output}
            </p>
            <p className="text-muted-foreground mt-3 text-xs">
              Day {parts.day}, month {parts.month}, year {parts.year}
            </p>
          </div>
          <CopyButton value={output} label="Copy date" />
        </>
      )}
    </div>
  )
}

export default function RomanNumeralConverter() {
  const [mode, setMode] = useState("number")

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)}>
        <TabsList>
          <TabsTrigger value="number">Number to Roman</TabsTrigger>
          <TabsTrigger value="roman">Roman to number</TabsTrigger>
          <TabsTrigger value="date">Date</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "number" && <NumberMode />}
      {mode === "roman" && <RomanMode />}
      {mode === "date" && <DateMode />}
    </div>
  )
}
