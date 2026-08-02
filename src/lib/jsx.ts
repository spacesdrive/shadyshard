/**
 * Shared HTML-to-JSX translation, used by the HTML to JSX Converter and the
 * SVG to React Component tools. Both walk a DOM tree produced by the native
 * DOMParser and need the same attribute renaming, style-object rewriting,
 * and text escaping rules, so that logic lives here rather than in either
 * tool.
 */

/**
 * Attributes whose JSX name is not simply the camel-cased HTML name.
 * Everything hyphenated (stroke-width, clip-path) is camel-cased by rule,
 * so only the irregular cases are listed.
 */
const RENAMED_ATTRIBUTES: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  minlength: "minLength",
  colspan: "colSpan",
  rowspan: "rowSpan",
  usemap: "useMap",
  contenteditable: "contentEditable",
  spellcheck: "spellCheck",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  autoplay: "autoPlay",
  novalidate: "noValidate",
  enctype: "encType",
  formaction: "formAction",
  formmethod: "formMethod",
  crossorigin: "crossOrigin",
  datetime: "dateTime",
  srcset: "srcSet",
  srcdoc: "srcDoc",
  frameborder: "frameBorder",
  allowfullscreen: "allowFullScreen",
  playsinline: "playsInline",
  itemprop: "itemProp",
  itemscope: "itemScope",
  itemtype: "itemType",
  accesskey: "accessKey",
  inputmode: "inputMode",
}

/** Attributes React expects as booleans rather than strings. */
const BOOLEAN_ATTRIBUTES = new Set([
  "checked",
  "disabled",
  "readOnly",
  "required",
  "autoFocus",
  "autoPlay",
  "controls",
  "loop",
  "muted",
  "multiple",
  "selected",
  "hidden",
  "noValidate",
  "allowFullScreen",
  "playsInline",
  "open",
  "default",
  "reversed",
  "async",
  "defer",
])

/** Attributes React expects as numbers rather than strings. */
const NUMERIC_ATTRIBUTES = new Set(["tabIndex", "colSpan", "rowSpan", "span"])

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
])

function camelCase(value: string): string {
  return value.replace(/[-:]([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

/**
 * Translates an HTML or SVG attribute name to the name React expects.
 * data-* and aria-* attributes keep their hyphenated form, which is the one
 * case where React deliberately does not camel-case.
 */
export function jsxAttributeName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.startsWith("data-") || lower.startsWith("aria-")) return lower
  if (RENAMED_ATTRIBUTES[lower]) return RENAMED_ATTRIBUTES[lower]
  if (lower === "xmlns") return "xmlns"
  return camelCase(name)
}

/**
 * Inline event handlers cannot survive the translation: JSX expects a
 * function, and an onclick="..." string would throw at render time. Callers
 * drop them and tell the user which ones were dropped.
 */
export function isInlineEventHandler(name: string): boolean {
  const lower = name.toLowerCase()
  /**
   * Checking the prototype rather than matching /^on/ keeps a legitimate
   * attribute that merely starts with those letters, such as "only", from
   * being dropped as if it were a handler.
   */
  return lower.startsWith("on") && lower in HTMLElement.prototype
}

function cssPropertyToJsKey(property: string): string {
  const trimmed = property.trim()
  if (trimmed.startsWith("--")) return `"${trimmed}"`
  const key = camelCase(trimmed.toLowerCase().replace(/^-(ms|moz|webkit|o)-/, "$1-"))
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : `"${key}"`
}

/**
 * Rewrites an inline style string as the object literal React needs, e.g.
 * "color: red; font-size: 12px" becomes { color: "red", fontSize: "12px" }.
 * Returns null when the declaration block has nothing usable in it.
 */
export function styleStringToJsxObject(style: string): string | null {
  const declarations = style
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const separator = declaration.indexOf(":")
      if (separator === -1) return null
      const property = declaration.slice(0, separator)
      const value = declaration.slice(separator + 1).trim()
      if (!property.trim() || !value) return null
      return `${cssPropertyToJsKey(property)}: ${JSON.stringify(value)}`
    })
    .filter((declaration): declaration is string => declaration !== null)

  if (declarations.length === 0) return null
  return `{ ${declarations.join(", ")} }`
}

/** Escapes a text node so braces and angle brackets survive JSX parsing. */
function jsxText(text: string): string {
  if (/[{}<>]/.test(text)) return `{${JSON.stringify(text)}}`
  return text
}

export interface JsxSerializeOptions {
  /** One indentation level, e.g. two spaces. */
  indentUnit: string
  /** Rewrites every fill and stroke color to currentColor. */
  useCurrentColor?: boolean
  /** Appends {...props} to the root element's attribute list. */
  spreadPropsOnRoot?: boolean
  /** Drops class/className attributes entirely. */
  stripClasses?: boolean
  /** Drops HTML comments instead of emitting them as JSX comments. */
  stripComments?: boolean
}

function serializeAttributes(
  element: Element,
  options: JsxSerializeOptions,
  isRoot: boolean,
): string[] {
  const parts: string[] = []

  for (const attribute of Array.from(element.attributes)) {
    if (isInlineEventHandler(attribute.name)) continue
    const name = jsxAttributeName(attribute.name)
    if (options.stripClasses && name === "className") continue

    if (name === "style") {
      const object = styleStringToJsxObject(attribute.value)
      if (object) parts.push(`style={${object}}`)
      continue
    }

    let value = attribute.value
    if (
      options.useCurrentColor &&
      (name === "fill" || name === "stroke") &&
      value.trim().toLowerCase() !== "none"
    ) {
      value = "currentColor"
    }

    if (BOOLEAN_ATTRIBUTES.has(name)) {
      parts.push(name)
      continue
    }

    if (NUMERIC_ATTRIBUTES.has(name) && /^-?\d+$/.test(value)) {
      parts.push(`${name}={${value}}`)
      continue
    }

    parts.push(`${name}=${JSON.stringify(value)}`)
  }

  if (isRoot && options.spreadPropsOnRoot) parts.push("{...props}")
  return parts
}

/**
 * Serializes a DOM node as JSX. `depth` controls indentation so the output
 * can be dropped straight into a component body.
 */
export function nodeToJsx(
  node: Node,
  options: JsxSerializeOptions,
  depth = 0,
  isRoot = false,
): string {
  const pad = options.indentUnit.repeat(depth)

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").replace(/\s+/g, " ").trim()
    return text ? `${pad}${jsxText(text)}` : ""
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    if (options.stripComments) return ""
    const comment = (node.textContent ?? "").trim().replace(/\*\//g, "*\\/")
    return `${pad}{/* ${comment} */}`
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return ""

  const element = node as Element
  const tag = element.tagName.includes(":")
    ? element.tagName
    : element.namespaceURI === "http://www.w3.org/2000/svg"
      ? element.tagName
      : element.tagName.toLowerCase()

  const attributes = serializeAttributes(element, options, isRoot)
  const attributeText = attributes.length ? ` ${attributes.join(" ")}` : ""

  const children = Array.from(element.childNodes)
    .map((child) => nodeToJsx(child, options, depth + 1))
    .filter(Boolean)

  if (VOID_ELEMENTS.has(tag) || children.length === 0) {
    return `${pad}<${tag}${attributeText} />`
  }

  return `${pad}<${tag}${attributeText}>\n${children.join("\n")}\n${pad}</${tag}>`
}
