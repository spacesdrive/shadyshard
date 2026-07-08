import { Contrast } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "color-contrast-checker",
  title: "Color Contrast Checker",
  description:
    "Check whether a text and background color pair meets WCAG contrast requirements.",
  longDescription:
    "Pick a text color and a background color to see the exact WCAG contrast ratio, whether it passes AA and AAA for normal and large text, and a live preview of how the pairing actually looks. Everything runs locally in your browser.",
  category: "color",
  keywords: [
    "color contrast checker",
    "wcag contrast checker",
    "accessibility contrast checker",
    "contrast ratio calculator",
    "text background contrast",
  ],
  tags: ["color", "contrast", "accessibility", "wcag"],
  icon: Contrast,
  features: [
    "Exact WCAG 2 contrast ratio",
    "Pass/fail for AA and AAA, normal and large text",
    "Live text preview on the chosen background",
    "Native color pickers plus hex input",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What contrast ratio do I need?",
      answer:
        "WCAG AA requires at least 4.5:1 for normal text and 3:1 for large text (18pt+, or 14pt+ bold). AAA is stricter: 7:1 for normal text and 4.5:1 for large text.",
    },
    {
      question: "How is the contrast ratio calculated?",
      answer:
        "Using the WCAG 2 formula: each color's relative luminance is computed from its linearized sRGB channels, then the ratio is (lighter + 0.05) / (darker + 0.05).",
    },
    {
      question: "Is my color data sent anywhere?",
      answer: "No. The contrast calculation happens entirely in your browser.",
    },
  ],
  relatedTools: ["color-converter", "gradient-generator"],
  isNew: true,
}

export default meta
