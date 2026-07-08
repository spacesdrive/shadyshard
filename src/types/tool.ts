import type { ComponentType, LazyExoticComponent } from "react"
import type { LucideIcon } from "lucide-react"

export interface ToolFaq {
  question: string
  answer: string
}

export interface ToolMeta {
  /** URL slug, unique across all tools. e.g. "word-counter" */
  slug: string
  /** Display title, e.g. "Word Counter" */
  title: string
  /** Short one-line description used in cards and meta description fallback */
  description: string
  /** Longer description shown on the tool page itself, supports plain text paragraphs */
  longDescription?: string
  /** Category slug, must match a slug in categories.ts */
  category: string
  /** SEO keywords */
  keywords: string[]
  /** Search tags, used for fuzzy search matching beyond title/description */
  tags: string[]
  /** Lucide icon component */
  icon: LucideIcon
  /** Bullet list of key features shown on the tool page */
  features: string[]
  /** Frequently asked questions, rendered + used for FAQPage structured data */
  faqs: ToolFaq[]
  /** Explicit related tool slugs; if omitted, related tools are inferred by category/tags */
  relatedTools?: string[]
  /** Marks a tool as newly added, surfaces it on the homepage */
  isNew?: boolean
}

export interface ToolCategory {
  slug: string
  title: string
  description: string
  icon: LucideIcon
}

export interface ToolDefinition {
  meta: ToolMeta
  Component: LazyExoticComponent<ComponentType>
}
