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

---

## ADR-014: GitHub Actions CI/CD with `cloudflare/wrangler-action` for deployment

Date: 2026-07-08

**Decision:** Full CI/CD via GitHub Actions (`ci.yml`, `cd.yml`,
`pr-validation.yml`, `codeql.yml`, `dependabot.yml`). Deployment to
Cloudflare Pages runs from `cd.yml` using Cloudflare's own
`cloudflare/wrangler-action` (`wrangler pages deploy`), triggered on push
to `main` and gated on the full `ci.yml` check suite passing first
(`cd.yml`'s `deploy` job declares `needs: [ci]`, where `ci` runs `ci.yml`
as a reusable workflow via `uses:`).

**Reasoning:** GitHub Actions is the natural choice given the repository
is hosted on GitHub and the project has no existing CI provider. For
deployment specifically, Cloudflare Pages offers two paths: its
dashboard's native Git integration (Cloudflare's infrastructure builds
directly from a connected GitHub App installation) or a CI-driven deploy
via Wrangler. The dashboard integration requires a one-time interactive
OAuth authorization to install Cloudflare's GitHub App on the repository,
which cannot be completed from an unattended/headless setup process.
`wrangler-action` is Cloudflare's own official action, requires only an
API token and account ID (both stored as GitHub Actions secrets, never
committed), and keeps the deploy step visible as an ordinary, auditable CI
job rather than a parallel process living entirely outside GitHub Actions.
Full detail: [ci-cd/ci-cd.md](../ci-cd/ci-cd.md).

**Alternatives considered:** Cloudflare Pages dashboard Git integration --
rejected for now per the OAuth/headless-setup constraint above; revisit if
someone completes that one-time interactive step later; the `deploy` job
in `cd.yml` should be removed in the same change to avoid double-deploying
if that happens. GitHub Pages -- rejected, no first-class support for SPA
client-side routing fallback without extra configuration, and no
preview-deployment story as clean as Cloudflare Pages'. Vercel/Netlify --
rejected, no reason to introduce a second hosting provider relationship
when Cloudflare already hosts this account's other projects and owns the
`spacesdrive.cc` DNS zone the production domain (`shadyshard.spacesdrive.cc`)
lives under.

**Trade-offs:** The deploy job rebuilds the project from source rather
than reusing a build artifact from an earlier CI job -- accepted because
this project's build is sub-second (Vite on Rolldown), making artifact
passing between jobs pure complexity with no measurable time benefit.
Revisit if the build ever becomes slow enough that rebuilding per job
matters.

---

## ADR-015: Vitest + React Testing Library + Playwright, with intentionally shallow per-tool coverage

Date: 2026-07-08

**Decision:** Vitest (unit + component tests, jsdom environment) and
Playwright (end-to-end, real browsers) are the test stack. Coverage
targets shared infrastructure (the tool registry, `CopyButton`, and the
crypto/heuristic `lib/` utilities) plus one or two representative tools
per interaction shape, not every tool in the 50-tool catalog individually.

**Reasoning:** The highest-value thing to protect with automated tests is
the tool registry (`lib/tool-registry.ts`) -- a regression there silently
breaks routing, search, sitemap generation, and related-tools linking for
every tool at once, and it's exactly the kind of shared-code change a
human reviewer can miss in a large diff. Per-tool logic, by contrast, is
already covered by the mandatory manual verification step in
[tool-development.md](../engineering/tool-development.md#4-verify-locally)
at the time each tool is built. Writing a dedicated test file for all 50
(and eventually 500) tools would cost roughly one test file per tool
forever, for a failure mode (an isolated bug in one tool's own logic) that
manual verification at build time already catches, while not meaningfully
improving protection against the failure mode that actually matters most
at this scale: a shared-code regression.

**Alternatives considered:** Full per-tool test coverage (a `.test.tsx`
for every tool) -- rejected per the cost/benefit reasoning above; revisit
if a pattern of untested-tool regressions actually starts occurring.
Cypress instead of Playwright -- rejected, Playwright's built-in
multi-browser project support (`chromium`/`firefox`/`webkit`/mobile
emulation) and `@axe-core/playwright` integration fit this project's
"browser compatibility" and "accessibility" requirements more directly
without extra plugins. Jest instead of Vitest -- rejected, the project
already runs on Vite; Vitest shares its config/transform pipeline
(`vite.config.ts`'s plugins apply directly) instead of needing a separate
Babel/ts-jest transform setup.

**Trade-offs:** A bug isolated entirely within one tool's own rendering
logic, not caught during that tool's own manual verification, will not be
caught by the automated suite either. This is an accepted gap, not an
oversight -- see [testing.md § Test coverage
philosophy](../testing/testing.md#test-coverage-philosophy).

---

## ADR-016: Cloudflare R2 credentials provided during CI/CD setup are intentionally unused

Date: 2026-07-08

**Decision:** R2 (S3-compatible object storage) API credentials were made
available while setting up the deployment pipeline. They are not stored as
GitHub secrets, not referenced anywhere in the repository, and nothing in
the CI/CD pipeline or the application uses R2.

**Reasoning:** [ARCHITECTURE.md §1](ARCHITECTURE.md#1-system-summary) and
this project's core product principle are that ShadyShard is 100%
client-side with no remote storage of any kind -- every tool's input and
output stays in the visiting browser, and there is no server component to
store anything on behalf of a user. Introducing R2 for anything (build
artifact caching, asset hosting, upload storage) would create a genuine
architectural exception to that principle for a need the project does not
actually have. Declining unused infrastructure by default, rather than
wiring it in because it happened to be available, keeps the deployed
system's actual capabilities matching its documented ones.

**Alternatives considered:** Using R2 to cache `node_modules` or build
output between CI runs -- rejected, GitHub Actions' own `actions/cache`
already does this without adding a second storage provider or a second set
of credentials to manage and rotate. Using R2 to host Lighthouse CI
reports long-term -- rejected in favor of `treosh/lighthouse-ci-action`'s
built-in `temporaryPublicStorage` option, which needs no credentials at
all and is sufficient for the current need (reviewing a specific run's
report, not maintaining historical trend data).

**Trade-offs:** None currently -- this is a decision not to add
complexity, not a constraint that costs anything today. If a genuine
future need for object storage arises (e.g. long-term Lighthouse trend
data, if that ever becomes valuable enough to justify), reconsider with a
new ADR rather than quietly wiring the existing credentials in without
one.

---

## ADR-017: IITM BS Student Tools as a new category, with shared reference data and persistence

Date: 2026-07-09

**Decision:** Added a `student` category with ten IITM BS planning tools
(CGPA Calculator, GPA Goal Calculator, Credit Calculator, Degree Progress
Tracker, Semester Planner, Graduation Estimator, Weekly Study Planner, Exam
Countdown Planner, Course Prerequisite Visualizer, Semester Workload
Estimator). Before building the individual tools, extracted two shared
pieces of infrastructure: `lib/iitm-bs.ts` (the IIT Madras grade-point
scale, default per-level credit targets, and the shared unofficial-tool
disclaimer text) and `hooks/use-local-storage-state.ts` (a generic
localStorage-backed `useState` replacement). `components/tool/UnofficialToolNotice.tsx`
renders the shared disclaimer banner used by every tool in the category.

**Reasoning:** All ten tools independently need at least one of: the IIT
Madras grade scale, a program-level credit target, or a persisted
user-entered list (courses, exams, a weekly grid). Extracting these once,
before writing the first tool, avoids ten near-identical copies of the same
grade-point lookup and the same localStorage read/write boilerplate --
directly following [engineering/standards.md](../engineering/standards.md)'s
guidance to create a reusable abstraction when a genuine cross-cutting need
is visible up front, rather than after duplicating it three times.
Curriculum-specific numbers (credit targets, grade points) are published by
IIT Madras but vary by specialization and program revision, and this
project has no way to verify them live -- every such value is exposed as an
editable default (a plain, persisted number/text input) rather than a
hard-coded constant, and every tool carries the shared disclaimer stating
it is unofficial and that users should confirm against the current IITM BS
portal. Prerequisite data specifically (Course Prerequisite Visualizer) is
never pre-filled with invented course relationships, since no reliably
verifiable public source for IITM BS's exact prerequisite graph exists --
the tool is a general-purpose dependency-order calculator the student
populates themselves.

**Alternatives considered:** Hard-coding the grade scale and credit targets
as fixed constants -- rejected, since a fixed number presented as fact when
it cannot be verified against the current official document would be
actively misleading, worse than an editable default. A single combined
"IITM BS Planner" mega-tool covering CGPA, credits, and scheduling in one
page -- rejected as inconsistent with the one-tool-one-job pattern every
other category follows, and worse for SEO (one generic page competing for
many distinct search intents instead of ten specific ones). A shared
generic `ListEditor` component for the add/remove-row UI pattern common to
several of these tools -- rejected per
[standards.md § Component conventions](../engineering/standards.md#component-conventions):
each tool's rows differ enough in shape (course+credits+grade vs.
course+date vs. a 7-day hours grid) that a generic component would need
enough configuration props to defeat the purpose; a few similar lines
repeated per tool was judged better than a premature abstraction.

**Trade-offs:** The category's numeric defaults (grade points, credit
targets) will drift from official IITM BS documents over time as the
program evolves, since nothing in this codebase re-fetches them -- this is
accepted because every value is user-editable and the disclaimer makes the
unofficial, point-in-time nature explicit rather than implying live
accuracy. No dedicated unit tests were added for the ten tools' calculation
logic, consistent with this project's existing test coverage philosophy
(see [testing.md § Test coverage philosophy](../testing/testing.md#test-coverage-philosophy));
the shared `lib/iitm-bs.ts` and `use-local-storage-state.ts` are exercised
indirectly through the tool registry's existing invariant tests (unique
slugs/descriptions, every tool resolving to a real category).

---

## ADR-018: `color-scheme` CSS property added alongside `.dark` token overrides

Date: 2026-07-09

**Decision:** Added `color-scheme: light` to `:root` and `color-scheme: dark`
to `.dark` in `src/index.css`. Also replaced two raw `<select>` elements
(IITM BS CGPA Calculator's grade dropdown, Course Prerequisite Visualizer's
multi-select) with the shadcn `Select` primitive (`components/ui/select.tsx`,
newly added via the shadcn MCP) and a `Checkbox` list, respectively.

**Reasoning:** A user reported the CGPA Calculator's grade dropdown was
unreadable in dark mode -- white background, low-contrast text. Root cause:
a raw `<select>` element can have its closed trigger styled with Tailwind
classes, but the browser renders the open options popup itself using native
chrome, which follows the OS/browser `prefers-color-scheme` rather than this
app's own `.dark` class toggle. The same root cause affects every other
browser-native form control popup this project might use (`<input
type="date">`'s calendar, `<input type="number">`'s spinner arrows,
scrollbars). Fixing only the one reported dropdown would have left the same
class of bug live in `<input type="date">` (already in use in the Exam
Countdown Planner) and in effect for any future raw native form control.
Two fixes were needed together: use the themed `Select` primitive
(portal-rendered, uses `popover`/`popover-foreground` tokens, so it's
already correct in both themes) wherever a `<select>`-shaped control is
needed, per [standards.md's existing "don't hand-build a form control from
scratch" rule](../ui/design-system.md#component-consistency-checklist) --
that rule already existed before this bug, this was a violation of it, not
a gap in it. `color-scheme` is the fix for the remaining native controls
that have no themed shadcn equivalent.

**Alternatives considered:** Styling only the reported `<select>` with more
specific CSS -- rejected, cannot override native popup rendering with CSS
alone in any browser. Building a custom themed date picker to replace
`<input type="date">` -- rejected as disproportionate to the actual need;
`color-scheme` fixes the native picker's theme with one line and no new
component, and a custom calendar widget is unjustified complexity unless a
tool needs date-picking behavior beyond what the native control offers.

**Trade-offs:** `color-scheme` affects browser-rendered chrome only
(scrollbar color, form control popups) -- it cannot be styled further with
Tailwind, so a highly custom-branded date picker or scrollbar is still out
of reach if ever desired; that's an intentional, currently-unneeded
trade-off in favor of not maintaining a hand-built replacement for browser
functionality that already works correctly once themed.

---

## ADR-019: pdf-lib, pdfjs-dist, js-yaml, and Turndown for the PDF & Document Tools category

Date: 2026-07-09

**Decision:** Added four dependencies to build the 33-tool PDF & Document
Tools batch (15 PDF tools, 10 document format converters, 3 encoding
tools, 5 file-inspection tools): `pdf-lib` (creating, merging, splitting,
rotating, reordering, and editing PDF pages and metadata), `pdfjs-dist`
(rendering PDF pages to canvas/PNG and extracting text -- the same engine
behind Firefox's built-in PDF viewer), `js-yaml` (YAML parse/dump), and
`turndown` (HTML-to-Markdown conversion). Every other tool in the batch
(CSV/TSV, XML/JSON, hex, binary, URL parsing, file hashing/signature
inspection) uses only native browser APIs (`DOMParser`/`XMLSerializer`,
`TextEncoder`/`TextDecoder`, `crypto.subtle`, the File API) plus small
hand-rolled parsers (`lib/csv.ts`, `lib/page-range.ts`,
`lib/file-signatures.ts`) rather than a dependency.

**Reasoning:** PDF creation/editing and PDF rendering have no browser-native
API at all -- there is no way to merge two PDFs, rotate a page, or rasterize
a page to an image using only what the browser ships, which is exactly the
bar [tool-development.md's browser-first
philosophy](../engineering/tool-development.md#browser-first-philosophy)
sets for reaching past a browser API to a dependency (the same bar that
justified `qrcode`/`jsQR` in ADR-011 and `marked`/`dompurify` in ADR-012).
`pdf-lib` and `pdfjs-dist` are the de facto standard pure-JS libraries for
these two problems respectively (creation/editing vs. rendering/parsing),
both are actively maintained, and using two purpose-built libraries rather
than one library asked to do both keeps each tool's actual dependency
surface smaller than a single do-everything PDF library would. `js-yaml`
and `turndown` follow the same reasoning at smaller scale: YAML's
indentation-sensitive grammar and Markdown-from-HTML's many edge cases
(nested lists, code fences, tables) are exactly the kind of "small feature
set, large edge-case surface" problem [engineering/standards.md](../engineering/standards.md)
already treats as a case for a well-established library over a hand-rolled
parser -- unlike CSV, which this project's own `lib/csv.ts` shows is small
and stable enough to hand-roll without meaningfully more risk than a
dependency.

**Alternatives considered:** A single combined PDF library instead of
splitting `pdf-lib` (editing) and `pdfjs-dist` (rendering) -- rejected;
`pdfjs-dist` has no PDF-writing capability and `pdf-lib` has no
rendering/rasterization capability, so one library could not have covered
both halves of the category regardless. Hand-rolling a YAML parser --
rejected, YAML's grammar (flow vs. block styles, anchors, multi-document
markers, type coercion rules) is materially more complex than CSV's, and a
subtly incorrect hand-rolled parser would silently mis-convert valid YAML
rather than failing loudly. `pdfjs-dist`'s worker loaded from a CDN
(matching several of its own official examples) -- rejected in favor of
bundling it as a local asset via Vite's `?url` import
(`lib/pdf-render.ts`), keeping this category consistent with the rest of
the app's zero-external-request posture.

**Trade-offs:** `pdf-lib` and `pdfjs-dist` together produce two lazy
vendor chunks named `pdf-*` by Rolldown (~171 KB and ~123 KB gzip
respectively, budgeted at 200 KB each in `scripts/check-bundle-size.ts`),
downloaded only when a visitor opens a PDF tool, never as part of the main
bundle -- acceptable given they're genuinely necessary for that category
and irrelevant to every other tool's load time. PDF Compressor's real
limitation (it compacts internal PDF structure via `useObjectStreams` but
cannot re-encode or downsample embedded images, since neither `pdf-lib`
nor a browser API supports that) and PDF Password Checker's real
limitation (it can detect encryption but cannot verify or remove a
password, since `pdf-lib` cannot decrypt a PDF at all) are both documented
directly in those tools' `meta.ts` descriptions and FAQs rather than
silently omitted or half-implemented, per this task's requirement to
document a browser limitation rather than work around it with a backend.
