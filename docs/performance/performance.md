# Performance

## Targets

Lighthouse (production build, desktop): Performance 100, Accessibility 100,
Best Practices 100, SEO 100. Treat these as a floor to maintain, not an
aspirational target -- they have been achieved and verified (see
[Baseline](#baseline) below); any regression needs a specific justification,
not just an acknowledgment.

## Strategy

### Prefer browser APIs over dependencies

Every dependency is bundle weight every visitor downloads. Before adding a
library, check whether a native browser API already does the job -- see
[tool-development.md § Browser-first
philosophy](../engineering/tool-development.md#browser-first-philosophy).
Minimize dependencies generally; `package.json` should stay lean relative
to the number of tools it supports.

### Code splitting

Two layers, both automatic, neither requiring manual configuration per
tool or page:

1. **Per-route splitting** -- every page in `src/pages/` is loaded via
   `lazy()` in `routes/router.tsx`; only the matched route's code
   downloads.
2. **Per-tool splitting** -- every tool's `index.tsx` is wrapped in
   `React.lazy` by the tool registry (`lib/tool-registry.ts`); a tool's
   component code only downloads when its page is visited, not when the
   registry itself loads. See
   [ARCHITECTURE.md §3](../architecture/ARCHITECTURE.md#3-tool-registry-the-core-abstraction).

Adding a new tool or page never requires manually configuring code
splitting -- it's a structural property of where the file lives.

### Vendor chunking

`vite.config.ts` explicitly splits vendor code by library domain
(`vendor-react`, `vendor-router`, `vendor-ui`, `vendor-motion`,
`vendor-search`) via `build.rolldownOptions.output.manualChunks`. This
exists because the default single-vendor bundle exceeded 500 KB; see
[decisions.md ADR-007](../architecture/decisions.md#adr-007-manual-vendor-chunk-splitting-via-rolldownoptionsoutputmanualchunks)
for the full reasoning. When adding a new heavy dependency, check the
production build's chunk size report (`npm run build` output) and consider
adding it to `manualChunks` if it meaningfully grows a chunk, rather than
letting it inflate the app entry chunk silently.

### Fonts and images

Geist Variable is self-hosted via `@fontsource-variable/geist` -- no
external font request. Favicons and the brand logo are static files in
`public/`, served as-is with no processing pipeline. As image-heavy tool
categories (Image Tools) are built, prefer lazy-loading any
non-critical images and keep an eye on Cumulative Layout Shift when
introducing images with unknown intrinsic dimensions.

### Avoiding layout shift

Baseline CLS is 0.00 (see below) -- keep it that way. Reserve space for
async content (loading skeletons already used via `Skeleton` in
`ToolPageLayout`'s `Suspense` fallback), and give images explicit
dimensions or aspect-ratio containers once image-based tools exist.

## Baseline

Last measured (2026-07-08, production build via `npm run build && npm run
preview`, Chrome DevTools MCP, desktop, 50 tools across 14 categories):

| Metric                      | Value  |
| --------------------------- | ------ |
| Lighthouse Performance      | 100    |
| Lighthouse Accessibility    | 100    |
| Lighthouse Best Practices   | 100    |
| Lighthouse SEO              | 100    |
| Lighthouse Agentic Browsing | 100    |
| LCP                         | 174 ms |
| CLS                         | 0.00   |
| Failed audits               | 0      |

Largest production chunks measured on 2026-07-29 at 133 tools:
`vendor-react` 403.95 KB / 125.84 KB gzip, `vendor-router` 93.21 KB / 29.53
KB gzip, `vendor-ui` 82.19 KB / 25.85 KB gzip, `vendor-search` 26.06 KB /
9.06 KB gzip, app entry 37.27 KB gzip. The app entry chunk previously grew
with the catalog, reaching 64.06 KB gzip at 103 tools against its 65 KB
budget, because `import.meta.glob` eager-loaded every tool's full metadata
including its `longDescription` and `faqs` prose. Splitting `ToolMeta` into
an eagerly-loaded summary and a lazily-loaded detail
([decisions.md ADR-026](../architecture/decisions.md)) removed that prose
from the entry chunk; each tool now also ships a `<slug>-meta-*.js` chunk of
0.5 to 1.5 KB gzip, fetched only when that tool's page opens, in parallel
with the tool's own component chunk. Most per-tool component chunks stay
under 4 KB. Three justified exceptions, all single-tool dependencies isolated
to their own lazy chunk and never loaded elsewhere: `sql-formatter` 73.74 KB
gzip (`sql-formatter`, ADR-027), `qr-code-scanner` 46.80 KB gzip (`jsqr`,
ADR-011), and `image-metadata-viewer` 36.74 KB gzip (`exifreader`, ADR-028).
`markdown-preview` was previously a fourth at 23.30 KB gzip; `dompurify` and
`marked` are now shared across the Markdown, HTML, and SVG tools and Rolldown
splits them into their own chunks (`purify.es` 10.16 KB gzip, `marked.esm`
11.99 KB gzip), leaving the tool's own chunk under 1 KB. The two used to be
one 22.68 KB chunk; they separated once `dompurify` gained more consumers
than `marked`, which is the same total bytes split so that a tool needing
only the sanitizer no longer downloads the Markdown parser. Their named
budgets are kept as guards rather than current needs. The
shared `pdf` chunks (`pdf-lib` and `pdfjs-dist`, ADR-019) are the largest
lazy assets on the site at 172.22 KB and 122.68 KB gzip, loaded only by the
PDF Tools category.

The Lighthouse and Core Web Vitals rows above are still the 2026-07-08
measurement and have not been re-taken since; the chunk figures above them
have.

Layout stability was re-measured on 2026-07-28 when the metadata split
(ADR-026) was made, under 4x CPU throttling and a simulated 1.6 Mbps link,
against the pre-split baseline:

| Page                    | Before the split | After  |
| ----------------------- | ---------------- | ------ |
| `/tools/word-counter`   | 0.0328           | 0.0328 |
| `/tools/json-formatter` | 0.0084           | 0.0084 |
| `/` (homepage)          | 0.0007           | 0.0007 |

Any change that defers content a tool page paints on first load must be
measured this way before it ships. An intermediate implementation of the
same split fetched the prose from a `useEffect` and pushed
`/tools/word-counter` to 0.256 CLS and Lighthouse performance to 78, which
CI caught. See [ARCHITECTURE.md section
3](../architecture/ARCHITECTURE.md#3-tool-registry-the-core-abstraction).

Re-measure and update this table whenever a change is plausibly
performance-relevant (new heavy dependency, new tool category with
different processing demands, routing changes) -- see [Documentation
Maintenance](../index.md#documentation-maintenance).

## Verification workflow

See [testing.md § Chrome DevTools
verification](../testing/testing.md#chrome-devtools-verification) for the
full step-by-step process (build → preview → navigate → Lighthouse audit →
performance trace). Always audit a **production build**, never the dev
server -- Vite's dev-mode HMR client and unminified output meaningfully
skew performance numbers.
