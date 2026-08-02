import { BookText } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "openapi-to-markdown",
  title: "OpenAPI to Markdown",
  description:
    "Turn an OpenAPI or Swagger spec into readable Markdown API reference documentation.",
  longDescription:
    "Paste an OpenAPI 3 or Swagger 2 specification in JSON or YAML and get a Markdown reference you can drop into a README, a wiki, or a docs site. Every path and method becomes a section with its summary, parameters, request body, and response codes, and $ref values pointing at the components section are resolved to the schema name so the tables stay readable. The usual alternatives are build-time generators you have to install and configure. This runs in your browser, so an internal or unreleased specification is never uploaded.",
  category: "developer",
  keywords: [
    "openapi to markdown",
    "swagger to markdown",
    "generate api documentation from openapi",
    "openapi docs generator",
    "swagger yaml to markdown",
  ],
  tags: ["openapi", "swagger", "markdown", "api", "documentation", "convert", "yaml"],
  icon: BookText,
  features: [
    "Accepts OpenAPI 3 or Swagger 2, in JSON or YAML",
    "One section per path and method with parameters and responses",
    "Resolves component references to readable schema names",
    "Optional table of contents and schema reference section",
    "Copy or download the Markdown",
  ],
  faqs: [
    {
      question: "Which specification versions are supported?",
      answer:
        "OpenAPI 3.0 and 3.1, and Swagger 2.0. The differences that matter for documentation are handled: Swagger 2 declares a host and basePath rather than a servers list, and describes a request body as a body parameter rather than a separate requestBody object.",
    },
    {
      question: "How are $ref values handled?",
      answer:
        "A reference into the same document, such as #/components/schemas/User, is resolved so the table shows the schema name and, where the schema is defined inline, its properties. References to an external file cannot be resolved, because the tool never fetches anything over the network, so they are shown as the raw reference instead.",
    },
    {
      question: "Can I paste YAML instead of JSON?",
      answer:
        "Yes. The input is parsed as JSON first, and as YAML if that fails, so either format works without you choosing one.",
    },
    {
      question: "Is my specification uploaded anywhere?",
      answer:
        "No. Parsing and Markdown generation happen entirely in your browser. That matters here, since an API specification usually describes internal endpoints well before they are public.",
    },
  ],
}

export default meta
