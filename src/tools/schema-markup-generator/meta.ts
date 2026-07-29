import { Braces } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "schema-markup-generator",
  title: "Schema Markup Generator",
  description:
    "Build valid JSON-LD structured data for articles, FAQs, products, organizations, local businesses, and breadcrumbs.",
  longDescription:
    "Pick a schema.org type, fill in the fields, and copy ready-to-paste JSON-LD structured data for your page. The generator only emits properties you actually filled in, flags the required ones that are still missing, and can wrap the output in the script tag search engines expect. Everything is generated in your browser, so unpublished product prices and draft article details are never uploaded.",
  category: "seo",
  keywords: [
    "schema markup generator",
    "json-ld generator",
    "structured data generator",
    "faq schema",
    "product schema markup",
  ],
  tags: ["seo", "schema", "json-ld", "structured data", "generator", "rich results"],
  icon: Braces,
  isNew: true,
  features: [
    "Six schema types: Article, FAQPage, Product, Organization, LocalBusiness, BreadcrumbList",
    "Repeatable rows for FAQ entries and breadcrumb trails",
    "Missing required properties listed as you type",
    "Optional script tag wrapper for pasting straight into a page head",
    "Copy or download the generated JSON-LD",
  ],
  faqs: [
    {
      question: "Which structured data format should I use?",
      answer:
        "JSON-LD is the format Google recommends, because it sits in a single script block instead of being interleaved with your markup. This tool only generates JSON-LD.",
    },
    {
      question: "Where do I put the generated code?",
      answer:
        "Paste the script tag into the head of the page the markup describes, or anywhere in the body. The structured data must describe content that is actually visible on that page.",
    },
    {
      question: "Does valid markup guarantee rich results?",
      answer:
        "No. Valid structured data makes a page eligible for rich results, but search engines decide whether to show them. Validate the output with Google's Rich Results Test before relying on it.",
    },
    {
      question: "Is anything I type sent to a server?",
      answer:
        "No. The JSON-LD is assembled in your browser and nothing is transmitted or stored.",
    },
  ],
  relatedTools: ["meta-tag-generator", "serp-snippet-preview", "json-validator"],
}

export default meta
