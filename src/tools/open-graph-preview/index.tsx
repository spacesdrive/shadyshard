import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export default function OpenGraphPreview() {
  const [title, setTitle] = useState("Building ShadyShard: privacy-first browser tools")
  const [description, setDescription] = useState(
    "A growing collection of fast, free tools that run entirely in your browser. No uploads, no accounts, no tracking.",
  )
  const [image, setImage] = useState("")
  const [url, setUrl] = useState("https://shadyshard.com")

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="og-title">Title</Label>
          <Input
            id="og-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="og-url">URL</Label>
          <Input
            id="og-url"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="og-description">Description</Label>
        <Textarea
          id="og-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1.5 min-h-20 resize-y text-sm"
        />
      </div>

      <div>
        <Label htmlFor="og-image">Image URL</Label>
        <Input
          id="og-image"
          name="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/og-image.png"
          className="mt-1.5"
        />
      </div>

      <div className="border-border/60 mx-auto max-w-md overflow-hidden rounded-xl border">
        <div className="bg-muted aspect-[1.91/1] w-full">
          {image && (
            <img
              src={image}
              alt=""
              className="size-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
        <div className="space-y-1 p-3">
          <p className="text-muted-foreground truncate text-xs uppercase">
            {getDomain(url)}
          </p>
          <p className="truncate text-sm font-semibold">{title || "Page title"}</p>
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {description || "Page description"}
          </p>
        </div>
      </div>
    </div>
  )
}
