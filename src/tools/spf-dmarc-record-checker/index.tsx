import { useMemo, useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/tool/CopyButton"

type Severity = "error" | "warning" | "info"

interface Issue {
  severity: Severity
  message: string
}

interface Term {
  text: string
  label: string
  explanation: string
  costsLookup: boolean
}

const SPF_LOOKUP_LIMIT = 10

const QUALIFIER_MEANINGS: Record<string, string> = {
  "+": "Pass. Mail from a matching sender is authorised.",
  "-": "Fail. Mail from a matching sender should be rejected.",
  "~": "Soft fail. Mail from a matching sender should be accepted but marked as suspicious.",
  "?": "Neutral. No statement is made about a matching sender.",
}

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

function isValidIpv4(value: string): boolean {
  const match = value.match(IPV4_PATTERN)
  if (!match) return false
  return match
    .slice(1)
    .every((part) => Number(part) <= 255 && String(Number(part)) === part)
}

function isValidIpv6(value: string): boolean {
  return /^[0-9a-fA-F:]+$/.test(value) && value.includes(":") && !value.includes(":::")
}

function checkSpf(record: string): { terms: Term[]; issues: Issue[]; lookups: number } {
  const issues: Issue[] = []
  const terms: Term[] = []
  let lookups = 0

  const parts = record.trim().split(/\s+/)
  if (parts[0].toLowerCase() !== "v=spf1") {
    issues.push({
      severity: "error",
      message: 'An SPF record must begin with "v=spf1". Receivers ignore anything else.',
    })
  }
  terms.push({
    text: parts[0],
    label: "version",
    explanation: "Declares this TXT record as an SPF version 1 policy.",
    costsLookup: false,
  })

  let seenAll = false
  let hasAll = false
  let hasRedirect = false

  for (const part of parts.slice(1)) {
    if (seenAll) {
      issues.push({
        severity: "warning",
        message: `"${part}" comes after the all mechanism, so it is never evaluated. Move it before all or remove it.`,
      })
    }

    const modifier = part.match(/^([a-zA-Z][a-zA-Z0-9_.-]*)=(.*)$/)
    if (modifier) {
      const name = modifier[1].toLowerCase()
      const value = modifier[2]
      if (name === "redirect") {
        hasRedirect = true
        lookups++
        terms.push({
          text: part,
          label: "redirect modifier",
          explanation: `Hands evaluation over to the SPF record published at ${value || "(no domain given)"}. It applies only when no mechanism matched, and it is ignored entirely if the record also has an all mechanism. Costs one DNS lookup.`,
          costsLookup: true,
        })
        if (!value) {
          issues.push({ severity: "error", message: "redirect= has no domain after it." })
        }
      } else if (name === "exp") {
        terms.push({
          text: part,
          label: "exp modifier",
          explanation: `Points at a TXT record at ${value || "(no domain given)"} holding the explanation text a receiver may return when mail fails. It does not count against the lookup limit.`,
          costsLookup: false,
        })
      } else {
        terms.push({
          text: part,
          label: "unknown modifier",
          explanation:
            "Not a modifier defined by RFC 7208. Receivers must ignore it, so it has no effect.",
          costsLookup: false,
        })
        issues.push({
          severity: "warning",
          message: `"${name}=" is not a recognised SPF modifier and will be ignored.`,
        })
      }
      continue
    }

    const qualifierChar = "+-~?".includes(part[0]) ? part[0] : "+"
    const body = "+-~?".includes(part[0]) ? part.slice(1) : part
    const [nameRaw, argument = ""] = body.split(/:(.*)/, 2)
    const name = nameRaw.split("/")[0].toLowerCase()
    const qualifierNote = QUALIFIER_MEANINGS[qualifierChar]

    if (name === "all") {
      seenAll = true
      hasAll = true
      terms.push({
        text: part,
        label: "all mechanism",
        explanation: `Matches every sender that no earlier mechanism matched. ${qualifierNote}`,
        costsLookup: false,
      })
      if (qualifierChar === "+") {
        issues.push({
          severity: "error",
          message:
            "+all authorises every server on the internet to send as your domain, which makes the record worse than having none. Use -all or ~all.",
        })
      } else if (qualifierChar === "?") {
        issues.push({
          severity: "warning",
          message:
            "?all makes no statement about unmatched senders, so the record provides no protection against spoofing. Use ~all while testing and -all once you are confident.",
        })
      }
      continue
    }

    if (name === "include" || name === "exists") {
      lookups++
      terms.push({
        text: part,
        label: `${name} mechanism`,
        explanation:
          name === "include"
            ? `Evaluates the SPF record of ${argument || "(no domain given)"} and matches if that record passes. ${qualifierNote} Costs one DNS lookup, plus every lookup inside that record.`
            : `Matches if a DNS A record exists for ${argument || "(no domain given)"} after macro expansion. ${qualifierNote} Costs one DNS lookup.`,
        costsLookup: true,
      })
      if (!argument) {
        issues.push({
          severity: "error",
          message: `${name}: has no domain after the colon.`,
        })
      }
      continue
    }

    if (name === "a" || name === "mx") {
      lookups++
      terms.push({
        text: part,
        label: `${name} mechanism`,
        explanation:
          name === "a"
            ? `Matches when the sending IP address is one of the A or AAAA records of ${argument || "this domain"}. ${qualifierNote} Costs one DNS lookup.`
            : `Matches when the sending IP address belongs to a mail exchanger of ${argument || "this domain"}. ${qualifierNote} Costs one DNS lookup, plus one for each MX host resolved.`,
        costsLookup: true,
      })
      continue
    }

    if (name === "ptr") {
      lookups++
      terms.push({
        text: part,
        label: "ptr mechanism",
        explanation:
          "Matches by reverse DNS lookup of the sending IP address. RFC 7208 advises against using it.",
        costsLookup: true,
      })
      issues.push({
        severity: "warning",
        message:
          "The ptr mechanism is slow, unreliable, and deprecated by RFC 7208. Replace it with ip4, ip6, a, or include.",
      })
      continue
    }

    if (name === "ip4" || name === "ip6") {
      const [address, prefix] = argument.split("/")
      const valid = name === "ip4" ? isValidIpv4(address) : isValidIpv6(address)
      terms.push({
        text: part,
        label: `${name} mechanism`,
        explanation: `Matches senders in ${argument || "(no address given)"}. ${qualifierNote} Costs no DNS lookup, which makes these the cheapest mechanisms to use.`,
        costsLookup: false,
      })
      if (!valid) {
        issues.push({
          severity: "error",
          message: `"${part}" does not contain a valid ${name === "ip4" ? "IPv4" : "IPv6"} address.`,
        })
      } else if (prefix !== undefined) {
        const max = name === "ip4" ? 32 : 128
        const size = Number(prefix)
        if (!Number.isInteger(size) || size < 0 || size > max) {
          issues.push({
            severity: "error",
            message: `"${part}" has a prefix length outside the valid range of 0 to ${max}.`,
          })
        }
      }
      continue
    }

    terms.push({
      text: part,
      label: "unrecognised term",
      explanation:
        "Not a mechanism or modifier defined by RFC 7208. A receiver treats the whole record as a permanent error.",
      costsLookup: false,
    })
    issues.push({
      severity: "error",
      message: `"${part}" is not a valid SPF term, which makes the entire record a permanent error.`,
    })
  }

  if (!hasAll && !hasRedirect) {
    issues.push({
      severity: "warning",
      message:
        "The record has neither an all mechanism nor a redirect modifier, so unmatched senders get a neutral result and the record protects nothing.",
    })
  }

  if (lookups > SPF_LOOKUP_LIMIT) {
    issues.push({
      severity: "error",
      message: `This record needs at least ${lookups} DNS lookups, over the limit of ${SPF_LOOKUP_LIMIT}. Receivers return a permanent error, which usually counts as an SPF failure.`,
    })
  } else if (lookups >= SPF_LOOKUP_LIMIT - 2) {
    issues.push({
      severity: "warning",
      message: `This record already needs ${lookups} of the ${SPF_LOOKUP_LIMIT} allowed DNS lookups before counting anything nested inside an include, so it is close to failing.`,
    })
  }

  if (record.length > 255) {
    issues.push({
      severity: "info",
      message: `This record is ${record.length} characters. A single DNS TXT string cannot exceed 255 characters, so your DNS provider must split it into multiple quoted strings within one record.`,
    })
  }

  return { terms, issues, lookups }
}

const DMARC_POLICIES = ["none", "quarantine", "reject"]

function checkDmarc(record: string): { terms: Term[]; issues: Issue[] } {
  const issues: Issue[] = []
  const terms: Term[] = []
  const seen = new Set<string>()

  const parts = record
    .trim()
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)

  let policy = ""
  let hasRua = false

  parts.forEach((part, index) => {
    const separator = part.indexOf("=")
    if (separator === -1) {
      issues.push({
        severity: "error",
        message: `"${part}" is not a tag=value pair. DMARC tags are separated by semicolons.`,
      })
      return
    }

    const tag = part.slice(0, separator).trim().toLowerCase()
    const value = part.slice(separator + 1).trim()

    if (seen.has(tag)) {
      issues.push({
        severity: "error",
        message: `The ${tag} tag appears more than once. A DMARC record with a repeated tag is discarded.`,
      })
    }
    seen.add(tag)

    if (tag === "v") {
      if (index !== 0) {
        issues.push({
          severity: "error",
          message: "The v tag must be the first tag in the record.",
        })
      }
      if (value !== "DMARC1") {
        issues.push({
          severity: "error",
          message: 'The version must be exactly "DMARC1", including capitalisation.',
        })
      }
      terms.push({
        text: part,
        label: "version",
        explanation: "Declares this TXT record as a DMARC version 1 policy.",
        costsLookup: false,
      })
      return
    }

    if (tag === "p" || tag === "sp") {
      if (tag === "p") policy = value.toLowerCase()
      const valid = DMARC_POLICIES.includes(value.toLowerCase())
      if (!valid) {
        issues.push({
          severity: "error",
          message: `${tag}=${value} is not valid. The policy must be none, quarantine, or reject.`,
        })
      }
      terms.push({
        text: part,
        label: tag === "p" ? "policy" : "subdomain policy",
        explanation:
          `${tag === "p" ? "Tells receivers what to do with mail that fails DMARC for this domain" : "Overrides the policy for subdomains only"}. ` +
          (value.toLowerCase() === "none"
            ? "none means report only and take no action, which is the right place to start."
            : value.toLowerCase() === "quarantine"
              ? "quarantine means deliver failing mail to the spam folder."
              : value.toLowerCase() === "reject"
                ? "reject means refuse failing mail outright."
                : ""),
        costsLookup: false,
      })
      return
    }

    if (tag === "rua" || tag === "ruf") {
      if (tag === "rua") hasRua = true
      const addresses = value.split(",").map((entry) => entry.trim())
      for (const address of addresses) {
        if (!address.toLowerCase().startsWith("mailto:")) {
          issues.push({
            severity: "error",
            message: `"${address}" is not a valid reporting address. Each entry in ${tag} must start with mailto:.`,
          })
        }
      }
      terms.push({
        text: part,
        label: tag === "rua" ? "aggregate reports" : "forensic reports",
        explanation:
          tag === "rua"
            ? "Where receivers send daily aggregate XML reports. These reports are how you find out which of your own systems are failing before you tighten the policy."
            : "Where receivers send per message failure reports. Most large receivers do not send these at all, and they can contain message content, so they are optional.",
        costsLookup: false,
      })
      return
    }

    if (tag === "adkim" || tag === "aspf") {
      if (!["r", "s"].includes(value.toLowerCase())) {
        issues.push({
          severity: "error",
          message: `${tag}=${value} is not valid. Alignment must be r for relaxed or s for strict.`,
        })
      }
      terms.push({
        text: part,
        label: `${tag === "adkim" ? "DKIM" : "SPF"} alignment`,
        explanation:
          value.toLowerCase() === "s"
            ? "Strict alignment requires an exact domain match between the From address and the authenticated domain."
            : "Relaxed alignment, the default, accepts any subdomain of the same organisational domain.",
        costsLookup: false,
      })
      return
    }

    if (tag === "pct") {
      const percent = Number(value)
      if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
        issues.push({
          severity: "error",
          message: `pct=${value} is not valid. It must be a whole number from 0 to 100.`,
        })
      } else if (percent < 100 && policy === "reject") {
        issues.push({
          severity: "warning",
          message: `pct=${percent} with p=reject applies the policy to only ${percent} percent of failing mail, so the rest is delivered normally. That is useful while rolling out, but remember to raise it to 100.`,
        })
      }
      terms.push({
        text: part,
        label: "percentage",
        explanation:
          "The share of failing mail the policy is applied to, used to roll a stricter policy out gradually.",
        costsLookup: false,
      })
      return
    }

    if (tag === "fo" || tag === "rf" || tag === "ri" || tag === "np") {
      terms.push({
        text: part,
        label: `${tag} tag`,
        explanation:
          tag === "fo"
            ? "Controls when forensic reports are generated. 0 means only when everything fails, 1 means when anything fails, d and s cover DKIM and SPF failures."
            : tag === "rf"
              ? "The report format for forensic reports. Only afrf is defined."
              : tag === "ri"
                ? "How often aggregate reports are requested, in seconds. Most receivers send daily regardless."
                : "The policy for non existent subdomains, which takes precedence over sp for domains with no MX or A record.",
        costsLookup: false,
      })
      return
    }

    terms.push({
      text: part,
      label: "unknown tag",
      explanation: "Not a tag defined by RFC 7489. Receivers ignore it.",
      costsLookup: false,
    })
    issues.push({
      severity: "warning",
      message: `"${tag}" is not a recognised DMARC tag and will be ignored.`,
    })
  })

  if (!seen.has("v")) {
    issues.push({
      severity: "error",
      message: 'The record has no v tag. It must start with "v=DMARC1".',
    })
  }
  if (!seen.has("p")) {
    issues.push({
      severity: "error",
      message: "The record has no p tag. A DMARC record without a policy is invalid.",
    })
  }
  if (!hasRua) {
    issues.push({
      severity: "warning",
      message:
        "There is no rua address, so you will never receive the aggregate reports that tell you which of your own mail is failing. Add one before tightening the policy.",
    })
  }
  if (policy === "none") {
    issues.push({
      severity: "info",
      message:
        "p=none asks receivers to report but not to act, so this record does not yet stop anyone spoofing your domain. It is the correct first step, not the destination.",
    })
  }

  return { terms, issues }
}

const SEVERITY_STYLES: Record<Severity, string> = {
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
}

const PLACEHOLDER =
  "v=spf1 include:_spf.google.com include:sendgrid.net ip4:203.0.113.0/24 ~all"

export default function SpfDmarcRecordChecker() {
  const [record, setRecord] = useState("")

  const analysis = useMemo(() => {
    const trimmed = record.trim().replace(/^"|"$/g, "")
    if (!trimmed) return null

    const lower = trimmed.toLowerCase()
    if (lower.startsWith("v=spf1")) {
      return { type: "SPF" as const, ...checkSpf(trimmed) }
    }
    if (lower.startsWith("v=dmarc1")) {
      return { type: "DMARC" as const, ...checkDmarc(trimmed), lookups: null }
    }
    return {
      type: null,
      terms: [],
      lookups: null,
      issues: [
        {
          severity: "error" as const,
          message:
            'This does not look like an SPF or DMARC record. An SPF record starts with "v=spf1" and a DMARC record starts with "v=DMARC1". Paste only the value of the TXT record, without the host name.',
        },
      ],
    }
  }, [record])

  const errorCount = analysis?.issues.filter((i) => i.severity === "error").length ?? 0
  const warningCount =
    analysis?.issues.filter((i) => i.severity === "warning").length ?? 0

  const summary = analysis
    ? [
        `Record type: ${analysis.type ?? "unrecognised"}`,
        analysis.lookups !== null ? `DNS lookups: ${analysis.lookups}` : "",
        ...analysis.issues.map((issue) => `${issue.severity}: ${issue.message}`),
      ]
        .filter(Boolean)
        .join("\n")
    : ""

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="record-checker-input">SPF or DMARC TXT record</Label>
        <Textarea
          id="record-checker-input"
          name="record"
          value={record}
          onChange={(e) => setRecord(e.target.value)}
          placeholder={PLACEHOLDER}
          className="mt-1.5 min-h-28 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1.5 text-xs">
          Paste the value only. For DMARC that is the TXT record at _dmarc.yourdomain.com.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRecord("")}
          disabled={!record}
        >
          <RotateCcw className="size-4" />
          Clear
        </Button>
        {summary && <CopyButton value={summary} label="Copy findings" />}
      </div>

      {analysis && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {analysis.type && <Badge variant="outline">{analysis.type} record</Badge>}
            {analysis.lookups !== null && (
              <Badge
                variant="outline"
                className={
                  analysis.lookups > SPF_LOOKUP_LIMIT
                    ? SEVERITY_STYLES.error
                    : analysis.lookups >= SPF_LOOKUP_LIMIT - 2
                      ? SEVERITY_STYLES.warning
                      : ""
                }
              >
                {analysis.lookups} of {SPF_LOOKUP_LIMIT} DNS lookups
              </Badge>
            )}
            {errorCount === 0 && warningCount === 0 && analysis.type && (
              <Badge
                variant="outline"
                className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="size-3.5" />
                No problems found
              </Badge>
            )}
          </div>

          {analysis.issues.length > 0 && (
            <ul className="space-y-2">
              {analysis.issues.map((issue, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${SEVERITY_STYLES[issue.severity]}`}
                >
                  {issue.severity === "error" ? (
                    <XCircle className="mt-0.5 size-4 shrink-0" />
                  ) : issue.severity === "warning" ? (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  )}
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          )}

          {analysis.terms.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">What each part does</h3>
              <ul className="mt-2 space-y-2">
                {analysis.terms.map((term, index) => (
                  <li
                    key={index}
                    className="border-border/60 rounded-lg border p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-xs break-all">{term.text}</code>
                      <Badge variant="outline" className="text-xs">
                        {term.label}
                      </Badge>
                      {term.costsLookup && (
                        <Badge variant="outline" className="text-xs">
                          1 DNS lookup
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1.5">{term.explanation}</p>
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
