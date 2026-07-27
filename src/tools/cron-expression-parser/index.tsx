import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"

interface FieldSpec {
  name: string
  min: number
  max: number
  names?: Record<string, number>
}

const MONTH_NAMES = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
]
const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

function nameMap(names: string[], offset: number): Record<string, number> {
  return Object.fromEntries(names.map((name, index) => [name, index + offset]))
}

const FIELDS: FieldSpec[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day of month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12, names: nameMap(MONTH_NAMES, 1) },
  { name: "day of week", min: 0, max: 6, names: nameMap(DAY_NAMES, 0) },
]

function parseField(raw: string, spec: FieldSpec): Set<number> {
  const values = new Set<number>()

  for (const part of raw.split(",")) {
    if (!part) throw new Error(`Field "${spec.name}" has an empty list entry.`)

    const [rangePart, stepPart] = part.split("/")
    let step = 1
    if (stepPart !== undefined) {
      step = Number(stepPart)
      if (!Number.isInteger(step) || step < 1) {
        throw new Error(`Field "${spec.name}" has an invalid step value "${stepPart}".`)
      }
    }

    let start: number
    let end: number

    if (rangePart === "*") {
      start = spec.min
      end = spec.max
    } else if (rangePart.includes("-")) {
      const [from, to] = rangePart.split("-")
      start = readValue(from, spec)
      end = readValue(to, spec)
      if (start > end) {
        throw new Error(`Field "${spec.name}" has a reversed range "${rangePart}".`)
      }
    } else {
      start = readValue(rangePart, spec)
      end = stepPart === undefined ? start : spec.max
    }

    for (let value = start; value <= end; value += step) values.add(value)
  }

  return values
}

function readValue(token: string, spec: FieldSpec): number {
  const upper = token.toUpperCase()
  const named = spec.names?.[upper]
  const value = named ?? Number(token)

  if (token === "" || !Number.isInteger(value)) {
    throw new Error(`Field "${spec.name}" does not understand "${token}".`)
  }
  if (value < spec.min || value > spec.max) {
    throw new Error(
      `Field "${spec.name}" value "${token}" is outside the allowed range ${spec.min} to ${spec.max}.`,
    )
  }
  return value
}

function listValues(values: Set<number>): number[] {
  return [...values].sort((a, b) => a - b)
}

function describeSet(values: Set<number>, spec: FieldSpec, labels?: string[]): string {
  const sorted = listValues(values)
  if (sorted.length === spec.max - spec.min + 1) return "every"
  const rendered = sorted.map((value) =>
    labels ? labels[value - spec.min] : String(value).padStart(2, "0"),
  )
  if (rendered.length === 1) return rendered[0]
  return `${rendered.slice(0, -1).join(", ")} and ${rendered[rendered.length - 1]}`
}

function describe(sets: Set<number>[]): string {
  const [minutes, hours, daysOfMonth, months, daysOfWeek] = sets
  const everyMinute = minutes.size === 60
  const everyHour = hours.size === 24

  let time: string
  if (everyMinute && everyHour) {
    time = "Every minute"
  } else if (everyMinute) {
    time = `Every minute during hour ${describeSet(hours, FIELDS[1])}`
  } else if (everyHour) {
    time = `At minute ${describeSet(minutes, FIELDS[0])} of every hour`
  } else {
    time = `At ${describeSet(hours, FIELDS[1])}:${describeSet(minutes, FIELDS[0])}`
  }

  const parts = [time]
  if (daysOfMonth.size !== 31) {
    parts.push(`on day ${describeSet(daysOfMonth, FIELDS[2])} of the month`)
  }
  if (daysOfWeek.size !== 7) {
    parts.push(`on ${describeSet(daysOfWeek, FIELDS[4], DAY_NAMES)}`)
  }
  if (months.size !== 12) {
    parts.push(`in ${describeSet(months, FIELDS[3], MONTH_NAMES)}`)
  }

  return `${parts.join(", ")}.`
}

function nextRuns(sets: Set<number>[], count: number): Date[] {
  const [minutes, hours, daysOfMonth, months, daysOfWeek] = sets
  const restrictedDom = daysOfMonth.size !== 31
  const restrictedDow = daysOfWeek.size !== 7

  const cursor = new Date()
  cursor.setSeconds(0, 0)
  cursor.setMinutes(cursor.getMinutes() + 1)

  const runs: Date[] = []
  let guard = 0

  while (runs.length < count && guard < 100000) {
    guard++

    if (!months.has(cursor.getMonth() + 1)) {
      cursor.setMonth(cursor.getMonth() + 1, 1)
      cursor.setHours(0, 0, 0, 0)
      continue
    }

    const domMatch = daysOfMonth.has(cursor.getDate())
    const dowMatch = daysOfWeek.has(cursor.getDay())
    const dayMatch =
      restrictedDom && restrictedDow ? domMatch || dowMatch : domMatch && dowMatch

    if (!dayMatch) {
      cursor.setDate(cursor.getDate() + 1)
      cursor.setHours(0, 0, 0, 0)
      continue
    }
    if (!hours.has(cursor.getHours())) {
      cursor.setHours(cursor.getHours() + 1, 0, 0, 0)
      continue
    }
    if (!minutes.has(cursor.getMinutes())) {
      cursor.setMinutes(cursor.getMinutes() + 1, 0, 0)
      continue
    }

    runs.push(new Date(cursor))
    cursor.setMinutes(cursor.getMinutes() + 1, 0, 0)
  }

  return runs
}

const EXAMPLES = ["*/15 * * * *", "0 9 * * MON-FRI", "30 2 1 * *", "0 0 * * 0"]

export default function CronExpressionParser() {
  const [expression, setExpression] = useState("0 9 * * MON-FRI")

  const parsed = useMemo(() => {
    const tokens = expression.trim().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) {
      return { error: "Enter a cron expression to parse." as string, sets: null }
    }
    if (tokens.length !== 5) {
      return {
        error: `A cron expression needs exactly 5 fields, but this one has ${tokens.length}.`,
        sets: null,
      }
    }
    try {
      const sets = FIELDS.map((spec, index) => parseField(tokens[index], spec))
      return { error: null, sets }
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "This expression could not be parsed.",
        sets: null,
      }
    }
  }, [expression])

  const sets = parsed.sets
  const summary = sets ? describe(sets) : ""
  const runs = sets ? nextRuns(sets, 5) : []

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cron-expression">Cron expression</Label>
        <Input
          id="cron-expression"
          name="expression"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="0 9 * * MON-FRI"
          className="mt-1.5 font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1.5 text-xs">
          Field order: minute, hour, day of month, month, day of week.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <Button
            key={example}
            type="button"
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={() => setExpression(example)}
          >
            {example}
          </Button>
        ))}
      </div>

      {parsed.error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{parsed.error}</span>
        </div>
      )}

      {sets && (
        <>
          <div className="border-border/60 rounded-lg border p-4">
            <p className="text-lg font-medium">{summary}</p>
            <div className="mt-3">
              <CopyButton value={summary} label="Copy description" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-border/60 rounded-lg border p-4">
              <h2 className="text-sm font-semibold">Field breakdown</h2>
              <dl className="mt-2 space-y-1 text-sm">
                {FIELDS.map((spec, index) => (
                  <div key={spec.name} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground capitalize">{spec.name}</dt>
                    <dd className="text-right font-mono text-xs break-all">
                      {listValues(sets[index]).join(", ")}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border-border/60 rounded-lg border p-4">
              <h2 className="text-sm font-semibold">Next 5 runs (local time)</h2>
              <ul className="mt-2 space-y-1 font-mono text-xs">
                {runs.length === 0 && (
                  <li className="text-muted-foreground font-sans">
                    This expression never matches a real date.
                  </li>
                )}
                {runs.map((run) => (
                  <li key={run.toISOString()}>{run.toLocaleString()}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
