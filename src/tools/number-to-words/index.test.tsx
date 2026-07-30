import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import NumberToWords from "."

/**
 * Number spelling is one of the few tool algorithms whose failure mode is a
 * plausible-looking wrong answer rather than a visible error, so it is worth
 * a test despite the per-tool coverage policy in docs/testing/testing.md.
 */
function words(): string {
  return (screen.getByLabelText("In words") as HTMLTextAreaElement).value
}

describe("Number to Words Converter", () => {
  it("spells a whole number using the international short scale", async () => {
    const user = userEvent.setup()
    render(<NumberToWords />)
    await user.type(screen.getByLabelText("Number"), "2500000")
    expect(words()).toBe("Two million five hundred thousand")
  })

  it("spells the decimal part digit by digit outside currency mode", async () => {
    const user = userEvent.setup()
    render(<NumberToWords />)
    await user.type(screen.getByLabelText("Number"), "1250.75")
    expect(words()).toBe("One thousand two hundred fifty point seven five")
  })

  it("rejects input that is not a number", async () => {
    const user = userEvent.setup()
    render(<NumberToWords />)
    await user.type(screen.getByLabelText("Number"), "12a4")
    expect(words()).toBe("")
    expect(screen.getByText(/Enter digits only/)).toBeInTheDocument()
  })
})
