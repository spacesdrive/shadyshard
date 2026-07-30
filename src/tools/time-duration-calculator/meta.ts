import { Timer } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "time-duration-calculator",
  title: "Time Duration Calculator",
  description:
    "Add up a list of durations or work out the time between a start and end time, with decimal hours for timesheets.",
  longDescription:
    "Time arithmetic is base 60, which is why adding 1:45 and 2:30 in a calculator gives the wrong answer. Paste a list of durations in whatever format you already write them in, such as 1:45, 90m, or 2h 15m, and get the total in hours and minutes as well as the decimal hours most timesheets and invoices expect. The second mode works out the duration between a start and end time, handles shifts that run past midnight, and subtracts an unpaid break. Everything is calculated in your browser.",
  category: "time",
  keywords: [
    "time duration calculator",
    "add hours and minutes",
    "timesheet hours calculator",
    "hours between two times",
    "convert time to decimal hours",
  ],
  tags: ["time", "duration", "calculator", "timesheet", "hours"],
  icon: Timer,
  features: [
    "Add a list of durations written as 1:45, 90m, 2h 15m, or 1.5h",
    "Per-line errors naming the line that could not be read",
    "Totals in hours and minutes, decimal hours, and total minutes",
    "Start and end time mode with overnight shifts and break deduction",
    "Copy the summary for a timesheet or invoice",
  ],
  faqs: [
    {
      question: "Why can I not just add times on a normal calculator?",
      answer:
        "Because minutes run to 60, not to 100. Adding 1.45 and 2.30 as decimals gives 3.75, while adding 1:45 and 2:30 as times gives 4:15. This tool keeps the base 60 arithmetic correct and shows the decimal equivalent separately.",
    },
    {
      question: "What is decimal hours used for?",
      answer:
        "Payroll systems and invoices usually want hours as a decimal, so 4 hours 15 minutes is billed as 4.25. The total is shown in both forms so you do not have to convert by hand.",
    },
    {
      question: "Which duration formats are accepted?",
      answer:
        "Clock style such as 1:45 or 1:45:30, unit style such as 2h 15m or 45s, and decimal style such as 1.5h. A bare number with no unit is read as minutes.",
    },
    {
      question: "Does it handle a shift that finishes after midnight?",
      answer:
        "Yes. If the end time is earlier than the start time, the shift is treated as running into the next day.",
    },
  ],
  relatedTools: [
    "date-difference-calculator",
    "unix-timestamp-converter",
    "time-zone-converter",
  ],
}

export default meta
