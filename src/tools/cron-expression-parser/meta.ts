import { CalendarClock } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "cron-expression-parser",
  title: "Cron Expression Parser",
  description:
    "Translate a cron expression into plain English and preview its next run times.",
  longDescription:
    "Paste a five-field cron expression to get a plain-English summary, a field-by-field breakdown, and the next scheduled run times in your local time zone. Parsing and scheduling both run in your browser, so the schedules you are debugging are never sent anywhere.",
  category: "developer",
  keywords: [
    "cron expression parser",
    "cron schedule explained",
    "crontab syntax",
    "next cron run time",
  ],
  tags: ["cron", "crontab", "schedule", "developer", "devops"],
  icon: CalendarClock,
  features: [
    "Plain-English description of any five-field cron expression",
    "Next run times calculated in your local time zone",
    "Field-by-field breakdown of minute, hour, day, month, and weekday",
    "Specific error messages for out-of-range and malformed fields",
  ],
  faqs: [
    {
      question: "Which cron syntax does this parser support?",
      answer:
        "Standard five-field Unix cron: minute, hour, day of month, month, and day of week. Wildcards, ranges, lists, step values, and three-letter month and weekday names are all supported.",
    },
    {
      question: "How are day of month and day of week combined?",
      answer:
        "Following standard cron behaviour, when both day of month and day of week are restricted the schedule fires on either match, not only when both match.",
    },
    {
      question: "Are the next run times shown in UTC?",
      answer:
        "They are shown in your browser's local time zone. A server running the same expression will use its own time zone, so compare the two before relying on the preview.",
    },
  ],
  isNew: true,
}

export default meta
