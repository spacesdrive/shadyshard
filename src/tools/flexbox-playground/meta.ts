import { Columns3 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "flexbox-playground",
  title: "Flexbox Playground",
  description:
    "Experiment with flex-direction, justify-content, and align-items with a live preview.",
  longDescription:
    "Toggle flex-direction, justify-content, align-items, and gap to see exactly how a flex container behaves, with a live preview of numbered items. Copy the resulting CSS. Everything runs locally in your browser.",
  category: "css",
  keywords: [
    "flexbox playground",
    "flexbox generator",
    "css flexbox tool",
    "justify-content align-items generator",
    "flexbox visualizer",
  ],
  tags: ["css", "flexbox", "layout", "generator"],
  icon: Columns3,
  features: [
    "Every flex-direction, justify-content, and align-items value",
    "Adjustable gap and item count",
    "Live preview of numbered items",
    "One-click copy of the CSS",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What's the difference between justify-content and align-items?",
      answer:
        "justify-content controls alignment along the main axis (horizontal in a row, vertical in a column), while align-items controls alignment along the cross axis (perpendicular to the main axis).",
    },
    {
      question: "Does changing flex-direction change what the sliders control?",
      answer:
        "Yes - switching to column swaps which axis is 'main' and which is 'cross,' so justify-content and align-items effectively swap visual roles, exactly as they do in real CSS.",
    },
    {
      question: "Is this data sent anywhere?",
      answer: "No. The preview and CSS are generated entirely in your browser.",
    },
  ],
  relatedTools: ["css-grid-generator", "border-radius-generator"],
  isNew: true,
}

export default meta
