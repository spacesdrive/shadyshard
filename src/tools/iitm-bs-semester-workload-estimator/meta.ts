import { Gauge } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iitm-bs-semester-workload-estimator",
  title: "IITM BS Semester Workload Estimator",
  description:
    "Estimate your total weekly study hours for a term from your course credits, and flag an overloaded term.",
  longDescription:
    "List the courses and credits you're planning for a term, set an hours-per-credit estimate for each (defaults to 3 hours a week per credit, a common rule of thumb, fully editable), and set your realistic weekly hours budget. This tool totals the estimated weekly workload and flags it if it exceeds your budget, so you can rebalance before the term starts rather than after. Everything runs locally in your browser.",
  category: "student",
  keywords: [
    "iitm bs workload estimator",
    "iitm bs credit hours estimate",
    "iit madras semester workload",
    "iitm bs study hours per credit",
    "iitm bs term overload check",
  ],
  tags: ["iitm", "iit madras", "workload", "credits", "planning", "student"],
  icon: Gauge,
  features: [
    "Per-course editable hours-per-credit estimate",
    "Configurable weekly hours budget",
    "Flags a term that's likely overloaded",
    "List saved locally between visits",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Where does the 3-hours-per-credit default come from?",
      answer:
        "It's a common general rule of thumb for credit-hour workload, not an IITM BS-published figure. Every course's hours-per-credit value is editable - adjust it based on your own experience with a given course's difficulty.",
    },
    {
      question: "Is this an official IITM BS workload figure?",
      answer:
        "No. This is an unofficial estimate built from numbers you enter and edit yourself. Treat it as a planning aid, not a guarantee.",
    },
  ],
  relatedTools: [
    "iitm-bs-weekly-study-planner",
    "iitm-bs-semester-planner",
    "iitm-bs-credit-calculator",
  ],
  isNew: true,
}

export default meta
