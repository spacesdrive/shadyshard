import { Regex } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "regex-tester",
  title: "Regex Tester",
  description:
    "Test a JavaScript regular expression against sample text and see every match, capture group, and replacement live.",
  longDescription:
    "Type a pattern, pick your flags, and paste the text you want to test against. Every match is highlighted in place and listed with its position and named or numbered capture groups, and the replace field previews the result of String.replace without touching your original text. The pattern runs through your browser's own JavaScript regular expression engine, so what you see here is exactly what your code will do, and neither the pattern nor the test text is sent anywhere.",
  category: "developer",
  keywords: [
    "regex tester",
    "regular expression tester",
    "javascript regex",
    "test regex online",
    "regex match highlighter",
  ],
  tags: ["regex", "regular expression", "developer", "pattern", "match"],
  icon: Regex,
  features: [
    "Live match highlighting as you type",
    "Match positions plus numbered and named capture groups",
    "All JavaScript flags including sticky and unicode",
    "Replacement preview using String.replace syntax",
    "Specific error messages for an invalid pattern",
  ],
  faqs: [
    {
      question: "Which regular expression flavour does this use?",
      answer:
        "It uses your browser's built-in JavaScript engine, so the syntax matches what RegExp supports in Node.js and in the browser. Perl, PCRE, and Python specific constructs such as recursive patterns are not available.",
    },
    {
      question: "Are my pattern and test string uploaded anywhere?",
      answer:
        "No. The pattern is compiled and run entirely in your browser, and nothing you type is transmitted or stored.",
    },
    {
      question: "Why does the match list stop at 1000 entries?",
      answer:
        "A global pattern on a large input can produce far more matches than are useful to read, so the list is capped at 1000 to keep the page responsive. The match count above the list always reports the real total.",
    },
    {
      question: "How do I reference a capture group in the replacement?",
      answer:
        "Use the same syntax String.replace expects: $1 for the first numbered group, $<name> for a named group, and $& for the whole match.",
    },
  ],
}

export default meta
