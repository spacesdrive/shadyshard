import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { categories } from "../src/lib/categories"
import { site } from "../src/lib/site"
import type { ToolMeta } from "../src/types/tool"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const toolsDir = path.join(root, "src/tools")
const publicDir = path.join(root, "public")

async function loadToolMetas(): Promise<ToolMeta[]> {
  const slugs = fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  const metas: ToolMeta[] = []
  for (const slug of slugs) {
    const metaPath = path.join(toolsDir, slug, "meta.ts")
    if (!fs.existsSync(metaPath)) continue
    const mod = await import(`file://${metaPath.replace(/\\/g, "/")}`)
    metas.push(mod.default as ToolMeta)
  }
  return metas
}

function urlEntry(loc: string, priority: string, changefreq: string) {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

async function main() {
  const tools = await loadToolMetas()

  const staticEntries = [
    urlEntry(site.url, "1.0", "weekly"),
    urlEntry(`${site.url}/about`, "0.5", "monthly"),
    urlEntry(`${site.url}/privacy`, "0.3", "yearly"),
    urlEntry(`${site.url}/terms`, "0.3", "yearly"),
  ]

  const categoryEntries = categories.map((c) =>
    urlEntry(`${site.url}/category/${c.slug}`, "0.7", "weekly"),
  )

  const toolEntries = tools.map((t) =>
    urlEntry(`${site.url}/tools/${t.slug}`, "0.8", "weekly"),
  )

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...staticEntries,
    ...categoryEntries,
    ...toolEntries,
  ].join("\n")}\n</urlset>\n`

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap)

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`
  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots)

  console.log(
    `Generated sitemap.xml (${tools.length} tools, ${categories.length} categories) and robots.txt`,
  )
}

main()
