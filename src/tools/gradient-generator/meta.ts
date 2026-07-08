import { Blend } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "gradient-generator",
  title: "Gradient Generator",
  description:
    "Build a linear or radial CSS gradient with a live preview and copyable CSS.",
  longDescription:
    "Pick two colors, an angle, and a linear or radial style to build a CSS gradient with a live preview. Copy the generated background CSS straight into your stylesheet. Everything runs locally in your browser.",
  category: "color",
  keywords: [
    "gradient generator",
    "css gradient generator",
    "linear gradient generator",
    "radial gradient generator",
    "gradient maker",
  ],
  tags: ["color", "css", "gradient", "generator"],
  icon: Blend,
  features: [
    "Linear and radial gradient styles",
    "Adjustable angle for linear gradients",
    "Live preview updates instantly",
    "One-click copy of the CSS background value",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Can I use more than two colors?",
      answer:
        "This tool generates a clean two-color gradient. For more complex multi-stop gradients, take the generated CSS as a starting point and add additional color-stop values manually.",
    },
    {
      question: "What's the difference between linear and radial?",
      answer:
        "A linear gradient transitions along a straight line at the angle you set. A radial gradient transitions outward from the center in a circle, ignoring the angle.",
    },
    {
      question: "Is this data sent anywhere?",
      answer: "No. The gradient is generated and previewed entirely in your browser.",
    },
  ],
  relatedTools: ["color-converter", "color-contrast-checker"],
  isNew: true,
}

export default meta
