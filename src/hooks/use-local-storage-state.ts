import { useEffect, useState } from "react"

/**
 * Persists state to localStorage under `key`, initializing from any
 * previously stored value. Malformed or missing stored JSON silently falls
 * back to `initialValue` rather than throwing, since a corrupted planning
 * list shouldn't crash the tool.
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    const stored = window.localStorage.getItem(key)
    if (!stored) return initialValue
    try {
      return JSON.parse(stored) as T
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
