import { Navigate, useParams } from "react-router"
import { Seo } from "@/components/seo/Seo"
import { ToolPageLayout } from "@/components/tool/ToolPageLayout"
import { getCategory } from "@/lib/categories"
import { getTool } from "@/lib/tool-registry"
import { breadcrumbSchema, faqSchema, toolWebApplicationSchema } from "@/lib/seo"

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>()
  const definition = slug ? getTool(slug) : undefined

  if (!definition) return <Navigate to="/404" replace />

  const { meta, Component } = definition
  const category = getCategory(meta.category)

  const jsonLd = [
    toolWebApplicationSchema(meta),
    breadcrumbSchema([
      ...(category ? [{ name: category.title, path: `/category/${category.slug}` }] : []),
      { name: meta.title, path: `/tools/${meta.slug}` },
    ]),
    faqSchema(meta),
  ].filter((s): s is object => Boolean(s))

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={`/tools/${meta.slug}`}
        jsonLd={jsonLd}
      />
      <ToolPageLayout definition={definition}>
        <Component />
      </ToolPageLayout>
    </>
  )
}
