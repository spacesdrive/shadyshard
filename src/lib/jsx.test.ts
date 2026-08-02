import { describe, expect, it } from "vitest"
import {
  isInlineEventHandler,
  jsxAttributeName,
  nodeToJsx,
  styleStringToJsxObject,
} from "./jsx"

function convertHtml(html: string, options = {}): string {
  const document = new DOMParser().parseFromString(html, "text/html")
  return nodeToJsx(document.body.firstElementChild as Element, {
    indentUnit: "  ",
    ...options,
  })
}

describe("jsxAttributeName", () => {
  it("renames the irregular HTML attributes", () => {
    expect(jsxAttributeName("class")).toBe("className")
    expect(jsxAttributeName("for")).toBe("htmlFor")
    expect(jsxAttributeName("tabindex")).toBe("tabIndex")
  })

  it("camelCases hyphenated and namespaced names", () => {
    expect(jsxAttributeName("stroke-width")).toBe("strokeWidth")
    expect(jsxAttributeName("clip-path")).toBe("clipPath")
    expect(jsxAttributeName("xlink:href")).toBe("xlinkHref")
  })

  it("leaves data and aria attributes hyphenated", () => {
    expect(jsxAttributeName("data-test-id")).toBe("data-test-id")
    expect(jsxAttributeName("aria-label")).toBe("aria-label")
  })
})

describe("styleStringToJsxObject", () => {
  it("camelCases properties and quotes values", () => {
    expect(styleStringToJsxObject("color: red; font-size: 12px")).toBe(
      '{ color: "red", fontSize: "12px" }',
    )
  })

  it("keeps a custom property as a quoted key", () => {
    expect(styleStringToJsxObject("--brand: #fff")).toBe('{ "--brand": "#fff" }')
  })

  it("returns null when there is nothing usable", () => {
    expect(styleStringToJsxObject("  ; ;")).toBeNull()
  })
})

describe("nodeToJsx", () => {
  it("self-closes void elements and renames attributes", () => {
    expect(convertHtml('<img src="/a.png" alt="A">')).toBe('<img src="/a.png" alt="A" />')
  })

  it("writes boolean attributes without a value", () => {
    expect(convertHtml('<input type="text" required disabled>')).toBe(
      '<input type="text" required disabled />',
    )
  })

  it("nests and indents children", () => {
    expect(convertHtml('<div class="a"><span>Hi</span></div>')).toBe(
      '<div className="a">\n  <span>\n    Hi\n  </span>\n</div>',
    )
  })

  it("escapes text containing braces", () => {
    expect(convertHtml("<p>a {b} c</p>")).toBe('<p>\n  {"a {b} c"}\n</p>')
  })

  it("drops inline event handlers", () => {
    expect(convertHtml('<button onclick="go()">Go</button>')).toBe(
      "<button>\n  Go\n</button>",
    )
  })

  it("swaps colors for currentColor but leaves none alone", () => {
    const svg = new DOMParser().parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#111"><path d="M0 0"/></svg>',
      "image/svg+xml",
    )
    const output = nodeToJsx(
      svg.documentElement,
      { indentUnit: "  ", useCurrentColor: true, spreadPropsOnRoot: true },
      0,
      true,
    )
    expect(output).toContain('fill="none"')
    expect(output).toContain('stroke="currentColor"')
    expect(output).toContain("{...props}")
  })
})

describe("isInlineEventHandler", () => {
  it("matches only handler attributes", () => {
    expect(isInlineEventHandler("onclick")).toBe(true)
    expect(isInlineEventHandler("onmouseover")).toBe(true)
    expect(isInlineEventHandler("only")).toBe(false)
    expect(isInlineEventHandler("on-click")).toBe(false)
  })
})
