import { useState } from "react"
import { Copy, Check, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function decodeBase64(value: string): string {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!value}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

export default function Base64EncoderDecoder() {
  const [encodeInput, setEncodeInput] = useState("")
  const [decodeInput, setDecodeInput] = useState("")
  const [decodeError, setDecodeError] = useState<string | null>(null)

  const encoded = encodeInput ? encodeBase64(encodeInput) : ""

  let decoded = ""
  if (decodeInput) {
    try {
      decoded = decodeBase64(decodeInput)
    } catch {
      decoded = ""
    }
  }

  function handleDecodeChange(value: string) {
    setDecodeInput(value)
    if (!value) {
      setDecodeError(null)
      return
    }
    try {
      decodeBase64(value)
      setDecodeError(null)
    } catch {
      setDecodeError("This isn't valid Base64 - check for missing characters or padding.")
    }
  }

  return (
    <Tabs defaultValue="encode">
      <TabsList>
        <TabsTrigger value="encode">Encode</TabsTrigger>
        <TabsTrigger value="decode">Decode</TabsTrigger>
      </TabsList>

      <TabsContent value="encode" className="mt-4 space-y-4">
        <Textarea
          id="base64-encode-input"
          name="text"
          value={encodeInput}
          onChange={(e) => setEncodeInput(e.target.value)}
          placeholder="Type or paste text to encode..."
          className="min-h-40 resize-y font-mono text-sm"
          aria-label="Text to encode"
        />
        <div className="flex items-center gap-2">
          <CopyButton value={encoded} />
        </div>
        <Textarea
          id="base64-encode-output"
          name="encoded"
          value={encoded}
          readOnly
          placeholder="Base64 output appears here..."
          className="min-h-32 resize-y font-mono text-sm"
          aria-label="Base64 output"
        />
      </TabsContent>

      <TabsContent value="decode" className="mt-4 space-y-4">
        <Textarea
          id="base64-decode-input"
          name="base64"
          value={decodeInput}
          onChange={(e) => handleDecodeChange(e.target.value)}
          placeholder="Paste Base64 to decode..."
          className="min-h-40 resize-y font-mono text-sm"
          aria-label="Base64 to decode"
          spellCheck={false}
        />
        {decodeError && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{decodeError}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CopyButton value={decoded} />
        </div>
        <Textarea
          id="base64-decode-output"
          name="decoded"
          value={decoded}
          readOnly
          placeholder="Decoded text appears here..."
          className="min-h-32 resize-y font-mono text-sm"
          aria-label="Decoded text output"
        />
      </TabsContent>
    </Tabs>
  )
}
