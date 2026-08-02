import { describe, expect, it } from "vitest"
import {
  Base32DecodeError,
  CROCKFORD_ALPHABET,
  RFC4648_ALPHABET,
  decodeBase32,
  encodeBase32,
  normalizeCrockford,
} from "./base32"

function encodeText(text: string, alphabet = RFC4648_ALPHABET, pad = true): string {
  return encodeBase32(new TextEncoder().encode(text), alphabet, pad)
}

function decodeText(value: string, alphabet = RFC4648_ALPHABET): string {
  return new TextDecoder().decode(decodeBase32(value, alphabet))
}

describe("encodeBase32", () => {
  it("matches the RFC 4648 section 10 test vectors", () => {
    expect(encodeText("")).toBe("")
    expect(encodeText("f")).toBe("MY======")
    expect(encodeText("fo")).toBe("MZXQ====")
    expect(encodeText("foo")).toBe("MZXW6===")
    expect(encodeText("foob")).toBe("MZXW6YQ=")
    expect(encodeText("fooba")).toBe("MZXW6YTB")
    expect(encodeText("foobar")).toBe("MZXW6YTBOI======")
  })

  it("omits padding when it is not requested", () => {
    expect(encodeText("f", RFC4648_ALPHABET, false)).toBe("MY")
    expect(encodeText("foobar", RFC4648_ALPHABET, false)).toBe("MZXW6YTBOI")
  })
})

describe("decodeBase32", () => {
  it("round trips every RFC 4648 vector", () => {
    for (const value of ["", "f", "fo", "foo", "foob", "fooba", "foobar"]) {
      expect(decodeText(encodeText(value))).toBe(value)
    }
  })

  it("names the character it could not decode", () => {
    expect(() => decodeBase32("ABC1", RFC4648_ALPHABET)).toThrow(Base32DecodeError)
    expect(() => decodeBase32("ABC1", RFC4648_ALPHABET)).toThrow(/"1"/)
  })

  it("ignores padding, whitespace, and hyphens", () => {
    expect(decodeText("MZXW 6YTB-OI======")).toBe("foobar")
  })
})

describe("normalizeCrockford", () => {
  it("maps look-alike characters back to digits", () => {
    expect(normalizeCrockford("oil-01")).toBe("01101")
  })

  it("produces a string the Crockford alphabet can decode", () => {
    const encoded = encodeBase32(
      new TextEncoder().encode("hello"),
      CROCKFORD_ALPHABET,
      false,
    )
    expect(
      new TextDecoder().decode(
        decodeBase32(normalizeCrockford(encoded.toLowerCase()), CROCKFORD_ALPHABET),
      ),
    ).toBe("hello")
  })
})
