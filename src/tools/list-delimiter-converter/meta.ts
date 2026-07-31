import { List } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "list-delimiter-converter",
  title: "List Delimiter Converter",
  description:
    "Turn a column of values into a comma separated list, or any delimiter into any other, with optional quoting.",
  longDescription:
    "Paste a column copied out of a spreadsheet and convert it into a comma separated list, a SQL IN clause, a JSON array, or any custom delimiter you need. Each item can be trimmed, deduplicated, sorted, and wrapped in quotes or brackets in the same pass. The conversion runs in your browser, which matters when the column you pasted is a list of customer emails or account IDs.",
  category: "text",
  keywords: [
    "comma separator",
    "convert column to comma separated list",
    "list to comma separated",
    "delimiter converter",
    "sql in clause generator",
  ],
  tags: ["text", "list", "delimiter", "comma", "convert", "sql"],
  icon: List,
  features: [
    "Split on new lines, commas, semicolons, tabs, spaces, or a custom delimiter",
    "Join with any delimiter and wrap each item in quotes or brackets",
    "Trim, remove empty items, deduplicate, and sort in one pass",
    "One-click presets for SQL IN lists, JSON arrays, and CSV rows",
    "Live item count with copy and download",
  ],
  faqs: [
    {
      question: "How do I turn a spreadsheet column into a comma separated list?",
      answer:
        "Copy the column out of the spreadsheet and paste it in. The default settings split on new lines and join with a comma and a space, which is the format most forms and query strings expect.",
    },
    {
      question: "Can it build a SQL IN clause?",
      answer:
        "Yes. The SQL IN list preset wraps every item in single quotes, joins them with a comma, and surrounds the result with parentheses. Values that already contain a single quote are not escaped, so check the output before running it against a database.",
    },
    {
      question: "What happens to blank lines and stray spaces?",
      answer:
        "Items are trimmed and empty items are dropped by default, so a trailing newline at the end of a paste does not produce an empty entry. Both behaviours can be switched off.",
    },
    {
      question: "Is the list I paste sent anywhere?",
      answer:
        "No. Splitting and joining happen in your browser, so pasted identifiers, emails, and IDs never leave the page.",
    },
  ],
  relatedTools: ["line-sorter", "remove-duplicate-lines", "csv-to-json"],
}

export default meta
