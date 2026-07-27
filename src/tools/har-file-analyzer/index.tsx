import { useState } from "react"
import { AlertCircle, ShieldAlert } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"
import { formatBytes } from "@/lib/image"

interface HarEntry {
  url: string
  method: string
  status: number
  contentType: string
  time: number
  transferSize: number
  contentSize: number
  hasCredentials: boolean
}

interface Analysis {
  fileName: string
  entries: HarEntry[]
  totalTransfer: number
  totalContent: number
  totalTime: number
  credentialed: number
  byStatus: [string, number][]
  byType: [string, number][]
}

function shortenUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.host}${parsed.pathname}`
  } catch {
    return url
  }
}

function groupCount(values: string[]): [string, number][] {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

function normaliseType(mimeType: string): string {
  const base = mimeType.split(";")[0].trim().toLowerCase()
  return base || "unknown"
}

function analyze(fileName: string, raw: string): Analysis {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error("This file is not valid JSON, so it cannot be a HAR capture.")
  }

  const log = (parsed as { log?: { entries?: unknown[] } }).log
  if (!log || !Array.isArray(log.entries)) {
    throw new Error('This JSON has no "log.entries" array, so it is not a HAR capture.')
  }
  if (log.entries.length === 0) {
    throw new Error("This HAR file contains no request entries.")
  }

  const entries: HarEntry[] = log.entries.map((raw) => {
    const entry = raw as {
      request?: { url?: string; method?: string; headers?: { name?: string }[] }
      response?: {
        status?: number
        content?: { mimeType?: string; size?: number }
        _transferSize?: number
        bodySize?: number
      }
      time?: number
    }
    const headers = entry.request?.headers ?? []
    const hasCredentials = headers.some((header) =>
      ["cookie", "authorization"].includes((header.name ?? "").toLowerCase()),
    )
    const contentSize = Math.max(0, entry.response?.content?.size ?? 0)
    const wireSize = entry.response?._transferSize ?? entry.response?.bodySize ?? 0

    return {
      url: entry.request?.url ?? "",
      method: entry.request?.method ?? "GET",
      status: entry.response?.status ?? 0,
      contentType: normaliseType(entry.response?.content?.mimeType ?? ""),
      time: Math.max(0, entry.time ?? 0),
      transferSize: Math.max(0, wireSize),
      contentSize,
      hasCredentials,
    }
  })

  return {
    fileName,
    entries,
    totalTransfer: entries.reduce((sum, entry) => sum + entry.transferSize, 0),
    totalContent: entries.reduce((sum, entry) => sum + entry.contentSize, 0),
    totalTime: entries.reduce((sum, entry) => sum + entry.time, 0),
    credentialed: entries.filter((entry) => entry.hasCredentials).length,
    byStatus: groupCount(entries.map((entry) => String(entry.status || "no response"))),
    byType: groupCount(entries.map((entry) => entry.contentType)),
  }
}

function summaryText(analysis: Analysis): string {
  return [
    `HAR summary for ${analysis.fileName}`,
    `Requests: ${analysis.entries.length}`,
    `Transferred: ${formatBytes(analysis.totalTransfer)}`,
    `Uncompressed content: ${formatBytes(analysis.totalContent)}`,
    `Total request time: ${(analysis.totalTime / 1000).toFixed(2)} s`,
    `Status codes: ${analysis.byStatus.map(([code, count]) => `${code} (${count})`).join(", ")}`,
  ].join("\n")
}

export default function HarFileAnalyzer() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: File[]) {
    setError(null)
    try {
      const text = await files[0].text()
      setAnalysis(analyze(files[0].name, text))
    } catch (e) {
      setAnalysis(null)
      setError(e instanceof Error ? e.message : "This file could not be read.")
    }
  }

  const slowest = analysis
    ? [...analysis.entries].sort((a, b) => b.time - a.time).slice(0, 8)
    : []
  const largest = analysis
    ? [...analysis.entries].sort((a, b) => b.transferSize - a.transferSize).slice(0, 8)
    : []

  return (
    <div className="space-y-5">
      {!analysis && (
        <FileDropZone
          accept=".har,application/json"
          onFiles={handleFiles}
          hint="A .har file exported from your browser's Network panel"
        />
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {analysis && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-auto truncate text-sm font-medium">{analysis.fileName}</p>
            <CopyButton value={summaryText(analysis)} label="Copy summary" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAnalysis(null)
                setError(null)
              }}
            >
              Analyze another file
            </Button>
          </div>

          {analysis.credentialed > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                {analysis.credentialed} of {analysis.entries.length} requests carry a
                cookie or authorization header. Treat this capture as a secret before
                sharing it.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Requests", String(analysis.entries.length)],
              ["Transferred", formatBytes(analysis.totalTransfer)],
              ["Uncompressed", formatBytes(analysis.totalContent)],
              ["Total time", `${(analysis.totalTime / 1000).toFixed(2)} s`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="border-border/60 rounded-lg border p-3 text-center"
              >
                <p className="text-xl font-semibold tabular-nums">{value}</p>
                <p className="text-muted-foreground mt-1 text-xs">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-border/60 rounded-lg border p-4">
              <h2 className="text-sm font-semibold">By status code</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {analysis.byStatus.map(([code, count]) => (
                  <li key={code} className="flex justify-between gap-3">
                    <span className="font-mono">{code}</span>
                    <span className="text-muted-foreground tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-border/60 rounded-lg border p-4">
              <h2 className="text-sm font-semibold">By content type</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {analysis.byType.slice(0, 8).map(([type, count]) => (
                  <li key={type} className="flex justify-between gap-3">
                    <span className="truncate font-mono text-xs">{type}</span>
                    <span className="text-muted-foreground tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-border/60 rounded-lg border p-4">
              <h2 className="text-sm font-semibold">Slowest requests</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {slowest.map((entry, index) => (
                  <li key={`${entry.url}-${index}`} className="min-w-0">
                    <p className="truncate font-mono text-xs">{shortenUrl(entry.url)}</p>
                    <p className="text-muted-foreground text-xs">
                      {entry.method} {entry.status} - {entry.time.toFixed(0)} ms
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-border/60 rounded-lg border p-4">
              <h2 className="text-sm font-semibold">Largest responses</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {largest.map((entry, index) => (
                  <li key={`${entry.url}-${index}`} className="min-w-0">
                    <p className="truncate font-mono text-xs">{shortenUrl(entry.url)}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(entry.transferSize)} transferred
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
