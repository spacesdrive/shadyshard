import { CalendarClock } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iitm-bs-weekly-study-planner",
  title: "IITM BS Weekly Study Planner",
  description:
    "Allocate study hours per course across each day of the week and see your daily and weekly totals.",
  longDescription:
    "Build a weekly study grid for your IITM BS courses: add each course as a row, then set how many hours you plan to study it on each day. The planner totals hours per day and per course automatically, making it easy to spot an overloaded day before it happens. Your grid is saved locally in your browser.",
  category: "student",
  keywords: [
    "iitm bs study planner",
    "iitm bs weekly schedule",
    "iit madras study timetable",
    "iitm bs study hours tracker",
    "weekly study planner online",
  ],
  tags: ["iitm", "iit madras", "study", "planning", "timetable", "student"],
  icon: CalendarClock,
  features: [
    "One row per course, one column per day",
    "Automatic daily and weekly totals",
    "Add or remove courses freely",
    "Grid saved locally between visits",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this account for IITM BS's specific weekly workload?",
      answer:
        "No, this is a general-purpose weekly planning grid you fill in yourself. Use the IITM BS Semester Workload Estimator if you want an estimate of total weekly hours based on your credit load instead.",
    },
    {
      question: "Is my study plan uploaded anywhere?",
      answer: "No. It's stored only in your browser's local storage.",
    },
  ],
  relatedTools: [
    "iitm-bs-semester-workload-estimator",
    "iitm-bs-exam-countdown-planner",
    "iitm-bs-semester-planner",
  ],
  isNew: true,
}

export default meta
