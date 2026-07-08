import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"

const COMBINING_DIACRITICS = new RegExp(String.raw`[̀-ͯ]`, "g")

function toSlug(text: string, separator: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, "g"), "")
}

export default function SlugGenerator() {
  const [text, setText] = useState("")
  const [separator, setSeparator] = useState<"-" | "_">("-")

  const slug = text ? toSlug(text, separator) : ""

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="slug-generator-input">Title</Label>
        <Input
          id="slug-generator-input"
          name="title"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How to Build a Browser Tool Platform"
          className="mt-1.5"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant={separator === "-" ? "default" : "outline"}
          size="sm"
          onClick={() => setSeparator("-")}
        >
          Hyphens
        </Button>
        <Button
          variant={separator === "_" ? "default" : "outline"}
          size="sm"
          onClick={() => setSeparator("_")}
        >
          Underscores
        </Button>
      </div>

      <div>
        <Label htmlFor="slug-generator-output">Slug</Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            id="slug-generator-output"
            name="slug"
            value={slug}
            readOnly
            className="font-mono text-sm"
          />
          <CopyButton value={slug} label="Copy slug" size="icon" />
        </div>
      </div>
    </div>
  )
}
