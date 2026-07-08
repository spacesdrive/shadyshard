import { useMemo } from "react"
import Fuse from "fuse.js"
import { tools } from "@/lib/tool-registry"
import type { ToolDefinition } from "@/types/tool"

const options: ConstructorParameters<typeof Fuse<ToolDefinition>>[1] = {
  keys: [
    { name: "meta.title", weight: 3 },
    { name: "meta.description", weight: 1 },
    { name: "meta.keywords", weight: 2 },
    { name: "meta.tags", weight: 2 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
}

let sharedFuse: Fuse<ToolDefinition> | null = null

function getFuse(): Fuse<ToolDefinition> {
  if (!sharedFuse) sharedFuse = new Fuse(tools, options)
  return sharedFuse
}

export function useSearchIndex(query: string): ToolDefinition[] {
  return useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return tools.slice(0, 8)
    return getFuse()
      .search(trimmed)
      .map((r) => r.item)
      .slice(0, 20)
  }, [query])
}
