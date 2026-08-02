import { Fingerprint } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "ulid-generator",
  title: "ULID Generator",
  description:
    "Generate sortable 26-character ULIDs, and decode the timestamp back out of an existing one.",
  longDescription:
    "A ULID is a 128-bit identifier written as 26 Crockford base32 characters: 48 bits of millisecond timestamp followed by 80 bits of randomness. Because the timestamp comes first, ULIDs sort in the order they were created, which is what makes them a better database key than a random UUID whose index writes land all over the place. Generate a batch here, with optional monotonic ordering so identifiers made in the same millisecond still sort correctly, or paste an existing ULID to read its creation time back out. The random half comes from the Web Crypto API rather than Math.random, and nothing is generated on or sent to a server.",
  category: "generators",
  keywords: [
    "ulid generator",
    "sortable unique id",
    "ulid decoder",
    "uuid alternative sortable",
    "generate ulid online",
  ],
  tags: ["ulid", "id", "generator", "sortable", "crockford", "uuid"],
  icon: Fingerprint,
  features: [
    "Generate up to 500 ULIDs at once",
    "Monotonic mode keeps order within the same millisecond",
    "Lower case output option",
    "Decode any ULID to its creation timestamp and random part",
    "Random bits come from the Web Crypto API",
  ],
  faqs: [
    {
      question: "Why use a ULID instead of a UUID version 4?",
      answer:
        "A version 4 UUID is entirely random, so consecutive inserts scatter across a B-tree index and the database has to keep splitting pages. A ULID starts with the creation time, so new rows land together at the end of the index, and sorting by the identifier gives you creation order without a separate timestamp column.",
    },
    {
      question: "What does monotonic mode do?",
      answer:
        "Two ULIDs created in the same millisecond share a timestamp, so their order depends on random bits and is effectively arbitrary. Monotonic mode instead increments the previous random value by one for each identifier in the same millisecond, so a batch generated together stays in the order it was generated.",
    },
    {
      question: "Is a ULID safe to expose in a URL?",
      answer:
        "It exposes the creation time, which a random UUID does not, so a public identifier reveals when the record was made. The 80 random bits make guessing another valid identifier impractical, but if the creation time itself is sensitive, use a random identifier instead.",
    },
    {
      question: "Are these generated on a server?",
      answer:
        "No. The identifiers are built in your browser from your clock and crypto.getRandomValues, so nobody else ever sees a value you generate here.",
    },
  ],
}

export default meta
