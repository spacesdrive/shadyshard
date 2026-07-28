import { Suspense } from "react"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { ToolFaqSection } from "@/components/tool/ToolFaq"
import { RelatedTools } from "@/components/tool/RelatedTools"
import { Skeleton } from "@/components/ui/skeleton"
import { getCategory } from "@/lib/categories"
import { getRelatedTools, getToolComponent } from "@/lib/tool-registry"
import type { ToolDetail, ToolSummary } from "@/types/tool"

export function ToolPageLayout({
  tool,
  detail,
}: {
  tool: ToolSummary
  detail: ToolDetail
}) {
  const category = getCategory(tool.category)
  const Component = getToolComponent(tool.slug)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          ...(category
            ? [{ name: category.title, path: `/category/${category.slug}` }]
            : []),
          { name: tool.title, path: `/tools/${tool.slug}` },
        ]}
      />

      <div className="mt-4 flex items-start gap-4">
        <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
          <tool.icon className="size-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{tool.title}</h1>
          <p className="text-muted-foreground mt-1">{tool.description}</p>
        </div>
      </div>

      <div className="border-border/60 bg-card mt-6 rounded-xl border p-4 sm:p-6">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          {Component && <Component />}
        </Suspense>
      </div>

      {detail.longDescription && (
        <div className="text-muted-foreground mt-8 text-sm leading-relaxed">
          <p>{detail.longDescription}</p>
        </div>
      )}

      {detail.features.length > 0 && (
        <section aria-labelledby="features-heading" className="mt-10">
          <h2 id="features-heading" className="text-xl font-semibold">
            Features
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {detail.features.map((feature) => (
              <li
                key={feature}
                className="text-muted-foreground flex items-start gap-2 text-sm"
              >
                <span
                  className="bg-primary mt-2 size-1.5 shrink-0 rounded-full"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ToolFaqSection faqs={detail.faqs} />
      <RelatedTools tools={getRelatedTools(tool, detail.relatedTools)} />
    </div>
  )
}
