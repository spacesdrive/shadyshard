import { FileCode2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-to-python",
  title: "JSON to Python Model",
  description:
    "Turn a JSON sample into Pydantic v2 models, dataclasses, or TypedDicts with inferred types.",
  longDescription:
    "Paste a JSON response and get the Python classes that describe it. Nested objects become their own classes, arrays become list types, and a value that is sometimes null becomes an optional field. You pick whether the output is a Pydantic v2 BaseModel, a standard library dataclass, or a TypedDict, which covers the three ways Python code usually models an API payload. The usual way to do this is a command line generator you have to install first. This runs in your browser instead, so a sample response from a staging API or a customer record never leaves your machine.",
  category: "developer",
  keywords: [
    "json to pydantic",
    "json to python dataclass",
    "generate pydantic model from json",
    "json to typeddict",
    "python model generator",
  ],
  tags: ["json", "python", "pydantic", "dataclass", "typeddict", "convert", "types"],
  icon: FileCode2,
  features: [
    "Pydantic v2 BaseModel, dataclass, or TypedDict output",
    "Nested objects become their own named classes",
    "Optional fields inferred from null values",
    "Keys that are not valid Python identifiers get a field alias",
    "Copy or download the generated module",
  ],
  faqs: [
    {
      question: "How are field types inferred?",
      answer:
        "Each value is mapped to the closest Python type: whole numbers become int, numbers with a decimal point become float, true and false become bool, strings become str, and objects become a generated class. A list takes the type of its items, or list[Any] when the items are of mixed types. A value that is null becomes Optional with a default of None.",
    },
    {
      question: "What happens to a key that is not a valid Python name?",
      answer:
        'Keys such as "user-id" or "class" cannot be used as attribute names. The field is renamed to a safe snake_case version, and for Pydantic output a Field(alias="user-id") is added so the model still parses the original payload. Dataclass and TypedDict output cannot express an alias, so the tool notes the renamed keys instead.',
    },
    {
      question: "Which Pydantic version does the output target?",
      answer:
        "Pydantic v2. The generated code uses model_config with populate_by_name where aliases are needed, which is the v2 spelling rather than the v1 Config class.",
    },
    {
      question: "Is the JSON I paste sent anywhere?",
      answer:
        "No. The JSON is parsed and the Python code is generated entirely in your browser with no network request, which matters because the fastest way to get a model is usually to paste a real API response.",
    },
  ],
}

export default meta
