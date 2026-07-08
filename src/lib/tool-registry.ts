import { lazy } from "react"
import type { ToolDefinition, ToolMeta } from "@/types/tool"

/**
 * Every tool lives at src/tools/<slug>/{meta.ts,index.tsx}. Adding a new tool
 * requires zero changes here, in routing, nav, sitemap, or search - this glob
 * discovers it automatically at build time.
 */
const metaModules = import.meta.glob<{ default: ToolMeta }>("/src/tools/*/meta.ts", {
  eager: true,
})

const componentLoaders = import.meta.glob<{ default: React.ComponentType }>(
  "/src/tools/*/index.tsx",
)

function slugFromPath(path: string): string {
  const match = path.match(/\/src\/tools\/([^/]+)\/(meta\.ts|index\.tsx)$/)
  if (!match) throw new Error(`Unexpected tool module path: ${path}`)
  return match[1]
}

const definitions: ToolDefinition[] = Object.entries(metaModules).map(([path, mod]) => {
  const slug = slugFromPath(path)
  const componentPath = path.replace("/meta.ts", "/index.tsx")
  const loader = componentLoaders[componentPath]
  if (!loader) {
    throw new Error(
      `Tool "${slug}" has meta.ts but no index.tsx component at ${componentPath}`,
    )
  }
  if (mod.default.slug !== slug) {
    throw new Error(
      `Tool meta slug "${mod.default.slug}" does not match folder name "${slug}"`,
    )
  }
  return {
    meta: mod.default,
    Component: lazy(loader as () => Promise<{ default: React.ComponentType }>),
  }
})

export const tools: ToolDefinition[] = definitions.sort((a, b) =>
  a.meta.title.localeCompare(b.meta.title),
)

export const toolBySlug: Record<string, ToolDefinition> = Object.fromEntries(
  tools.map((t) => [t.meta.slug, t]),
)

export function getTool(slug: string): ToolDefinition | undefined {
  return toolBySlug[slug]
}

export function getToolsByCategory(categorySlug: string): ToolDefinition[] {
  return tools.filter((t) => t.meta.category === categorySlug)
}

export function getRelatedTools(meta: ToolMeta, limit = 4): ToolDefinition[] {
  if (meta.relatedTools?.length) {
    return meta.relatedTools
      .map((slug) => toolBySlug[slug])
      .filter((t): t is ToolDefinition => Boolean(t))
      .slice(0, limit)
  }

  const scored = tools
    .filter((t) => t.meta.slug !== meta.slug)
    .map((t) => {
      let score = 0
      if (t.meta.category === meta.category) score += 3
      const sharedTags = t.meta.tags.filter((tag) => meta.tags.includes(tag))
      score += sharedTags.length
      return { tool: t, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((s) => s.tool)
}
