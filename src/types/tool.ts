import type { ComponentType, LazyExoticComponent } from "react"
import type { LucideIcon } from "lucide-react"

export interface ToolFaq {
  question: string
  answer: string
}

/**
 * The part of a tool's metadata that navigation, search, cards, and the
 * category pages need synchronously, so it is the only part loaded eagerly.
 * Keep this small: every field here ships in the app entry chunk for every
 * tool in the catalog. See ARCHITECTURE.md section 3.
 */
export interface ToolSummary {
  /** URL slug, unique across all tools. e.g. "word-counter" */
  slug: string
  /** Display title, e.g. "Word Counter" */
  title: string
  /** Short one-line description used in cards and meta description fallback */
  description: string
  /** Category slug, must match a slug in categories.ts */
  category: string
  /** SEO keywords */
  keywords: string[]
  /** Search tags, used for fuzzy search matching beyond title/description */
  tags: string[]
  /** Lucide icon component */
  icon: LucideIcon
  /** Marks a tool as newly added, surfaces it on the homepage */
  isNew?: boolean
}

/**
 * The prose-heavy part of a tool's metadata. It is only ever rendered on
 * that tool's own page, so it is loaded on demand rather than eagerly.
 */
export interface ToolDetail {
  /** Longer description shown on the tool page itself, supports plain text paragraphs */
  longDescription?: string
  /** Bullet list of key features shown on the tool page */
  features: string[]
  /** Frequently asked questions, rendered + used for FAQPage structured data */
  faqs: ToolFaq[]
  /** Explicit related tool slugs; if omitted, related tools are inferred by category/tags */
  relatedTools?: string[]
}

/** The complete object every tool's meta.ts default-exports. */
export interface ToolMeta extends ToolSummary, ToolDetail {}

export interface ToolCategory {
  slug: string
  title: string
  description: string
  icon: LucideIcon
}

export type ToolComponent = LazyExoticComponent<ComponentType>
