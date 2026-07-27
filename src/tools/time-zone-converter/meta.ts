import { Globe2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "time-zone-converter",
  title: "Time Zone Converter",
  description:
    "See one moment in time across several time zones at once, with offsets and dates.",
  longDescription:
    "Pick a date, a time, and the zone it is written in, then add every zone your team works from to see the same instant in each one. Daylight saving transitions are handled by the browser's own time zone database, so the offsets shown are the ones that will actually apply on that date.",
  category: "time",
  keywords: [
    "time zone converter",
    "meeting time across time zones",
    "utc to local time",
    "world clock converter",
  ],
  tags: ["timezone", "time", "meeting", "utc", "converter"],
  icon: Globe2,
  features: [
    "Convert one instant into any number of time zones at once",
    "Daylight saving handled from the browser's IANA time zone data",
    "Shows the offset and the local date, including day rollovers",
    "Copy the whole comparison as plain text",
  ],
  faqs: [
    {
      question: "Does it account for daylight saving time?",
      answer:
        "Yes. Conversions use the browser's IANA time zone database, so a date in June and a date in December get the offsets that actually apply on those dates.",
    },
    {
      question: "Why does one row show a different date?",
      answer:
        "Because the same instant can fall on a different calendar day elsewhere. The date is shown on every row so a meeting that lands on the next morning is obvious.",
    },
    {
      question: "Which time zones can I choose?",
      answer:
        "Every IANA zone your browser knows about, such as Europe/London or Asia/Kolkata, plus UTC. The list comes from the browser itself, so it stays current with browser updates.",
    },
  ],
  isNew: true,
}

export default meta
