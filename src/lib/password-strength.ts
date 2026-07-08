export interface PasswordStrength {
  /** 0 = very weak, 4 = very strong */
  score: 0 | 1 | 2 | 3 | 4
  label: string
  entropyBits: number
  criteria: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSymbol: boolean
  }
}

const SCORE_LABELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"] as const

/**
 * Entropy-band heuristic: pool size is inferred from which character
 * classes appear in the password, entropy is length * log2(pool size), and
 * the result is bucketed into a 0-4 score. This intentionally avoids a
 * dictionary-based estimator (e.g. zxcvbn) to keep the bundle small - see
 * decisions.md ADR-009. It is a reasonable estimate of brute-force
 * resistance, not a check against known-breached or common passwords.
 */
export function estimatePasswordStrength(password: string): PasswordStrength {
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)
  const minLength = password.length >= 12

  let poolSize = 0
  if (hasUppercase) poolSize += 26
  if (hasLowercase) poolSize += 26
  if (hasNumber) poolSize += 10
  if (hasSymbol) poolSize += 32

  const entropyBits =
    password.length > 0 && poolSize > 0
      ? Math.round(password.length * Math.log2(poolSize))
      : 0

  let score: PasswordStrength["score"] = 0
  if (password.length === 0) score = 0
  else if (entropyBits < 28) score = 0
  else if (entropyBits < 36) score = 1
  else if (entropyBits < 60) score = 2
  else if (entropyBits < 80) score = 3
  else score = 4

  return {
    score,
    label: password.length === 0 ? "Enter a password" : SCORE_LABELS[score],
    entropyBits,
    criteria: { minLength, hasUppercase, hasLowercase, hasNumber, hasSymbol },
  }
}
