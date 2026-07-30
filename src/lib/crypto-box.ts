/**
 * Shared password-based AES-256-GCM parameters and key derivation.
 *
 * Two tools encrypt with a password: Text Encrypter, whose Base64 message
 * format is fixed by ADR-024, and File Encrypter, whose binary container is
 * fixed by ADR-029. Both prepend the same salt and nonce to the ciphertext,
 * so the derivation parameters below are part of both on-disk formats -
 * changing any of them makes previously encrypted data undecryptable.
 */

export const SALT_BYTES = 16
export const IV_BYTES = 12
export const PBKDF2_ITERATIONS = 310000

export async function deriveAesKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
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
