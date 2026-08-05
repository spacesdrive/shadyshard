import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const TRACKING_PARAMETERS = new Set([
  "gclid",
  "gclsrc",
  "gbraid",
  "wbraid",
  "dclid",
  "gad_source",
  "gad_campaignid",
  "fbclid",
  "fb_action_ids",
  "fb_action_types",
  "fb_source",
  "fb_ref",
  "msclkid",
  "twclid",
  "ttclid",
  "ttc_id",
  "li_fat_id",
  "igshid",
  "igsh",
  "yclid",
  "ysclid",
  "epik",
  "rb_clickid",
  "s_cid",
  "mc_cid",
  "mc_eid",
  "mkt_tok",
  "_openstat",
  "ref_src",
  "ref_url",
  "otc",
  "cmpid",
  "campaign_id",
  "oly_anon_id",
  "oly_enc_id",
  "vero_conv",
  "vero_id",
  "wickedid",
  "wickedsource",
])

const TRACKING_PREFIXES = ["utm_", "hsa_", "_hs", "pk_", "mtm_", "matomo_", "piwik_"]

function isTracking(name: string, extra: Set<string>, keep: Set<string>): boolean {
  const lower = name.toLowerCase()
  if (keep.has(lower)) return false
  if (extra.has(lower)) return true
  if (TRACKING_PARAMETERS.has(lower)) return true
  return TRACKING_PREFIXES.some((prefix) => lower.startsWith(prefix))
}

function toNameSet(value: string): Set<string> {
  return new Set(
    value
      .split(/[\s,]+/)
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean),
  )
}

interface CleanOptions {
  extra: Set<string>
  keep: Set<string>
  removeFragment: boolean
  removeAllQuery: boolean
  deduplicate: boolean
}

interface CleanResult {
  output: string
  removedCounts: Map<string, number>
  invalid: string[]
  total: number
  duplicatesRemoved: number
}

function clean(input: string, options: CleanOptions): CleanResult {
  const removedCounts = new Map<string, number>()
  const invalid: string[] = []
  const cleaned: string[] = []
  const seen = new Set<string>()
  let duplicatesRemoved = 0
  let total = 0

  for (const line of input.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    total++

    let url: URL
    try {
      url = new URL(trimmed)
    } catch {
      invalid.push(trimmed)
      cleaned.push(trimmed)
      continue
    }

    const names = [...new Set(Array.from(url.searchParams.keys()))]
    for (const name of names) {
      const remove = options.removeAllQuery
        ? !options.keep.has(name.toLowerCase())
        : isTracking(name, options.extra, options.keep)
      if (!remove) continue
      const occurrences = url.searchParams.getAll(name).length
      removedCounts.set(name, (removedCounts.get(name) ?? 0) + occurrences)
      url.searchParams.delete(name)
    }

    if (options.removeFragment) url.hash = ""

    let result = url.toString()
    if (result.endsWith("?")) result = result.slice(0, -1)

    if (options.deduplicate) {
      if (seen.has(result)) {
        duplicatesRemoved++
        continue
      }
      seen.add(result)
    }
    cleaned.push(result)
  }

  return {
    output: cleaned.join("\n"),
    removedCounts,
    invalid,
    total,
    duplicatesRemoved,
  }
}

export default function UrlTrackingRemover() {
  const [input, setInput] = useState("")
  const [extra, setExtra] = useState("")
  const [keep, setKeep] = useState("")
  const [removeFragment, setRemoveFragment] = useState(false)
  const [removeAllQuery, setRemoveAllQuery] = useState(false)
  const [deduplicate, setDeduplicate] = useState(false)

  const result = useMemo(
    () =>
      clean(input, {
        extra: toNameSet(extra),
        keep: toNameSet(keep),
        removeFragment,
        removeAllQuery,
        deduplicate,
      }),
    [input, extra, keep, removeFragment, removeAllQuery, deduplicate],
  )

  const removed = useMemo(
    () => [...result.removedCounts.entries()].sort((a, b) => b[1] - a[1]),
    [result.removedCounts],
  )

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="url-cleaner-input">URLs</Label>
        <Textarea
          id="url-cleaner-input"
          name="urls"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            "https://example.com/post?utm_source=newsletter&utm_medium=email&id=42\nhttps://shop.example.com/item?fbclid=IwAR123&variant=blue"
          }
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          One URL per line. Include the scheme, for example https://.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="url-cleaner-extra">Also remove these parameters</Label>
          <Input
            id="url-cleaner-extra"
            name="extra"
            value={extra}
            onChange={(event) => setExtra(event.target.value)}
            placeholder="ref, source, aff_id"
            className="mt-1.5 font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="url-cleaner-keep">Always keep these parameters</Label>
          <Input
            id="url-cleaner-keep"
            name="keep"
            value={keep}
            onChange={(event) => setKeep(event.target.value)}
            placeholder="utm_id, page"
            className="mt-1.5 font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="url-cleaner-fragment"
            name="removeFragment"
            checked={removeFragment}
            onCheckedChange={setRemoveFragment}
          />
          <Label htmlFor="url-cleaner-fragment" className="font-normal">
            Remove the fragment
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="url-cleaner-all"
            name="removeAllQuery"
            checked={removeAllQuery}
            onCheckedChange={setRemoveAllQuery}
          />
          <Label htmlFor="url-cleaner-all" className="font-normal">
            Remove every query parameter
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="url-cleaner-dedupe"
            name="deduplicate"
            checked={deduplicate}
            onCheckedChange={setDeduplicate}
          />
          <Label htmlFor="url-cleaner-dedupe" className="font-normal">
            Remove duplicate results
          </Label>
        </div>
      </div>

      {result.total > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">URLs processed</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{result.total}</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Parameters removed</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {removed.reduce((total, [, count]) => total + count, 0)}
            </p>
          </div>
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Duplicates dropped</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {result.duplicatesRemoved}
            </p>
          </div>
        </div>
      )}

      {removed.length > 0 && (
        <div>
          <h2 className="text-sm font-medium">Parameters found</h2>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {removed.map(([name, count]) => (
              <li
                key={name}
                className="border-border/60 bg-muted/40 rounded border px-2 py-1 font-mono text-xs"
              >
                {name} x{count}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.invalid.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          {result.invalid.length} line{result.invalid.length === 1 ? "" : "s"} could not
          be read as a URL and were passed through unchanged. The usual cause is a missing
          https:// prefix.
        </div>
      )}

      <div>
        <Label htmlFor="url-cleaner-output">Cleaned URLs</Label>
        <Textarea
          id="url-cleaner-output"
          name="output"
          value={result.output}
          readOnly
          placeholder="Cleaned URLs will appear here."
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result.output} label="Copy URLs" />
        <DownloadButton
          getBlob={() => new Blob([result.output], { type: "text/plain" })}
          filename="cleaned-urls.txt"
          disabled={!result.output}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setInput("")
            setExtra("")
            setKeep("")
            setRemoveFragment(false)
            setRemoveAllQuery(false)
            setDeduplicate(false)
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
