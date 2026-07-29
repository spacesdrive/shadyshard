import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"

const HASHES = ["SHA-256", "SHA-1", "SHA-384", "SHA-512"] as const
type Hash = (typeof HASHES)[number]

const KEY_ENCODINGS = ["utf-8", "hex", "base64"] as const
type KeyEncoding = (typeof KEY_ENCODINGS)[number]

const KEY_ENCODING_LABELS: Record<KeyEncoding, string> = {
  "utf-8": "UTF-8 text",
  hex: "Hex",
  base64: "Base64",
}

function decodeKey(key: string, encoding: KeyEncoding): Uint8Array<ArrayBuffer> {
  if (encoding === "utf-8") return new TextEncoder().encode(key)

  if (encoding === "hex") {
    const cleaned = key.replace(/\s+/g, "")
    if (cleaned.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(cleaned)) {
      throw new Error("The key is not valid hex. Use an even number of hex digits.")
    }
    const bytes = new Uint8Array(cleaned.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
    }
    return bytes
  }

  try {
    const binary = atob(key.replace(/\s+/g, ""))
    return Uint8Array.from(binary, (character) => character.charCodeAt(0))
  } catch {
    throw new Error("The key is not valid base64.")
  }
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function toBase64(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/** Strips the provider prefix webhook headers use, for example "sha256=" or "v1=". */
function normalizeExpected(value: string): string {
  return value.trim().replace(/^[a-z0-9]+=/i, "")
}

export default function HmacGenerator() {
  const [message, setMessage] = useState("")
  const [key, setKey] = useState("")
  const [keyEncoding, setKeyEncoding] = useState<KeyEncoding>("utf-8")
  const [hash, setHash] = useState<Hash>("SHA-256")
  const [outputEncoding, setOutputEncoding] = useState<"hex" | "base64">("hex")
  const [expected, setExpected] = useState("")
  const [signature, setSignature] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!message || !key) {
      setSignature("")
      setError(null)
      return
    }

    let keyBytes: Uint8Array<ArrayBuffer>
    try {
      keyBytes = decodeKey(key, keyEncoding)
    } catch (thrown) {
      setSignature("")
      setError(thrown instanceof Error ? thrown.message : "The key could not be decoded.")
      return
    }

    let cancelled = false
    crypto.subtle
      .importKey("raw", keyBytes, { name: "HMAC", hash }, false, ["sign"])
      .then((cryptoKey) =>
        crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message)),
      )
      .then((result) => {
        if (cancelled) return
        const bytes = new Uint8Array(result)
        setSignature(outputEncoding === "hex" ? toHex(bytes) : toBase64(bytes))
        setError(null)
      })
      .catch((thrown: unknown) => {
        if (cancelled) return
        setSignature("")
        setError(
          thrown instanceof Error
            ? thrown.message
            : "The signature could not be computed.",
        )
      })

    return () => {
      cancelled = true
    }
  }, [message, key, keyEncoding, hash, outputEncoding])

  const comparison = expected.trim()
    ? normalizeExpected(expected).toLowerCase() === signature.toLowerCase() &&
      signature !== ""
    : null

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="hmac-message">Message or raw request body</Label>
        <Textarea
          id="hmac-message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder='{"event":"invoice.paid","id":"evt_123"}'
          className="mt-1.5 min-h-32 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Paste the body exactly as it was sent. Reformatting JSON changes the signature.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="hmac-key">Secret key</Label>
          <Input
            id="hmac-key"
            name="key"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="whsec_example_secret"
            className="mt-1.5"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div>
          <Label htmlFor="hmac-key-encoding">Key is encoded as</Label>
          <Select
            value={keyEncoding}
            onValueChange={(next) => next && setKeyEncoding(next as KeyEncoding)}
          >
            <SelectTrigger id="hmac-key-encoding" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEY_ENCODINGS.map((option) => (
                <SelectItem key={option} value={option}>
                  {KEY_ENCODING_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="hmac-hash">Hash algorithm</Label>
          <Select value={hash} onValueChange={(next) => next && setHash(next as Hash)}>
            <SelectTrigger id="hmac-hash" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HASHES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="hmac-output-encoding">Output encoding</Label>
          <Select
            value={outputEncoding}
            onValueChange={(next) => next && setOutputEncoding(next as "hex" | "base64")}
          >
            <SelectTrigger id="hmac-output-encoding" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hex">Hex</SelectItem>
              <SelectItem value="base64">Base64</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="hmac-signature">Signature</Label>
          <CopyButton value={signature} label="Copy signature" />
        </div>
        <Textarea
          id="hmac-signature"
          name="signature"
          value={signature}
          readOnly
          className="min-h-20 resize-y font-mono text-sm break-all"
          placeholder="The computed signature appears here"
        />
      </div>

      <div>
        <Label htmlFor="hmac-expected">Expected signature (optional)</Label>
        <Input
          id="hmac-expected"
          name="expected"
          value={expected}
          onChange={(event) => setExpected(event.target.value)}
          placeholder="sha256=..."
          className="mt-1.5 font-mono"
          spellCheck={false}
        />
      </div>

      {comparison !== null && (
        <div
          className={
            comparison
              ? "flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm"
          }
        >
          {comparison ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <XCircle className="size-4 shrink-0" />
          )}
          <span>
            {comparison
              ? "The signatures match."
              : "The signatures do not match. Check the raw body, the secret, and the algorithm."}
          </span>
        </div>
      )}
    </div>
  )
}
