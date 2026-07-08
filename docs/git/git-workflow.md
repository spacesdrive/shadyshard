# Git Workflow

## Current state

This project does not yet have a git repository initialized. This document
defines the conventions to follow once one exists, so they're established
before the first commit rather than retrofitted later.

## Commit conventions

- **Focused commits.** One logical change per commit. Adding a tool,
  fixing a bug, and updating documentation for an unrelated prior change
  are three commits, not one.
- **Never commit broken code.** A commit should leave the project in a
  state that typechecks and builds (see
  [testing.md](../testing/testing.md#pre-completion-checklist)).
- **Meaningful commit messages.** Describe *why*, briefly, not just *what*
  -- the diff already shows what changed. "Add word counter tool" is
  sufficient for an obvious addition; "Fix related-tools scoring to weight
  shared tags" is better than "fix bug" because it tells a future reader
  what to expect without opening the diff.
- **Don't bundle unrelated changes.** A tool addition and an unrelated
  dependency bump are separate commits, even if done in the same session.

## What gets committed vs. ignored

Tracked normally: all of `src/`, `docs/`, `scripts/`, `public/` (including
the generated `sitemap.xml`/`robots.txt` -- regenerated on every build, but
committing the last-generated version keeps the repo's static output
inspectable), configuration files, and `README.md`.

Intentionally gitignored (see `.gitignore`): `node_modules`, `dist`,
editor-specific files, and `claude.md` -- the private, local AI-instruction
entry point is deliberately not shared via version control; see
[the root CLAUDE.md](../../claude.md) for why. `docs/` is **not**
gitignored -- it is genuine project documentation meant to be shared and
versioned like code.

## Destructive operations

Never run a destructive git operation (`reset --hard`, `push --force`,
`checkout --` / `restore` that discards uncommitted work, `clean -f`,
branch deletion) without explicit confirmation for that specific action.
Before any command that could discard uncommitted work, check `git status`
first and prefer stashing or committing over discarding. See
[workflow.md § Autonomy and when to stop vs.
continue](../workflow/workflow.md#autonomy-and-when-to-stop-vs-continue)
for the general version of this rule.

## Branching

Not yet established -- this is a single-maintainer project at time of
writing. Once collaboration begins, document the branching model here
(e.g. trunk-based with short-lived feature branches, or a fork/PR model)
rather than letting it emerge undocumented.
