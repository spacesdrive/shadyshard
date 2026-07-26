import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const USER_AGENT_PRESETS = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
  "GPTBot",
  "*",
]

const CUSTOM_AGENT = "__custom__"

interface RobotsRule {
  type: "allow" | "disallow"
  pattern: string
  line: number
}

interface RobotsGroup {
  agents: string[]
  rules: RobotsRule[]
}

interface ParsedRobots {
  groups: RobotsGroup[]
  sitemaps: string[]
  unknownLines: { line: number; text: string }[]
}

function parseRobotsTxt(source: string): ParsedRobots {
  const groups: RobotsGroup[] = []
  const sitemaps: string[] = []
  const unknownLines: { line: number; text: string }[] = []

  let current: RobotsGroup | null = null
  // A run of consecutive User-agent lines shares one rule set, so a new
  // User-agent after a rule must start a fresh group rather than join the
  // previous one.
  let agentRunOpen = false

  source.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1
    const withoutComment = rawLine.split("#")[0]
    const line = withoutComment.trim()
    if (!line) return

    const separator = line.indexOf(":")
    if (separator === -1) {
      unknownLines.push({ line: lineNumber, text: line })
      return
    }

    const field = line.slice(0, separator).trim().toLowerCase()
    const value = line.slice(separator + 1).trim()

    if (field === "user-agent") {
      if (!agentRunOpen || !current) {
        current = { agents: [], rules: [] }
        groups.push(current)
        agentRunOpen = true
      }
      current.agents.push(value.toLowerCase())
      return
    }

    if (field === "allow" || field === "disallow") {
      if (!current) {
        unknownLines.push({ line: lineNumber, text: `${line} (no User-agent above it)` })
        return
      }
      agentRunOpen = false
      current.rules.push({ type: field, pattern: value, line: lineNumber })
      return
    }

    if (field === "sitemap") {
      sitemaps.push(value)
      return
    }

    if (field === "crawl-delay" || field === "host" || field === "clean-param") return

    unknownLines.push({ line: lineNumber, text: line })
  })

  return { groups, sitemaps, unknownLines }
}

function selectGroup(parsed: ParsedRobots, userAgent: string): RobotsGroup | null {
  const agent = userAgent.trim().toLowerCase()
  let best: RobotsGroup | null = null
  let bestLength = -1
  let wildcard: RobotsGroup | null = null

  for (const group of parsed.groups) {
    for (const candidate of group.agents) {
      if (candidate === "*") {
        wildcard = wildcard ?? group
        continue
      }
      // A group's product token matches case-insensitively when it is a
      // prefix of the crawler name, so a "Googlebot" group also applies to
      // Googlebot-News unless a longer, more specific group exists.
      if (agent.startsWith(candidate) && candidate.length > bestLength) {
        best = group
        bestLength = candidate.length
      }
    }
  }

  return best ?? wildcard
}

function patternToRegExp(pattern: string): RegExp {
  const anchored = pattern.endsWith("$")
  const body = anchored ? pattern.slice(0, -1) : pattern
  const escaped = body.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")
  return new RegExp(`^${escaped}${anchored ? "$" : ""}`)
}

function toPath(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed)
      return `${url.pathname}${url.search}`
    } catch {
      return null
    }
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
}

interface TestResult {
  input: string
  path: string | null
  allowed: boolean
  rule: RobotsRule | null
}

function evaluate(path: string, group: RobotsGroup | null): Omit<TestResult, "input"> {
  if (!group) return { path, allowed: true, rule: null }

  let winner: RobotsRule | null = null
  for (const rule of group.rules) {
    // An empty Disallow value means "nothing is disallowed" and carries no
    // path to match against, so it never competes for most-specific.
    if (rule.pattern === "") continue
    if (!patternToRegExp(rule.pattern).test(path)) continue
    if (!winner || rule.pattern.length > winner.pattern.length) {
      winner = rule
    } else if (
      rule.pattern.length === winner.pattern.length &&
      rule.type === "allow" &&
      winner.type === "disallow"
    ) {
      winner = rule
    }
  }

  return { path, allowed: winner ? winner.type === "allow" : true, rule: winner }
}

export default function RobotsTxtTester() {
  const [robots, setRobots] = useState("")
  const [urls, setUrls] = useState("")
  const [preset, setPreset] = useState("Googlebot")
  const [customAgent, setCustomAgent] = useState("")

  const userAgent = preset === CUSTOM_AGENT ? customAgent : preset
  const customAgentMissing = preset === CUSTOM_AGENT && !customAgent.trim()

  const parsed = useMemo(() => parseRobotsTxt(robots), [robots])
  const group = useMemo(() => selectGroup(parsed, userAgent), [parsed, userAgent])

  const results = useMemo<TestResult[]>(() => {
    if (!robots.trim() || customAgentMissing) return []
    return urls
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((input) => {
        const path = toPath(input)
        if (path === null) return { input, path: null, allowed: false, rule: null }
        return { input, ...evaluate(path, group) }
      })
  }, [robots, urls, group, customAgentMissing])

  const blockedCount = results.filter((r) => r.path !== null && !r.allowed).length
  const invalidCount = results.filter((r) => r.path === null).length
  const allowedCount = results.length - blockedCount - invalidCount

  const report = results
    .map((result) => {
      if (result.path === null) return `${result.input}\tinvalid URL`
      const verdict = result.allowed ? "allowed" : "blocked"
      const rule = result.rule
        ? `${result.rule.type === "allow" ? "Allow" : "Disallow"}: ${result.rule.pattern} (line ${result.rule.line})`
        : "no matching rule"
      return `${result.input}\t${verdict}\t${rule}`
    })
    .join("\n")

  function handleReset() {
    setRobots("")
    setUrls("")
    setPreset("Googlebot")
    setCustomAgent("")
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="robots-tester-file">robots.txt contents</Label>
          <Textarea
            id="robots-tester-file"
            name="robots"
            value={robots}
            onChange={(e) => setRobots(e.target.value)}
            placeholder={
              "User-agent: *\nDisallow: /admin/\nAllow: /admin/public/\nDisallow: /*.pdf$\n\nSitemap: https://example.com/sitemap.xml"
            }
            className="mt-1.5 min-h-56 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="robots-tester-urls">URLs or paths to test, one per line</Label>
          <Textarea
            id="robots-tester-urls"
            name="urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder={
              "https://example.com/admin/settings\n/admin/public/help\n/guide.pdf\n/blog/post-1"
            }
            className="mt-1.5 min-h-56 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <Label htmlFor="robots-tester-agent">Crawler user agent</Label>
          <Select value={preset} onValueChange={(value) => value && setPreset(value)}>
            <SelectTrigger id="robots-tester-agent" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USER_AGENT_PRESETS.map((agent) => (
                <SelectItem key={agent} value={agent}>
                  {agent === "*" ? "* (any other crawler)" : agent}
                </SelectItem>
              ))}
              <SelectItem value={CUSTOM_AGENT}>Custom...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {preset === CUSTOM_AGENT && (
          <div className="w-56">
            <Label htmlFor="robots-tester-custom">Custom user agent token</Label>
            <Input
              id="robots-tester-custom"
              name="customAgent"
              value={customAgent}
              onChange={(e) => setCustomAgent(e.target.value)}
              placeholder="MyCrawler"
              className="mt-1.5 font-mono text-sm"
            />
          </div>
        )}

        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {customAgentMissing && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>Enter a custom user agent token, or pick one of the presets.</span>
        </div>
      )}

      {robots.trim() && !customAgentMissing && (
        <p className="text-muted-foreground text-sm">
          {group
            ? `Matched the group for "${group.agents.join(", ")}" with ${group.rules.length} rule${group.rules.length === 1 ? "" : "s"}.`
            : `No group matches "${userAgent}" and there is no "User-agent: *" group, so every URL is allowed.`}
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              {allowedCount} allowed
            </Badge>
            <Badge
              variant="outline"
              className="border-destructive/30 bg-destructive/10 text-destructive"
            >
              {blockedCount} blocked
            </Badge>
            {invalidCount > 0 && (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                {invalidCount} unreadable
              </Badge>
            )}
            <CopyButton value={report} label="Copy results" />
            <DownloadButton
              getBlob={() =>
                new Blob([`url\tverdict\trule\n${report}\n`], {
                  type: "text/tab-separated-values",
                })
              }
              filename="robots-txt-test-results.tsv"
            />
          </div>

          <ul className="space-y-2">
            {results.map((result, index) => (
              <li
                key={index}
                className="border-border/60 flex flex-wrap items-start gap-x-3 gap-y-1 rounded-lg border p-3 text-sm"
              >
                {result.path === null ? (
                  <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
                ) : result.allowed ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="text-destructive mt-0.5 size-4 shrink-0" />
                )}
                <code className="min-w-0 flex-1 font-mono text-xs break-all">
                  {result.input}
                </code>
                <span className="text-muted-foreground font-mono text-xs">
                  {result.path === null
                    ? "Not a readable URL or path"
                    : result.rule
                      ? `${result.rule.type === "allow" ? "Allow" : "Disallow"}: ${result.rule.pattern} (line ${result.rule.line})`
                      : "No matching rule"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {parsed.sitemaps.length > 0 && (
        <div className="border-border/60 rounded-lg border p-3 text-sm">
          <p className="font-medium">
            Sitemap directive{parsed.sitemaps.length === 1 ? "" : "s"}
          </p>
          <ul className="text-muted-foreground mt-1 space-y-1 font-mono text-xs">
            {parsed.sitemaps.map((sitemap, index) => (
              <li key={index} className="break-all">
                {sitemap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {parsed.unknownLines.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
          <p className="font-medium">Lines no crawler will act on</p>
          <ul className="mt-1 space-y-1 font-mono text-xs">
            {parsed.unknownLines.map((entry) => (
              <li key={entry.line} className="break-all">
                Line {entry.line}: {entry.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
