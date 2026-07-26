# Git Workflow

## Repository

- URL: [github.com/spacesdrive/shadyshard](https://github.com/spacesdrive/shadyshard)
- Author name: `spacesdrive`
- Author email: `valzorx7@gmail.com`
- Default branch: `main` -- production branch, Cloudflare Pages deploys
  directly from it (see [ci-cd/ci-cd.md](../ci-cd/ci-cd.md))

Commits must use the `spacesdrive` author identity (the local git config is
already set to this). Never override it per-commit with a different author.

Do not add `Co-Authored-By` lines referencing AI tools. Commits should show
only the project author, regardless of what tooling produced the change.

## Commit Conventions

Commit messages must follow [Conventional
Commits](https://www.conventionalcommits.org/) -- enforced automatically by
a Husky `commit-msg` hook running `commitlint` against
`commitlint.config.js` (`@commitlint/config-conventional`, plus a
project-specific `release` type, see [Release Tagging](#release-tagging)
below). A non-conforming message is rejected locally before it ever reaches
GitHub -- there is no bypass flag configured, and `--no-verify` should not
be used to work around a real failure.

### Commit Cadence

Commit after every meaningful, self-contained change. Do not accumulate
unrelated changes into one large commit, and do not leave work uncommitted
between sessions.

A meaningful change is one that:

- Adds a working feature (even a small one)
- Fixes a bug
- Updates documentation to reflect a real change
- Refactors without changing behavior

Never commit work-in-progress that breaks the build -- the `pre-commit`
hook (`lint-staged` plus a full `npm run typecheck`) already enforces this
locally, see [ci-cd/ci-cd.md § Git hooks](../ci-cd/ci-cd.md#git-hooks-husky).
If work genuinely spans multiple sessions before it's ready for `main`, use
a feature branch (see [Branch Strategy](#branch-strategy)) rather than
holding it uncommitted.

### Commit Message Format

```
type(scope): short description in present tense

Optional body explaining WHY, not WHAT. Wrap at 72 characters.
Reference which docs were updated if any.
```

#### Types

| Type       | When to use                               |
| ---------- | ----------------------------------------- |
| `feat`     | New feature or capability                 |
| `fix`      | Bug fix                                   |
| `docs`     | Documentation only                        |
| `refactor` | Code restructuring, no behavior change    |
| `style`    | Formatting or whitespace, no logic change |
| `perf`     | Performance improvement                   |
| `test`     | Adding or correcting tests                |
| `build`    | Build system or dependency changes        |
| `ci`       | CI/CD configuration changes               |
| `chore`    | Maintenance, tooling, everything else     |
| `release`  | Version bump and changelog update         |

#### Scope (optional)

Use scope to name the area affected -- typically a tool slug, a category,
or a doc/system name:

- `feat(tools):`
- `fix(seo):`
- `docs(architecture):`
- `chore(deps):`

#### Subject line rules

- Present tense: "add" not "added", "fix" not "fixed"
- No period at the end
- Under 72 characters total including type and scope
- Lowercase after the colon (this project disables commitlint's
  `subject-case` rule specifically because many tool names legitimately
  start with an acronym -- JSON, SEO, QR, HTML -- but keep new sentences
  lowercase by convention regardless)
- No emojis

#### Examples

```
feat(tools): add QR code generator

fix(seo): correct duplicate meta description on json-compare

fix(qr-code-scanner): attach camera stream after video element mounts

docs(ci-cd): document the Cloudflare deploy gate

refactor(tool-registry): extract related-tools scoring into its own module

chore(deps): update react-router to v8

release: v1.1.0 - QR code tools and SEO fixes
```

## What to Commit Together

### Always group these in a single commit

- A new tool + its `meta.ts`/`index.tsx` + the regenerated
  `sitemap.xml`/`robots.txt` it produces
- A new page + its route entry in `src/routes/router.tsx` + any nav/footer
  link to it
- A bug fix + updated docs, if the fix changes previously documented
  behavior
- A new feature + the `CHANGELOG.md` `Unreleased` entry + any
  `ARCHITECTURE.md`/`decisions.md` update it requires (see [Documentation
  in Commits](#documentation-in-commits))

### Never commit

- Any `.env*` file, or a Cloudflare API token / account ID in any tracked
  file
- `node_modules/`, `dist/`, `coverage/`, `playwright-report/`,
  `test-results/`, `.wrangler/`
- Editor or OS metadata files (`.DS_Store`, `Thumbs.db`)
- `.claude/` (Claude Code's local session-state directory)

The full, current list of what's tracked vs. ignored and why lives in
`.gitignore` and is explained in [ci-cd/ci-cd.md §
Secrets](../ci-cd/ci-cd.md#secrets). `docs/` and the root `claude.md` are
**not** gitignored -- they're genuine project documentation and the
AI-instruction entry point, meant to be shared and versioned like code.

## Documentation in Commits

A feature or fix is not complete until its documentation reflects the new
reality -- see [docs/index.md § Documentation
Maintenance](../index.md#documentation-maintenance) for the concrete
mapping from change type to which doc to update. On top of that mapping,
every feature or fix commit should also update `CHANGELOG.md`'s
`Unreleased` section.

Note in the commit body which docs were updated:

```
feat(tools): add SVG optimizer

Strips unnecessary metadata and whitespace from uploaded SVG files
entirely client-side, using SVGO's browser build.

Docs updated: ARCHITECTURE.md (tool count), CHANGELOG.md.
```

## Release Tagging

Tagging is a labeling exercise layered on top of continuous deployment, not
a deploy gate -- every merge to `main` that passes CI still deploys to
production automatically regardless of whether it's tagged. See
[decisions.md ADR-023](../architecture/decisions.md#adr-023-tagged-releases-with-a-changelog-reversing-the-no-release-process-stance)
for why this was adopted, and
[ci-cd.md § Release workflow](../ci-cd/ci-cd.md#release-workflow) for how
it fits the deploy pipeline.

### Version numbering

Semantic versioning (`package.json`'s own `version` field is currently a
placeholder `0.0.0` since the app has never been tagged -- the first
release should set it to a real starting version):

| Change type     | Version bump   | Example          |
| --------------- | -------------- | ---------------- |
| Bug fix         | Patch: x.x.N+1 | v1.0.4 -> v1.0.5 |
| New feature     | Minor: x.N+1.0 | v1.0.5 -> v1.1.0 |
| Breaking change | Major: N+1.0.0 | v1.1.0 -> v2.0.0 |

### Release process

1. Update `CHANGELOG.md`: move the `Unreleased` section's contents to a new
   dated version heading.
2. Commit: `release: v1.1.0 - short description of release`.
3. Tag: `git tag -a v1.1.0 -m "v1.1.0 - short description"`.
4. Push: `git push origin main --tags`.

```bash
git add CHANGELOG.md
git commit -m "release: v1.1.0 - QR code tools and SEO fixes"
git tag -a v1.1.0 -m "v1.1.0 - QR code tools and SEO fixes"
git push origin main --tags
```

## Branch Strategy

Trunk-based: `main` is always deployable, and work happens on short-lived
branches merged back via pull request. **This deviates from a
direct-to-main-for-small-changes model** -- branch protection on `main`
requires the `CI / ci-success`, `PR Validation / dependency-review`, and
`PR Validation / pr-title` checks, two of which (`dependency-review`,
`pr-title`) only run in a pull-request context and can never be satisfied
by a direct push. Admin bypass is technically possible but should not be
used except in a genuine, explained emergency -- routine direct pushes to
`main`, even for small fixes, would silently skip the dependency-review and
PR-title gates every time.

```bash
git checkout -b fix/json-formatter-error-state
# work, commit incrementally
git push origin fix/json-formatter-error-state
# open a PR, let CI + PR validation pass, merge via GitHub
```

Branch naming is not enforced by tooling; prefer a short `type/description`
form (`feat/qr-code-generator`, `fix/json-formatter-error-state`) matching
the commit type vocabulary above. Delete the branch after merging:

```bash
git push origin --delete fix/json-formatter-error-state
git branch -d fix/json-formatter-error-state
```

## Pre-Commit Checklist

The `pre-commit` hook already runs `lint-staged` (Oxlint + Prettier on
staged files) and a full `npm run typecheck` automatically -- see
[ci-cd/ci-cd.md § Git hooks](../ci-cd/ci-cd.md#git-hooks-husky). Before
pushing (the hook doesn't cover these), also run:

1. `npm run build` -- must succeed, including the SEO-generation prebuild
   step.
2. `git status` -- verify only intended files are staged.
3. `git diff --staged` -- review the full diff before committing.
4. Check no secrets or credentials appear in the diff.
5. Verify `CHANGELOG.md` is updated if the commit adds a feature or fix.

## Post-Commit

After pushing, any branch triggers `ci.yml`; a push to `main` additionally
triggers `cd.yml`, which re-runs `ci.yml` and then deploys to Cloudflare
Pages if every job passes -- see [ci-cd/ci-cd.md](../ci-cd/ci-cd.md) for
the full pipeline. This is a single unified app with no backend/frontend
split, so every push runs the same pipeline regardless of which files
changed.

If a workflow run fails:

1. Read the failure log at
   [github.com/spacesdrive/shadyshard/actions](https://github.com/spacesdrive/shadyshard/actions).
2. Fix the issue locally.
3. Create a new commit (never amend a published commit).
4. Push the fix.

## Destructive operations

Never run a destructive git operation (`reset --hard`, `push --force`,
`checkout --` / `restore` that discards uncommitted work, `clean -f`,
branch deletion) without explicit confirmation for that specific action.
Before any command that could discard uncommitted work, check `git status`
first and prefer stashing or committing over discarding. See
[workflow.md § Autonomy and when to stop vs.
continue](../workflow/workflow.md#autonomy-and-when-to-stop-vs-continue)
for the general version of this rule.
