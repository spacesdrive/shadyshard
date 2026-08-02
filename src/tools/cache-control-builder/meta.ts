import { Gauge } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "cache-control-builder",
  title: "Cache-Control Header Builder",
  description:
    "Build a Cache-Control header from plain-language options and see exactly what each directive does.",
  longDescription:
    "Cache-Control is easy to get wrong because the directives interact: no-cache does not mean do not cache, max-age and s-maxage apply to different caches, and immutable only helps a URL that never changes. This builder lets you pick the behaviour you want, shows the header it produces, explains every directive in the result in plain language, and warns about combinations that contradict each other. Presets cover the common cases such as fingerprinted build assets, an HTML page behind a CDN, and a private API response. Nothing is sent anywhere; the header is assembled in your browser.",
  category: "developer",
  keywords: [
    "cache-control header generator",
    "max-age calculator",
    "stale-while-revalidate",
    "http caching header builder",
    "no-store vs no-cache",
  ],
  tags: ["http", "cache", "header", "cdn", "performance", "generator"],
  icon: Gauge,
  features: [
    "Presets for build assets, HTML pages, and private API responses",
    "Separate browser and shared cache lifetimes with readable units",
    "stale-while-revalidate and stale-if-error support",
    "Plain-language explanation of every directive in the result",
    "Warnings for directives that contradict each other",
  ],
  faqs: [
    {
      question: "What is the difference between no-cache and no-store?",
      answer:
        "no-store tells every cache not to keep a copy at all, which is what a response containing personal or financial data needs. no-cache does allow a copy to be stored, but it must be revalidated with the origin before each reuse, which is what an HTML page that changes often wants so it can still benefit from a 304 response.",
    },
    {
      question: "When should I use immutable?",
      answer:
        "Only on a URL whose content can never change, which in practice means a filename with a content hash in it. It tells the browser not to revalidate even when the user presses reload, so setting it on a URL you might later overwrite will serve stale content until max-age expires.",
    },
    {
      question: "What does stale-while-revalidate actually change?",
      answer:
        "After max-age runs out, the cache is allowed to serve the stale copy immediately and fetch a fresh one in the background, so the next visitor gets fresh content and this one does not wait. It needs max-age alongside it, because max-age is what defines when the response becomes stale.",
    },
    {
      question: "Why do I need both max-age and s-maxage?",
      answer:
        "max-age applies to every cache, including the visitor's browser. s-maxage overrides it for shared caches such as a CDN. Setting a short max-age and a long s-maxage is the usual pattern for HTML: the CDN holds the page and can be purged, while the browser checks back quickly.",
    },
  ],
}

export default meta
