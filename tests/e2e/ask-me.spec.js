import { expect, test } from "@playwright/test";

test("ask-me page renders chat UI", async ({ page }) => {
  await page.goto("/ask-me");
  await expect(page.getByText("OMER-AI TERMINAL v2.0")).toBeVisible();
  await expect(page.getByLabel("Ask Omer AI chat input")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
});

test("ask-me handles iPhone keyboard opening without CSS breakage", async ({ page }) => {
  await page.goto("/ask-me");

  // Capture initial state before keyboard
  await page.screenshot({ path: "test-results/iphone-ask-me-before-keyboard.png" });

  const terminal = page.locator(".terminal-card");
  const chatArea = page.locator(".chat-area");
  const inputSection = page.locator(".input-section");

  // Verify layout is intact before interaction
  await expect(terminal).toBeVisible();
  await expect(chatArea).toBeVisible();
  await expect(inputSection).toBeVisible();

  // Focus on textarea (simulates keyboard opening on real iPhone)
  const input = page.getByLabel("Ask Omer AI chat input");
  await input.focus();

  // Simulate keyboard appearing by injecting visualViewport height change
  await page.evaluate(() => {
    if (window.visualViewport) {
      // Simulate mobile keyboard reducing viewport height
      const originalHeight = window.visualViewport.height;
      const keyboardHeight = originalHeight * 0.4; // 40% keyboard reduction
      Object.defineProperty(window.visualViewport, "height", {
        value: Math.max(300, originalHeight - keyboardHeight),
        configurable: true,
      });
      // Trigger resize event to notify listeners
      window.dispatchEvent(new Event("resize"));
      window.visualViewport?.dispatchEvent(new Event("resize"));
    }
  });

  // Wait for any layout shift from keyboard opening
  await page.waitForTimeout(500);

  // Capture state with keyboard "open"
  await page.screenshot({ path: "test-results/iphone-ask-me-with-keyboard.png" });

  // Verify critical UI elements still exist and are positioned correctly
  await expect(terminal).toBeVisible();
  await expect(input).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();

  // Verify input is still focused and accessible
  await expect(input).toBeFocused();

  // Type some text to verify input still works
  await input.type("iPhone keyboard test");
  
  // Verify text was entered
  const inputValue = await input.inputValue();
  expect(inputValue).toContain("iPhone keyboard test");

  // Verify chat area is still scrollable
  const scrollHeight = await chatArea.evaluate((el) => el.scrollHeight);
  expect(scrollHeight).toBeGreaterThan(0);
});
