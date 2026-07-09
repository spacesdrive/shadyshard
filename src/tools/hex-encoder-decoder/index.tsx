import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

function textToHex(text: string): string {
  const bytes = new TextEncoder().encode(text)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ")
}

function hexToText(hex: string): string {
  const cleaned = hex.replace(/\s+/g, "")
  if (cleaned.length === 0) return ""
  if (!/^[0-9a-fA-F]+$/.test(cleaned))
    throw new Error("Input contains non-hex characters.")
  if (cleaned.length % 2 !== 0)
    throw new Error("Hex input must have an even number of digits.")
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
  }
  return new TextDecoder().decode(bytes)
}

export default function HexEncoderDecoder() {
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [input, setInput] = useState("Hello, world!")

  const { output, error } = useMemo(() => {
    try {
      return {
        output: mode === "encode" ? textToHex(input) : hexToText(input),
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
          <TabsTrigger value="encode">Text to hex</TabsTrigger>
          <TabsTrigger value="decode">Hex to text</TabsTrigger>
        </TabsList>
      </Tabs>

      <div>
        <Label htmlFor="hex-input">{mode === "encode" ? "Text" : "Hex"}</Label>
        <Textarea
          id="hex-input"
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
        <Label htmlFor="hex-output">{mode === "encode" ? "Hex" : "Text"}</Label>
        <Textarea
          id="hex-output"
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
