import { Braces } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "html-to-jsx",
  title: "HTML to JSX Converter",
  description:
    "Convert pasted HTML into valid JSX, with attributes renamed and inline styles turned into objects.",
  longDescription:
    "Paste markup from a template, an email, or a design export and get JSX you can drop into a React component. Every attribute is renamed to the form React expects, inline style strings become style objects, void elements are self-closed, and comments become JSX comments. Inline event handlers such as onclick are removed rather than translated, because a string cannot be an event handler in React, and script elements go with them, so markup copied off a page cannot carry an executable payload into your component. The tool lists everything it removed so nothing goes missing silently. The whole conversion runs in your browser.",
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
    "Removes scripts and inline handlers, and lists everything it removed",
  ],
  faqs: [
    {
      question: "Why are my onclick handlers missing from the output?",
      answer:
        'React expects an event handler to be a function, so onclick="doThing()" cannot be carried across as a string. The converter removes inline handlers, along with script elements, and lists everything it removed below the output so you can wire each handler up to a real function yourself. Ordinary markup is left alone: tables, forms, inline SVG, style blocks, and iframe embeds all come across.',
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
        "No. The markup is sanitized and converted locally in your browser, so markup from an internal template or an unreleased page stays on your machine.",
    },
  ],
}

export default meta
