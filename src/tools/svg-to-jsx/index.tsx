import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { nodeToJsx } from "@/lib/jsx"

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>`

interface Options {
  componentName: string
  useCurrentColor: boolean
  spreadProps: boolean
  typescript: boolean
  removeSize: boolean
}

interface ConversionResult {
  code: string
  error: string | null
}

function indentBlock(code: string, spaces: number): string {
  const pad = " ".repeat(spaces)
  return code
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n")
}

function convert(markup: string, options: Options): ConversionResult {
  const parsed = new DOMParser().parseFromString(markup, "image/svg+xml")
  const parseError = parsed.querySelector("parsererror")
  if (parseError) {
    return {
      code: "",
      error: `This is not valid SVG: ${parseError.textContent?.trim().split("\n")[0] ?? "the XML could not be parsed"}`,
    }
  }

  const root = parsed.documentElement
  if (!root || root.tagName.toLowerCase() !== "svg") {
    return { code: "", error: "The markup must start with an <svg> element." }
  }

  if (options.removeSize) {
    root.removeAttribute("width")
    root.removeAttribute("height")
  }

  const element = nodeToJsx(
    root,
    {
      indentUnit: "  ",
      useCurrentColor: options.useCurrentColor,
      spreadPropsOnRoot: options.spreadProps,
      stripComments: true,
    },
    0,
    true,
  )

  const safeName = /^[A-Z][\w$]*$/.test(options.componentName)
    ? options.componentName
    : "Icon"

  const signature = options.spreadProps
    ? options.typescript
      ? `export default function ${safeName}(props: SVGProps<SVGSVGElement>) {`
      : `export default function ${safeName}(props) {`
    : `export default function ${safeName}() {`

  const imports =
    options.typescript && options.spreadProps
      ? 'import type { SVGProps } from "react"\n\n'
      : ""

  return {
    code: `${imports}${signature}\n  return (\n${indentBlock(element, 4)}\n  )\n}\n`,
    error: null,
  }
}

export default function SvgToJsx() {
  const [markup, setMarkup] = useState(SAMPLE)
  const [componentName, setComponentName] = useState("PlusIcon")
  const [useCurrentColor, setUseCurrentColor] = useState(true)
  const [spreadProps, setSpreadProps] = useState(true)
  const [typescript, setTypescript] = useState(true)
  const [removeSize, setRemoveSize] = useState(false)
  const [readError, setReadError] = useState<string | null>(null)

  const result = useMemo(() => {
    if (!markup.trim()) return { code: "", error: null } as ConversionResult
    return convert(markup, {
      componentName,
      useCurrentColor,
      spreadProps,
      typescript,
      removeSize,
    })
  }, [markup, componentName, useCurrentColor, spreadProps, typescript, removeSize])

  async function handleFiles(files: File[]) {
    const file = files[0]
    if (!file) return
    if (!/\.svg$/i.test(file.name) && file.type !== "image/svg+xml") {
      setReadError("That file is not an SVG.")
      return
    }
    setReadError(null)
    setMarkup(await file.text())
    const base = file.name.replace(/\.svg$/i, "").replace(/[^A-Za-z0-9]+/g, " ")
    const pascal = base
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")
    if (pascal) setComponentName(pascal)
  }

  return (
    <div className="space-y-4">
      <FileDropZone accept=".svg,image/svg+xml" onFiles={handleFiles} hint="SVG files" />

      <div>
        <Label htmlFor="svg-jsx-input">SVG markup</Label>
        <Textarea
          id="svg-jsx-input"
          name="svg"
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          value={markup}
          onChange={(event) => setMarkup(event.target.value)}
          placeholder="Paste your SVG here, or drop a file above"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="svg-component-name">Component name</Label>
          <Input
            id="svg-component-name"
            name="componentName"
            className="mt-1.5"
            value={componentName}
            onChange={(event) => setComponentName(event.target.value)}
            placeholder="PlusIcon"
          />
        </div>

        <div className="space-y-3 sm:pt-6">
          <div className="flex items-center gap-2">
            <Switch
              id="svg-current-color"
              name="useCurrentColor"
              checked={useCurrentColor}
              onCheckedChange={setUseCurrentColor}
            />
            <Label htmlFor="svg-current-color" className="font-normal">
              Use currentColor
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="svg-spread-props"
              name="spreadProps"
              checked={spreadProps}
              onCheckedChange={setSpreadProps}
            />
            <Label htmlFor="svg-spread-props" className="font-normal">
              Spread props on the root
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="svg-typescript"
              name="typescript"
              checked={typescript}
              onCheckedChange={setTypescript}
            />
            <Label htmlFor="svg-typescript" className="font-normal">
              TypeScript
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="svg-remove-size"
              name="removeSize"
              checked={removeSize}
              onCheckedChange={setRemoveSize}
            />
            <Label htmlFor="svg-remove-size" className="font-normal">
              Remove width and height
            </Label>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result.code} label="Copy component" />
        <DownloadButton
          getBlob={() => new Blob([result.code], { type: "text/plain" })}
          filename={`${componentName || "Icon"}.${typescript ? "tsx" : "jsx"}`}
          disabled={!result.code}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMarkup("")
            setReadError(null)
          }}
          disabled={!markup}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {(readError ?? result.error) && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{readError ?? result.error}</span>
        </div>
      )}

      <div>
        <Label htmlFor="svg-jsx-output">React component</Label>
        <Textarea
          id="svg-jsx-output"
          name="component"
          readOnly
          className="mt-1.5 min-h-56 resize-y font-mono text-sm"
          value={result.code}
          placeholder="The generated component appears here."
        />
      </div>
    </div>
  )
}
