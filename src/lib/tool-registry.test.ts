import { describe, expect, it } from "vitest"
import { tools } from "@/lib/tool-registry"
import { categoryMap } from "@/lib/categories"

describe("tool registry", () => {
  it("discovers at least one tool", () => {
    expect(tools.length).toBeGreaterThan(0)
  })

  it("has a unique slug per tool", () => {
    const slugs = tools.map((t) => t.meta.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("has a unique description per tool (SEO requirement)", () => {
    const descriptions = tools.map((t) => t.meta.description)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  it("assigns every tool to a category that exists in categories.ts", () => {
    for (const { meta } of tools) {
      expect(
        categoryMap[meta.category],
        `"${meta.slug}" references unknown category "${meta.category}"`,
      ).toBeDefined()
    }
  })

  it("gives every tool at least one keyword, tag, and feature", () => {
    for (const { meta } of tools) {
      expect(meta.keywords.length, `"${meta.slug}" has no keywords`).toBeGreaterThan(0)
      expect(meta.tags.length, `"${meta.slug}" has no tags`).toBeGreaterThan(0)
      expect(meta.features.length, `"${meta.slug}" has no features`).toBeGreaterThan(0)
    }
  })

  it("resolves relatedTools overrides to real, existing slugs", () => {
    const allSlugs = new Set(tools.map((t) => t.meta.slug))
    for (const { meta } of tools) {
      for (const relatedSlug of meta.relatedTools ?? []) {
        expect(
          allSlugs.has(relatedSlug),
          `"${meta.slug}" lists unknown relatedTools slug "${relatedSlug}"`,
        ).toBe(true)
      }
    }
  })
})
