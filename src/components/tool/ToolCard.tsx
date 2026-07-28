import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import type { ToolSummary } from "@/types/tool"

export function ToolCard({ tool }: { tool: ToolSummary }) {
  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group border-border/60 bg-card hover:border-border flex flex-col gap-3 rounded-xl border p-5 transition-all hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
          <tool.icon className="size-5" aria-hidden />
        </div>
        {tool.isNew && (
          <Badge variant="secondary" className="text-[10px]">
            New
          </Badge>
        )}
      </div>
      <div>
        <h3 className="group-hover:text-primary font-medium transition-colors">
          {tool.title}
        </h3>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
          {tool.description}
        </p>
      </div>
    </Link>
  )
}
