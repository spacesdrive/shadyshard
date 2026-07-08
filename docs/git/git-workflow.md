# Git Workflow

## Current state

The repository is hosted at
[github.com/spacesdrive/shadyshard](https://github.com/spacesdrive/shadyshard),
`main` as the default and production branch (Cloudflare Pages deploys
directly from it -- see [ci-cd/ci-cd.md](../ci-cd/ci-cd.md)).

## Commit conventions

Commit messages must follow [Conventional
Commits](https://www.conventionalcommits.org/) -- enforced automatically by
a Husky `commit-msg` hook running `commitlint` against
`commitlint.config.js` (`@commitlint/config-conventional`); a
non-conforming message is rejected locally before it reaches GitHub. Format:
`<type>[optional scope]: <description>`, e.g. `feat(tools): add QR code
generator`, `fix(seo): correct duplicate meta description on json-compare`,
`docs(ci-cd): document the Cloudflare deploy gate`. Common types: `feat`,
`fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

- **Focused commits.** One logical change per commit. Adding a tool,
  fixing a bug, and updating documentation for an unrelated prior change
  are three commits, not one.
- **Never commit broken code.** A commit should leave the project in a
  state that typechecks and builds -- a Husky `pre-commit` hook runs
  `lint-staged` (Oxlint + Prettier on staged files) and a full
  `npm run typecheck` before the commit is allowed to complete (see
  [testing.md](../testing/testing.md#pre-completion-checklist) and
  [ci-cd/ci-cd.md § Git hooks](../ci-cd/ci-cd.md#git-hooks-husky)).
- **Meaningful commit messages.** Describe _why_, briefly, not just _what_
  -- the diff already shows what changed. "Add word counter tool" is
  sufficient for an obvious addition; "Fix related-tools scoring to weight
  shared tags" is better than "fix bug" because it tells a future reader
  what to expect without opening the diff.
- **Don't bundle unrelated changes.** A tool addition and an unrelated
  dependency bump are separate commits, even if done in the same session.
- **Never bypass the hooks** (`git commit --no-verify`) to work around a
  failing lint/typecheck/commit-message check -- fix the underlying issue.
  If a hook itself is wrong (a rule too strict for a legitimate case), fix
  the hook's configuration in its own commit, not by skipping it once.

## What gets committed vs. ignored

Tracked normally: all of `src/`, `docs/`, `scripts/`, `public/` (including
the generated `sitemap.xml`/`robots.txt` -- regenerated on every build, but
committing the last-generated version keeps the repo's static output
inspectable), configuration files, and `README.md`.

Intentionally gitignored (see `.gitignore`): `node_modules`, `dist`,
editor-specific files, test artifacts (`coverage/`, `playwright-report/`,
`test-results/`), `.wrangler` (Wrangler's local cache), `.husky/_`
(Husky's regenerated internal shim), any `.env*` file (never commit
secrets -- this project's CI/CD secrets live only in GitHub Actions
repository secrets, see
[ci-cd/ci-cd.md § Secrets](../ci-cd/ci-cd.md#secrets)), and `claude.md` --
the private, local AI-instruction entry point is deliberately not shared
via version control; see [the root CLAUDE.md](../../claude.md) for why.
`docs/` is **not** gitignored -- it is genuine project documentation
meant to be shared and versioned like code.

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

Trunk-based: `main` is always deployable (every merge to it passes full CI
and deploys to production automatically, see
[ci-cd/ci-cd.md](../ci-cd/ci-cd.md#continuous-deployment-cdyml)), and work
happens on short-lived branches merged back via pull request. Branch
protection on `main` requires the `CI / ci-success`, `PR Validation /
dependency-review`, and `PR Validation / pr-title` checks to pass before a
PR can merge -- there is no way to push a failing change directly to
`main` for anyone without repository admin rights, and admins should not
use that ability to bypass the gate except in a genuine, explained
emergency.

Branch naming is not currently enforced by tooling; prefer a short
`type/description` form (`feat/qr-code-generator`,
`fix/json-formatter-error-state`) for readability, matching the commit
type vocabulary above.
