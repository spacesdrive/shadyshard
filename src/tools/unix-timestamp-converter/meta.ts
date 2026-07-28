import { Clock4 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "unix-timestamp-converter",
  title: "Unix Timestamp Converter",
  description:
    "Convert Unix epoch timestamps to readable dates and back, in seconds or milliseconds.",
  longDescription:
    "Paste an epoch timestamp to see it as local time, UTC, and an ISO 8601 string, or pick a date and time to get the timestamp back. Seconds and milliseconds are detected automatically, and every conversion is done by your browser's own date handling with no request to a time service.",
  category: "time",
  keywords: [
    "unix timestamp converter",
    "epoch to date",
    "date to epoch timestamp",
    "milliseconds timestamp converter",
  ],
  tags: ["timestamp", "epoch", "unix", "date", "converter"],
  icon: Clock4,
  features: [
    "Automatic detection of second and millisecond timestamps",
    "Local time, UTC, ISO 8601, and relative time shown together",
    "Reverse conversion from a date and time back to a timestamp",
    "One-click current timestamp",
  ],
  faqs: [
    {
      question: "How does it tell seconds from milliseconds?",
      answer:
        "By magnitude. A value with 12 or more digits is read as milliseconds, since second-based timestamps will not reach that length until the year 5138. You can override the unit if a value is ambiguous.",
    },
    {
      question: "Which time zone are results shown in?",
      answer:
        "Both. Local time uses your device's time zone, and the UTC and ISO 8601 lines show the same instant with no offset applied.",
    },
    {
      question: "Can it handle timestamps before 1970?",
      answer:
        "Yes. Negative timestamps count backwards from the epoch, so -86400 resolves to 31 December 1969.",
    },
  ],
}

export default meta
