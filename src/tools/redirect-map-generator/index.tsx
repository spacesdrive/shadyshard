import { useMemo, useState } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

interface Format {
  value: string
  label: string
  filename: string
  mimeType: string
  /** Formats that match on the path want the origin stripped from the source. */
  pathOnlySource: boolean
  render: (rules: Rule[], status: string) => string
}

interface Rule {
  from: string
  to: string
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function redirectObjects(rules: Rule[], status: string, indent: string): string {
  return rules
    .map(
      (rule) =>
        `${indent}{ "source": ${JSON.stringify(rule.from)}, "destination": ${JSON.stringify(rule.to)}, "statusCode": ${status} }`,
    )
    .join(",\n")
}

const FORMATS: Format[] = [
  {
    value: "apache",
    label: "Apache (.htaccess)",
    filename: ".htaccess",
    mimeType: "text/plain",
    pathOnlySource: true,
    render: (rules, status) =>
      [
        "<IfModule mod_rewrite.c>",
        "  RewriteEngine On",
        ...rules.map(
          (rule) =>
            `  RewriteRule ^${escapeRegex(rule.from.replace(/^\//, ""))}$ ${rule.to} [R=${status},L]`,
        ),
        "</IfModule>",
      ].join("\n"),
  },
  {
    value: "nginx",
    label: "Nginx",
    filename: "redirects.conf",
    mimeType: "text/plain",
    pathOnlySource: true,
    render: (rules, status) =>
      rules
        .map((rule) => `location = ${rule.from} { return ${status} ${rule.to}; }`)
        .join("\n"),
  },
  {
    value: "netlify",
    label: "Netlify (_redirects)",
    filename: "_redirects",
    mimeType: "text/plain",
    pathOnlySource: true,
    render: (rules, status) =>
      rules.map((rule) => `${rule.from}  ${rule.to}  ${status}`).join("\n"),
  },
  {
    value: "vercel",
    label: "Vercel (vercel.json)",
    filename: "vercel.json",
    mimeType: "application/json",
    pathOnlySource: true,
    render: (rules, status) =>
      `{\n  "redirects": [\n${redirectObjects(rules, status, "    ")}\n  ]\n}`,
  },
  {
    value: "next",
    label: "Next.js (next.config.js)",
    filename: "redirects.js",
    mimeType: "text/javascript",
    pathOnlySource: true,
    render: (rules, status) =>
      `module.exports = {\n  async redirects() {\n    return [\n${redirectObjects(rules, status, "      ")}\n    ]\n  },\n}`,
  },
  {
    value: "caddy",
    label: "Caddy",
    filename: "Caddyfile",
    mimeType: "text/plain",
    pathOnlySource: true,
    render: (rules, status) =>
      rules.map((rule) => `redir ${rule.from} ${rule.to} ${status}`).join("\n"),
  },
  {
    value: "shopify",
    label: "Shopify CSV",
    filename: "redirects.csv",
    mimeType: "text/csv",
    pathOnlySource: true,
    render: (rules) =>
      [
        "Redirect from,Redirect to",
        ...rules.map((rule) => `${rule.from},${rule.to}`),
      ].join("\n"),
  },
]

const STATUS_CODES = ["301", "302", "307", "308"]

interface ParsedInput {
  rules: Rule[]
  warnings: string[]
}

function toPath(url: string): string {
  if (!/^https?:\/\//i.test(url)) return url.startsWith("/") ? url : `/${url}`
  try {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return url
  }
}

function parseInput(
  text: string,
  pathOnlySource: boolean,
  normalizeTrailingSlash: boolean,
): ParsedInput {
  const rules: Rule[] = []
  const warnings: string[] = []
  const seen = new Map<string, number>()

  text.split("\n").forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) return

    const parts = line
      .split(/[,\t\s]+/)
      .map((part) => part.trim())
      .filter(Boolean)

    if (parts.length < 2) {
      warnings.push(`Line ${index + 1} has no target URL and was skipped.`)
      return
    }
    if (parts.length > 2) {
      warnings.push(
        `Line ${index + 1} has more than two values; the first two were used.`,
      )
    }

    let from = pathOnlySource ? toPath(parts[0]) : parts[0]
    let to = parts[1]

    if (normalizeTrailingSlash) {
      from = from.length > 1 ? from.replace(/\/+$/, "") : from
      if (/^https?:\/\//i.test(to)) {
        to = to.replace(/([^/])\/+$/, "$1")
      } else {
        to = to.length > 1 ? to.replace(/\/+$/, "") : to
      }
    }

    if (from === to) {
      warnings.push(`Line ${index + 1} redirects a URL to itself and was skipped.`)
      return
    }

    const previous = seen.get(from)
    if (previous !== undefined) {
      warnings.push(
        `Line ${index + 1} repeats the source from line ${previous}; only the first rule will ever match.`,
      )
    } else {
      seen.set(from, index + 1)
    }

    rules.push({ from, to })
  })

  return { rules, warnings }
}

const SAMPLE = `https://example.com/old-blog/post-one,/blog/post-one
/products/widget-v1,/products/widget
/about-us,/about`

export default function RedirectMapGenerator() {
  const [input, setInput] = useState(SAMPLE)
  const [formatValue, setFormatValue] = useState("apache")
  const [status, setStatus] = useState("301")
  const [normalizeTrailingSlash, setNormalizeTrailingSlash] = useState(false)

  const format = FORMATS.find((entry) => entry.value === formatValue) ?? FORMATS[0]

  const { rules, warnings } = useMemo(
    () => parseInput(input, format.pathOnlySource, normalizeTrailingSlash),
    [input, format, normalizeTrailingSlash],
  )

  const output = useMemo(
    () => (rules.length === 0 ? "" : format.render(rules, status)),
    [rules, format, status],
  )

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="redirect-input">Old and new URLs, one pair per line</Label>
        <Textarea
          id="redirect-input"
          name="pairs"
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={"/old-path,/new-path\n/another-old-path,/another-new-path"}
        />
        <p className="text-muted-foreground mt-1.5 text-sm">
          Separate the pair with a comma, a tab, or a space. Lines starting with # are
          ignored.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="redirect-format">Output format</Label>
          <Select
            value={formatValue}
            onValueChange={(value) => value && setFormatValue(value as string)}
          >
            <SelectTrigger id="redirect-format" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="redirect-status">Status code</Label>
          <Select
            value={status}
            onValueChange={(value) => value && setStatus(value as string)}
          >
            <SelectTrigger
              id="redirect-status"
              className="mt-1.5 w-full"
              disabled={formatValue === "shopify"}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="redirect-trailing-slash"
          name="normalizeTrailingSlash"
          checked={normalizeTrailingSlash}
          onCheckedChange={setNormalizeTrailingSlash}
        />
        <Label htmlFor="redirect-trailing-slash" className="font-normal">
          Remove trailing slashes
        </Label>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy rules" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: format.mimeType })}
          filename={format.filename}
          disabled={!output}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {rules.length > 0 && (
        <p className="text-muted-foreground text-sm">
          {rules.length} {rules.length === 1 ? "redirect" : "redirects"} generated.
          {formatValue === "shopify" &&
            " Shopify import always redirects with a 301, so the status code does not apply."}
        </p>
      )}

      {warnings.length > 0 && (
        <div className="border-border/60 bg-muted/40 rounded-lg border p-3 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="text-muted-foreground size-4 shrink-0" />
            {warnings.length} {warnings.length === 1 ? "issue" : "issues"} found
          </div>
          <ul className="text-muted-foreground mt-2 space-y-1">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <Label htmlFor="redirect-output">Redirect rules</Label>
        <Textarea
          id="redirect-output"
          name="rules"
          readOnly
          className="mt-1.5 min-h-56 resize-y font-mono text-sm"
          value={output}
          placeholder="The generated rules appear here."
        />
      </div>
    </div>
  )
}
