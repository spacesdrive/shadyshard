import { CalendarCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iitm-bs-graduation-estimator",
  title: "IITM BS Graduation Estimator",
  description:
    "Estimate how many more terms and years it will take to finish your IITM BS credit target.",
  longDescription:
    "Enter the credits you've completed, your target total (default 142 for the BS Degree, editable), and how many credits you realistically plan to take per term. This tool estimates the number of remaining terms and years to graduation, based on IITM BS's three terms a year (January, May, September). It's a projection from the numbers you enter, not an official completion date - actual timelines depend on course availability, retakes, and program rules.",
  category: "student",
  keywords: [
    "iitm bs graduation estimator",
    "iitm bs completion timeline",
    "iit madras degree timeline calculator",
    "iitm bs how many terms left",
    "iitm bs graduation date estimate",
  ],
  tags: ["iitm", "iit madras", "graduation", "timeline", "planning", "student"],
  icon: CalendarCheck,
  features: [
    "Estimates remaining terms and years to your credit target",
    "Accounts for IITM BS's three terms a year",
    "Editable credit target and pace assumptions",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How many terms does IITM BS run per year?",
      answer: "Three: January, May, and September.",
    },
    {
      question: "Is this an official graduation date?",
      answer:
        "No. It's a projection based on the pace you enter. Actual graduation depends on course availability, passing every required course, and the program's official rules - always confirm your real timeline against the IITM BS portal.",
    },
    {
      question: "What credit target should I use?",
      answer:
        "142 is the commonly published total for the BS Degree in Data Science and Applications. Use the IITM BS Degree Progress Tracker if you want the breakdown by Foundation/Diploma/BSc/BS level instead of a single target.",
    },
  ],
  relatedTools: [
    "iitm-bs-degree-progress-tracker",
    "iitm-bs-credit-calculator",
    "iitm-bs-semester-planner",
  ],
  isNew: true,
}

export default meta
