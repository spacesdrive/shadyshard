import { useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

interface Detector {
  id: string
  label: string
  token: string
  pattern: RegExp
  /** Rejects a syntactic match that is not really an instance, e.g. a long number that fails Luhn. */
  accept?: (match: string) => boolean
}

function passesLuhn(value: string): boolean {
  const digits = value.replace(/\D/g, "")
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let double = false
  for (let index = digits.length - 1; index >= 0; index--) {
    let digit = Number(digits[index])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

/**
 * Ordered most specific first. A JWT would otherwise be caught by the API key
 * pattern, and a URL containing an IP would be split by the IP pattern.
 */
const DETECTORS: Detector[] = [
  {
    id: "jwt",
    label: "JWTs",
    token: "JWT",
    pattern: /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g,
  },
  {
    id: "email",
    label: "Email addresses",
    token: "EMAIL",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    id: "url",
    label: "URLs",
    token: "URL",
    pattern: /\bhttps?:\/\/[^\s<>"')]+/g,
  },
  {
    id: "iban",
    label: "IBANs",
    token: "IBAN",
    pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g,
  },
  {
    id: "card",
    label: "Card numbers",
    token: "CARD",
    pattern: /\b(?:\d[ -]?){12,18}\d\b/g,
    accept: passesLuhn,
  },
  {
    id: "mac",
    label: "MAC addresses",
    token: "MAC",
    pattern: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
  },
  {
    id: "ip",
    label: "IP addresses",
    token: "IP",
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    accept: (match) => match.split(".").every((part) => Number(part) <= 255),
  },
  {
    id: "phone",
    label: "Phone numbers",
    token: "PHONE",
    pattern:
      /(?:\+\d{1,3}[ .-]?)?(?:\(\d{2,4}\)[ .-]?)?\d{3,4}[ .-]\d{3,4}(?:[ .-]\d{2,4})?\b/g,
    accept: (match) => match.replace(/\D/g, "").length >= 7,
  },
  {
    id: "key",
    label: "API keys and long tokens",
    token: "API_KEY",
    pattern:
      /\b(?:sk|pk|rk|ghp|gho|github_pat|xox[baprs]|AKIA|ASIA)[-_A-Za-z0-9]{12,}\b|\b[A-Za-z0-9_-]{32,}\b/g,
  },
  {
    id: "uuid",
    label: "UUIDs",
    token: "UUID",
    pattern:
      /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
  },
]

const DEFAULT_ENABLED = new Set([
  "jwt",
  "email",
  "iban",
  "card",
  "mac",
  "ip",
  "phone",
  "key",
])

interface Replacement {
  start: number
  end: number
  original: string
  token: string
}

interface RedactionResult {
  output: string
  mapping: { placeholder: string; original: string }[]
  counts: { label: string; count: number }[]
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function redact(
  text: string,
  enabled: Set<string>,
  customTerms: string[],
): RedactionResult {
  if (!text) return { output: "", mapping: [], counts: [] }

  const claimed: Replacement[] = []
  const tokenByOriginal = new Map<string, string>()
  const counters = new Map<string, number>()
  const counts = new Map<string, number>()

  function placeholderFor(tokenName: string, original: string): string {
    const existing = tokenByOriginal.get(`${tokenName}:${original}`)
    if (existing) return existing
    const next = (counters.get(tokenName) ?? 0) + 1
    counters.set(tokenName, next)
    const placeholder = `[${tokenName}_${next}]`
    tokenByOriginal.set(`${tokenName}:${original}`, placeholder)
    return placeholder
  }

  function overlaps(start: number, end: number): boolean {
    return claimed.some((entry) => start < entry.end && end > entry.start)
  }

  const customDetectors: Detector[] = customTerms
    .map((term) => term.trim())
    .filter(Boolean)
    .map((term, index) => ({
      id: `custom-${index}`,
      label: "Custom terms",
      token: "TERM",
      pattern: new RegExp(escapeRegExp(term), "gi"),
    }))

  for (const detector of [...customDetectors, ...DETECTORS]) {
    if (!detector.id.startsWith("custom-") && !enabled.has(detector.id)) continue
    detector.pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = detector.pattern.exec(text)) !== null) {
      const value = match[0]
      if (value.length === 0) {
        detector.pattern.lastIndex += 1
        continue
      }
      if (detector.accept && !detector.accept(value)) continue
      const start = match.index
      const end = start + value.length
      if (overlaps(start, end)) continue

      claimed.push({
        start,
        end,
        original: value,
        token: placeholderFor(detector.token, value),
      })
      counts.set(detector.label, (counts.get(detector.label) ?? 0) + 1)
    }
  }

  claimed.sort((a, b) => a.start - b.start)

  let output = ""
  let cursor = 0
  for (const replacement of claimed) {
    output += text.slice(cursor, replacement.start) + replacement.token
    cursor = replacement.end
  }
  output += text.slice(cursor)

  const mapping = [...tokenByOriginal.entries()]
    .map(([key, placeholder]) => ({
      placeholder,
      original: key.slice(key.indexOf(":") + 1),
    }))
    .sort((a, b) => a.placeholder.localeCompare(b.placeholder))

  return {
    output,
    mapping,
    counts: [...counts.entries()].map(([label, count]) => ({ label, count })),
  }
}

function restore(
  text: string,
  mapping: { placeholder: string; original: string }[],
): string {
  let output = text
  /** Longest first, so [EMAIL_10] is not clobbered by replacing [EMAIL_1] inside it. */
  const ordered = [...mapping].sort((a, b) => b.placeholder.length - a.placeholder.length)
  for (const entry of ordered) {
    output = output.split(entry.placeholder).join(entry.original)
  }
  return output
}

export default function TextRedactor() {
  const [mode, setMode] = useState("redact")
  const [input, setInput] = useState("")
  const [customTerms, setCustomTerms] = useState("")
  const [enabled, setEnabled] = useState<Set<string>>(new Set(DEFAULT_ENABLED))
  const [restoreInput, setRestoreInput] = useState("")

  const result = useMemo(
    () => redact(input, enabled, customTerms.split("\n")),
    [input, enabled, customTerms],
  )

  const restored = useMemo(
    () => restore(restoreInput, result.mapping),
    [restoreInput, result.mapping],
  )

  function toggle(id: string, checked: boolean) {
    setEnabled((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)}>
        <TabsList>
          <TabsTrigger value="redact">Redact</TabsTrigger>
          <TabsTrigger value="restore">Restore</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "redact" ? (
        <>
          <div>
            <Label htmlFor="redact-input">Text to redact</Label>
            <Textarea
              id="redact-input"
              name="text"
              className="mt-1.5 min-h-48 resize-y font-mono text-sm"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Paste the log, ticket, contract, or prompt you want to clean up"
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium">Detect</legend>
            <div className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {DETECTORS.map((detector) => (
                <div key={detector.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`redact-${detector.id}`}
                    name={detector.id}
                    checked={enabled.has(detector.id)}
                    onCheckedChange={(checked) => toggle(detector.id, checked === true)}
                  />
                  <Label htmlFor={`redact-${detector.id}`} className="font-normal">
                    {detector.label}
                  </Label>
                </div>
              ))}
            </div>
          </fieldset>

          <div>
            <Label htmlFor="redact-terms">Custom terms, one per line</Label>
            <Textarea
              id="redact-terms"
              name="customTerms"
              className="mt-1.5 min-h-20 resize-y font-mono text-sm"
              value={customTerms}
              onChange={(event) => setCustomTerms(event.target.value)}
              placeholder={"Ada Lovelace\nNorthwind Traders\nProject Bluebird"}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton value={result.output} label="Copy redacted text" />
            <DownloadButton
              getBlob={() => new Blob([result.output], { type: "text/plain" })}
              filename="redacted.txt"
              disabled={!result.output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setRestoreInput("")
              }}
              disabled={!input}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>

          {result.counts.length > 0 && (
            <p className="text-muted-foreground text-sm">
              Replaced{" "}
              {result.counts
                .map((entry) => `${entry.count} ${entry.label.toLowerCase()}`)
                .join(", ")}
              .
            </p>
          )}

          <div>
            <Label htmlFor="redact-output">Redacted text</Label>
            <Textarea
              id="redact-output"
              name="redacted"
              readOnly
              className="mt-1.5 min-h-48 resize-y font-mono text-sm"
              value={result.output}
              placeholder="The redacted version appears here."
            />
          </div>

          {result.mapping.length > 0 && (
            <div className="border-border/60 overflow-x-auto rounded-lg border">
              <h2 className="border-border/60 border-b px-3 py-2 text-sm font-medium">
                Substitution table
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th scope="col" className="px-3 py-2 font-medium">
                      Placeholder
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Original value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.mapping.map((entry) => (
                    <tr key={entry.placeholder} className="border-border/60 border-t">
                      <td className="px-3 py-2 font-mono">{entry.placeholder}</td>
                      <td className="px-3 py-2 font-mono break-all">{entry.original}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            Paste a reply containing the placeholders and the real values are put back.
            The table holds {result.mapping.length}{" "}
            {result.mapping.length === 1 ? "entry" : "entries"} from the Redact tab, and
            it is cleared when you reload the page.
          </p>

          <div>
            <Label htmlFor="restore-input">Text containing placeholders</Label>
            <Textarea
              id="restore-input"
              name="restoreText"
              className="mt-1.5 min-h-48 resize-y font-mono text-sm"
              value={restoreInput}
              onChange={(event) => setRestoreInput(event.target.value)}
              placeholder="Paste the reply that still contains [EMAIL_1] and similar placeholders"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton value={restored} label="Copy restored text" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRestoreInput("")}
              disabled={!restoreInput}
            >
              <RotateCcw className="size-4" />
              Clear
            </Button>
          </div>

          <div>
            <Label htmlFor="restore-output">Restored text</Label>
            <Textarea
              id="restore-output"
              name="restored"
              readOnly
              className="mt-1.5 min-h-48 resize-y font-mono text-sm"
              value={restored}
              placeholder="The text with the real values put back appears here."
            />
          </div>
        </>
      )}
    </div>
  )
}
