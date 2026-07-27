import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { DownloadButton } from "@/components/tool/DownloadButton"

const RECURRENCE = [
  { value: "none", label: "Does not repeat" },
  { value: "FREQ=DAILY", label: "Every day" },
  { value: "FREQ=WEEKLY", label: "Every week" },
  { value: "FREQ=MONTHLY", label: "Every month" },
  { value: "FREQ=YEARLY", label: "Every year" },
]

const REMINDERS = [
  { value: "none", label: "No reminder" },
  { value: "5", label: "5 minutes before" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "1440", label: "1 day before" },
]

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
}

function toUtcStamp(value: Date): string {
  return `${value.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`
}

function toDateStamp(value: string): string {
  return value.replace(/-/g, "")
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Folds a line at 75 octets, as iCalendar requires for long values. */
function fold(line: string): string {
  if (line.length <= 75) return line
  const chunks = [line.slice(0, 75)]
  let rest = line.slice(75)
  while (rest.length > 74) {
    chunks.push(` ${rest.slice(0, 74)}`)
    rest = rest.slice(74)
  }
  if (rest) chunks.push(` ${rest}`)
  return chunks.join("\r\n")
}

interface EventInput {
  title: string
  location: string
  description: string
  allDay: boolean
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  recurrence: string
  reminder: string
}

function buildIcs(input: EventInput): string {
  const uid = `${crypto.randomUUID()}@shadyshard`
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ShadyShard//ICS Event Generator//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `SUMMARY:${escapeText(input.title)}`,
  ]

  if (input.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${toDateStamp(input.startDate)}`)
    lines.push(`DTEND;VALUE=DATE:${toDateStamp(addDays(input.endDate, 1))}`)
  } else {
    lines.push(`DTSTART:${toUtcStamp(new Date(`${input.startDate}T${input.startTime}`))}`)
    lines.push(`DTEND:${toUtcStamp(new Date(`${input.endDate}T${input.endTime}`))}`)
  }

  if (input.location) lines.push(`LOCATION:${escapeText(input.location)}`)
  if (input.description) lines.push(`DESCRIPTION:${escapeText(input.description)}`)
  if (input.recurrence !== "none") lines.push(`RRULE:${input.recurrence}`)

  if (input.reminder !== "none") {
    lines.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(input.title)}`,
      `TRIGGER:-PT${input.reminder}M`,
      "END:VALARM",
    )
  }

  lines.push("END:VEVENT", "END:VCALENDAR")
  return lines.map(fold).join("\r\n")
}

function todayValue(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function IcsEventGenerator() {
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [allDay, setAllDay] = useState(false)
  const [startDate, setStartDate] = useState(todayValue)
  const [startTime, setStartTime] = useState("09:00")
  const [endDate, setEndDate] = useState(todayValue)
  const [endTime, setEndTime] = useState("10:00")
  const [recurrence, setRecurrence] = useState("none")
  const [reminder, setReminder] = useState("none")

  const { ics, error } = useMemo(() => {
    if (!title.trim()) return { ics: "", error: "Enter an event title." }
    if (!startDate || !endDate) return { ics: "", error: "Pick a start and end date." }

    const start = allDay
      ? new Date(`${startDate}T00:00:00`)
      : new Date(`${startDate}T${startTime}`)
    const end = allDay
      ? new Date(`${endDate}T00:00:00`)
      : new Date(`${endDate}T${endTime}`)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { ics: "", error: "The start or end time is not a valid date." }
    }
    if (allDay ? end < start : end <= start) {
      return { ics: "", error: "The event must end after it starts." }
    }

    return {
      ics: buildIcs({
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        allDay,
        startDate,
        startTime,
        endDate,
        endTime,
        recurrence,
        reminder,
      }),
      error: null,
    }
  }, [
    title,
    location,
    description,
    allDay,
    startDate,
    startTime,
    endDate,
    endTime,
    recurrence,
    reminder,
  ])

  const filename = `${
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "event"
  }.ics`

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ics-title">Event title</Label>
        <Input
          id="ics-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quarterly planning"
          className="mt-1.5"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="ics-all-day"
          name="allDay"
          checked={allDay}
          onCheckedChange={setAllDay}
        />
        <Label htmlFor="ics-all-day" className="font-normal">
          All-day event
        </Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ics-start-date">Start date</Label>
          <Input
            id="ics-start-date"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1.5"
          />
        </div>
        {!allDay && (
          <div>
            <Label htmlFor="ics-start-time">Start time</Label>
            <Input
              id="ics-start-time"
              name="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1.5"
            />
          </div>
        )}
        <div>
          <Label htmlFor="ics-end-date">End date</Label>
          <Input
            id="ics-end-date"
            name="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1.5"
          />
        </div>
        {!allDay && (
          <div>
            <Label htmlFor="ics-end-time">End time</Label>
            <Input
              id="ics-end-time"
              name="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1.5"
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="ics-location">Location</Label>
        <Input
          id="ics-location"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Meeting room 3, or a video call link"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="ics-description">Description</Label>
        <Textarea
          id="ics-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Agenda, dial-in details, or notes"
          className="mt-1.5 min-h-24 resize-y text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ics-recurrence">Repeat</Label>
          <Select
            value={recurrence}
            onValueChange={(value) => value && setRecurrence(value)}
          >
            <SelectTrigger id="ics-recurrence" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRENCE.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ics-reminder">Reminder</Label>
          <Select value={reminder} onValueChange={(value) => value && setReminder(value)}>
            <SelectTrigger id="ics-reminder" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REMINDERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <DownloadButton
          getBlob={() => new Blob([ics], { type: "text/calendar" })}
          filename={filename}
          label="Download .ics"
          disabled={!ics}
        />
        <CopyButton value={ics} label="Copy calendar text" />
      </div>

      <div>
        <Label htmlFor="ics-output">Calendar file</Label>
        <Textarea
          id="ics-output"
          name="ics"
          value={ics}
          readOnly
          className="mt-1.5 min-h-56 resize-y font-mono text-xs"
        />
      </div>
    </div>
  )
}
