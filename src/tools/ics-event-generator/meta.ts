import { CalendarPlus } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "ics-event-generator",
  title: "ICS Calendar Event Generator",
  description:
    "Build a downloadable .ics calendar file for an event, with reminders and recurrence.",
  longDescription:
    "Fill in an event's title, time, location, and description to get a standards-compliant .ics file that opens in Google Calendar, Apple Calendar, and Outlook. Add an alarm or a repeat rule if you need one. The file is assembled and saved by your browser, so event details are never sent to a calendar service to produce it.",
  category: "generators",
  keywords: [
    "ics file generator",
    "create calendar event file",
    "add to calendar link",
    "icalendar event maker",
  ],
  tags: ["calendar", "ics", "icalendar", "event", "generator"],
  icon: CalendarPlus,
  features: [
    "Standards-compliant iCalendar output with correct line endings",
    "All-day events, timed events, and optional recurrence rules",
    "Optional reminder alarm a set number of minutes before the start",
    "Download the .ics file or copy the raw calendar text",
  ],
  faqs: [
    {
      question: "Which calendar apps accept the file?",
      answer:
        "Any app that supports iCalendar, which includes Google Calendar, Apple Calendar, Outlook, and Thunderbird. Opening the downloaded .ics file adds the event.",
    },
    {
      question: "How are times stored?",
      answer:
        "Timed events are written in UTC, converted from the local time you enter, which avoids ambiguity when the file is opened somewhere else. All-day events use a plain date with no time zone.",
    },
    {
      question: "Can I send this file to other people?",
      answer:
        "Yes. An .ics file is a plain text attachment, so you can email it or host it. Recipients get the event in their own calendar app.",
    },
  ],
  isNew: true,
}

export default meta
