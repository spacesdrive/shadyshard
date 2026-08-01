import { useMemo, useState } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/tool/CopyButton"

interface Candidate {
  name: string
  /** Hashcat mode number, where the format has one. */
  hashcat?: string
  john?: string
  note?: string
  confidence: "high" | "medium" | "low"
}

interface Signature {
  /** Matches the whole hash string when this format applies. */
  test: (hash: string) => boolean
  candidates: Candidate[]
}

const HEX = /^[a-f0-9]+$/i

function hexOfLength(length: number) {
  return (hash: string) => hash.length === length && HEX.test(hash)
}

const SIGNATURES: Signature[] = [
  {
    test: (hash) => /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash),
    candidates: [
      {
        name: "bcrypt",
        hashcat: "3200",
        john: "bcrypt",
        note: "The two digits after the second dollar sign are the cost factor.",
        confidence: "high",
      },
    ],
  },
  {
    test: (hash) => /^\$argon2(id|i|d)\$/.test(hash),
    candidates: [
      {
        name: "Argon2",
        hashcat: "34000",
        john: "argon2",
        note: "The variant, memory, iteration, and parallelism parameters are encoded in the string.",
        confidence: "high",
      },
    ],
  },
  {
    test: (hash) => /^\$6\$/.test(hash),
    candidates: [
      { name: "sha512crypt", hashcat: "1800", john: "sha512crypt", confidence: "high" },
    ],
  },
  {
    test: (hash) => /^\$5\$/.test(hash),
    candidates: [
      { name: "sha256crypt", hashcat: "7400", john: "sha256crypt", confidence: "high" },
    ],
  },
  {
    test: (hash) => /^\$1\$/.test(hash),
    candidates: [
      { name: "md5crypt", hashcat: "500", john: "md5crypt", confidence: "high" },
    ],
  },
  {
    test: (hash) => /^\$y\$/.test(hash),
    candidates: [
      {
        name: "yescrypt",
        note: "The default password hash on several recent Linux distributions.",
        confidence: "high",
      },
    ],
  },
  {
    test: (hash) =>
      /^\$pbkdf2[-_]sha(1|256|512)\$/i.test(hash) || /^pbkdf2_sha256\$/.test(hash),
    candidates: [
      {
        name: "PBKDF2",
        hashcat: "10000 for the Django sha256 form",
        john: "pbkdf2-hmac-sha256",
        note: "The iteration count and salt are part of the string.",
        confidence: "high",
      },
    ],
  },
  {
    test: (hash) => /^\{SSHA\}/i.test(hash),
    candidates: [
      {
        name: "Salted SHA-1 (LDAP SSHA)",
        hashcat: "111",
        john: "ssha",
        confidence: "high",
      },
    ],
  },
  {
    test: (hash) => /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(hash),
    candidates: [
      {
        name: "JSON Web Token",
        hashcat: "16500",
        note: "This is a signed token, not a password hash. Decode it rather than trying to crack it.",
        confidence: "high",
      },
    ],
  },
  {
    test: (hash) => /^\*[A-F0-9]{40}$/i.test(hash),
    candidates: [
      {
        name: "MySQL 4.1 and later",
        hashcat: "300",
        john: "mysql-sha1",
        confidence: "high",
      },
    ],
  },
  {
    test: hexOfLength(8),
    candidates: [
      { name: "CRC-32", hashcat: "11500", confidence: "medium" },
      { name: "Adler-32", confidence: "low" },
      {
        name: "A truncated hash or a short identifier",
        note: "Eight hex characters is also what a short Git object hash looks like.",
        confidence: "low",
      },
    ],
  },
  {
    test: hexOfLength(16),
    candidates: [
      {
        name: "MySQL 3.23 (MySQL323)",
        hashcat: "200",
        john: "mysql",
        confidence: "medium",
      },
      { name: "CRC-64", confidence: "low" },
      { name: "Half of an MD5 digest", confidence: "low" },
    ],
  },
  {
    test: hexOfLength(32),
    candidates: [
      { name: "MD5", hashcat: "0", john: "raw-md5", confidence: "high" },
      {
        name: "NTLM",
        hashcat: "1000",
        john: "nt",
        note: "Indistinguishable from MD5 by length alone. Context decides: a Windows credential dump is NTLM.",
        confidence: "high",
      },
      { name: "MD4", hashcat: "900", john: "raw-md4", confidence: "medium" },
      { name: "LM", hashcat: "3000", confidence: "low" },
      { name: "RIPEMD-128", confidence: "low" },
    ],
  },
  {
    test: hexOfLength(40),
    candidates: [
      { name: "SHA-1", hashcat: "100", john: "raw-sha1", confidence: "high" },
      { name: "RIPEMD-160", hashcat: "6000", john: "ripemd-160", confidence: "medium" },
      {
        name: "A Git commit or blob hash",
        note: "Git object names are SHA-1 digests, so they match this pattern exactly.",
        confidence: "low",
      },
    ],
  },
  {
    test: hexOfLength(56),
    candidates: [
      { name: "SHA-224", hashcat: "1300", john: "raw-sha224", confidence: "high" },
      { name: "SHA3-224", hashcat: "17300", confidence: "medium" },
    ],
  },
  {
    test: hexOfLength(64),
    candidates: [
      { name: "SHA-256", hashcat: "1400", john: "raw-sha256", confidence: "high" },
      { name: "SHA3-256", hashcat: "17400", confidence: "medium" },
      { name: "BLAKE2s-256", confidence: "low" },
      { name: "Keccak-256", hashcat: "17800", confidence: "low" },
    ],
  },
  {
    test: hexOfLength(96),
    candidates: [
      { name: "SHA-384", hashcat: "10800", john: "raw-sha384", confidence: "high" },
      { name: "SHA3-384", hashcat: "17500", confidence: "medium" },
    ],
  },
  {
    test: hexOfLength(128),
    candidates: [
      { name: "SHA-512", hashcat: "1700", john: "raw-sha512", confidence: "high" },
      { name: "SHA3-512", hashcat: "17600", confidence: "medium" },
      { name: "Whirlpool", hashcat: "6100", john: "whirlpool", confidence: "medium" },
      { name: "BLAKE2b-512", hashcat: "600", confidence: "low" },
    ],
  },
  {
    test: (hash) =>
      /^[A-Za-z0-9+/]+={0,2}$/.test(hash) && hash.length % 4 === 0 && hash.length >= 16,
    candidates: [
      {
        name: "Base64 encoded data",
        note: "This looks like base64 rather than a hex digest. Decode it first, then identify what is inside.",
        confidence: "medium",
      },
    ],
  },
]

const CONFIDENCE_LABEL: Record<Candidate["confidence"], string> = {
  high: "Most likely",
  medium: "Possible",
  low: "Less likely",
}

interface Analysis {
  hash: string
  candidates: Candidate[]
}

function analyse(raw: string): Analysis[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((hash) => {
      const signature = SIGNATURES.find((entry) => entry.test(hash))
      return { hash, candidates: signature?.candidates ?? [] }
    })
}

export default function HashIdentifier() {
  const [input, setInput] = useState("")

  const results = useMemo(() => analyse(input), [input])

  const summary = results
    .map((result) =>
      result.candidates.length
        ? `${result.hash}\n  ${result.candidates.map((candidate) => candidate.name).join(", ")}`
        : `${result.hash}\n  No known format matched`,
    )
    .join("\n\n")

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="hash-input">Hashes, one per line</Label>
        <Textarea
          id="hash-input"
          name="hashes"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="5f4dcc3b5aa765d61d8327deb882cf99"
          className="mt-1.5 min-h-32 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Accepts bare hex digests and prefixed formats such as bcrypt, Argon2, and the
          Unix crypt family.
        </p>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={`${result.hash}-${index}`}
              className="border-border/60 overflow-hidden rounded-lg border"
            >
              <div className="bg-muted/50 border-border/60 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
                <span className="min-w-0 truncate font-mono text-xs">{result.hash}</span>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {result.hash.length} characters
                </span>
              </div>

              {result.candidates.length === 0 ? (
                <p className="text-muted-foreground px-3 py-3 text-sm">
                  No known format matched this length and character set. It may be
                  truncated, encoded rather than hashed, or a format this tool does not
                  cover.
                </p>
              ) : (
                <ul className="divide-border/60 divide-y">
                  {result.candidates.map((candidate) => (
                    <li key={candidate.name} className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{candidate.name}</span>
                        <Badge variant="secondary">
                          {CONFIDENCE_LABEL[candidate.confidence]}
                        </Badge>
                        {candidate.hashcat && (
                          <span className="text-muted-foreground font-mono text-xs">
                            hashcat -m {candidate.hashcat}
                          </span>
                        )}
                        {candidate.john && (
                          <span className="text-muted-foreground font-mono text-xs">
                            john --format={candidate.john}
                          </span>
                        )}
                      </div>
                      {candidate.note && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {candidate.note}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="border-border/60 text-muted-foreground flex items-start gap-2 rounded-lg border p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          Length and character set narrow the options, they do not prove one. Where two
          formats share a shape, such as MD5 and NTLM, only the source of the hash tells
          you which it is.
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={summary} label="Copy results" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
