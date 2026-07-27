import { useMemo, useState } from "react"
import { AlertCircle, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"

interface AlternateRow {
  id: string
  code: string
  url: string
}

const CODE_PATTERN = /^[a-z]{2,3}(-[A-Z]{2})?$/

function newRow(code = "", url = ""): AlternateRow {
  return { id: crypto.randomUUID(), code, url }
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
}

function validate(rows: AlternateRow[]): string[] {
  const problems: string[] = []
  const seenCodes = new Set<string>()

  for (const row of rows) {
    const code = row.code.trim()
    const url = row.url.trim()
    if (!code && !url) continue

    if (!code) {
      problems.push(`The row for ${url} has no language code.`)
      continue
    }
    if (!CODE_PATTERN.test(code)) {
      problems.push(
        `"${code}" is not a valid code. Use a lowercase language code, optionally with an uppercase region, such as en or en-GB.`,
      )
    }
    if (seenCodes.has(code)) {
      problems.push(
        `"${code}" is listed more than once. Each version needs its own code.`,
      )
    }
    seenCodes.add(code)

    if (!url) {
      problems.push(`The row for "${code}" has no URL.`)
    } else if (!/^https?:\/\//i.test(url)) {
      problems.push(
        `The URL for "${code}" must be absolute and start with http or https.`,
      )
    }
  }

  return problems
}

function buildHtml(rows: AlternateRow[], defaultCode: string): string {
  const tags = rows.map(
    (row) =>
      `<link rel="alternate" hreflang="${escapeAttribute(row.code.trim())}" href="${escapeAttribute(row.url.trim())}" />`,
  )

  const fallback = rows.find((row) => row.code.trim() === defaultCode)
  if (fallback) {
    tags.push(
      `<link rel="alternate" hreflang="x-default" href="${escapeAttribute(fallback.url.trim())}" />`,
    )
  }
  return tags.join("\n")
}

function buildSitemap(rows: AlternateRow[], defaultCode: string): string {
  const alternates = rows.map(
    (row) =>
      `    <xhtml:link rel="alternate" hreflang="${escapeAttribute(row.code.trim())}" href="${escapeAttribute(row.url.trim())}" />`,
  )

  const fallback = rows.find((row) => row.code.trim() === defaultCode)
  if (fallback) {
    alternates.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeAttribute(fallback.url.trim())}" />`,
    )
  }

  const entries = rows.map((row) =>
    [
      "  <url>",
      `    <loc>${escapeAttribute(row.url.trim())}</loc>`,
      ...alternates,
      "  </url>",
    ].join("\n"),
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    "</urlset>",
  ].join("\n")
}

export default function HreflangTagGenerator() {
  const [rows, setRows] = useState<AlternateRow[]>(() => [
    newRow("en", "https://example.com/"),
    newRow("en-GB", "https://example.com/uk/"),
    newRow("de", "https://example.com/de/"),
  ])
  const [defaultCode, setDefaultCode] = useState("en")
  const [format, setFormat] = useState<"html" | "sitemap">("html")

  const completeRows = rows.filter((row) => row.code.trim() && row.url.trim())
  const problems = useMemo(() => validate(rows), [rows])

  const output = useMemo(() => {
    if (completeRows.length === 0 || problems.length > 0) return ""
    return format === "html"
      ? buildHtml(completeRows, defaultCode)
      : buildSitemap(completeRows, defaultCode)
  }, [completeRows, problems, format, defaultCode])

  function update(id: string, patch: Partial<AlternateRow>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid gap-2 sm:grid-cols-[8rem_1fr_auto] sm:items-end"
          >
            <div>
              <Label htmlFor={`hreflang-code-${row.id}`}>
                {index === 0 ? (
                  "Language code"
                ) : (
                  <span className="sr-only">Language code</span>
                )}
              </Label>
              <Input
                id={`hreflang-code-${row.id}`}
                name={`code-${index}`}
                value={row.code}
                onChange={(e) => update(row.id, { code: e.target.value })}
                placeholder="en-GB"
                className="mt-1.5 font-mono text-sm"
                spellCheck={false}
              />
            </div>
            <div>
              <Label htmlFor={`hreflang-url-${row.id}`}>
                {index === 0 ? "URL" : <span className="sr-only">URL</span>}
              </Label>
              <Input
                id={`hreflang-url-${row.id}`}
                name={`url-${index}`}
                value={row.url}
                onChange={(e) => update(row.id, { url: e.target.value })}
                placeholder="https://example.com/uk/"
                className="mt-1.5 font-mono text-sm"
                spellCheck={false}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove row ${index + 1}`}
              disabled={rows.length === 1}
              onClick={() =>
                setRows((current) => current.filter((item) => item.id !== row.id))
              }
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((current) => [...current, newRow()])}
      >
        <Plus className="size-4" />
        Add language
      </Button>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="hreflang-default">x-default points at</Label>
          <Select
            value={defaultCode}
            onValueChange={(value) => value && setDefaultCode(value)}
          >
            <SelectTrigger id="hreflang-default" className="mt-1.5 w-full">
              <SelectValue placeholder="No x-default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No x-default</SelectItem>
              {completeRows.map((row) => (
                <SelectItem key={row.id} value={row.code.trim()}>
                  {row.code.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <span className="text-sm font-medium">Output format</span>
          <Tabs
            value={format}
            onValueChange={(value) => setFormat(value as "html" | "sitemap")}
            className="mt-1.5"
          >
            <TabsList>
              <TabsTrigger value="html">HTML head tags</TabsTrigger>
              <TabsTrigger value="sitemap">XML sitemap</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {problems.length > 0 && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <ul className="space-y-1">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}

      <CopyButton
        value={output}
        label={format === "html" ? "Copy link tags" : "Copy sitemap XML"}
      />

      <div>
        <Label htmlFor="hreflang-output">
          {format === "html" ? "Link tags for every page in the group" : "Sitemap XML"}
        </Label>
        <Textarea
          id="hreflang-output"
          name="output"
          value={output}
          readOnly
          className="mt-1.5 min-h-56 resize-y font-mono text-xs"
        />
        <p className="text-muted-foreground mt-1.5 text-xs">
          {format === "html"
            ? "Add this identical block to the head of every listed page, including the page it points at."
            : "Each URL entry repeats the full alternate set, which is what search engines expect."}
        </p>
      </div>
    </div>
  )
}
