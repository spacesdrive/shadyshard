/**
 * Validates every tool's meta.ts against the SEO/content rules in
 * docs/seo/seo-standards.md that the type system alone can't enforce:
 * uniqueness, non-empty required arrays, and category references that
 * actually exist. Run in CI so a bad meta.ts fails the build instead of
 * silently shipping a duplicate description or an orphaned category.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { categoryMap } from "../src/lib/categories"
import type { ToolMeta } from "../src/types/tool"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const toolsDir = path.join(root, "src/tools")

const errors: string[] = []

async function loadToolMetas(): Promise<ToolMeta[]> {
  const slugs = fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  const metas: ToolMeta[] = []
  for (const slug of slugs) {
    const metaPath = path.join(toolsDir, slug, "meta.ts")
    const indexPath = path.join(toolsDir, slug, "index.tsx")

    if (!fs.existsSync(metaPath)) {
      errors.push(`src/tools/${slug}: missing meta.ts`)
      continue
    }
    if (!fs.existsSync(indexPath)) {
      errors.push(`src/tools/${slug}: missing index.tsx`)
      continue
    }

    const mod = await import(`file://${metaPath.replace(/\\/g, "/")}`)
    const meta = mod.default as ToolMeta

    if (meta.slug !== slug) {
      errors.push(
        `src/tools/${slug}: meta.slug "${meta.slug}" does not match folder name`,
      )
    }
    if (!meta.description || meta.description.length < 20) {
      errors.push(`${slug}: description is missing or too short to be genuinely specific`)
    }
    if (!meta.keywords?.length) errors.push(`${slug}: keywords must not be empty`)
    if (!meta.tags?.length) errors.push(`${slug}: tags must not be empty`)
    if (!meta.features?.length) errors.push(`${slug}: features must not be empty`)
    if (!categoryMap[meta.category]) {
      errors.push(`${slug}: category "${meta.category}" does not exist in categories.ts`)
    }
    for (const faq of meta.faqs ?? []) {
      if (!faq.question.trim() || !faq.answer.trim()) {
        errors.push(`${slug}: has an FAQ entry with an empty question or answer`)
      }
    }

    metas.push(meta)
  }
  return metas
}

function checkUniqueness(metas: ToolMeta[]) {
  const bySlug = new Map<string, number>()
  const byDescription = new Map<string, string[]>()

  for (const meta of metas) {
    bySlug.set(meta.slug, (bySlug.get(meta.slug) ?? 0) + 1)
    const existing = byDescription.get(meta.description) ?? []
    existing.push(meta.slug)
    byDescription.set(meta.description, existing)
  }

  for (const [slug, count] of bySlug) {
    if (count > 1) errors.push(`Duplicate slug "${slug}" used by ${count} tools`)
  }
  for (const [description, slugs] of byDescription) {
    if (slugs.length > 1) {
      errors.push(
        `Duplicate description shared by [${slugs.join(", ")}]: "${description}"`,
      )
    }
  }
}

async function main() {
  const metas = await loadToolMetas()
  checkUniqueness(metas)

  if (errors.length > 0) {
    console.error(`Metadata validation failed with ${errors.length} issue(s):\n`)
    for (const error of errors) console.error(`  - ${error}`)
    process.exit(1)
  }

  console.log(`Metadata validation passed for ${metas.length} tools.`)
}

main()
