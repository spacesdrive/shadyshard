import { Braces } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "css-minifier",
  title: "CSS Minifier and Formatter",
  description:
    "Minify a stylesheet to cut its size, or expand it back into readable indented CSS.",
  longDescription:
    "Paste a stylesheet to strip it down for production or to make an inherited, single-line file readable again. Minifying removes comments and collapses every run of whitespace, then drops the last semicolon in each block. Formatting does the reverse: one declaration per line, indented by nesting depth, with comments preserved. Unbalanced braces, unterminated comments, and unclosed strings are reported with the line number rather than producing quietly broken output. The stylesheet is tokenised in your browser and never uploaded, which matters when the CSS belongs to an unreleased design or a client project.",
  category: "developer",
  keywords: [
    "css minifier",
    "css formatter",
    "css beautifier",
    "minify css online",
    "format css",
  ],
  tags: ["css", "minify", "format", "beautify", "stylesheet", "compress"],
  icon: Braces,
  features: [
    "Minifies by removing comments and collapsing whitespace",
    "Formats with a choice of 2 spaces, 4 spaces, or tabs",
    "Reports unbalanced braces and unterminated comments with a line number",
    "Shows the before and after byte size and the percentage saved",
    "Copy the result or download it as a .css file",
  ],
  faqs: [
    {
      question: "Does minifying here rewrite my selectors or shorten colours?",
      answer:
        "No, and that is deliberate. This tool only removes comments and redundant whitespace and drops the final semicolon in each block. It never rewrites a selector, merges rules, or shortens a colour value, because those transforms are where a minifier can silently change how a page renders. Expect a smaller file than the input, not the smallest file theoretically possible.",
    },
    {
      question: "Will it break CSS that contains braces inside a string?",
      answer:
        'No. Quoted strings and comments are copied through verbatim, so a brace or semicolon inside content: "{}" does not affect the nesting depth. That is also what makes the brace-balance check reliable rather than a naive character count.',
    },
    {
      question: "Does it handle nested CSS, media queries, and at-rules?",
      answer:
        "Yes. The formatter indents by nesting depth, so native CSS nesting, media queries, supports queries, container queries, and keyframe blocks are all indented correctly. At-rules that end in a semicolon rather than a block, such as an import or a charset declaration, are kept on their own line.",
    },
    {
      question: "Is my stylesheet sent anywhere?",
      answer:
        "No. Parsing and output happen entirely in JavaScript on your device, with no network request involved. Nothing is stored and nothing is logged, so pasting proprietary CSS carries no more risk than opening it in your own editor.",
    },
  ],
}

export default meta
