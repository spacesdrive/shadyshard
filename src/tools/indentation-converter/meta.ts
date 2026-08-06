import { IndentIncrease } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "indentation-converter",
  title: "Tabs to Spaces Converter",
  description:
    "Convert indentation between tabs and spaces at any tab width, without touching the rest of the line.",
  longDescription:
    "Paste code or configuration and switch its indentation between tabs and spaces at the tab width the project uses. Only leading whitespace is rewritten by default, so a tab inside a string literal or an aligned comment is left exactly as it was, which is the mistake a plain find and replace makes. Tab stops are honoured properly, meaning a tab advances to the next multiple of the tab width rather than always expanding to the same number of spaces, so partially indented lines line up the way an editor would show them. Trailing whitespace can be stripped in the same pass. The conversion runs in your browser, so an internal config file never leaves your machine.",
  category: "text",
  keywords: [
    "tabs to spaces converter",
    "spaces to tabs online",
    "convert indentation",
    "change tab width in code",
    "fix mixed indentation",
  ],
  tags: ["indentation", "tabs", "spaces", "code", "formatting", "whitespace"],
  icon: IndentIncrease,
  features: [
    "Tabs to spaces and spaces to tabs in both directions",
    "Configurable tab width from 1 to 8",
    "Rewrites leading indentation only, leaving inline tabs alone",
    "Proper tab-stop expansion rather than fixed-width substitution",
    "Optional trailing whitespace removal and a mixed-indentation warning",
  ],
  faqs: [
    {
      question: "Why does one tab sometimes become fewer spaces than the tab width?",
      answer:
        "A tab advances to the next tab stop, not by a fixed amount. With a width of 4, a tab after two spaces moves to column 4 and therefore expands to two spaces. This is how editors and terminals render tabs, so matching it is what keeps alignment intact.",
    },
    {
      question: "Will it change tabs inside my strings?",
      answer:
        "Not unless you ask it to. By default only the whitespace before the first non-whitespace character on each line is rewritten. There is a switch for converting every tab on the line if you genuinely need that.",
    },
    {
      question: "What does the mixed indentation warning mean?",
      answer:
        "It means at least one line starts with both tabs and spaces. That is the usual cause of code that looks aligned in one editor and misaligned in another, so it is flagged rather than silently normalised.",
    },
    {
      question: "Is my code uploaded?",
      answer:
        "No. The conversion is plain string processing done in your browser, and nothing you paste is transmitted.",
    },
  ],
}

export default meta
