import { Sparkles } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "css-animation-generator",
  title: "CSS Animation Generator",
  description:
    "Build a CSS keyframe animation with a live preview and copy the generated keyframes and animation shorthand.",
  longDescription:
    "Pick an animation, tune the duration, delay, easing, iteration count, direction, and fill mode, and watch the result play before you copy anything. The tool emits a complete keyframes block and a matching animation shorthand rather than a fragment, so the output can be pasted straight into a stylesheet. The preview is driven by the Web Animations API with the same values the CSS uses, so what you see is what the stylesheet will do.",
  category: "css",
  keywords: [
    "css animation generator",
    "css keyframes generator",
    "keyframe animation builder",
    "css fade in animation",
    "animation shorthand css",
  ],
  tags: ["css", "animation", "keyframes", "generator", "preview", "frontend"],
  icon: Sparkles,
  features: [
    "Eleven presets covering fades, slides, zoom, bounce, pulse, shake, spin, and flip",
    "Duration, delay, easing, iteration count, direction, and fill mode controls",
    "Live preview driven by the Web Animations API with a replay button",
    "Complete keyframes block plus the animation shorthand",
    "Copy or download the generated CSS",
  ],
  faqs: [
    {
      question: "Why does my animation snap back at the end?",
      answer:
        "Because the default fill mode is none, so the element returns to its untouched styles once the animation finishes. Set the fill mode to forwards or both to hold the final keyframe.",
    },
    {
      question: "Which properties are safe to animate?",
      answer:
        "Transform and opacity, which is what every preset here uses. They can be handled by the compositor without recalculating layout, so they stay smooth. Animating width, height, or top forces layout work on every frame.",
    },
    {
      question: "Should I respect reduced motion preferences?",
      answer:
        "Yes. Wrap decorative animation in a prefers-reduced-motion media query so people who have asked their system to reduce motion are not given it anyway. The generated CSS does not add that query for you.",
    },
    {
      question: "Is the preview the same as the exported CSS?",
      answer:
        "It uses the same keyframes and timing values through the Web Animations API, so the motion matches. Very small differences are possible where a browser optimises a CSS animation differently.",
    },
  ],
  relatedTools: ["cubic-bezier-generator", "box-shadow-generator", "gradient-generator"],
}

export default meta
