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
    About.tsx, Privacy.tsx, Terms.tsx, HtmlSitemap.tsx, NotFound.tsx

  tools/                   One folder per tool. See tool-development.md
    <slug>/
      meta.ts               default-exports a ToolMeta object
      index.tsx             default-exports the tool's React component

  components/
    layout/                 Header, Footer, RootLayout, Breadcrumbs, ThemeToggle, PageLoader
    seo/                    Seo.tsx (react-helmet-async wrapper)
    search/                 SearchDialog.tsx (Fuse.js + cmdk)
    tool/                   ToolPageLayout, ToolCard, ToolFaq, RelatedTools, StrengthMeter,
                             CopyButton, DownloadButton, FileDropZone, PageRangeInput
    ui/                     shadcn/ui primitives (generated, see ui/design-system.md)

  hooks/
    use-theme.tsx            Theme context: light/dark/system
    use-search-index.ts      Fuse.js index over the tool registry

  lib/
    tool-registry.ts         import.meta.glob discovery + lookup/query helpers
    tool-index.generated.ts   Generated eager ToolSummary list, see section 3
    categories.ts             Static category taxonomy
    seo.ts                    JSON-LD schema builders
    site.ts                   Site-wide constants (name, url, description)
    utils.ts                  cn() class-merging helper (shadcn convention)
    secure-random.ts          Rejection-sampled crypto-random int/char/string
    password-strength.ts      Entropy-heuristic password strength estimator
    image.ts                  Canvas load/draw/convert helpers, formatBytes
    download.ts                downloadBlob/downloadText helpers
    pdf.ts                    pdf-lib helpers: load/merge/split/rotate/reorder/
                             delete pages, metadata read/strip, images-to-PDF
    pdf-render.ts             pdfjs-dist helpers: lazy-loaded page rendering to
                             canvas/PNG, text extraction
    page-range.ts             Parses "1-3,5,8-9" page-range input, shared by
                             every PDF tool that lets a user pick specific pages
    csv.ts                    Hand-rolled RFC 4180-style CSV/TSV parse/serialize
    subtitle.ts               SRT/WebVTT cue parsing, serialisation, and time
                             shifting, shared by the two subtitle tools
    xml.ts                    XML <-> plain-object conversion via native
                             DOMParser/XMLSerializer
    file-signatures.ts        Magic-byte file-signature database and hex-dump
                             formatter, shared by the file-inspection tools
    hash.ts                    Shared Web Crypto hashing (hashText/hashFile),
                             used by both text- and file-hashing tools

  types/
    tool.ts                   ToolSummary, ToolDetail, ToolMeta, ToolCategory, ToolFaq

scripts/
  generate-seo.ts            Node script: writes public/sitemap.xml + robots.txt
  generate-tool-index.ts     Node script: writes src/lib/tool-index.generated.ts

public/                     Static assets served as-is: favicons, manifest,
                             logo.jpg, llms.txt, generated sitemap.xml/robots.txt
```

Rule of placement: a file lives under `pages/` if it is a route target, under
`components/<domain>/` if it is shared UI grouped by what it serves
(layout-wide vs. tool-specific vs. search vs. SEO), under `lib/` if it is
non-visual logic with no React dependency it can't shed, and under `hooks/`
if it is stateful logic meant for reuse across components.

## 3. Tool registry (the core abstraction)

**Source:** `src/lib/tool-registry.ts`, `src/lib/tool-index.generated.ts`

Every tool is a folder at `src/tools/<slug>/` containing exactly two files:

- `meta.ts` -- default-exports a `ToolMeta` object (see
  [types/tool.ts](../../src/types/tool.ts) and
  [tool-development.md](../engineering/tool-development.md))
- `index.tsx` -- default-exports the tool's React component

`ToolMeta` is split into two halves by responsibility, and the split is what
keeps the app entry chunk from growing with catalog prose (ADR-026):

- **`ToolSummary`** -- `slug`, `title`, `description`, `category`,
  `keywords`, `tags`, `icon`, `isNew`. Navigation, search, tool cards,
  category pages, and the HTML sitemap all need these synchronously, so they
  are loaded eagerly from `tool-index.generated.ts`.
- **`ToolDetail`** -- `longDescription`, `features`, `faqs`,
  `relatedTools`. Only the tool's own page renders these, so they are loaded
  on demand from the tool's `meta.ts`.

`tool-index.generated.ts` is written by `scripts/generate-tool-index.ts`,
which imports every `meta.ts` from disk and emits the summary half as a
plain TypeScript array with real `lucide-react` icon imports. It runs
automatically via the `predev` and `prebuild` npm scripts, and standalone
via `npm run generate:tool-index`. It is committed so a fresh checkout
typechecks before anything is run.

`tool-registry.ts` uses two `import.meta.glob` calls, both lazy:

```ts
const metaLoaders = import.meta.glob<{ default: ToolMeta }>("/src/tools/*/meta.ts")
const componentLoaders = import.meta.glob<{ default: React.ComponentType }>(
  "/src/tools/*/index.tsx",
)
```

The globs still enumerate every tool folder at build time, which is what the
registry validates against at module init: every discovered `meta.ts` must
have a matching `index.tsx`, and the slug set in `tool-index.generated.ts`
must match the slug set on disk exactly. A stale generated file therefore
throws immediately, naming the missing slugs and the command to fix it,
rather than silently dropping a tool from navigation.

Both `index.tsx` and `meta.ts` ship as their own lazy chunks, so a visitor
never downloads the other 162 tools' FAQs. `vite.config.ts` names the
metadata chunks `<slug>-meta-*.js` so the bundle-size report stays readable
(every one of them would otherwise be called `meta`).

Exposed helpers:

- `tools` -- all tool summaries, sorted by title
- `toolBySlug` / `getTool(slug)` -- O(1) summary lookup
- `getToolsByCategory(categorySlug)` -- powers category pages
- `getToolComponent(slug)` -- memoised `React.lazy` component per tool
- `loadToolDetail(slug)` -- memoised promise for the prose half
- `getRelatedTools(tool, explicitSlugs?, limit = 4)` -- explicit slugs if
  the tool's `meta.relatedTools` provides them, otherwise scored by shared
  category (+3) and shared tags (+1 each)

The `/tools/:slug` route pairs its `lazy` page module with a
statically-declared `loader` that calls `loadToolDetail`. React Router runs
the two concurrently, so the detail chunk downloads alongside the `ToolPage`
chunk and the page still renders in a single commit, with the header,
features, FAQ, and related tools all present in the first paint.

That pairing is load-bearing, not incidental. Loading the detail from a
`useEffect` inside `ToolPage` instead was measured at **0.26 CLS** on
`/tools/word-counter` against 0.03 before the split, because the page
painted once as a short shell (leaving the footer mid-viewport) and again
once the prose arrived. Moving the fetch into the route loader restored the
original 0.033. If this ever needs revisiting, measure CLS on a tool page
before and after -- the entry-chunk win is not worth a layout-shift
regression.

**Adding a tool touches exactly two new files and zero hand-edited existing
files.** Routing, the search index, the sitemap, category counts,
related-tools links, and the generated summary index all update
automatically on the next `npm run dev` or `npm run build`. This is the
mechanism that makes 500+ tools tractable.

## 4. Routing

**Source:** `src/routes/router.tsx`

React Router v8 in **Data Mode** (`createBrowserRouter` + `RouterProvider`
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
/sitemap             -> pages/HtmlSitemap.tsx  (crawlable link list, ADR-021)
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
- `crypto.subtle.importKey` / `deriveKey` / `encrypt` / `decrypt` --
  password-based AES-256-GCM encryption with PBKDF2-SHA256 key derivation
  in Text Encrypter. No crypto library; see
  [decisions.md ADR-024](decisions.md) for the message format.
- `crypto.subtle.sign` (HMAC) -- TOTP code generation in TOTP Code
  Generator, over a hand-rolled Base32 decoder for the shared secret
- `Intl.DateTimeFormat.formatToParts` and `Intl.supportedValuesOf` -- Time
  Zone Converter derives each zone's offset by formatting an instant in
  that zone and reading the parts back, which is the only way to get a
  daylight-saving-correct offset without shipping a time zone database.
  `Intl.RelativeTimeFormat` (Unix Timestamp Converter) and `Intl.Collator`
  with `numeric: true` (Line Sorter's natural ordering) are used the same
  way: native formatting and collation instead of a dependency.
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
- Pointer Events (`onPointerDown`/`Move`/`Up`, `setPointerCapture`) --
  Signature Pad's freehand drawing and Cubic Bezier Generator's draggable
  control points, so mouse, stylus, and touch are handled by one code path.
  Both also expose a keyboard-operable equivalent (sliders, undo/clear
  buttons), since pointer input alone is not accessible.
- `Element.animate` (Web Animations API) -- Cubic Bezier Generator's motion
  preview, which takes the generated `cubic-bezier()` string directly as its
  `easing` option. Chosen over a CSS keyframe rule because the easing is
  user-defined at runtime and replaying it must not depend on a stylesheet.
- `canvas.getImageData` / `putImageData` -- per-pixel work in Color
  Blindness Simulator (matrix transform) and Image Palette Extractor
  (colour bucketing over a downsampled copy)
- SVG rasterisation via a blob URL drawn into a canvas -- SVG to PNG
  Converter. The markup is loaded through an `<img>`, which never executes
  script, so pasted SVG cannot run anything.
- `CompressionStream` (Compression Streams API) -- Gzip Size Calculator
  measures real gzip, deflate, and raw deflate output sizes by piping a
  `Blob` stream through it, rather than estimating a compression ratio. See
  [decisions.md ADR-029](decisions.md). Brotli is deliberately absent: the
  API does not offer it, so the tool says so instead of guessing.
- `Intl.Segmenter` -- Unicode Character Inspector counts grapheme clusters
  separately from code points, which is the difference between what a reader
  sees as one character and how many code points it actually is. Used the
  same way as the other `Intl` APIs above: native segmentation instead of a
  dependency, with a spread-over-the-string fallback where it is
  unavailable.
- `DOMParser` for pretty-printing, not only conversion -- XML Formatter
  validates with `parseFromString` and then walks the resulting tree to emit
  indented output, since `XMLSerializer` does not pretty-print. It shares no
  code with `lib/xml.ts`, which converts XML to and from plain objects.
- `speechSynthesis` (Web Speech API) -- Text to Speech Reader reads text
  aloud through the voices installed on the visitor's operating system,
  which is what lets it impose no character limit and keep the text on the
  device. The voice list is read on `voiceschanged` as well as on mount,
  since several browsers populate it asynchronously. Browsers do not expose
  the synthesised audio stream to a page, so the tool cannot offer a
  download and says so rather than implying otherwise. See
  [decisions.md ADR-030](decisions.md).
- Web Audio (`AudioContext`, `OscillatorNode`, `GainNode`) -- Morse Code
  Translator plays a message as a sine tone by scheduling the whole sequence
  against the audio clock up front, so dit and dah lengths stay accurate at
  high words-per-minute settings where `setTimeout` drift would be audible.
  Stopping closes the context rather than cancelling individual events. Same
  ADR as above.

No tool yet uses Web Workers or File System Access -- these remain
candidates as image/file-processing tools grow heavier (a large batch image
operation is the likely trigger for moving work off the main thread with a
Worker). Compression Streams left that list when Gzip Size Calculator
shipped, and Web Speech and Web Audio joined the list of APIs actually in
use when Text to Speech Reader and Morse Code Translator shipped, both
above. See
[engineering/tool-development.md](../engineering/tool-development.md) for
the browser-first policy that governs when to reach for them, and
[decisions.md](decisions.md) for the justified exceptions where no browser
API exists at all: `qrcode`/`jsQR` (QR tools), `marked`/`dompurify`
(Markdown Preview, Markdown to HTML, HTML to Markdown), `turndown` (HTML to
Markdown), `js-yaml` (YAML converters), and `pdf-lib`/`pdfjs-dist` (the PDF
Tools category, ADR-019).

`pdfjs-dist`'s worker script is imported as a local asset
(`pdfjs-dist/build/pdf.worker.mjs?url`, `lib/pdf-render.ts`) rather than
pointed at a CDN, keeping it consistent with the no-external-requests
posture the rest of the app follows.

## 11. Build and deployment

- **Dev:** `vite` dev server, HMR, Tailwind v4 Vite plugin.
- **Build:** `npm run build` runs `prebuild` (SEO file generation) → `tsc -b`
  (typecheck, no emit) → `vite build`.
- **Bundling:** Vite 8 on Rolldown (not Rollup). `vite.config.ts` defines
  `build.rolldownOptions.output.manualChunks` to split vendor code into
  `vendor-react`, `vendor-router`, `vendor-ui` (Base UI + cmdk + lucide),
  `vendor-motion` (framer-motion), `vendor-search` (Fuse.js), separate from
  the app chunk and from each lazy-loaded page/tool chunk. A
  `chunkFileNames` function renames each tool's lazily-loaded `meta.ts`
  chunk to `<slug>-meta-*.js`, since Rolldown would otherwise name all 163
  of them after the file's basename.
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

What already scales without change, now validated at 163 tools across 14
categories (up from the original 3):

- Adding a tool: two files, zero hand-edited registrations, per docs/engineering/tool-development.md.
- Routing, sitemap, search index, related tools, and the generated summary
  index: all derived, not hand-maintained.
- Code splitting: automatic per tool and per page -- confirmed at 163 tools
  that per-tool-chunk size stays small and independent of catalog size
  (adding another tool does not inflate an existing tool's chunk). The
  33-tool PDF & Document Tools batch also confirmed that a handful of tools
  sharing one heavy dependency (`pdf-lib`/`pdfjs-dist` across 15 PDF tools)
  still produces one shared lazy vendor chunk rather than 15 duplicated
  copies -- Rolldown dedupes it automatically.
- Adding a whole new category (`css`, `seo`, `qr`, `browser` were added in
  the same change that took the catalog from 12 to 50 tools) is a single
  entry in `categories.ts` -- no routing or registry change needed. The
  33-tool PDF & Document Tools batch needed **no new category at all**: all
  of it fit into the existing `pdf`, `converters`, `developer`, and
  `security` categories, which is the stronger scaling signal -- reusing an
  existing category is preferred over adding one whenever the tools
  genuinely fit, per [tool-development.md
  §5](../engineering/tool-development.md#5-adding-a-new-category). Removing
  a category is symmetric: deleting the ten IITM BS Student Tools (see
  [decisions.md ADR-020](decisions.md)) was ten tool folders, one
  `categories.ts` entry, and the category-exclusive shared infrastructure
  those tools used (`lib/iitm-bs.ts`, `hooks/use-local-storage-state.ts`,
  `components/tool/UnofficialToolNotice.tsx`) -- sitemap, nav, and search
  updated automatically with no other code changes needed.
- Cross-tool shared data and persistence also scale the same way a shared
  component does: the seventeen PDF Tools import from one `lib/pdf.ts` and
  one `lib/pdf-render.ts`; the file-inspection tools share one
  `lib/file-signatures.ts`; text- and file-hashing tools share one
  `lib/hash.ts`; CSV Splitter reuses the same `lib/csv.ts` parser the
  CSV/TSV converters use -- none of these tools re-derive or hand-roll logic
  another tool in the same batch already needed.
- A single-tool heavy dependency stays confined to that tool's lazy chunk.
  The 15-tool batch that took the catalog to 133 added two
  (`sql-formatter`, `exifreader`, ADR-027 and ADR-028), which land in
  `sql-formatter-*.js` at 73.74 KB gzip and `image-metadata-viewer-*.js` at
  36.74 KB gzip and are downloaded by nobody who does not open those two
  pages. The entry chunk, every other tool chunk, and the vendor chunks are
  unchanged by them.
- Adding no dependency at all remains the normal case, and is the stronger
  signal. The 15-tool batch that took the catalog to 148 added zero: every
  one of those tools is built on a browser API already available (Canvas,
  File, `DOMParser`, `Intl.Segmenter`, and `CompressionStream`, the last two
  used here for the first time -- see section 10 and
  [decisions.md ADR-029](decisions.md)). Each of the fifteen lands under
  3 KB gzip in its own lazy chunk. Two of them share one new `lib/subtitle.ts`
  the same way the PDF tools share `lib/pdf.ts`. The 15-tool batch that took
  the catalog to 163 added zero as well, and added no shared `lib/` file
  either: the two image tools in it compose the existing `lib/image.ts`
  helpers and CSV to SQL Insert reuses the existing `lib/csv.ts` parser, so
  the only genuinely new capabilities are two more browser APIs
  (`speechSynthesis` and Web Audio, see section 10 and
  [decisions.md ADR-030](decisions.md)). Every one of the fifteen lands
  under 3.5 KB gzip in its own lazy chunk.

What will need revisiting well before 500 tools, tracked here so it isn't
forgotten:

- **`categories.ts` is a hand-maintained flat list**, still at 14 entries.
  The 15-tool batch that took the catalog to 148 needed no new category
  either, spreading across eight existing ones, which is the fifth batch in
  a row to give that signal. The 15-tool batch that took it to 163 made it
  six in a row, spreading across seven existing categories (`developer`,
  `security`, `text`, `converters`, `math`, `image`). Still fine; reconsider
  if subcategories or a category hierarchy become necessary.
- **`Header` hard-codes `categories.slice(0, 5)`** in the desktop nav. This
  is a deliberate simplification for a small catalog, not a scalable nav;
  revisit with a real navigation/mega-menu design once category count or
  tools-per-category grows enough to make five links insufficient -- at 14
  categories this is already worth watching.
- **Eager metadata is no longer the binding constraint, but it has not gone
  away.** Until the 118-tool batch, the registry globbed every `meta.ts`
  eagerly, so all of the catalog's `longDescription` and `faqs` prose sat in
  the app entry chunk: 64.06 KB gzip at 103 tools against a 65 KB budget,
  with under 1 KB of headroom. Splitting `ToolMeta` into an eager
  `ToolSummary` and a lazily-loaded `ToolDetail` (see section 3 and
  [decisions.md ADR-026](decisions.md)) brought the entry chunk down to
  **34.34 KB gzip at 118 tools**, and the remaining per-tool cost is now the
  summary only, roughly 0.2 KB gzip each rather than 0.58 KB. Measured again
  at 163 tools it is 42.92 KB gzip, which holds that per-tool rate at
  roughly 0.25 KB gzip each. At that rate the 65 KB budget is reached
  somewhere around 250 tools. The next lever, if
  and when that matters, is moving the summary index itself out of the entry
  chunk (a fetched JSON index behind the search dialog, keeping only what
  the homepage renders eagerly) -- do not simply raise the budget.
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
