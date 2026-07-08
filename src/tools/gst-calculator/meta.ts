import { Receipt } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "gst-calculator",
  title: "GST Calculator",
  description: "Add or remove GST from an amount at any tax rate.",
  longDescription:
    "Enter an amount and a GST rate to calculate the GST amount and total either way: adding GST to a base amount, or extracting the base amount and GST from a GST-inclusive total. Everything runs locally in your browser.",
  category: "math",
  keywords: [
    "gst calculator",
    "gst calculator online",
    "add gst calculator",
    "remove gst calculator",
    "gst inclusive exclusive calculator",
  ],
  tags: ["gst", "tax", "calculator"],
  icon: Receipt,
  features: [
    "Add GST to a base amount",
    "Remove GST from a GST-inclusive total",
    "Any GST rate, not just fixed presets",
    "Shows the GST amount and both totals",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What's the difference between adding and removing GST?",
      answer:
        "Adding GST takes a base amount and calculates GST on top of it. Removing GST takes a GST-inclusive total and works backward to find the original base amount and the GST portion within it.",
    },
    {
      question: "Does this use a fixed GST rate?",
      answer:
        "No, enter whatever rate applies in your country or context - common rates include 5%, 10%, 15%, and 18%, but any percentage works.",
    },
    {
      question: "Is my data sent anywhere?",
      answer: "No. The calculation happens entirely in your browser.",
    },
  ],
  relatedTools: ["percentage-calculator", "age-calculator"],
  isNew: true,
}

export default meta
