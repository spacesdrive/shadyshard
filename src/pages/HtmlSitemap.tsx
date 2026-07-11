import { Link } from "react-router"
import { Seo } from "@/components/seo/Seo"
import { categories } from "@/lib/categories"
import { getToolsByCategory } from "@/lib/tool-registry"
import { site } from "@/lib/site"

export default function HtmlSitemap() {
  return (
    <>
      <Seo
        title="Sitemap"
        description={`Every category and tool on ${site.name}, listed as plain links.`}
        path="/sitemap"
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold">Sitemap</h1>
        <p className="text-muted-foreground mt-2">
          Every category and tool on {site.name}, in one place.
        </p>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-lg font-medium">Pages</h2>
            <ul className="text-muted-foreground mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </section>

          {categories.map((category) => {
            const tools = getToolsByCategory(category.slug)
            return (
              <section key={category.slug}>
                <h2 className="text-lg font-medium">
                  <Link
                    to={`/category/${category.slug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {category.title}
                  </Link>
                </h2>
                <ul className="text-muted-foreground mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <li key={tool.meta.slug}>
                      <Link
                        to={`/tools/${tool.meta.slug}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {tool.meta.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </>
  )
}
