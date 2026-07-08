# Architecture

Authoritative technical blueprint of ShadyShard. This document describes the
system as it is actually implemented, not as it is aspired to be. When code
and this document disagree, the code is a bug in one of the two -- fix
whichever is wrong.

Read this before any medium or large change. See [documentation
maintenance](../index.md#documentation-maintenance) for the rule on keeping
this file current.

## 1. System summary

ShadyShard is a static single-page application: a React 19 + TypeScript
client built with Vite and deployed to Cloudflare Pages as pre-built static
assets. There is no backend. Every tool executes entirely in the visiting
browser; no user input or generated output is ever transmitted anywhere.

Routing, SEO metadata, sitemap generation, category pages, search indexing,
and related-tools linking are all derived automatically from a single source
of truth: the set of tool folders under `src/tools/`. This is what lets the
platform scale toward 500+ tools without proportional growth in
hand-maintained wiring.

## 2. Folder structure

```
src/
  App.tsx                 Root component: providers + RouterProvider
  main.tsx                Entry point, mounts App into #root
  index.css               Tailwind import + shadcn theme tokens

  routes/
    router.tsx             createBrowserRouter route tree, lazy page loading

  pages/                   One file per route, default-exported component
    Home.tsx
    ToolPage.tsx            Renders any tool by slug (/tools/:slug)
    CategoryPage.tsx         Renders any category by slug (/category/:slug)
    About.tsx, Privacy.tsx, Terms.tsx, NotFound.tsx

  tools/                   One folder per tool. See tool-development.md
    <slug>/
      meta.ts               default-exports a ToolMeta object
      index.tsx             default-exports the tool's React component

  components/
    layout/                 Header, Footer, RootLayout, Breadcrumbs, ThemeToggle, PageLoader
    seo/                    Seo.tsx (react-helmet-async wrapper)
    search/                 SearchDialog.tsx (Fuse.js + cmdk)
    tool/                   ToolPageLayout, ToolCard, ToolFaq, RelatedTools, StrengthMeter,
                             CopyButton, DownloadButton, FileDropZone
    ui/                     shadcn/ui primitives (generated, see ui/design-system.md)

  hooks/
    use-theme.tsx            Theme context: light/dark/system
    use-search-index.ts      Fuse.js index over the tool registry

  lib/
    tool-registry.ts         import.meta.glob discovery + lookup/query helpers
    categories.ts             Static category taxonomy
    seo.ts                    JSON-LD schema builders
    site.ts                   Site-wide constants (name, url, description)
    utils.ts                  cn() class-merging helper (shadcn convention)
    secure-random.ts          Rejection-sampled crypto-random int/char/string
    password-strength.ts      Entropy-heuristic password strength estimator
    image.ts                  Canvas load/draw/convert helpers, formatBytes
    download.ts                downloadBlob/downloadText helpers

  types/
    tool.ts                   ToolMeta, ToolCategory, ToolDefinition, ToolFaq

scripts/
  generate-seo.ts            Node script: writes public/sitemap.xml + robots.txt

public/                     Static assets served as-is: favicons, manifest,
                             logo.jpg, llms.txt, generated sitemap.xml/robots.txt
```

Rule of placement: a file lives under `pages/` if it is a route target, under
`components/<domain>/` if it is shared UI grouped by what it serves
(layout-wide vs. tool-specific vs. search vs. SEO), under `lib/` if it is
non-visual logic with no React dependency it can't shed, and under `hooks/`
if it is stateful logic meant for reuse across components.

## 3. Tool registry (the core abstraction)

**Source:** `src/lib/tool-registry.ts`

Every tool is a folder at `src/tools/<slug>/` containing exactly two files:

- `meta.ts` -- default-exports a `ToolMeta` object (see
  [types/tool.ts](../../src/types/tool.ts) and
  [tool-development.md](../engineering/tool-development.md))
- `index.tsx` -- default-exports the tool's React component

`tool-registry.ts` uses two `import.meta.glob` calls:

```ts
const metaModules = import.meta.glob<{ default: ToolMeta }>("/src/tools/*/meta.ts", {
  eager: true,
})
const componentLoaders = import.meta.glob<{ default: React.ComponentType }>(
  "/src/tools/*/index.tsx",
)
```

`meta.ts` files are loaded **eagerly** at build time -- their content is small
and needed synchronously for navigation, search, and sitemap generation.
`index.tsx` files are loaded **lazily** via `React.lazy`, so each tool's
component code ships as its own chunk and is only downloaded when a visitor
opens that tool. This is why the production build already produces one small
JS chunk per tool (verified: `word-counter-*.js`, `json-formatter-*.js`,
`color-converter-*.js` each under 4 KB).

The registry validates at build time that every `meta.ts` has a matching
`index.tsx`, and that `meta.slug` matches the folder name. A mismatch throws
immediately rather than producing a silently broken route.

Exposed helpers:

- `tools` -- all tools, sorted by title
- `toolBySlug` / `getTool(slug)` -- O(1) lookup
- `getToolsByCategory(categorySlug)` -- powers category pages
- `getRelatedTools(meta, limit = 4)` -- explicit `meta.relatedTools` slugs if
  present, otherwise scored by shared category (+3) and shared tags (+1 each)

**Adding a tool touches exactly two new files and zero existing files.**
Routing, the search index, the sitemap, category counts, and related-tools
links all update automatically on the next build. This is the mechanism that
makes 500+ tools tractable.

## 4. Routing

**Source:** `src/routes/router.tsx`

React Router v7 in **Data Mode** (`createBrowserRouter` + `RouterProvider`
from `react-router/dom`), not Framework Mode -- there is no server, no
`react-router.config.ts`, no file-based routing convention. Chosen
specifically because it gives per-route `lazy()` code splitting without
requiring a Vite plugin or a build-time route generator.

Route tree:

```
/                    -> pages/Home.tsx
/tools/:slug         -> pages/ToolPage.tsx     (looks up slug via getTool())
/category/:slug      -> pages/CategoryPage.tsx (looks up slug via getCategory())
/about               -> pages/About.tsx
/privacy             -> pages/Privacy.tsx
/terms               -> pages/Terms.tsx
*                    -> pages/NotFound.tsx
```

All children render inside `RootLayout` (`Component: RootLayout` at the root
route), which renders `Header`, `<Outlet />`, `Footer`.

Every page module default-exports its component (ordinary React convention),
but React Router's `lazy()` route API expects a named `Component` export, not
`default`. The `page()` helper in `router.tsx` bridges this:

```ts
function page(loader: () => Promise<{ default: ComponentType }>) {
  return async () => {
    const { default: Component } = await loader()
    return { Component }
  }
}
```

The root route also sets `HydrateFallback: PageLoader` -- required by React
Router when the matched route is lazy, even in a client-only (non-SSR) app,
to avoid a console warning on first paint before the first lazy chunk
resolves.

`ToolPage` and `CategoryPage` render `<Navigate to="/404" replace />` when
the slug doesn't resolve, which the `*` catch-all route picks up.

## 5. Layouts and composition

- `RootLayout` -- top-level shell: skip-link, `Header`, `<main>`, `Footer`.
  Every route renders inside this.
- `ToolPageLayout` (`components/tool/`) -- wraps a tool's rendered component
  with breadcrumbs, title/description header, a bordered card container
  (`Suspense` + `Skeleton` fallback around the tool component itself, since
  it's lazy-loaded), the features list, FAQ accordion, and related tools
  grid. A tool's `index.tsx` never renders its own page chrome -- it only
  renders the interactive tool UI; `ToolPage.tsx` supplies `ToolPageLayout`
  around it.
- `CategoryPage` composes its own header + `ToolCard` grid directly (no
  shared layout component beyond `Breadcrumbs`, since a category page's
  shape is simpler and used in exactly one place).

## 6. Metadata and SEO

**Source:** `src/components/seo/Seo.tsx`, `src/lib/seo.ts`, `src/types/tool.ts`

Every route renders a `<Seo>` component (react-helmet-async) with a unique
`title`, `description`, `path` (used to build the canonical URL against
`site.url`), and an array of JSON-LD schema objects. `lib/seo.ts` builds
those schemas:

- `breadcrumbSchema` -- every tool and category page
- `toolWebApplicationSchema` -- every tool page (`WebApplication` type)
- `faqSchema` -- every tool page with `meta.faqs.length > 0`
- `categoryCollectionSchema` -- every category page (`CollectionPage` type)

Full field-by-field detail: [seo-standards.md](../seo/seo-standards.md).

Sitemap and robots.txt are **not** generated at request time (there is no
server to do that) -- they are generated as static files by
`scripts/generate-seo.ts`, run automatically via the `prebuild` npm script
before every `vite build`. The script dynamically imports every `meta.ts`
under `src/tools/`, plus `lib/categories.ts` and `lib/site.ts`, and writes
`public/sitemap.xml` and `public/robots.txt`, which Vite then copies into
`dist/` unchanged as part of the static asset pipeline. `public/llms.txt` is
hand-maintained (see seo-standards.md) since its content is prose, not
per-tool data.

## 7. Search

**Source:** `src/hooks/use-search-index.ts`, `src/components/search/SearchDialog.tsx`

Client-side only, no external search service. A single `Fuse.js` index is
built lazily (module-level singleton, first call constructs it) over the
full `tools` array from the registry, weighted `title(3) > keywords(2) ≈
tags(2) > description(1)`, `threshold: 0.35`. `SearchDialog` wraps shadcn's
`Command` primitives (built on `cmdk`) with `shouldFilter={false}` because
Fuse, not `cmdk`'s built-in substring filter, owns matching. Opens via a
`Ctrl/Cmd+K` listener registered in `Header`.

This is genuinely a small dataset scan (hundreds of tools, not thousands),
so an in-memory Fuse index is appropriate at the target scale. If the
catalog grows an order of magnitude beyond "hundreds," revisit -- see
[decisions.md](decisions.md).

## 8. State management

There is no global state library (no Redux/Zustand/Jotai) and none is
planned. State lives in three places:

1. **Component-local `useState`** -- default for everything (tool inputs,
   dialog open/closed, search query).
2. **React Context, exactly one instance:** `ThemeProvider`
   (`src/hooks/use-theme.tsx`) for light/dark/system theme, because it must
   be readable from both `Header` (toggle) and be applied at the document
   root, and because there is exactly one such value in the whole app.
3. **`localStorage`**, read synchronously in an inline `<script>` in
   `index.html` before React mounts, to avoid a flash of the wrong theme.
   `ThemeProvider` re-reads/writes the same key (`shadyshard-theme`).

No tool currently needs to share state with anything outside itself. Should
a future tool need cross-component state, prefer lifting state to the
nearest common ancestor before reaching for Context, and prefer Context
before reaching for a state library. See
[engineering/standards.md](../engineering/standards.md#state-management).

## 9. Design system implementation

shadcn/ui generated components live in `src/components/ui/`, built on
**Base UI** (`@base-ui/react`), not Radix -- this project uses shadcn's
`base-nova` style. This has one load-bearing consequence: Base UI composes
via a `render` prop, not Radix's `asChild`. Full detail, token reference, and
this gotcha: [ui/design-system.md](../ui/design-system.md).

Dark mode is class-based (`.dark` on `<html>`), default theme is dark,
toggle supports light/dark/system. Font is Geist Variable, self-hosted via
`@fontsource-variable/geist` (no external font request).

## 10. Browser APIs currently in use

- `navigator.clipboard.writeText` -- copy buttons (used by nearly every
  tool)
- `Intl`-free native `<input type="color">` -- Color Converter's picker
- `localStorage` -- theme persistence
- `crypto.getRandomValues` -- rejection-sampled unbiased random integers in
  `lib/secure-random.ts`, used by Password Generator and Nano ID Generator.
  Deliberately not `Math.random()`, which is not safe for generating
  secrets.
- `crypto.randomUUID` -- UUID Generator's version 4 UUIDs
- `TextEncoder` / `TextDecoder` -- UTF-8-safe Base64 encoding in Base64
  Encoder & Decoder (native `btoa`/`atob` alone only handle Latin1) and
  byte-size measurement across JSON/SVG tools
- `crypto.subtle.digest` -- SHA-1/256/384/512 hashing in SHA256 Generator,
  entirely native, no hashing library
- Canvas API (`<canvas>`, `CanvasRenderingContext2D`, `canvas.toBlob`/
  `toDataURL`) -- the whole Image Tools category (`lib/image.ts`):
  compression, resizing, cropping, format conversion, and EXIF stripping
  (re-encoding through canvas never preserves EXIF, so format-conversion
  and "EXIF removal" share the same underlying operation)
- File API (`<input type="file">`, drag-and-drop `DataTransfer`,
  `URL.createObjectURL`) -- `components/tool/FileDropZone.tsx`, shared by
  every Image Tools entry
- `navigator.mediaDevices.getUserMedia` -- QR Code Scanner's live camera
  capture, decoded frame-by-frame via canvas + `jsQR`
- `navigator.clipboard.readText` -- Clipboard Inspector, with a manual-paste
  fallback since clipboard read requires a permission prompt some browsers
  may deny

No tool yet uses Web Workers, Compression Streams, or File System Access --
these remain candidates as image/file-processing tools grow heavier (a
large batch image operation is the likely trigger for moving work off the
main thread with a Worker). See
[engineering/tool-development.md](../engineering/tool-development.md) for
the browser-first policy that governs when to reach for them, and
[decisions.md](decisions.md) for the two justified exceptions where no
browser API exists at all (`qrcode`/`jsQR` for QR tools, `marked`/
`dompurify` for Markdown Preview).

## 11. Build and deployment

- **Dev:** `vite` dev server, HMR, Tailwind v4 Vite plugin.
- **Build:** `npm run build` runs `prebuild` (SEO file generation) → `tsc -b`
  (typecheck, no emit) → `vite build`.
- **Bundling:** Vite 8 on Rolldown (not Rollup). `vite.config.ts` defines
  `build.rolldownOptions.output.manualChunks` to split vendor code into
  `vendor-react`, `vendor-router`, `vendor-ui` (Base UI + cmdk + lucide),
  `vendor-motion` (framer-motion), `vendor-search` (Fuse.js), separate from
  the app chunk and from each lazy-loaded page/tool chunk.
- **Hosting:** Cloudflare Pages, project `shadyshard`, static output from
  `dist/`. Client-side routing requires the host to fall back to
  `index.html` for unmatched paths (standard Cloudflare Pages SPA
  behavior). Production domain: `shadyshard.spacesdrive.cc` (custom
  domain) plus the default `shadyshard.pages.dev`.
- **CI/CD:** GitHub Actions. Every push and pull request runs the full
  quality gate (typecheck, lint, format, unit/component tests, dependency
  audit, secret scan, build + SEO/sitemap/metadata/HTML/bundle-size
  validation, Playwright e2e across four browser projects, Lighthouse CI);
  a push to `main` additionally deploys to Cloudflare Pages via
  `cloudflare/wrangler-action`, gated on that same check suite passing.
  Full detail, job-by-job: [ci-cd/ci-cd.md](../ci-cd/ci-cd.md).

## 12. Performance baseline

Last measured (production build, desktop Lighthouse, 50 tools across 14
categories, see [performance.md](../performance/performance.md) for the
full methodology and chunk-size detail): Performance/Accessibility/Best
Practices/SEO/Agentic-Browsing all 100, LCP 174 ms, CLS 0.00. Treat these
as the floor, not the target -- any change that regresses them needs
justification in the PR/commit description.

## 13. Scalability notes for 500+ tools

What already scales without change, now validated at 50 tools (up from the
original 3):

- Adding a tool: two files, zero registrations, per docs/engineering/tool-development.md.
- Routing, sitemap, search index, related tools: all derived, not hand-maintained.
- Code splitting: automatic per tool and per page -- confirmed at 50 tools
  that per-tool-chunk size stays small and independent of catalog size
  (adding tool #50 does not inflate tool #1's chunk).
- Adding a whole new category (`css`, `seo`, `qr`, `browser` were added in
  the same change that took the catalog from 12 to 50 tools) is a single
  entry in `categories.ts` -- no routing or registry change needed.

What will need revisiting well before 500 tools, tracked here so it isn't
forgotten:

- **`categories.ts` is a hand-maintained flat list**, now at 14 entries (up
  from 10). Still fine; reconsider if subcategories or a category hierarchy
  become necessary.
- **`Header` hard-codes `categories.slice(0, 5)`** in the desktop nav. This
  is a deliberate simplification for a small catalog, not a scalable nav;
  revisit with a real navigation/mega-menu design once category count or
  tools-per-category grows enough to make five links insufficient -- at 14
  categories this is already worth watching.
- **`import.meta.glob` eager meta loading** puts every tool's metadata
  object into the main bundle's JS graph at build time. This has gone from
  negligible to measurable: the app entry chunk grew from ~93 KB to ~157 KB
  gzip-uncompressed-source (45 KB gzip) between 12 and 50 tools. Still
  acceptable, but the growth is now linear and visible -- re-measure at
  every doubling of catalog size, and treat splitting metadata out of the
  eager bundle (e.g., a generated static JSON index fetched lazily) as the
  fix if it becomes a real problem before 500 tools.
- **Automated test coverage is deliberately shallow by tool count, not by
  layer.** Vitest + React Testing Library + Playwright now cover the
  shared registry, shared components, and a representative tool per
  interaction shape (see [testing.md § Test coverage
  philosophy](../testing/testing.md#test-coverage-philosophy)), enforced
  in CI on every push. This protects shared infrastructure from silent
  regression, but individual tool logic still relies on the manual
  verification each tool received when it was built -- a real gap if a
  future refactor touches many tools' internals at once rather than shared
  code. Revisit if that becomes a recurring pattern.

Record any decision that changes one of the above in
[decisions.md](decisions.md), and update the relevant section of this file
in the same change.
