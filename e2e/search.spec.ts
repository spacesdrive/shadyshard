import { expect, test } from "@playwright/test"

// The header renders two different search triggers -- a labeled button on
// desktop (`hidden sm:flex`) and an icon-only button on mobile
// (`sm:hidden`) -- so tests must pick the one actually visible at the
// current viewport rather than a single shared locator.
async function openSearch(page: import("@playwright/test").Page, isMobile: boolean) {
  const name = isMobile ? "Search" : /search tools/i
  await page.getByRole("button", { name }).click()
}

test.describe("global search", () => {
  test("opens via the visible trigger button and navigates to a result", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/")
    await openSearch(page, isMobile)

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

  test("shows an empty state for a query that matches nothing", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/")
    await openSearch(page, isMobile)
    await page.getByPlaceholder(/search.*tools/i).fill("zzzznonexistenttoolzzzz")
    await expect(page.getByText(/no tools found/i)).toBeVisible()
  })
})
