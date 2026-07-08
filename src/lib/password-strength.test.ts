import { describe, expect, it } from "vitest"
import { estimatePasswordStrength } from "@/lib/password-strength"

describe("estimatePasswordStrength", () => {
  it("scores an empty password as 0 with no criteria met", () => {
    const result = estimatePasswordStrength("")
    expect(result.score).toBe(0)
    expect(result.entropyBits).toBe(0)
  })

  it("scores a short, single-character-class password as weak", () => {
    const result = estimatePasswordStrength("abc")
    expect(result.score).toBeLessThanOrEqual(1)
    expect(result.criteria.hasLowercase).toBe(true)
    expect(result.criteria.hasUppercase).toBe(false)
  })

  it("scores a long password mixing all character classes as strong", () => {
    const result = estimatePasswordStrength("Tr0ub4dor&3xtraLong!")
    expect(result.score).toBeGreaterThanOrEqual(3)
    expect(result.criteria.hasUppercase).toBe(true)
    expect(result.criteria.hasLowercase).toBe(true)
    expect(result.criteria.hasNumber).toBe(true)
    expect(result.criteria.hasSymbol).toBe(true)
  })

  it("flags minLength only at 12+ characters", () => {
    expect(estimatePasswordStrength("short11!").criteria.minLength).toBe(false)
    expect(estimatePasswordStrength("exactlyTwelve").criteria.minLength).toBe(true)
  })

  it("monotonically increases entropy as length grows in the same pool", () => {
    const shorter = estimatePasswordStrength("abcabcabc")
    const longer = estimatePasswordStrength("abcabcabcabcabcabc")
    expect(longer.entropyBits).toBeGreaterThan(shorter.entropyBits)
  })
})
