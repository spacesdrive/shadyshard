import { CalendarCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "business-days-calculator",
  title: "Business Days Calculator",
  description:
    "Count working days between two dates or add business days to a date, with a custom working week and holiday list.",
  longDescription:
    "Count the working days between two dates, or find the date a given number of business days from today, with the weekend and the holidays you actually observe rather than a fixed national calendar. Any combination of days can be marked as working, which covers six-day weeks, Sunday to Thursday weeks, and part-time schedules that a country-specific calculator cannot express. Holidays are entered as a simple list of dates and everything is calculated in your browser.",
  category: "time",
  keywords: [
    "business days calculator",
    "working days between two dates",
    "add business days to a date",
    "workday calculator excluding holidays",
    "count weekdays between dates",
  ],
  tags: ["time", "date", "business days", "calculator", "holidays", "working days"],
  icon: CalendarCheck,
  features: [
    "Working days counted between two dates, inclusive of both",
    "Any working week, not just Monday to Friday",
    "Custom holiday list entered as dates, one per line",
    "Add or subtract business days from a starting date",
    "Breakdown of calendar days, non-working days, and holidays excluded",
  ],
  faqs: [
    {
      question: "Are the start and end dates counted?",
      answer:
        "Yes. Both endpoints are included when they fall on a working day, which matches how contractual and delivery deadlines are usually written. Subtract one if your agreement counts from the day after.",
    },
    {
      question: "Why is there no built-in public holiday list?",
      answer:
        "Public holidays vary by country, region, and employer, and a stale built-in list is worse than none. Paste the dates your organisation actually observes and the count will match your calendar.",
    },
    {
      question: "Can I use a working week that is not Monday to Friday?",
      answer:
        "Yes. Tick whichever days count as working days. That covers a Sunday to Thursday week, a six-day week, and part-time patterns.",
    },
    {
      question: "What happens if a holiday falls on a weekend?",
      answer:
        "It is ignored, because that day is already a non-working day. Only holidays landing on working days reduce the count.",
    },
  ],
  relatedTools: [
    "date-difference-calculator",
    "age-calculator",
    "time-duration-calculator",
  ],
}

export default meta
