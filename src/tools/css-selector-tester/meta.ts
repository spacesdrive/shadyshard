import { Crosshair } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "css-selector-tester",
  title: "CSS Selector Tester",
  description:
    "Check what a CSS selector matches in pasted HTML before you put it in a scraper or a stylesheet.",
  longDescription:
    "Paste markup, type a CSS selector, and see how many elements it matches and exactly which ones, each with its tag, id, classes, and text. Selectors that are syntactically invalid are reported with the browser's own error rather than silently matching nothing, which is the difference between a typo you can fix in a second and a scraper that quietly returns an empty list. Matching runs through the browser's native querySelectorAll on a parsed copy of your markup that is never attached to the page, so the markup you paste is tested exactly as written and never uploaded.",
  category: "developer",
  keywords: [
    "css selector tester",
    "test css selector online",
    "queryselectorall tester",
    "css selector for scraping",
    "check selector matches html",
  ],
  tags: ["css", "selector", "html", "scraping", "testing", "queryselector"],
  icon: Crosshair,
  features: [
    "Live match count as you type the selector",
    "Every match listed with tag, id, classes, and text",
    "Invalid selectors reported with the browser's own error message",
    "Optional attribute column for pulling href or src values out",
    "Copy the matched markup or the extracted attribute values",
  ],
  faqs: [
    {
      question: "Which selectors are supported?",
      answer:
        "Everything your browser's querySelectorAll supports, which is the full CSS selector specification including :has(), :is(), :not(), and attribute selectors. Non-standard extensions such as jQuery's :contains() are not part of CSS and will be reported as invalid.",
    },
    {
      question: "Does the markup I paste get uploaded?",
      answer:
        "No. The markup is parsed and queried by your own browser. The parsed copy has no browsing context, so nothing inside it runs or loads, and none of it is sent anywhere.",
    },
    {
      question: "Why do I get zero matches for a selector that works on the live site?",
      answer:
        "Pasting a page's served source gives you the markup before any JavaScript has run. If the elements you are targeting are rendered client-side, copy the HTML out of the browser's element inspector instead, which reflects the current DOM.",
    },
    {
      question: "Can I pull out an attribute rather than the whole element?",
      answer:
        "Yes. Enter an attribute name such as href or src and each match shows that attribute's value, which you can copy as a plain list.",
    },
  ],
}

export default meta
