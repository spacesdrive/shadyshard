import { Grid3x3 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "css-grid-generator",
  title: "CSS Grid Generator",
  description: "Build a CSS Grid layout visually with column, row, and gap controls.",
  longDescription:
    "Set the number of columns and rows and the gap size to visually build a CSS Grid container, with a live numbered-cell preview. Copy the generated grid-template-columns, grid-template-rows, and gap CSS. Everything runs locally in your browser.",
  category: "css",
  keywords: [
    "css grid generator",
    "css grid layout generator",
    "grid template columns generator",
    "css grid builder",
    "grid generator online",
  ],
  tags: ["css", "grid", "layout", "generator"],
  icon: Grid3x3,
  features: [
    "Adjustable column and row count",
    "Adjustable gap size",
    "Live numbered-cell preview",
    "One-click copy of the CSS",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this support unequal column widths?",
      answer:
        "This generates an equal-width grid-template-columns value (repeat(n, 1fr)). For custom column widths, adjust the generated CSS by hand once you have the base structure.",
    },
    {
      question: "What CSS properties does this generate?",
      answer:
        "display: grid, grid-template-columns, grid-template-rows, and gap - everything needed on the parent container.",
    },
    {
      question: "Is this data sent anywhere?",
      answer: "No. The preview and CSS are generated entirely in your browser.",
    },
  ],
  relatedTools: ["flexbox-playground", "border-radius-generator"],
  isNew: true,
}

export default meta
