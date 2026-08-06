import { useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { parseHtml } from "@/lib/html-document"
import { toDelimited } from "@/lib/csv"

interface LinkRow {
  href: string
  resolved: string
  text: string
  rel: string
  target: string
  scope: "internal" | "external" | "other" | "unresolved"
}

function classify(resolved: string, base: URL | null): LinkRow["scope"] {
  if (/^(mailto:|tel:|javascript:|#)/i.test(resolved)) return "other"
  let url: URL
  try {
    url = new URL(resolved)
  } catch {
    return "unresolved"
  }
  if (!base) return "unresolved"
  return url.host === base.host ? "internal" : "external"
}

function extract(markup: string, baseUrl: string, includeAnchors: boolean): LinkRow[] {
  if (!markup.trim()) return []

  let base: URL | null = null
  if (baseUrl.trim()) {
    try {
      base = new URL(baseUrl.trim())
    } catch {
      base = null
    }
  }

  const document = parseHtml(markup)
  const anchors = Array.from(document.querySelectorAll("a[href]"))

  return anchors
    .map((anchor) => {
      const href = anchor.getAttribute("href") ?? ""
      let resolved = href
      if (base) {
        try {
          resolved = new URL(href, base).toString()
        } catch {
          resolved = href
        }
      }
      return {
        href,
        resolved,
        text: (anchor.textContent ?? "").replace(/\s+/g, " ").trim(),
        rel: anchor.getAttribute("rel") ?? "",
        target: anchor.getAttribute("target") ?? "",
        scope: classify(resolved, base),
      }
    })
    .filter((row) => includeAnchors || !row.href.startsWith("#"))
}

const SCOPE_LABELS: Record<LinkRow["scope"], string> = {
  internal: "Internal",
  external: "External",
  other: "Non-web",
  unresolved: "Relative",
}

export default function HtmlLinkExtractor() {
  const [markup, setMarkup] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [includeAnchors, setIncludeAnchors] = useState(false)

  const rows = useMemo(
    () => extract(markup, baseUrl, includeAnchors),
    [markup, baseUrl, includeAnchors],
  )

  const counts = useMemo(() => {
    const destinations = new Map<string, number>()
    rows.forEach((row) =>
      destinations.set(row.resolved, (destinations.get(row.resolved) ?? 0) + 1),
    )
    return {
      internal: rows.filter((row) => row.scope === "internal").length,
      external: rows.filter((row) => row.scope === "external").length,
      nofollow: rows.filter((row) => /\bnofollow\b/i.test(row.rel)).length,
      emptyText: rows.filter((row) => !row.text).length,
      duplicates: Array.from(destinations.values()).filter((count) => count > 1).length,
    }
  }, [rows])

  const csv = useMemo(
    () =>
      toDelimited(
        [
          ["url", "anchor_text", "rel", "target", "scope"],
          ...rows.map((row) => [
            row.resolved,
            row.text,
            row.rel,
            row.target,
            SCOPE_LABELS[row.scope],
          ]),
        ],
        ",",
      ),
    [rows],
  )

  const urlList = rows.map((row) => row.resolved).join("\n")

  function reset() {
    setMarkup("")
    setBaseUrl("")
    setIncludeAnchors(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="link-extractor-markup">Page source</Label>
        <Textarea
          id="link-extractor-markup"
          name="markup"
          value={markup}
          onChange={(event) => setMarkup(event.target.value)}
          placeholder="<nav><a href='/pricing'>Pricing</a></nav>"
          className="min-h-48 resize-y font-mono text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="link-extractor-base">Page URL (optional)</Label>
          <Input
            id="link-extractor-base"
            name="baseUrl"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="https://example.com/blog/post"
            className="font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center gap-2 sm:mt-8">
          <Switch
            id="link-extractor-anchors"
            name="includeAnchors"
            checked={includeAnchors}
            onCheckedChange={setIncludeAnchors}
          />
          <Label htmlFor="link-extractor-anchors">Include on-page anchors</Label>
        </div>
      </div>

      {rows.length > 0 && (
        <>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { term: "Links", value: rows.length },
              { term: "Internal", value: counts.internal },
              { term: "External", value: counts.external },
              { term: "Nofollow", value: counts.nofollow },
              { term: "Empty text", value: counts.emptyText },
            ].map(({ term, value }) => (
              <div
                key={term}
                className="border-border/60 rounded-lg border p-3 text-center"
              >
                <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
                <dt className="text-muted-foreground mt-1 text-xs">{term}</dt>
              </div>
            ))}
          </dl>

          {counts.duplicates > 0 && (
            <p className="text-muted-foreground text-sm">
              {counts.duplicates}{" "}
              {counts.duplicates === 1 ? "destination is" : "destinations are"} linked
              more than once on this page.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <CopyButton value={urlList} label="Copy URLs" />
            <DownloadButton
              getBlob={() => new Blob([csv], { type: "text/csv" })}
              filename="links.csv"
              label="Download CSV"
            />
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-border/60 border-b text-left">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    URL
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Anchor text
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Rel
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Scope
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-border/40 border-b align-top">
                    <td className="py-2 pr-3 font-mono break-all">{row.resolved}</td>
                    <td className="py-2 pr-3 break-words">
                      {row.text || (
                        <span className="text-muted-foreground italic">empty</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 font-mono break-words">{row.rel || "-"}</td>
                    <td className="text-muted-foreground py-2">
                      {SCOPE_LABELS[row.scope]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {markup.trim() && rows.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No anchor elements with an href were found in this markup.
        </p>
      )}
    </div>
  )
}
