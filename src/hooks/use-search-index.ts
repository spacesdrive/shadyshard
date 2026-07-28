import { useMemo } from "react"
import Fuse from "fuse.js"
import { tools } from "@/lib/tool-registry"
import type { ToolSummary } from "@/types/tool"

const options: ConstructorParameters<typeof Fuse<ToolSummary>>[1] = {
  keys: [
    { name: "title", weight: 3 },
    { name: "description", weight: 1 },
    { name: "keywords", weight: 2 },
    { name: "tags", weight: 2 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
}

let sharedFuse: Fuse<ToolSummary> | null = null

function getFuse(): Fuse<ToolSummary> {
  if (!sharedFuse) sharedFuse = new Fuse(tools, options)
  return sharedFuse
}

export function useSearchIndex(query: string): ToolSummary[] {
  return useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return tools.slice(0, 8)
    return getFuse()
      .search(trimmed)
      .map((r) => r.item)
      .slice(0, 20)
  }, [query])
}
