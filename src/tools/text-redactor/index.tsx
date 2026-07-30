import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
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
import { DownloadButton } from "@/components/tool/DownloadButton"

interface Detector {
  id: string
  label: string
  placeholder: string
  pattern: RegExp
  /** Extra check applied to a match before it is redacted. */
  accept?: (match: string) => boolean
}

function passesLuhn(candidate: string): boolean {
  const digits = candidate.replace(/\D/g, "")
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let value = digits.charCodeAt(i) - 48
    if (double) {
      value *= 2
      if (value > 9) value -= 9
    }
    sum += value
    double = !double
  }
  return sum % 10 === 0
}

const TLD = /^[A-Za-z]{2,}$/

/** True when the part after the @ is dot-separated labels ending in a TLD. */
function hasEmailDomainShape(candidate: string): boolean {
  const labels = candidate.slice(candidate.indexOf("@") + 1).split(".")
  return (
    labels.length >= 2 &&
    labels.every((label) => label.length > 0) &&
    TLD.test(labels[labels.length - 1])
  )
}

/**
 * Order matters: a JWT and a URL with credentials both contain substrings a
 * later detector would match on its own, so the most specific shapes run
 * first and the generic token detector runs last.
 */
const DETECTORS: Detector[] = [
  {
    id: "jwt",
    label: "JSON Web Tokens",
    placeholder: "JWT",
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g,
  },
  {
    id: "url-credentials",
    label: "URLs with credentials",
    placeholder: "URL_CREDENTIALS",
    pattern: /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/gi,
  },
  {
    id: "email",
    label: "Email addresses",
    placeholder: "EMAIL",
    // The domain is matched as one greedy run rather than as
    // labels-then-dot-then-TLD. Writing the dot structure into the pattern
    // makes it ambiguous against a dot-containing character class, which
    // backtracks quadratically on pasted text like "a.a.a.a..."; the shape
    // check moves to `accept`, where it is a linear scan.
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\b/g,
    accept: hasEmailDomainShape,
  },
  {
    id: "provider-key",
    label: "Provider API keys",
    placeholder: "API_KEY",
    pattern:
      /\b(?:sk-[A-Za-z0-9_-]{16,}|pk_(?:live|test)_[A-Za-z0-9]{16,}|sk_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|glpat-[A-Za-z0-9_-]{16,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[A-Za-z0-9_-]{30,}|A(?:KIA|SIA)[0-9A-Z]{16})\b/g,
  },
  {
    id: "assignment",
    label: "Secret assignments",
    placeholder: "SECRET",
    pattern:
      /((?:api[_-]?key|secret|password|passwd|token|auth|access[_-]?key|private[_-]?key)\s*[=:]\s*)(?:"[^"\n]+"|'[^'\n]+'|[^\s,;"']+)/gi,
  },
  {
    id: "card",
    label: "Card numbers",
    placeholder: "CARD",
    pattern: /\b(?:\d[ -]?){12,18}\d\b/g,
    accept: passesLuhn,
  },
  {
    id: "ipv4",
    label: "IPv4 addresses",
    placeholder: "IPV4",
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    accept: (match) => match.split(".").every((part) => Number(part) <= 255),
  },
  {
    id: "ipv6",
    label: "IPv6 addresses",
    placeholder: "IPV6",
    pattern: /\b(?:[0-9A-Fa-f]{1,4}:){2,7}(?::|[0-9A-Fa-f]{1,4})\b/g,
  },
  {
    id: "mac",
    label: "MAC addresses",
    placeholder: "MAC",
    pattern: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
  },
  {
    id: "phone",
    label: "Phone numbers",
    placeholder: "PHONE",
    pattern: /(?:\+\d{1,3}[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/g,
  },
  {
    id: "uuid",
    label: "UUIDs",
    placeholder: "UUID",
    pattern:
      /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
  },
  {
    id: "home-path",
    label: "Home directory paths",
    placeholder: "USER",
    pattern: /(?:\/(?:home|Users)\/|[A-Z]:\\Users\\)([^\s/\\:*?"<>|]+)/g,
  },
  {
    id: "long-token",
    label: "Long hex tokens",
    placeholder: "TOKEN",
    pattern: /\b[0-9a-f]{32,}\b/g,
  },
]

const MODES = [
  { value: "numbered", label: "Numbered placeholder, for example [EMAIL_1]" },
  { value: "labelled", label: "Plain label, for example [EMAIL]" },
  { value: "mask", label: "Fixed mask, for example [REDACTED]" },
]

const DEFAULT_ENABLED = DETECTORS.map((detector) => detector.id)

interface Result {
  output: string
  counts: Record<string, number>
}

function redact(input: string, enabled: string[], mode: string): Result {
  const counts: Record<string, number> = {}
  let output = input

  for (const detector of DETECTORS) {
    if (!enabled.includes(detector.id)) continue

    const seen = new Map<string, number>()
    let matches = 0

    output = output.replace(detector.pattern, (match, ...groups) => {
      // The secret-assignment and home-path detectors capture a prefix that
      // should survive redaction, so only the remainder is replaced.
      const keepPrefix = detector.id === "assignment" ? String(groups[0] ?? "") : ""
      const target = detector.id === "home-path" ? String(groups[0] ?? match) : match

      if (detector.accept && !detector.accept(target)) return match

      matches++
      let token: string
      if (mode === "mask") {
        token = "[REDACTED]"
      } else if (mode === "labelled") {
        token = `[${detector.placeholder}]`
      } else {
        if (!seen.has(target)) seen.set(target, seen.size + 1)
        token = `[${detector.placeholder}_${seen.get(target)}]`
      }

      if (detector.id === "home-path") return match.replace(target, token)
      return `${keepPrefix}${token}`
    })

    if (matches > 0) counts[detector.id] = matches
  }

  return { output, counts }
}

export default function TextRedactor() {
  const [input, setInput] = useState("")
  const [enabled, setEnabled] = useState<string[]>(DEFAULT_ENABLED)
  const [mode, setMode] = useState("numbered")

  const { output, counts } = useMemo(
    () => redact(input, enabled, mode),
    [input, enabled, mode],
  )

  const totalMatches = Object.values(counts).reduce((sum, value) => sum + value, 0)
  const noDetectors = enabled.length === 0

  function toggle(id: string, checked: boolean) {
    setEnabled((current) =>
      checked ? [...current, id] : current.filter((entry) => entry !== id),
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="redactor-input">Text to redact</Label>
        <Textarea
          id="redactor-input"
          name="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            "2026-07-30 ERROR user ada@example.com from 192.168.1.42\napi_key=sk-live-xxxxxxxxxxxxxxxxxxxxxx"
          }
          className="mt-1.5 min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div>
        <Label htmlFor="redactor-mode">Replacement style</Label>
        <Select value={mode} onValueChange={(next) => next && setMode(next as string)}>
          <SelectTrigger id="redactor-mode" className="mt-1.5 w-full sm:max-w-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset className="border-border/60 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Detectors</legend>
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {DETECTORS.map((detector) => (
            <div key={detector.id} className="flex items-center gap-2">
              <Switch
                id={`redactor-${detector.id}`}
                name={detector.id}
                checked={enabled.includes(detector.id)}
                onCheckedChange={(checked) => toggle(detector.id, checked)}
              />
              <Label
                htmlFor={`redactor-${detector.id}`}
                className="font-normal wrap-anywhere"
              >
                {detector.label}
                {counts[detector.id] ? (
                  <span className="text-muted-foreground ml-1.5 text-xs tabular-nums">
                    {counts[detector.id]}
                  </span>
                ) : null}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      {noDetectors && (
        <p className="text-destructive text-sm">
          Every detector is switched off, so nothing will be replaced. Switch at least one
          on.
        </p>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="redactor-output">
            Redacted text
            <span className="text-muted-foreground ml-2 text-xs font-normal tabular-nums">
              {totalMatches} {totalMatches === 1 ? "replacement" : "replacements"}
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={output} label="Copy redacted" />
            <DownloadButton
              getBlob={() => new Blob([output], { type: "text/plain" })}
              filename="redacted.txt"
              disabled={!output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setEnabled(DEFAULT_ENABLED)
                setMode("numbered")
              }}
              disabled={!input}
            >
              <Trash2 className="size-4" />
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="redactor-output"
          name="output"
          value={output}
          readOnly
          className="min-h-44 resize-y font-mono text-sm"
          placeholder="Redacted text appears here"
        />
      </div>
    </div>
  )
}
