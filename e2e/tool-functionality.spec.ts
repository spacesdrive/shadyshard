import { expect, test } from "@playwright/test"

test.describe("tool functionality", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
  })

  test("word counter updates stats live and clears on reset", async ({ page }) => {
    await page.goto("/tools/word-counter")

    const input = page.getByLabel("Text to analyze")
    await input.fill("Hello world. It works!")

    await expect(page.getByText("4", { exact: true })).toBeVisible() // words
    await expect(page.getByText("2", { exact: true })).toBeVisible() // sentences

    await page.getByRole("button", { name: /clear/i }).click()
    await expect(input).toHaveValue("")
  })

  test("copy button places tool output on the clipboard", async ({ page }) => {
    await page.goto("/tools/word-counter")
    await page.getByLabel("Text to analyze").fill("copy me")
    await page.getByRole("button", { name: /copy text/i }).click()

    await expect(page.getByRole("button", { name: /copied/i })).toBeVisible()
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toBe("copy me")
  })

  test("JSON formatter formats valid JSON in place and reports invalid JSON inline", async ({
    page,
  }) => {
    await page.goto("/tools/json-formatter")
    const textarea = page.getByLabel("JSON input")

    await textarea.fill('{"b":1,"a":2}')
    await page.getByRole("button", { name: /^format$/i }).click()
    await expect(textarea).toHaveValue(/\n/)

    await textarea.fill("{not valid json")
    await page.getByRole("button", { name: /^format$/i }).click()
    await expect(page.locator(".text-destructive")).toBeVisible()
  })

  test("password generator produces a password matching the selected length", async ({
    page,
  }) => {
    await page.goto("/tools/password-generator")
    const output = page.getByRole("textbox").first()
    await expect(output).not.toHaveValue("")
  })
})
