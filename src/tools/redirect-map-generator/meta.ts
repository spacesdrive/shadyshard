import { Signpost } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "redirect-map-generator",
  title: "Redirect Map Generator",
  description:
    "Turn a list of old and new URLs into redirect rules for Apache, Nginx, Netlify, Vercel, Next.js, or Shopify.",
  longDescription:
    "A site migration produces one list of old-to-new URL pairs, and then every platform wants that list in a different shape. Paste the pairs here, copied straight out of a spreadsheet, and get the rules in the syntax your host actually needs. Domains are stripped down to paths where the target format expects a path, duplicate sources and rows that redirect a URL to itself are flagged rather than silently written into your config, and you choose the status code. The whole list is processed in your browser, which matters because a migration map is usually a full inventory of a site that has not launched yet.",
  category: "seo",
  keywords: [
    "301 redirect generator",
    "bulk redirect map",
    "htaccess redirect generator",
    "nginx redirect rules generator",
    "site migration redirect list",
  ],
  tags: ["seo", "redirect", "migration", "htaccess", "nginx", "301", "generator"],
  icon: Signpost,
  isNew: true,
  features: [
    "Apache, Nginx, Netlify, Vercel, Next.js, Caddy, and Shopify CSV output",
    "Accepts comma, tab, or whitespace separated pairs pasted from a spreadsheet",
    "301, 302, 307, and 308 status codes",
    "Flags duplicate sources, self-redirects, and malformed rows",
    "Optional trailing slash normalisation",
  ],
  faqs: [
    {
      question: "Which status code should I use for a migration?",
      answer:
        "301 for a move that is permanent, which is almost always the case in a migration, because it passes ranking signals to the new URL and gets cached by browsers. Use 302 or 307 only while testing or for something genuinely temporary. 308 is the strict version of 301 that also preserves the request method, which matters for POST endpoints rather than pages.",
    },
    {
      question: "Why does it warn about duplicate sources?",
      answer:
        "If the same old URL appears twice with different targets, the first matching rule wins and the second is dead config. That is easy to create when a spreadsheet is sorted and merged by hand, and it is much easier to fix before deploying than to debug afterwards.",
    },
    {
      question: "Can I paste full URLs rather than paths?",
      answer:
        "Yes. For formats that match on the path, such as Apache, Nginx, Netlify, and Next.js, the origin is stripped from the source URL automatically. Targets keep whatever you pasted, so a cross-domain redirect to an absolute URL still works.",
    },
    {
      question: "Is my URL list uploaded?",
      answer:
        "No. The list is parsed and the rules are generated in your browser. A redirect map is effectively a complete inventory of a site, often one that has not launched yet, so keeping it local is the point.",
    },
  ],
}

export default meta
