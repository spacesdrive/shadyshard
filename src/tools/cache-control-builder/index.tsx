import { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"

type Visibility = "public" | "private" | "no-store"

interface Duration {
  amount: string
  unit: string
}

const UNITS: { value: string; label: string; seconds: number }[] = [
  { value: "seconds", label: "seconds", seconds: 1 },
  { value: "minutes", label: "minutes", seconds: 60 },
  { value: "hours", label: "hours", seconds: 3600 },
  { value: "days", label: "days", seconds: 86400 },
  { value: "years", label: "years", seconds: 31536000 },
]

interface Settings {
  visibility: Visibility
  noCache: boolean
  mustRevalidate: boolean
  immutable: boolean
  noTransform: boolean
  maxAge: Duration
  useSharedMaxAge: boolean
  sharedMaxAge: Duration
  useStaleWhileRevalidate: boolean
  staleWhileRevalidate: Duration
  useStaleIfError: boolean
  staleIfError: Duration
}

const DEFAULTS: Settings = {
  visibility: "public",
  noCache: false,
  mustRevalidate: false,
  immutable: true,
  noTransform: false,
  maxAge: { amount: "1", unit: "years" },
  useSharedMaxAge: false,
  sharedMaxAge: { amount: "1", unit: "days" },
  useStaleWhileRevalidate: false,
  staleWhileRevalidate: { amount: "1", unit: "days" },
  useStaleIfError: false,
  staleIfError: { amount: "7", unit: "days" },
}

const PRESETS: { name: string; description: string; settings: Settings }[] = [
  {
    name: "Fingerprinted asset",
    description: "A JS or CSS file whose name contains a content hash.",
    settings: DEFAULTS,
  },
  {
    name: "HTML behind a CDN",
    description: "Revalidate in the browser, hold a copy at the edge.",
    settings: {
      ...DEFAULTS,
      immutable: false,
      maxAge: { amount: "0", unit: "seconds" },
      useSharedMaxAge: true,
      sharedMaxAge: { amount: "1", unit: "hours" },
      useStaleWhileRevalidate: true,
      staleWhileRevalidate: { amount: "1", unit: "days" },
      useStaleIfError: true,
      staleIfError: { amount: "7", unit: "days" },
    },
  },
  {
    name: "Private API response",
    description: "Cacheable by the browser only, never by a shared cache.",
    settings: {
      ...DEFAULTS,
      visibility: "private",
      immutable: false,
      maxAge: { amount: "60", unit: "seconds" },
    },
  },
  {
    name: "Never store",
    description: "Personal or financial data that must not be kept anywhere.",
    settings: {
      ...DEFAULTS,
      visibility: "no-store",
      immutable: false,
      maxAge: { amount: "0", unit: "seconds" },
    },
  },
]

function toSeconds(duration: Duration): number | null {
  const amount = Number(duration.amount)
  if (!Number.isFinite(amount) || amount < 0) return null
  const unit = UNITS.find((entry) => entry.value === duration.unit)
  if (!unit) return null
  return Math.round(amount * unit.seconds)
}

function formatSeconds(seconds: number): string {
  if (seconds === 0) return "0 seconds"
  for (const unit of [...UNITS].reverse()) {
    if (seconds >= unit.seconds && seconds % unit.seconds === 0) {
      const value = seconds / unit.seconds
      return `${value} ${value === 1 ? unit.label.replace(/s$/, "") : unit.label}`
    }
  }
  return `${seconds} seconds`
}

interface BuildResult {
  header: string
  explanations: string[]
  warnings: string[]
  errors: string[]
}

function build(settings: Settings): BuildResult {
  const directives: string[] = []
  const explanations: string[] = []
  const warnings: string[] = []
  const errors: string[] = []

  if (settings.visibility === "no-store") {
    return {
      header: "no-store",
      explanations: [
        "no-store: no cache, browser or shared, may keep a copy of this response.",
      ],
      warnings: settings.noCache
        ? ["no-cache adds nothing alongside no-store, so it is left out."]
        : [],
      errors: [],
    }
  }

  directives.push(settings.visibility)
  explanations.push(
    settings.visibility === "public"
      ? "public: any cache may store this response, including a shared CDN cache."
      : "private: only the visitor's own browser may store this response, never a shared cache.",
  )

  if (settings.noCache) {
    directives.push("no-cache")
    explanations.push(
      "no-cache: a copy may be stored, but it must be revalidated with the origin before it is reused.",
    )
  }

  const maxAge = toSeconds(settings.maxAge)
  if (maxAge === null) {
    errors.push("Browser lifetime must be zero or a positive number.")
  } else {
    directives.push(`max-age=${maxAge}`)
    explanations.push(
      `max-age=${maxAge}: every cache may reuse this response without asking for ${formatSeconds(maxAge)}.`,
    )
  }

  if (settings.useSharedMaxAge) {
    const shared = toSeconds(settings.sharedMaxAge)
    if (shared === null) {
      errors.push("Shared cache lifetime must be zero or a positive number.")
    } else {
      directives.push(`s-maxage=${shared}`)
      explanations.push(
        `s-maxage=${shared}: a shared cache such as a CDN uses ${formatSeconds(shared)} instead of max-age.`,
      )
    }
  }

  if (settings.useStaleWhileRevalidate) {
    const stale = toSeconds(settings.staleWhileRevalidate)
    if (stale === null) {
      errors.push("stale-while-revalidate must be zero or a positive number.")
    } else {
      directives.push(`stale-while-revalidate=${stale}`)
      explanations.push(
        `stale-while-revalidate=${stale}: for ${formatSeconds(stale)} after it goes stale, the cached copy is served immediately while a fresh one is fetched in the background.`,
      )
    }
  }

  if (settings.useStaleIfError) {
    const stale = toSeconds(settings.staleIfError)
    if (stale === null) {
      errors.push("stale-if-error must be zero or a positive number.")
    } else {
      directives.push(`stale-if-error=${stale}`)
      explanations.push(
        `stale-if-error=${stale}: if the origin returns an error, the stale copy is served for up to ${formatSeconds(stale)}.`,
      )
    }
  }

  if (settings.mustRevalidate) {
    directives.push("must-revalidate")
    explanations.push(
      "must-revalidate: once stale, the cache must not serve the copy at all until it has revalidated it.",
    )
  }

  if (settings.immutable) {
    directives.push("immutable")
    explanations.push(
      "immutable: the body will never change at this URL, so the browser skips revalidation even on reload.",
    )
  }

  if (settings.noTransform) {
    directives.push("no-transform")
    explanations.push(
      "no-transform: an intermediary must not recompress images or otherwise alter the body.",
    )
  }

  if (settings.immutable && maxAge !== null && maxAge < 86400) {
    warnings.push(
      "immutable with a short max-age has little effect. It is meant for a URL containing a content hash, cached for a year.",
    )
  }
  if (settings.immutable && settings.noCache) {
    warnings.push(
      "no-cache and immutable contradict each other: one forces revalidation, the other skips it.",
    )
  }
  if (settings.visibility === "private" && settings.useSharedMaxAge) {
    warnings.push(
      "s-maxage only applies to shared caches, which private already forbids from storing the response.",
    )
  }
  if (settings.useStaleWhileRevalidate && maxAge === 0 && !settings.useSharedMaxAge) {
    warnings.push(
      "With max-age=0 the response is stale immediately, so stale-while-revalidate is what decides how long the cached copy is reused.",
    )
  }

  return { header: directives.join(", "), explanations, warnings, errors }
}

interface DurationFieldProps {
  id: string
  label: string
  value: Duration
  onChange: (value: Duration) => void
  disabled?: boolean
}

function DurationField({ id, label, value, onChange, disabled }: DurationFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5 flex gap-2">
        <Input
          id={id}
          name={id}
          type="number"
          min={0}
          className="w-28"
          value={value.amount}
          disabled={disabled}
          onChange={(event) => onChange({ ...value, amount: event.target.value })}
        />
        <Select
          value={value.unit}
          onValueChange={(unit) => unit && onChange({ ...value, unit: unit as string })}
        >
          <SelectTrigger id={`${id}-unit`} className="w-full" disabled={disabled}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default function CacheControlBuilder() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const result = useMemo(() => build(settings), [settings])

  function update(patch: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...patch }))
  }

  const noStore = settings.visibility === "no-store"

  return (
    <div className="space-y-5">
      <div>
        <span className="text-sm font-medium">Presets</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              title={preset.description}
              onClick={() => setSettings(preset.settings)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cache-visibility">Who may store it</Label>
          <Select
            value={settings.visibility}
            onValueChange={(value) =>
              value && update({ visibility: value as Visibility })
            }
          >
            <SelectTrigger id="cache-visibility" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Any cache (public)</SelectItem>
              <SelectItem value="private">Browser only (private)</SelectItem>
              <SelectItem value="no-store">Nothing may store it (no-store)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DurationField
          id="cache-max-age"
          label="Browser lifetime (max-age)"
          value={settings.maxAge}
          disabled={noStore}
          onChange={(maxAge) => update({ maxAge })}
        />
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-2" disabled={noStore}>
        <legend className="sr-only">Optional directives</legend>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch
              id="cache-shared"
              name="useSharedMaxAge"
              checked={settings.useSharedMaxAge}
              onCheckedChange={(checked) => update({ useSharedMaxAge: checked })}
            />
            <Label htmlFor="cache-shared" className="font-normal">
              Separate CDN lifetime (s-maxage)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="cache-swr"
              name="useStaleWhileRevalidate"
              checked={settings.useStaleWhileRevalidate}
              onCheckedChange={(checked) => update({ useStaleWhileRevalidate: checked })}
            />
            <Label htmlFor="cache-swr" className="font-normal">
              Serve stale while revalidating
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="cache-sie"
              name="useStaleIfError"
              checked={settings.useStaleIfError}
              onCheckedChange={(checked) => update({ useStaleIfError: checked })}
            />
            <Label htmlFor="cache-sie" className="font-normal">
              Serve stale on origin error
            </Label>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch
              id="cache-no-cache"
              name="noCache"
              checked={settings.noCache}
              onCheckedChange={(checked) => update({ noCache: checked })}
            />
            <Label htmlFor="cache-no-cache" className="font-normal">
              Revalidate before every reuse (no-cache)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="cache-must-revalidate"
              name="mustRevalidate"
              checked={settings.mustRevalidate}
              onCheckedChange={(checked) => update({ mustRevalidate: checked })}
            />
            <Label htmlFor="cache-must-revalidate" className="font-normal">
              must-revalidate once stale
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="cache-immutable"
              name="immutable"
              checked={settings.immutable}
              onCheckedChange={(checked) => update({ immutable: checked })}
            />
            <Label htmlFor="cache-immutable" className="font-normal">
              Content never changes (immutable)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="cache-no-transform"
              name="noTransform"
              checked={settings.noTransform}
              onCheckedChange={(checked) => update({ noTransform: checked })}
            />
            <Label htmlFor="cache-no-transform" className="font-normal">
              no-transform
            </Label>
          </div>
        </div>
      </fieldset>

      {!noStore && (
        <div className="grid gap-4 sm:grid-cols-3">
          {settings.useSharedMaxAge && (
            <DurationField
              id="cache-s-maxage"
              label="CDN lifetime (s-maxage)"
              value={settings.sharedMaxAge}
              onChange={(sharedMaxAge) => update({ sharedMaxAge })}
            />
          )}
          {settings.useStaleWhileRevalidate && (
            <DurationField
              id="cache-swr-window"
              label="stale-while-revalidate"
              value={settings.staleWhileRevalidate}
              onChange={(staleWhileRevalidate) => update({ staleWhileRevalidate })}
            />
          )}
          {settings.useStaleIfError && (
            <DurationField
              id="cache-sie-window"
              label="stale-if-error"
              value={settings.staleIfError}
              onChange={(staleIfError) => update({ staleIfError })}
            />
          )}
        </div>
      )}

      <div className="border-border/60 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">Header</span>
          <div className="flex gap-2">
            <CopyButton value={result.header} label="Copy value" />
            <CopyButton
              value={`Cache-Control: ${result.header}`}
              label="Copy full header"
            />
          </div>
        </div>
        <p className="mt-3 font-mono text-sm break-all">Cache-Control: {result.header}</p>
      </div>

      {result.errors.length > 0 && (
        <ul className="border-destructive/30 bg-destructive/10 text-destructive space-y-1 rounded-lg border p-3 text-sm">
          {result.errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {result.warnings.map((message) => (
        <div
          key={message}
          className="border-border/60 bg-muted/40 flex items-start gap-2 rounded-lg border p-3 text-sm"
        >
          <AlertTriangle className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <span>{message}</span>
        </div>
      ))}

      <div>
        <h2 className="text-sm font-medium">What this header does</h2>
        <ul className="text-muted-foreground mt-2 space-y-1.5 text-sm">
          {result.explanations.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
