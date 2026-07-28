import { Ruler } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "css-unit-converter",
  title: "CSS Unit Converter",
  description:
    "Convert a CSS length between px, rem, em, pt, and percent using your own root and parent font sizes.",
  longDescription:
    "Enter a value in whichever unit you have and get the equivalent in every other CSS length unit at once. Because rem depends on the root font size and em and percent depend on the parent element's font size, both are editable rather than assumed, so the numbers match what your stylesheet will actually compute. Every conversion is done in your browser as you type.",
  category: "css",
  keywords: [
    "css unit converter",
    "px to rem converter",
    "rem to px",
    "em to px calculator",
    "pt to px css",
  ],
  tags: ["css", "units", "rem", "px", "converter"],
  icon: Ruler,
  features: [
    "Converts between px, rem, em, pt, and percent",
    "Configurable root font size for rem",
    "Configurable parent font size for em and percent",
    "All equivalents shown at once with copy buttons",
    "Live results as you type, with no rounding surprises",
  ],
  faqs: [
    {
      question: "What is the difference between rem and em here?",
      answer:
        "rem is relative to the root font size set on the html element, while em is relative to the font size of the element's parent. The converter keeps the two font sizes separate so you can model both cases accurately.",
    },
    {
      question: "Why is 1pt not exactly 1px?",
      answer:
        "CSS defines 1pt as 1/72 of an inch and 1px as 1/96 of an inch, so 1pt equals exactly 1.3333px regardless of the physical display.",
    },
    {
      question: "Should I use px or rem for font sizes?",
      answer:
        "rem is generally preferred for font sizes because it scales with the visitor's browser font size setting, which px does not. px remains reasonable for hairline borders and other values that should not scale.",
    },
  ],
  isNew: true,
}

export default meta
