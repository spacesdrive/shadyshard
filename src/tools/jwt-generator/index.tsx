import { useEffect, useMemo, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { secureRandomString } from "@/lib/secure-random"

const ALGORITHMS = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
} as const

type Algorithm = keyof typeof ALGORITHMS

const LIFETIMES: { value: string; label: string; seconds: number | null }[] = [
  { value: "none", label: "No expiry claim", seconds: null },
  { value: "15m", label: "15 minutes", seconds: 15 * 60 },
  { value: "1h", label: "1 hour", seconds: 60 * 60 },
  { value: "24h", label: "24 hours", seconds: 24 * 60 * 60 },
  { value: "7d", label: "7 days", seconds: 7 * 24 * 60 * 60 },
]

const SECRET_POOL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

const DEFAULT_CLAIMS = `{
  "sub": "1234567890",
  "name": "Ada Lovelace",
  "role": "admin"
}`

function base64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function encodeSegment(value: object): string {
  return base64Url(new TextEncoder().encode(JSON.stringify(value)))
}

async function signToken(
  signingInput: string,
  secret: string,
  algorithm: Algorithm,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: ALGORITHMS[algorithm] },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput),
  )
  return base64Url(new Uint8Array(signature))
}

export default function JwtGenerator() {
  const [claims, setClaims] = useState(DEFAULT_CLAIMS)
  const [secret, setSecret] = useState("")
  const [algorithm, setAlgorithm] = useState<Algorithm>("HS256")
  const [lifetime, setLifetime] = useState("1h")
  const [token, setToken] = useState("")
  const [signError, setSignError] = useState<string | null>(null)

  const parsed = useMemo(() => {
    try {
      const value: unknown = JSON.parse(claims)
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return { claims: null, error: "Claims must be a JSON object." }
      }
      return { claims: value as Record<string, unknown>, error: null as string | null }
    } catch (thrown) {
      return {
        claims: null,
        error: thrown instanceof Error ? thrown.message : "Invalid JSON",
      }
    }
  }, [claims])

  const header = useMemo(() => ({ alg: algorithm, typ: "JWT" }), [algorithm])

  const payload = useMemo(() => {
    if (!parsed.claims) return null
    const lifetimeSeconds =
      LIFETIMES.find((entry) => entry.value === lifetime)?.seconds ?? null
    if (lifetimeSeconds === null) return parsed.claims
    const issuedAt = Math.floor(Date.now() / 1000)
    return { ...parsed.claims, iat: issuedAt, exp: issuedAt + lifetimeSeconds }
  }, [parsed.claims, lifetime])

  useEffect(() => {
    if (!payload || !secret) {
      setToken("")
      setSignError(null)
      return
    }

    let cancelled = false
    const signingInput = `${encodeSegment(header)}.${encodeSegment(payload)}`

    signToken(signingInput, secret, algorithm).then(
      (signature) => {
        if (!cancelled) {
          setToken(`${signingInput}.${signature}`)
          setSignError(null)
        }
      },
      (thrown: unknown) => {
        if (!cancelled) {
          setToken("")
          setSignError(
            thrown instanceof Error ? thrown.message : "This token could not be signed.",
          )
        }
      },
    )

    return () => {
      cancelled = true
    }
  }, [header, payload, secret, algorithm])

  const headerJson = JSON.stringify(header, null, 2)
  const payloadJson = payload ? JSON.stringify(payload, null, 2) : ""

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="jwt-algorithm">Algorithm</Label>
          <Select
            value={algorithm}
            onValueChange={(next) => next && setAlgorithm(next as Algorithm)}
          >
            <SelectTrigger id="jwt-algorithm" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ALGORITHMS) as Algorithm[]).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="jwt-lifetime">Token lifetime</Label>
          <Select
            value={lifetime}
            onValueChange={(next) => next && setLifetime(next as string)}
          >
            <SelectTrigger id="jwt-lifetime" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIFETIMES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="jwt-secret">Signing secret</Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            id="jwt-secret"
            name="secret"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            placeholder="A shared secret, at least 32 characters"
            spellCheck={false}
            autoComplete="off"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSecret(secureRandomString(48, SECRET_POOL))}
          >
            <RefreshCw className="size-4" />
            Random
          </Button>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          Use a throwaway secret. Anything pasted into a browser tool should be treated as
          no longer secret.
        </p>
      </div>

      <div>
        <Label htmlFor="jwt-claims">Claims</Label>
        <Textarea
          id="jwt-claims"
          name="claims"
          value={claims}
          onChange={(event) => setClaims(event.target.value)}
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={parsed.error ? true : undefined}
        />
      </div>

      {(parsed.error ?? signError) && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{parsed.error ?? signError}</span>
        </div>
      )}

      {!secret && !parsed.error && (
        <p className="text-muted-foreground text-sm">
          Enter or generate a signing secret to produce a token.
        </p>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="jwt-token">Signed token</Label>
          <CopyButton value={token} label="Copy token" />
        </div>
        <Textarea
          id="jwt-token"
          name="token"
          value={token}
          readOnly
          className="min-h-28 resize-y font-mono text-sm break-all"
          placeholder="The signed JWT appears here"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="jwt-header-preview">Header</Label>
            <CopyButton value={headerJson} label="Copy header" />
          </div>
          <Textarea
            id="jwt-header-preview"
            name="header"
            value={headerJson}
            readOnly
            className="min-h-24 resize-y font-mono text-sm"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="jwt-payload-preview">Payload</Label>
            <CopyButton value={payloadJson} label="Copy payload" />
          </div>
          <Textarea
            id="jwt-payload-preview"
            name="payload"
            value={payloadJson}
            readOnly
            className="min-h-24 resize-y font-mono text-sm"
          />
        </div>
      </div>
    </div>
  )
}
