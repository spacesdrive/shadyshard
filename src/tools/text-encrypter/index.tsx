import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { SALT_BYTES, IV_BYTES, deriveAesKey } from "@/lib/crypto-box"

function bytesToBase64(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value.replace(/\s+/g, ""))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function encrypt(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveAesKey(password, salt)
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plaintext),
    ),
  )

  const packed = new Uint8Array(salt.length + iv.length + ciphertext.length)
  packed.set(salt, 0)
  packed.set(iv, salt.length)
  packed.set(ciphertext, salt.length + iv.length)
  return bytesToBase64(packed)
}

async function decrypt(payload: string, password: string): Promise<string> {
  let packed: Uint8Array<ArrayBuffer>
  try {
    packed = base64ToBytes(payload)
  } catch {
    throw new Error("This does not look like an encrypted message. Expected Base64 text.")
  }
  if (packed.length <= SALT_BYTES + IV_BYTES) {
    throw new Error(
      "This message is too short to contain a salt, a nonce, and ciphertext.",
    )
  }

  const salt = packed.slice(0, SALT_BYTES)
  const iv = packed.slice(SALT_BYTES, SALT_BYTES + IV_BYTES)
  const ciphertext = packed.slice(SALT_BYTES + IV_BYTES)
  const key = await deriveAesKey(password, salt)

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    )
    return new TextDecoder().decode(plaintext)
  } catch {
    throw new Error(
      "Decryption failed. The password is wrong or the message was modified.",
    )
  }
}

export default function TextEncrypter() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt")
  const [input, setInput] = useState("")
  const [password, setPassword] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  function reset() {
    setInput("")
    setPassword("")
    setOutput("")
    setError(null)
  }

  async function run() {
    setError(null)
    setOutput("")

    if (!input.trim()) {
      setError(
        mode === "encrypt"
          ? "Enter the text you want to encrypt."
          : "Paste the encrypted message.",
      )
      return
    }
    if (!password) {
      setError("Enter a password.")
      return
    }
    if (mode === "encrypt" && password.length < 8) {
      setError("Use a password of at least 8 characters.")
      return
    }

    setWorking(true)
    try {
      setOutput(
        mode === "encrypt"
          ? await encrypt(input, password)
          : await decrypt(input, password),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "The operation failed.")
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as "encrypt" | "decrypt")
          setInput("")
          setOutput("")
          setError(null)
        }}
      >
        <TabsList>
          <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
          <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
        </TabsList>
      </Tabs>

      <div>
        <Label htmlFor="text-encrypter-input">
          {mode === "encrypt" ? "Message" : "Encrypted message"}
        </Label>
        <Textarea
          id="text-encrypter-input"
          name="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encrypt"
              ? "Type the text to protect..."
              : "Paste the Base64 message..."
          }
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div>
        <Label htmlFor="text-encrypter-password">Password</Label>
        <Input
          id="text-encrypter-password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="mt-1.5"
          autoComplete="off"
        />
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={run} disabled={working}>
          {working ? "Working..." : mode === "encrypt" ? "Encrypt" : "Decrypt"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={reset}>
          Reset
        </Button>
        <CopyButton value={output} label="Copy result" />
      </div>

      <div>
        <Label htmlFor="text-encrypter-output">Result</Label>
        <Textarea
          id="text-encrypter-output"
          name="output"
          value={output}
          readOnly
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
        />
      </div>
    </div>
  )
}
