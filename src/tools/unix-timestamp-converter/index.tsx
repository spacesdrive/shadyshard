import { useEffect, useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"

type Unit = "auto" | "seconds" | "milliseconds"

function relativeTime(target: Date, from: number): string {
  const diffSeconds = Math.round((target.getTime() - from) / 1000)
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
  const thresholds: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ]

  for (const [unit, seconds] of thresholds) {
    if (Math.abs(diffSeconds) >= seconds) {
      return formatter.format(Math.round(diffSeconds / seconds), unit)
    }
  }
  return formatter.format(diffSeconds, "second")
}

function toLocalInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export default function UnixTimestampConverter() {
  const [timestamp, setTimestamp] = useState(() => String(Math.floor(Date.now() / 1000)))
  const [unit, setUnit] = useState<Unit>("auto")
  const [dateValue, setDateValue] = useState(() => toLocalInputValue(new Date()))
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const decoded = useMemo(() => {
    const trimmed = timestamp.trim()
    if (!trimmed) return { rows: null, error: null, detected: null }
    if (!/^-?\d+$/.test(trimmed)) {
      return {
        rows: null,
        detected: null,
        error: "A Unix timestamp is a whole number of seconds or milliseconds.",
      }
    }

    const value = Number(trimmed)
    const digits = trimmed.replace("-", "").length
    const detected: Exclude<Unit, "auto"> =
      unit === "auto" ? (digits >= 12 ? "milliseconds" : "seconds") : unit
    const millis = detected === "seconds" ? value * 1000 : value
    const date = new Date(millis)

    if (Number.isNaN(date.getTime())) {
      return { rows: null, detected, error: "This value is outside the range of a date." }
    }

    return {
      detected,
      error: null,
      rows: [
        ["Local time", date.toLocaleString()],
        ["UTC", date.toUTCString()],
        ["ISO 8601", date.toISOString()],
        ["Relative", relativeTime(date, now)],
        ["Seconds", String(Math.floor(millis / 1000))],
        ["Milliseconds", String(millis)],
      ] as [string, string][],
    }
  }, [timestamp, unit, now])

  const encoded = useMemo(() => {
    if (!dateValue) return { seconds: "", milliseconds: "", error: null }
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) {
      return { seconds: "", milliseconds: "", error: "Pick a valid date and time." }
    }
    return {
      seconds: String(Math.floor(date.getTime() / 1000)),
      milliseconds: String(date.getTime()),
      error: null,
    }
  }, [dateValue])

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Timestamp to date</h2>

        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
          <div>
            <Label htmlFor="timestamp-input">Unix timestamp</Label>
            <Input
              id="timestamp-input"
              name="timestamp"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="1767225600"
              className="mt-1.5 font-mono text-sm"
              spellCheck={false}
            />
          </div>
          <div>
            <Label htmlFor="timestamp-unit">Unit</Label>
            <Select
              value={unit}
              onValueChange={(value) => value && setUnit(value as Unit)}
            >
              <SelectTrigger id="timestamp-unit" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Detect automatically</SelectItem>
                <SelectItem value="seconds">Seconds</SelectItem>
                <SelectItem value="milliseconds">Milliseconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTimestamp(String(Math.floor(Date.now() / 1000)))}
          >
            Use current time
          </Button>
          {decoded.detected && unit === "auto" && (
            <p className="text-muted-foreground self-center text-xs">
              Read as {decoded.detected}.
            </p>
          )}
        </div>

        {decoded.error && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{decoded.error}</span>
          </div>
        )}

        {decoded.rows && (
          <dl className="border-border/60 divide-border/60 divide-y rounded-lg border">
            {decoded.rows.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-muted-foreground text-sm">{label}</dt>
                <dd className="flex items-center gap-2 font-mono text-sm break-all">
                  {value}
                  <CopyButton
                    value={value}
                    label={`Copy ${label}`}
                    size="icon-sm"
                    variant="ghost"
                  />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Date to timestamp</h2>

        <div>
          <Label htmlFor="timestamp-date">Local date and time</Label>
          <Input
            id="timestamp-date"
            name="date"
            type="datetime-local"
            step={1}
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="mt-1.5 max-w-72"
          />
        </div>

        {encoded.error && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{encoded.error}</span>
          </div>
        )}

        {!encoded.error && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Seconds", encoded.seconds],
              ["Milliseconds", encoded.milliseconds],
            ].map(([label, value]) => (
              <div
                key={label}
                className="border-border/60 flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="truncate font-mono text-sm">{value}</p>
                </div>
                <CopyButton
                  value={value}
                  label={`Copy ${label}`}
                  size="icon-sm"
                  variant="ghost"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
