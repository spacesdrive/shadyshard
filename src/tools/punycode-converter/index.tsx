import { useMemo, useState } from "react"
import { AlertTriangle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/tool/CopyButton"

// RFC 3492 parameters.
const BASE = 36
const TMIN = 1
const TMAX = 26
const SKEW = 38
const DAMP = 700
const INITIAL_BIAS = 72
const INITIAL_N = 128
const PREFIX = "xn--"

const SCRIPT_RANGES: { name: string; pattern: RegExp }[] = [
  { name: "Latin", pattern: /[A-Za-zÀ-ɏ]/ },
  { name: "Cyrillic", pattern: /[Ѐ-ӿ]/ },
  { name: "Greek", pattern: /[Ͱ-Ͽ]/ },
  { name: "Armenian", pattern: /[԰-֏]/ },
  { name: "Hebrew", pattern: /[֐-׿]/ },
  { name: "Arabic", pattern: /[؀-ۿ]/ },
  { name: "Devanagari", pattern: /[ऀ-ॿ]/ },
  { name: "Han", pattern: /[一-鿿]/ },
  { name: "Kana", pattern: /[぀-ヿ]/ },
  { name: "Hangul", pattern: /[가-힯]/ },
]

/** Non-Latin characters commonly used to imitate a Latin letter in a domain. */
const CONFUSABLES: Record<string, string> = {
  а: "a",
  е: "e",
  о: "o",
  р: "p",
  с: "c",
  х: "x",
  у: "y",
  і: "i",
  ѕ: "s",
  ј: "j",
  һ: "h",
  ԁ: "d",
  ο: "o",
  α: "a",
  ρ: "p",
  ν: "v",
  ɡ: "g",
  ӏ: "l",
}

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let scaled = firstTime ? Math.floor(delta / DAMP) : delta >> 1
  scaled += Math.floor(scaled / numPoints)
  let k = 0
  while (scaled > ((BASE - TMIN) * TMAX) >> 1) {
    scaled = Math.floor(scaled / (BASE - TMIN))
    k += BASE
  }
  return k + Math.floor(((BASE - TMIN + 1) * scaled) / (scaled + SKEW))
}

function digitValue(character: string): number {
  const code = character.charCodeAt(0)
  if (code >= 0x30 && code <= 0x39) return code - 0x16
  if (code >= 0x41 && code <= 0x5a) return code - 0x41
  if (code >= 0x61 && code <= 0x7a) return code - 0x61
  return -1
}

function decodeLabel(encoded: string): string {
  const output: number[] = []
  let n = INITIAL_N
  let i = 0
  let bias = INITIAL_BIAS

  const delimiter = encoded.lastIndexOf("-")
  if (delimiter > 0) {
    for (let index = 0; index < delimiter; index += 1) {
      output.push(encoded.charCodeAt(index))
    }
  }

  let cursor = delimiter > 0 ? delimiter + 1 : 0

  while (cursor < encoded.length) {
    const previousI = i
    let weight = 1

    for (let k = BASE; ; k += BASE) {
      if (cursor >= encoded.length) {
        throw new Error(`"${encoded}" is not a complete punycode label.`)
      }
      const digit = digitValue(encoded[cursor])
      cursor += 1
      if (digit < 0) {
        throw new Error(
          `"${encoded}" contains a character that is not valid in punycode.`,
        )
      }
      i += digit * weight
      const threshold = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
      if (digit < threshold) break
      weight *= BASE - threshold
    }

    bias = adapt(i - previousI, output.length + 1, previousI === 0)
    n += Math.floor(i / (output.length + 1))
    i %= output.length + 1
    output.splice(i, 0, n)
    i += 1
  }

  return String.fromCodePoint(...output)
}

function toUnicode(domain: string): string {
  return domain
    .split(".")
    .map((label) =>
      label.toLowerCase().startsWith(PREFIX)
        ? decodeLabel(label.slice(PREFIX.length))
        : label,
    )
    .join(".")
}

/**
 * Encoding goes through the URL parser rather than a hand-rolled encoder so the
 * browser's own IDNA mapping (case folding, normalisation) is applied, which is
 * what a resolver will actually see.
 */
function toAscii(domain: string): string {
  const url = new URL(
    `https://${domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}`,
  )
  return url.hostname
}

interface LabelReport {
  label: string
  scripts: string[]
  confusables: { character: string; looksLike: string; codePoint: string }[]
}

function analyzeLabel(label: string): LabelReport {
  const scripts = SCRIPT_RANGES.filter((script) => script.pattern.test(label)).map(
    (script) => script.name,
  )

  const confusables = [...label]
    .filter((character) => character in CONFUSABLES)
    .map((character) => ({
      character,
      looksLike: CONFUSABLES[character],
      codePoint: `U+${(character.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0")}`,
    }))

  return { label, scripts, confusables }
}

export default function PunycodeConverter() {
  const [input, setInput] = useState("")

  const result = useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return null

    try {
      const unicode = toUnicode(trimmed)
      const ascii = toAscii(unicode)
      const reports = unicode
        .split(".")
        .filter(Boolean)
        .map(analyzeLabel)
        .filter((report) => report.scripts.length > 1 || report.confusables.length > 0)

      return { unicode, ascii, reports, error: null }
    } catch (error) {
      return {
        unicode: "",
        ascii: "",
        reports: [],
        error:
          error instanceof Error
            ? error.message
            : "This does not look like a domain name.",
      }
    }
  }, [input])

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="punycode-input">Domain name</Label>
        <Input
          id="punycode-input"
          name="domain"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="example.com or xn--80ak6aa92e.com"
          className="mt-1.5 font-mono"
          spellCheck={false}
          autoCapitalize="none"
          aria-invalid={result?.error ? true : undefined}
        />
      </div>

      {result?.error && <p className="text-destructive text-sm">{result.error}</p>}

      {result && !result.error && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-border/60 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">Unicode form</span>
                <CopyButton
                  value={result.unicode}
                  label="Copy Unicode form"
                  variant="ghost"
                  size="icon-sm"
                />
              </div>
              <p className="mt-1 font-mono text-sm break-all">{result.unicode}</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">
                  Punycode (ASCII) form
                </span>
                <CopyButton
                  value={result.ascii}
                  label="Copy punycode form"
                  variant="ghost"
                  size="icon-sm"
                />
              </div>
              <p className="mt-1 font-mono text-sm break-all">{result.ascii}</p>
            </div>
          </div>

          {result.reports.length > 0 ? (
            <div className="border-border/60 bg-muted/30 space-y-3 rounded-lg border p-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="size-4 text-amber-500" aria-hidden />
                Possible lookalike domain
              </p>
              {result.reports.map((report) => (
                <div key={report.label} className="text-sm">
                  <p className="font-mono">{report.label}</p>
                  {report.scripts.length > 1 && (
                    <p className="text-muted-foreground mt-1">
                      Mixes {report.scripts.join(" and ")} characters in one label.
                    </p>
                  )}
                  {report.confusables.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {report.confusables.map((entry, index) => (
                        <Badge
                          key={`${entry.codePoint}-${index}`}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {entry.character} {entry.codePoint} looks like {entry.looksLike}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-emerald-500">
              <ShieldCheck className="size-4" aria-hidden />
              No mixed scripts or known lookalike characters found
            </p>
          )}
        </>
      )}

      <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
        Reset
      </Button>
    </div>
  )
}
