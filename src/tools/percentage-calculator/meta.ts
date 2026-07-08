import { Percent } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "percentage-calculator",
  title: "Percentage Calculator",
  description: "Calculate percentages, percentage of a value, and percentage change.",
  longDescription:
    "Switch between three common percentage calculations: finding what a percentage of a number is, finding what percentage one number is of another, and finding the percentage change between two numbers. Everything runs locally in your browser.",
  category: "math",
  keywords: [
    "percentage calculator",
    "percent calculator",
    "percentage change calculator",
    "what percent of",
    "percentage of a number",
  ],
  tags: ["percentage", "calculator", "math"],
  icon: Percent,
  features: [
    "X% of Y calculation",
    "X is what percent of Y",
    "Percentage increase or decrease between two numbers",
    "Live results as you type",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is percentage change calculated?",
      answer:
        "As ((new value - old value) / old value) * 100, giving a positive percentage for an increase and a negative percentage for a decrease.",
    },
    {
      question: "What if the original value is zero?",
      answer:
        "Percentage change is undefined when the original value is zero, since it would require dividing by zero - the tool shows this case as not calculable.",
    },
    {
      question: "Is my data sent anywhere?",
      answer: "No. All calculations happen entirely in your browser.",
    },
  ],
  relatedTools: ["gst-calculator", "age-calculator"],
  isNew: true,
}

export default meta
