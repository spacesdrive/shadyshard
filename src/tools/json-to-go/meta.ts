import { Binary } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-to-go",
  title: "JSON to Go Struct",
  description:
    "Turn a JSON sample into a Go struct definition with json tags, nested types, and slices.",
  longDescription:
    "Paste a JSON response and get the Go type that unmarshals it, with a json tag on every field and nested objects written as inline anonymous structs. Field names are converted to exported Go names, and the initialisms the Go style guide expects fully capitalised, such as ID, URL, API, and HTTP, are handled rather than left as Id, Url, and Api. Arrays of objects are merged across every element instead of only the first, so a key that is absent from the first item still appears in the struct. Nothing is uploaded, so pasting a real API response that contains customer data or an internal schema stays on your machine.",
  category: "developer",
  keywords: [
    "json to go struct",
    "json to golang",
    "generate go struct from json",
    "go json tags generator",
    "golang struct converter",
  ],
  tags: ["go", "golang", "json", "struct", "codegen", "types"],
  icon: Binary,
  features: [
    "Generates nested inline structs for nested JSON objects",
    "Capitalises Go initialisms such as ID, URL, API, and HTTP correctly",
    "Merges keys across every object in an array, not just the first",
    "Optional omitempty on every json tag",
    "Custom root type name, with copy and download as a .go file",
  ],
  faqs: [
    {
      question: "How are JSON numbers typed?",
      answer:
        "A number with no fractional part becomes int and a number with one becomes float64. If the same key is an integer in one array element and a decimal in another, the field widens to float64 so both values unmarshal. JSON has a single number type, so this is inference from the sample rather than a guarantee about the API.",
    },
    {
      question: "What happens to null values?",
      answer:
        "A key whose only observed value is null becomes interface{}, because the sample gives no information about what the field holds when it is populated. If the same key has a real value in another element of an array, that type is used instead. Change interface{} to a pointer type such as *string if the field is genuinely nullable.",
    },
    {
      question: "Why are nested structs inline instead of separate named types?",
      answer:
        "Inline anonymous structs keep the whole shape in one declaration, which is easier to check against the JSON you pasted and is the form most Go developers paste straight into a file. If you prefer separate named types, extract the inner struct into its own type declaration after copying.",
    },
    {
      question: "Is my JSON sent to a server?",
      answer:
        "No. The JSON is parsed and the Go code is generated in your browser. There is no upload and no logging, which is the point when the sample is a real API response containing tokens, identifiers, or customer records.",
    },
  ],
}

export default meta
