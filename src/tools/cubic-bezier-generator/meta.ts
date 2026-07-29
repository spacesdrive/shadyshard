import { Spline } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "cubic-bezier-generator",
  title: "Cubic Bezier Generator",
  description:
    "Shape a CSS cubic-bezier easing curve by dragging its control points and watch the motion play back live.",
  longDescription:
    "Drag the two control handles to shape the curve, or nudge each coordinate with the sliders for precise keyboard control. A sample element replays the animation with your timing function every time the curve changes, so you can feel the easing rather than guess at the numbers. Presets for the CSS keywords give you a starting point, and the finished cubic-bezier() value is ready to copy. Everything runs in your browser.",
  category: "css",
  keywords: [
    "cubic bezier generator",
    "css easing curve editor",
    "animation timing function",
    "cubic-bezier css",
    "custom easing css",
  ],
  tags: ["css", "animation", "easing", "bezier", "transition"],
  icon: Spline,
  features: [
    "Draggable control points on an interactive curve",
    "Sliders for precise keyboard-accessible adjustment",
    "Live animation preview that replays on every change",
    "Presets for ease, ease-in, ease-out, ease-in-out, and linear",
    "Copy-ready cubic-bezier() value",
  ],
  faqs: [
    {
      question: "Can the control points go outside the 0 to 1 range?",
      answer:
        "The vertical coordinates can, which is how bounce and overshoot effects are made. The horizontal coordinates must stay between 0 and 1 because CSS requires the curve to be a function of time, so the sliders enforce that.",
    },
    {
      question: "Where do I use the generated value?",
      answer:
        "Paste it as the timing function in a transition or animation, for example transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1).",
    },
    {
      question: "How do the presets map to CSS keywords?",
      answer:
        "ease is cubic-bezier(0.25, 0.1, 0.25, 1), ease-in is (0.42, 0, 1, 1), ease-out is (0, 0, 0.58, 1), ease-in-out is (0.42, 0, 0.58, 1), and linear is (0, 0, 1, 1).",
    },
  ],
}

export default meta
