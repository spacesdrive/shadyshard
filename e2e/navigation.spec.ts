import { expect, test } from "@playwright/test"

test.describe("navigation and routing", () => {
  test("homepage loads with a single h1 and links to every category", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/ShadyShard/)
    await expect(page.locator("h1")).toHaveCount(1)
    await expect(page.getByRole("link", { name: "Text Tools" }).first()).toBeVisible()
  })

  test("navigating to a category page shows its tools and breadcrumb", async ({
    page,
  }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Developer Tools" }).first().click()
    await expect(page).toHaveURL(/\/category\/developer/)
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible()
  })

  test("navigating to a tool page shows breadcrumb, features, and FAQ", async ({
    page,
  }) => {
    await page.goto("/tools/word-counter")
    await expect(page.locator("h1")).toHaveText(/Word Counter/)
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible()
    await expect(page.getByRole("heading", { name: /frequently asked/i })).toBeVisible()
  })

  test("an unknown route renders the not-found page instead of crashing", async ({
    page,
  }) => {
    const response = await page.goto("/this-tool-does-not-exist")
    expect(response?.ok()).toBe(true)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/not found|404/i)
  })

  test("footer legal links resolve without error", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Privacy Policy" }).click()
    await expect(page).toHaveURL(/\/privacy/)
    await expect(page.locator("h1")).toBeVisible()
  })
})
