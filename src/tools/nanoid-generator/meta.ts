import { Hash } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "nanoid-generator",
  title: "Nano ID Generator",
  description:
    "Generate short, URL-friendly unique IDs with a custom length and alphabet.",
  longDescription:
    "Nano IDs are compact, URL-safe unique identifiers, commonly used for things like database keys and short URLs. Generate one or many, with a configurable length and character alphabet, using cryptographically secure randomness. Everything runs locally in your browser.",
  category: "generators",
  keywords: [
    "nanoid generator",
    "nano id generator",
    "url friendly id generator",
    "short id generator",
    "unique id generator",
  ],
  tags: ["nanoid", "id", "generator", "identifier"],
  icon: Hash,
  features: [
    "Cryptographically secure randomness (Web Crypto API)",
    "Adjustable length from 5 to 36 characters",
    "Customizable alphabet",
    "Generate up to 50 at once",
    "Copy individually or copy all at once",
  ],
  faqs: [
    {
      question: "How is this different from a UUID?",
      answer:
        "A Nano ID is shorter and uses a customizable alphabet, while a UUID always follows a fixed 36-character format. Nano IDs are popular for URL-friendly identifiers where a shorter string is preferable.",
    },
    {
      question: "Is the default alphabet URL-safe?",
      answer:
        "Yes. The default alphabet uses only letters, digits, underscores, and hyphens, all of which are safe to use directly in a URL without encoding.",
    },
    {
      question: "Can I change the character set?",
      answer:
        "Yes, edit the alphabet field to use only the characters you want - for example, digits only, or lowercase letters only.",
    },
  ],
  relatedTools: ["uuid-generator", "password-generator"],
  isNew: true,
}

export default meta
