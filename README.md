# ShadyShard

Privacy-first browser tools. Everything runs locally.

[![CI](https://github.com/spacesdrive/shadyshard/actions/workflows/ci.yml/badge.svg)](https://github.com/spacesdrive/shadyshard/actions/workflows/ci.yml)
[![CD](https://github.com/spacesdrive/shadyshard/actions/workflows/cd.yml/badge.svg)](https://github.com/spacesdrive/shadyshard/actions/workflows/cd.yml)
[![CodeQL](https://github.com/spacesdrive/shadyshard/actions/workflows/codeql.yml/badge.svg)](https://github.com/spacesdrive/shadyshard/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A platform for 500+ fast, free, browser-based tools. Every tool runs
entirely client-side - no uploads, no accounts, no tracking. Production:
[shadyshard.spacesdrive.cc](https://shadyshard.spacesdrive.cc).

## Documentation

Full documentation lives in [`docs/`](docs/index.md). Start there for
architecture, engineering standards, SEO, UI, accessibility, performance,
testing, CI/CD, workflow, git, writing, and MCP usage guidelines. AI
assistants working on this project should read [`CLAUDE.md`](claude.md)
first.

## Stack

React 19, TypeScript, Vite (Rolldown), React Router 7 (data mode),
Tailwind CSS v4, shadcn/ui (Base UI), Fuse.js, React Helmet Async. Hosted
as a static SPA on Cloudflare Pages. See
[`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md)
for the full system design.

## Getting started

```bash
npm ci          # install exact dependency versions from package-lock.json
npm run dev     # start the dev server
```

## Scripts

| Command                     | Does                                                                        |
| --------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`               | Start the Vite dev server.                                                  |
| `npm run build`             | Generate SEO files, typecheck, and produce the production build in `dist/`. |
| `npm run preview`           | Preview the production build locally.                                       |
| `npm test`                  | Run the Vitest unit/component suite.                                        |
| `npm run test:coverage`     | Run Vitest with a coverage report.                                          |
| `npm run test:e2e`          | Run the full Playwright end-to-end suite.                                   |
| `npm run lint`              | Run Oxlint.                                                                 |
| `npm run format`            | Format the codebase with Prettier.                                          |
| `npm run typecheck`         | Typecheck without building (`tsc -b`).                                      |
| `npm run validate:metadata` | Validate every tool's SEO metadata.                                         |
| `npm run validate:sitemap`  | Validate `sitemap.xml`/`robots.txt` against the tool registry.              |
| `npm run size`              | Check production bundle sizes against budget.                               |
| `npm run generate:seo`      | Regenerate `public/sitemap.xml` and `robots.txt`.                           |

Full command reference, including flags:
[`docs/reference/quick-reference.md`](docs/reference/quick-reference.md).

## Adding a new tool

Create `src/tools/<slug>/`:

- `meta.ts` - default-exports a `ToolMeta` object (see `src/types/tool.ts`)
- `index.tsx` - default-exports the tool's React component

That's it. Routing, navigation, the search index, the sitemap,
related-tools linking, and structured data are all generated automatically
from `src/lib/tool-registry.ts` via `import.meta.glob` - no other files
need to change. Full process:
[`docs/engineering/tool-development.md`](docs/engineering/tool-development.md).

## Testing

Three layers, all enforced in CI on every push and pull request:

- **Unit tests** (Vitest) - shared logic, most importantly the tool
  registry's invariants (`src/lib/tool-registry.test.ts`).
- **Component tests** (Vitest + React Testing Library) - shared UI
  components and representative tools.
- **End-to-end tests** (Playwright, across Chromium/Firefox/WebKit and
  mobile) - navigation, search, routing, accessibility (axe-core), console
  errors, and tool functionality.

Coverage is intentionally scoped to shared infrastructure rather than
every one of the 50+ tools individually - see
[`docs/testing/testing.md`](docs/testing/testing.md#test-coverage-philosophy)
for why. Run everything locally with `npm test` and `npm run test:e2e`.

## CI/CD

Every push and pull request runs the full quality gate: typecheck, lint,
format check, unit/component tests, dependency audit, secret scanning,
build with SEO/sitemap/metadata/HTML/bundle-size validation, the full
Playwright suite, and a Lighthouse CI regression check. A push to `main`
deploys to Cloudflare Pages only if every one of those checks passes.
Full pipeline detail, job-by-job, and a troubleshooting guide:
[`docs/ci-cd/ci-cd.md`](docs/ci-cd/ci-cd.md).

## Contributing

1. Branch off `main`, commit using [Conventional
   Commits](https://www.conventionalcommits.org/) (enforced by a Husky
   `commit-msg` hook - `feat:`, `fix:`, `docs:`, `test:`, `chore:`, etc.).
2. Husky's `pre-commit` hook lints, formats, and typechecks staged changes
   automatically.
3. Open a pull request against `main`. CI and PR validation (dependency
   review, PR title convention) must pass before merging.

Full conventions: [`docs/git/git-workflow.md`](docs/git/git-workflow.md).

## License

[MIT](LICENSE)
