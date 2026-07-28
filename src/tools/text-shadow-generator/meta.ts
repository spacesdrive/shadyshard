import { Type } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "text-shadow-generator",
  title: "Text Shadow Generator",
  description:
    "Build a CSS text-shadow with live preview, adjustable offset, blur, color, and stacked shadow layers.",
  longDescription:
    "Adjust offset, blur, color, and opacity and watch the effect on real text as you go. Layers stack the way the CSS text-shadow property does, so you can build outlines, glows, and retro three-dimensional lettering from several shadows at once and copy the finished declaration. The preview uses your own sample text, and nothing is sent anywhere.",
  category: "css",
  keywords: [
    "text shadow generator",
    "css text-shadow",
    "text glow css",
    "text outline css",
    "css shadow preview",
  ],
  tags: ["css", "shadow", "text", "typography", "generator"],
  icon: Type,
  features: [
    "Live preview on editable sample text",
    "Offset, blur, color, and opacity controls",
    "Stack multiple shadow layers into one declaration",
    "Adjustable preview font size and text color",
    "Copy-ready text-shadow CSS",
  ],
  faqs: [
    {
      question: "How do multiple text shadows stack?",
      answer:
        "CSS draws comma-separated text shadows front to back, so the first shadow in the list sits closest to the text. Adding layers is how outlines and layered three-dimensional effects are made.",
    },
    {
      question: "Can I make a text outline with this?",
      answer:
        "Yes. Add four layers with zero blur and small offsets in each direction, one up, one down, one left, one right, in the outline color.",
    },
    {
      question: "Does text-shadow affect layout?",
      answer:
        "No. A text shadow is painted outside the box model, so it never changes line height or element size, and it never triggers reflow.",
    },
  ],
  isNew: true,
}

export default meta
