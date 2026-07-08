import { Spline } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "border-radius-generator",
  title: "Border Radius Generator",
  description: "Design a CSS border-radius with per-corner sliders and a live preview.",
  longDescription:
    "Adjust each corner's radius independently with sliders and see a live preview, then copy the generated border-radius CSS. Everything runs locally in your browser.",
  category: "css",
  keywords: [
    "border radius generator",
    "css border radius generator",
    "rounded corners generator",
    "border-radius css",
    "corner radius tool",
  ],
  tags: ["css", "border-radius", "generator", "design"],
  icon: Spline,
  features: [
    "Independent slider for each corner",
    "Live preview updates instantly",
    "One-click copy of the CSS",
    "Reset to a uniform radius",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Can I make an organic, blob-like shape?",
      answer:
        "Yes, setting each corner to a different value produces asymmetric rounding, which combined with unequal width/height can create an organic blob shape.",
    },
    {
      question: "What units does the output use?",
      answer:
        "Pixels, which is the most common unit for border-radius. Adjust to a relative unit like rem or % manually if needed.",
    },
    {
      question: "Is this data sent anywhere?",
      answer: "No. The preview and CSS are generated entirely in your browser.",
    },
  ],
  relatedTools: ["box-shadow-generator", "css-grid-generator"],
  isNew: true,
}

export default meta
