import { describe, expect, it } from "vitest"
import { tools } from "@/lib/tool-registry"
import { categoryMap } from "@/lib/categories"
import type { ToolMeta } from "@/types/tool"

// The registry deliberately never loads full metas eagerly (ARCHITECTURE.md
// section 3). Invariants that span the prose fields still need every meta at
// once, so the test suite - which is never shipped to a browser - globs them
// eagerly here.
const metas = Object.values(
  import.meta.glob<{ default: ToolMeta }>("/src/tools/*/meta.ts", { eager: true }),
).map((mod) => mod.default)

describe("tool registry", () => {
  it("discovers at least one tool", () => {
    expect(tools.length).toBeGreaterThan(0)
  })

  it("indexes every tool folder on disk", () => {
    expect(tools.length).toBe(metas.length)
    expect(new Set(tools.map((t) => t.slug))).toEqual(new Set(metas.map((m) => m.slug)))
  })

  it("has a unique slug per tool", () => {
    const slugs = tools.map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("has a unique description per tool (SEO requirement)", () => {
    const descriptions = tools.map((t) => t.description)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  it("assigns every tool to a category that exists in categories.ts", () => {
    for (const tool of tools) {
      expect(
        categoryMap[tool.category],
        `"${tool.slug}" references unknown category "${tool.category}"`,
      ).toBeDefined()
    }
  })

  it("gives every tool at least one keyword, tag, and feature", () => {
    for (const tool of tools) {
      expect(tool.keywords.length, `"${tool.slug}" has no keywords`).toBeGreaterThan(0)
      expect(tool.tags.length, `"${tool.slug}" has no tags`).toBeGreaterThan(0)
    }
    for (const meta of metas) {
      expect(meta.features.length, `"${meta.slug}" has no features`).toBeGreaterThan(0)
    }
  })

  it("keeps the generated summary in sync with each tool's meta.ts", () => {
    const bySlug = new Map(tools.map((tool) => [tool.slug, tool]))
    for (const meta of metas) {
      const summary = bySlug.get(meta.slug)
      expect(summary, `"${meta.slug}" is missing from the generated index`).toBeDefined()
      expect(summary?.title).toBe(meta.title)
      expect(summary?.description).toBe(meta.description)
      expect(summary?.category).toBe(meta.category)
      expect(summary?.keywords).toEqual(meta.keywords)
      expect(summary?.tags).toEqual(meta.tags)
      expect(summary?.icon).toBe(meta.icon)
      expect(Boolean(summary?.isNew)).toBe(Boolean(meta.isNew))
    }
  })

  it("resolves relatedTools overrides to real, existing slugs", () => {
    const allSlugs = new Set(tools.map((t) => t.slug))
    for (const meta of metas) {
      for (const relatedSlug of meta.relatedTools ?? []) {
        expect(
          allSlugs.has(relatedSlug),
          `"${meta.slug}" lists unknown relatedTools slug "${relatedSlug}"`,
        ).toBe(true)
      }
    }
  })
})
