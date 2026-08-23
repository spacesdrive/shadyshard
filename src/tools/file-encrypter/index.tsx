import { useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { formatBytes } from "@/lib/image"

const MAGIC = new Uint8Array([0x53, 0x53, 0x45, 0x4e, 0x43, 0x30, 0x30, 0x31])
const SALT_BYTES = 16
const IV_BYTES = 12
const NAME_LENGTH_BYTES = 2
const PBKDF2_ITERATIONS = 310000
const ENCRYPTED_EXTENSION = ".ssenc"

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  )
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

interface Produced {
  blob: Blob
  filename: string
}

async function encryptFile(file: File, password: string): Promise<Produced> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(password, salt)

  const nameBytes = new TextEncoder().encode(file.name)
  if (nameBytes.length > 0xffff) {
    throw new Error("This file's name is too long to store in the encrypted container.")
  }
  const contents = new Uint8Array(await file.arrayBuffer())

  const payload = new Uint8Array(NAME_LENGTH_BYTES + nameBytes.length + contents.length)
  payload[0] = nameBytes.length >> 8
  payload[1] = nameBytes.length & 0xff
  payload.set(nameBytes, NAME_LENGTH_BYTES)
  payload.set(contents, NAME_LENGTH_BYTES + nameBytes.length)

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload),
  )

  const container = new Uint8Array(
    MAGIC.length + salt.length + iv.length + ciphertext.length,
  )
  container.set(MAGIC, 0)
  container.set(salt, MAGIC.length)
  container.set(iv, MAGIC.length + salt.length)
  container.set(ciphertext, MAGIC.length + salt.length + iv.length)

  return {
    blob: new Blob([container as BlobPart], { type: "application/octet-stream" }),
    filename: `${file.name}${ENCRYPTED_EXTENSION}`,
  }
}

async function decryptFile(file: File, password: string): Promise<Produced> {
  const container = new Uint8Array(await file.arrayBuffer())
  const headerLength = MAGIC.length + SALT_BYTES + IV_BYTES
  if (
    container.length <= headerLength ||
    !MAGIC.every((byte, index) => container[index] === byte)
  ) {
    throw new Error(
      `This is not a file produced by this tool. Encrypted files end in ${ENCRYPTED_EXTENSION}.`,
    )
  }

  const salt = container.slice(MAGIC.length, MAGIC.length + SALT_BYTES)
  const iv = container.slice(MAGIC.length + SALT_BYTES, headerLength)
  const ciphertext = container.slice(headerLength)
  const key = await deriveKey(password, salt)

  let payload: Uint8Array<ArrayBuffer>
  try {
    payload = new Uint8Array(
      await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext),
    )
  } catch {
    throw new Error("Decryption failed. The password is wrong or the file was modified.")
  }

  const nameLength = (payload[0] << 8) | payload[1]
  const nameBytes = payload.slice(NAME_LENGTH_BYTES, NAME_LENGTH_BYTES + nameLength)
  const contents = payload.slice(NAME_LENGTH_BYTES + nameLength)
  const originalName =
    new TextDecoder().decode(nameBytes) ||
    file.name.replace(new RegExp(`${ENCRYPTED_EXTENSION}$`), "")

  return {
    blob: new Blob([contents as BlobPart], { type: "application/octet-stream" }),
    filename: originalName,
  }
}

export default function FileEncrypter() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt")
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<Produced | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  function reset() {
    setFile(null)
    setPassword("")
    setResult(null)
    setError(null)
  }

  function switchMode(next: "encrypt" | "decrypt") {
    setMode(next)
    reset()
  }

  async function run() {
    if (!file) {
      setError("Choose a file first.")
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
    setError(null)
    setResult(null)
    try {
      setResult(
        mode === "encrypt"
          ? await encryptFile(file, password)
          : await decryptFile(file, password),
      )
    } catch (cause) {
      if (cause instanceof RangeError) {
        setError("This file is too large to hold in memory in a browser tab.")
      } else {
        setError(cause instanceof Error ? cause.message : "The operation failed.")
      }
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-5">
      <Tabs
        value={mode}
        onValueChange={(value) => switchMode(value as "encrypt" | "decrypt")}
      >
        <TabsList>
          <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
          <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
        </TabsList>
      </Tabs>

      {!file && (
        <FileDropZone
          accept={mode === "encrypt" ? "*/*" : ENCRYPTED_EXTENSION}
          onFiles={(files) => {
            setFile(files[0])
            setResult(null)
            setError(null)
          }}
          hint={
            mode === "encrypt"
              ? "Any file. It is read on this device and never uploaded."
              : `A ${ENCRYPTED_EXTENSION} file produced by this tool.`
          }
        />
      )}

      {file && (
        <p className="text-sm font-medium break-all">
          {file.name}{" "}
          <span className="text-muted-foreground font-normal">
            ({formatBytes(file.size)})
          </span>
        </p>
      )}

      <div>
        <Label htmlFor="file-encrypter-password">Password</Label>
        <Input
          id="file-encrypter-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={
            mode === "encrypt" ? "At least 8 characters" : "The password used to encrypt"
          }
          className="mt-1.5"
          autoComplete="off"
        />
        {mode === "encrypt" && (
          <p className="text-muted-foreground mt-1.5 text-sm">
            There is no way to recover the file if this password is lost.
          </p>
        )}
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={run} disabled={working || !file}>
          {working ? "Working..." : mode === "encrypt" ? "Encrypt file" : "Decrypt file"}
        </Button>
        {result && (
          <DownloadButton
            getBlob={() => result.blob}
            filename={result.filename}
            label={`Download ${result.filename}`}
          />
        )}
        <Button variant="outline" size="sm" onClick={reset} disabled={!file && !password}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {result && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <span>
            {mode === "encrypt" ? "Encrypted" : "Decrypted"} to {result.filename} (
            {formatBytes(result.blob.size)}). Download it before leaving this page, since
            nothing is stored.
          </span>
        </div>
      )}
    </div>
  )
}
