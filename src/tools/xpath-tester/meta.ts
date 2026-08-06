import { Route } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "xpath-tester",
  title: "XPath Tester",
  description:
    "Run an XPath expression against pasted HTML or XML and see every node it matches.",
  longDescription:
    "Paste a page's markup or an XML document, type an XPath expression, and see the matched nodes listed with their position, node type, and value. String, number, and boolean expressions such as count() or normalize-space() are evaluated too, not just node sets, and an invalid expression is reported with the message the XPath engine actually produced rather than a blank result. Evaluation uses the browser's own XPath engine on a document that is parsed but never attached to the page, so the markup is left exactly as you pasted it and nothing is uploaded. That matters when the page you are writing a scraper or a Selenium locator against is behind a login and its HTML is not something you want to paste into someone else's server.",
  category: "developer",
  keywords: [
    "xpath tester",
    "test xpath expression online",
    "xpath evaluator",
    "xpath for web scraping",
    "selenium locator tester",
  ],
  tags: ["xpath", "xml", "html", "scraping", "selector", "testing"],
  icon: Route,
  features: [
    "Evaluates XPath 1.0 against pasted HTML or XML",
    "Lists every matched node with its type and value",
    "Handles string, number, and boolean expressions, not only node sets",
    "Reports XPath syntax errors and malformed XML separately",
    "Copy the matched values or the whole result list",
  ],
  faqs: [
    {
      question: "Which version of XPath does this support?",
      answer:
        "XPath 1.0, which is what browsers implement natively through document.evaluate. XPath 2.0 and 3.1 functions are not available in any browser, so an expression that relies on them will report a syntax error here.",
    },
    {
      question: "Is my markup sent anywhere?",
      answer:
        "No. The document is parsed and evaluated by your own browser, and the parsed copy is never attached to the page, so nothing in it can run or load. The markup never leaves your machine.",
    },
    {
      question:
        "Why does an expression that works in Chrome DevTools return nothing here?",
      answer:
        "DevTools evaluates against the live DOM after scripts have run. This tool evaluates against the markup you paste, so anything a page adds at runtime will not be present unless you copy the rendered HTML rather than the served source.",
    },
    {
      question: "Can I test an expression that returns a count instead of nodes?",
      answer:
        "Yes. Expressions such as count(//a) or string-length(//title) return a number, and the result is shown as a single value with its result type labelled.",
    },
  ],
  isNew: true,
}

export default meta
