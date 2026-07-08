# Development Workflow

How work gets done on ShadyShard, from receiving a task to considering it
complete.

## The loop

1. **Understand the task completely.** If genuinely ambiguous, see
   [When to stop](#autonomy-and-when-to-stop-vs-continue) below -- most ambiguity should
   be resolved by reading [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
   and the relevant domain doc, not by asking.
2. **Research if the task touches unfamiliar territory** -- an unfamiliar
   library API, an unfamiliar browser API, an unfamiliar best practice. See
   [mcp-usage.md](../mcp/mcp-usage.md) for which tool to reach for.
3. **Plan before writing code.** For anything more than a trivial change:
   identify the files that need to change, identify reusable abstractions
   that already exist (check `lib/`, `hooks/`, `components/ui/` before
   writing something new), identify edge cases, identify scalability
   implications if the change touches something 500+ tools will pass
   through (the registry, routing, SEO generation).
4. **Implement.**
5. **Verify.** Follow the [testing.md](../testing/testing.md)
   pre-completion checklist. Do not skip straight from "it compiles" to
   "done."
6. **Update documentation** if the change affects anything documented. See
   [Documentation Maintenance](../index.md#documentation-maintenance) for
   the concrete trigger-to-file mapping.

Never jump straight into implementing a non-trivial feature without step 3.
Re-work caused by skipping planning is more expensive than the planning
itself.

## Decision-making process

When more than one reasonable implementation approach exists:

1. Research the options (see [mcp-usage.md](../mcp/mcp-usage.md) --
   Context7 for library/API specifics, Parallel Search for comparing
   approaches or best practices).
2. Compare on: complexity, long-term maintainability, scalability toward
   500+ tools, bundle size impact, and how well it fits the patterns
   already established in [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
   -- consistency with existing patterns usually outweighs a marginally
   "better" but novel approach.
3. Choose the option with the best long-term trade-off, not the fastest to
   type.
4. State the reasoning briefly, then continue implementing. Don't present
   an exhaustive options survey when a recommendation with the key
   trade-off is what's actually useful.
5. If the decision is architecturally significant (introduces a new
   pattern, a new dependency category, or reverses a previous decision),
   add an entry to [decisions.md](../architecture/decisions.md).

## Autonomy and when to stop vs. continue

Default to continuing without stopping to ask. Research, plan, implement,
verify, and finish the task. Stop and ask (or otherwise flag to the user)
only when:

- **Data could be lost** or an action is destructive/hard to reverse (e.g.
  overwriting uncommitted work, force-pushing, deleting files not created
  this session). See [git-workflow.md](../git/git-workflow.md) for the
  git-specific version of this rule.
- **The task is genuinely ambiguous** in a way that reading the existing
  documentation and codebase cannot resolve -- not "there are multiple
  valid approaches" (that's [Decision-making](#decision-making-process)'s
  job to resolve autonomously), but "the requirement itself could mean two
  materially different things."
- **Credentials or secrets** would be required.
- **A broad, unrequested architectural change** is being proposed as an
  improvement, not required by the task -- explain the recommendation and
  either get confirmation or do it as a clearly separate follow-up. See
  [standards.md § Refactoring and proactive
  improvement](../engineering/standards.md#refactoring-and-proactive-improvement).

## Proactive improvement, scoped

While working in a file, fix small, obviously-related issues in the same
change (see [standards.md](../engineering/standards.md#refactoring-and-proactive-improvement)
for the detailed policy). This includes accessibility gaps, SEO gaps,
duplicated code, and outdated patterns _directly touched_ by the current
task. It does not include unrelated files, and it does not include
large-scale refactors -- those get named and proposed, not silently done.

## Communication

Be concise. State results and decisions directly rather than narrating the
process of getting there. Explain the reasoning behind a non-obvious
technical decision briefly (a sentence or two, not a treatise) -- see
[decisions.md](../architecture/decisions.md) for where the _durable_ record
of that reasoning belongs versus what's said in conversation. Don't ask
questions the codebase or documentation already answers.
