import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

function textToBinary(text: string): string {
  const bytes = new TextEncoder().encode(text)
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ")
}

function binaryToText(binary: string): string {
  const cleaned = binary.replace(/\s+/g, "")
  if (cleaned.length === 0) return ""
  if (!/^[01]+$/.test(cleaned))
    throw new Error("Input contains characters other than 0 and 1.")
  if (cleaned.length % 8 !== 0)
    throw new Error("Binary input must be a multiple of 8 digits.")
  const bytes = new Uint8Array(cleaned.length / 8)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.slice(i * 8, i * 8 + 8), 2)
  }
  return new TextDecoder().decode(bytes)
}

export default function BinaryConverter() {
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [input, setInput] = useState("Hello")

  const { output, error } = useMemo(() => {
    try {
      return {
        output: mode === "encode" ? textToBinary(input) : binaryToText(input),
        error: null,
      }
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Conversion failed." }
    }
  }, [input, mode])

  return (
    <div className="space-y-4">
      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as "encode" | "decode")
          setInput("")
        }}
      >
        <TabsList>
          <TabsTrigger value="encode">Text to binary</TabsTrigger>
          <TabsTrigger value="decode">Binary to text</TabsTrigger>
        </TabsList>
      </Tabs>

      <div>
        <Label htmlFor="binary-input">{mode === "encode" ? "Text" : "Binary"}</Label>
        <Textarea
          id="binary-input"
          name="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mt-1.5 min-h-32 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <Label htmlFor="binary-output">{mode === "encode" ? "Binary" : "Text"}</Label>
        <Textarea
          id="binary-output"
          name="output"
          value={output}
          readOnly
          className="mt-1.5 min-h-32 resize-y font-mono text-sm"
        />
      </div>

      <CopyButton value={output} label="Copy result" />
    </div>
  )
}
