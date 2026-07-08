import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

interface Rule {
  type: "Disallow" | "Allow"
  path: string
}

export default function RobotsTxtGenerator() {
  const [userAgent, setUserAgent] = useState("*")
  const [rules, setRules] = useState<Rule[]>([{ type: "Disallow", path: "/admin" }])
  const [sitemap, setSitemap] = useState("")

  function updateRule(index: number, patch: Partial<Rule>) {
    setRules((prev) =>
      prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)),
    )
  }

  const content = [
    `User-agent: ${userAgent || "*"}`,
    ...rules.filter((r) => r.path).map((r) => `${r.type}: ${r.path}`),
    ...(sitemap ? ["", `Sitemap: ${sitemap}`] : []),
  ].join("\n")

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="robots-user-agent">User-agent</Label>
        <Input
          id="robots-user-agent"
          name="userAgent"
          value={userAgent}
          onChange={(e) => setUserAgent(e.target.value)}
          placeholder="*"
          className="mt-1.5 font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Rules</span>
        {rules.map((rule, index) => (
          <div key={index} className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-28 shrink-0"
              onClick={() =>
                updateRule(index, {
                  type: rule.type === "Disallow" ? "Allow" : "Disallow",
                })
              }
            >
              {rule.type}
            </Button>
            <Input
              id={`robots-rule-path-${index}`}
              name={`rulePath${index}`}
              value={rule.path}
              onChange={(e) => updateRule(index, { path: e.target.value })}
              placeholder="/path"
              className="font-mono text-sm"
              aria-label={`Rule ${index + 1} path`}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Remove rule"
              onClick={() => setRules((prev) => prev.filter((_, i) => i !== index))}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRules((prev) => [...prev, { type: "Disallow", path: "" }])}
        >
          <Plus className="size-4" />
          Add rule
        </Button>
      </div>

      <div>
        <Label htmlFor="robots-sitemap">Sitemap URL (optional)</Label>
        <Input
          id="robots-sitemap"
          name="sitemap"
          value={sitemap}
          onChange={(e) => setSitemap(e.target.value)}
          placeholder="https://example.com/sitemap.xml"
          className="mt-1.5 font-mono text-sm"
        />
      </div>

      <div className="flex gap-2">
        <CopyButton value={content} label="Copy" />
        <DownloadButton
          getBlob={() => new Blob([content], { type: "text/plain" })}
          filename="robots.txt"
        />
      </div>

      <Textarea
        id="robots-txt-output"
        name="content"
        value={content}
        readOnly
        className="min-h-40 resize-y font-mono text-sm"
        aria-label="Generated robots.txt"
      />
    </div>
  )
}
