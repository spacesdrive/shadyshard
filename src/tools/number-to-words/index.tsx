import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
]

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
]

const INTERNATIONAL_SCALES = [
  "",
  "thousand",
  "million",
  "billion",
  "trillion",
  "quadrillion",
  "quintillion",
]

const INDIAN_SCALES = ["", "thousand", "lakh", "crore", "arab", "kharab"]

const CURRENCIES = [
  { value: "USD", label: "US dollars", major: "dollars", minor: "cents" },
  { value: "EUR", label: "Euros", major: "euros", minor: "cents" },
  { value: "GBP", label: "Pounds sterling", major: "pounds", minor: "pence" },
  { value: "INR", label: "Indian rupees", major: "rupees", minor: "paise" },
] as const

type CurrencyCode = (typeof CURRENCIES)[number]["value"]
type Scale = "international" | "indian"
type Casing = "sentence" | "title" | "upper"

const ORDINAL_REPLACEMENTS: Record<string, string> = {
  one: "first",
  two: "second",
  three: "third",
  five: "fifth",
  eight: "eighth",
  nine: "ninth",
  twelve: "twelfth",
}

function twoDigitsToWords(value: number): string {
  if (value < 20) return ONES[value]
  const tens = Math.floor(value / 10)
  const ones = value % 10
  return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`
}

function threeDigitsToWords(value: number): string {
  const hundreds = Math.floor(value / 100)
  const remainder = value % 100
  const parts: string[] = []
  if (hundreds > 0) parts.push(`${ONES[hundreds]} hundred`)
  if (remainder > 0) parts.push(twoDigitsToWords(remainder))
  return parts.join(" and ")
}

function splitInternational(digits: string): number[] {
  const groups: number[] = []
  let remaining = digits
  while (remaining.length > 0) {
    groups.unshift(Number(remaining.slice(-3)))
    remaining = remaining.slice(0, -3)
  }
  return groups
}

function splitIndian(digits: string): number[] {
  const groups: number[] = []
  let remaining = digits
  groups.unshift(Number(remaining.slice(-3)))
  remaining = remaining.slice(0, -3)
  while (remaining.length > 0) {
    groups.unshift(Number(remaining.slice(-2)))
    remaining = remaining.slice(0, -2)
  }
  return groups
}

function integerToWords(digits: string, scale: Scale): string | { error: string } {
  const trimmed = digits.replace(/^0+(?=\d)/, "")
  if (trimmed === "0") return "zero"

  const scales = scale === "indian" ? INDIAN_SCALES : INTERNATIONAL_SCALES
  const groups = scale === "indian" ? splitIndian(trimmed) : splitInternational(trimmed)

  if (groups.length > scales.length) {
    return {
      error:
        scale === "indian"
          ? "This number is larger than kharab, which is the largest unit in common use on the Indian scale."
          : "This number is larger than quintillions, which is the largest unit this tool spells out.",
    }
  }

  const parts: string[] = []
  groups.forEach((group, index) => {
    if (group === 0) return
    const scaleName = scales[groups.length - 1 - index]
    const words = threeDigitsToWords(group)
    parts.push(scaleName ? `${words} ${scaleName}` : words)
  })

  return parts.join(" ")
}

function toOrdinal(words: string): string {
  const segments = words.split(/([\s-])/)
  for (let index = segments.length - 1; index >= 0; index--) {
    const word = segments[index]
    if (!word.trim()) continue
    if (ORDINAL_REPLACEMENTS[word]) {
      segments[index] = ORDINAL_REPLACEMENTS[word]
    } else if (word.endsWith("y")) {
      segments[index] = `${word.slice(0, -1)}ieth`
    } else {
      segments[index] = `${word}th`
    }
    break
  }
  return segments.join("")
}

function digitsToWords(digits: string): string {
  return digits
    .split("")
    .map((digit) => ONES[Number(digit)])
    .join(" ")
}

function applyCasing(text: string, casing: Casing): string {
  if (casing === "upper") return text.toUpperCase()
  if (casing === "title") {
    return text.replace(/\b[a-z]/g, (character) => character.toUpperCase())
  }
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface ConversionResult {
  words: string
  error: string | null
}

function convert(
  raw: string,
  scale: Scale,
  casing: Casing,
  currencyMode: boolean,
  currency: CurrencyCode,
  ordinal: boolean,
): ConversionResult {
  const cleaned = raw.replace(/[,\s_]/g, "")
  if (!cleaned) return { words: "", error: null }

  if (!/^-?\d*\.?\d*$/.test(cleaned) || !/\d/.test(cleaned)) {
    return {
      words: "",
      error: `"${raw.trim()}" is not a number. Enter digits, with an optional minus sign and at most one decimal point.`,
    }
  }

  const negative = cleaned.startsWith("-")
  const unsigned = negative ? cleaned.slice(1) : cleaned
  const [integerPart, decimalPart = ""] = unsigned.split(".")
  const integerDigits = integerPart || "0"

  if (integerDigits.length > 21) {
    return { words: "", error: "This number has too many digits to spell out." }
  }

  const integerWords = integerToWords(integerDigits, scale)
  if (typeof integerWords !== "string") {
    return { words: "", error: integerWords.error }
  }

  const currencyEntry = CURRENCIES.find((entry) => entry.value === currency)!
  let result: string

  if (currencyMode) {
    const minorRaw = decimalPart.padEnd(2, "0").slice(0, 2)
    const minorValue = Number(minorRaw)
    const segments = [integerWords, currencyEntry.major]
    if (minorValue > 0) {
      segments.push("and", twoDigitsToWords(minorValue), currencyEntry.minor)
    }
    segments.push("only")
    result = segments.join(" ")
  } else if (ordinal) {
    result = toOrdinal(integerWords)
  } else {
    result = integerWords
    if (decimalPart) result += ` point ${digitsToWords(decimalPart)}`
  }

  if (negative) result = `minus ${result}`
  return { words: applyCasing(result, casing), error: null }
}

export default function NumberToWords() {
  const [value, setValue] = useState("")
  const [scale, setScale] = useState<Scale>("international")
  const [casing, setCasing] = useState<Casing>("sentence")
  const [currencyMode, setCurrencyMode] = useState(false)
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [ordinal, setOrdinal] = useState(false)

  const result = useMemo(
    () => convert(value, scale, casing, currencyMode, currency, ordinal),
    [value, scale, casing, currencyMode, currency, ordinal],
  )

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="number-to-words-input">Number</Label>
        <Input
          id="number-to-words-input"
          name="number"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="1234567.89"
          className="mt-1.5 font-mono text-sm"
          spellCheck={false}
          inputMode="decimal"
          aria-invalid={result.error ? true : undefined}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Commas and spaces are ignored, so 1,234,567.89 works too.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="number-to-words-scale">Numbering scale</Label>
          <Select value={scale} onValueChange={(next) => next && setScale(next as Scale)}>
            <SelectTrigger id="number-to-words-scale" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="international">
                International (thousand, million, billion)
              </SelectItem>
              <SelectItem value="indian">Indian (thousand, lakh, crore)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="text-sm font-medium">Capitalisation</span>
          <Tabs
            value={casing}
            onValueChange={(next) => setCasing(next as Casing)}
            className="mt-1.5"
          >
            <TabsList>
              <TabsTrigger value="sentence">Sentence</TabsTrigger>
              <TabsTrigger value="title">Title</TabsTrigger>
              <TabsTrigger value="upper">Upper</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="number-to-words-currency"
            name="currencyMode"
            checked={currencyMode}
            onCheckedChange={(checked) => {
              setCurrencyMode(checked)
              if (checked) setOrdinal(false)
            }}
          />
          <Label htmlFor="number-to-words-currency" className="font-normal">
            Currency wording for a cheque or invoice
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="number-to-words-ordinal"
            name="ordinal"
            checked={ordinal}
            disabled={currencyMode}
            onCheckedChange={setOrdinal}
          />
          <Label htmlFor="number-to-words-ordinal" className="font-normal">
            Ordinal (first, second, third)
          </Label>
        </div>
      </div>

      {currencyMode && (
        <div className="max-w-sm">
          <Label htmlFor="number-to-words-currency-select">Currency</Label>
          <Select
            value={currency}
            onValueChange={(next) => next && setCurrency(next as CurrencyCode)}
          >
            <SelectTrigger id="number-to-words-currency-select" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {result.error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <div>
        <Label htmlFor="number-to-words-output">In words</Label>
        <Textarea
          id="number-to-words-output"
          name="words"
          value={result.words}
          readOnly
          placeholder="The spelled-out number will appear here."
          className="mt-1.5 min-h-24 resize-y text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result.words} label="Copy words" />
        <Button type="button" variant="outline" size="sm" onClick={() => setValue("")}>
          Reset
        </Button>
      </div>
    </div>
  )
}
