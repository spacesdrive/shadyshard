import { expect, test } from "@playwright/test"

const PAGES_TO_CHECK = [
  "/",
  "/tools/word-counter",
  "/tools/qr-code-generator",
  "/tools/image-compressor",
  "/category/developer",
  "/about",
]

for (const path of PAGES_TO_CHECK) {
  test(`${path} produces no console errors or page errors`, async ({ page }) => {
    const messages: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") messages.push(msg.text())
    })
    page.on("pageerror", (error) => messages.push(error.message))

    await page.goto(path)
    await page.waitForLoadState("networkidle")

    expect(messages, messages.join("\n")).toEqual([])
  })
}
