import { KeyRound } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "password-generator",
  title: "Password Generator",
  description: "Generate strong, random passwords with custom length and character sets.",
  longDescription:
    "Create cryptographically random passwords using the Web Crypto API, with full control over length and which character sets are included. Every password is generated locally in your browser using crypto.getRandomValues - nothing is ever sent to a server, and nothing is logged.",
  category: "generators",
  keywords: [
    "password generator",
    "random password generator",
    "strong password generator",
    "secure password generator",
    "generate password online",
  ],
  tags: ["password", "generator", "security", "random"],
  icon: KeyRound,
  features: [
    "Cryptographically secure randomness (Web Crypto API, not Math.random)",
    "Adjustable length from 8 to 64 characters",
    "Toggle uppercase, lowercase, numbers, and symbols",
    "Live strength meter for the generated password",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How random are these passwords?",
      answer:
        "Passwords are generated using the Web Crypto API's crypto.getRandomValues, the same cryptographically secure randomness source browsers use for keys and tokens, with rejection sampling to avoid modulo bias. This is not Math.random(), which is not safe for generating secrets.",
    },
    {
      question: "Are my generated passwords stored or sent anywhere?",
      answer:
        "No. Passwords are generated and displayed entirely in your browser and are never transmitted or logged.",
    },
    {
      question: "What length should I use?",
      answer:
        "12 characters or more with all character sets enabled is generally recommended. Longer passwords with a full character set have exponentially more possible combinations, which the strength meter reflects.",
    },
  ],
  relatedTools: ["password-strength-checker", "uuid-generator", "nanoid-generator"],
  isNew: true,
}

export default meta
