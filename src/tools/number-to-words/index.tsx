import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  { value: 1e12, name: "trillion" },
  { value: 1e9, name: "billion" },
  { value: 1e6, name: "million" },
  { value: 1e3, name: "thousand" },
]

const INDIAN_SCALES = [
  { value: 1e7, name: "crore" },
  { value: 1e5, name: "lakh" },
  { value: 1e3, name: "thousand" },
]

const CURRENCIES = [
  { value: "none", label: "No currency", unit: "", subunit: "", locale: "en-US" },
  {
    value: "inr",
    label: "Indian rupee",
    unit: "rupees",
    subunit: "paise",
    locale: "en-IN",
  },
  {
    value: "usd",
    label: "US dollar",
    unit: "dollars",
    subunit: "cents",
    locale: "en-US",
  },
  { value: "eur", label: "Euro", unit: "euros", subunit: "cents", locale: "en-IE" },
  {
    value: "gbp",
    label: "Pound sterling",
    unit: "pounds",
    subunit: "pence",
    locale: "en-GB",
  },
]

const CASES = [
  { value: "lower", label: "lower case" },
  { value: "sentence", label: "Sentence case" },
  { value: "title", label: "Title Case" },
  { value: "upper", label: "UPPER CASE" },
]

const MAX_DIGITS = 15

function belowThousand(value: number): string {
  if (value === 0) return ""
  if (value < 20) return ONES[value]
  if (value < 100) {
    const remainder = value % 10
    return remainder
      ? `${TENS[Math.floor(value / 10)]} ${ONES[remainder]}`
      : TENS[Math.floor(value / 10)]
  }
  const remainder = value % 100
  const hundreds = `${ONES[Math.floor(value / 100)]} hundred`
  return remainder ? `${hundreds} ${belowThousand(remainder)}` : hundreds
}

function wholeToWords(value: number, system: string): string {
  if (value === 0) return "zero"

  const scales = system === "indian" ? INDIAN_SCALES : INTERNATIONAL_SCALES
  const parts: string[] = []
  let remaining = value

  for (const scale of scales) {
    if (remaining < scale.value) continue
    const count = Math.floor(remaining / scale.value)
    remaining %= scale.value
    // Above a crore the Indian system keeps counting in crores, so the
    // multiplier itself is spelled with the full converter, not just 1-999.
    const spelled = count < 1000 ? belowThousand(count) : wholeToWords(count, system)
    parts.push(`${spelled} ${scale.name}`)
  }

  if (remaining > 0) parts.push(belowThousand(remaining))
  return parts.join(" ")
}

function applyCase(value: string, style: string): string {
  if (style === "upper") return value.toUpperCase()
  if (style === "sentence") return value.charAt(0).toUpperCase() + value.slice(1)
  if (style === "title") {
    return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
  }
  return value
}

interface Conversion {
  words: string
  grouped: string
  error: string | null
}

function convert(
  raw: string,
  system: string,
  currencyKey: string,
  caseStyle: string,
  appendOnly: boolean,
): Conversion {
  const cleaned = raw.replace(/[\s,]/g, "")
  if (!cleaned) return { words: "", grouped: "", error: null }

  if (!/^-?\d*(\.\d*)?$/.test(cleaned) || cleaned === "-" || cleaned === ".") {
    return {
      words: "",
      grouped: "",
      error: "Enter digits only, with an optional minus sign and a single decimal point.",
    }
  }

  const negative = cleaned.startsWith("-")
  const unsigned = negative ? cleaned.slice(1) : cleaned
  const [wholePart = "0", fractionPart = ""] = unsigned.split(".")

  if (wholePart.replace(/^0+/, "").length > MAX_DIGITS) {
    return {
      words: "",
      grouped: "",
      error: `This number has more than ${MAX_DIGITS} digits before the decimal point, which is past the range that converts exactly.`,
    }
  }

  const currency =
    CURRENCIES.find((entry) => entry.value === currencyKey) ?? CURRENCIES[0]
  const whole = Number(wholePart || "0")
  const grouped = new Intl.NumberFormat(currency.locale, {
    maximumFractionDigits: 20,
  }).format(Number(unsigned))

  const pieces: string[] = []
  if (negative) pieces.push("minus")

  if (currency.value === "none") {
    pieces.push(wholeToWords(whole, system))
    if (fractionPart) {
      pieces.push("point")
      for (const digit of fractionPart) pieces.push(ONES[Number(digit)])
    }
  } else {
    const subunits = Math.round(Number(`0.${fractionPart || "0"}`) * 100)
    pieces.push(wholeToWords(whole, system), currency.unit)
    if (subunits > 0) {
      pieces.push("and", wholeToWords(subunits, system), currency.subunit)
    }
    if (appendOnly) pieces.push("only")
  }

  return {
    words: applyCase(pieces.filter(Boolean).join(" "), caseStyle),
    grouped: negative ? `-${grouped}` : grouped,
    error: null,
  }
}

export default function NumberToWords() {
  const [value, setValue] = useState("")
  const [system, setSystem] = useState("international")
  const [currency, setCurrency] = useState("none")
  const [caseStyle, setCaseStyle] = useState("sentence")
  const [appendOnly, setAppendOnly] = useState(true)

  const { words, grouped, error } = useMemo(
    () => convert(value, system, currency, caseStyle, appendOnly),
    [value, system, currency, caseStyle, appendOnly],
  )

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="number-to-words-value">Number</Label>
        <Input
          id="number-to-words-value"
          name="value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="1250.75"
          inputMode="decimal"
          aria-invalid={error ? true : undefined}
          className="mt-1.5 font-mono sm:max-w-sm"
        />
        {grouped && !error && (
          <p className="text-muted-foreground mt-1.5 text-sm tabular-nums">{grouped}</p>
        )}
        {error && <p className="text-destructive mt-1.5 text-sm">{error}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="number-to-words-system">Numbering system</Label>
          <Select
            value={system}
            onValueChange={(next) => next && setSystem(next as string)}
          >
            <SelectTrigger id="number-to-words-system" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="international">
                International (million, billion)
              </SelectItem>
              <SelectItem value="indian">Indian (lakh, crore)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="number-to-words-currency">Currency</Label>
          <Select
            value={currency}
            onValueChange={(next) => next && setCurrency(next as string)}
          >
            <SelectTrigger id="number-to-words-currency" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="number-to-words-case">Capitalisation</Label>
          <Select
            value={caseStyle}
            onValueChange={(next) => next && setCaseStyle(next as string)}
          >
            <SelectTrigger id="number-to-words-case" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CASES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currency !== "none" && (
        <div className="flex items-center gap-2">
          <Switch
            id="number-to-words-only"
            name="appendOnly"
            checked={appendOnly}
            onCheckedChange={setAppendOnly}
          />
          <Label htmlFor="number-to-words-only" className="font-normal">
            End with the word only, as banks expect on a cheque
          </Label>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="number-to-words-output">In words</Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={words} label="Copy words" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setValue("")
                setSystem("international")
                setCurrency("none")
                setCaseStyle("sentence")
                setAppendOnly(true)
              }}
              disabled={!value}
            >
              <Trash2 className="size-4" />
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="number-to-words-output"
          name="output"
          value={words}
          readOnly
          className="min-h-24 resize-y text-base"
          placeholder="The written form appears here"
        />
      </div>
    </div>
  )
}
