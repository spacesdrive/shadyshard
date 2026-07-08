/**
 * Rejection-sampled random integer in [0, maxExclusive) using Web Crypto,
 * not Math.random(). Plain modulo on a crypto random value is biased
 * toward low values when maxExclusive doesn't evenly divide 2^32; rejecting
 * values above the last full multiple of maxExclusive removes that bias.
 * Used anywhere randomness feeds into a generated secret (passwords, IDs).
 */
export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("maxExclusive must be a positive integer")
  }
  const maxUint32 = 0xffffffff
  const limit = maxUint32 - (maxUint32 % maxExclusive)
  const buffer = new Uint32Array(1)
  let value: number
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)
  return value % maxExclusive
}

/** Picks one character from `pool` using secureRandomInt. */
export function secureRandomChar(pool: string): string {
  return pool[secureRandomInt(pool.length)]
}

/** Builds a random string of `length` characters drawn from `pool`. */
export function secureRandomString(length: number, pool: string): string {
  let result = ""
  for (let i = 0; i < length; i++) result += secureRandomChar(pool)
  return result
}
