import { Languages } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "hreflang-tag-generator",
  title: "Hreflang Tag Generator",
  description:
    "Generate reciprocal hreflang link tags and sitemap markup for a set of language URLs.",
  longDescription:
    "List each language or region version of a page with its URL and get the complete set of hreflang link tags, including the self-referencing entries and x-default that are the most commonly missed part of the specification. Language codes are validated as you type, and both the HTML head block and the XML sitemap form are produced in your browser.",
  category: "seo",
  keywords: [
    "hreflang tag generator",
    "hreflang sitemap xml",
    "international seo tags",
    "x-default hreflang",
  ],
  tags: ["hreflang", "seo", "international", "multilingual", "generator"],
  icon: Languages,
  features: [
    "Complete reciprocal tag set including self-referencing entries",
    "Validation of language and region code format",
    "Optional x-default entry for unmatched visitors",
    "Output as HTML head tags or as XML sitemap markup",
  ],
  faqs: [
    {
      question: "Why does every page need a self-referencing hreflang tag?",
      answer:
        "Search engines treat the annotation set as a group and expect each page in the group to list every version, including itself. A missing self-reference is one of the most common reasons an otherwise correct setup is ignored.",
    },
    {
      question: "What format should the codes use?",
      answer:
        "A lowercase ISO 639-1 language code, optionally followed by a hyphen and an uppercase ISO 3166-1 alpha-2 region code, such as en or en-GB. Region on its own is not valid.",
    },
    {
      question: "Should I use the HTML tags or the sitemap version?",
      answer:
        "Either works, but do not use both for the same page group. The sitemap form keeps page markup smaller and is easier to maintain for large sites.",
    },
  ],
  relatedTools: ["meta-tag-generator", "sitemap-generator", "robots-txt-generator"],
}

export default meta
