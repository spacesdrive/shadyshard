import { Navigate, useParams } from "react-router"
import { Seo } from "@/components/seo/Seo"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { ToolCard } from "@/components/tool/ToolCard"
import { getCategory } from "@/lib/categories"
import { getToolsByCategory } from "@/lib/tool-registry"
import { breadcrumbSchema, categoryCollectionSchema } from "@/lib/seo"

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const category = slug ? getCategory(slug) : undefined

  if (!category) return <Navigate to="/404" replace />

  const tools = getToolsByCategory(category.slug)
  const jsonLd = [
    categoryCollectionSchema(
      category,
      tools.map((t) => t.meta.title),
    ),
    breadcrumbSchema([{ name: category.title, path: `/category/${category.slug}` }]),
  ]

  return (
    <>
      <Seo
        title={category.title}
        description={category.description}
        path={`/category/${category.slug}`}
        jsonLd={jsonLd}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[{ name: category.title, path: `/category/${category.slug}` }]}
        />

        <div className="mt-4 flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
            <category.icon className="size-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">{category.title}</h1>
            <p className="text-muted-foreground mt-1">{category.description}</p>
          </div>
        </div>

        {tools.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <ToolCard key={t.meta.slug} meta={t.meta} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mt-8 text-sm">
            Tools in this category are coming soon.
          </p>
        )}
      </div>
    </>
  )
}
