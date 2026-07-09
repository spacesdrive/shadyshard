import { GitBranch } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iitm-bs-course-prerequisite-visualizer",
  title: "IITM BS Course Prerequisite Visualizer",
  description:
    "Map out your own IITM BS course prerequisite chains and get a valid take-order, with cycle detection.",
  longDescription:
    "Add the courses you're planning and mark which ones require others first, and this tool lays them out in dependency order (courses with no prerequisites first, courses that depend on them after) and warns you if you've created a contradiction - a prerequisite cycle. IITM BS's actual prerequisite structure isn't published in a form this tool can verify automatically, so every course and prerequisite here is something you enter yourself; always confirm real requirements against the official IITM BS curriculum before planning around them.",
  category: "student",
  keywords: [
    "iitm bs prerequisite visualizer",
    "iitm bs course dependencies",
    "iit madras course order",
    "iitm bs course sequence planner",
    "iitm bs prerequisite chart",
  ],
  tags: ["iitm", "iit madras", "prerequisites", "planning", "student"],
  icon: GitBranch,
  features: [
    "Add courses and mark prerequisite relationships",
    "Automatic dependency-order layout",
    "Detects and flags prerequisite cycles",
    "Fully user-entered - no invented course data",
    "Saved locally between visits",
  ],
  faqs: [
    {
      question: "Does this already know IITM BS's real prerequisites?",
      answer:
        "No. IITM BS's official prerequisite structure isn't published in a form this tool can verify, so nothing is pre-filled or assumed - you enter your own courses and prerequisite links. Always confirm actual requirements against the official IITM BS curriculum and academic advisor guidance.",
    },
    {
      question: "What happens if I create a prerequisite cycle?",
      answer:
        "The tool detects it and lists the courses involved instead of showing a broken order, since a cycle (A requires B, B requires A) has no valid take-order.",
    },
    {
      question: "Is my course data uploaded anywhere?",
      answer: "No. It's stored only in your browser's local storage.",
    },
  ],
  relatedTools: [
    "iitm-bs-semester-planner",
    "iitm-bs-credit-calculator",
    "iitm-bs-semester-workload-estimator",
  ],
  isNew: true,
}

export default meta
