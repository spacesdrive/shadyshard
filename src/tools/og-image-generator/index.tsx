import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { canvasToBlob } from "@/lib/image"

const WIDTH = 1200
const HEIGHT = 630
const PADDING = 80

interface Theme {
  label: string
  background: string
  text: string
  muted: string
  accent: string
}

const THEMES: Theme[] = [
  {
    label: "Dark",
    background: "#0f172a",
    text: "#f8fafc",
    muted: "#94a3b8",
    accent: "#38bdf8",
  },
  {
    label: "Light",
    background: "#f8fafc",
    text: "#0f172a",
    muted: "#475569",
    accent: "#2563eb",
  },
  {
    label: "Warm",
    background: "#1c1917",
    text: "#fafaf9",
    muted: "#a8a29e",
    accent: "#f59e0b",
  },
]

interface Settings {
  title: string
  description: string
  siteName: string
  background: string
  text: string
  muted: string
  accent: string
}

const DEFAULTS: Settings = {
  title: "",
  description: "",
  siteName: "",
  background: THEMES[0].background,
  text: THEMES[0].text,
  muted: THEMES[0].muted,
  accent: THEMES[0].accent,
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = []
  for (const paragraph of text.split("\n")) {
    let current = ""
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${word}` : word
      if (context.measureText(candidate).width > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = candidate
      }
    }
    lines.push(current)
  }
  return lines.filter((line, index) => line !== "" || index === 0)
}

function draw(canvas: HTMLCanvasElement, settings: Settings) {
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext("2d")
  if (!context) return

  context.fillStyle = settings.background
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.fillStyle = settings.accent
  context.fillRect(0, 0, 14, HEIGHT)

  const maxWidth = WIDTH - PADDING * 2
  const title = settings.title.trim() || "Your page title"

  // Shrink the title until it fits in at most four lines within the safe area.
  let titleSize = 76
  let titleLines: string[] = []
  while (titleSize > 34) {
    context.font = `700 ${titleSize}px system-ui, sans-serif`
    titleLines = wrapText(context, title, maxWidth)
    if (titleLines.length <= 4) break
    titleSize -= 4
  }
  context.font = `700 ${titleSize}px system-ui, sans-serif`
  titleLines = wrapText(context, title, maxWidth).slice(0, 4)

  const descriptionSize = 30
  context.font = `400 ${descriptionSize}px system-ui, sans-serif`
  const descriptionLines = settings.description.trim()
    ? wrapText(context, settings.description.trim(), maxWidth).slice(0, 3)
    : []

  const titleLineHeight = titleSize * 1.2
  const descriptionLineHeight = descriptionSize * 1.45
  const blockHeight =
    titleLines.length * titleLineHeight +
    (descriptionLines.length ? 28 + descriptionLines.length * descriptionLineHeight : 0)

  let cursorY = Math.max(PADDING + titleSize, (HEIGHT - blockHeight) / 2 + titleSize)

  context.textAlign = "left"
  context.textBaseline = "alphabetic"
  context.fillStyle = settings.text
  context.font = `700 ${titleSize}px system-ui, sans-serif`
  for (const line of titleLines) {
    context.fillText(line, PADDING, cursorY)
    cursorY += titleLineHeight
  }

  if (descriptionLines.length) {
    cursorY += 28
    context.fillStyle = settings.muted
    context.font = `400 ${descriptionSize}px system-ui, sans-serif`
    for (const line of descriptionLines) {
      context.fillText(line, PADDING, cursorY)
      cursorY += descriptionLineHeight
    }
  }

  if (settings.siteName.trim()) {
    context.fillStyle = settings.accent
    context.font = `600 26px system-ui, sans-serif`
    context.fillText(settings.siteName.trim().toUpperCase(), PADDING, HEIGHT - PADDING)
  }
}

export default function OgImageGenerator() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, settings)
  }, [settings])

  function update(patch: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...patch }))
  }

  const titleError =
    settings.title.length > 120
      ? "Titles over about 120 characters get shrunk small enough to be hard to read. Consider trimming it."
      : null

  const fileSlug =
    settings.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "og-image"

  return (
    <div className="space-y-5">
      <canvas
        ref={canvasRef}
        className="border-border/60 w-full rounded-lg border"
        role="img"
        aria-label="Preview of the generated Open Graph image"
      />

      <div className="flex flex-wrap gap-2">
        {THEMES.map((theme) => (
          <Button
            key={theme.label}
            variant="outline"
            size="sm"
            onClick={() =>
              update({
                background: theme.background,
                text: theme.text,
                muted: theme.muted,
                accent: theme.accent,
              })
            }
          >
            {theme.label}
          </Button>
        ))}
      </div>

      <div>
        <Label htmlFor="og-title">Title</Label>
        <Input
          id="og-title"
          name="title"
          value={settings.title}
          onChange={(event) => update({ title: event.target.value })}
          placeholder="How we cut our build time in half"
          className="mt-1.5"
          aria-invalid={titleError ? true : undefined}
        />
        {titleError && <p className="text-destructive mt-1.5 text-sm">{titleError}</p>}
      </div>

      <div>
        <Label htmlFor="og-description">Description (optional)</Label>
        <Textarea
          id="og-description"
          name="description"
          value={settings.description}
          onChange={(event) => update({ description: event.target.value })}
          placeholder="A short line of supporting context, up to three lines."
          className="mt-1.5 min-h-20 resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="og-site">Site name (optional)</Label>
          <Input
            id="og-site"
            name="siteName"
            value={settings.siteName}
            onChange={(event) => update({ siteName: event.target.value })}
            placeholder="example.com"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="og-background">Background colour</Label>
          <Input
            id="og-background"
            name="background"
            type="color"
            value={settings.background}
            onChange={(event) => update({ background: event.target.value })}
            className="mt-1.5 h-9 w-full"
          />
        </div>
        <div>
          <Label htmlFor="og-text">Title colour</Label>
          <Input
            id="og-text"
            name="text"
            type="color"
            value={settings.text}
            onChange={(event) => update({ text: event.target.value })}
            className="mt-1.5 h-9 w-full"
          />
        </div>
        <div>
          <Label htmlFor="og-accent">Accent colour</Label>
          <Input
            id="og-accent"
            name="accent"
            type="color"
            value={settings.accent}
            onChange={(event) => update({ accent: event.target.value })}
            className="mt-1.5 h-9 w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <DownloadButton
          getBlob={() =>
            canvasRef.current ? canvasToBlob(canvasRef.current, "image/png") : null
          }
          filename={`${fileSlug}.png`}
          label="Download PNG"
        />
        <Button variant="outline" size="sm" onClick={() => setSettings(DEFAULTS)}>
          Reset
        </Button>
      </div>
    </div>
  )
}
