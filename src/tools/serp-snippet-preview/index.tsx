import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

type Device = "desktop" | "mobile"

interface FieldLimits {
  font: string
  maxWidth: number
}

const LIMITS: Record<Device, { title: FieldLimits; description: FieldLimits }> = {
  desktop: {
    title: { font: "20px Arial, sans-serif", maxWidth: 580 },
    description: { font: "14px Arial, sans-serif", maxWidth: 920 },
  },
  mobile: {
    title: { font: "18px Arial, sans-serif", maxWidth: 470 },
    description: { font: "14px Arial, sans-serif", maxWidth: 680 },
  },
}

let sharedContext: CanvasRenderingContext2D | null | undefined

/** Google truncates snippets by rendered width, so widths come from real text metrics. */
function measureWidth(text: string, font: string): number | null {
  if (sharedContext === undefined) {
    sharedContext = document.createElement("canvas").getContext("2d")
  }
  if (!sharedContext) return null
  sharedContext.font = font
  return Math.round(sharedContext.measureText(text).width)
}

function truncateToWidth(text: string, limits: FieldLimits): string {
  const width = measureWidth(text, limits.font)
  if (width === null || width <= limits.maxWidth) return text

  let end = text.length
  while (end > 0) {
    const candidate = text.slice(0, end).trimEnd() + "..."
    const candidateWidth = measureWidth(candidate, limits.font)
    if (candidateWidth === null || candidateWidth <= limits.maxWidth) return candidate
    end -= 1
  }
  return "..."
}

function parseUrl(value: string): { url: URL | null; error: string | null } {
  const trimmed = value.trim()
  if (!trimmed) return { url: null, error: null }
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname)) {
      return {
        url: null,
        error: "Enter a full domain, for example example.com/blog/post.",
      }
    }
    return { url, error: null }
  } catch {
    return { url: null, error: "That is not a valid URL. Try example.com/blog/post." }
  }
}

function breadcrumb(url: URL): string {
  const segments = url.pathname.split("/").filter(Boolean).map(decodeURIComponent)
  return [url.hostname.replace(/^www\./, ""), ...segments].join(" > ")
}

interface MeterProps {
  label: string
  text: string
  limits: FieldLimits
}

function Meter({ label, text, limits }: MeterProps) {
  const width = measureWidth(text, limits.font)
  const percent = width === null ? 0 : Math.min(100, (width / limits.maxWidth) * 100)
  const over = width !== null && width > limits.maxWidth

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span
          className={
            over
              ? "text-destructive text-xs tabular-nums"
              : "text-muted-foreground text-xs tabular-nums"
          }
        >
          {text.length} characters
          {width !== null && ` / ${width} of ${limits.maxWidth} px`}
          {over && " (will be truncated)"}
        </span>
      </div>
      <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
        <div
          className={over ? "bg-destructive h-full" : "bg-primary h-full"}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default function SerpSnippetPreview() {
  const [pageUrl, setPageUrl] = useState("https://example.com/guides/serp-snippets")
  const [title, setTitle] = useState("How to write a title tag that fits in Google")
  const [description, setDescription] = useState(
    "A practical guide to writing title tags and meta descriptions that survive Google truncation, with the pixel widths that actually matter.",
  )
  const [device, setDevice] = useState<Device>("desktop")

  const { url, error } = useMemo(() => parseUrl(pageUrl), [pageUrl])
  const limits = LIMITS[device]

  const shownTitle = truncateToWidth(title.trim(), limits.title)
  const shownDescription = truncateToWidth(description.trim(), limits.description)

  function handleReset() {
    setPageUrl("")
    setTitle("")
    setDescription("")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="serp-url">Page URL</Label>
          <Input
            id="serp-url"
            name="pageUrl"
            value={pageUrl}
            onChange={(event) => setPageUrl(event.target.value)}
            placeholder="https://example.com/blog/post"
            className="mt-1.5"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
          />
        </div>

        <div>
          <Label htmlFor="serp-title">Title tag</Label>
          <Input
            id="serp-title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Your page title"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="serp-description">Meta description</Label>
          <Textarea
            id="serp-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Your meta description"
            className="mt-1.5 min-h-20 resize-y"
          />
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={device} onValueChange={(value) => setDevice(value as Device)}>
          <TabsList>
            <TabsTrigger value="desktop">Desktop</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="ml-auto flex flex-wrap gap-2">
          <CopyButton value={title} label="Copy title" />
          <CopyButton value={description} label="Copy description" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!pageUrl && !title && !description}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="border-border/60 rounded-xl border bg-white p-4 dark:bg-neutral-900">
        <div className={device === "mobile" ? "max-w-[26rem]" : "max-w-[38rem]"}>
          <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">
            {url ? breadcrumb(url) : "example.com"}
          </p>
          <p className="mt-1 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
            {shownTitle || "Your title tag appears here"}
          </p>
          <p className="mt-1 text-sm leading-snug text-neutral-700 dark:text-neutral-300">
            {shownDescription || "Your meta description appears here."}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Meter label="Title width" text={title.trim()} limits={limits.title} />
        <Meter
          label="Description width"
          text={description.trim()}
          limits={limits.description}
        />
      </div>
    </div>
  )
}
