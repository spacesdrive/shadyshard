import { createBrowserRouter } from "react-router"
import type { ComponentType } from "react"
import { RootLayout } from "@/components/layout/RootLayout"
import { PageLoader } from "@/components/layout/PageLoader"

/** Route pages export a default component; lazy() needs a named `Component`. */
function page(loader: () => Promise<{ default: ComponentType }>) {
  return async () => {
    const { default: Component } = await loader()
    return { Component }
  }
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
