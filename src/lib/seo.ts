import { site } from "@/lib/site"
import type { ToolCategory } from "@/types/tool"
import type { ToolMeta } from "@/types/tool"

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString()
}

export function breadcrumbSchema(items: { name: string; path: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function toolWebApplicationSchema(meta: ToolMeta): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: meta.title,
    description: meta.description,
    url: absoluteUrl(`/tools/${meta.slug}`),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: meta.features,
  }
}

export function faqSchema(meta: ToolMeta): object | undefined {
  if (!meta.faqs.length) return undefined
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: meta.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function categoryCollectionSchema(
  category: ToolCategory,
  toolTitles: string[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.description,
    url: absoluteUrl(`/category/${category.slug}`),
    hasPart: toolTitles.map((title) => ({
      "@type": "SoftwareApplication",
      name: title,
    })),
  }
}
