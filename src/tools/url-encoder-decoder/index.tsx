import { useState } from "react"
import { Copy, Check, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

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

export default function UrlEncoderDecoder() {
  const [encodeInput, setEncodeInput] = useState("")
  const [decodeInput, setDecodeInput] = useState("")
  const [decodeError, setDecodeError] = useState<string | null>(null)

  const encoded = encodeInput ? encodeURIComponent(encodeInput) : ""

  let decoded = ""
  if (decodeInput) {
    try {
      decoded = decodeURIComponent(decodeInput)
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
      decodeURIComponent(value)
      setDecodeError(null)
    } catch {
      setDecodeError("This contains a malformed percent-encoded sequence.")
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
          id="url-encode-input"
          name="text"
          value={encodeInput}
          onChange={(e) => setEncodeInput(e.target.value)}
          placeholder="Type or paste text to encode..."
          className="min-h-32 resize-y font-mono text-sm"
          aria-label="Text to encode"
        />
        <div className="flex items-center gap-2">
          <CopyButton value={encoded} />
        </div>
        <Textarea
          id="url-encode-output"
          name="encoded"
          value={encoded}
          readOnly
          placeholder="Encoded output appears here..."
          className="min-h-24 resize-y font-mono text-sm"
          aria-label="URL-encoded output"
        />
      </TabsContent>

      <TabsContent value="decode" className="mt-4 space-y-4">
        <Textarea
          id="url-decode-input"
          name="encoded"
          value={decodeInput}
          onChange={(e) => handleDecodeChange(e.target.value)}
          placeholder="Paste a percent-encoded string to decode..."
          className="min-h-32 resize-y font-mono text-sm"
          aria-label="Percent-encoded text to decode"
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
          id="url-decode-output"
          name="decoded"
          value={decoded}
          readOnly
          placeholder="Decoded text appears here..."
          className="min-h-24 resize-y font-mono text-sm"
          aria-label="Decoded text output"
        />
      </TabsContent>
    </Tabs>
  )
}
