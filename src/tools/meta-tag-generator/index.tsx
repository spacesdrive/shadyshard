import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;")
}

export default function MetaTagGenerator() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [image, setImage] = useState("")

  const basicTags = [
    title && `<title>${title}</title>`,
    description && `<meta name="description" content="${escapeAttr(description)}" />`,
    url && `<link rel="canonical" href="${escapeAttr(url)}" />`,
  ].filter(Boolean)

  const openGraphTags = [
    title && `<meta property="og:title" content="${escapeAttr(title)}" />`,
    description &&
      `<meta property="og:description" content="${escapeAttr(description)}" />`,
    url && `<meta property="og:url" content="${escapeAttr(url)}" />`,
    image && `<meta property="og:image" content="${escapeAttr(image)}" />`,
    '<meta property="og:type" content="website" />',
  ].filter(Boolean)

  const twitterTags = [
    '<meta name="twitter:card" content="summary_large_image" />',
    title && `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    description &&
      `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    image && `<meta name="twitter:image" content="${escapeAttr(image)}" />`,
  ].filter(Boolean)

  const html = [
    basicTags.join("\n"),
    openGraphTags.join("\n"),
    twitterTags.join("\n"),
  ].join("\n\n")

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="meta-tag-title">Title</Label>
          <span className="text-muted-foreground text-xs">{title.length}/60</span>
        </div>
        <Input
          id="meta-tag-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title"
          className="mt-1.5"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="meta-tag-description">Description</Label>
          <span className="text-muted-foreground text-xs">{description.length}/160</span>
        </div>
        <Textarea
          id="meta-tag-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="One or two sentences describing the page"
          className="mt-1.5 min-h-20 resize-y text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="meta-tag-url">Page URL</Label>
          <Input
            id="meta-tag-url"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="meta-tag-image">Image URL</Label>
          <Input
            id="meta-tag-image"
            name="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/og-image.png"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CopyButton value={html} label="Copy HTML" />
      </div>
      <Textarea
        id="meta-tag-output"
        name="html"
        value={html}
        readOnly
        className="min-h-64 resize-y font-mono text-xs"
        aria-label="Generated meta tags"
      />
    </div>
  )
}
