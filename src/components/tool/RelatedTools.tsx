import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import type { ToolDefinition } from "@/types/tool"

export function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (!tools.length) return null

  return (
    <section aria-labelledby="related-heading" className="mt-12">
      <h2 id="related-heading" className="text-xl font-semibold">
        Related tools
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {tools.map(({ meta }) => (
          <Link
            key={meta.slug}
            to={`/tools/${meta.slug}`}
            className="group border-border/60 hover:border-border hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
          >
            <meta.icon className="text-primary size-5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{meta.title}</p>
              <p className="text-muted-foreground truncate text-xs">{meta.description}</p>
            </div>
            <ArrowRight className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  )
}
