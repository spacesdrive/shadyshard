import { Braces } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-to-rust",
  title: "JSON to Rust Struct",
  description:
    "Generate serde-ready Rust structs from a JSON sample, with nested types and snake_case renames.",
  longDescription:
    "Paste a JSON response and get the Rust structs needed to deserialize it with serde. Nested objects become their own named structs, arrays become Vec, fields that are null or missing from some records become Option, and any key that is not already snake_case gets a serde rename attribute so the Rust field name stays idiomatic without changing the wire format. Keys that collide with Rust keywords are renamed and mapped back the same way. The JSON is parsed in your browser, so an API response with real customer records or a bearer token in it never leaves the page.",
  category: "developer",
  keywords: [
    "json to rust struct",
    "serde struct generator",
    "rust deserialize json",
    "json to rust serde",
    "generate rust types from json",
  ],
  tags: ["json", "rust", "serde", "converter", "codegen", "types"],
  icon: Braces,
  features: [
    "Nested objects become separate named structs, not inline types",
    "Adds serde rename attributes for camelCase and kebab-case keys",
    "Infers Option for null values and keys missing from some array elements",
    "Merges the keys of every object in an array into one struct",
    "Optional Debug, Clone, Serialize, and Deserialize derives",
  ],
  faqs: [
    {
      question: "Why did a field become serde_json::Value?",
      answer:
        "That happens when a single JSON key holds different types across an array, or when an array is empty, so there is no single Rust type that fits. Replace it with a concrete type or an enum once you know what the field can actually contain.",
    },
    {
      question: "How are integers and floats decided?",
      answer:
        "A number with no fractional part becomes i64 and a number with one becomes f64. If the same key appears as both across an array of objects, the field widens to f64 so every observed value still parses.",
    },
    {
      question: "Does the generated code need any crates?",
      answer:
        "It needs serde with the derive feature, and serde_json if any field fell back to serde_json::Value. The generated file includes the matching use statement.",
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. Parsing and code generation both run in your browser. Nothing you paste is sent to a server, which matters because the JSON people convert is usually a live API response.",
    },
  ],
}

export default meta
