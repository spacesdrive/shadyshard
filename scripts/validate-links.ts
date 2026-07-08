/**
 * Checks every relative Markdown link in README.md and docs/**\/*.md
 * resolves to a real file, and that any #anchor resolves to a real heading
 * in the target file (or the current file, for same-page anchors). Skips
 * external (http/https/mailto) links -- those need a live network check,
 * which CI does separately if ever needed; this catches the far more
 * common failure mode of a doc move/rename leaving a dangling reference.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const errors: string[] = []

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...findMarkdownFiles(full))
    else if (entry.name.endsWith(".md")) results.push(full)
  }
  return results
}

function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[`*_]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
}

function headingsOf(filePath: string): Set<string> {
  const content = fs.readFileSync(filePath, "utf-8")
  const headings = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) =>
    slugifyHeading(m[1]),
  )
  return new Set(headings)
}

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8")
  const dir = path.dirname(filePath)
  const relFile = path.relative(root, filePath)
  const ownHeadings = headingsOf(filePath)

  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g
  for (const match of content.matchAll(linkPattern)) {
    const target = match[1].trim()

    if (/^(https?:|mailto:)/.test(target)) continue // external, not checked here
    if (target.startsWith("#")) {
      if (!ownHeadings.has(target.slice(1))) {
        errors.push(
          `${relFile}: anchor "${target}" does not match any heading in this file`,
        )
      }
      continue
    }

    const [targetPath, anchor] = target.split("#")
    const resolved = path.resolve(dir, targetPath)

    // claude.md is deliberately gitignored (see docs/git/git-workflow.md)
    // -- it exists on every contributor's machine by design but never in a
    // fresh checkout, so it can never pass a filesystem-existence check.
    if (resolved === path.join(root, "claude.md")) continue

    if (!fs.existsSync(resolved)) {
      errors.push(`${relFile}: link target "${targetPath}" does not exist`)
      continue
    }

    if (anchor && resolved.endsWith(".md")) {
      const targetHeadings = headingsOf(resolved)
      if (!targetHeadings.has(anchor)) {
        errors.push(
          `${relFile}: anchor "#${anchor}" not found in ${path.relative(root, resolved)}`,
        )
      }
    }
  }
}

function main() {
  const files = [
    path.join(root, "README.md"),
    ...findMarkdownFiles(path.join(root, "docs")),
  ].filter((f) => fs.existsSync(f))

  for (const file of files) checkFile(file)

  if (errors.length > 0) {
    console.error(`Broken internal link check failed with ${errors.length} issue(s):\n`)
    for (const error of errors) console.error(`  - ${error}`)
    process.exit(1)
  }

  console.log(
    `Checked internal links across ${files.length} Markdown files -- all resolve.`,
  )
}

main()
