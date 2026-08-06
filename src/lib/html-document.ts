/**
 * Parses pasted markup into an inert document for the selector-testing and
 * link-extraction tools.
 *
 * These tools deliberately do not sanitize first, unlike the Markdown and
 * table converters. Their whole purpose is to report what a selector matches
 * in the markup someone actually pasted, and DOMPurify would strip the very
 * elements and attributes a selector is often written against (a script tag,
 * an inline handler, a data attribute), turning a correct answer into a
 * wrong one. A document produced by DOMParser has no browsing context, so
 * nothing inside it executes or fetches, and every consumer renders matches
 * as React text rather than as markup. See decisions.md ADR-033.
 */

const parser = new DOMParser()

export function parseHtml(markup: string): Document {
  return parser.parseFromString(markup, "text/html")
}

export interface ParsedXml {
  document: Document | null
  error: string | null
}

/**
 * DOMParser reports XML syntax errors by returning a document whose root is
 * a parsererror element rather than by throwing, so the caller has to look
 * for it explicitly.
 */
export function parseXml(markup: string): ParsedXml {
  const document = parser.parseFromString(markup, "application/xml")
  const failure = document.querySelector("parsererror")
  if (failure) {
    const detail = (failure.textContent ?? "").replace(/\s+/g, " ").trim()
    return { document: null, error: detail || "The XML could not be parsed." }
  }
  return { document, error: null }
}

/** Serialises a matched node to a single-line string for display in results. */
export function nodeMarkup(node: Node): string {
  const markup =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element).outerHTML
      : (node.nodeValue ?? node.textContent ?? "")
  return markup.replace(/\s+/g, " ").trim()
}
