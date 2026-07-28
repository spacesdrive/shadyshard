import { lazy } from "react"
import { toolIndex } from "@/lib/tool-index.generated"
import type { ToolComponent, ToolDetail, ToolMeta, ToolSummary } from "@/types/tool"

/**
 * Every tool lives at src/tools/<slug>/{meta.ts,index.tsx}. Adding a new tool
 * requires zero changes here, in routing, nav, sitemap, or search - these
 * globs discover it automatically at build time.
 *
 * Both globs are lazy. The summary fields navigation and search need
 * synchronously come from tool-index.generated.ts instead, so a tool's prose
 * only downloads when someone opens that tool. See ARCHITECTURE.md section 3.
 */
const metaLoaders = import.meta.glob<{ default: ToolMeta }>("/src/tools/*/meta.ts")

const componentLoaders = import.meta.glob<{ default: React.ComponentType }>(
  "/src/tools/*/index.tsx",
)

function slugFromPath(path: string): string {
  const match = path.match(/\/src\/tools\/([^/]+)\/(meta\.ts|index\.tsx)$/)
  if (!match) throw new Error(`Unexpected tool module path: ${path}`)
  return match[1]
}

const discoveredSlugs = new Set(Object.keys(metaLoaders).map(slugFromPath))

for (const slug of discoveredSlugs) {
  if (!componentLoaders[`/src/tools/${slug}/index.tsx`]) {
    throw new Error(`Tool "${slug}" has meta.ts but no index.tsx component`)
  }
}

const indexedSlugs = new Set(toolIndex.map((tool) => tool.slug))
const missing = [...discoveredSlugs].filter((slug) => !indexedSlugs.has(slug))
const stale = [...indexedSlugs].filter((slug) => !discoveredSlugs.has(slug))
if (missing.length > 0 || stale.length > 0) {
  throw new Error(
    `tool-index.generated.ts is out of date (missing: [${missing.join(", ")}], ` +
      `no longer on disk: [${stale.join(", ")}]). Run \`npm run generate:tool-index\`.`,
  )
}

export const tools: ToolSummary[] = [...toolIndex].sort((a, b) =>
  a.title.localeCompare(b.title),
)

export const toolBySlug: Record<string, ToolSummary> = Object.fromEntries(
  tools.map((tool) => [tool.slug, tool]),
)

export function getTool(slug: string): ToolSummary | undefined {
  return toolBySlug[slug]
}

export function getToolsByCategory(categorySlug: string): ToolSummary[] {
  return tools.filter((tool) => tool.category === categorySlug)
}

const components = new Map<string, ToolComponent>()

export function getToolComponent(slug: string): ToolComponent | undefined {
  const loader = componentLoaders[`/src/tools/${slug}/index.tsx`]
  if (!loader) return undefined
  let component = components.get(slug)
  if (!component) {
    component = lazy(loader as () => Promise<{ default: React.ComponentType }>)
    components.set(slug, component)
  }
  return component
}

const details = new Map<string, Promise<ToolDetail>>()

export function loadToolDetail(slug: string): Promise<ToolDetail> | undefined {
  const loader = metaLoaders[`/src/tools/${slug}/meta.ts`]
  if (!loader) return undefined
  let detail = details.get(slug)
  if (!detail) {
    detail = loader().then(({ default: meta }) => ({
      longDescription: meta.longDescription,
      features: meta.features,
      faqs: meta.faqs,
      relatedTools: meta.relatedTools,
    }))
    details.set(slug, detail)
  }
  return detail
}

export function getRelatedTools(
  tool: ToolSummary,
  explicitSlugs?: string[],
  limit = 4,
): ToolSummary[] {
  if (explicitSlugs?.length) {
    return explicitSlugs
      .map((slug) => toolBySlug[slug])
      .filter((related): related is ToolSummary => Boolean(related))
      .slice(0, limit)
  }

  const scored = tools
    .filter((candidate) => candidate.slug !== tool.slug)
    .map((candidate) => {
      let score = 0
      if (candidate.category === tool.category) score += 3
      const sharedTags = candidate.tags.filter((tag) => tool.tags.includes(tag))
      score += sharedTags.length
      return { tool: candidate, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((entry) => entry.tool)
}
