import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const CHANGEFREQS = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]

export default function SitemapGenerator() {
  const [urls, setUrls] = useState("")
  const [changefreq, setChangefreq] = useState("weekly")
  const [priority, setPriority] = useState("0.8")

  const urlList = urls
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlList
    .map(
      (url) =>
        `  <url>\n    <loc>${url}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sitemap-urls">URLs (one per line)</Label>
        <Textarea
          id="sitemap-urls"
          name="urls"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder={"https://example.com/\nhttps://example.com/about"}
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sitemap-changefreq">Change frequency</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {CHANGEFREQS.map((freq) => (
              <Button
                key={freq}
                variant={freq === changefreq ? "default" : "outline"}
                size="sm"
                onClick={() => setChangefreq(freq)}
              >
                {freq}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="sitemap-priority">Priority</Label>
          <Input
            id="sitemap-priority"
            name="priority"
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {urlList.length > 0 && (
        <p className="text-muted-foreground text-sm">
          {urlList.length} URL{urlList.length === 1 ? "" : "s"} in this sitemap.
        </p>
      )}

      <div className="flex gap-2">
        <CopyButton value={xml} label="Copy" />
        <DownloadButton
          getBlob={() => new Blob([xml], { type: "application/xml" })}
          filename="sitemap.xml"
        />
      </div>

      <Textarea
        id="sitemap-output"
        name="xml"
        value={xml}
        readOnly
        className="min-h-48 resize-y font-mono text-xs"
        aria-label="Generated sitemap.xml"
      />
    </div>
  )
}
