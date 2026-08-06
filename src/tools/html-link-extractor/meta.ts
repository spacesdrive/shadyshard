import { Link2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "html-link-extractor",
  title: "HTML Link Extractor",
  description:
    "Pull every link out of pasted HTML with its anchor text, rel value, and internal or external status.",
  longDescription:
    "Paste a page's source and get a table of every link it contains: the href, the anchor text, the rel and target attributes, and whether the link points inside the site or off it. Give it the page's own URL and relative hrefs are resolved to absolute ones, so a link audit is not thrown off by a mix of /about and https://example.com/about. Empty anchor text, missing rel on an external link, and duplicated destinations are all called out, because those are the three things a link audit is usually looking for. Export the whole table as CSV for a spreadsheet. Nothing is crawled and nothing is uploaded, so a staging page behind a login can be audited by pasting its source.",
  category: "seo",
  keywords: [
    "html link extractor",
    "extract all links from html",
    "anchor text extractor",
    "internal external link audit",
    "get href list from page source",
  ],
  tags: ["seo", "links", "anchor text", "audit", "html", "nofollow"],
  icon: Link2,
  features: [
    "Every anchor listed with href, anchor text, rel, and target",
    "Relative URLs resolved against a base URL you supply",
    "Internal and external links separated and counted",
    "Flags empty anchor text, nofollow, and duplicate destinations",
    "CSV export of the full link table",
  ],
  faqs: [
    {
      question: "Why do I need to give the page URL?",
      answer:
        "Relative links such as /pricing cannot be classified as internal or external without knowing which site they are relative to. Supply the page's own URL and every href is resolved to an absolute one before it is classified. Without it, relative links are listed as they appear.",
    },
    {
      question: "Does it follow the links or check whether they work?",
      answer:
        "No. It only reads the markup you paste. Checking whether a link resolves would require requesting each URL, which a page in your browser cannot do across origins and which would mean sending your link list somewhere.",
    },
    {
      question: "Does it find links added by JavaScript?",
      answer:
        "Only if they are in the markup you paste. Copy the HTML from your browser's element inspector rather than from view-source if the page builds its navigation client-side.",
    },
    {
      question: "Is the page source I paste uploaded?",
      answer:
        "No. The markup is parsed in your browser and the extracted table is built locally, so a page from a staging environment or an internal tool never leaves your machine.",
    },
  ],
}

export default meta
