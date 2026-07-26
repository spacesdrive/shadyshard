import { useMemo, useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldQuestion,
  XCircle,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/tool/CopyButton"

interface Header {
  name: string
  value: string
}

function unfoldHeaders(source: string): Header[] {
  const headers: Header[] = []
  const lines = source.split(/\r?\n/)

  for (const line of lines) {
    // A blank line ends the header block; anything after it is the body.
    if (!line.trim()) break

    if (/^[ \t]/.test(line) && headers.length > 0) {
      headers[headers.length - 1].value += ` ${line.trim()}`
      continue
    }

    const separator = line.indexOf(":")
    if (separator === -1) continue
    headers.push({
      name: line.slice(0, separator).trim(),
      value: line.slice(separator + 1).trim(),
    })
  }

  return headers
}

function decodeBytes(bytes: Uint8Array, charset: string): string {
  try {
    return new TextDecoder(charset).decode(bytes)
  } catch {
    return new TextDecoder("utf-8").decode(bytes)
  }
}

function decodeEncodedWords(value: string): string {
  return value.replace(
    /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g,
    (match, charset: string, encoding: string, payload: string) => {
      if (encoding.toUpperCase() === "B") {
        try {
          const binary = atob(payload)
          const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
          return decodeBytes(bytes, charset)
        } catch {
          return match
        }
      }

      const bytes: number[] = []
      const text = payload.replace(/_/g, " ")
      for (let index = 0; index < text.length; index++) {
        if (text[index] === "=" && index + 2 < text.length) {
          const hex = text.slice(index + 1, index + 3)
          if (/^[0-9a-fA-F]{2}$/.test(hex)) {
            bytes.push(parseInt(hex, 16))
            index += 2
            continue
          }
        }
        bytes.push(text.charCodeAt(index))
      }
      return decodeBytes(Uint8Array.from(bytes), charset)
    },
  )
}

interface Hop {
  index: number
  from: string
  by: string
  with: string
  date: Date | null
  delaySeconds: number | null
  raw: string
}

function extractClause(value: string, keyword: string): string {
  const pattern = new RegExp(
    `(?:^|\\s)${keyword}\\s+([^;]+?)(?=\\s+(?:from|by|with|via|id|for)\\s|;|$)`,
    "i",
  )
  const match = value.match(pattern)
  return match ? match[1].trim() : ""
}

function buildHops(headers: Header[]): Hop[] {
  const received = headers
    .filter((header) => header.name.toLowerCase() === "received")
    .map((header) => header.value)
    .reverse()

  const hops: Hop[] = received.map((raw, index) => {
    const semicolon = raw.lastIndexOf(";")
    const datePart = semicolon === -1 ? "" : raw.slice(semicolon + 1).trim()
    const parsed = datePart ? new Date(datePart) : null
    return {
      index: index + 1,
      from: extractClause(raw, "from"),
      by: extractClause(raw, "by"),
      with: extractClause(raw, "with"),
      date: parsed && !Number.isNaN(parsed.getTime()) ? parsed : null,
      delaySeconds: null,
      raw,
    }
  })

  for (let index = 1; index < hops.length; index++) {
    const previous = hops[index - 1].date
    const current = hops[index].date
    if (previous && current) {
      hops[index].delaySeconds = Math.round(
        (current.getTime() - previous.getTime()) / 1000,
      )
    }
  }

  return hops
}

type AuthVerdict = "pass" | "fail" | "softfail" | "neutral" | "none" | "unknown"

interface AuthResult {
  mechanism: string
  verdict: AuthVerdict
  detail: string
}

function normalizeVerdict(value: string): AuthVerdict {
  const lower = value.toLowerCase()
  if (lower === "pass" || lower === "bestguesspass") return "pass"
  if (lower === "fail" || lower === "permerror" || lower === "hardfail") return "fail"
  if (lower === "softfail" || lower === "temperror") return "softfail"
  if (lower === "neutral") return "neutral"
  if (lower === "none") return "none"
  return "unknown"
}

function buildAuthResults(headers: Header[]): AuthResult[] {
  const sources = headers
    .filter((header) => {
      const name = header.name.toLowerCase()
      return name === "authentication-results" || name === "arc-authentication-results"
    })
    .map((header) => header.value)

  const results = new Map<string, AuthResult>()
  for (const source of sources) {
    for (const mechanism of ["spf", "dkim", "dmarc", "compauth"]) {
      const match = source.match(new RegExp(`\\b${mechanism}=([a-z]+)([^;]*)`, "i"))
      if (!match || results.has(mechanism)) continue
      results.set(mechanism, {
        mechanism: mechanism === "compauth" ? "compauth" : mechanism.toUpperCase(),
        verdict: normalizeVerdict(match[1]),
        detail: match[2].trim(),
      })
    }
  }

  const receivedSpf = headers.find(
    (header) => header.name.toLowerCase() === "received-spf",
  )
  if (receivedSpf && !results.has("spf")) {
    const verdict = receivedSpf.value.trim().split(/\s+/)[0] ?? ""
    results.set("spf", {
      mechanism: "SPF",
      verdict: normalizeVerdict(verdict),
      detail: receivedSpf.value.slice(verdict.length).trim(),
    })
  }

  return [...results.values()]
}

const VERDICT_STYLES: Record<AuthVerdict, string> = {
  pass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  fail: "border-destructive/30 bg-destructive/10 text-destructive",
  softfail: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  neutral: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  none: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  unknown: "",
}

function domainOf(value: string): string {
  const match = value.match(/@([A-Za-z0-9.-]+)/)
  return match ? match[1].toLowerCase().replace(/[.>]+$/, "") : ""
}

function formatDelay(seconds: number): string {
  if (seconds < 0) return `${seconds} s (clock skew between servers)`
  if (seconds < 60) return `${seconds} s`
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return remainder ? `${minutes} min ${remainder} s` : `${minutes} min`
}

const SUMMARY_FIELDS = [
  "From",
  "Reply-To",
  "Return-Path",
  "To",
  "Subject",
  "Date",
  "Message-ID",
]

export default function EmailHeaderAnalyzer() {
  const [raw, setRaw] = useState("")

  const analysis = useMemo(() => {
    if (!raw.trim()) return null

    const headers = unfoldHeaders(raw)
    if (headers.length === 0) {
      return {
        error:
          'No headers found. Paste the raw header block, where each line looks like "Header-Name: value".',
      } as const
    }

    const find = (name: string) =>
      headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value ??
      ""

    const from = decodeEncodedWords(find("From"))
    const replyTo = decodeEncodedWords(find("Reply-To"))
    const returnPath = find("Return-Path")

    const warnings: string[] = []
    const fromDomain = domainOf(from)
    const returnDomain = domainOf(returnPath)
    const replyDomain = domainOf(replyTo)

    if (fromDomain && returnDomain && fromDomain !== returnDomain) {
      warnings.push(
        `The visible From domain (${fromDomain}) does not match the Return-Path domain (${returnDomain}). This is normal for mailing lists and marketing platforms, but it is also what a spoofed message looks like, so check the DMARC result.`,
      )
    }
    if (fromDomain && replyDomain && fromDomain !== replyDomain) {
      warnings.push(
        `Replies would go to ${replyDomain} rather than ${fromDomain}. Redirecting replies to a different domain is a common tactic in business email compromise.`,
      )
    }

    const hops = buildHops(headers)
    const auth = buildAuthResults(headers)
    if (auth.length === 0) {
      warnings.push(
        "No Authentication-Results or Received-SPF header is present, so this message carries no record of an SPF, DKIM, or DMARC check. Headers copied from a partially forwarded message often lose these.",
      )
    }

    const first = hops[0]?.date
    const last = hops[hops.length - 1]?.date
    const totalSeconds =
      first && last ? Math.round((last.getTime() - first.getTime()) / 1000) : null

    return {
      headers,
      hops,
      auth,
      warnings,
      totalSeconds,
      summary: SUMMARY_FIELDS.map((name) => ({
        name,
        value: decodeEncodedWords(find(name)),
      })).filter((entry) => entry.value),
    } as const
  }, [raw])

  const allHeadersText =
    analysis && !("error" in analysis)
      ? analysis.headers.map((header) => `${header.name}: ${header.value}`).join("\n")
      : ""

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="email-header-input">Raw email headers</Label>
        <Textarea
          id="email-header-input"
          name="headers"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={
            "Received: from mail.example.com (mail.example.com [203.0.113.10])\n        by mx.example.org with ESMTPS id abc123;\n        Tue, 21 Jul 2026 09:14:02 +0000\nAuthentication-Results: mx.example.org; spf=pass; dkim=pass; dmarc=pass\nFrom: Sender Name <sender@example.com>\nSubject: Quarterly report"
          }
          className="mt-1.5 min-h-56 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRaw("")}
          disabled={!raw}
        >
          <RotateCcw className="size-4" />
          Clear
        </Button>
        {allHeadersText && (
          <CopyButton value={allHeadersText} label="Copy parsed headers" />
        )}
      </div>

      {analysis && "error" in analysis && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{analysis.error}</span>
        </div>
      )}

      {analysis && !("error" in analysis) && (
        <div className="space-y-5">
          <section className="space-y-2">
            <h3 className="text-sm font-medium">Authentication</h3>
            {analysis.auth.length === 0 ? (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <ShieldQuestion className="size-4 shrink-0" />
                No authentication results recorded in these headers.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {analysis.auth.map((result) => (
                  <li key={result.mechanism}>
                    <Badge
                      variant="outline"
                      className={`${VERDICT_STYLES[result.verdict]} gap-1.5`}
                    >
                      {result.verdict === "pass" ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : result.verdict === "fail" ? (
                        <XCircle className="size-3.5" />
                      ) : (
                        <AlertTriangle className="size-3.5" />
                      )}
                      {result.mechanism}: {result.verdict}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {analysis.warnings.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Things worth checking</h3>
              <ul className="space-y-2">
                {analysis.warnings.map((warning, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {analysis.summary.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Message</h3>
              <dl className="border-border/60 divide-border/60 divide-y rounded-lg border text-sm">
                {analysis.summary.map((entry) => (
                  <div
                    key={entry.name}
                    className="grid gap-1 p-3 sm:grid-cols-[10rem_1fr]"
                  >
                    <dt className="text-muted-foreground">{entry.name}</dt>
                    <dd className="font-mono text-xs break-all">{entry.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="space-y-2">
            <h3 className="text-sm font-medium">
              Delivery path{" "}
              {analysis.totalSeconds !== null && (
                <span className="text-muted-foreground font-normal">
                  ({formatDelay(analysis.totalSeconds)} total)
                </span>
              )}
            </h3>
            {analysis.hops.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No Received headers found, so the delivery path cannot be reconstructed.
              </p>
            ) : (
              <ol className="space-y-2">
                {analysis.hops.map((hop) => (
                  <li
                    key={hop.index}
                    className="border-border/60 rounded-lg border p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Hop {hop.index}</Badge>
                      {hop.delaySeconds !== null && (
                        <span className="text-muted-foreground text-xs">
                          +{formatDelay(hop.delaySeconds)}
                        </span>
                      )}
                      {hop.date && (
                        <span className="text-muted-foreground text-xs">
                          {hop.date.toISOString()}
                        </span>
                      )}
                    </div>
                    <dl className="mt-2 grid gap-1 font-mono text-xs sm:grid-cols-[4rem_1fr]">
                      {hop.from && (
                        <>
                          <dt className="text-muted-foreground">from</dt>
                          <dd className="break-all">{hop.from}</dd>
                        </>
                      )}
                      {hop.by && (
                        <>
                          <dt className="text-muted-foreground">by</dt>
                          <dd className="break-all">{hop.by}</dd>
                        </>
                      )}
                      {hop.with && (
                        <>
                          <dt className="text-muted-foreground">with</dt>
                          <dd className="break-all">{hop.with}</dd>
                        </>
                      )}
                    </dl>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium">
              All headers ({analysis.headers.length})
            </h3>
            <div className="border-border/60 divide-border/60 max-h-96 divide-y overflow-auto rounded-lg border text-sm">
              {analysis.headers.map((header, index) => (
                <div key={index} className="grid gap-1 p-3 sm:grid-cols-[12rem_1fr]">
                  <span className="text-muted-foreground font-mono text-xs">
                    {header.name}
                  </span>
                  <span className="font-mono text-xs break-all">{header.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
