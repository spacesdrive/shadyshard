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

Largest production chunks at this baseline (50 tools):
`vendor-react` 371.81 KB / 119.94 KB gzip, `vendor-router` 94.48 KB / 31.30
KB gzip, `vendor-ui` 65.34 KB / 22.27 KB gzip, `vendor-search` 26.05 KB /
9.41 KB gzip, app entry 156.71 KB / 45.26 KB gzip (grew from ~93 KB at 12
tools -- expected per
[ARCHITECTURE.md §13](../architecture/ARCHITECTURE.md#13-scalability-notes-for-500-tools),
since `import.meta.glob` eager-loads every tool's metadata into the main
bundle graph; still a worthwhile trade-off at this scale, but worth
re-measuring again well before 500 tools). Most per-tool chunks stay under
4 KB. Two justified exceptions, both single-tool dependencies isolated to
their own lazy chunk and never loaded elsewhere: `qr-code-scanner` 132.69
KB / 48.90 KB gzip (`jsqr`) and `markdown-preview` 69.33 KB / 23.30 KB gzip
(`marked` + `dompurify`). `qr-code-generator` (`qrcode`) is 25.57 KB /
9.74 KB gzip.

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
