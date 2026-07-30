import { Target } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "css-specificity-calculator",
  title: "CSS Specificity Calculator",
  description:
    "Score CSS selectors as ID, class, and element counts and see which one wins.",
  longDescription:
    "When two rules set the same property, the browser picks the one whose selector is more specific, and specificity is counted as three separate columns rather than a single number. Paste one selector per line to see each one broken into its ID, class, and element counts, with every part of the selector labelled so you can tell which piece pushed the score up. Selectors are compared against each other and the winner is marked, which is usually the actual question being asked when a style refuses to apply. The functional pseudo-classes that change the rules are handled: is, not, and has take the specificity of their most specific argument, while where always contributes zero.",
  category: "css",
  keywords: [
    "css specificity calculator",
    "selector specificity",
    "why is my css not applying",
    "css cascade specificity",
    "compare css selectors",
  ],
  tags: ["css", "specificity", "selector", "cascade", "debug"],
  icon: Target,
  features: [
    "Scores any number of selectors at once, one per line",
    "Breaks each selector into the parts that contributed to its score",
    "Marks the winning selector when several are compared",
    "Handles is, not, has, and where correctly",
    "Flags inline styles and the important flag, which sit outside the score",
  ],
  faqs: [
    {
      question: "How is CSS specificity actually counted?",
      answer:
        "As three numbers. The first counts ID selectors, the second counts classes, attribute selectors, and pseudo-classes, and the third counts element types and pseudo-elements. They are compared left to right, so a single ID beats any number of classes.",
    },
    {
      question: "Why does the universal selector score zero?",
      answer:
        "The universal selector and combinators such as the child and sibling symbols are defined to add nothing to specificity. They affect which elements match, not how strongly the rule competes.",
    },
    {
      question: "How do is, not, has, and where differ?",
      answer:
        "The is, not, and has pseudo-classes take the specificity of their most specific argument, so a rule using is with an ID inside scores as an ID. The where pseudo-class always contributes zero, which is why it is the right choice for low-priority defaults in a library.",
    },
    {
      question: "Where do inline styles and the important flag fit in?",
      answer:
        "Neither is part of the three-number score. An inline style attribute outranks any selector in a stylesheet, and a declaration marked important outranks everything else in its origin, which is why it is flagged separately here rather than folded into the count.",
    },
  ],
}

export default meta
