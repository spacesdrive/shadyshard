import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const EXAMPLE =
  "https://example.com:8080/path/to/page?search=hello+world&page=2#section-3"

interface ParsedUrl {
  protocol: string
  hostname: string
  port: string
  pathname: string
  hash: string
  params: [string, string][]
}

function parseUrl(value: string): ParsedUrl {
  const url = new URL(value)
  return {
    protocol: url.protocol.replace(":", ""),
    hostname: url.hostname,
    port: url.port || "(default)",
    pathname: url.pathname || "/",
    hash: url.hash.replace("#", "") || "(none)",
    params: Array.from(url.searchParams.entries()),
  }
}

export default function UrlParser() {
  const [input, setInput] = useState(EXAMPLE)

  const { parsed, error } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: null }
    try {
      return { parsed: parseUrl(input.trim()), error: null }
    } catch {
      return { parsed: null, error: "This is not a valid, complete URL." }
    }
  }, [input])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="url-parser-input">URL</Label>
        <Input
          id="url-parser-input"
          name="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com/path?query=value"
          className="mt-1.5 font-mono text-sm"
        />
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {parsed && (
        <div className="space-y-4">
          <dl className="divide-border/60 divide-y text-sm">
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">Protocol</dt>
              <dd className="font-medium">{parsed.protocol}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">Host</dt>
              <dd className="font-medium">{parsed.hostname}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">Port</dt>
              <dd className="font-medium">{parsed.port}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">Path</dt>
              <dd className="text-right font-medium break-all">{parsed.pathname}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">Hash</dt>
              <dd className="text-right font-medium break-all">{parsed.hash}</dd>
            </div>
          </dl>

          <div>
            <p className="mb-2 text-sm font-medium">
              Query parameters {parsed.params.length === 0 && "(none)"}
            </p>
            {parsed.params.length > 0 && (
              <ul className="space-y-1.5">
                {parsed.params.map(([key, value], index) => (
                  <li
                    key={`${key}-${index}`}
                    className="border-border/60 flex justify-between gap-4 rounded-lg border p-2.5 text-sm"
                  >
                    <span className="font-mono">{key}</span>
                    <span className="text-muted-foreground text-right font-mono break-all">
                      {value}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
