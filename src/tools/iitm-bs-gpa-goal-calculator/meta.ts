import { Target } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iitm-bs-gpa-goal-calculator",
  title: "IITM BS GPA Goal Calculator",
  description:
    "Find the average grade points you need in your remaining IITM BS credits to hit a target CGPA.",
  longDescription:
    "Enter your current CGPA and credits completed, your target CGPA, and how many credits you have left to take. This tool works backward to tell you the average grade points per remaining credit you need to reach that target, and flags immediately if the target is mathematically out of reach or already secured. Everything runs locally in your browser - nothing is uploaded. This is an unofficial planning aid; treat the result as a guide, not a guarantee.",
  category: "student",
  keywords: [
    "iitm bs gpa goal calculator",
    "iitm target cgpa calculator",
    "iit madras cgpa goal",
    "required gpa calculator",
    "iitm bs grade planning",
  ],
  tags: ["iitm", "iit madras", "cgpa", "gpa", "goal", "planning", "student"],
  icon: Target,
  features: [
    "Works backward from a target CGPA to a required grade average",
    "Flags targets that are mathematically unreachable",
    "Flags targets you've already secured",
    "Shows the nearest achievable letter grade average",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is the required grade average calculated?",
      answer:
        "It solves for the average grade points (g) across your remaining credits such that (currentCGPA x completedCredits + g x remainingCredits) / (completedCredits + remainingCredits) equals your target CGPA.",
    },
    {
      question: "What if the required average is above 10?",
      answer:
        "IIT Madras's grade scale tops out at 10 (grade S). If the calculation asks for more than 10, your target CGPA is not reachable with the remaining credits you entered - you'd need more credits or a lower target.",
    },
    {
      question: "Is this official IITM BS guidance?",
      answer:
        "No. This is an unofficial, independently built planning calculator. Always confirm your standing against your official IITM BS grade sheet.",
    },
  ],
  relatedTools: [
    "iitm-bs-cgpa-calculator",
    "iitm-bs-credit-calculator",
    "iitm-bs-graduation-estimator",
  ],
  isNew: true,
}

export default meta
