import { expect, test } from "@playwright/test";

test("ask-me page renders chat UI", async ({ page }) => {
  await page.goto("/ask-me");
  await expect(page.getByText("OMER-AI TERMINAL v2.0")).toBeVisible();
  await expect(page.getByLabel("Ask Omer AI chat input")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
});

test("ask-me sends message and renders mocked AI response", async ({ page }) => {
  await page.route("**/AI/ask", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        choices: [
          {
            message: {
              content: "Mocked AI reply",
            },
          },
        ],
      }),
    });
  });

  await page.goto("/ask-me");
  const input = page.getByLabel("Ask Omer AI chat input");
  await input.fill("Hello from Playwright");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText("Hello from Playwright")).toBeVisible();
  await expect(page.getByText("Mocked AI reply")).toBeVisible({ timeout: 10000 });
});
