# Testing

## Current state: no automated test suite

Honestly, as of this writing there is no unit/integration/e2e test
framework installed. This is an acceptable trade-off for a small,
hand-verified catalog (see
[ARCHITECTURE.md §13](../architecture/ARCHITECTURE.md#13-scalability-notes-for-500-tools)),
and is not acceptable indefinitely -- it becomes a real liability once
multiple contributors are adding tools in parallel without a shared safety
net. Do not treat this section as permission to skip verification; it means
verification is currently manual and must be done thoroughly every time,
per the checklist below.

If/when a test framework is introduced, this document is where its
conventions get documented, and the "no automated test suite" framing above
must be updated in the same change.

## Pre-completion checklist

Before considering any change complete:

1. **`npx tsc -b`** -- zero TypeScript errors.
2. **`npm run build`** -- succeeds, including the `prebuild` SEO generation
   step. Check the chunk size report for anything unexpectedly large (see
   [performance.md](../performance/performance.md#vendor-chunking)).
3. **No console errors or warnings** in the browser for any page touched by
   the change (see [Chrome DevTools
   verification](#chrome-devtools-verification) below).
4. **Responsive check** at a mobile viewport (390×844 used historically)
   for any UI change.
5. **Accessibility check** -- accessibility tree snapshot reviewed, no
   missing labels/landmarks; see
   [accessibility.md](../accessibility/accessibility.md).
6. **SEO check** for any new page or tool -- unique title/description,
   structured data present, sitemap entry generated; see
   [seo-standards.md](../seo/seo-standards.md).
7. **Functional check** -- actually exercise the feature (type real input
   into a tool, click every button, follow every link) rather than
   confirming it merely renders. A component that renders without error can
   still be functionally broken; only interacting with it proves it works.
8. **Documentation check** -- see [Documentation
   Maintenance](../index.md#documentation-maintenance): does this change
   require updating `ARCHITECTURE.md`, a decision log entry, or any other
   doc?

A task is not done until all of the above pass, not just until the code
compiles.

## Chrome DevTools verification

The concrete, MCP-driven process used to verify every UI change so far.
See [mcp-usage.md § Chrome DevTools](../mcp/mcp-usage.md#chrome-devtools)
for tool-level guidance on when to reach for this.

1. Start (or reuse) a dev server (`npm run dev`) for functional iteration,
   and separately a production build + preview (`npm run build && npm run
preview`) for performance/Lighthouse numbers -- **never** trust
   Lighthouse numbers from the dev server.
2. Navigate to the affected page(s) via `navigate_page`.
3. `list_console_messages` -- must be empty of errors/warnings beyond
   expected dev-mode noise (Vite HMR connect messages, React DevTools
   suggestion). Any real warning (e.g. the `HydrateFallback` warning
   encountered during initial build-out) must be fixed, not ignored.
4. `take_snapshot` (accessibility tree) -- review landmark structure,
   heading levels, labels. Prefer this over a screenshot for structural
   verification; screenshots are for visual layout only.
5. `take_screenshot` -- visual check, including at a mobile
   `resize_page` viewport for responsive changes.
6. For actual interaction testing, use `fill` and `click` against element
   `uid`s from a snapshot -- **do not** simulate input via
   `evaluate_script` dispatching raw DOM events. This was tried during
   initial development and silently failed to update React state (the
   native-setter-plus-dispatchEvent trick did not reliably trigger React's
   synthetic event system in this environment); `fill`/`click` are the
   MCP's purpose-built tools for this and work correctly.
7. For performance/SEO, run `lighthouse_audit` (`mode: navigation`,
   `device: desktop`, then `mobile` if layout-sensitive) against the
   **preview** server. Target: all categories 100, zero failed audits. If
   something scores below 100, read the specific failing audit's detail
   (Lighthouse's JSON report, or the audit description) rather than
   guessing -- e.g. the `heading-order` and form `id`/`name` issues found
   during development were both diagnosed this way, not by inspection.
8. For Core Web Vitals specifically, `performance_start_trace` with
   `reload: true` gives LCP/CLS/render-blocking-request detail beyond what
   the Lighthouse summary score shows.

## What "done" looks like

A change is verified, not just built, when: it typechecks, it builds, it
renders without console errors, its accessibility tree is clean, it works
when actually interacted with (not just rendered), and, for anything
SEO/performance-relevant, Lighthouse confirms no regression against the
baseline in [performance.md](../performance/performance.md#baseline).
