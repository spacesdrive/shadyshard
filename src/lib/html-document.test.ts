import { describe, it, expect } from "vitest"
import { parseHtml, parseXml, nodeMarkup } from "./html-document"

describe("parseHtml", () => {
  it("keeps elements a sanitizer would remove, so selectors can be tested against them", () => {
    const document = parseHtml('<div><script src="a.js"></script></div>')
    expect(document.querySelectorAll("script[src]")).toHaveLength(1)
  })

  it("wraps a bare fragment in a document with a body", () => {
    const document = parseHtml("<p>hello</p>")
    expect(document.body.textContent).toBe("hello")
  })
})

describe("parseXml", () => {
  it("returns a document for well-formed XML", () => {
    const { document, error } = parseXml("<root><item>one</item></root>")
    expect(error).toBeNull()
    expect(document?.querySelector("item")?.textContent).toBe("one")
  })

  it("reports an error for malformed XML instead of throwing", () => {
    const { document, error } = parseXml("<root><item></root>")
    expect(document).toBeNull()
    expect(error).toBeTruthy()
  })
})

describe("nodeMarkup", () => {
  it("collapses whitespace in an element's markup", () => {
    const document = parseHtml("<ul>\n  <li>one</li>\n</ul>")
    const list = document.querySelector("ul")
    expect(nodeMarkup(list as Element)).toBe("<ul> <li>one</li> </ul>")
  })

  it("returns the value of a non-element node", () => {
    const document = parseHtml('<a href="/docs">link</a>')
    const attribute = document.querySelector("a")?.getAttributeNode("href")
    expect(nodeMarkup(attribute as Attr)).toBe("/docs")
  })
})
