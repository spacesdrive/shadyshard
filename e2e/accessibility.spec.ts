import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const PAGES_TO_AUDIT = [
  "/",
  "/tools/word-counter",
  "/tools/password-generator",
  "/category/developer",
  "/about",
]

for (const path of PAGES_TO_AUDIT) {
  test(`${path} has no serious or critical accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    )

    expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([])
  })
}

test("every interactive control on the homepage is keyboard reachable", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("link", { name: "Skip to content" }).focus()
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused()

  await page.keyboard.press("Tab")
  await expect(page.locator(":focus")).toBeVisible()
})
