# Quick Reference

Fast lookups. If something here goes stale, fix it here directly -- this
page has no deeper source of truth than the codebase itself.

## Commands

| Command                | Does                                                                        |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server with HMR.                                         |
| `npm run build`        | Generate SEO files, typecheck, and produce the production build in `dist/`. |
| `npm run preview`      | Serve the production build locally (for Lighthouse/perf verification).      |
| `npm run generate:seo` | Regenerate `public/sitemap.xml` and `public/robots.txt` standalone.         |
| `npm run lint`         | Run Oxlint.                                                                 |
| `npx tsc -b`           | Typecheck without building.                                                 |

## Key file locations

| What                                         | Where                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Add a new tool                               | `src/tools/<slug>/{meta.ts,index.tsx}` -- see [tool-development.md](../engineering/tool-development.md) |
| Tool metadata shape                          | `src/types/tool.ts`                                                                                     |
| Category taxonomy                            | `src/lib/categories.ts`                                                                                 |
| Route tree                                   | `src/routes/router.tsx`                                                                                 |
| SEO schema builders                          | `src/lib/seo.ts`                                                                                        |
| Site-wide constants (name, URL, description) | `src/lib/site.ts`                                                                                       |
| Sitemap/robots.txt generator                 | `scripts/generate-seo.ts`                                                                               |
| Theme system                                 | `src/hooks/use-theme.tsx`                                                                               |
| Global search                                | `src/hooks/use-search-index.ts`, `src/components/search/SearchDialog.tsx`                               |
| Vendor chunk config                          | `vite.config.ts`                                                                                        |
| Design tokens                                | `src/index.css`                                                                                         |

## Glossary

- **Tool registry** -- the `import.meta.glob`-based system in
  `lib/tool-registry.ts` that auto-discovers every tool folder. See
  [ARCHITECTURE.md §3](../architecture/ARCHITECTURE.md#3-tool-registry-the-core-abstraction).
- **`ToolMeta`** -- the metadata object every tool's `meta.ts`
  default-exports; type defined in `src/types/tool.ts`.
- **`ToolDefinition`** -- a `{ meta, Component }` pair, the registry's
  internal representation of a tool combining its metadata with its
  lazy-loaded component.
- **Data Mode** -- the React Router v7 usage pattern this project uses
  (`createBrowserRouter`), as opposed to Framework Mode or Declarative
  Mode. See
  [decisions.md ADR-003](../architecture/decisions.md#adr-003-react-router-v7-in-data-mode-not-framework-mode).
- **`base-nova`** -- the shadcn/ui style this project uses, built on Base
  UI rather than Radix. See
  [ui/design-system.md](../ui/design-system.md#foundation-shadcnui-on-base-ui).

## Documentation map

See [docs/index.md](../index.md) for the full documentation index with
descriptions and when to consult each file.
