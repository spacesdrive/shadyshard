import { Hourglass } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iitm-bs-exam-countdown-planner",
  title: "IITM BS Exam Countdown Planner",
  description:
    "Add your IITM BS quiz and end-term exam dates and see a live countdown, sorted by what's coming up next.",
  longDescription:
    "Add every upcoming quiz, OPPE, or end-term exam with its date, and this tool sorts them by how soon they are and shows the days remaining for each. Exams that have already passed are marked separately rather than removed, so you can review your term at a glance. Your list is saved locally in your browser.",
  category: "student",
  keywords: [
    "iitm bs exam countdown",
    "iitm bs quiz dates",
    "iitm bs end term countdown",
    "iit madras exam planner",
    "iitm bs oppe countdown",
  ],
  tags: ["iitm", "iit madras", "exam", "countdown", "planning", "student"],
  icon: Hourglass,
  features: [
    "Add unlimited exams with course name and date",
    "Automatically sorted soonest first",
    "Live days-remaining countdown",
    "Past exams marked separately, not deleted",
    "List saved locally between visits",
  ],
  faqs: [
    {
      question: "Does this pull real IITM BS exam dates automatically?",
      answer:
        "No. Exam schedules vary by term and are announced by IITM BS directly - enter the dates yourself from the official term calendar, since this tool has no way to verify them.",
    },
    {
      question: "Is my exam list uploaded anywhere?",
      answer: "No. It's stored only in your browser's local storage.",
    },
  ],
  relatedTools: [
    "iitm-bs-weekly-study-planner",
    "iitm-bs-semester-workload-estimator",
    "iitm-bs-semester-planner",
  ],
  isNew: true,
}

export default meta
