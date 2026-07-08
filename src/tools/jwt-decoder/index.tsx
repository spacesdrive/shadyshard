import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

interface DecodedJwt {
  header: string
  payload: string
  signature: string
  exp: number | null
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".")
  if (parts.length !== 3) {
    throw new Error("A JWT must have three dot-separated parts: header.payload.signature")
  }
  const header = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2)
  const payloadObject = JSON.parse(base64UrlDecode(parts[1]))
  const payload = JSON.stringify(payloadObject, null, 2)
  const exp = typeof payloadObject.exp === "number" ? payloadObject.exp : null
  return { header, payload, signature: parts[2], exp }
}

export default function JwtDecoder() {
  const [token, setToken] = useState("")

  const result = useMemo(() => {
    if (!token.trim()) return null
    try {
      return { decoded: decodeJwt(token), error: null as string | null }
    } catch (e) {
      return { decoded: null, error: e instanceof Error ? e.message : "Invalid token" }
    }
  }, [token])

  const isExpired = result?.decoded?.exp != null && result.decoded.exp * 1000 < Date.now()

  return (
    <div className="space-y-4">
      <Textarea
        id="jwt-decoder-input"
        name="token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste a JWT (header.payload.signature)..."
        className="min-h-24 resize-y font-mono text-sm"
        aria-label="JWT to decode"
        spellCheck={false}
      />

      {result?.error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      {result?.decoded && (
        <>
          {result.decoded.exp != null && (
            <div
              className={
                isExpired
                  ? "border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm"
                  : "flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400"
              }
            >
              {isExpired ? (
                <XCircle className="size-4 shrink-0" />
              ) : (
                <CheckCircle2 className="size-4 shrink-0" />
              )}
              <span>
                {isExpired ? "Expired" : "Not expired"} - exp:{" "}
                {new Date(result.decoded.exp * 1000).toLocaleString()}
              </span>
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium">Header</span>
              <CopyButton value={result.decoded.header} label="Copy header" size="sm" />
            </div>
            <Textarea
              id="jwt-decoder-header"
              name="header"
              value={result.decoded.header}
              readOnly
              className="min-h-24 resize-y font-mono text-sm"
              aria-label="Decoded header"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium">Payload</span>
              <CopyButton value={result.decoded.payload} label="Copy payload" size="sm" />
            </div>
            <Textarea
              id="jwt-decoder-payload"
              name="payload"
              value={result.decoded.payload}
              readOnly
              className="min-h-40 resize-y font-mono text-sm"
              aria-label="Decoded payload"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium">Signature (not verified)</span>
              <CopyButton
                value={result.decoded.signature}
                label="Copy signature"
                size="sm"
              />
            </div>
            <Textarea
              id="jwt-decoder-signature"
              name="signature"
              value={result.decoded.signature}
              readOnly
              className="min-h-16 resize-y font-mono text-sm"
              aria-label="Signature segment"
            />
          </div>
        </>
      )}
    </div>
  )
}
