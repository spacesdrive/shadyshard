import { Braces } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-to-typescript",
  title: "JSON to TypeScript",
  description:
    "Turn a JSON sample into TypeScript interfaces, with nested types and optional keys.",
  longDescription:
    "Paste a JSON response and get TypeScript interfaces for it, including named interfaces for nested objects, unions for mixed arrays, and optional markers for keys that are missing from some array items. The whole conversion runs in your browser, so API responses that contain real data stay on your machine.",
  category: "developer",
  keywords: [
    "json to typescript",
    "generate typescript interface from json",
    "json to type definition",
    "typescript interface generator",
  ],
  tags: ["json", "typescript", "types", "developer", "converter"],
  icon: Braces,
  features: [
    "Named interfaces for every nested object",
    "Optional keys inferred from array samples",
    "Union types for arrays holding more than one shape",
    "Choice of interface or type alias output",
  ],
  faqs: [
    {
      question: "How are optional properties decided?",
      answer:
        "When the JSON contains an array of objects, any key missing from at least one item is marked optional with a question mark. A key present in every item stays required.",
    },
    {
      question: "What happens to null values?",
      answer:
        "A null value produces a null member in the property type, so a field that is sometimes a string and sometimes null becomes string | null.",
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. Parsing and code generation both happen in the page using the browser's own JSON parser, so nothing leaves your device.",
    },
  ],
}

export default meta
