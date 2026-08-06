/** Shared Web Crypto hashing helper, used by both text-hashing and file-hashing tools. */

export const HASH_ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number]

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function hashBytes(
  data: BufferSource,
  algorithm: HashAlgorithm,
): Promise<string> {
  const digest = await crypto.subtle.digest(algorithm, data)
  return bytesToHex(digest)
}

/**
 * Base64 rather than hex, which is the encoding Subresource Integrity uses in
 * an integrity attribute.
 */
export async function hashBytesBase64(
  data: BufferSource,
  algorithm: HashAlgorithm,
): Promise<string> {
  const digest = await crypto.subtle.digest(algorithm, data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
}

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  return hashBytes(new TextEncoder().encode(text), algorithm)
}

export async function hashFile(file: File, algorithm: HashAlgorithm): Promise<string> {
  return hashBytes(await file.arrayBuffer(), algorithm)
}
