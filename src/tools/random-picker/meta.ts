import { Shuffle } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "random-picker",
  title: "Random Picker",
  description:
    "Draw winners, shuffle a list, or split names into balanced teams, fairly and offline.",
  longDescription:
    "Paste a list of names, entries, or options and either draw a set of winners, shuffle the whole list into a random order, or split it into balanced groups. Shuffling uses a Fisher-Yates pass driven by the browser's cryptographic random number generator rather than the ordinary pseudo-random one, so every ordering is equally likely and the result cannot be predicted from earlier draws. Nothing is uploaded, so a giveaway entry list or a class roster stays on your machine, and there is no account or watermark on the result.",
  category: "generators",
  keywords: [
    "random name picker",
    "random winner generator",
    "team generator from list",
    "shuffle a list randomly",
    "raffle picker online",
  ],
  tags: ["random", "picker", "shuffle", "teams", "raffle", "giveaway"],
  icon: Shuffle,
  features: [
    "Pick winners, shuffle a list, or split it into groups",
    "Unbiased Fisher-Yates shuffle over the Web Crypto random source",
    "Optional duplicate removal and drawing with replacement",
    "Copy or download the result as plain text",
    "Runs offline in your browser, with no account and no entry list uploaded",
  ],
  faqs: [
    {
      question: "How random is the draw?",
      answer:
        "Each pick comes from crypto.getRandomValues with rejection sampling, so no value is favoured by the modulo bias that a naive remainder introduces. That is a stronger guarantee than the ordinary random function browsers expose, which is not designed to be unpredictable.",
    },
    {
      question: "Can the same entry be drawn twice?",
      answer:
        "Not by default. Winners are drawn without replacement, so each entry can win at most once. Switch on drawing with replacement if you want each draw to be independent, which is the right setting when a single entrant can win more than one prize.",
    },
    {
      question: "How are teams balanced?",
      answer:
        "The list is shuffled first, then dealt round by round into the requested number of groups. If the list does not divide evenly, the extra members are spread across the first few groups rather than piled into the last one.",
    },
    {
      question: "Is my list of names uploaded?",
      answer:
        "No. The list stays in the page, the draw happens in your browser, and nothing is stored or transmitted. Closing the tab discards it.",
    },
  ],
}

export default meta
