import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ParsedUa {
  browser: string
  browserVersion: string
  engine: string
  os: string
  deviceType: "Desktop" | "Mobile" | "Tablet"
}

function parseUserAgent(ua: string): ParsedUa {
  let browser = "Unknown"
  let browserVersion = ""

  const browserPatterns: [RegExp, string][] = [
    [/Edg\/([\d.]+)/, "Edge"],
    [/OPR\/([\d.]+)/, "Opera"],
    [/Chrome\/([\d.]+)/, "Chrome"],
    [/CriOS\/([\d.]+)/, "Chrome (iOS)"],
    [/Firefox\/([\d.]+)/, "Firefox"],
    [/Version\/([\d.]+).*Safari/, "Safari"],
  ]
  for (const [pattern, name] of browserPatterns) {
    const match = pattern.exec(ua)
    if (match) {
      browser = name
      browserVersion = match[1]
      break
    }
  }

  let engine = "Unknown"
  if (/AppleWebKit/.test(ua)) {
    engine = /Chrome|CriOS|Edg|OPR/.test(ua) ? "Blink" : "WebKit"
  }
  if (/Gecko\//.test(ua)) engine = "Gecko"

  let os = "Unknown"
  const osPatterns: [RegExp, string][] = [
    [/Windows NT 10\.0/, "Windows 10/11"],
    [/Windows NT ([\d.]+)/, "Windows"],
    [/Mac OS X ([\d_]+)/, "macOS"],
    [/Android ([\d.]+)/, "Android"],
    [/iPhone OS ([\d_]+)/, "iOS"],
    [/iPad; CPU OS ([\d_]+)/, "iPadOS"],
    [/Linux/, "Linux"],
  ]
  for (const [pattern, name] of osPatterns) {
    if (pattern.test(ua)) {
      os = name
      break
    }
  }

  let deviceType: ParsedUa["deviceType"] = "Desktop"
  if (/iPad|Tablet/.test(ua)) deviceType = "Tablet"
  else if (/Mobi|Android.*Mobile|iPhone/.test(ua)) deviceType = "Mobile"

  return { browser, browserVersion, engine, os, deviceType }
}

export default function UserAgentParser() {
  const [ua, setUa] = useState(navigator.userAgent)
  const result = ua ? parseUserAgent(ua) : null

  return (
    <div className="space-y-4">
      <Textarea
        id="user-agent-input"
        name="userAgent"
        value={ua}
        onChange={(e) => setUa(e.target.value)}
        className="min-h-24 resize-y font-mono text-xs"
        aria-label="User agent string"
        spellCheck={false}
      />

      <Button variant="outline" size="sm" onClick={() => setUa(navigator.userAgent)}>
        Use my browser's user agent
      </Button>

      {result && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Browser</p>
            <p className="mt-1 font-medium">
              {result.browser} {result.browserVersion}
            </p>
          </div>
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Engine</p>
            <p className="mt-1 font-medium">{result.engine}</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Operating system</p>
            <p className="mt-1 font-medium">{result.os}</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Device type</p>
            <p className="mt-1 font-medium">{result.deviceType}</p>
          </div>
        </div>
      )}
    </div>
  )
}
