import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import WordCounter from "@/tools/word-counter"

describe("WordCounter", () => {
  it("shows all-zero stats before any input", () => {
    render(<WordCounter />)
    const zeros = screen.getAllByText("0", { selector: "p" })
    expect(zeros.length).toBe(6) // one per stat tile
  })

  it("counts words, characters, and sentences as the user types", async () => {
    const user = userEvent.setup()
    render(<WordCounter />)

    await user.type(screen.getByLabelText("Text to analyze"), "Hello world. It works!")

    expect(screen.getByText("4")).toBeInTheDocument() // words
    expect(screen.getByText("2")).toBeInTheDocument() // sentences
  })

  it("clears the text and resets stats when Clear is clicked", async () => {
    const user = userEvent.setup()
    render(<WordCounter />)
    const textarea = screen.getByLabelText("Text to analyze")

    await user.type(textarea, "some text here")
    await user.click(screen.getByRole("button", { name: /clear/i }))

    expect(textarea).toHaveValue("")
  })
})
