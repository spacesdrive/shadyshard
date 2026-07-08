import { Palette } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "color-converter",
  title: "Color Converter",
  description: "Convert colors between HEX, RGB, and HSL with a live preview.",
  longDescription:
    "Enter a color in HEX, RGB, or HSL format and instantly see it converted to the other formats, with a live color preview. All conversion happens locally in your browser.",
  category: "color",
  keywords: [
    "color converter",
    "hex to rgb",
    "rgb to hsl",
    "color picker",
    "hex color codes",
  ],
  tags: ["color", "hex", "rgb", "hsl", "design"],
  icon: Palette,
  features: [
    "Convert between HEX, RGB, and HSL",
    "Live color swatch preview",
    "Native browser color picker",
    "One-click copy for each format",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What color formats are supported?",
      answer: "You can input and convert between HEX, RGB, and HSL color formats.",
    },
    {
      question: "Is this color converter accurate?",
      answer:
        "Yes, it uses standard color space math to convert between formats with rounded, display-accurate values.",
    },
  ],
  isNew: true,
}

export default meta
