# Writing Standards

Rules for all text: UI copy, tool descriptions and FAQs, documentation,
commit messages, README content, and code comments. For icon usage (a
related but distinct concern), see
[ui/design-system.md § Icons](../ui/design-system.md#icons); for code
comment _content_ rules specifically, see
[engineering/standards.md § Code style](../engineering/standards.md#code-style).

## Typography

- Never use emoji, emoji-as-icons, or emoticons, anywhere -- UI, docs,
  commit messages, generated content.
- Never use em dashes (—).
- Never use en dashes (–) where a plain hyphen (-) is correct.
- Always use a standard ASCII hyphen (-).

## Writing style

Clear, professional English. Avoid unnecessary buzzwords, filler text,
exaggerated marketing language, and repetitive wording. Prefer concise
sentences, descriptive headings, and consistent terminology across the
whole project -- a concept should be called the same thing everywhere
(e.g. "tool registry," not sometimes "tool registry" and sometimes "tool
system" and sometimes "tools index").

This applies to product copy too: a tool's `description` and `faqs` (see
[tool-development.md](../engineering/tool-development.md)) should read like
a knowledgeable person explaining the tool, not like ad copy. "Count words,
characters, sentences, and paragraphs in your text instantly" is the
standard to match; "The ultimate word counting solution!" is not.

## Markdown

Use clean, standard Markdown: headings, bullet lists, numbered lists, and
tables where a table is genuinely clearer than prose (comparison of
options, field references). Avoid excessive bold formatting -- bold is for
genuine emphasis or the occasional key term, not for making every noun
phrase stand out.

## Where this doesn't apply

Code identifiers (variable names, file names, slugs) follow
[engineering/standards.md § Naming
conventions](../engineering/standards.md#naming-conventions), not this
document -- `kebab-case` slugs and `camelCase` variables are correct even
though they'd read strangely as prose.
