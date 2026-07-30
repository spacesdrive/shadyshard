import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EncodingFixer from "."

/**
 * Reversing a mojibake misread depends on an exact Windows-1252 byte mapping.
 * A single wrong entry in that table silently produces a repair that looks
 * almost right, which is why the round trip is asserted here.
 */
describe("Text Encoding Fixer", () => {
  it("repairs UTF-8 that was read as Windows-1252", async () => {
    const user = userEvent.setup()
    render(<EncodingFixer />)
    await user.type(screen.getByLabelText("Garbled text"), "cafÃ© rÃ©sumÃ©")
    expect(screen.getByLabelText(/Read as Windows-1252/)).toHaveValue("café résumé")
  })

  it("recovers curly punctuation from the Windows-1252 high range", async () => {
    const user = userEvent.setup()
    render(<EncodingFixer />)
    await user.type(screen.getByLabelText("Garbled text"), "donâ€™t")
    expect(screen.getByLabelText(/Read as Windows-1252/)).toHaveValue("don’t")
  })

  it("reports nothing to repair for text that is already correct", async () => {
    const user = userEvent.setup()
    render(<EncodingFixer />)
    await user.type(screen.getByLabelText("Garbled text"), "already fine")
    expect(screen.getByText(/No reversible misread was found/)).toBeInTheDocument()
  })
})
