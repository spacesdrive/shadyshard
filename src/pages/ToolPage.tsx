import { Navigate, useLoaderData, useParams } from "react-router"
import { Seo } from "@/components/seo/Seo"
import { ToolPageLayout } from "@/components/tool/ToolPageLayout"
import { getCategory } from "@/lib/categories"
import { getTool } from "@/lib/tool-registry"
import { breadcrumbSchema, faqSchema, toolWebApplicationSchema } from "@/lib/seo"
import type { ToolDetail } from "@/types/tool"

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>()
  const detail = useLoaderData<ToolDetail | null>()
  const tool = slug ? getTool(slug) : undefined

  if (!tool || !detail) return <Navigate to="/404" replace />

  const category = getCategory(tool.category)

  const jsonLd = [
    toolWebApplicationSchema(tool, detail.features),
    breadcrumbSchema([
      ...(category ? [{ name: category.title, path: `/category/${category.slug}` }] : []),
      { name: tool.title, path: `/tools/${tool.slug}` },
    ]),
    faqSchema(detail.faqs),
  ].filter((schema): schema is object => Boolean(schema))

  return (
    <>
      <Seo
        title={tool.title}
        description={tool.description}
        path={`/tools/${tool.slug}`}
        jsonLd={jsonLd}
      />
      <ToolPageLayout tool={tool} detail={detail} />
    </>
  )
}
