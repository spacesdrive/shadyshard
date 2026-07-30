import { Languages } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "encoding-fixer",
  title: "Text Encoding Fixer",
  description:
    "Repair garbled text where accented characters turned into sequences like A-tilde.",
  longDescription:
    "When UTF-8 text is read as if it were Windows-1252 or Latin-1, every accented character turns into two or three strange ones, and a name that should read cafe with an accent comes out with an A-tilde in the middle. The damage is reversible as long as no character was replaced outright, because the original bytes are still there under the wrong interpretation. Paste the mangled text and this tool re-encodes it under each plausible wrong reading, decodes the result as UTF-8, and shows the candidates ranked by how few suspicious characters remain. Everything runs locally in your browser.",
  category: "text",
  keywords: [
    "fix garbled text",
    "mojibake decoder",
    "utf-8 encoding fixer",
    "fix accented characters",
    "repair broken characters in csv",
  ],
  tags: ["encoding", "mojibake", "utf-8", "latin1", "windows-1252", "repair"],
  icon: Languages,
  isNew: true,
  features: [
    "Tries Windows-1252 and Latin-1 misreadings, including double encoding",
    "Ranks candidate repairs by how few suspicious characters remain",
    "Flags replacement characters, which mark data that cannot be recovered",
    "Reports how many suspicious sequences remain in each candidate",
    "Runs locally, so spreadsheets and exports are never uploaded",
  ],
  faqs: [
    {
      question: "What causes this kind of garbled text?",
      answer:
        "A file written as UTF-8 being read by something that assumes a single-byte encoding, usually Windows-1252. A UTF-8 accented character is two bytes, and each of those bytes is shown as its own Latin character, which is why one character becomes two.",
    },
    {
      question: "Why can some text not be repaired?",
      answer:
        "If the misreading produced a replacement character, shown as a question mark in a diamond, the original byte was discarded at that point and no tool can bring it back. The tool flags those so you know the damage is permanent and the file needs re-exporting.",
    },
    {
      question: "Why are several candidate results shown?",
      answer:
        "Windows-1252 and Latin-1 differ only in the range that holds curly quotes and dashes, and text is sometimes mangled twice rather than once. Each combination produces a different repair, so all of them are shown with the most plausible first rather than guessing silently.",
    },
    {
      question: "How do I stop this from happening again?",
      answer:
        "Make sure the tool reading the file is told it is UTF-8. For CSV files opened in a spreadsheet this usually means using the import dialog and choosing UTF-8, rather than double-clicking the file, and a byte order mark at the start of the file makes most programs detect it correctly.",
    },
  ],
}

export default meta
