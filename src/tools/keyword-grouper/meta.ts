import { Group } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "keyword-grouper",
  title: "Keyword Grouper",
  description:
    "Group a keyword export into topic clusters by the phrases the keywords share.",
  longDescription:
    "Paste a keyword list, optionally with a search volume column, and this groups it by the phrases the keywords actually have in common, so a few hundred rows collapse into a manageable set of topics to plan pages around. Grouping is lexical: it counts the one, two, and three word phrases across the list, ignores stop words, and assigns each keyword to the strongest phrase it contains. That is transparent and repeatable, unlike a black box, and it does not need an API key or send your keyword list to a model. Groups are sorted by total volume when you provide one, and the result downloads as CSV.",
  category: "seo",
  keywords: [
    "keyword grouping tool",
    "keyword clustering free",
    "group keywords by topic",
    "keyword list organizer",
    "seo keyword cluster generator",
  ],
  tags: ["seo", "keywords", "cluster", "group", "research", "csv"],
  icon: Group,
  features: [
    "Groups by shared one, two, or three word phrases",
    "Optional search volume column, with volume totalled per group",
    "Editable stop word list so brand terms can be excluded or kept",
    "Minimum group size control to keep the output readable",
    "Copy the grouped list or download it as CSV",
  ],
  faqs: [
    {
      question: "How does the grouping actually work?",
      answer:
        "Every keyword is split into words, stop words are dropped, and the remaining one, two, and three word phrases are counted across the whole list. Phrases are then taken in order of how many keywords contain them, and each keyword joins the first group whose phrase it contains. Longer phrases are preferred over shorter ones at the same frequency, since they describe a tighter topic.",
    },
    {
      question: "How is this different from clustering by search results?",
      answer:
        "The strongest clustering method compares which pages rank for each keyword, which needs live search data and therefore an API and a budget. This groups by the words themselves, which is what most people do by hand in a spreadsheet, and it gets you to a usable content plan without either. Treat the output as a starting point to adjust, not a final answer.",
    },
    {
      question: "What format should the keyword list be in?",
      answer:
        "One keyword per line. If a line has a comma or tab followed by a number, that number is read as search volume and totalled per group, which is the shape most keyword tools export. Lines without a number still work; the volume column is simply left out.",
    },
    {
      question: "Is my keyword list sent anywhere?",
      answer:
        "No. The counting and grouping run in your browser. A keyword export is a fair summary of a content strategy, so keeping it local is worth doing.",
    },
  ],
}

export default meta
