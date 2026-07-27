import { useMemo, useState } from "react"
import { AlertCircle, X } from "lucide-react"
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

const FALLBACK_ZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
]

function availableZones(): string[] {
  const supported = Intl.supportedValuesOf?.("timeZone")
  const zones = supported && supported.length > 0 ? [...supported] : [...FALLBACK_ZONES]
  if (!zones.includes("UTC")) zones.unshift("UTC")
  return zones
}

function localZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
}

/**
 * Offset in milliseconds between UTC and `zone` at the given instant. Derived
 * by formatting the instant in that zone and reading the parts back, which is
 * the only way to get a historical or daylight-saving-correct offset without
 * shipping a time zone database.
 */
function zoneOffset(instant: number, zone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(instant)).map((part) => [part.type, part.value]),
  )
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  return asUtc - instant
}

/** Converts a wall-clock date and time written in `zone` into a UTC instant. */
function wallClockToInstant(dateTime: string, zone: string): number {
  const [datePart, timePart] = dateTime.split("T")
  const [year, month, day] = datePart.split("-").map(Number)
  const [hour, minute] = timePart.split(":").map(Number)
  const guess = Date.UTC(year, month - 1, day, hour, minute)

  let instant = guess - zoneOffset(guess, zone)
  instant = guess - zoneOffset(instant, zone)
  return instant
}

function formatOffset(offsetMs: number): string {
  const totalMinutes = Math.round(offsetMs / 60000)
  const sign = totalMinutes < 0 ? "-" : "+"
  const absolute = Math.abs(totalMinutes)
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0")
  const minutes = String(absolute % 60).padStart(2, "0")
  return `UTC${sign}${hours}:${minutes}`
}

function formatInZone(instant: number, zone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: zone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(instant))
}

function nowLocalInputValue(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
    now.getHours(),
  )}:${pad(now.getMinutes())}`
}

export default function TimeZoneConverter() {
  const zones = useMemo(availableZones, [])
  const [sourceZone, setSourceZone] = useState(localZone)
  const [dateTime, setDateTime] = useState(nowLocalInputValue)
  const [targets, setTargets] = useState<string[]>(() =>
    ["UTC", "America/New_York", "Europe/London", "Asia/Kolkata"].filter(
      (zone) => zone !== localZone(),
    ),
  )
  const [zoneToAdd, setZoneToAdd] = useState("")

  const instant = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateTime)) return null
    const value = wallClockToInstant(dateTime, sourceZone)
    return Number.isNaN(value) ? null : value
  }, [dateTime, sourceZone])

  const rows = useMemo(() => {
    if (instant === null) return []
    return [sourceZone, ...targets.filter((zone) => zone !== sourceZone)].map((zone) => ({
      zone,
      formatted: formatInZone(instant, zone),
      offset: formatOffset(zoneOffset(instant, zone)),
    }))
  }, [instant, sourceZone, targets])

  const summary = rows
    .map((row) => `${row.zone}: ${row.formatted} (${row.offset})`)
    .join("\n")

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="tz-datetime">Date and time</Label>
          <Input
            id="tz-datetime"
            name="dateTime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="tz-source">Written in this zone</Label>
          <Select
            value={sourceZone}
            onValueChange={(value) => value && setSourceZone(value)}
          >
            <SelectTrigger id="tz-source" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="tz-add">Add a zone to compare</Label>
          <Select
            value={zoneToAdd}
            onValueChange={(value) => value && setZoneToAdd(value)}
          >
            <SelectTrigger id="tz-add" className="mt-1.5 w-full">
              <SelectValue placeholder="Choose a time zone" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={!zoneToAdd || targets.includes(zoneToAdd)}
          onClick={() => {
            setTargets((current) => [...current, zoneToAdd])
            setZoneToAdd("")
          }}
        >
          Add zone
        </Button>
      </div>

      {instant === null && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>Pick a valid date and time to convert.</span>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <ul className="border-border/60 divide-border/60 divide-y rounded-lg border">
            {rows.map((row) => (
              <li
                key={row.zone}
                className="flex flex-wrap items-center justify-between gap-2 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.zone}</p>
                  <p className="text-muted-foreground text-xs">{row.offset}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm tabular-nums">{row.formatted}</span>
                  {row.zone !== sourceZone && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${row.zone}`}
                      onClick={() =>
                        setTargets((current) =>
                          current.filter((zone) => zone !== row.zone),
                        )
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <CopyButton value={summary} label="Copy comparison" />
        </>
      )}
    </div>
  )
}
