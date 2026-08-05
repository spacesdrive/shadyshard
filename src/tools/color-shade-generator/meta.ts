import { SwatchBook } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "color-shade-generator",
  title: "Color Shade Generator",
  description:
    "Turn one brand color into an eleven-step tint and shade scale, ready to paste into CSS or Tailwind.",
  longDescription:
    "A design system needs more than one brand color: it needs a scale, and mixing that scale with white and black in sRGB produces the muddy, uneven steps everyone recognises. This tool converts your color to OKLCH, walks a perceptually even lightness ramp from 50 to 950, and pulls each step back into the sRGB gamut only as far as it has to. Your original color is pinned to the step it sits closest to, so the scale still matches the brand rather than drifting away from it. Copy the result as plain hex, CSS custom properties, a Tailwind v4 theme block, or a Tailwind v3 config object. Everything is computed in the browser with no account or export limit.",
  category: "color",
  keywords: [
    "color shade generator",
    "tailwind color palette generator",
    "tint and shade scale",
    "css color variables generator",
    "oklch color scale",
  ],
  tags: ["color", "palette", "tailwind", "design system", "oklch"],
  icon: SwatchBook,
  features: [
    "Eleven-step scale from 50 to 950 built on a perceptual lightness ramp",
    "Pins your input color to the step it matches most closely",
    "Keeps every step inside the sRGB gamut without flattening the hue",
    "Copies as hex, CSS custom properties, Tailwind v4 theme, or Tailwind v3 config",
    "Shows which steps have enough contrast for white or black text",
  ],
  faqs: [
    {
      question: "Why build the scale in OKLCH instead of mixing with white and black?",
      answer:
        "Mixing in sRGB changes perceived lightness unevenly and drags some hues, particularly blues and purples, towards grey. OKLCH separates lightness from hue and chroma, so stepping through lightness gives evenly spaced shades that keep the original hue.",
    },
    {
      question: "Will my exact brand color appear in the scale?",
      answer:
        "Yes. The step whose target lightness is closest to your color is replaced with the color itself, so the scale contains the original hex rather than an approximation of it.",
    },
    {
      question: "Can I use the output with Tailwind v4?",
      answer:
        "Yes. The Tailwind v4 option emits a theme block of custom properties in the shape the framework expects, so it can be pasted straight into your CSS. The v3 option emits the nested object used inside a tailwind.config file instead.",
    },
    {
      question: "What do the contrast marks on each swatch mean?",
      answer:
        "They show whether black or white body text on that swatch reaches the WCAG AA ratio of 4.5 to 1. Use them to pick which steps are safe as background colors for text.",
    },
  ],
}

export default meta
