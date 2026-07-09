import { Layers } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iitm-bs-credit-calculator",
  title: "IITM BS Credit Calculator",
  description:
    "Add up credits from completed and planned IITM BS courses against a credit target you set.",
  longDescription:
    "List every course credit value you've earned or plan to take, set a credit target (default 32 for Foundation, but fully editable), and see your running total and how many credits remain. This is a lightweight running-total tool - for a full breakdown across every program level at once, use the Degree Progress Tracker instead. Your list is saved locally in your browser; nothing is uploaded.",
  category: "student",
  keywords: [
    "iitm bs credit calculator",
    "iit madras credits calculator",
    "iitm bs total credits",
    "iitm credit requirement calculator",
    "iitm bs foundation credits",
  ],
  tags: ["iitm", "iit madras", "credits", "planning", "student"],
  icon: Layers,
  features: [
    "Add or remove course credit entries freely",
    "Set any credit target, defaults to the Foundation level's 32",
    "Live running total and credits remaining",
    "List saved locally between visits",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What's the difference between this and the Degree Progress Tracker?",
      answer:
        "This tool is a single running total against one target you set. The Degree Progress Tracker shows your standing across every IITM BS level (Foundation, Diploma, BSc, BS) at once, using the program's published default credit targets.",
    },
    {
      question: "Where does the default target of 32 credits come from?",
      answer:
        "32 credits is the commonly published Foundation-level requirement for the BS Degree in Data Science and Applications. It's fully editable since other specializations or program revisions can differ - always confirm against the current official IITM BS handbook.",
    },
    {
      question: "Is my credit list uploaded anywhere?",
      answer: "No. Everything is stored locally in your browser only.",
    },
  ],
  relatedTools: [
    "iitm-bs-degree-progress-tracker",
    "iitm-bs-cgpa-calculator",
    "iitm-bs-semester-planner",
  ],
  isNew: true,
}

export default meta
