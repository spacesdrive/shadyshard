import { useState } from "react"
import { GitCompareArrows, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type DiffEntry =
  | { path: string; type: "added"; after: unknown }
  | { path: string; type: "removed"; before: unknown }
  | { path: string; type: "changed"; before: unknown; after: unknown }

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function diffValues(a: unknown, b: unknown, path: string, entries: DiffEntry[]) {
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of keys) {
      const childPath = path ? `${path}.${key}` : key
      const hasA = key in a
      const hasB = key in b
      if (hasA && !hasB)
        entries.push({ path: childPath, type: "removed", before: a[key] })
      else if (!hasA && hasB)
        entries.push({ path: childPath, type: "added", after: b[key] })
      else diffValues(a[key], b[key], childPath, entries)
    }
    return
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLength = Math.max(a.length, b.length)
    for (let i = 0; i < maxLength; i++) {
      const childPath = `${path}[${i}]`
      const hasA = i < a.length
      const hasB = i < b.length
      if (hasA && !hasB) entries.push({ path: childPath, type: "removed", before: a[i] })
      else if (!hasA && hasB)
        entries.push({ path: childPath, type: "added", after: b[i] })
      else diffValues(a[i], b[i], childPath, entries)
    }
    return
  }

  if (JSON.stringify(a) !== JSON.stringify(b)) {
    entries.push({ path: path || "(root)", type: "changed", before: a, after: b })
  }
}

function diffJson(a: unknown, b: unknown): DiffEntry[] {
  const entries: DiffEntry[] = []
  diffValues(a, b, "", entries)
  return entries
}

function formatValue(value: unknown): string {
  return value === undefined ? "undefined" : JSON.stringify(value)
}

const BADGE_STYLES: Record<DiffEntry["type"], string> = {
  added: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  removed: "border-destructive/30 bg-destructive/10 text-destructive",
  changed: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

const BADGE_LABELS: Record<DiffEntry["type"], string> = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
}

export default function JsonCompare() {
  const [left, setLeft] = useState("")
  const [right, setRight] = useState("")
  const [entries, setEntries] = useState<DiffEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleCompare() {
    if (!left.trim() || !right.trim()) {
      setEntries(null)
      setError("Paste JSON into both fields to compare.")
      return
    }
    let parsedLeft: unknown
    let parsedRight: unknown
    try {
      parsedLeft = JSON.parse(left)
    } catch (e) {
      setEntries(null)
      setError(`Left JSON is invalid: ${e instanceof Error ? e.message : "parse error"}`)
      return
    }
    try {
      parsedRight = JSON.parse(right)
    } catch (e) {
      setEntries(null)
      setError(`Right JSON is invalid: ${e instanceof Error ? e.message : "parse error"}`)
      return
    }
    setError(null)
    setEntries(diffJson(parsedLeft, parsedRight))
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="json-compare-left">Left (before)</Label>
          <Textarea
            id="json-compare-left"
            name="left"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder='{"example": "First JSON document..."}'
            className="mt-1.5 min-h-52 resize-y font-mono text-sm"
            aria-label="Left JSON document"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="json-compare-right">Right (after)</Label>
          <Textarea
            id="json-compare-right"
            name="right"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder='{"example": "Second JSON document..."}'
            className="mt-1.5 min-h-52 resize-y font-mono text-sm"
            aria-label="Right JSON document"
            spellCheck={false}
          />
        </div>
      </div>

      <Button onClick={handleCompare} disabled={!left || !right}>
        <GitCompareArrows className="size-4" />
        Compare
      </Button>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {entries &&
        (entries.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No differences found - both documents are equivalent.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry, index) => (
              <li key={index} className="border-border/60 rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={BADGE_STYLES[entry.type]}>
                    {BADGE_LABELS[entry.type]}
                  </Badge>
                  <code className="text-muted-foreground font-mono text-xs">
                    {entry.path}
                  </code>
                </div>
                <div className="mt-2 space-y-1 font-mono text-xs">
                  {"before" in entry && (
                    <p className="text-destructive">- {formatValue(entry.before)}</p>
                  )}
                  {"after" in entry && (
                    <p className="text-emerald-600 dark:text-emerald-400">
                      + {formatValue(entry.after)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}
