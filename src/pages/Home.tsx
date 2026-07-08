import { Link } from "react-router"
import { ArrowRight, MonitorSmartphone, Zap, EyeOff } from "lucide-react"
import { Seo } from "@/components/seo/Seo"
import { ToolCard } from "@/components/tool/ToolCard"
import { categories } from "@/lib/categories"
import { tools, getToolsByCategory } from "@/lib/tool-registry"
import { site } from "@/lib/site"

const highlights = [
  {
    icon: MonitorSmartphone,
    title: "Runs entirely on-device",
    description: "No files or data ever leave your browser.",
  },
  {
    icon: EyeOff,
    title: "Zero tracking",
    description: "No accounts, no analytics on your inputs, no ads.",
  },
  {
    icon: Zap,
    title: "Instant results",
    description: "No server round-trips means everything is fast.",
  },
]

export default function Home() {
  const newTools = tools.filter((t) => t.meta.isNew).slice(0, 6)
  const featured = (newTools.length ? newTools : tools).slice(0, 6)

  return (
    <>
      <Seo title={site.name} description={site.description} path="/" />

      <section className="border-border/60 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            {site.tagline}
            <br />
            Everything runs locally.
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl sm:text-lg">
            {site.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="border-border/60 bg-background hover:border-border hover:bg-muted rounded-full border px-4 py-2 text-sm transition-colors"
              >
                {category.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="highlights-heading"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6"
      >
        <h2 id="highlights-heading" className="sr-only">
          Why {site.name}
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                <item.icon className="size-5" aria-hidden />
              </div>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-muted-foreground mt-0.5 text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {newTools.length ? "New tools" : "Popular tools"}
            </h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <ToolCard key={t.meta.slug} meta={t.meta} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-xl font-semibold">Browse by category</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const count = getToolsByCategory(category.slug).length
            return (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="group border-border/60 bg-card hover:border-border flex flex-col gap-3 rounded-xl border p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                    <category.icon className="size-5" aria-hidden />
                  </div>
                  <ArrowRight className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div>
                  <h3 className="font-medium">{category.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {category.description}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs">
                  {count} {count === 1 ? "tool" : "tools"}
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
