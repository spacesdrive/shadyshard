import { Eye } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "color-blindness-simulator",
  title: "Color Blindness Simulator",
  description:
    "See how an image or interface screenshot looks to people with each of the eight common color vision deficiencies.",
  longDescription:
    "Drop in a screenshot, chart, or design mockup and compare it side by side with a simulation of protanopia, deuteranopia, tritanopia, their milder anomalous forms, and full or partial achromatopsia. It is a fast way to catch information that is only conveyed by color, which is the most common cause of WCAG 1.4.1 failures. The image is drawn to a canvas in your browser and the simulated result can be downloaded as a PNG. The file is never uploaded.",
  category: "color",
  keywords: [
    "color blindness simulator",
    "colorblind image test",
    "deuteranopia simulator",
    "protanopia preview",
    "accessibility color check",
  ],
  tags: ["color", "accessibility", "colorblind", "image", "wcag"],
  icon: Eye,
  features: [
    "Simulates eight color vision deficiency types",
    "Side by side comparison with the original",
    "Download the simulated image as a PNG",
    "Runs on canvas with no upload",
    "Works with screenshots, charts, and design mockups",
  ],
  faqs: [
    {
      question: "Which color vision deficiencies are covered?",
      answer:
        "Protanopia, deuteranopia, and tritanopia, the three dichromatic types, plus their anomalous trichromatic counterparts protanomaly, deuteranomaly, and tritanomaly, plus achromatopsia and achromatomaly.",
    },
    {
      question: "Is my image uploaded to check it?",
      answer:
        "No. The file is read with the browser File API, drawn to a canvas, and transformed pixel by pixel on your own machine. Nothing is transmitted.",
    },
    {
      question: "Does passing this mean my design is accessible?",
      answer:
        "It is one useful check, not a complete one. If information disappears in a simulation you have a real problem, but you should also verify contrast ratios and make sure color is never the only way meaning is conveyed.",
    },
    {
      question: "How accurate is the simulation?",
      answer:
        "It uses the widely cited RGB transformation matrices for each deficiency type. These approximate how the colors shift and are good enough for design review, but individual perception varies and they are not a medical assessment.",
    },
  ],
  isNew: true,
}

export default meta
