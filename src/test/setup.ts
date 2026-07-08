import { vi } from "vitest"
import "@testing-library/jest-dom/vitest"

// jsdom's navigator.clipboard is a read-only accessor with no real backing
// store, so Object.assign silently no-ops. Tools call writeText/readText
// directly, so tests need a real, spy-able replacement.
Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
})
