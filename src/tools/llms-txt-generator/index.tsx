import { useMemo, useState } from "react"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

interface Section {
  id: number
  title: string
  links: string
}

interface ParsedLink {
  title: string
  url: string
  notes: string
}

const LINK_HINT =
  "One link per line, written as Title | https://example.com/page | optional note"

function parseLinks(
  sectionTitle: string,
  raw: string,
): { links: ParsedLink[]; problems: string[] } {
  const links: ParsedLink[] = []
  const problems: string[] = []

  raw.split("\n").forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) return
    const [title = "", url = "", ...rest] = trimmed.split("|").map((part) => part.trim())
    const where = `${sectionTitle || "Untitled section"}, line ${index + 1}`

    if (!title) {
      problems.push(`${where}: the link needs a title before the first vertical bar.`)
      return
    }
    if (!url) {
      problems.push(`${where}: the link needs a URL after the first vertical bar.`)
      return
    }

    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      problems.push(
        `${where}: "${url}" is not an absolute URL. Include the scheme and domain, for example https://example.com/docs.`,
      )
      return
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      problems.push(`${where}: only http and https URLs belong in llms.txt.`)
      return
    }

    links.push({ title, url: parsed.toString(), notes: rest.join(" | ") })
  })

  return { links, problems }
}

function buildFile(
  name: string,
  summary: string,
  details: string,
  sections: Section[],
): { output: string; problems: string[] } {
  const problems: string[] = []
  if (!name.trim())
    problems.push("The site name is required, since it becomes the heading.")

  const lines: string[] = [`# ${name.trim() || "Site name"}`]
  if (summary.trim()) lines.push("", `> ${summary.trim().replace(/\s+/g, " ")}`)
  if (details.trim()) lines.push("", details.trim())

  for (const section of sections) {
    const { links, problems: sectionProblems } = parseLinks(section.title, section.links)
    problems.push(...sectionProblems)
    if (!section.title.trim()) {
      if (links.length > 0) problems.push("A section with links needs a title.")
      continue
    }
    if (links.length === 0) continue

    lines.push("", `## ${section.title.trim()}`, "")
    for (const link of links) {
      lines.push(`- [${link.title}](${link.url})${link.notes ? `: ${link.notes}` : ""}`)
    }
  }

  return { output: `${lines.join("\n")}\n`, problems }
}

export default function LlmsTxtGenerator() {
  const [name, setName] = useState("")
  const [summary, setSummary] = useState("")
  const [details, setDetails] = useState("")
  const [sections, setSections] = useState<Section[]>([
    { id: 1, title: "Docs", links: "" },
    { id: 2, title: "Optional", links: "" },
  ])
  const [nextId, setNextId] = useState(3)

  const { output, problems } = useMemo(
    () => buildFile(name, summary, details, sections),
    [name, summary, details, sections],
  )

  function updateSection(id: number, patch: Partial<Section>) {
    setSections((current) =>
      current.map((section) => (section.id === id ? { ...section, ...patch } : section)),
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="llms-name">
          Site or project name<span className="text-destructive"> *</span>
        </Label>
        <Input
          id="llms-name"
          name="siteName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Acme Analytics"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="llms-summary">One-line summary</Label>
        <Input
          id="llms-summary"
          name="summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Product analytics for small teams, with a free self-hosted tier."
          className="mt-1.5"
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Rendered as a blockquote directly under the heading.
        </p>
      </div>

      <div>
        <Label htmlFor="llms-details">Additional context</Label>
        <Textarea
          id="llms-details"
          name="details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Anything a model should know before quoting the site: what the product does, who it is for, and terminology it should use."
          className="mt-1.5 min-h-24 resize-y text-sm"
        />
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border-border/60 rounded-lg border p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor={`llms-section-${section.id}`}>Section title</Label>
                <Input
                  id={`llms-section-${section.id}`}
                  name={`sectionTitle-${section.id}`}
                  value={section.title}
                  onChange={(event) =>
                    updateSection(section.id, { title: event.target.value })
                  }
                  placeholder="Docs"
                  className="mt-1.5"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Remove the ${section.title || "untitled"} section`}
                disabled={sections.length === 1}
                onClick={() =>
                  setSections((current) =>
                    current.filter((entry) => entry.id !== section.id),
                  )
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="mt-3">
              <Label htmlFor={`llms-links-${section.id}`}>Links</Label>
              <Textarea
                id={`llms-links-${section.id}`}
                name={`sectionLinks-${section.id}`}
                value={section.links}
                onChange={(event) =>
                  updateSection(section.id, { links: event.target.value })
                }
                placeholder={
                  "Quickstart | https://example.com/docs/quickstart | Install and first query"
                }
                className="mt-1.5 min-h-24 resize-y font-mono text-sm"
                spellCheck={false}
              />
              <p className="text-muted-foreground mt-1 text-xs">{LINK_HINT}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setSections((current) => [...current, { id: nextId, title: "", links: "" }])
          setNextId((current) => current + 1)
        }}
      >
        <Plus className="size-4" />
        Add section
      </Button>

      {problems.length > 0 && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <ul className="space-y-1">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <Label htmlFor="llms-output">llms.txt</Label>
        <Textarea
          id="llms-output"
          name="output"
          value={output}
          readOnly
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy file" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: "text/markdown" })}
          filename="llms.txt"
          disabled={problems.length > 0}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setName("")
            setSummary("")
            setDetails("")
            setSections([
              { id: 1, title: "Docs", links: "" },
              { id: 2, title: "Optional", links: "" },
            ])
            setNextId(3)
          }}
        >
          Reset
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        Upload the file to the root of your domain so it is served at
        https://yourdomain.com/llms.txt as plain text.
      </p>
    </div>
  )
}
