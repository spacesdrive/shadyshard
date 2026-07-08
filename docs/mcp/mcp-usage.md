# MCP Usage

How and when to use each configured MCP server on this project. General
principle: research before implementing, verify after implementing, and
don't reach for a tool when the answer is already in this repo's own
documentation -- check [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
and the relevant domain doc first.

## Context7

**Use for:** current, version-accurate documentation on any library or
browser API this project uses or is about to use -- React, TypeScript,
Vite, React Router, Tailwind CSS, Base UI/shadcn, browser APIs, Cloudflare
Pages, any new npm package.

**When:** before implementing anything involving one of the above, even if
the API seems familiar -- training-data knowledge of fast-moving libraries
(React Router's Data Mode vs. Framework Mode, Tailwind v4's Vite plugin,
Base UI's `render` prop) goes stale quickly and this project has already
been bitten by exactly that (see
[decisions.md ADR-002](../architecture/decisions.md#adr-002-shadcnui-on-base-ui-base-nova-style-not-radix)
and [ADR-003](../architecture/decisions.md#adr-003-react-router-v7-in-data-mode-not-framework-mode)).

**When not:** for general programming concepts, debugging application
logic, or refactoring decisions that aren't about a specific library's API
-- Context7 is for "what is the current correct API," not "how should I
structure this."

**Workflow:** `resolve-library-id` with the library name and a specific
query, then `query-docs` with the resolved ID and the _specific_ question
(not a vague topic) -- see the tool descriptions for the exact pattern.
Prefer the result with higher source reputation and benchmark score when
multiple libraries resolve.

## Parallel Search (web search)

**Use for:** comparing implementation strategies, researching best
practices that span multiple libraries/approaches, validating an SEO or
accessibility recommendation, comparing npm packages before adding a
dependency.

**When not:** when Context7 already answers the question (a specific
library's API) -- don't reach for general web search when the docs tool is
more precise and faster.

**Workflow:** search first, read the returned excerpts, and only fetch a
full page when the excerpts are insufficient or a specific URL/exact
wording is needed. Don't fetch every result by default. Cross-check more
than one source before committing to a "best practice" claim, especially
for anything performance- or security-relevant.

## Sequential Thinking

**Use for:** breaking down a medium-to-large feature before implementing
it -- identifying dependencies between files, identifying which existing
abstraction (registry, `lib/seo.ts`, shadcn primitives) the new feature
should build on rather than duplicate, identifying edge cases, identifying
scalability implications for the 500+ tool target.

**When not:** for small, well-scoped changes (adding a single tool
following the established pattern, a copy fix, a straightforward bug fix)
-- forcing structured thinking onto a trivial task adds overhead without
benefit.

**Workflow:** think through the plan explicitly before writing code, per
[workflow.md § The loop](../workflow/workflow.md#the-loop) step 3. The
output of this thinking should inform the plan, not be presented as a
deliverable in itself.

## Filesystem

**Use for:** file operations when working with the project -- reading,
writing, moving, searching. In practice, prefer the editor-native
Read/Edit/Write/Glob/Grep tools when available, since they're integrated
with the harness's diff/permission UI; reach for the Filesystem MCP
specifically when its capabilities (e.g. structured directory trees, bulk
operations) are a better fit.

**Principle regardless of which tool executes it:** maintain a clean folder
structure per [ARCHITECTURE.md §2](../architecture/ARCHITECTURE.md#2-folder-structure),
avoid duplicate files/utilities/components (check `lib/`, `hooks/`,
`components/ui/` before creating something new), and refactor when moving
files reveals an opportunity to.

## Chrome DevTools

**Use for:** verifying every UI-affecting change before considering it
complete -- console errors, accessibility tree structure, responsive
layout, Lighthouse scores, Core Web Vitals, layout shift.

**When:** after implementing any UI change, always -- this is not optional
tooling, it's the project's actual test suite in the absence of an
automated one (see [testing.md](../testing/testing.md)). Two real bugs
(missing form field `id`/`name` attributes, a heading-order skip) were only
caught this way.

**When not:** for pure logic/non-visual changes with no rendering surface
(e.g. a documentation-only change, a build script fix with no UI impact).

**Workflow:** see the concrete step-by-step in
[testing.md § Chrome DevTools
verification](../testing/testing.md#chrome-devtools-verification),
including the specific note that `fill`/`click` must be used for
interaction testing, not `evaluate_script`-based DOM event dispatch (which
does not reliably update React state in this environment).

## shadcn MCP

**Use for:** browsing, adding, and inspecting shadcn/ui components before
hand-building a UI primitive (dialog, dropdown, form control, etc.).

**When:** whenever a new UI pattern is needed that a shadcn primitive
plausibly covers -- check via `search_items_in_registries` /
`list_items_in_registries` before writing custom component code. Use
`get_add_command_for_items` to get the correct CLI invocation rather than
hand-writing a new `components/ui/*` file from memory.

**When not:** for project-specific composed components
(`components/tool/*`, `components/layout/*`) -- those are hand-authored on
top of shadcn primitives, not generated.

**Known gotcha:** this project's shadcn style is `base-nova` (Base UI, not
Radix) -- generated components use the `render` prop pattern, not
`asChild`. See
[ui/design-system.md § Composition](../ui/design-system.md#composition-render-not-aschild).
If the CLI/MCP's alias resolution ever misbehaves (it did once during
initial setup, writing files to a literal `@/` folder instead of
`src/`), verify `tsconfig.json`'s root-level `paths` mapping is present, not
just `tsconfig.app.json`'s.
