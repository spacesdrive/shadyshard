import { Link2Off } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "url-tracking-remover",
  title: "URL Tracking Parameter Remover",
  description:
    "Strip utm, fbclid, gclid, and other tracking parameters from a whole list of URLs at once.",
  longDescription:
    "The link you copy out of an email, an ad, or a social app usually carries a tag identifying the campaign, the message, and often you. Paste any number of URLs here and every known tracking parameter is removed in one pass, from the utm family to gclid, fbclid, msclkid, ttclid, igshid, mc_eid, and the Matomo and HubSpot prefixes. You can add your own parameters, keep specific ones that the destination actually needs, drop the fragment, or clear the query string entirely. A summary shows exactly which parameters were found, so you can see what the link was carrying rather than trusting that it is now clean. Everything runs in your browser using the URL parser it already ships with, so the links are not logged anywhere.",
  category: "security",
  keywords: [
    "remove utm parameters",
    "url tracking parameter remover",
    "strip fbclid gclid from links",
    "clean url before sharing",
    "bulk url cleaner",
  ],
  tags: ["url", "tracking", "privacy", "utm", "cleaner"],
  icon: Link2Off,
  features: [
    "Removes the utm family plus click identifiers from the major ad networks",
    "Handles a whole list of URLs in one pass",
    "Add your own parameters to remove, or keep ones the page needs",
    "Optional fragment removal, full query clearing, and duplicate removal",
    "Reports which parameters were stripped and how often",
  ],
  faqs: [
    {
      question: "Will removing these parameters break the link?",
      answer:
        "For the parameters in the default list, no. They exist for analytics and attribution, not for routing, so the destination page loads the same without them. Parameters the page genuinely needs, such as a product id or a search query, are left alone unless you clear the query string yourself.",
    },
    {
      question: "Which parameters are removed by default?",
      answer:
        "The utm family, Google's gclid, gbraid, wbraid, and dclid, Facebook's fbclid, Microsoft's msclkid, TikTok's ttclid, Twitter's twclid, Instagram's igshid, LinkedIn's li_fat_id, Yandex's yclid, plus Mailchimp, HubSpot, Marketo, Matomo, and Piwik prefixes.",
    },
    {
      question: "Why remove tracking parameters before sharing a link?",
      answer:
        "A tagged link tells the site which newsletter, ad, or post you came from, and in some cases which individual recipient you were. Sharing it onward passes that identifier to everyone who clicks it, which is rarely what anyone intends.",
    },
    {
      question: "Are the URLs I paste stored?",
      answer:
        "No. They are parsed and rewritten by JavaScript in your browser and discarded when you close the tab. Nothing is fetched or logged.",
    },
  ],
}

export default meta
