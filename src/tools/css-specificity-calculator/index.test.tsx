import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CssSpecificityCalculator from "."

/**
 * The functional pseudo-classes are the part of specificity people get wrong,
 * and a wrong score here looks entirely plausible, so the scoring rules are
 * pinned down rather than left to manual checking.
 */
describe("CSS Specificity Calculator", () => {
  it("counts ids, classes, and elements separately", async () => {
    const user = userEvent.setup()
    render(<CssSpecificityCalculator />)
    await user.type(
      screen.getByLabelText("Selectors, one per line"),
      "#sidebar .card a:hover",
    )
    expect(screen.getByText("1, 2, 1")).toBeInTheDocument()
  })

  it("scores where() as zero and is() by its most specific argument", async () => {
    const user = userEvent.setup()
    render(<CssSpecificityCalculator />)
    await user.type(
      screen.getByLabelText("Selectors, one per line"),
      ":where(.theme) .card a{enter}:is(#main, .x) p",
    )
    expect(screen.getByText("0, 1, 1")).toBeInTheDocument()
    expect(screen.getByText("1, 0, 1")).toBeInTheDocument()
  })

  it("marks the most specific selector when several are compared", async () => {
    const user = userEvent.setup()
    render(<CssSpecificityCalculator />)
    await user.type(
      screen.getByLabelText("Selectors, one per line"),
      ".card a{enter}#sidebar a",
    )
    expect(screen.getByText("Most specific")).toBeInTheDocument()
  })
})
