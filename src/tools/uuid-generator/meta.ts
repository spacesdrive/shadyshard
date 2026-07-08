import { Fingerprint } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "uuid-generator",
  title: "UUID Generator",
  description:
    "Generate random version 4 UUIDs in bulk, with optional uppercase and no-hyphens formatting.",
  longDescription:
    "Generate one or many RFC 4122 version 4 UUIDs using the browser's native crypto.randomUUID(). Choose how many to generate and toggle uppercase or hyphen-free formatting. Everything runs locally - no UUID is ever sent to a server.",
  category: "generators",
  keywords: [
    "uuid generator",
    "guid generator",
    "random uuid",
    "uuid v4 generator",
    "generate uuid online",
  ],
  tags: ["uuid", "guid", "generator", "identifier"],
  icon: Fingerprint,
  features: [
    "RFC 4122 version 4 UUIDs via the native Web Crypto API",
    "Generate up to 50 at once",
    "Optional uppercase formatting",
    "Optional hyphen removal",
    "Copy individually or copy all at once",
  ],
  faqs: [
    {
      question: "What version of UUID does this generate?",
      answer:
        "Version 4 (random) UUIDs, generated with the browser's built-in crypto.randomUUID() method, which is cryptographically random.",
    },
    {
      question: "Are these UUIDs guaranteed to be unique?",
      answer:
        "Collisions are astronomically unlikely with version 4 UUIDs - there are 2^122 possible values, so generating billions of UUIDs still carries negligible collision risk.",
    },
    {
      question: "Can I generate more than one UUID at a time?",
      answer:
        "Yes, use the quantity field to generate up to 50 UUIDs at once, then copy them individually or all together.",
    },
  ],
  relatedTools: ["nanoid-generator", "password-generator"],
  isNew: true,
}

export default meta
