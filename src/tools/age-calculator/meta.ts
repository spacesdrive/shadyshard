import { Cake } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "age-calculator",
  title: "Age Calculator",
  description: "Calculate exact age in years, months, and days from a birth date.",
  longDescription:
    "Enter a birth date to calculate the exact age as of today, in years, months, and days, plus total days lived. Everything is calculated locally in your browser.",
  category: "math",
  keywords: [
    "age calculator",
    "calculate age from date of birth",
    "how old am i",
    "age in years months days",
    "birthday calculator",
  ],
  tags: ["age", "calculator", "date", "birthday"],
  icon: Cake,
  features: [
    "Exact age in years, months, and days",
    "Total days lived",
    "Days until next birthday",
    "Instant calculation as you pick a date",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is the age calculated?",
      answer:
        "By comparing the birth date to today's date and breaking down the difference into whole years, remaining months, and remaining days, accounting for varying month lengths.",
    },
    {
      question: "Does it account for leap years?",
      answer:
        "Yes, the calculation uses actual calendar dates, so leap years are handled correctly.",
    },
    {
      question: "Is my birth date sent anywhere?",
      answer:
        "No. The calculation happens entirely in your browser. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["date-difference-calculator", "percentage-calculator"],
  isNew: true,
}

export default meta
