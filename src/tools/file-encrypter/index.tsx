import { useState } from "react"
import { AlertCircle, FileCheck2, Trash2 } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SALT_BYTES, IV_BYTES, deriveAesKey } from "@/lib/crypto-box"
import { downloadBlob } from "@/lib/download"
import { formatBytes } from "@/lib/image"

const MAGIC = "SSENC1"
const MAGIC_BYTES = MAGIC.length
const MAX_INPUT_BYTES = 100 * 1024 * 1024
const ENCRYPTED_EXTENSION = ".ssenc"

interface DecryptedFile {
  name: string
  blob: Blob
}

async function encryptFile(file: File, password: string): Promise<Blob> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveAesKey(password, salt)

  const nameBytes = new TextEncoder().encode(file.name)
  const contents = new Uint8Array(await file.arrayBuffer())
  const payload = new Uint8Array(2 + nameBytes.length + contents.length)
  new DataView(payload.buffer).setUint16(0, nameBytes.length)
  payload.set(nameBytes, 2)
  payload.set(contents, 2 + nameBytes.length)

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload),
  )

  const packed = new Uint8Array(MAGIC_BYTES + salt.length + iv.length + ciphertext.length)
  packed.set(new TextEncoder().encode(MAGIC), 0)
  packed.set(salt, MAGIC_BYTES)
  packed.set(iv, MAGIC_BYTES + salt.length)
  packed.set(ciphertext, MAGIC_BYTES + salt.length + iv.length)
  return new Blob([packed], { type: "application/octet-stream" })
}

async function decryptFile(file: File, password: string): Promise<DecryptedFile> {
  const packed = new Uint8Array(await file.arrayBuffer())
  const headerBytes = MAGIC_BYTES + SALT_BYTES + IV_BYTES

  if (packed.length <= headerBytes) {
    throw new Error("This file is too small to be an encrypted file from this tool.")
  }
  if (new TextDecoder().decode(packed.slice(0, MAGIC_BYTES)) !== MAGIC) {
    throw new Error(
      `This file was not produced by File Encrypter. Encrypted files start with the marker ${MAGIC} and normally end in ${ENCRYPTED_EXTENSION}.`,
    )
  }

  const salt = packed.slice(MAGIC_BYTES, MAGIC_BYTES + SALT_BYTES)
  const iv = packed.slice(MAGIC_BYTES + SALT_BYTES, headerBytes)
  const key = await deriveAesKey(password, salt)

  let payload: Uint8Array
  try {
    payload = new Uint8Array(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        packed.slice(headerBytes),
      ),
    )
  } catch {
    throw new Error(
      "Decryption failed. Either the password is wrong or the file was modified after it was encrypted.",
    )
  }

  const nameLength = new DataView(payload.buffer, payload.byteOffset).getUint16(0)
  const name = new TextDecoder().decode(payload.slice(2, 2 + nameLength))
  const contents = payload.slice(2 + nameLength)
  return { name, blob: new Blob([contents], { type: "application/octet-stream" }) }
}

export default function FileEncrypter() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt")
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  function reset() {
    setFile(null)
    setPassword("")
    setConfirmation("")
    setError(null)
    setStatus(null)
  }

  function selectFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setStatus(null)
    if (selected.size > MAX_INPUT_BYTES) {
      setFile(null)
      setError(
        `This file is ${formatBytes(selected.size)}. The limit is ${formatBytes(MAX_INPUT_BYTES)} because the whole file is held in memory while it is processed.`,
      )
      return
    }
    setFile(selected)
  }

  function validate(): string | null {
    if (!file) return "Choose a file first."
    if (!password) return "Enter a password."
    if (mode === "encrypt" && password.length < 8) {
      return "Use a password of at least 8 characters."
    }
    if (mode === "encrypt" && password !== confirmation) {
      return "The two passwords do not match."
    }
    return null
  }

  async function run() {
    const problem = validate()
    setStatus(null)
    setError(problem)
    if (problem || !file) return

    setWorking(true)
    try {
      if (mode === "encrypt") {
        const blob = await encryptFile(file, password)
        downloadBlob(blob, `${file.name}${ENCRYPTED_EXTENSION}`)
        setStatus(
          `Encrypted ${file.name} to ${file.name}${ENCRYPTED_EXTENSION} (${formatBytes(blob.size)}).`,
        )
      } else {
        const decrypted = await decryptFile(file, password)
        downloadBlob(decrypted.blob, decrypted.name)
        setStatus(`Decrypted to ${decrypted.name} (${formatBytes(decrypted.blob.size)}).`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "The operation failed.")
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-5">
      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as "encrypt" | "decrypt")
          reset()
        }}
      >
        <TabsList>
          <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
          <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
        </TabsList>
      </Tabs>

      {file ? (
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-muted-foreground text-xs">{formatBytes(file.size)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            <Trash2 className="size-4" />
            Choose another
          </Button>
        </div>
      ) : (
        <FileDropZone
          accept={mode === "encrypt" ? "*/*" : ENCRYPTED_EXTENSION}
          onFiles={selectFile}
          hint={
            mode === "encrypt"
              ? `Any file up to ${formatBytes(MAX_INPUT_BYTES)}`
              : `A ${ENCRYPTED_EXTENSION} file created by this tool`
          }
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="file-encrypter-password">Password</Label>
          <Input
            id="file-encrypter-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === "encrypt" ? "At least 8 characters" : "Password"}
            className="mt-1.5"
            autoComplete="off"
          />
        </div>
        {mode === "encrypt" && (
          <div>
            <Label htmlFor="file-encrypter-confirm">Confirm password</Label>
            <Input
              id="file-encrypter-confirm"
              name="confirmPassword"
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Repeat the password"
              className="mt-1.5"
              autoComplete="off"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {status && (
        <div className="border-border/60 bg-muted/40 flex items-start gap-2 rounded-lg border p-3 text-sm">
          <FileCheck2 className="mt-0.5 size-4 shrink-0" />
          <span>{status}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={run} disabled={working}>
          {working
            ? "Working..."
            : mode === "encrypt"
              ? "Encrypt and download"
              : "Decrypt and download"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={reset}>
          Reset
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        There is no way to recover the contents if the password is lost. Keep a copy of
        the original until you have confirmed you can decrypt the encrypted file.
      </p>
    </div>
  )
}
