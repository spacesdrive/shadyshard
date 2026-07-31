import { Settings2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "env-file-converter",
  title: "Env File Converter",
  description:
    "Convert a .env file into JSON, YAML, shell exports, a Docker Compose list, or a redacted .env.example.",
  longDescription:
    "Environment variables end up needing the same values in several shapes: a .env file locally, a YAML block in a Compose file, export lines in a shell script, and JSON for a deployment API. Paste a .env file, or JSON, and get any of those back. The parser follows the usual dotenv rules, so comments, blank lines, an optional export prefix, quoted values, and escape sequences inside double quotes are all handled rather than being split naively on the first equals sign. The .env.example output keeps every key and blanks every value, which is the file you actually want to commit. Everything is parsed in your browser, which matters because a .env file is usually the single most sensitive file in a repository.",
  category: "developer",
  keywords: [
    "env to json converter",
    "dotenv converter",
    "env to yaml",
    "env to docker compose",
    "generate env example file",
  ],
  tags: ["env", "dotenv", "json", "yaml", "docker", "config", "converter"],
  icon: Settings2,
  isNew: true,
  features: [
    "Converts .env to JSON, YAML, shell exports, or a Docker Compose environment list",
    "Generates a .env.example with every value blanked out",
    "Converts JSON back into .env format, quoting values only when needed",
    "Follows dotenv rules for comments, export prefixes, quotes, and escapes",
    "Parses locally, so secrets in the file are never transmitted",
  ],
  faqs: [
    {
      question: "Is it safe to paste a .env file containing real secrets?",
      answer:
        "On this page, yes. The file is parsed by JavaScript running in your browser and nothing is sent to a server. That question is worth asking of any online converter, because a .env file typically holds database passwords and API keys.",
    },
    {
      question: "How are quoted values handled?",
      answer:
        "Single-quoted values are taken literally. Double-quoted values have their escape sequences interpreted, so a backslash n becomes a real newline, which is how multi-line values such as private keys are usually stored. Unquoted values are trimmed and anything after an unquoted hash is treated as a comment.",
    },
    {
      question: "What is the .env.example output for?",
      answer:
        "It lists every variable your project needs with the values removed, so it can be committed to the repository as documentation without leaking anything. Keeping it generated from the real file avoids the common problem of a new contributor missing a variable that was added months ago.",
    },
    {
      question: "Does the Docker Compose output go under environment or env_file?",
      answer:
        "It produces the environment list form, a YAML sequence of KEY=value strings that you paste under a service's environment key. If you would rather keep the file separate, reference the original .env with env_file instead and no conversion is needed.",
    },
  ],
}

export default meta
