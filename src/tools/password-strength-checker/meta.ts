import { Gauge } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "password-strength-checker",
  title: "Password Strength Checker",
  description:
    "Check how strong a password is, with a live strength meter and a criteria checklist.",
  longDescription:
    "Type or paste a password to see an instant strength estimate based on its length and character variety, plus a checklist of common password requirements. The password is analyzed entirely in your browser as you type - it is never sent anywhere or logged.",
  category: "security",
  keywords: [
    "password strength checker",
    "check password strength",
    "password strength test",
    "how strong is my password",
    "password security checker",
  ],
  tags: ["password", "security", "strength", "checker"],
  icon: Gauge,
  features: [
    "Live strength meter as you type",
    "Estimated entropy in bits",
    "Checklist for length, uppercase, lowercase, numbers, and symbols",
    "Show/hide toggle so you can verify what you typed",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Is my password sent anywhere when I check it?",
      answer:
        "No. The password never leaves your browser - it is analyzed entirely with local JavaScript and is not transmitted, stored, or logged anywhere.",
    },
    {
      question: "How is the strength score calculated?",
      answer:
        "The score is based on the password's entropy: its length multiplied by the size of the character pool it draws from (uppercase, lowercase, numbers, symbols). It does not check against lists of breached or common passwords.",
    },
    {
      question: "What makes a password strong?",
      answer:
        "Length matters more than complexity - a longer password with mixed character types is exponentially harder to brute-force than a short one. Aim for 12 or more characters using a mix of uppercase, lowercase, numbers, and symbols.",
    },
  ],
  relatedTools: ["password-generator"],
  isNew: true,
}

export default meta
