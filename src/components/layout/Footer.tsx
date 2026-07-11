import { Link } from "react-router"
import { categories } from "@/lib/categories"
import { site } from "@/lib/site"

export function Footer() {
  return (
    <footer className="border-border/60 bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span>{site.name}</span>
            </Link>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm">
              {site.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Categories</h3>
            <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
              {categories.slice(0, 6).map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
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
              <li>
                <Link to="/sitemap" className="hover:text-foreground transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium">Why {site.name}</h3>
            <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
              <li>Everything runs locally</li>
              <li>No uploads, ever</li>
              <li>No accounts required</li>
              <li>No tracking</li>
            </ul>
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground mt-10 border-t pt-6 text-center text-xs">
          © {new Date().getFullYear()} {site.name}. {site.tagline}
        </div>
      </div>
    </footer>
  )
}
