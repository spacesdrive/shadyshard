/**
 * XML <-> plain-object conversion using the browser's native DOMParser and
 * XMLSerializer -- no dependency needed, since both directions are just DOM
 * traversal. Shared by the XML to JSON / JSON to XML tools.
 *
 * Convention: an element with attributes gets an "@attributes" key; an
 * element with only text content becomes that string directly; an element
 * with child elements becomes an object keyed by tag name, with repeated
 * tag names collapsed into an array.
 */

export type XmlJsonValue =
  string | { "@attributes"?: Record<string, string>; [childTag: string]: unknown }

function elementToJson(element: Element): XmlJsonValue {
  const attributes: Record<string, string> = {}
  for (const attr of Array.from(element.attributes)) {
    attributes[attr.name] = attr.value
  }

  const childElements = Array.from(element.children)
  const hasAttributes = Object.keys(attributes).length > 0

  if (childElements.length === 0) {
    const text = element.textContent ?? ""
    if (!hasAttributes) return text
    return { "@attributes": attributes, "#text": text }
  }

  const result: Record<string, unknown> = hasAttributes
    ? { "@attributes": attributes }
    : {}
  for (const child of childElements) {
    const value = elementToJson(child)
    if (child.tagName in result) {
      const existing = result[child.tagName]
      result[child.tagName] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value]
    } else {
      result[child.tagName] = value
    }
  }
  return result
}

export function xmlToJson(xml: string): { rootTag: string; data: XmlJsonValue } {
  const doc = new DOMParser().parseFromString(xml, "application/xml")
  const parseError = doc.querySelector("parsererror")
  if (parseError) throw new Error("This is not valid XML.")
  const root = doc.documentElement
  return { rootTag: root.tagName, data: elementToJson(root) }
}

function appendValue(doc: XMLDocument, parent: Element, tagName: string, value: unknown) {
  if (Array.isArray(value)) {
    for (const item of value) appendValue(doc, parent, tagName, item)
    return
  }

  const element = doc.createElement(tagName)

  if (value === null || value === undefined) {
    parent.appendChild(element)
    return
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    for (const [key, entryValue] of Object.entries(obj)) {
      if (
        key === "@attributes" &&
        typeof entryValue === "object" &&
        entryValue !== null
      ) {
        for (const [attrName, attrValue] of Object.entries(
          entryValue as Record<string, unknown>,
        )) {
          element.setAttribute(attrName, String(attrValue))
        }
      } else if (key === "#text") {
        element.textContent = String(entryValue)
      } else {
        appendValue(doc, element, key, entryValue)
      }
    }
  } else {
    element.textContent = String(value)
  }

  parent.appendChild(element)
}

export function jsonToXml(rootTag: string, data: unknown): string {
  const doc = document.implementation.createDocument(null, null, null)
  const fragment = doc.createElement("__root__")
  appendValue(doc, fragment, rootTag, data)
  const root = fragment.firstElementChild
  if (!root) throw new Error("Could not build an XML document from this JSON.")
  return new XMLSerializer().serializeToString(root)
}
