# Accessibility

ShadyShard targets Lighthouse Accessibility 100 on every page. This is
verified, not assumed -- see [testing.md](../testing/testing.md#chrome-devtools-verification).
This document covers the concrete rules; for the visual/dark-mode side of
contrast and focus styling, see [ui/design-system.md](../ui/design-system.md).

## Semantic HTML and landmarks

Use the correct element for the job before reaching for a `<div>` +
`role`/ARIA. `RootLayout` establishes the page landmarks once
(`<header>`, `<main id="main-content">`, `<footer>`) -- pages render inside
`<main>` and should not introduce a second `<main>` or duplicate landmark.
Every page includes exactly one `<h1>`.

A skip-link (`Skip to content`, jumps to `#main-content`) is rendered in
`RootLayout` before the header, visually hidden until focused. Do not
remove it; do not add a second one on a per-page basis.

## Heading hierarchy

No skipped levels (`h1 → h3` without an intervening `h2` fails Lighthouse's
`heading-order` audit -- this happened once already, see
[seo-standards.md](../seo/seo-standards.md#heading-hierarchy) for the
concrete incident and fix). If a section has no visually appropriate
heading, give it a `sr-only` one rather than skipping a level.

## Keyboard navigation

Everything interactive must be reachable and operable by keyboard alone:
Tab order should follow visual/logical order, all buttons/links/form
controls must be natively focusable elements (not `<div onClick>`), and the
global search (`Ctrl/Cmd+K`) must remain keyboard-openable in addition to
its visible trigger button. Base UI primitives handle correct keyboard
behavior (arrow-key navigation in menus/comboboxes, `Escape` to close
dialogs, focus trapping) out of the box -- do not override or intercept
their key handlers unless there's a specific documented reason.

## Focus states

Every interactive element must have a visible focus indicator. This comes
for free from the shadcn `ui/` primitives' built-in `focus-visible:` ring
styles (`focus-visible:ring-3 focus-visible:ring-ring/50`, see
[design-system.md](../ui/design-system.md#color-tokens)) -- never add
`outline-none` to an interactive element without also supplying an
equivalent visible focus style.

## Form fields

Every form field (`<input>`, `<textarea>`, `<select>`) must have both an
`id` and a `name` attribute, **even when it also has an `aria-label`**.
This is a real requirement, not theoretical: Chrome DevTools flagged "A
form field element should have an id or name attribute" as a console issue
during initial tool development, on inputs that had `aria-label` but no
`id`/`name`. `aria-label` covers the accessible _name_; `id`/`name` covers
autofill and form-association semantics, which is a separate check. See
the pattern already applied in
[`src/tools/color-converter/index.tsx`](../../src/tools/color-converter/index.tsx)
(`id`/`name` on every input, including the native `<input type="color">`,
plus a `<Label htmlFor>` for the readable copy-output fields).

## Color contrast

Handled by the semantic color token system (see
[design-system.md](../ui/design-system.md#color-tokens)) -- tokens are
chosen to meet contrast requirements in both themes. Never introduce a
custom color value for text without checking contrast against its
background in both light and dark mode.

## ARIA usage

Use ARIA only when semantic HTML genuinely cannot express the relationship
-- e.g. `aria-hidden` on purely decorative icons that sit next to visible
text (established pattern throughout the codebase: every Lucide icon used
alongside a text label has `aria-hidden` unless it's the _only_ accessible
label, in which case use `aria-label` on the interactive element instead).
Prefer a native disabled/checked/expanded attribute over a corresponding
`aria-*` attribute when the underlying element supports it natively.

## Screen reader support

Any icon-only interactive element -- a `<button>` **or a `<Link>`/`<a>`**
-- must have `aria-label` describing the action or destination, not the
icon. This includes icon-only buttons (theme toggle, mobile menu trigger,
search icon on mobile) and icon-only links: the `Breadcrumbs` component's
Home icon link was shipped without one and was caught by Lighthouse's
`link-name` audit ("Links do not have a discernible name") once a page
using it was audited -- see
[`components/layout/Breadcrumbs.tsx`](../../src/components/layout/Breadcrumbs.tsx)
for the fix (`aria-label="Home"` on the link). Breadcrumb navigation itself
is wrapped in `<nav aria-label="Breadcrumb">`. FAQ accordions use the
shadcn `Accordion` primitive, which handles `aria-expanded`/`aria-controls`
automatically -- don't hand-roll one.

Non-form interactive controls that aren't a plain `<input>`/`<textarea>`
(e.g. a `Slider`) have their own labeling pattern -- see
[design-system.md § Labeling a
Slider](../ui/design-system.md#labeling-a-slider) rather than reaching for
`<Label htmlFor>`, which does not work for them.

The same orphaned-`<label>` failure mode also shows up when `Label` is
reached for as a plain section heading above something that isn't a single
form field -- e.g. a button group (QR Code Generator's "Error correction"
row shipped this way initially). `Label` always renders a real `<label>`
element; if there's no single field for it to point at via `htmlFor`, use
a plain `<span>` instead, and add `role="group"` with `aria-label` on the
button row itself if the grouping needs to be conveyed to assistive tech.

## Verification

Every UI change gets checked via the Chrome DevTools MCP before being
considered complete: an accessibility tree snapshot
(`take_snapshot`) reviewed for missing labels or broken landmark structure,
and a Lighthouse accessibility audit against a production build. Target is
100 with zero failed audits. Prior violations caught this way, not by
manual inspection: missing form `id`/`name` attributes, a `heading-order`
skip, an unlabeled icon-only breadcrumb link (`link-name`), and an invalid
`<label for>` targeting a non-labelable `Slider` followed by an orphaned
`<label>` once the invalid `for` was simply removed -- see [decisions.md
ADR-010](../architecture/decisions.md#adr-010-fixed-a-labeling-defect-in-the-vendored-slider-primitive)
for how that last one was actually resolved.

When adding many tools in one batch (50 tools were added in a single pass
that grew the catalog from 12), per-page manual snapshot review does not
scale to catching every instance of a repeated mistake. What worked: after
fixing one instance of a pattern (e.g. a readonly output `Textarea` missing
`id`/`name`), grep the entire `src/tools/` tree for the same pattern before
moving on, rather than trusting that Lighthouse will happen to audit every
affected page in the same session. A plain single-line regex is not
enough for this -- JSX attributes routinely span multiple lines, so a
same-line-only grep will silently miss most real instances; parse the
whole tag block (open angle bracket to matching close) instead. Full
verification process:
[testing.md](../testing/testing.md#chrome-devtools-verification).
