import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

const UNIT_SECONDS: Record<string, number> = {
  h: 3600,
  hr: 3600,
  hrs: 3600,
  hour: 3600,
  hours: 3600,
  m: 60,
  min: 60,
  mins: 60,
  minute: 60,
  minutes: 60,
  s: 1,
  sec: 1,
  secs: 1,
  second: 1,
  seconds: 1,
}

/** Returns the duration in seconds, or null when the text cannot be read. */
function parseDuration(raw: string): number | null {
  const text = raw.trim().toLowerCase()
  if (!text) return null

  const clock = text.match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/)
  if (clock) {
    return Number(clock[1]) * 3600 + Number(clock[2]) * 60 + Number(clock[3] ?? 0)
  }

  const units = [...text.matchAll(/(\d+(?:\.\d+)?)\s*([a-z]+)/g)]
  if (units.length > 0) {
    let total = 0
    for (const [, amount, unit] of units) {
      const seconds = UNIT_SECONDS[unit]
      if (seconds === undefined) return null
      total += Number(amount) * seconds
    }
    return total
  }

  if (/^\d+(\.\d+)?$/.test(text)) return Number(text) * 60

  return null
}

function formatDuration(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? "-" : ""
  const seconds = Math.round(Math.abs(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return `${sign}${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
}

function decimalHours(totalSeconds: number): string {
  return (totalSeconds / 3600).toFixed(2)
}

interface StatGridProps {
  stats: { label: string; value: string }[]
}

function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="border-border/60 rounded-lg border p-3 text-center"
        >
          <p className="text-xl font-semibold tabular-nums">{stat.value}</p>
          <p className="text-muted-foreground mt-1 text-xs">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

const SAMPLE_DURATIONS = "1:45\n2h 30m\n90m\n0:20"

function AddDurations() {
  const [input, setInput] = useState(SAMPLE_DURATIONS)

  const parsed = useMemo(() => {
    const entries: number[] = []
    const errors: number[] = []
    input.split("\n").forEach((line, index) => {
      if (!line.trim()) return
      const seconds = parseDuration(line)
      if (seconds === null) errors.push(index + 1)
      else entries.push(seconds)
    })
    return { entries, errors }
  }, [input])

  const total = parsed.entries.reduce((sum, seconds) => sum + seconds, 0)
  const average = parsed.entries.length ? total / parsed.entries.length : 0

  const summary = [
    `Entries: ${parsed.entries.length}`,
    `Total: ${formatDuration(total)}`,
    `Decimal hours: ${decimalHours(total)}`,
    `Total minutes: ${Math.round(total / 60)}`,
    `Average: ${formatDuration(average)}`,
  ].join("\n")

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="duration-list">Durations, one per line</Label>
        <Textarea
          id="duration-list"
          name="durations"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Accepts 1:45, 1:45:30, 2h 15m, 1.5h, 45s, and bare numbers read as minutes.
        </p>
      </div>

      {parsed.errors.length > 0 && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            Could not read {parsed.errors.length === 1 ? "line" : "lines"}{" "}
            {parsed.errors.join(", ")}. Those lines were skipped.
          </span>
        </div>
      )}

      <StatGrid
        stats={[
          { label: "Total", value: formatDuration(total) },
          { label: "Decimal hours", value: decimalHours(total) },
          { label: "Total minutes", value: String(Math.round(total / 60)) },
          { label: "Average entry", value: formatDuration(average) },
        ]}
      />

      <CopyButton value={summary} label="Copy summary" />
    </div>
  )
}

function BetweenTimes() {
  const [start, setStart] = useState("09:00")
  const [end, setEnd] = useState("17:30")
  const [breakMinutes, setBreakMinutes] = useState("30")

  const startSeconds = parseDuration(start)
  const endSeconds = parseDuration(end)
  const breakValue = Number(breakMinutes)
  const breakError =
    breakMinutes !== "" && (!Number.isFinite(breakValue) || breakValue < 0)
      ? "Break minutes must be zero or more."
      : null

  const valid = startSeconds !== null && endSeconds !== null && !breakError

  const grossSeconds = valid
    ? endSeconds >= startSeconds
      ? endSeconds - startSeconds
      : endSeconds + 86_400 - startSeconds
    : 0
  const netSeconds = Math.max(
    0,
    grossSeconds - (breakMinutes === "" ? 0 : breakValue * 60),
  )

  const summary = [
    `Start: ${start}`,
    `End: ${end}`,
    `Break: ${breakMinutes || 0} minutes`,
    `Worked: ${formatDuration(netSeconds)}`,
    `Decimal hours: ${decimalHours(netSeconds)}`,
  ].join("\n")

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="duration-start">Start time</Label>
          <Input
            id="duration-start"
            name="start"
            type="time"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="duration-end">End time</Label>
          <Input
            id="duration-end"
            name="end"
            type="time"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="duration-break">Unpaid break (minutes)</Label>
          <Input
            id="duration-break"
            name="breakMinutes"
            type="number"
            min={0}
            step={5}
            value={breakMinutes}
            onChange={(event) => setBreakMinutes(event.target.value)}
            className="mt-1.5"
            aria-invalid={breakError ? true : undefined}
          />
        </div>
      </div>

      {breakError && <p className="text-destructive text-sm">{breakError}</p>}

      {!valid && !breakError && (
        <p className="text-muted-foreground text-sm">
          Enter both a start and an end time to calculate the duration.
        </p>
      )}

      {valid && (
        <>
          {endSeconds < startSeconds && (
            <p className="text-muted-foreground text-sm">
              The end time is earlier than the start time, so this is treated as an
              overnight shift.
            </p>
          )}
          <StatGrid
            stats={[
              { label: "Worked", value: formatDuration(netSeconds) },
              { label: "Decimal hours", value: decimalHours(netSeconds) },
              { label: "Before break", value: formatDuration(grossSeconds) },
              {
                label: "Total minutes",
                value: String(Math.round(netSeconds / 60)),
              },
            ]}
          />
          <CopyButton value={summary} label="Copy summary" />
        </>
      )}
    </div>
  )
}

export default function TimeDurationCalculator() {
  const [mode, setMode] = useState("add")

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)}>
        <TabsList>
          <TabsTrigger value="add">Add durations</TabsTrigger>
          <TabsTrigger value="between">Start and end time</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "add" ? <AddDurations /> : <BetweenTimes />}
    </div>
  )
}
