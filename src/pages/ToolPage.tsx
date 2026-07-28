import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router"
import { Seo } from "@/components/seo/Seo"
import { ToolPageLayout } from "@/components/tool/ToolPageLayout"
import { getCategory } from "@/lib/categories"
import { getTool, loadToolDetail } from "@/lib/tool-registry"
import { breadcrumbSchema, faqSchema, toolWebApplicationSchema } from "@/lib/seo"
import type { ToolDetail } from "@/types/tool"

/**
 * A tool's prose lives outside the eager bundle, so it arrives a moment
 * after the page shell. The breadcrumbs, header, and the tool itself render
 * from the eagerly-available summary in the meantime.
 */
function useToolDetail(slug: string | undefined): ToolDetail | undefined {
  const [detail, setDetail] = useState<ToolDetail>()

  useEffect(() => {
    if (!slug) return
    setDetail(undefined)
    let cancelled = false
    loadToolDetail(slug)?.then((loaded) => {
      if (!cancelled) setDetail(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  return detail
}

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>()
  const tool = slug ? getTool(slug) : undefined
  const detail = useToolDetail(tool?.slug)

  if (!tool) return <Navigate to="/404" replace />

  const category = getCategory(tool.category)

  const jsonLd = [
    breadcrumbSchema([
      ...(category ? [{ name: category.title, path: `/category/${category.slug}` }] : []),
      { name: tool.title, path: `/tools/${tool.slug}` },
    ]),
    ...(detail
      ? [toolWebApplicationSchema(tool, detail.features), faqSchema(detail.faqs)]
      : []),
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
