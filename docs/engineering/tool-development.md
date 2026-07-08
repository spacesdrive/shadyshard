# Building a Tool

The complete, concrete process for adding one tool to ShadyShard. If you
follow this document, routing, navigation, the search index, the sitemap,
category listing, and related-tools linking all update automatically --
nothing else needs to be touched. See
[ARCHITECTURE.md §3](../architecture/ARCHITECTURE.md#3-tool-registry-the-core-abstraction)
for how the automatic discovery works under the hood.

## 1. Create the folder

```
src/tools/<slug>/
  meta.ts
  index.tsx
```

`<slug>` must be kebab-case and must exactly match `meta.slug` -- this is
validated at build time and the build fails loudly if it doesn't match.
The slug becomes the URL: `/tools/<slug>`.

## 2. Write `meta.ts`

Default-export a `ToolMeta` object (full type in
[`src/types/tool.ts`](../../src/types/tool.ts)). Use
[`src/tools/word-counter/meta.ts`](../../src/tools/word-counter/meta.ts) as
the reference template.

| Field             | Required | Notes                                                                                                                                                                                                                     |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`            | yes      | Must match the folder name exactly.                                                                                                                                                                                       |
| `title`           | yes      | Display name, e.g. "Word Counter".                                                                                                                                                                                        |
| `description`     | yes      | One sentence. Used as the card blurb and the SEO meta description fallback -- must be unique across all tools (see [seo-standards.md](../seo/seo-standards.md)).                                                          |
| `longDescription` | no       | One paragraph shown on the tool page below the tool itself. Skip only if the description genuinely says everything.                                                                                                       |
| `category`        | yes      | Must match a slug in [`src/lib/categories.ts`](../../src/lib/categories.ts). Adding a new category requires editing that file -- see §5.                                                                                  |
| `keywords`        | yes      | SEO keyword list, realistic search phrases, not a keyword-stuffed list.                                                                                                                                                   |
| `tags`            | yes      | Search-matching tags; also drives automatic related-tools scoring (shared tags = higher relevance).                                                                                                                       |
| `icon`            | yes      | A `lucide-react` icon component reference (not a string name) -- see [ui/design-system.md](../ui/design-system.md#icons).                                                                                                 |
| `features`        | yes      | 3-6 short bullet points, rendered as the Features section and used in the `WebApplication` JSON-LD `featureList`.                                                                                                         |
| `faqs`            | yes      | 2-4 real, specific questions a user would actually ask. Empty array is allowed but skips FAQ structured data -- prefer having at least 2.                                                                                 |
| `relatedTools`    | no       | Explicit slugs to force specific related-tools links. Omit to let the registry auto-score by category + shared tags -- prefer omitting unless a specific pairing genuinely matters more than the algorithm would produce. |
| `isNew`           | no       | Surfaces the tool in the homepage "New tools" section and shows a "New" badge. Remove once the tool is no longer new (no fixed threshold -- use judgment, roughly "until several more tools have shipped after it").      |

## 3. Write `index.tsx`

Default-export the tool's React component. **The component renders only the
interactive tool itself** -- no page title, no breadcrumbs, no FAQ, no
features list. `ToolPage.tsx` wraps every tool in `ToolPageLayout`, which
supplies all of that chrome from `meta.ts`. Use
[`src/tools/word-counter/index.tsx`](../../src/tools/word-counter/index.tsx)
or
[`src/tools/color-converter/index.tsx`](../../src/tools/color-converter/index.tsx)
as reference templates -- pick whichever is closer in shape (single-input
transform vs. multi-format live-convert).

Requirements for the component itself:

- **Every processing step runs client-side.** No `fetch` to any backend for
  the tool's core function. See [browser-first
  philosophy](#browser-first-philosophy) below.
- **Every form field needs `id` and `name`**, even when it also has
  `aria-label`. This has caused real bugs more than once, including
  readonly output `Textarea`s that only have a value once the tool
  produces output -- Chrome's autofill/a11y check still flags them, so
  don't skip `id`/`name` just because a field starts empty or read-only.
  See [accessibility.md](../accessibility/accessibility.md#form-fields).
- **Never use `<Label>` without `htmlFor` pointing at a real field.**
  `Label` renders an actual `<label>` element; using it as a plain section
  heading (e.g. above a button group or a `Slider`) creates an orphaned
  label that Lighthouse flags. Use a plain `<span>` for that kind of
  visual-only heading instead -- see [ui/design-system.md § Labeling a
  Slider](../ui/design-system.md#labeling-a-slider) for the canonical
  example, and [decisions.md
  ADR-010](../architecture/decisions.md#adr-010-fixed-a-labeling-defect-in-the-vendored-slider-primitive).
- **Use shadcn `components/ui/` primitives**, not raw HTML form elements,
  for consistency with the rest of the app (`Textarea`, `Input`, `Button`,
  `Label`). Remember Base UI composition uses `render`, not `asChild` -- see
  [ui/design-system.md](../ui/design-system.md#composition-render-not-aschild).
- **Reuse the shared tool components before writing your own.**
  `components/tool/CopyButton.tsx` (copy-with-checkmark-feedback, used by
  nearly every tool -- don't hand-roll the copy/checkmark state again),
  `components/tool/DownloadButton.tsx` (wraps `lib/download.ts`, accepts a
  sync or async blob producer), and `components/tool/FileDropZone.tsx`
  (accessible drag-and-drop-or-click file upload, used by every Image
  Tools entry and QR Code Scanner). See [decisions.md
  ADR-013](../architecture/decisions.md#adr-013-extracted-copybutton-downloadbutton-and-filedropzone-before-building-the-image-tools-category)
  for why these were extracted proactively.
- **Handle invalid input without crashing.** Show an inline error, don't
  throw past a try/catch into an error boundary. See [Error
  handling](standards.md#error-handling).
- **Copy-to-clipboard buttons** should use `CopyButton` above rather than
  reimplementing the checkmark-feedback state.

## 4. Verify locally

Before considering the tool done:

1. `npx tsc -b` -- zero errors.
2. `npm run build` -- confirm the tool gets its own lazy chunk in the build
   output (`dist/assets/<slug>-*.js`), confirm `generate-seo.ts` picked it
   up (sitemap tool count increments).
3. Load `/tools/<slug>` in a browser: confirm the tool renders, the
   breadcrumb shows the right category, features/FAQ render, and related
   tools shows sensible suggestions.
4. Exercise the tool's actual functionality end-to-end (not just that it
   renders) -- type real input, click every button, confirm the output is
   correct. See [testing.md](../testing/testing.md) for the full
   pre-completion checklist, including the Chrome DevTools MCP
   verification pass (console errors, accessibility snapshot, Lighthouse).

## 5. Adding a new category

Only needed if no existing category in
[`src/lib/categories.ts`](../../src/lib/categories.ts) fits. Add an entry
with `slug`, `title`, `description`, and a `lucide-react` `icon`. This is
the one piece of tool-related configuration that is still hand-maintained
(see [ARCHITECTURE.md §13](../architecture/ARCHITECTURE.md#13-scalability-notes-for-500-tools))
-- do not create a category for a single tool; prefer fitting into an
existing category unless a genuinely distinct cluster of tools justifies a
new one.

## Browser-first philosophy

Prefer native browser APIs over adding a dependency, and prefer a
dependency over building something a browser API already does well. See
[ARCHITECTURE.md §10](../architecture/ARCHITECTURE.md#10-browser-apis-currently-in-use)
for the full, current list of what's actually in use and where. Highlights:

- **Canvas API** -- the entire Image Tools category (`lib/image.ts`):
  compression, resizing, cropping, format conversion. Re-encoding through
  canvas also strips EXIF as a side effect, which is what EXIF Remover
  relies on.
- **File API** -- reading user-selected files without upload, via the
  shared `FileDropZone` component.
- **Web Crypto API** (`crypto.subtle.digest`, `crypto.getRandomValues`,
  `crypto.randomUUID`) -- hashing and secure random generation. Never a
  hand-rolled crypto implementation, and never `Math.random()` for
  anything that needs to be unguessable.
- **`getUserMedia`** -- QR Code Scanner's live camera capture.
- **Compression Streams API** -- not yet used; candidate for a future
  gzip/deflate tool.
- **Web Workers** -- not yet used; candidate for moving genuinely heavy
  computation (large batch image processing) off the main thread once a
  tool needs it.
- **File System Access API** -- not yet used; candidate for save-to-disk
  flows that outgrow the current `<a download>` (`lib/download.ts`)
  approach.

Two tools in the catalog are justified exceptions where no browser API
exists at all: QR Code Generator/Scanner (`qrcode`, `jsQR`) and Markdown
Preview (`marked`, `dompurify`) -- see [decisions.md ADR-011 and
ADR-012](../architecture/decisions.md#adr-011-qrcode-and-jsqr-for-qr-code-generatorscanner)
for the reasoning. Treat these as the bar for "browser API cannot
reasonably solve this," not as precedent for reaching for a library
whenever one is convenient.

Consult [Context7](../mcp/mcp-usage.md#context7) for current browser API
documentation before implementing against one you haven't used in this
codebase yet -- API shapes and browser support change.

## SEO checklist per tool

Handled automatically once `meta.ts` is filled in correctly: canonical URL,
Open Graph/Twitter tags, `WebApplication` + `BreadcrumbList` +
(conditionally) `FAQPage` JSON-LD, sitemap entry, breadcrumb links,
related-tools internal links. Full detail:
[seo-standards.md](../seo/seo-standards.md). Your only job is to make sure
`title`, `description`, `keywords`, and `faqs` are genuinely specific to
this tool -- duplicate or generic copy across tools is the one thing the
automatic system cannot fix for you.
