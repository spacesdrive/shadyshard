# CLAUDE.md

Entry point for AI-assisted work on ShadyShard. This file only does five
things: explains how the documentation is organized, defines the order to
read it in, states which documents must always be read, defines what
counts as this project's durable memory, and defines the rule for keeping
documentation current. Every engineering, architecture, SEO, UI,
accessibility, performance, testing, workflow, git, writing, and MCP rule
lives in [`docs/`](docs/index.md), not here.

## How documentation is organized

Documentation lives under `docs/`, one directory per responsibility
(architecture, engineering, seo, ui, accessibility, performance, testing,
workflow, git, writing, mcp, reference), each containing one or more
focused documents. No document duplicates another's responsibility. The
full map, with a description of every document and when to consult it, is
[`docs/index.md`](docs/index.md) -- read that, not this file, to find
where something specific is documented.

## Documentation loading order

1. This file (`CLAUDE.md`).
2. The **always-read set** below, in full, before making any
   non-trivial change.
3. [`docs/index.md`](docs/index.md), to locate whichever domain-specific
   document the current task touches.
4. That domain-specific document, in full.

Skipping straight to writing code without steps 2-4 is how the codebase
and its documentation drift apart -- don't.

## Documents that must always be read

Before any medium-or-larger change, read all three:

- [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md)
  -- what the system actually is right now.
- [`docs/engineering/standards.md`](docs/engineering/standards.md) -- how
  code is written here.
- [`docs/workflow/workflow.md`](docs/workflow/workflow.md) -- how work
  gets done, how decisions get made, and when to stop and ask versus
  continue autonomously.

For a small, well-scoped change (a copy fix, a single obvious bug fix),
judgment applies -- but "this is small" is not an excuse to skip
`ARCHITECTURE.md` when the change touches the tool registry, routing, or
anything else load-bearing.

Every other document in `docs/` is read on demand, per the "Consult when"
column in [`docs/index.md`](docs/index.md#document-by-document) -- e.g.
open `docs/engineering/tool-development.md` when building a tool,
`docs/seo/seo-standards.md` when touching SEO, and so on.

## Project memory

This project's durable, authoritative memory is exactly four files:

1. `CLAUDE.md` (this file) -- meta-level rules only.
2. [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md)
   -- current implementation reality.
3. [`docs/architecture/decisions.md`](docs/architecture/decisions.md) --
   why the implementation is that way.
4. [`README.md`](README.md) -- what the project is and how to run it.

If two of these conflict, precedence is: `ARCHITECTURE.md` for how the
system currently works, `decisions.md` for why, this file for meta-level
process rules only, `README.md` for setup/usage. A conflict between any of
them and the actual code means the documentation is wrong -- fix it, don't
work around it.

This is distinct from any cross-session AI memory feature the assistant
harness itself provides (user preferences, prior-conversation recall) --
that captures things about _how to collaborate_; the four files above
capture facts about _the project itself_, live in the repository, and are
what any contributor (human or AI) should trust.

## Documentation maintenance

Documentation is part of the implementation. A task is not complete until
the documentation describing whatever it touched reflects the new reality
-- see the concrete change-type-to-document mapping in
[`docs/index.md#documentation-maintenance`](docs/index.md#documentation-maintenance).
Never leave documentation stale; if you notice stale documentation while
working on something unrelated, fix it in the same change.

This file (`CLAUDE.md`) itself is deliberately not tracked in version
control (see [`.gitignore`](.gitignore) and
[`docs/git/git-workflow.md`](docs/git/git-workflow.md)) -- it is a private,
local AI-instruction entry point. Everything under `docs/` _is_ tracked: it
is real, shared project documentation, not AI scratch notes.

## Important Note

1. Don’t assume. Don’t hide confusion. Surface tradeoffs.

2. Minimum code that solves the problem. Nothing speculative.

3. Touch only what you must. Clean up only your own mess.

4. Define success criteria. Loop until verified.
