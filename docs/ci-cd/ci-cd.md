# CI/CD

How code moves from a local change to production on ShadyShard, and how
every step in between is automated and enforced. For the underlying build
and deploy mechanics (Vite, chunking, static hosting), see
[ARCHITECTURE.md §11](../architecture/ARCHITECTURE.md#11-build-and-deployment).
This document covers the pipeline around that build: local hooks, CI
checks, and the deploy gate.

## The pipeline, end to end

```
Developer
  -> commit (Husky pre-commit: lint-staged + typecheck; commit-msg: commitlint)
  -> push
  -> GitHub Actions: CI workflow (ci.yml)
       quality (typecheck, lint, format)
       unit-tests (Vitest + React Testing Library)
       dependency-audit (npm audit)
       secret-scan (gitleaks)
       build (vite build, then metadata/sitemap/robots/links/HTML/bundle-size validation)
       e2e-tests (Playwright: navigation, search, routing, accessibility, console errors, functionality)
       lighthouse (Lighthouse CI: performance, accessibility, best practices, SEO)
  -> if every job passed, and branch is main: CD workflow (cd.yml) deploys to Cloudflare Pages
  -> shadyshard.spacesdrive.cc (production) / *.shadyshard.pages.dev (preview, non-main branches)
```

Pull requests additionally run `pr-validation.yml` (dependency review,
Conventional Commits PR title check). `codeql.yml` runs static analysis on
every push/PR to main and weekly on a schedule, independent of the rest of
the pipeline. Nothing reaches `main`'s production deployment without every
job in `ci.yml` succeeding first -- `cd.yml` calls `ci.yml` as a reusable
workflow via `needs: [ci]`, not a separate copy of the same checks, so
there is exactly one place that defines "passing." `ci.yml`'s own `push`
trigger excludes `main` (`branches-ignore: [main]`) for the same reason:
without the exclusion, a push to `main` would run the full suite twice --
once as a standalone `CI` workflow and once nested under `CD`.

## Local development workflow

1. `npm ci` (not `npm install`) to get exactly what `package-lock.json`
   specifies.
2. `npm run dev` for the Vite dev server.
3. Before committing, Husky runs automatically -- see [Git hooks](#git-hooks-husky)
   below. Nothing here needs to be run by hand, but the equivalent manual
   commands are `npm run lint`, `npm run format`, `npm run typecheck`,
   `npm test`.
4. `npm run build && npm run preview` to check a production build locally
   (required before trusting any Lighthouse number -- see
   [performance.md](../performance/performance.md#verification-workflow)).
5. `npm run test:e2e` to run the full Playwright suite locally (builds and
   serves automatically via `playwright.config.ts`'s `webServer`).

See [reference/quick-reference.md](../reference/quick-reference.md) for the
full command table.

## Git hooks (Husky)

Configured in `.husky/`, installed automatically by the `prepare` npm
script (`npm install` triggers it).

- **`pre-commit`** -- runs `lint-staged` (Oxlint + Prettier on staged files
  only, via the `lint-staged` key in `package.json`), then a full
  `npm run typecheck`. TypeScript project references make repeated
  `tsc -b` calls fast via its build-info cache, so a full typecheck on
  every commit is cheap enough not to need a partial/staged-files-only
  variant.
- **`commit-msg`** -- runs `commitlint` against the commit message using
  `@commitlint/config-conventional`. Commit messages must follow
  [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`,
  `fix:`, `chore:`, `docs:`, `test:`, `ci:`, etc.) -- see
  [git-workflow.md](../git/git-workflow.md#commit-conventions).

A commit that fails either hook is rejected locally, before it ever reaches
CI.

## CI workflow (`ci.yml`)

Triggers on every push (any branch) and every pull request targeting
`main`. Also declared with `on: workflow_call` so `cd.yml` can run it as a
reusable workflow rather than duplicating its job list.

| Job                | What it checks                                                                                                           | Satisfies                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `quality`          | `tsc -b`, `oxlint`, `prettier --check`                                                                                   | TypeScript strict mode, ESLint-equivalent linting (Oxlint, see [below](#why-oxlint-instead-of-eslint)), Prettier formatting                                                          |
| `unit-tests`       | `vitest run --coverage` (React Testing Library for components)                                                           | Unit + component tests                                                                                                                                                               |
| `dependency-audit` | `npm audit --omit=dev --audit-level=high`                                                                                | Security: known-vulnerable dependencies                                                                                                                                              |
| `secret-scan`      | `gitleaks/gitleaks-action` over full git history                                                                         | Security: committed secrets                                                                                                                                                          |
| `build`            | `npm run build`, then `validate:metadata`, `validate:sitemap`, `validate:links`, `validate:html`, `size` (bundle budget) | Build verification, metadata validation, sitemap/robots.txt validation, SEO validation, broken internal link detection, HTML validation, bundle size analysis                        |
| `e2e-tests`        | Full Playwright suite (`chromium`, `firefox`, `webkit`, `mobile-chrome` projects)                                        | Navigation, search, routing, metadata, accessibility, responsive layouts, browser compatibility, copy/reset buttons, tool functionality, zero console errors (`e2e/console.spec.ts`) |
| `lighthouse`       | `treosh/lighthouse-ci-action` against `lighthouserc.json`                                                                | Performance, accessibility, best practices, SEO regression gate                                                                                                                      |
| `ci-success`       | Aggregates every job above                                                                                               | Single required status check for branch protection                                                                                                                                   |

If any job fails, the workflow fails and nothing downstream (PR merge,
deploy) proceeds.

### Why Oxlint instead of ESLint

The project already uses [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)
(`oxlint`, configured in `.oxlintrc.json`) rather than ESLint -- this
predates the CI/CD work and was kept rather than replaced, per
[workflow.md](../workflow/workflow.md#decision-making-process)'s guidance
that consistency with an existing, already-working choice outweighs
switching to a marginally more familiar tool. Oxlint implements a large
subset of ESLint's rule set (including the React and TypeScript rules this
project uses) at substantially higher speed, with no separate ESLint
config to maintain. `npm run lint` is the single command either way.

### Bundle size budgets

`scripts/check-bundle-size.ts` (`npm run size`) reads every chunk in
`dist/assets`, computes its gzip size, and fails if it exceeds a budget.
Budgets are set from the measured baseline in
[performance.md](../performance/performance.md#baseline) with headroom for
organic growth -- named budgets exist for the vendor chunks and the two
known justified per-tool exceptions (`qr-code-scanner`, `markdown-preview`,
see [decisions.md ADR-011/012](../architecture/decisions.md)); every other
chunk (typically a single tool, usually under 4 KB) falls under a 10 KB
default. This is meant to catch an accidental regression, not to be a
tight per-KB gate that needs updating on every tool addition.

### Lighthouse CI thresholds vs. the local baseline

[`lighthouserc.json`](../../lighthouserc.json) asserts `minScore: 0.9` for
Performance and `0.95` for Accessibility/Best Practices/SEO against a set
of representative pages (home, two tool pages, a category page, the About
page). This is deliberately **not** the same as the 100-across-the-board
target in [performance.md](../performance/performance.md#targets) --
GitHub-hosted runners have noisier, less predictable CPU/network
conditions than a local machine, so a CI gate set to the exact local target
would produce false-failure noise unrelated to real regressions. Treat the
CI thresholds as a regression floor that catches genuine problems (a
newly-added blocking dependency, a broken lazy-load), and the local,
DevTools-MCP-driven process in
[testing.md](../testing/testing.md#chrome-devtools-verification) as the
authoritative one for confirming the true baseline before updating that
document's numbers.

## Pull request validation (`pr-validation.yml`)

Runs in addition to `ci.yml` (which also triggers on `pull_request`) for
checks that only make sense in a PR context:

- **`dependency-review`** (`actions/dependency-review-action`) -- diffs
  the PR's dependency changes against `main` and fails on newly introduced
  high-severity vulnerabilities or disallowed licenses.
- **`pr-title`** -- lints the PR title itself against
  `commitlint.config.js`, since GitHub's default squash-merge uses the PR
  title as the resulting commit message.

Branch protection on `main` (configured directly on the repository, not in
a workflow file) requires `CI / ci-success`, `PR Validation /
dependency-review`, and `PR Validation / pr-title` before a PR can merge.

## Continuous deployment (`cd.yml`)

Triggers only on push to `main`. Runs `ci.yml` as a reusable job (`ci:`),
then `deploy:` (`needs: [ci]`) builds and deploys to Cloudflare Pages via
[`cloudflare/wrangler-action`](https://github.com/cloudflare/wrangler-action)
(`wrangler pages deploy dist --project-name=shadyshard`). A
`concurrency: { group: cd-production, cancel-in-progress: false }` block
ensures two deploys never race -- a second push to `main` while a deploy
is in flight queues rather than cancelling the first.

### Why `wrangler-action` and not the Cloudflare dashboard's native Git integration

Cloudflare Pages supports two deployment models: the dashboard's built-in
Git integration (Cloudflare's own infrastructure builds and deploys
directly from a connected GitHub App installation) and CI-driven deploys
via Wrangler. The dashboard integration requires an interactive OAuth
authorization in the Cloudflare dashboard to install the GitHub App on the
repository, which cannot be done from an unattended/headless environment.
`wrangler-action` is Cloudflare's own official GitHub Action, achieves the
same result (the project already deploys other sites on this account the
same way), and keeps the deploy step visible and auditable as an ordinary
CI job gated on `needs: [ci]`, rather than a parallel process outside
GitHub Actions entirely. If dashboard Git integration is set up later
(requires a one-time interactive step in the Cloudflare dashboard), remove
the `deploy` job from `cd.yml` in the same change to avoid double-deploying.

### Cloudflare Pages configuration

- **Project:** `shadyshard`, production branch `main`.
- **Production domain:** `shadyshard.spacesdrive.cc` (custom domain,
  Cloudflare-managed DNS, `spacesdrive.cc` zone), plus the default
  `shadyshard.pages.dev`.
- **Preview deployments:** automatic for any branch other than `main` when
  deployed via `wrangler pages deploy <dir> --branch=<branch>` -- not
  currently wired into `cd.yml` (which only runs on `main`); add a
  `branch != main` job triggered on `pull_request` if preview-per-PR
  deployments become useful.
- **Caching/compression:** handled entirely by Cloudflare's edge (Brotli/
  gzip compression and edge caching are automatic for Pages static assets)
  -- no manual `_headers`/`_redirects` configuration exists yet because
  none has been needed; add one under `public/` if a specific caching rule
  is ever required.
- **Environment variables:** none are configured, and none should be
  needed -- the app is 100% client-side with no server component to
  configure (see
  [ARCHITECTURE.md §1](../architecture/ARCHITECTURE.md#1-system-summary)).
  If a future tool genuinely needs a build-time constant, add it as a
  Cloudflare Pages project environment variable and document it here, not
  as a hand-maintained `.env` committed to the repo.
- **Reproducibility:** the deploy job runs the exact same `npm ci && npm
run build` as every CI job, from the commit that just passed `ci.yml` --
  there is no separate "production build config."

### Secrets

`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured as
GitHub Actions repository secrets (Settings > Secrets and variables >
Actions), never committed to the repository or referenced in any tracked
file. Rotate the API token in the Cloudflare dashboard and update the
GitHub secret in the same change if it's ever suspected of exposure.

### Why the Cloudflare R2 credentials provided during setup are unused

R2 (S3-compatible object storage) credentials were made available when
this pipeline was set up, but nothing in this repository uses them, and
nothing should: [ARCHITECTURE.md §1](../architecture/ARCHITECTURE.md#1-system-summary)
and the project's core product principle are that ShadyShard is 100%
client-side with **no remote storage of any kind** -- every tool's input
and output stays in the visiting browser. Wiring in R2 for anything (build
artifact storage, asset hosting) would be solving a problem this project
doesn't have, at the cost of a real architectural exception. If a genuine
need for object storage ever arises, it needs a
[decisions.md](../architecture/decisions.md) entry justifying the
exception first, the same as any other deviation from the browser-only
principle.

## Static analysis (`codeql.yml`)

[GitHub CodeQL](https://codeql.github.com/) runs `javascript-typescript`
analysis on every push/PR to `main` and weekly on a schedule (independent
of code changes, to catch newly disclosed query patterns). Results appear
under the repository's Security tab, not as a blocking PR check by
default -- treat a new CodeQL alert as a bug report to triage, not
automatically a merge blocker.

## Dependency updates (`dependabot.yml`)

Dependabot opens weekly PRs (Mondays) for both `npm` and `github-actions`
ecosystems, grouped into `dev-dependencies` and `production-dependencies`
to reduce PR noise. Every Dependabot PR runs the full `ci.yml` and
`pr-validation.yml` gate like any other PR -- an update is never merged
without passing the same checks a human-authored change would.

## Release workflow

There is no separate release/tagging process -- every merge to `main` that
passes CI deploys to production automatically (continuous deployment, not
continuous delivery with a manual promotion step). This is a deliberate
fit for a single static SPA with no migrations, no server-side state, and
instant rollback (redeploying a prior commit via `wrangler pages deploy`
or re-running an older successful `cd.yml` run restores the previous
build). If discrete versioned releases become useful later (e.g. to
correlate a production incident with a specific deploy), introduce git
tags and a CHANGELOG at that point rather than speculatively now.

## Troubleshooting

**A commit is rejected locally by Husky.** Read the failing hook's output
-- `lint-staged` reports which file and rule failed; `commitlint` reports
which part of the conventional-commit format the message violates (usually
a missing type prefix, e.g. `feat:`/`fix:`). Fix and re-commit; there is no
bypass flag configured, and `--no-verify` should not be used to work around
a real failure (see [git-workflow.md](../git/git-workflow.md)).

**`npm ci` fails in CI with a lockfile mismatch.** `package.json` and
`package-lock.json` are out of sync -- run `npm install` locally (not
`npm ci`) to regenerate the lockfile, then commit both files together.

**The `build` job fails on `validate:metadata` or `validate:sitemap`.**
The script's output names the specific tool and rule violated (duplicate
description, missing category, sitemap entry count mismatch) -- see
[seo-standards.md](../seo/seo-standards.md) for the underlying rule, and
`scripts/validate-metadata.ts` / `scripts/validate-sitemap.ts` for exactly
what's checked.

**`e2e-tests` fails only in CI, not locally.** Confirm it isn't a real
environment difference first (headless vs. headed rendering rarely
matters for this app, but font rendering/timing differences can). Download
the `playwright-report` artifact from the failed run -- it includes a
trace viewer recording of the exact failure. If a test is genuinely flaky
(timing-dependent, not a real bug), fix the test's wait condition rather
than adding a retry loop that hides the underlying flakiness.

**`lighthouse` job fails but the app looks fine.** Read the uploaded
Lighthouse report (linked in the job's `temporaryPublicStorage` output) for
the specific failing audit, the same way
[testing.md](../testing/testing.md#chrome-devtools-verification) describes
doing locally. A single-run CI Lighthouse score is noisier than a local
`lighthouse_audit` -- if a score is marginally below threshold and the
local number is clean, re-run the job once before assuming a real
regression.

**`deploy` job fails with an authentication error.** The
`CLOUDFLARE_API_TOKEN` secret has likely expired or been rotated in the
Cloudflare dashboard without updating the GitHub secret to match -- see
[Secrets](#secrets) above.

**A deploy succeeded but `shadyshard.spacesdrive.cc` doesn't show the new
version.** Cloudflare's edge cache can serve a stale asset briefly after
deploy; hard-refresh first. If it persists, confirm the custom domain's
status is `active` (not `pending`/`initializing`) via the Cloudflare Pages
dashboard -- a domain stuck in `pending` means the DNS CNAME record either
doesn't exist or doesn't point at `<project>.pages.dev`.
