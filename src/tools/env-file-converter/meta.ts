import { Settings2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "env-file-converter",
  title: "Env File Converter",
  description:
    "Convert a .env file to JSON, YAML, shell exports, Docker flags, or a Kubernetes ConfigMap.",
  longDescription:
    "The same set of environment variables has to be expressed differently in a dotenv file, a docker run command, a Compose file, a Kubernetes ConfigMap, and a CI settings block, and retyping them by hand is where typos come from. Paste any one of those forms and get the others back. The parser handles comments, the export prefix, single and double quoting, escaped newlines, and values containing an equals sign. Because environment files usually hold credentials, the conversion runs entirely in your browser and nothing is transmitted or stored.",
  category: "converters",
  keywords: [
    "env to json converter",
    "dotenv to yaml",
    "env file to kubernetes configmap",
    "convert env to docker",
    "environment variables converter",
  ],
  tags: ["env", "dotenv", "json", "yaml", "docker", "kubernetes", "config"],
  icon: Settings2,
  features: [
    "Reads dotenv, JSON, or YAML input with automatic format detection",
    "Outputs dotenv, JSON, YAML, shell exports, Docker flags, and a ConfigMap",
    "Handles quoted values, escaped newlines, comments, and the export prefix",
    "Flags keys that are not valid environment variable names",
    "Runs locally, so secrets in the file never leave your browser",
  ],
  faqs: [
    {
      question: "Is it safe to paste a .env file containing real secrets?",
      answer:
        "The parsing and conversion happen entirely in your browser and nothing is uploaded or logged. That said, treat any browser tab as you would any other place a secret has been pasted, and rotate a credential if you are unsure where it has been.",
    },
    {
      question: "How are quoted values handled?",
      answer:
        "Double-quoted values have their surrounding quotes removed and escape sequences such as a backslash followed by n expanded to a real newline. Single-quoted values are taken literally. Unquoted values are trimmed of surrounding whitespace, and an inline comment after an unquoted value is dropped.",
    },
    {
      question: "Why is a key reported as invalid?",
      answer:
        "Environment variable names must start with a letter or underscore and contain only letters, digits, and underscores. A key with a dash or a dot is accepted by some tools but rejected by POSIX shells, so it is flagged rather than silently emitted.",
    },
    {
      question: "Does the Kubernetes output include Secret resources?",
      answer:
        "It produces a ConfigMap, where values are plain text. A Secret expects Base64-encoded values and is the right resource for credentials, so copy the values into a Secret manifest yourself rather than committing a ConfigMap of passwords.",
    },
  ],
}

export default meta
