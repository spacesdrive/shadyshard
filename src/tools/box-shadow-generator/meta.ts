import { Square } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "box-shadow-generator",
  title: "Box Shadow Generator",
  description:
    "Design a CSS box-shadow with sliders and a live preview, then copy the CSS.",
  longDescription:
    "Adjust offset, blur, spread, color, and opacity with sliders to design a box-shadow, with a live preview and an inset toggle. Copy the generated CSS straight into your stylesheet. Everything runs locally in your browser.",
  category: "css",
  keywords: [
    "box shadow generator",
    "css box shadow generator",
    "box shadow css",
    "css shadow maker",
    "box-shadow generator online",
  ],
  tags: ["css", "shadow", "generator", "design"],
  icon: Square,
  features: [
    "Sliders for offset X/Y, blur, and spread",
    "Color picker with opacity",
    "Inset shadow toggle",
    "Live preview updates instantly",
    "One-click copy of the CSS",
  ],
  faqs: [
    {
      question: "What does spread do?",
      answer:
        "Spread expands or contracts the shadow's size before the blur is applied - positive values make the shadow larger than the element, negative values make it smaller.",
    },
    {
      question: "What's an inset shadow?",
      answer:
        "An inset shadow is drawn inside the element's border instead of outside it, creating a pressed-in look rather than a raised one.",
    },
    {
      question: "Is this data sent anywhere?",
      answer: "No. The preview and CSS are generated entirely in your browser.",
    },
  ],
  relatedTools: ["border-radius-generator", "gradient-generator"],
  isNew: true,
}

export default meta
