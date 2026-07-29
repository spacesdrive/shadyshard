import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]
const MAX_RANGE_DAYS = 20_000
const MAX_STEP_DAYS = 5_000

function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function formatLong(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function parseHolidays(text: string): { dates: Set<string>; invalidLines: number[] } {
  const dates = new Set<string>()
  const invalidLines: number[] = []
  text.split("\n").forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) return
    if (parseDate(trimmed)) dates.add(trimmed)
    else invalidLines.push(index + 1)
  })
  return { dates, invalidLines }
}

interface CalendarSettings {
  workingDays: number[]
  holidays: Set<string>
}

function isWorkingDay(date: Date, settings: CalendarSettings): boolean {
  if (!settings.workingDays.includes(date.getDay())) return false
  return !settings.holidays.has(toIsoDate(date))
}

interface DayControlsProps {
  workingDays: number[]
  onChange: (days: number[]) => void
  holidayText: string
  onHolidayTextChange: (value: string) => void
  invalidLines: number[]
}

function DayControls({
  workingDays,
  onChange,
  holidayText,
  onHolidayTextChange,
  invalidLines,
}: DayControlsProps) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium">Working days</legend>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {DAY_NAMES.map((name, index) => (
            <div key={name} className="flex items-center gap-2">
              <Checkbox
                id={`business-day-${index}`}
                name={`workingDay-${index}`}
                checked={workingDays.includes(index)}
                onCheckedChange={(checked) =>
                  onChange(
                    checked === true
                      ? [...workingDays, index].sort((a, b) => a - b)
                      : workingDays.filter((day) => day !== index),
                  )
                }
              />
              <Label htmlFor={`business-day-${index}`} className="font-normal">
                {name}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <Label htmlFor="business-holidays">Holidays to exclude</Label>
        <Textarea
          id="business-holidays"
          name="holidays"
          value={holidayText}
          onChange={(event) => onHolidayTextChange(event.target.value)}
          placeholder={"2026-12-25\n2026-12-26"}
          className="mt-1.5 min-h-24 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          One date per line in YYYY-MM-DD format.
        </p>
      </div>

      {invalidLines.length > 0 && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            Ignoring {invalidLines.length === 1 ? "line" : "lines"}{" "}
            {invalidLines.join(", ")}: dates must be written as YYYY-MM-DD.
          </span>
        </div>
      )}
    </div>
  )
}

export default function BusinessDaysCalculator() {
  const [mode, setMode] = useState("between")
  const [workingDays, setWorkingDays] = useState<number[]>(DEFAULT_WORKING_DAYS)
  const [holidayText, setHolidayText] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [addFrom, setAddFrom] = useState("")
  const [addDays, setAddDays] = useState("10")

  const { dates: holidays, invalidLines } = useMemo(
    () => parseHolidays(holidayText),
    [holidayText],
  )
  const settings = useMemo<CalendarSettings>(
    () => ({ workingDays, holidays }),
    [workingDays, holidays],
  )

  const between = useMemo(() => {
    const start = parseDate(startDate)
    const end = parseDate(endDate)
    if (!start || !end) return null

    const [earlier, later] = start <= end ? [start, end] : [end, start]
    const calendarDays =
      Math.round((later.getTime() - earlier.getTime()) / 86_400_000) + 1
    if (calendarDays > MAX_RANGE_DAYS) {
      return {
        businessDays: 0,
        calendarDays,
        nonWorkingDays: 0,
        holidaysExcluded: 0,
        error: `That range covers ${calendarDays} days. Keep it under ${MAX_RANGE_DAYS}.`,
      }
    }

    let businessDays = 0
    let nonWorkingDays = 0
    let holidaysExcluded = 0
    const cursor = new Date(earlier)

    while (cursor <= later) {
      const isScheduledDay = settings.workingDays.includes(cursor.getDay())
      if (!isScheduledDay) {
        nonWorkingDays += 1
      } else if (settings.holidays.has(toIsoDate(cursor))) {
        holidaysExcluded += 1
      } else {
        businessDays += 1
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    return {
      businessDays,
      calendarDays,
      nonWorkingDays,
      holidaysExcluded,
      error: null as string | null,
    }
  }, [startDate, endDate, settings])

  const added = useMemo(() => {
    const from = parseDate(addFrom)
    const count = Number(addDays)
    if (!from || !Number.isInteger(count)) return null
    if (Math.abs(count) > MAX_STEP_DAYS) {
      return {
        result: null,
        error: `Keep the number of business days under ${MAX_STEP_DAYS}.`,
      }
    }
    if (settings.workingDays.length === 0) {
      return { result: null, error: "Select at least one working day." }
    }

    const result = new Date(from)
    const step = count >= 0 ? 1 : -1
    let remaining = Math.abs(count)
    while (remaining > 0) {
      result.setDate(result.getDate() + step)
      if (isWorkingDay(result, settings)) remaining -= 1
    }
    return { result, error: null as string | null }
  }, [addFrom, addDays, settings])

  const noWorkingDays = workingDays.length === 0

  const betweenSummary =
    between && !between.error
      ? [
          `From ${startDate} to ${endDate}`,
          `Business days: ${between.businessDays}`,
          `Calendar days: ${between.calendarDays}`,
          `Non-working days: ${between.nonWorkingDays}`,
          `Holidays excluded: ${between.holidaysExcluded}`,
        ].join("\n")
      : ""

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)}>
        <TabsList>
          <TabsTrigger value="between">Between two dates</TabsTrigger>
          <TabsTrigger value="add">Add business days</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "between" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="business-start">Start date</Label>
            <Input
              id="business-start"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="business-end">End date</Label>
            <Input
              id="business-end"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="business-from">Starting date</Label>
            <Input
              id="business-from"
              name="addFrom"
              type="date"
              value={addFrom}
              onChange={(event) => setAddFrom(event.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="business-count">Business days to add</Label>
            <Input
              id="business-count"
              name="addDays"
              type="number"
              step={1}
              value={addDays}
              onChange={(event) => setAddDays(event.target.value)}
              className="mt-1.5"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Use a negative number to count backwards.
            </p>
          </div>
        </div>
      )}

      <DayControls
        workingDays={workingDays}
        onChange={setWorkingDays}
        holidayText={holidayText}
        onHolidayTextChange={setHolidayText}
        invalidLines={invalidLines}
      />

      {noWorkingDays && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>Select at least one working day to calculate anything.</span>
        </div>
      )}

      {mode === "between" && !noWorkingDays && (
        <>
          {!between && (
            <p className="text-muted-foreground text-sm">
              Pick a start and end date to count the working days between them.
            </p>
          )}
          {between?.error && <p className="text-destructive text-sm">{between.error}</p>}
          {between && !between.error && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Business days", value: between.businessDays },
                  { label: "Calendar days", value: between.calendarDays },
                  { label: "Non-working days", value: between.nonWorkingDays },
                  { label: "Holidays excluded", value: between.holidaysExcluded },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="border-border/60 rounded-lg border p-3 text-center"
                  >
                    <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
              <CopyButton value={betweenSummary} label="Copy summary" />
            </>
          )}
        </>
      )}

      {mode === "add" && !noWorkingDays && (
        <>
          {!added && (
            <p className="text-muted-foreground text-sm">
              Pick a starting date and a whole number of business days.
            </p>
          )}
          {added?.error && <p className="text-destructive text-sm">{added.error}</p>}
          {added?.result && (
            <div className="border-border/60 rounded-xl border p-4">
              <p className="text-muted-foreground text-xs">Resulting date</p>
              <p className="mt-1 text-2xl font-semibold">{formatLong(added.result)}</p>
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                {toIsoDate(added.result)}
              </p>
              <div className="mt-3">
                <CopyButton value={toIsoDate(added.result)} label="Copy date" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
