# Documentation Index

This is the map of ShadyShard's documentation: what exists, what it's for,
and when to open it. Start at the root [`CLAUDE.md`](../claude.md) for
loading order and the always-read set; use this page to find the right
document once you know what you're looking for.

## How documentation is organized

One directory per responsibility, under `docs/`. A document lives in
exactly one directory and covers exactly one responsibility -- if you find
yourself writing about SEO inside the UI doc, that content belongs in
`docs/seo/` instead, cross-linked from where it's relevant. This is
deliberate: duplication between documents is the failure mode this
structure exists to prevent (it's exactly what the previous single-file
`claude.md` had become).

```
docs/
  index.md                        This file.
  architecture/
    ARCHITECTURE.md                Authoritative technical blueprint.
    decisions.md                   Append-only architectural decision log.
  engineering/
    standards.md                   Code-level conventions.
    tool-development.md            How to build one tool, end to end.
  seo/
    seo-standards.md               Per-page SEO requirements and mechanics.
  ui/
    design-system.md               Tokens, components, the render-prop gotcha.
  accessibility/
    accessibility.md               Concrete a11y rules and verification.
  performance/
    performance.md                 Targets, strategy, measured baseline.
  testing/
    testing.md                     Pre-completion checklist, DevTools workflow.
  workflow/
    workflow.md                    Development loop, decision-making, autonomy.
  git/
    git-workflow.md                Commit conventions, what's tracked/ignored.
  writing/
    writing-standards.md           Typography and prose style, project-wide.
  mcp/
    mcp-usage.md                   When/how to use each configured MCP.
  reference/
    quick-reference.md             Commands, file locations, glossary.
```

## Document-by-document

| Document                                                           | Purpose                                                                                                                                                                                                                               | Consult when                                                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md)       | Describes the system as actually implemented: folder structure, tool registry, routing, layouts, SEO wiring, state management, design system integration, browser APIs in use, build/deploy, performance baseline, scalability notes. | Before any medium-or-larger change; whenever you need to understand how an existing system works before extending it.                    |
| [architecture/decisions.md](architecture/decisions.md)             | Append-only log of significant architectural decisions with reasoning, alternatives, and trade-offs.                                                                                                                                  | When you need to know _why_ something was built a certain way; when making a new architecturally significant decision (append an entry). |
| [engineering/standards.md](engineering/standards.md)               | Code-level conventions: naming, component conventions, state management, error handling, code style, refactoring policy.                                                                                                              | Before writing or reviewing any code.                                                                                                    |
| [engineering/tool-development.md](engineering/tool-development.md) | The concrete, step-by-step process for adding one tool.                                                                                                                                                                               | Any time a new tool is being built.                                                                                                      |
| [seo/seo-standards.md](seo/seo-standards.md)                       | Per-page SEO requirements: metadata, structured data, breadcrumbs, sitemap/robots/llms.txt, heading hierarchy, internal linking, content quality.                                                                                     | Building any new page or tool; touching anything SEO-related.                                                                            |
| [ui/design-system.md](ui/design-system.md)                         | Design tokens, component foundation (shadcn on Base UI), the `render`-vs-`asChild` composition gotcha, spacing/typography/icon/dark-mode conventions.                                                                                 | Building or modifying any UI.                                                                                                            |
| [accessibility/accessibility.md](accessibility/accessibility.md)   | Semantic HTML, keyboard nav, focus states, form field requirements, ARIA usage, verification process.                                                                                                                                 | Building or modifying any UI; before considering UI work complete.                                                                       |
| [performance/performance.md](performance/performance.md)           | Performance targets, code-splitting/chunking strategy, measured baseline metrics.                                                                                                                                                     | Adding a dependency; anything plausibly performance-relevant.                                                                            |
| [testing/testing.md](testing/testing.md)                           | The pre-completion checklist and the concrete Chrome DevTools MCP verification workflow (current state: no automated test suite).                                                                                                     | Before considering any task complete.                                                                                                    |
| [workflow/workflow.md](workflow/workflow.md)                       | The development loop, the decision-making process for choosing between approaches, autonomy boundaries (when to stop and ask vs. continue), communication style.                                                                      | At the start of any task; when facing a choice between implementation approaches.                                                        |
| [git/git-workflow.md](git/git-workflow.md)                         | Commit conventions, what's tracked vs. gitignored and why, destructive-operation rules.                                                                                                                                               | Any git operation.                                                                                                                       |
| [writing/writing-standards.md](writing/writing-standards.md)       | Typography rules (no emoji/em-dash), prose style, Markdown conventions -- applies to UI copy, docs, commits, and tool FAQs alike.                                                                                                     | Writing any user-facing or documentation text.                                                                                           |
| [mcp/mcp-usage.md](mcp/mcp-usage.md)                               | When and how to use each configured MCP server (Context7, Parallel Search, Sequential Thinking, Filesystem, Chrome DevTools, shadcn).                                                                                                 | Before reaching for any MCP tool.                                                                                                        |
| [reference/quick-reference.md](reference/quick-reference.md)       | Commands, key file locations, a short glossary.                                                                                                                                                                                       | Fast lookups; onboarding.                                                                                                                |

## Documentation hierarchy and precedence

If two documents ever appear to conflict:

1. **[`ARCHITECTURE.md`](architecture/ARCHITECTURE.md)** wins for "how does
   the system currently work" -- it describes implemented reality.
2. **Domain-specific docs** (`seo-standards.md`, `design-system.md`, etc.)
   win for the detailed rules of their specific domain.
3. **The root [`CLAUDE.md`](../claude.md)** wins only for meta-level
   questions (loading order, what counts as project memory, maintenance
   rules) -- it intentionally carries no domain-specific engineering
   detail, so it shouldn't be cited as the authority on, say, SEO
   requirements.

A conflict between any of these and the actual code means one of them is
wrong -- fix it, don't work around it. See [Documentation
Maintenance](#documentation-maintenance) below.

## Ownership

There is no per-document owner beyond "whoever is working in the area it
describes." Any contributor (human or AI) who changes a system documented
here is responsible for updating the corresponding document in the same
change -- see below.

## Documentation Maintenance

Documentation is part of the implementation, not an afterthought. A change
is not complete until the documentation describing the affected system
reflects the new reality. Concrete mapping from change type to what must be
updated:

| If you changed...                                                                                                     | Update...                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Folder structure, routing, the tool registry, layouts, state management, build/deploy config, anything structural     | [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md), and add an entry to [`architecture/decisions.md`](architecture/decisions.md) if the change was a deliberate choice between alternatives                        |
| The `ToolMeta` schema, the process for adding a tool                                                                  | [`engineering/tool-development.md`](engineering/tool-development.md) and `src/types/tool.ts` together                                                                                                                          |
| Code conventions, naming, component patterns                                                                          | [`engineering/standards.md`](engineering/standards.md)                                                                                                                                                                         |
| SEO wiring, structured data schemas, sitemap generation                                                               | [`seo/seo-standards.md`](seo/seo-standards.md)                                                                                                                                                                                 |
| Design tokens, component library, dark mode, spacing/typography                                                       | [`ui/design-system.md`](ui/design-system.md)                                                                                                                                                                                   |
| Accessibility patterns or a newly discovered a11y issue and its fix                                                   | [`accessibility/accessibility.md`](accessibility/accessibility.md)                                                                                                                                                             |
| Dependencies, bundling/chunking strategy, measured Lighthouse/Core Web Vitals numbers                                 | [`performance/performance.md`](performance/performance.md) (update the baseline table if re-measured)                                                                                                                          |
| The verification process itself, or a test framework is introduced                                                    | [`testing/testing.md`](testing/testing.md)                                                                                                                                                                                     |
| The development process, decision-making approach, autonomy rules                                                     | [`workflow/workflow.md`](workflow/workflow.md)                                                                                                                                                                                 |
| Git conventions, branching model                                                                                      | [`git/git-workflow.md`](git/git-workflow.md)                                                                                                                                                                                   |
| MCP server configuration or usage patterns                                                                            | [`mcp/mcp-usage.md`](mcp/mcp-usage.md)                                                                                                                                                                                         |
| Anything not covered above but user- or developer-facing                                                              | Whichever existing document's responsibility it falls under -- don't create a new document for a single fact; add a new document only for a genuinely new responsibility, and register it in this index and in the tree above. |

Never allow documentation to drift from the code it describes. If you
notice stale documentation while working on something unrelated, fix it as
part of [proactive improvement](workflow/workflow.md#proactive-improvement-scoped)
rather than leaving it.
