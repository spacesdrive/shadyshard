import { Braces } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-schema-generator",
  title: "JSON Schema Generator",
  description:
    "Infer a JSON Schema from a sample JSON document, with types, required keys, and string formats detected.",
  longDescription:
    "Paste a representative API response or config file and get a JSON Schema describing its shape. Every key is typed, objects and arrays are walked recursively, and arrays containing more than one shape are merged into a single item schema rather than being described by the first element alone. Recognisable string formats such as email addresses, date-times, UUIDs, and URIs are annotated, which turns a schema into something that validates real data instead of only checking that a value is a string. Draft 2020-12 and draft-07 output are both available, since tooling support still varies. The sample is parsed in your browser and never uploaded, so a response containing production data is safe to paste.",
  category: "developer",
  keywords: [
    "json schema generator",
    "generate json schema from json",
    "infer schema from json",
    "json schema draft 2020-12",
    "json to schema",
  ],
  tags: ["json", "schema", "validation", "api", "generator", "developer"],
  icon: Braces,
  features: [
    "Infers types recursively through nested objects and arrays",
    "Merges mixed array items into one item schema instead of guessing from the first",
    "Detects email, date, date-time, UUID, URI, and IPv4 string formats",
    "Draft 2020-12 or draft-07 output, with optional required key lists",
    "Copy or download the schema, parsed entirely in your browser",
  ],
  relatedTools: ["json-to-typescript", "json-validator", "json-formatter"],
  faqs: [
    {
      question: "How are required properties decided?",
      answer:
        "Every key present in the sample is listed as required, because a single sample cannot show which keys are optional. If your data has optional fields, either turn required lists off or paste an array of several representative objects, which merges their keys and marks only the ones present in every object as required.",
    },
    {
      question: "Which draft should I choose?",
      answer:
        "Draft 2020-12 is the current specification and the right default for new work. Choose draft-07 if your validator or code generator has not adopted 2020-12 yet, which is still common in older toolchains.",
    },
    {
      question: "Why does the schema say integer rather than number?",
      answer:
        "A JSON number with no fractional part is reported as an integer, since that is the more specific and usually more useful constraint. If a field can legitimately hold a decimal, widen it to number by hand after generating, because one sample cannot prove it.",
    },
    {
      question: "Is my JSON sent anywhere?",
      answer:
        "No. The sample is parsed and inspected by JavaScript in your browser, so a response containing customer data can be pasted without it leaving your machine.",
    },
  ],
}

export default meta
