import { describe, expect, it } from "vitest"
import {
  secureRandomChar,
  secureRandomInt,
  secureRandomString,
} from "@/lib/secure-random"

describe("secureRandomInt", () => {
  it("stays within [0, maxExclusive) across many draws", () => {
    for (let i = 0; i < 500; i++) {
      const value = secureRandomInt(7)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(7)
    }
  })

  it("rejects a non-positive or non-integer bound", () => {
    expect(() => secureRandomInt(0)).toThrow()
    expect(() => secureRandomInt(-3)).toThrow()
    expect(() => secureRandomInt(1.5)).toThrow()
  })

  it("can return every value in a small range (no off-by-one exclusion)", () => {
    const seen = new Set<number>()
    for (let i = 0; i < 500; i++) seen.add(secureRandomInt(3))
    expect(seen).toEqual(new Set([0, 1, 2]))
  })
})

describe("secureRandomChar", () => {
  it("always returns a character from the given pool", () => {
    const pool = "ABC"
    for (let i = 0; i < 100; i++) {
      expect(pool).toContain(secureRandomChar(pool))
    }
  })
})

describe("secureRandomString", () => {
  it("produces a string of the requested length using only pool characters", () => {
    const pool = "abcdef123456"
    const result = secureRandomString(24, pool)
    expect(result).toHaveLength(24)
    for (const char of result) expect(pool).toContain(char)
  })

  it("returns an empty string for length 0", () => {
    expect(secureRandomString(0, "abc")).toBe("")
  })
})
