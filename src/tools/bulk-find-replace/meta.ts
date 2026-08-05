import { Replace } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "bulk-find-replace",
  title: "Bulk Find and Replace",
  description:
    "Apply a whole list of find and replace rules to text at once, with plain text or regular expressions.",
  longDescription:
    "Editors give you one find box at a time, which turns a rename across twenty terms into twenty passes and a lot of chances to miss one. Here you build a list of rules, each with its own find text, replacement, case sensitivity, and a switch between plain text and a regular expression, then run all of them over the input in order. Each rule reports how many replacements it made, so a rule that silently matched nothing is obvious instead of invisible, and an invalid pattern is reported against that rule rather than breaking the run. Everything is processed in your browser, which matters when the text is a draft, an export, or a config file you would rather not paste elsewhere.",
  category: "text",
  keywords: [
    "bulk find and replace",
    "multiple find replace online",
    "batch text replacement tool",
    "regex find and replace",
    "replace many words at once",
  ],
  tags: ["text", "replace", "regex", "bulk", "editing"],
  icon: Replace,
  features: [
    "Runs any number of rules over the text in the order you list them",
    "Plain text or JavaScript regular expression per rule",
    "Per-rule case sensitivity",
    "Shows how many replacements each rule made",
    "Reports invalid patterns against the rule that caused them",
  ],
  faqs: [
    {
      question: "In what order are the rules applied?",
      answer:
        "Top to bottom, each one over the result of the previous rule. That matters when two rules overlap: a later rule can match text an earlier rule inserted, so put the most specific rules first.",
    },
    {
      question: "Can I use capture groups in the replacement?",
      answer:
        "Yes, in regular expression mode. Refer to a group as $1, $2, and so on, exactly as JavaScript's replace method expects. In plain text mode the replacement is inserted literally, so a dollar sign is just a dollar sign.",
    },
    {
      question: "Why does a rule report zero replacements?",
      answer:
        "Either the text does not contain it, or the case does not match and the rule is case sensitive. An earlier rule may also have already rewritten the text the later rule was looking for.",
    },
    {
      question: "Is my text sent anywhere?",
      answer:
        "No. The rules run against the text in your browser using JavaScript's own string and regular expression support, and nothing is uploaded.",
    },
  ],
}

export default meta
