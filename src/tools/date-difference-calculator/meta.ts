import { CalendarRange } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "date-difference-calculator",
  title: "Date Difference Calculator",
  description:
    "Calculate the exact time between two dates in years, months, days, and weeks.",
  longDescription:
    "Pick a start and end date to calculate the difference between them broken down into years, months, and days, plus the total number of days and weeks. Everything runs locally in your browser.",
  category: "time",
  keywords: [
    "date difference calculator",
    "days between two dates",
    "date calculator",
    "time between dates",
    "how many days between dates",
  ],
  tags: ["date", "calculator", "duration", "time"],
  icon: CalendarRange,
  features: [
    "Difference broken down into years, months, and days",
    "Total days and total weeks",
    "Works with any two dates, past or future",
    "Instant calculation as you pick dates",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Can I calculate a future date range?",
      answer:
        "Yes, either date can be before or after the other - the tool always shows the absolute difference between them.",
    },
    {
      question: "Does it include both the start and end date in the count?",
      answer:
        "The total days figure is the number of days between the two dates (exclusive count), matching how 'days until' is typically calculated.",
    },
    {
      question: "Is my data sent anywhere?",
      answer: "No. The calculation happens entirely in your browser.",
    },
  ],
  relatedTools: ["age-calculator", "percentage-calculator"],
  isNew: true,
}

export default meta
