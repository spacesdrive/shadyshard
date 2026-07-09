import { BarChart3 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iitm-bs-degree-progress-tracker",
  title: "IITM BS Degree Progress Tracker",
  description:
    "Track your credits completed against every IITM BS exit level: Foundation, Diploma, BSc, and BS.",
  longDescription:
    "See your progress across all four IITM BS exit levels at once - Foundation, Diploma, BSc Degree, and BS Degree - each with its own credit target and a progress bar. Default targets (32 / 27 / 114 / 142) match the commonly published requirements for the BS Degree in Data Science and Applications; every target is editable since other specializations and program revisions differ. Your entered credits are saved locally in your browser.",
  category: "student",
  keywords: [
    "iitm bs degree progress",
    "iitm bs exit levels",
    "iitm bs foundation diploma bsc bs",
    "iit madras degree progress tracker",
    "iitm bs credit requirements",
  ],
  tags: ["iitm", "iit madras", "credits", "degree", "progress", "student"],
  icon: BarChart3,
  features: [
    "Tracks Foundation, Diploma, BSc, and BS levels together",
    "Editable credit targets for every level",
    "Visual progress bar per level",
    "Highlights which certificate or degree you currently qualify for",
    "Saved locally between visits",
  ],
  faqs: [
    {
      question: "Where do the default credit targets come from?",
      answer:
        "They match the commonly published requirements for the BS Degree in Data Science and Applications (32 / 27 / 114 / 142 credits). Other specializations and program revisions can differ, so every target is editable - confirm against the current official IITM BS handbook.",
    },
    {
      question: "Do I need to complete levels in order?",
      answer:
        "Yes, IITM BS is a progressive exit-point program - Foundation, then Diploma, then BSc, then BS - each level builds on the credits and courses of the one before it. This tracker treats each level's target as cumulative credits, matching that structure.",
    },
    {
      question: "Is this official IITM data?",
      answer:
        "No. This is an unofficial planning tool with editable defaults. Always verify your actual standing against the official IITM BS student portal.",
    },
  ],
  relatedTools: [
    "iitm-bs-credit-calculator",
    "iitm-bs-graduation-estimator",
    "iitm-bs-cgpa-calculator",
  ],
  isNew: true,
}

export default meta
