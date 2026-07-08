# Testing

## Automated test suite

Three layers, all run in CI on every push and PR (see
[ci-cd/ci-cd.md](../ci-cd/ci-cd.md#ci-workflow-ciyml)) and enforced locally
by the pre-commit hook (typecheck) and available via `npm test`/
`npm run test:e2e`:

- **Unit tests** (`src/**/*.test.ts`, `vitest run`) -- pure logic with no
  DOM. `lib/tool-registry.test.ts` is the most valuable test in the suite:
  it asserts registry invariants (unique slugs, unique descriptions, every
  tool resolves to a real category, every `relatedTools` override points
  at a real slug) that protect the tool-registry abstraction the "500+
  tools" scalability story depends on. `lib/secure-random.test.ts` and
  `lib/password-strength.test.ts` cover the two shared crypto/heuristic
  utilities.
- **Component tests** (`src/**/*.test.tsx`, Vitest + React Testing
  Library) -- render a component and interact with it via
  `@testing-library/user-event`, asserting on rendered output and
  accessible roles rather than implementation details.
  `components/tool/CopyButton.test.tsx` and
  `tools/word-counter/index.test.tsx` are the reference examples.
- **End-to-end tests** (`e2e/*.spec.ts`, Playwright, run against a real
  production build via `playwright.config.ts`'s `webServer`) --
  `navigation.spec.ts`, `search.spec.ts`, `tool-functionality.spec.ts`,
  `accessibility.spec.ts` (axe-core, asserts zero serious/critical WCAG
  violations on a representative page set), `console.spec.ts` (asserts
  zero console/page errors on the same set). Runs across four Playwright
  projects: `chromium`, `firefox`, `webkit`, `mobile-chrome`.

This intentionally does not cover every one of the 50 tools individually
-- see [Test coverage philosophy](#test-coverage-philosophy). It
complements, rather than replaces, the manual
[Chrome DevTools verification](#chrome-devtools-verification) process
below: the automated suite is the regression safety net for shared
infrastructure; DevTools MCP verification is how a specific tool actually
gets exercised and confirmed correct while it's being built.

### Test coverage philosophy

Write a test for shared infrastructure (the registry, `CopyButton`,
`DownloadButton`, `FileDropZone`, `lib/` utilities used by multiple tools)
and for one or two representative tools per major interaction shape (a
live-transform text tool, a form-validation tool), not for every tool
individually. A bug in one tool's own logic is caught by manually
exercising that tool during its own development (the
[Verify locally](../engineering/tool-development.md#4-verify-locally) step
in tool-development.md already requires this); a bug in the shared
registry or a shared component silently breaks many tools at once, which
is exactly what automated tests are for. Do not add a dedicated test file
for every new tool as a matter of course -- that scales linearly with tool
count for very little incremental protection.

### Running tests locally

| Command                 | Does                                                            |
| ----------------------- | --------------------------------------------------------------- |
| `npm test`              | Runs the Vitest suite once (`vitest run`).                      |
| `npm run test:watch`    | Vitest in watch mode.                                           |
| `npm run test:coverage` | Vitest with a v8 coverage report (`coverage/`).                 |
| `npm run test:e2e`      | Full Playwright suite; builds and serves automatically.         |
| `npm run test:e2e:ui`   | Playwright's interactive UI mode, for debugging a failing spec. |

## Pre-completion checklist

Before considering any change complete:

1. **`npx tsc -b`** -- zero TypeScript errors.
2. **`npm run build`** -- succeeds, including the `prebuild` SEO generation
   step. Check the chunk size report for anything unexpectedly large (see
   [performance.md](../performance/performance.md#vendor-chunking)), or
   run `npm run size` for an explicit pass/fail against budget.
3. **`npm test`** -- the Vitest suite passes. Add a test per
   [Test coverage philosophy](#test-coverage-philosophy) if the change
   touches shared infrastructure.
4. **No console errors or warnings** in the browser for any page touched by
   the change (see [Chrome DevTools
   verification](#chrome-devtools-verification) below, or
   `e2e/console.spec.ts` for the automated equivalent).
5. **Responsive check** at a mobile viewport (390×844 used historically)
   for any UI change.
6. **Accessibility check** -- accessibility tree snapshot reviewed, no
   missing labels/landmarks; see
   [accessibility.md](../accessibility/accessibility.md). `npm run test:e2e`
   includes an automated axe-core pass over a representative page set.
7. **SEO check** for any new page or tool -- unique title/description,
   structured data present, sitemap entry generated; see
   [seo-standards.md](../seo/seo-standards.md). `npm run validate:metadata`
   and `npm run validate:sitemap` check this automatically.
8. **Functional check** -- actually exercise the feature (type real input
   into a tool, click every button, follow every link) rather than
   confirming it merely renders. A component that renders without error can
   still be functionally broken; only interacting with it proves it works.
9. **Documentation check** -- see [Documentation
   Maintenance](../index.md#documentation-maintenance): does this change
   require updating `ARCHITECTURE.md`, a decision log entry, or any other
   doc?

A task is not done until all of the above pass, not just until the code
compiles. Pushing runs the same checks (plus the full cross-browser
Playwright matrix and a Lighthouse CI gate) automatically in
[CI](../ci-cd/ci-cd.md#ci-workflow-ciyml) -- treat a red CI run the same as
a locally failing check, not something to merge past.

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

A change is verified, not just built, when: it typechecks, it builds, the
automated test suite passes, it renders without console errors, its
accessibility tree is clean, it works when actually interacted with (not
just rendered), and, for anything SEO/performance-relevant, Lighthouse
confirms no regression against the baseline in
[performance.md](../performance/performance.md#baseline). For a change
that's about to be pushed, "done" also means CI is green -- see
[ci-cd/ci-cd.md](../ci-cd/ci-cd.md).
