import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import {
  BASE32HEX_ALPHABET,
  CROCKFORD_ALPHABET,
  RFC4648_ALPHABET,
  decodeBase32,
  encodeBase32,
  normalizeCrockford,
} from "@/lib/base32"

type AlphabetKey = "rfc4648" | "base32hex" | "crockford"
type Payload = "text" | "hex"

const ALPHABETS: { value: AlphabetKey; label: string; alphabet: string }[] = [
  { value: "rfc4648", label: "RFC 4648 (standard)", alphabet: RFC4648_ALPHABET },
  {
    value: "base32hex",
    label: "base32hex (RFC 4648 section 7)",
    alphabet: BASE32HEX_ALPHABET,
  },
  { value: "crockford", label: "Crockford", alphabet: CROCKFORD_ALPHABET },
]

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ")
}

function hexToBytes(input: string): Uint8Array {
  const cleaned = input.replace(/(0x)|[\s,:-]/gi, "")
  if (cleaned.length === 0) return new Uint8Array(0)
  if (cleaned.length % 2 !== 0) {
    throw new Error("Hex input needs an even number of digits.")
  }
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
    throw new Error("Hex input may only contain the digits 0 to 9 and letters a to f.")
  }
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(cleaned.slice(index * 2, index * 2 + 2), 16)
  }
  return bytes
}

export default function Base32EncoderDecoder() {
  const [mode, setMode] = useState("encode")
  const [alphabetKey, setAlphabetKey] = useState<AlphabetKey>("rfc4648")
  const [payload, setPayload] = useState<Payload>("text")
  const [padded, setPadded] = useState(false)
  const [input, setInput] = useState("")

  const alphabet =
    ALPHABETS.find((entry) => entry.value === alphabetKey)?.alphabet ?? RFC4648_ALPHABET

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null }
    try {
      if (mode === "encode") {
        const bytes =
          payload === "hex" ? hexToBytes(input) : new TextEncoder().encode(input)
        return { output: encodeBase32(bytes, alphabet, padded), error: null }
      }

      const cleaned =
        alphabetKey === "crockford" ? normalizeCrockford(input) : input.toUpperCase()
      const bytes = decodeBase32(cleaned, alphabet)
      if (payload === "hex") return { output: bytesToHex(bytes), error: null }
      return { output: new TextDecoder().decode(bytes), error: null }
    } catch (error) {
      return {
        output: "",
        error:
          error instanceof Error ? error.message : "That input could not be converted.",
      }
    }
  }, [input, mode, alphabet, alphabetKey, padded, payload])

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)}>
        <TabsList>
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="base32-alphabet">Alphabet</Label>
          <Select
            value={alphabetKey}
            onValueChange={(value) => value && setAlphabetKey(value as AlphabetKey)}
          >
            <SelectTrigger id="base32-alphabet" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALPHABETS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="base32-payload">
            {mode === "encode" ? "Input is" : "Show result as"}
          </Label>
          <Select
            value={payload}
            onValueChange={(value) => value && setPayload(value as Payload)}
          >
            <SelectTrigger id="base32-payload" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text (UTF-8)</SelectItem>
              <SelectItem value="hex">Hex bytes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {mode === "encode" && (
        <div className="flex items-center gap-2">
          <Switch
            id="base32-padding"
            name="padded"
            checked={padded}
            onCheckedChange={setPadded}
          />
          <Label htmlFor="base32-padding" className="font-normal">
            Pad to a multiple of eight characters
          </Label>
        </div>
      )}

      <div>
        <Label htmlFor="base32-input">
          {mode === "encode" ? "Input" : "Base32 to decode"}
        </Label>
        <Textarea
          id="base32-input"
          name="input"
          className="mt-1.5 min-h-32 resize-y font-mono text-sm"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            mode === "encode"
              ? payload === "hex"
                ? "48 65 6c 6c 6f"
                : "Text to encode"
              : "JBSWY3DPEHPK3PXP"
          }
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result.output} label="Copy result" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {result.error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <div>
        <Label htmlFor="base32-output">Result</Label>
        <Textarea
          id="base32-output"
          name="output"
          readOnly
          className="mt-1.5 min-h-32 resize-y font-mono text-sm break-all"
          value={result.output}
          placeholder="The converted value appears here."
        />
      </div>
    </div>
  )
}
