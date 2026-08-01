import { useCallback, useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/**
 * RFC 7636 requires the verifier to be 43 to 128 characters from an unreserved
 * alphabet. Base64url of n random bytes yields ceil(n * 4 / 3) characters, so
 * the byte count is derived from the requested length and the result trimmed.
 */
function generateVerifier(length: number): string {
  const bytes = new Uint8Array(Math.ceil((length * 3) / 4))
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes).slice(0, length)
}

async function deriveChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
  return base64UrlEncode(new Uint8Array(digest))
}

const VERIFIER_PATTERN = /^[A-Za-z0-9\-._~]+$/

function verifierProblem(verifier: string): string | null {
  if (verifier.length < 43) {
    return `A code verifier must be at least 43 characters. This one is ${verifier.length}.`
  }
  if (verifier.length > 128) {
    return `A code verifier must be at most 128 characters. This one is ${verifier.length}.`
  }
  if (!VERIFIER_PATTERN.test(verifier)) {
    return "A code verifier may only contain A-Z, a-z, 0-9, hyphen, period, underscore, and tilde."
  }
  return null
}

interface FieldProps {
  id: string
  label: string
  value: string
  hint?: string
}

function ResultField({ id, label, value, hint }: FieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5 flex items-center gap-2">
        <Input
          id={id}
          name={id}
          value={value}
          readOnly
          className="bg-muted/40 font-mono text-sm"
          spellCheck={false}
        />
        <CopyButton value={value} label={`Copy ${label}`} variant="ghost" size="icon" />
      </div>
      {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
    </div>
  )
}

function GenerateMode() {
  const [length, setLength] = useState(64)
  const [verifier, setVerifier] = useState("")
  const [challenge, setChallenge] = useState("")

  const regenerate = useCallback((size: number) => {
    const next = generateVerifier(size)
    setVerifier(next)
    deriveChallenge(next).then(setChallenge)
  }, [])

  useEffect(() => {
    regenerate(length)
  }, [length, regenerate])

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Verifier length</span>
          <span className="text-muted-foreground font-mono text-sm tabular-nums">
            {length} characters
          </span>
        </div>
        <Slider
          aria-label="Code verifier length"
          value={[length]}
          min={43}
          max={128}
          step={1}
          onValueChange={(value) => setLength(Array.isArray(value) ? value[0] : value)}
          className="mt-3"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          RFC 7636 allows 43 to 128 characters. 64 gives 384 bits of entropy, comfortably
          above the 256-bit minimum the specification recommends.
        </p>
      </div>

      <ResultField
        id="pkce-verifier"
        label="code_verifier"
        value={verifier}
        hint="Keep this in the client until the token request. Never put it in the authorization URL."
      />

      <ResultField
        id="pkce-challenge"
        label="code_challenge"
        value={challenge}
        hint="Send this with code_challenge_method=S256 on the authorization request."
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => regenerate(length)}>
          <RefreshCw className="size-4" />
          Generate a new pair
        </Button>
        <CopyButton
          value={`code_verifier=${verifier}\ncode_challenge=${challenge}\ncode_challenge_method=S256`}
          label="Copy all three parameters"
        />
      </div>
    </div>
  )
}

function VerifyMode() {
  const [verifier, setVerifier] = useState("")
  const [challenge, setChallenge] = useState("")
  const [computed, setComputed] = useState("")

  const problem = verifier ? verifierProblem(verifier) : null

  useEffect(() => {
    if (!verifier || problem) {
      setComputed("")
      return
    }
    let cancelled = false
    deriveChallenge(verifier).then((result) => {
      if (!cancelled) setComputed(result)
    })
    return () => {
      cancelled = true
    }
  }, [verifier, problem])

  const matches =
    computed !== "" && challenge.trim() !== "" && computed === challenge.trim()
  const mismatched = computed !== "" && challenge.trim() !== "" && !matches

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="pkce-check-verifier">code_verifier</Label>
        <Input
          id="pkce-check-verifier"
          name="checkVerifier"
          value={verifier}
          onChange={(event) => setVerifier(event.target.value)}
          placeholder="Paste the verifier your client stored"
          className="mt-1.5 font-mono text-sm"
          spellCheck={false}
          aria-invalid={problem ? true : undefined}
        />
      </div>

      <div>
        <Label htmlFor="pkce-check-challenge">code_challenge the server received</Label>
        <Input
          id="pkce-check-challenge"
          name="checkChallenge"
          value={challenge}
          onChange={(event) => setChallenge(event.target.value)}
          placeholder="Paste the challenge sent on the authorization request"
          className="mt-1.5 font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {problem && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{problem}</span>
        </div>
      )}

      {computed && (
        <ResultField
          id="pkce-computed"
          label="S256 challenge for this verifier"
          value={computed}
        />
      )}

      {matches && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>
            The pair matches. This verifier is the one that produced that challenge, so a
            failing token exchange is caused by something else.
          </span>
        </div>
      )}

      {mismatched && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            The pair does not match. The client sent a challenge derived from a different
            verifier, which is the usual cause of an invalid_grant error on token
            exchange.
          </span>
        </div>
      )}
    </div>
  )
}

export default function PkceGenerator() {
  const [mode, setMode] = useState("generate")

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)}>
        <TabsList>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="verify">Verify a pair</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "generate" ? <GenerateMode /> : <VerifyMode />}
    </div>
  )
}
