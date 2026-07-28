import { createBrowserRouter, type LoaderFunctionArgs } from "react-router"
import type { ComponentType } from "react"
import { RootLayout } from "@/components/layout/RootLayout"
import { PageLoader } from "@/components/layout/PageLoader"
import { loadToolDetail } from "@/lib/tool-registry"
import type { ToolDetail } from "@/types/tool"

/** Route pages export a default component; lazy() needs a named `Component`. */
function page(loader: () => Promise<{ default: ComponentType }>) {
  return async () => {
    const { default: Component } = await loader()
    return { Component }
  }
}

/**
 * A tool's prose lives outside the eager bundle (ARCHITECTURE.md section 3),
 * so it has to be fetched before the page can render in one piece. Loading it
 * here rather than from an effect inside ToolPage is what keeps that off the
 * critical rendering path: React Router runs a statically-declared loader
 * concurrently with the route's own lazy module, so the tool page still
 * paints in a single frame with no layout shift. Doing this in an effect
 * instead cost 0.22 of CLS, because the description, features, FAQ, and
 * related tools all arrived after first paint.
 */
async function toolDetailLoader({
  params,
}: LoaderFunctionArgs): Promise<ToolDetail | null> {
  if (!params.slug) return null
  return (await loadToolDetail(params.slug)) ?? null
}

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    HydrateFallback: PageLoader,
    children: [
      {
        index: true,
        lazy: page(() => import("@/pages/Home")),
      },
      {
        path: "tools/:slug",
        lazy: page(() => import("@/pages/ToolPage")),
        loader: toolDetailLoader,
      },
      {
        path: "category/:slug",
        lazy: page(() => import("@/pages/CategoryPage")),
      },
      {
        path: "about",
        lazy: page(() => import("@/pages/About")),
      },
      {
        path: "privacy",
        lazy: page(() => import("@/pages/Privacy")),
      },
      {
        path: "terms",
        lazy: page(() => import("@/pages/Terms")),
      },
      {
        path: "sitemap",
        lazy: page(() => import("@/pages/HtmlSitemap")),
      },
      {
        path: "*",
        lazy: page(() => import("@/pages/NotFound")),
      },
    ],
  },
])
