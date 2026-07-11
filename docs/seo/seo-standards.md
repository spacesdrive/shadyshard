# SEO Standards

How ShadyShard's SEO is implemented and what every page must satisfy. For
the mechanics of _how_ this is wired into the codebase, see
[ARCHITECTURE.md §6](../architecture/ARCHITECTURE.md#6-metadata-and-seo). For
what a tool's `meta.ts` needs to satisfy this document, see
[tool-development.md](../engineering/tool-development.md).

## Non-negotiable per-page requirements

Every route (tool, category, and static page) must render a unique:

- `<title>` -- via `<Seo title="..." />`, rendered as `"{title} - {site.name}"`
  (the homepage is the sole exception: title equals `site.name` alone).
- Meta description -- one genuinely descriptive sentence, not a generic
  template string. No two pages may share a description.
- Canonical URL -- automatic from the `path` prop passed to `<Seo>`, built
  against `site.url`. Never hand-write a canonical tag outside `<Seo>`.
- Open Graph tags (`og:type`, `og:site_name`, `og:title`, `og:description`,
  `og:url`, `og:image`) and Twitter Card tags (`summary_large_image`) --
  automatic from the same `<Seo>` props, defaulting `image` to
  `site.ogImage` unless overridden.

No page renders `<Seo>` twice. No page skips it.

## Structured data (JSON-LD)

Built by [`src/lib/seo.ts`](../../src/lib/seo.ts), passed as the `jsonLd`
array prop to `<Seo>`:

| Schema                     | `@type`          | Rendered on                            |
| -------------------------- | ---------------- | -------------------------------------- |
| `breadcrumbSchema`         | `BreadcrumbList` | Every tool and category page           |
| `toolWebApplicationSchema` | `WebApplication` | Every tool page                        |
| `faqSchema`                | `FAQPage`        | Tool pages with `meta.faqs.length > 0` |
| `categoryCollectionSchema` | `CollectionPage` | Every category page                    |

Do not hand-write JSON-LD inline in a page component. Add a new builder
function to `lib/seo.ts` if a new schema type is needed, following the
existing functions' shape (pure function, takes typed input, returns a
plain object).

## Breadcrumbs

Every tool page's breadcrumb is `Home > {Category} > {Tool title}`; every
category page's is `Home > {Category}`. The visible `Breadcrumbs` component
(`components/layout/Breadcrumbs.tsx`) and the `breadcrumbSchema` JSON-LD
must always agree -- they're built from the same category/title data, so
don't construct one without the other.

## Sitemap, robots.txt, llms.txt

`public/sitemap.xml` and `public/robots.txt` are generated, not hand-edited
-- see [`scripts/generate-seo.ts`](../../scripts/generate-seo.ts), run
automatically by the `prebuild` npm script (`npm run generate:seo` to run
it standalone). Never edit either file directly; edit the script or the
underlying data (`categories.ts`, tool `meta.ts` files) instead. See
[ARCHITECTURE.md §6](../architecture/ARCHITECTURE.md#6-metadata-and-seo) and
[decisions.md ADR-006](../architecture/decisions.md#adr-006-sitemaprobotstxtllmstxt-generated-as-static-files-pre-build).

`/sitemap` (`pages/HtmlSitemap.tsx`) is a plain crawlable HTML page listing
every category and tool as ordinary links, linked from the footer. It is
not a replacement for `sitemap.xml` -- it exists as a second, independent
discovery path for search crawlers, since Google Search Console's XML
sitemap fetch/read status has been observed to get stuck against a
specific domain regardless of the file's actual validity (see
[decisions.md ADR-021](../architecture/decisions.md)). It is regenerated
implicitly by the tool registry and `categories.ts` -- no manual
maintenance needed when a tool or category is added or removed.

`public/llms.txt` follows the [llms.txt](https://llmstxt.org) convention
for LLM crawlers and is hand-maintained prose (site-level summary + doc
links), since its content doesn't map to per-tool data the generator script
could produce. Update it when the site's core value proposition, mission,
or top-level page set changes.

## Heading hierarchy

One `<h1>` per page, no skipped levels. This was a real bug found via
Lighthouse's `heading-order` audit: a section with no visible heading of
its own (homepage highlights) went straight from `<h1>` to `<h3>`, scoring
Accessibility 98/100. Fix: give the section a heading, even if visually
hidden (`sr-only`), so the outline is `h1 → h2 → h3`, not `h1 → h3`. Verify
heading order whenever adding a new page section -- don't just pick a
heading level that "looks right" visually.

## Internal linking

No orphan pages. Every tool links to its category (breadcrumb) and to
`getRelatedTools()` results (4 by default); every category page lists every
tool in it; the homepage links to every category and surfaces recent/
featured tools. When adding a tool, do not manually add internal links
anywhere except (optionally) `meta.relatedTools` for an explicit override --
the rest is automatic. See
[ARCHITECTURE.md §3](../architecture/ARCHITECTURE.md#3-tool-registry-the-core-abstraction).

## Content quality

- `description` must be genuinely specific to the tool -- "Count words,
  characters, sentences, and paragraphs in your text instantly," not
  "A useful tool for text."
- `faqs` must be real questions a user would search for or ask, with
  complete-sentence answers, not filler.
- No keyword stuffing in `keywords` -- write realistic search phrases, not
  a list of every possible variation of the tool's name.
- Every tool's `longDescription` and `faqs` should mention that processing
  happens locally in the browser where relevant -- this is both accurate
  and a genuine differentiator worth stating, not marketing filler (see
  [writing-standards.md](../writing/writing-standards.md) for tone).

## Verification

After any SEO-relevant change, verify with the Chrome DevTools MCP
Lighthouse audit (`mode: navigation`, both `desktop` and, for layout-
affecting changes, `mobile`) against a **production build**
(`npm run build && npm run preview`), not the dev server -- dev-mode HMR
overhead skews performance metrics and can mask real issues. Target: SEO
100, zero failed audits. See
[testing.md](../testing/testing.md#chrome-devtools-verification) for the
full verification workflow.
