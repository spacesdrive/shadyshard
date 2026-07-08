# Engineering Standards

Code-level conventions for ShadyShard. This document governs _how_ code is
written; for _where_ things live structurally, see
[ARCHITECTURE.md](../architecture/ARCHITECTURE.md); for how to build a new
tool specifically, see [tool-development.md](tool-development.md).

## Core principles

Optimize for, in rough priority order: correctness, maintainability,
readability, and only then performance and cleverness. This is a project
meant to be maintained for years by people who did not write the code they
are reading. Prefer the boring, obvious solution over the clever one.

Avoid temporary hacks when a clean solution is reasonably available. If a
temporary solution is genuinely necessary, say so explicitly (a one-line
comment explaining why, or an entry in
[decisions.md](../architecture/decisions.md) if it's architecturally
significant) rather than leaving it to look intentional.

## Folder organization

Organize by responsibility, not by feature-of-the-day. The established
top-level groupings under `src/` are `pages/`, `tools/`, `components/`
(further split by domain: `layout/`, `seo/`, `search/`, `tool/`, `ui/`),
`hooks/`, `lib/`, `types/`, `routes/`. Do not introduce a new top-level
grouping without updating [ARCHITECTURE.md §2](../architecture/ARCHITECTURE.md#2-folder-structure)
in the same change.

Within `components/`, a component belongs in a domain folder if it serves
that domain specifically (`tool/RelatedTools.tsx` is only ever used on tool
pages); it belongs in `layout/` only if it's part of the app-wide chrome
(header, footer, page shell).

## Naming conventions

- Components: `PascalCase.tsx`, filename matches the exported component
  name (`ToolCard.tsx` exports `ToolCard`).
- Hooks: `use-kebab-case.ts` (matches shadcn/community convention already
  in use: `use-theme.tsx`, `use-search-index.ts`), exported function is
  `useCamelCase`.
- Non-component modules (`lib/`, `types/`): `kebab-case.ts`.
- Tool folders: `kebab-case` matching the tool's URL slug exactly --
  `src/tools/word-counter/` serves `/tools/word-counter`. This is enforced
  at build time by the registry (see
  [ARCHITECTURE.md §3](../architecture/ARCHITECTURE.md#3-tool-registry-the-core-abstraction)).

## Component conventions

Prefer composition over configuration: a component that needs many boolean
props to change its shape is usually better split into two components or
built from smaller composable pieces. Prefer function components with
explicit prop interfaces (`interface FooProps { ... }`) over inline prop
types for anything with more than one or two props.

Do not add a prop, a config flag, or an abstraction layer for a
hypothetical future need. Three similar lines of JSX across two components
is better than a premature shared abstraction that has to be contorted the
first time the two components actually diverge.

shadcn/ui primitives in `components/ui/` are generated code -- treat them
as vendored, not hand-authored. Fix a real bug in one if you must, but
prefer regenerating via the shadcn CLI/MCP over hand-editing where possible,
and don't add app-specific logic to them; app-specific behavior belongs in
the component that consumes them.

## State management

Default to local `useState`. Lift state to the nearest common ancestor only
when two or more components genuinely need to share it. Reach for React
Context only when a value needs to be read from many places across
different subtrees and prop-drilling has become the actual problem -- as of
this writing there is exactly one Context in the app (`ThemeProvider`, see
[ARCHITECTURE.md §8](../architecture/ARCHITECTURE.md#8-state-management)).
Do not add a state management library (Redux, Zustand, Jotai, etc.) without
an entry in [decisions.md](../architecture/decisions.md) justifying it --
none has been necessary so far and none should be added speculatively.

## Error handling

Never let invalid user input crash the UI. Tool components must validate
and fail gracefully in place -- see the JSON Formatter's `try/catch` around
`JSON.parse` with an inline error message as the reference pattern. Show a
specific, actionable message where possible ("Unexpected token at position
12" beats "Something went wrong").

Only add error handling for scenarios that can actually occur. Don't wrap
internal, guaranteed-safe operations in defensive try/catch blocks -- that
hides real bugs instead of surfacing them. Validate at boundaries (user
input, `JSON.parse`, clipboard/file API calls that can reject); trust
everything else.

## Code style

- No unnecessary comments. A comment earns its place only by explaining a
  _why_ that isn't obvious from the code itself (a workaround, a
  non-obvious constraint, a gotcha like the Base UI `render`-prop pattern).
  Never write a comment that restates what the next line does.
- Descriptive names over short ones; no single-letter variables outside
  trivial loop counters.
- No dead code, no unused imports -- both are caught by
  `noUnusedLocals`/`noUnusedParameters` in `tsconfig.app.json` and will fail
  the build; don't work around them by prefixing with `_`, delete the code.
- Keep files focused. A file that's grown to do two unrelated things should
  be split, not left to accumulate a third.

## Refactoring and proactive improvement

If you're touching a file and notice a small, low-risk, clearly-related
improvement (a duplicated snippet that should be a shared helper, an
accessibility gap, an obviously stale comment), fix it as part of the same
change. Leave the code you touch better than you found it.

Do not use this as license for unrelated, broad changes. A larger
architectural improvement that isn't required by the task at hand should be
named and explained, not silently done -- propose it, then either do it as
a follow-up or get confirmation before a broad rewrite.

## Documentation as part of the implementation

A change is not complete until the documentation that describes the
affected system reflects the new reality. See [Documentation
Maintenance](../index.md#documentation-maintenance) for the concrete
trigger-to-file mapping. This is not optional busywork -- stale docs are
actively worse than no docs, because they're trusted and wrong.
