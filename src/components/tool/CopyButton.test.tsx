import { describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CopyButton } from "@/components/tool/CopyButton"

describe("CopyButton", () => {
  it("is disabled when value is empty", () => {
    render(<CopyButton value="" />)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("copies the value to the clipboard and shows confirmation on click", async () => {
    const user = userEvent.setup()
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined)
    render(<CopyButton value="hello world" label="Copy" />)

    const button = screen.getByRole("button", { name: /copy/i })
    await user.click(button)

    expect(writeText).toHaveBeenCalledWith("hello world")
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument())
  })

  it("uses aria-label instead of visible text for icon-only sizes", () => {
    render(<CopyButton value="x" label="Copy result" size="icon" />)
    expect(screen.getByRole("button", { name: "Copy result" })).toBeInTheDocument()
  })
})
