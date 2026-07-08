import { Helmet } from "react-helmet-async"
import { site } from "@/lib/site"
import { absoluteUrl } from "@/lib/seo"

interface SeoProps {
  title: string
  description: string
  path: string
  image?: string
  jsonLd?: object[]
  noindex?: boolean
}

export function Seo({
  title,
  description,
  path,
  image = site.ogImage,
  jsonLd = [],
  noindex = false,
}: SeoProps) {
  const fullTitle = title === site.name ? title : `${title} - ${site.name}`
  const canonical = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={site.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {jsonLd.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
