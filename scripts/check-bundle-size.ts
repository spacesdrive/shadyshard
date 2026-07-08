/**
 * Reads the production build output and fails CI if any chunk grows past a
 * budget. Budgets are set from the measured baseline in
 * docs/performance/performance.md, with headroom for organic growth --
 * this is meant to catch an accidental regression (an unminified debug
 * build of a dependency, a forgotten heavy import), not to be a tight
 * per-KB gate that needs updating on every tool addition.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const assetsDir = path.join(root, "dist/assets")

// Gzip-equivalent budgets in KB. Two named tools are known, justified
// exceptions per decisions.md ADR-011/ADR-012; everything else (vendor
// chunks and the app entry included) falls under the default budget.
const NAMED_BUDGETS_KB: Record<string, number> = {
  "vendor-react": 150,
  "vendor-router": 40,
  "vendor-ui": 30,
  "vendor-search": 15,
  "qr-code-scanner": 60, // jsQR, ADR-011
  "markdown-preview": 30, // marked + dompurify, ADR-012
  index: 60, // app entry
}
const DEFAULT_BUDGET_KB = 10

function gzipSizeKb(filePath: string): number {
  const buffer = fs.readFileSync(filePath)
  return gzipSync(buffer).length / 1024
}

function chunkName(fileName: string): string {
  // e.g. "word-counter-C1870Ghn.js" -> "word-counter". Rolldown's content
  // hash is a fixed 8 characters, so match exactly 8 -- {8,} would greedily
  // swallow part of a hyphenated tool name too (e.g. "vendor-react-...").
  return fileName.replace(/-[A-Za-z0-9_-]{8}\.js$/, "")
}

function main() {
  if (!fs.existsSync(assetsDir)) {
    console.error(`${assetsDir} does not exist -- run \`npm run build\` first.`)
    process.exit(1)
  }

  const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".js"))
  const overBudget: string[] = []
  const report: string[] = []

  for (const file of jsFiles) {
    const name = chunkName(file)
    const sizeKb = gzipSizeKb(path.join(assetsDir, file))
    const budget = NAMED_BUDGETS_KB[name] ?? DEFAULT_BUDGET_KB

    report.push(`${sizeKb.toFixed(2)} KB gzip  (budget ${budget} KB)  ${file}`)

    if (sizeKb > budget) {
      overBudget.push(`${file}: ${sizeKb.toFixed(2)} KB gzip exceeds ${budget} KB budget`)
    }
  }

  report.sort((a, b) => parseFloat(b) - parseFloat(a))
  console.log(report.join("\n"))

  if (overBudget.length > 0) {
    console.error(`\nBundle size check failed with ${overBudget.length} issue(s):\n`)
    for (const issue of overBudget) console.error(`  - ${issue}`)
    process.exit(1)
  }

  console.log(`\nBundle size check passed for ${jsFiles.length} chunks.`)
}

main()
