# UI Design System

The actual, implemented visual system -- not aspirational guidelines. Source
of truth for tokens is [`src/index.css`](../../src/index.css); source of
truth for components is [`src/components/ui/`](../../src/components/ui/)
(shadcn-generated) and [`src/components/layout/`](../../src/components/layout/),
[`src/components/tool/`](../../src/components/tool/) (hand-authored,
composed from `ui/`).

## Foundation: shadcn/ui on Base UI

Style: `base-nova`. Primitive library: **Base UI** (`@base-ui/react`), _not_
Radix. This choice and its trade-offs are recorded in
[decisions.md ADR-002](../architecture/decisions.md#adr-002-shadcnui-on-base-ui-base-nova-style-not-radix).

### Composition: `render`, not `asChild`

The single most important gotcha in this codebase's UI layer. Radix-based
shadcn examples (including most AI training data and most shadcn docs
snippets found online) use:

```tsx
{
  /* WRONG for this project -- Radix pattern, does not exist in Base UI */
}
;<Button asChild>
  <Link to="/">Home</Link>
</Button>
```

Base UI composes via a `render` prop instead:

```tsx
{
  /* Correct for this project */
}
;<Button render={<Link to="/">Home</Link>} />
```

When the trigger needs its own children separate from the rendered element
(e.g. an icon button inside a `Sheet`), pass the whole element via `render`
and put content inside it directly, not as children of the outer
component:

```tsx
<SheetTrigger
  render={
    <Button variant="ghost" size="icon" aria-label="Open menu">
      <Menu className="size-4.5" />
    </Button>
  }
/>
```

This applies to every Base UI primitive trigger/composable in
`components/ui/`: `Button`, `DropdownMenuTrigger`, `SheetTrigger`,
`TooltipTrigger`, etc. If TypeScript rejects an `asChild` prop as not
existing on a component, this is why -- switch to `render`.

### Labeling a `Slider`

Do not label a `Slider` with `<Label htmlFor="some-id">` the way you would
an `Input` or `Textarea`. `Slider.Root` is not a labelable form element --
Base UI's accessible name for a single-thumb slider lives on the internal
`Slider.Thumb`. This project's `components/ui/slider.tsx` has been patched
(see [decisions.md
ADR-010](../architecture/decisions.md#adr-010-fixed-a-labeling-defect-in-the-vendored-slider-primitive))
to accept `aria-label` and forward it to the thumb, so the correct pattern
is:

```tsx
{/* Correct: aria-label directly on Slider, no separate <Label> element */}
<span className="text-sm font-medium">Length</span>
<Slider aria-label="Password length" value={[length]} onValueChange={...} />
```

Use a plain `<span>` (not the `Label` component) for any adjacent visible
text -- `Label` renders a real `<label>` element, and an unassociated
`<label>` with no `htmlFor` target is itself flagged by Lighthouse as an
orphaned label. See
[accessibility.md](../accessibility/accessibility.md#form-fields) for the
general form-labeling rules this is a special case of.

## Color tokens

Defined in `src/index.css` as CSS custom properties, mapped into Tailwind
v4's `@theme inline` block (so they're usable as `bg-background`,
`text-foreground`, etc.), in OKLCH color space, with separate `:root`
(light) and `.dark` value sets:

`background`, `foreground`, `card` / `card-foreground`, `popover` /
`popover-foreground`, `primary` / `primary-foreground`, `secondary` /
`secondary-foreground`, `muted` / `muted-foreground`, `accent` /
`accent-foreground`, `destructive`, `border`, `input`, `ring`, `chart-1`
through `chart-5`, `sidebar` and its variants.

Never hard-code a hex/rgb color in a component. Use the semantic token
(`text-muted-foreground`, `border-border`, `bg-destructive/10`) so the
component is correct in both themes automatically.

## Radius scale

One `--radius` base value (`0.625rem`), with `--radius-sm` through
`--radius-4xl` derived from it via `calc()` multipliers in the `@theme`
block. Use the Tailwind radius utilities (`rounded-lg`, `rounded-xl`) that
map to these tokens rather than an arbitrary `rounded-[Npx]` value.

## Typography

Font: **Geist Variable**, self-hosted via `@fontsource-variable/geist`
(imported in `index.css`), not loaded from an external font CDN --
deliberate, both for the no-external-requests privacy posture and for
performance (no third-party font request in the critical path).

Heading sizes follow Tailwind's default type scale (`text-2xl`/`text-3xl`
for page `h1`, `text-xl` for section `h2`). See
[seo-standards.md](../seo/seo-standards.md#heading-hierarchy) for the
_structural_ heading rules (one `h1`, no skipped levels) -- that's a
correctness rule, distinct from the visual sizing covered here.

## Icons

**Library: `lucide-react` exclusively.** A `ToolMeta.icon` and
`ToolCategory.icon` field is always a Lucide icon _component reference_
(`import { FileText } from "lucide-react"`), never a string name to look up
at runtime, and never an emoji (see
[writing-standards.md](../writing/writing-standards.md) for the
project-wide no-emoji rule, which applies to icons too).

Size convention observed across the codebase: `size-4` for inline/dense UI
(buttons, list items), `size-4.5` for header icon buttons, `size-5` for
card/category icons, `size-6` for the large icon shown at the top of a tool
page. Stay within this scale rather than picking an arbitrary size.

## Dark mode

Class-based (`.dark` on `<html>`), default theme is **dark**, with light
and system options via `ThemeProvider`
([`src/hooks/use-theme.tsx`](../../src/hooks/use-theme.tsx)). An inline
script in `index.html` sets the class before React mounts to prevent a
flash of the wrong theme -- see
[decisions.md ADR-008](../architecture/decisions.md#adr-008-dark-mode-first-with-class-based-toggling-and-an-inline-anti-fouc-script)
for why this exists in two places and must be kept in sync.

Every component must render correctly in both themes using semantic color
tokens (see above) -- never assume dark mode when writing a component, even
though it's the default.

`src/index.css` sets the CSS `color-scheme` property (`light` on `:root`,
`dark` on `.dark`) alongside the token overrides. Without this, browser-native
form control chrome that Tailwind classes cannot reach -- an `<input
type="date">`'s calendar popup, `<input type="number">` spinner arrows,
scrollbars -- renders using the OS's light/dark preference instead of the
app's actual theme, producing a white popup on an otherwise dark page. This
was a real bug: a raw `<select>` element styled only with Tailwind classes
still opened a light-background native dropdown in dark mode, because
Tailwind can style the closed trigger but not the browser-rendered options
popup. The fix for a `<select>` specifically is to use `components/ui/select.tsx`
(Base UI, portal-rendered, follows the `popover`/`popover-foreground`
tokens like any other themed primitive) rather than a raw `<select>` --
see [Component consistency checklist](#component-consistency-checklist).
`color-scheme` is the remaining fix for the handful of native controls
with no themed shadcn equivalent (`type="date"`, `type="number"`).

## Layout and spacing

- Page-width containers: `max-w-7xl` for grid/card layouts (homepage,
  category pages), `max-w-4xl` for a tool page's content column,
  `max-w-3xl`/`max-w-2xl` for prose-only static pages (About, Privacy,
  Terms).
- Consistent horizontal padding: `px-4 sm:px-6` on every page container.
- Consistent vertical rhythm: `py-8`/`py-12` between major page sections.
- Card-style containers use `rounded-xl border border-border/60` (cards,
  tool containers) or `rounded-lg` for smaller elements (buttons, inputs,
  badges) -- see [Radius scale](#radius-scale).

## Responsive breakpoints

Standard Tailwind defaults (`sm`, `md`, `lg`), mobile-first. The
established pattern: single-column mobile layout, `sm:grid-cols-2`,
`lg:grid-cols-3` for card grids; desktop nav hidden below `md`, replaced by
a `Sheet`-based mobile menu (see `components/layout/Header.tsx`). Every new
page or component must be checked at a mobile viewport (390×844 is the
size used during verification) before being considered done -- see
[testing.md](../testing/testing.md).

## Animation

**Minimal**, per product principle -- `framer-motion` is a dependency but
used sparingly, not as a default on every element. Component-level
open/close transitions (accordion, dialog, sheet, dropdown) use Base UI's
built-in data-state-driven CSS transitions plus `tw-animate-css` utility
classes, not `framer-motion` -- reserve `framer-motion` for genuinely
custom, non-primitive animation needs.

## Component consistency checklist

Before adding a new UI pattern, check whether an existing
`components/ui/*` primitive already covers it (see [shadcn
MCP](../mcp/mcp-usage.md#shadcn-mcp) for how to browse/add more). Do not
hand-build a dialog, dropdown, tooltip, or form control from scratch --
these all exist as generated primitives. Compose from them; only add
project-specific styling/behavior in the consuming component
(`components/tool/`, `components/layout/`), never by forking a `ui/`
primitive.
