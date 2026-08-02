/**
 * Base32 alphabets and codecs shared by the Base32 Encoder and Decoder and
 * the ULID Generator. Both need the same five-bits-per-character packing;
 * they differ only in alphabet and padding, so the codec is parameterised
 * rather than written twice.
 */

/** RFC 4648 section 6, the alphabet used by TOTP secrets and DNSSEC. */
export const RFC4648_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

/** RFC 4648 section 7 (base32hex), which sorts in the same order as the raw bytes. */
export const BASE32HEX_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUV"

/**
 * Crockford base32, which drops I, L, O, and U so a written-down value is
 * hard to mis-transcribe. This is the alphabet ULID specifies.
 */
export const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

export function encodeBase32(bytes: Uint8Array, alphabet: string, pad: boolean): string {
  let output = ""
  let buffer = 0
  let bitsHeld = 0

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte
    bitsHeld += 8
    while (bitsHeld >= 5) {
      output += alphabet[(buffer >>> (bitsHeld - 5)) & 31]
      bitsHeld -= 5
    }
  }

  if (bitsHeld > 0) output += alphabet[(buffer << (5 - bitsHeld)) & 31]
  if (pad) while (output.length % 8 !== 0) output += "="

  return output
}

export class Base32DecodeError extends Error {}

/**
 * Decodes a base32 string. Throws Base32DecodeError naming the offending
 * character so the calling tool can show a specific message rather than a
 * generic failure.
 */
export function decodeBase32(input: string, alphabet: string): Uint8Array {
  const cleaned = input.replace(/[=\s-]/g, "").toUpperCase()
  if (cleaned === "") return new Uint8Array(0)

  const bytes: number[] = []
  let buffer = 0
  let bitsHeld = 0

  for (const character of cleaned) {
    const value = alphabet.indexOf(character)
    if (value === -1) {
      throw new Base32DecodeError(
        `"${character}" is not a valid character in this base32 alphabet.`,
      )
    }
    buffer = (buffer << 5) | value
    bitsHeld += 5
    if (bitsHeld >= 8) {
      bytes.push((buffer >>> (bitsHeld - 8)) & 255)
      bitsHeld -= 8
    }
  }

  return new Uint8Array(bytes)
}

/**
 * Crockford base32 treats I and L as 1, O as 0, and is case-insensitive, so
 * a value read off a label still decodes. Applied before decoding.
 */
export function normalizeCrockford(input: string): string {
  return input
    .toUpperCase()
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0")
    .replace(/[\s-]/g, "")
}
