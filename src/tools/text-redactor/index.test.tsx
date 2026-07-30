import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TextRedactor from "."

/**
 * Email detection validates the domain shape in `accept` rather than in the
 * pattern, because writing the dot structure into the pattern backtracks
 * quadratically on pasted text. A regression there fails silently by leaving
 * an address unredacted, which is the failure mode this tool exists to
 * prevent, so the boundary cases are pinned here.
 */
function redacted(): string {
  return (screen.getByLabelText(/^Redacted text/) as HTMLTextAreaElement).value
}

async function type(text: string) {
  const user = userEvent.setup()
  render(<TextRedactor />)
  await user.type(screen.getByLabelText("Text to redact"), text)
}

describe("Text Redactor", () => {
  it("keeps repeated values on the same numbered placeholder", async () => {
    await type("ada@x.com then bob@x.com then ada@x.com at 10.0.0.1")
    expect(redacted()).toBe("[EMAIL_1] then [EMAIL_2] then [EMAIL_1] at [IPV4_1]")
  })

  it("redacts subdomains and plus-addressing", async () => {
    await type("a.b+tag@sub.example.co.uk")
    expect(redacted()).toBe("[EMAIL_1]")
  })

  it("leaves a bare hostname with no dot alone", async () => {
    await type("root@localhost")
    expect(redacted()).toBe("root@localhost")
  })

  it("leaves a trailing dot outside the redacted address", async () => {
    await type("mail ada@example.com.")
    expect(redacted()).toBe("mail [EMAIL_1].")
  })
})
