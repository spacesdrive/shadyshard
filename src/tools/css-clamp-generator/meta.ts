import { Scaling } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "css-clamp-generator",
  title: "CSS Clamp Generator",
  description:
    "Build a fluid CSS clamp() value that scales a font size or spacing smoothly between two viewport widths.",
  longDescription:
    "Give the generator a minimum and maximum viewport width plus the size you want at each end, and it works out the clamp() expression that interpolates linearly between them. The preferred value is expressed in rem plus vw so it keeps respecting the visitor's browser font size setting, which a raw vw value does not. The live preview shows the computed size at any viewport width you drag to, and everything is calculated in your browser.",
  category: "css",
  keywords: [
    "css clamp generator",
    "fluid typography calculator",
    "responsive font size css",
    "clamp calculator",
    "fluid spacing css",
  ],
  tags: ["css", "clamp", "typography", "responsive", "fluid"],
  icon: Scaling,
  features: [
    "Generates a clamp() value from two viewport and size pairs",
    "Preferred value in rem plus vw so browser zoom still works",
    "Live preview of the computed size at any viewport width",
    "Works for font sizes, padding, margins, and gaps",
    "Inline validation for impossible viewport ranges",
  ],
  faqs: [
    {
      question: "Why does the preferred value mix rem and vw?",
      answer:
        "A pure vw value ignores the visitor's browser font size preference, which fails WCAG success criterion 1.4.4. Adding a rem component keeps the value responsive to both the viewport and the root font size.",
    },
    {
      question: "Can I use this for padding and margins, not just text?",
      answer:
        "Yes. clamp() works on any length property, so the same expression is valid for padding, margin, gap, width, and border-radius.",
    },
    {
      question: "What root font size should I enter?",
      answer:
        "Use the root font size your CSS actually assumes, which is 16px in every major browser unless you have changed the font-size on the html element.",
    },
    {
      question: "Does anything get sent to a server?",
      answer:
        "No. The arithmetic runs in your browser, and no values you enter leave the page.",
    },
  ],
}

export default meta
