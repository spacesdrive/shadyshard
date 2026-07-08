import { CaseSensitive } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "case-converter",
  title: "Case Converter",
  description:
    "Convert text between uppercase, lowercase, title case, camelCase, snake_case, and more.",
  longDescription:
    "Type or paste text to see it instantly converted into every common casing style at once - UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE - each with its own copy button. Everything runs locally in your browser.",
  category: "text",
  keywords: [
    "case converter",
    "text case converter",
    "camelcase converter",
    "snake case converter",
    "uppercase lowercase converter",
  ],
  tags: ["text", "case", "converter", "camelcase", "snakecase"],
  icon: CaseSensitive,
  features: [
    "Nine casing styles generated at once",
    "UPPERCASE, lowercase, Title Case, and Sentence case",
    "camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE",
    "Individual copy button for each style",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What's the difference between camelCase and PascalCase?",
      answer:
        "camelCase starts with a lowercase letter (myVariableName), while PascalCase starts with an uppercase letter (MyVariableName). Both are common in programming for variables and types respectively.",
    },
    {
      question: "How are word boundaries detected?",
      answer:
        "Spaces, hyphens, and underscores are all treated as word boundaries, so text already in kebab-case or snake_case converts correctly to the other styles.",
    },
    {
      question: "Is my text sent anywhere?",
      answer:
        "No. All conversion happens locally in your browser. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["slug-generator", "word-counter"],
  isNew: true,
}

export default meta
