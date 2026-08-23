import { useMemo, useState } from "react"
import { CircleAlert, CircleCheck, CircleX, RotateCcw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"

const EXAMPLE = `HTTP/2 200
server: nginx/1.24.0
content-type: text/html; charset=utf-8
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
referrer-policy: strict-origin-when-cross-origin
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'
x-powered-by: Express`

type Status = "pass" | "weak" | "missing"

interface Finding {
  header: string
  status: Status
  weight: number
  earned: number
  detail: string
}

/** Headers whose presence tells an attacker what software and version to target. */
const DISCLOSURE_HEADERS = [
  "server",
  "x-powered-by",
  "x-aspnet-version",
  "x-aspnetmvc-version",
]

function parseHeaders(text: string): Map<string, string> {
  const headers = new Map<string, string>()
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line === "" || /^HTTP\/[\d.]+\s/i.test(line) || /^:status/i.test(line)) continue
    const separator = line.indexOf(":")
    if (separator <= 0) continue
    const name = line.slice(0, separator).trim().toLowerCase()
    const value = line.slice(separator + 1).trim()
    const existing = headers.get(name)
    headers.set(name, existing ? `${existing}, ${value}` : value)
  }
  return headers
}

function checkCsp(value: string | undefined): Omit<Finding, "header" | "weight"> {
  if (!value) {
    return {
      status: "missing",
      earned: 0,
      detail:
        "No Content-Security-Policy. This is the single header that limits which scripts, styles, and frames a page may load.",
    }
  }
  const lowered = value.toLowerCase()
  const problems: string[] = []
  if (lowered.includes("unsafe-inline")) problems.push("allows unsafe-inline")
  if (lowered.includes("unsafe-eval")) problems.push("allows unsafe-eval")
  if (/(default|script)-src[^;]*\*(\s|;|$)/.test(lowered)) {
    problems.push("uses a wildcard source")
  }
  if (!lowered.includes("default-src") && !lowered.includes("script-src")) {
    problems.push("sets neither default-src nor script-src")
  }
  if (problems.length > 0) {
    return {
      status: "weak",
      earned: 0.5,
      detail: `A policy is present but it ${problems.join(", ")}, which permits most of what CSP is meant to stop.`,
    }
  }
  return {
    status: "pass",
    earned: 1,
    detail: "A policy is present with no wildcard or unsafe source.",
  }
}

function checkHsts(value: string | undefined): Omit<Finding, "header" | "weight"> {
  if (!value) {
    return {
      status: "missing",
      earned: 0,
      detail:
        "No Strict-Transport-Security, so a first request over plain HTTP can still be intercepted.",
    }
  }
  const maxAge = /max-age\s*=\s*(\d+)/i.exec(value)
  if (!maxAge) {
    return {
      status: "weak",
      earned: 0.5,
      detail: "The header is present but sets no max-age.",
    }
  }
  const seconds = Number(maxAge[1])
  if (seconds < 15552000) {
    return {
      status: "weak",
      earned: 0.5,
      detail: `max-age is ${seconds} seconds. Preload lists and most guidance expect at least 15552000 (180 days).`,
    }
  }
  const subdomains = /includeSubDomains/i.test(value)
  return {
    status: "pass",
    earned: 1,
    detail: subdomains
      ? `max-age is ${seconds} seconds and covers subdomains.`
      : `max-age is ${seconds} seconds, but includeSubDomains is not set, so subdomains are unprotected.`,
  }
}

function checkFraming(
  frameOptions: string | undefined,
  csp: string | undefined,
): Omit<Finding, "header" | "weight"> {
  if (csp && /frame-ancestors/i.test(csp)) {
    return {
      status: "pass",
      earned: 1,
      detail:
        "CSP sets frame-ancestors, which current browsers prefer over X-Frame-Options.",
    }
  }
  if (!frameOptions) {
    return {
      status: "missing",
      earned: 0,
      detail:
        "Neither X-Frame-Options nor a CSP frame-ancestors directive is set, so the page can be framed for clickjacking.",
    }
  }
  if (/^(deny|sameorigin)$/i.test(frameOptions.trim())) {
    return { status: "pass", earned: 1, detail: `Set to ${frameOptions.trim()}.` }
  }
  return {
    status: "weak",
    earned: 0.5,
    detail: `"${frameOptions}" is not a value browsers honour. Only DENY and SAMEORIGIN are supported.`,
  }
}

function checkExact(
  value: string | undefined,
  expected: string,
  missingDetail: string,
): Omit<Finding, "header" | "weight"> {
  if (!value) return { status: "missing", earned: 0, detail: missingDetail }
  if (value.trim().toLowerCase() === expected) {
    return { status: "pass", earned: 1, detail: `Set to ${expected}.` }
  }
  return {
    status: "weak",
    earned: 0.5,
    detail: `"${value}" is not the expected value. Only ${expected} has any effect.`,
  }
}

const SAFE_REFERRER_POLICIES = [
  "no-referrer",
  "same-origin",
  "strict-origin",
  "strict-origin-when-cross-origin",
]

function checkReferrerPolicy(
  value: string | undefined,
): Omit<Finding, "header" | "weight"> {
  if (!value) {
    return {
      status: "missing",
      earned: 0,
      detail:
        "No Referrer-Policy, so full URLs including query strings may be sent to other origins.",
    }
  }
  const last = value.split(",").pop()?.trim().toLowerCase() ?? ""
  if (SAFE_REFERRER_POLICIES.includes(last)) {
    return { status: "pass", earned: 1, detail: `Set to ${last}.` }
  }
  return {
    status: "weak",
    earned: 0.5,
    detail: `"${last}" leaks more of the URL than necessary. Prefer strict-origin-when-cross-origin.`,
  }
}

function checkPresence(
  value: string | undefined,
  missingDetail: string,
): Omit<Finding, "header" | "weight"> {
  if (!value) return { status: "missing", earned: 0, detail: missingDetail }
  return { status: "pass", earned: 1, detail: `Set to ${value}.` }
}

interface Analysis {
  findings: Finding[]
  disclosures: { header: string; value: string }[]
  score: number
  grade: string
  headerCount: number
}

function grade(score: number): string {
  if (score >= 95) return "A+"
  if (score >= 85) return "A"
  if (score >= 70) return "B"
  if (score >= 55) return "C"
  if (score >= 40) return "D"
  return "F"
}

function analyse(text: string): Analysis | null {
  const headers = parseHeaders(text)
  if (headers.size === 0) return null

  const csp = headers.get("content-security-policy")
  const specs: {
    header: string
    weight: number
    result: Omit<Finding, "header" | "weight">
  }[] = [
    { header: "Content-Security-Policy", weight: 25, result: checkCsp(csp) },
    {
      header: "Strict-Transport-Security",
      weight: 20,
      result: checkHsts(headers.get("strict-transport-security")),
    },
    {
      header: "X-Content-Type-Options",
      weight: 15,
      result: checkExact(
        headers.get("x-content-type-options"),
        "nosniff",
        "No X-Content-Type-Options, so browsers may guess a response's type and execute it as script.",
      ),
    },
    {
      header: "X-Frame-Options",
      weight: 15,
      result: checkFraming(headers.get("x-frame-options"), csp),
    },
    {
      header: "Referrer-Policy",
      weight: 10,
      result: checkReferrerPolicy(headers.get("referrer-policy")),
    },
    {
      header: "Permissions-Policy",
      weight: 10,
      result: checkPresence(
        headers.get("permissions-policy"),
        "No Permissions-Policy, so embedded content may request camera, microphone, and geolocation access.",
      ),
    },
    {
      header: "Cross-Origin-Opener-Policy",
      weight: 5,
      result: checkPresence(
        headers.get("cross-origin-opener-policy"),
        "No Cross-Origin-Opener-Policy, so a window this page opens keeps a reference back to it.",
      ),
    },
  ]

  const findings = specs.map(({ header, weight, result }) => ({
    header,
    weight,
    ...result,
    earned: Math.round(result.earned * weight),
  }))

  const disclosures = DISCLOSURE_HEADERS.filter((name) => headers.has(name)).map(
    (name) => ({
      header: name,
      value: headers.get(name) ?? "",
    }),
  )

  const earned = findings.reduce((total, finding) => total + finding.earned, 0)
  const score = Math.max(0, earned - disclosures.length * 5)

  return { findings, disclosures, score, grade: grade(score), headerCount: headers.size }
}

function toReport(analysis: Analysis): string {
  const lines = [
    `Security header review: ${analysis.grade} (${analysis.score} of 100)`,
    "",
    ...analysis.findings.map(
      (finding) =>
        `[${finding.status}] ${finding.header} (${finding.earned}/${finding.weight}): ${finding.detail}`,
    ),
  ]
  if (analysis.disclosures.length > 0) {
    lines.push("", "Version disclosure:")
    for (const disclosure of analysis.disclosures) {
      lines.push(`- ${disclosure.header}: ${disclosure.value}`)
    }
  }
  return `${lines.join("\n")}\n`
}

const STATUS_ICON = {
  pass: CircleCheck,
  weak: CircleAlert,
  missing: CircleX,
}

const STATUS_STYLE: Record<Status, string> = {
  pass: "text-emerald-600 dark:text-emerald-400",
  weak: "text-amber-600 dark:text-amber-400",
  missing: "text-destructive",
}

export default function SecurityHeadersAnalyzer() {
  const [input, setInput] = useState("")
  const analysis = useMemo(() => analyse(input), [input])

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="headers-input">Response headers</Label>
        <Textarea
          id="headers-input"
          name="headers"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste the output of curl -I, or the response headers copied from a browser network panel."
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setInput(EXAMPLE)}>
          Load example
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
        {analysis && <CopyButton value={toReport(analysis)} label="Copy report" />}
      </div>

      {input.trim() !== "" && !analysis && (
        <p className="text-muted-foreground text-sm">
          No headers were recognised. Each line should look like Name: value.
        </p>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
            <div>
              <p className="text-3xl font-semibold tabular-nums">{analysis.grade}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {analysis.score} of 100 across {analysis.findings.length} checks
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              {analysis.headerCount} headers read
            </p>
          </div>

          <ul className="border-border/60 divide-border/60 divide-y rounded-xl border">
            {analysis.findings.map((finding) => {
              const Icon = STATUS_ICON[finding.status]
              return (
                <li key={finding.header} className="flex items-start gap-3 p-3">
                  <Icon
                    className={`mt-0.5 size-4 shrink-0 ${STATUS_STYLE[finding.status]}`}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {finding.header}{" "}
                      <span className="text-muted-foreground font-normal tabular-nums">
                        {finding.earned} of {finding.weight}
                      </span>
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {finding.detail}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>

          {analysis.disclosures.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
              <p className="font-medium">
                Version disclosure, 5 points deducted for each
              </p>
              <ul className="mt-2 space-y-1.5">
                {analysis.disclosures.map((disclosure) => (
                  <li key={disclosure.header} className="font-mono break-all">
                    {disclosure.header}: {disclosure.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
