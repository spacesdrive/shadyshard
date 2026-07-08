import { expect, test } from "@playwright/test"

test.describe("global search", () => {
  test("opens via the visible trigger button and navigates to a result", async ({
    page,
  }) => {
    await page.goto("/")
    await page.getByRole("button", { name: /search tools/i }).click()

    const dialog = page.getByRole("dialog", { name: "Search tools" })
    await expect(dialog).toBeVisible()

    await page.getByPlaceholder(/search.*tools/i).fill("word counter")
    await page.getByRole("option", { name: /word counter/i }).click()

    await expect(page).toHaveURL(/\/tools\/word-counter/)
  })

  test("opens via the Ctrl/Cmd+K keyboard shortcut", async ({ page }) => {
    await page.goto("/")
    await page.locator("body").click()
    await page.keyboard.press("Control+K")
    await expect(page.getByRole("dialog", { name: "Search tools" })).toBeVisible()
  })

  test("shows an empty state for a query that matches nothing", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: /search tools/i }).click()
    await page.getByPlaceholder(/search.*tools/i).fill("zzzznonexistenttoolzzzz")
    await expect(page.getByText(/no tools found/i)).toBeVisible()
  })
})
