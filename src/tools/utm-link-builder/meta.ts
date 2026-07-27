import { Link2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "utm-link-builder",
  title: "UTM Link Builder",
  description:
    "Build campaign tracking URLs with consistent, correctly encoded UTM parameters.",
  longDescription:
    "Add utm_source, utm_medium, utm_campaign, and the optional term, content, and id parameters to a URL, with optional lowercasing and space replacement so the same campaign is not split across three spellings in your reports. Everything is assembled in your browser, so unreleased landing page URLs stay private.",
  category: "seo",
  keywords: [
    "utm link builder",
    "campaign url builder",
    "utm parameter generator",
    "google analytics tracking url",
  ],
  tags: ["utm", "analytics", "campaign", "marketing", "seo"],
  icon: Link2,
  features: [
    "Required source, medium, and campaign fields with inline validation",
    "Optional term, content, and campaign id parameters",
    "Normalisation to lowercase with spaces replaced, to keep reporting consistent",
    "Preserves any query string and fragment already on the URL",
  ],
  faqs: [
    {
      question: "Which UTM parameters are actually required?",
      answer:
        "Google Analytics needs utm_source, utm_medium, and utm_campaign to attribute a visit to a campaign. Term, content, and id are optional and useful for splitting out ad variants.",
    },
    {
      question: "Why does casing matter?",
      answer:
        "UTM values are case sensitive in reporting, so Email, email, and EMAIL become three separate rows. Turning on normalisation lowercases values and replaces spaces so one campaign stays one row.",
    },
    {
      question: "What happens to a URL that already has a query string?",
      answer:
        "Existing parameters are kept and the UTM parameters are appended. A parameter with the same name as one you enter is replaced rather than duplicated.",
    },
  ],
  relatedTools: ["url-parser", "url-encoder-decoder", "slug-generator"],
  isNew: true,
}

export default meta
