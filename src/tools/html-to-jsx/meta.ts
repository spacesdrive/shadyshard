import { Braces } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "html-to-jsx",
  title: "HTML to JSX Converter",
  description:
    "Convert pasted HTML into valid JSX, with attributes renamed and inline styles turned into objects.",
  longDescription:
    "Paste markup from a template, an email, or a design export and get JSX you can drop into a React component. Every attribute is renamed to the form React expects, inline style strings become style objects, void elements are self-closed, and comments become JSX comments. Inline event handlers such as onclick are removed rather than translated, because a string cannot be an event handler in React, and the tool tells you which ones it dropped so nothing goes missing silently. The whole conversion runs in your browser using the native HTML parser.",
  category: "developer",
  keywords: [
    "html to jsx",
    "convert html to react",
    "class to className converter",
    "inline style to jsx object",
    "html to react component",
  ],
  tags: ["html", "jsx", "react", "convert", "component", "frontend"],
  icon: Braces,
  isNew: true,
  features: [
    "Renames class, for, tabindex, and every hyphenated attribute to its JSX form",
    "Rewrites inline style strings as React style objects",
    "Self-closes void elements such as img, br, and input",
    "Optionally wraps the result in a ready-to-use component",
    "Lists any inline event handlers it removed",
  ],
  faqs: [
    {
      question: "Why are my onclick handlers missing from the output?",
      answer:
        'React expects an event handler to be a function, so onclick="doThing()" cannot be carried across as a string. The converter removes inline handlers and lists them below the output so you can wire each one up to a real function yourself.',
    },
    {
      question: "What happens to inline styles?",
      answer:
        'A style attribute such as style="color: red; font-size: 12px" becomes style={{ color: "red", fontSize: "12px" }}. Custom properties keep their original name in quotes, since --brand-color is not a valid JavaScript identifier.',
    },
    {
      question: "Can it convert a full HTML page?",
      answer:
        "It converts what would be inside the body. A full document with html, head, and body tags is parsed the way a browser parses it, and the body content is what gets converted, since head content has no JSX equivalent inside a component.",
    },
    {
      question: "Does my markup get uploaded?",
      answer:
        "No. Parsing uses the browser's own DOMParser and the JSX is built locally, so markup from an internal template or an unreleased page stays on your machine.",
    },
  ],
}

export default meta
