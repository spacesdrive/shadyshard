import { Component } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "svg-to-jsx",
  title: "SVG to React Component",
  description:
    "Turn an SVG file into a React component with camelCased attributes, currentColor, and forwarded props.",
  longDescription:
    "Paste or drop an SVG and get a React component you can import straight away. Presentation attributes such as stroke-width and clip-path are camelCased, the root element can spread incoming props so a parent can pass className or onClick, and fill and stroke colors can be swapped for currentColor so the icon inherits the surrounding text color. TypeScript output types the props as SVGProps. Script elements, inline event handlers, and javascript: URLs are stripped before conversion, so a file downloaded from an icon set cannot carry anything executable into your app, and the tool lists what it removed. Everything an icon actually needs comes across, including gradients, clip paths, and sprite references. The SVG never leaves your browser.",
  category: "developer",
  keywords: [
    "svg to react",
    "svg to jsx",
    "svg to react component",
    "svg currentcolor converter",
    "icon component generator",
  ],
  tags: ["svg", "jsx", "react", "component", "icon", "convert"],
  icon: Component,
  features: [
    "camelCases every hyphenated SVG attribute",
    "Optional currentColor so the icon follows the text color",
    "Spreads props onto the root element for className and handlers",
    "TypeScript or plain JavaScript output",
    "Strips scripts, inline handlers, and javascript: URLs, and says what it removed",
  ],
  faqs: [
    {
      question: "Why replace fill and stroke with currentColor?",
      answer:
        "An icon that hard-codes a hex color looks wrong on a dark background or inside a colored button. Setting fill or stroke to currentColor makes the icon take the CSS color of whatever contains it, so one component works everywhere. Values of none are left alone, since none means no paint rather than a color.",
    },
    {
      question: "What does spreading props on the root do?",
      answer:
        "It adds {...props} to the svg element, so the parent can pass className, width, height, aria-label, or an onClick without the component needing a prop for each one. Because the spread comes last, a prop passed in wins over the value baked into the file.",
    },
    {
      question: "Can it handle an SVG exported from Figma or Illustrator?",
      answer:
        "Yes. Exported files usually carry extra id, data, and namespace attributes, and those are translated rather than dropped so nothing that a gradient, clip path, or sprite reference depends on gets broken. You can remove the width and height attributes if you would rather size the icon with CSS. The one construct that is deliberately not carried across is foreignObject, which embeds arbitrary HTML inside the image.",
    },
    {
      question: "Is the SVG sent to a server?",
      answer:
        "No. The markup is sanitized, parsed, and turned into a component locally in your browser, so an unreleased logo or a client's brand asset never leaves your machine.",
    },
  ],
}

export default meta
