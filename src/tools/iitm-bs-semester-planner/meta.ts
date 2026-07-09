import { CalendarRange } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iitm-bs-semester-planner",
  title: "IITM BS Semester Planner",
  description:
    "Plan which IITM BS courses to take each term and see the credit total per term at a glance.",
  longDescription:
    "Add courses with a credit value and the term you plan to take them in, and this tool groups them by term with a running credit total for each one and for your whole plan. Useful for spreading coursework evenly across IITM BS's three terms a year (January, May, September) instead of overloading one term. Your plan is saved locally in your browser.",
  category: "student",
  keywords: [
    "iitm bs semester planner",
    "iitm bs term planner",
    "iit madras course planner",
    "iitm bs course schedule",
    "iitm bs term credit planning",
  ],
  tags: ["iitm", "iit madras", "semester", "term", "planning", "student"],
  icon: CalendarRange,
  features: [
    "Group planned courses by term",
    "Per-term and overall credit totals",
    "Add or remove courses freely",
    "Plan saved locally between visits",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How many terms does IITM BS run per year?",
      answer:
        'Three: January, May, and September. Enter whatever term label you use (for example "Jan 2027") - the tool groups by whatever text you enter.',
    },
    {
      question: "Does this check prerequisites for me?",
      answer:
        "No. Use the Course Prerequisite Visualizer to map out prerequisite chains before assigning courses to terms here.",
    },
    {
      question: "Is my plan uploaded anywhere?",
      answer: "No. Your plan is stored only in your browser's local storage.",
    },
  ],
  relatedTools: [
    "iitm-bs-credit-calculator",
    "iitm-bs-semester-workload-estimator",
    "iitm-bs-course-prerequisite-visualizer",
  ],
  isNew: true,
}

export default meta
