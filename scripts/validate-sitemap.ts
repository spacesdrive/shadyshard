/**
 * Validates the generated public/sitemap.xml and public/robots.txt against
 * the current tool/category registry, so a build never ships a sitemap
 * that's stale, malformed, or missing an entry. Run after `generate:seo`
 * (the prebuild step already regenerates both files; this only checks the
 * result).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { categories } from "../src/lib/categories"
import { site } from "../src/lib/site"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const publicDir = path.join(root, "public")

const errors: string[] = []

function readToolSlugs(): string[] {
  return fs
    .readdirSync(path.join(root, "src/tools"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function validateSitemap(toolSlugs: string[]) {
  const sitemapPath = path.join(publicDir, "sitemap.xml")
  if (!fs.existsSync(sitemapPath)) {
    errors.push("public/sitemap.xml does not exist -- run `npm run generate:seo`")
    return
  }

  const xml = fs.readFileSync(sitemapPath, "utf-8")

  if (!xml.startsWith("<?xml"))
    errors.push("sitemap.xml does not start with an XML declaration")
  if (!xml.includes("<urlset"))
    errors.push("sitemap.xml is missing the <urlset> root element")

  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])

  if (new Set(locs).size !== locs.length) {
    errors.push("sitemap.xml contains duplicate <loc> entries")
  }

  for (const loc of locs) {
    if (!loc.startsWith(site.url)) {
      errors.push(`sitemap.xml entry "${loc}" is not an absolute URL under ${site.url}`)
    }
  }

  const expectedCount = 5 + categories.length + toolSlugs.length // home + about + privacy + terms + sitemap
  if (locs.length !== expectedCount) {
    errors.push(
      `sitemap.xml has ${locs.length} entries, expected ${expectedCount} ` +
        `(5 static + ${categories.length} categories + ${toolSlugs.length} tools)`,
    )
  }

  for (const slug of toolSlugs) {
    if (!locs.includes(`${site.url}/tools/${slug}`)) {
      errors.push(`sitemap.xml is missing an entry for tool "${slug}"`)
    }
  }
  for (const category of categories) {
    if (!locs.includes(`${site.url}/category/${category.slug}`)) {
      errors.push(`sitemap.xml is missing an entry for category "${category.slug}"`)
    }
  }
}

function validateRobots() {
  const robotsPath = path.join(publicDir, "robots.txt")
  if (!fs.existsSync(robotsPath)) {
    errors.push("public/robots.txt does not exist -- run `npm run generate:seo`")
    return
  }

  const robots = fs.readFileSync(robotsPath, "utf-8")

  if (!/User-agent:\s*\*/i.test(robots))
    errors.push("robots.txt is missing a `User-agent: *` rule")
  if (!/Allow:\s*\//i.test(robots))
    errors.push("robots.txt does not explicitly allow crawling")

  const sitemapLine = robots.match(/Sitemap:\s*(\S+)/i)?.[1]
  if (!sitemapLine) {
    errors.push("robots.txt does not reference a Sitemap: line")
  } else if (sitemapLine !== `${site.url}/sitemap.xml`) {
    errors.push(
      `robots.txt Sitemap: line "${sitemapLine}" does not match ${site.url}/sitemap.xml`,
    )
  }
}

function main() {
  const toolSlugs = readToolSlugs()
  validateSitemap(toolSlugs)
  validateRobots()

  if (errors.length > 0) {
    console.error(
      `Sitemap/robots.txt validation failed with ${errors.length} issue(s):\n`,
    )
    for (const error of errors) console.error(`  - ${error}`)
    process.exit(1)
  }

  console.log(`sitemap.xml and robots.txt validated against ${toolSlugs.length} tools.`)
}

main()
