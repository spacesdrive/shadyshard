# Architecture Decision Log

A chronological record of significant architectural decisions: what was
decided, why, what else was considered, and the trade-off accepted. This is
an append-only log -- when a past decision is reversed, add a new entry that
supersedes it rather than editing history.

Add an entry here whenever a change to
[ARCHITECTURE.md](ARCHITECTURE.md) is significant enough that a future
maintainer would reasonably ask "why was it built this way?"

Entry format:

```
## ADR-NNN: Title

Date: YYYY-MM-DD

Decision: what was chosen.
Reasoning: why.
Alternatives considered: what else, and why not.
Trade-offs: what this costs.
```

---

## ADR-001: Vite + React 19 + TypeScript as the base stack

Date: 2026-07-08

**Decision:** Vite (not Next.js/Remix/CRA), React 19, TypeScript, deployed as
a static SPA to Cloudflare Pages.

**Reasoning:** The product requirement is "no server processing, no
accounts, everything client-side." A meta-framework's server capabilities
(SSR, API routes, server actions) would be entirely unused dead weight.
Vite gives the fastest dev loop and the simplest static-output build for a
pure-client app.

**Alternatives considered:** Next.js (static export mode) -- rejected, adds
framework conventions and a heavier abstraction for zero server benefit
here. Astro -- rejected, its island-architecture strength is mixed
content/interactivity sites; this app is uniformly a client-rendered
utility app.

**Trade-offs:** No built-in SSR means no server-rendered HTML for crawlers
that don't execute JavaScript. Mitigated by strong client-side SEO metadata
(react-helmet-async) and a static sitemap; acceptable because target search
engines execute JS. Revisit if analytics ever show meaningful non-JS
crawler traffic loss.

---

## ADR-002: shadcn/ui on Base UI (`base-nova` style), not Radix

Date: 2026-07-08

**Decision:** Use shadcn/ui's `base-nova` style, built on `@base-ui/react`.

**Reasoning:** This was the current default when the project was
initialized via the shadcn CLI (`npx shadcn@latest init`). Base UI is
maintained by the same team that built Radix and Floating UI, has first-
class Tailwind v4 support, and is the direction shadcn is standardizing on.

**Alternatives considered:** shadcn's `new-york`/Radix-based style --
functionally similar, but not what `init -d` produced; switching later
would mean regenerating every `components/ui/*` file.

**Trade-offs:** Base UI composes via a `render` prop
(`<Button render={<Link to="/" />} />`), not Radix's `asChild`. This is a
real gotcha discovered during initial build-out (see
[ui/design-system.md](../ui/design-system.md#composition-render-not-aschild))
-- every `asChild` pattern copied from Radix-era shadcn examples or AI
training data will fail to typecheck and must be rewritten.

---

## ADR-003: React Router v7 in Data Mode, not Framework Mode

Date: 2026-07-08

**Decision:** `createBrowserRouter` + `RouterProvider` from `react-router`
core, not the React Router Vite plugin / Framework Mode.

**Reasoning:** Framework Mode adds file-based routing conventions, a Vite
plugin, and type-safe route generation intended for apps that may add SSR
or server loaders later. This app has no server. Data Mode gives the same
`lazy()` per-route code splitting with a plain Vite + React setup.

**Alternatives considered:** Declarative Mode (`<BrowserRouter><Routes>`) --
rejected, no built-in per-route code splitting without manually wrapping
every route element in `React.lazy` + `Suspense`; Data Mode's `lazy()` route
property does this more cleanly. Framework Mode -- rejected per above.

**Trade-offs:** Route modules must export a named `Component`, not
`default`; pages in this repo intentionally use `export default` for
consistency with every other component in the codebase, so `router.tsx`
carries a small `page()` adapter to bridge the two. See
[ARCHITECTURE.md §4](ARCHITECTURE.md#4-routing).

---

## ADR-004: `import.meta.glob`-based tool registry, not manual registration

Date: 2026-07-08

**Decision:** Tools are discovered automatically by scanning
`src/tools/*/{meta.ts,index.tsx}` with `import.meta.glob` at build time; no
central "list of tools" file is hand-maintained.

**Reasoning:** This is the single decision that makes the "500+ tools"
target tractable. A hand-maintained registry file becomes a merge-conflict
hotspot and a step contributors forget. Convention-over-configuration
(folder name = slug) removes an entire class of registration bugs.

**Alternatives considered:** A `tools/index.ts` barrel file re-exporting
every tool -- rejected, doesn't scale past a few dozen entries and
guarantees merge conflicts when multiple tools are added in parallel.
Codegen step that writes a registry file -- rejected as unnecessary
complexity; `import.meta.glob` already does this at zero cost, natively in
Vite.

**Trade-offs:** Slug is derived from the folder name via regex path
parsing (`src/lib/tool-registry.ts`), which throws a build-time error on
mismatch rather than a type error -- acceptable since it fails loudly and
immediately, not silently at runtime.

---

## ADR-005: Client-side Fuse.js search, no external search service

Date: 2026-07-08

**Decision:** Search runs entirely in the browser against an in-memory
`Fuse.js` index built from the tool registry.

**Reasoning:** Consistent with the "no server processing" product
requirement, and at a catalog size of hundreds of tools, a client-side
fuzzy index is fast enough that there is no latency argument for a hosted
search service.

**Alternatives considered:** Algolia/Typesense-style hosted search --
rejected, requires a paid external service and an API call, both of which
conflict with the privacy-first, server-free product principle for
something this small.

**Trade-offs:** Every visitor downloads the full tool metadata + Fuse.js
(~9 KB gzipped as of the 3-tool baseline; grows with catalog size). Revisit
if the catalog grows an order of magnitude beyond "hundreds" and this
becomes a meaningfully sized payload -- see
[ARCHITECTURE.md §13](ARCHITECTURE.md#13-scalability-notes-for-500-tools).

---

## ADR-006: Sitemap/robots.txt/llms.txt generated as static files pre-build

Date: 2026-07-08

**Decision:** `scripts/generate-seo.ts` runs as the `prebuild` npm script,
dynamically importing every tool's `meta.ts` and writing
`public/sitemap.xml` and `public/robots.txt` before `vite build` runs.
`public/llms.txt` is hand-authored prose, regenerated only when site-level
copy changes.

**Reasoning:** There is no server to generate these at request time. Static
generation at build time is the only option for a static-hosted SPA, and it
guarantees the sitemap is never stale relative to the currently deployed
tool set.

**Alternatives considered:** Committing a hand-maintained sitemap.xml --
rejected, guaranteed to drift as tools are added. A Vite plugin hook
instead of a separate script -- considered equivalent in principle;
`tsx scripts/generate-seo.ts` was chosen for being a plain, debuggable Node
script rather than coupling sitemap generation to Vite's plugin lifecycle.

**Trade-offs:** Requires `tsx` as a dev dependency solely to run one
TypeScript script outside Vite's transform pipeline. Acceptable given how
small and self-contained the script is.

---

## ADR-007: Manual vendor chunk splitting via `rolldownOptions.output.manualChunks`

Date: 2026-07-08

**Decision:** `vite.config.ts` explicitly splits `vendor-react`,
`vendor-router`, `vendor-ui`, `vendor-motion`, `vendor-search` into separate
chunks from the app entry and from lazy-loaded route/tool chunks.

**Reasoning:** Without explicit splitting, the default single-vendor chunk
exceeded Vite's 500 KB warning threshold (532 KB pre-split). Splitting by
library domain lets browsers cache framework code independently from
UI-library code, and keeps any single chunk comfortably under the warning
threshold (largest post-split chunk: `vendor-react` at 337 KB / 108 KB
gzip).

**Alternatives considered:** Raising `build.chunkSizeWarningLimit` to
silence the warning -- rejected, treats the symptom, not the cause, and
does nothing for actual cache-efficiency or parse cost.

**Trade-offs:** The `manualChunks` split is a static rule (regex on
`node_modules` path), so it needs occasional revisiting as dependencies are
added or removed. It is Vite 8/Rolldown-specific
(`build.rolldownOptions.output.manualChunks`), not the Rollup-era
`build.rollupOptions.output.manualChunks` object form -- do not copy Rollup
-era examples verbatim.

---

## ADR-008: Dark-mode-first with class-based toggling and an inline anti-FOUC script

Date: 2026-07-08

**Decision:** Theme is applied via a `.dark` class on `<html>`, default
theme is dark, and an inline `<script>` in `index.html` (not a React
effect) sets the class before first paint, reading the same
`localStorage["shadyshard-theme"]` key that `ThemeProvider` later manages.

**Reasoning:** Product requirement is "dark mode first, light mode
supported." A React-effect-only approach would flash the wrong theme on
load, since React doesn't run until after the initial HTML paint.

**Alternatives considered:** `prefers-color-scheme` media-query-only
(no toggle) -- rejected, product requires an explicit user-facing toggle
with a "system" option, not just OS-level detection.

**Trade-offs:** The theme-detection logic exists in two places (the inline
script in `index.html` and `ThemeProvider` in
`src/hooks/use-theme.tsx`) and must be kept in sync manually if the storage
key or resolution logic changes.

---

## ADR-009: Entropy-heuristic password strength, not a dictionary-based estimator

Date: 2026-07-08

**Decision:** Password Generator and Password Strength Checker share a
single estimator (`lib/password-strength.ts`) that scores strength from
entropy (password length times the size of the character pool in use),
bucketed into a 0-4 score, rather than a dictionary/pattern-based
estimator like `zxcvbn`.

**Reasoning:** `zxcvbn` and similar libraries ship large bundled
dictionaries (zxcvbn's full package is several hundred KB) to detect
common passwords, keyboard patterns, and known breaches. That cost is hard
to justify for two small utility tools in a bundle-conscious app that
otherwise keeps every tool's chunk under 4 KB. An entropy-band heuristic
requires no data file, runs in a few lines, and gives a reasonable,
honestly-labeled estimate of brute-force resistance.

**Alternatives considered:** `zxcvbn` / `zxcvbn-ts` -- rejected on bundle
size grounds per above. A hand-rolled common-password blocklist -- rejected
as a half-measure that would need ongoing maintenance to stay useful
without providing the class of protection a real dictionary check does.

**Trade-offs:** This estimator does not detect that `"password123!"` is a
commonly breached password despite technically satisfying every character-
class criterion -- it only measures theoretical entropy, not real-world
guessability. Both tools' FAQs and the estimator's own doc comment say this
explicitly so the limitation isn't silently misleading. Revisit if a future
tool's requirements justify the dictionary-size cost.

---

## ADR-010: Fixed a labeling defect in the vendored `Slider` primitive

Date: 2026-07-08

**Decision:** `components/ui/slider.tsx` (shadcn-generated) was patched to
accept an `aria-label` prop and forward it to the rendered `Slider.Thumb`,
rather than leaving it unresolvable.

**Reasoning:** Base UI's accessible-labeling pattern for a single-thumb
slider is `aria-label` on `Slider.Thumb`, not on `Slider.Root` -- but the
generated wrapper only exposed a single composed `Slider` component with no
way to reach the internal `Thumb`. The first attempt to label a slider used
`<Label htmlFor="...">` pointing at an `id` passed to `Slider`, which
Lighthouse correctly flagged as "Incorrect use of `<label for>`" (the
Slider Root isn't a labelable form element). Removing `htmlFor` entirely
without a replacement then produced an orphaned, unassociated `<label>`
Lighthouse flagged separately ("No label associated with a form field").
The only correct fix was accessible labeling at the actual interactive
element, which required a small, targeted change to the generated
primitive itself.

**Alternatives considered:** Leaving the defect and using only a visual
label next to the slider with no programmatic association -- rejected,
fails the same accessibility bar every other control in the app meets, and
[accessibility.md](../accessibility/accessibility.md) targets Lighthouse
Accessibility 100 with zero failed audits, not "visually labeled."

**Trade-offs:** This is a deviation from "treat `components/ui/` as
vendored, don't fork it" (see
[standards.md](../engineering/standards.md#component-conventions)) --
justified here because it's a genuine upstream-shaped accessibility bug in
the generated output, not a style preference, and the fix is minimal (one
destructured prop, forwarded to the correct element). If shadcn's `Slider`
generator is updated upstream to handle this correctly, regenerating the
component and reverting this patch is preferable to keeping the manual
patch indefinitely.

---

## ADR-011: `qrcode` and `jsQR` for QR Code Generator/Scanner

Date: 2026-07-08

**Decision:** QR Code Generator uses the `qrcode` npm package
(`QRCode.toCanvas`); QR Code Scanner uses `jsQR` to decode a `canvas`
`ImageData` frame, either from an uploaded image or from
`navigator.mediaDevices.getUserMedia` camera frames sampled via
`requestAnimationFrame`.

**Reasoning:** No browser API generates or decodes QR codes -- this is the
one category of tool in the catalog where the [browser-first
policy](../engineering/tool-development.md#browser-first-philosophy)'s
escape hatch ("only use a lightweight client-side library when browser
APIs cannot reasonably solve the problem") genuinely applies. Both
libraries are small, dependency-free, and widely used; `jsQR` in
particular has a stable, unchanged-for-years single-function API.

**Alternatives considered:** Chrome's experimental `BarcodeDetector` API --
rejected, not available in all browsers this project targets (no graceful
feature-detection fallback would cover Firefox/Safari), so it can't be the
only implementation; `jsQR` works everywhere `getUserMedia` and `canvas`
do. A server-side QR service -- rejected outright, violates the no-backend
product principle.

**Trade-offs:** `jsQR` is the single largest per-tool chunk in the catalog
(132.69 KB / 48.90 KB gzip, see
[performance.md](../performance/performance.md#baseline)) -- acceptable
because it's isolated to the one tool that needs it and never loaded
elsewhere, but worth knowing if that tool's load time is ever questioned.

---

## ADR-012: `marked` and `dompurify` for Markdown Preview

Date: 2026-07-08

**Decision:** Markdown Preview parses Markdown with `marked.parse()` and
sanitizes the resulting HTML with `DOMPurify.sanitize()` before rendering
it via `dangerouslySetInnerHTML`.

**Reasoning:** No browser API parses Markdown -- another genuine exception
to browser-first. `marked` is a small, fast, dependency-free compiler.
Sanitization is not optional here: Markdown compiles to arbitrary HTML,
and rendering unsanitized HTML from user input via
`dangerouslySetInnerHTML` is a direct XSS vector. `DOMPurify` is the
standard, well-audited choice for this specific job.

**Alternatives considered:** Hand-rolling a minimal Markdown subset parser
to avoid a dependency -- rejected, Markdown's edge cases (nested lists,
inline code containing backticks, link reference definitions) are exactly
the kind of thing worth using a mature, tested library for rather than
reimplementing. Skipping sanitization on the theory that "it's the user's
own input, only they see it" -- rejected outright as unsafe by default; a
tool that renders arbitrary HTML must sanitize regardless of who's typing,
since copy-pasted content or saved/shared Markdown is a realistic path for
someone else's input to reach this renderer.

**Trade-offs:** `marked` + `dompurify` together add up to 69.33 KB / 23.30
KB gzip, the second-largest per-tool chunk after `jsQR` -- again isolated
to the one tool via the registry's per-tool lazy loading, so this doesn't
affect any other page's load time.

---

## ADR-013: Extracted `CopyButton`, `DownloadButton`, and `FileDropZone` before building the Image Tools category

Date: 2026-07-08

**Decision:** Before implementing any of the 10 Image Tools, three shared
components were built first: `components/tool/CopyButton.tsx` (the
copy-with-checkmark-feedback pattern, previously duplicated inline in
8+ tools), `components/tool/DownloadButton.tsx` (wraps
`lib/download.ts`'s `downloadBlob`, supports both sync and async blob
producers), and `components/tool/FileDropZone.tsx` (accessible
drag-and-drop-or-click file input, built once and reused by all 10 Image
Tools plus QR Code Scanner's upload path).

**Reasoning:** [engineering/standards.md](../engineering/standards.md) and
[tool-development.md](../engineering/tool-development.md) both call for
identifying reusable abstractions before, not after, duplicating logic
across many similar tools. Ten image tools each needing drag-and-drop
upload was the clearest case in the catalog so far for extracting a shared
component first rather than copy-pasting a drop-zone implementation ten
times.

**Alternatives considered:** Building each Image tool independently and
extracting shared pieces afterward -- rejected; with 10 near-simultaneous
tools in the same batch, building the shared abstraction first was strictly
less total work than writing and then refactoring ten copies, and
guaranteed consistent drag-and-drop accessibility behavior (keyboard
focus, `aria-label`, the hidden-input-plus-label pattern) across all of
them from the start rather than needing to backport a fix to ten places.

**Trade-offs:** `FileDropZone` intentionally supports only a single
`onFiles(files: File[])` callback shape general enough for every current
Image tool and QR Scanner; a future tool with meaningfully different
upload needs (e.g., chunked/streamed large-file handling) should extend it
carefully rather than fork it, per the same "don't duplicate, improve the
shared abstraction" principle this ADR describes.

