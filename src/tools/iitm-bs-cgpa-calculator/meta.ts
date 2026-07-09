import { GraduationCap } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iitm-bs-cgpa-calculator",
  title: "IITM BS CGPA Calculator",
  description:
    "Calculate your IITM BS CGPA from course credits and grades, using IIT Madras's 10-point grade scale.",
  longDescription:
    "Add every course you've completed with its credit value and letter grade, and this tool computes your credit-weighted CGPA using IIT Madras's S-A-B-C-D-E-U grade scale. Grade points per letter are editable in case your term's grading document differs. Your course list is saved locally in your browser so it's there next time you open the tool - nothing is uploaded anywhere. This is an unofficial planning aid; always cross-check your CGPA against the official IITM BS grade sheet.",
  category: "student",
  keywords: [
    "iitm bs cgpa calculator",
    "iit madras cgpa calculator",
    "iitm bs grade calculator",
    "cgpa calculator online",
    "iitm data science cgpa",
  ],
  tags: ["iitm", "iit madras", "cgpa", "gpa", "grades", "student"],
  icon: GraduationCap,
  features: [
    "Add unlimited courses with credits and letter grade",
    "Editable grade-point scale for each letter grade",
    "Live credit-weighted CGPA as you type",
    "Course list saved locally between visits",
    "Export your course list as CSV",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is CGPA calculated?",
      answer:
        "CGPA is the sum of (credits x grade points) across every course, divided by the total credits. Courses graded Pass/Fail are excluded from the calculation, matching IIT Madras's published method.",
    },
    {
      question: "What grade points does IIT Madras use?",
      answer:
        "The default scale is S=10, A=9, B=8, C=7, D=6, E=4, U=0, which is IIT Madras's published 10-point relative grading scale. You can edit any grade's points if your term's official grading document specifies something different.",
    },
    {
      question: "Is this the official IITM BS CGPA calculator?",
      answer:
        "No. This is an unofficial, independently built planning tool. Always verify your actual CGPA against your official grade sheet on the IITM BS portal.",
    },
    {
      question: "Is my course data uploaded anywhere?",
      answer:
        "No. Everything is calculated and stored locally in your browser's storage. Nothing is sent to a server.",
    },
  ],
  relatedTools: [
    "iitm-bs-gpa-goal-calculator",
    "iitm-bs-credit-calculator",
    "iitm-bs-degree-progress-tracker",
  ],
  isNew: true,
}

export default meta
