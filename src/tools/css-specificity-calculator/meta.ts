import { Layers } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "css-specificity-calculator",
  title: "CSS Specificity Calculator",
  description:
    "Score CSS selectors as ID, class, and element counts, and see which one wins a conflict.",
  longDescription:
    "Paste one selector or a list of them and get each one's specificity as the three numbers the cascade actually compares: IDs, then classes, attributes and pseudo-classes, then element types and pseudo-elements. Every selector is broken down part by part so it is clear what contributed, which is the part a mental tally usually gets wrong. The Selectors Level 4 rules are applied, so :is(), :not() and :has() take the specificity of their most specific argument, :where() contributes nothing at all, and the universal selector and combinators are correctly worth zero. Enter several selectors and the one that wins is marked, which answers the question that sent you looking in the first place.",
  category: "css",
  keywords: [
    "css specificity calculator",
    "selector specificity",
    "which css rule wins",
    "css specificity 0 1 0",
    "is not where specificity",
  ],
  tags: ["css", "specificity", "selector", "cascade", "debug"],
  icon: Layers,
  features: [
    "Specificity as the three cascade values, ID, class, and element",
    "Part by part breakdown of what contributed to each value",
    "Correct Selectors Level 4 handling of :is(), :not(), :has(), and :where()",
    "Compares a list of selectors and marks the winner",
    "Runs in your browser with no styles or markup sent anywhere",
  ],
  relatedTools: ["css-grid-generator", "flexbox-playground", "css-unit-converter"],
  faqs: [
    {
      question: "What do the three numbers mean?",
      answer:
        "They count ID selectors, then class, attribute and pseudo-class selectors, then element type and pseudo-element selectors. They are compared left to right, so a single ID beats any number of classes. They are not digits of one number: eleven classes is 0-11-0, which does not roll over into the ID column.",
    },
    {
      question: "Why does :where() score zero?",
      answer:
        "That is its purpose. :where() applies its arguments without contributing any specificity, which lets a library set defaults that authors can override with a plain class. :is() looks similar but takes the specificity of its most specific argument instead.",
    },
    {
      question: "Does specificity decide every conflict?",
      answer:
        "No. Origin and importance are checked first, so an !important declaration or a user stylesheet can win regardless. Specificity only settles conflicts within the same layer and origin, and if two selectors tie, the one declared later wins.",
    },
    {
      question: "Do combinators or the universal selector add specificity?",
      answer:
        "No. The child, sibling, and descendant combinators and the universal selector * all contribute zero, so div > p and div p score identically.",
    },
  ],
}

export default meta
