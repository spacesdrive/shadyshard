import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"

function splitWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean)
}

const CASES: { label: string; convert: (text: string) => string }[] = [
  { label: "UPPERCASE", convert: (t) => t.toUpperCase() },
  { label: "lowercase", convert: (t) => t.toLowerCase() },
  {
    label: "Title Case",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" "),
  },
  {
    label: "Sentence case",
    convert: (t) => {
      const lower = t.toLowerCase()
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    },
  },
  {
    label: "camelCase",
    convert: (t) =>
      splitWords(t)
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
        )
        .join(""),
  },
  {
    label: "PascalCase",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(""),
  },
  {
    label: "snake_case",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.toLowerCase())
        .join("_"),
  },
  {
    label: "kebab-case",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.toLowerCase())
        .join("-"),
  },
  {
    label: "CONSTANT_CASE",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.toUpperCase())
        .join("_"),
  },
]

export default function CaseConverter() {
  const [text, setText] = useState("")

  return (
    <div className="space-y-6">
      <Textarea
        id="case-converter-input"
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text here..."
        className="min-h-32 resize-y text-sm"
        aria-label="Text to convert"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {CASES.map(({ label, convert }) => {
          const id = `case-converter-${label.replace(/[^a-zA-Z]/g, "").toLowerCase()}`
          const value = text ? convert(text) : ""
          return (
            <div key={label}>
              <Label htmlFor={id} className="text-muted-foreground text-xs">
                {label}
              </Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  id={id}
                  name={id}
                  value={value}
                  readOnly
                  className="font-mono text-sm"
                />
                <CopyButton value={value} label={`Copy ${label}`} size="icon" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
