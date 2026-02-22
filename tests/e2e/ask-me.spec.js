import { expect, test } from "@playwright/test";

test("ask-me page renders chat UI", async ({ page }) => {
  await page.goto("/ask-me");
  await expect(page.getByText("OMER-AI TERMINAL v2.0")).toBeVisible();
  await expect(page.getByLabel("Ask Omer AI chat input")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
});

test("ask-me handles mobile keyboard opening without CSS breakage", async ({ page }) => {
  await page.goto("/ask-me");

  // Capture initial state before keyboard
  await page.screenshot({ path: "test-results/mobile-ask-me-before-keyboard.png" });

  const terminal = page.locator(".terminal-card");
  const chatArea = page.locator(".chat-area");
  const inputSection = page.locator(".input-section");

  // Verify layout is intact before interaction
  await expect(terminal).toBeVisible();
  await expect(chatArea).toBeVisible();
  await expect(inputSection).toBeVisible();

  // Focus on textarea (simulates keyboard opening on mobile)
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
  await page.screenshot({ path: "test-results/mobile-ask-me-with-keyboard.png" });

  // Verify critical UI elements still exist and are positioned correctly
  await expect(terminal).toBeVisible();
  await expect(input).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();

  // Verify input is still focused and accessible
  await expect(input).toBeFocused();

  // Type some text to verify input still works
  await input.type("mobile keyboard test");
  
  // Verify text was entered
  const inputValue = await input.inputValue();
  expect(inputValue).toContain("mobile keyboard test");

  // Verify chat area is still scrollable
  const scrollHeight = await chatArea.evaluate((el) => el.scrollHeight);
  expect(scrollHeight).toBeGreaterThan(0);
});

test("ask-me viewport meta locks zoom and scroll", async ({ page }) => {
  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  const viewportContent = await page.evaluate(
    () => document.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? ""
  );

  expect(viewportContent).toContain("user-scalable=no");
  expect(viewportContent).toContain("maximum-scale=1");
});

test("ask-me wrapper height tracks visual viewport height on keyboard open", async ({ page }) => {
  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  const initialVV = await page.evaluate(() => window.visualViewport?.height || window.innerHeight);

  // Simulate keyboard opening (reduce visual viewport height by ~40%)
  await page.evaluate((origHeight) => {
    const newHeight = Math.floor(origHeight * 0.6);
    if (window.visualViewport) {
      Object.defineProperty(window.visualViewport, "height", {
        value: newHeight,
        configurable: true,
      });
      window.visualViewport.dispatchEvent(new Event("resize"));
    }
  }, initialVV);

  // Wait until --askme-vh reflects the reduced viewport height
  await page.waitForFunction((origHeight) => {
    const vhVar = getComputedStyle(document.documentElement).getPropertyValue("--askme-vh").trim();
    const vhPx = parseFloat(vhVar);
    return vhPx > 0 && vhPx < origHeight * 0.01 * 0.9;
  }, initialVV);

  const result = await page.evaluate(() => {
    const vhVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--askme-vh")
      .trim();
    const vvHeight = window.visualViewport?.height || window.innerHeight;
    return { vhPx: parseFloat(vhVar), vvHeight };
  });

  // --askme-vh should reflect the reduced viewport height (vvHeight / 100)
  expect(result.vhPx).toBeGreaterThan(0);
  expect(Math.abs(result.vhPx - result.vvHeight / 100)).toBeLessThan(2);
});

test("ask-me chat-area does not grow beyond wrapper on mobile", async ({ page }) => {
  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  const initialVV = await page.evaluate(() => window.visualViewport?.height || window.innerHeight);

  // Simulate keyboard opening
  await page.evaluate((origHeight) => {
    const newHeight = Math.floor(origHeight * 0.6);
    if (window.visualViewport) {
      Object.defineProperty(window.visualViewport, "height", {
        value: newHeight,
        configurable: true,
      });
      window.visualViewport.dispatchEvent(new Event("resize"));
    }
  }, initialVV);

  // Wait until --askme-vh reflects the reduced viewport height
  await page.waitForFunction((origHeight) => {
    const vhVar = getComputedStyle(document.documentElement).getPropertyValue("--askme-vh").trim();
    const vhPx = parseFloat(vhVar);
    return vhPx > 0 && vhPx < origHeight * 0.01 * 0.9;
  }, initialVV);

  const bounds = await page.evaluate(() => {
    const wrapper = document.querySelector(".askme-wrapper");
    const chatArea = document.querySelector(".chat-area");
    const wRect = wrapper?.getBoundingClientRect();
    const cRect = chatArea?.getBoundingClientRect();
    return {
      wrapperBottom: wRect ? wRect.top + wRect.height : 0,
      chatAreaBottom: cRect ? cRect.top + cRect.height : 0,
    };
  });

  // chat-area bottom should not exceed the wrapper bottom (with a small tolerance)
  expect(bounds.chatAreaBottom).toBeLessThanOrEqual(bounds.wrapperBottom + 10);
});

test("ask-me input section is visible within wrapper when keyboard is active", async ({ page }) => {
  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  const initialVV = await page.evaluate(() => window.visualViewport?.height || window.innerHeight);

  // Focus input to trigger keyboard active state
  await page.getByLabel("Ask Omer AI chat input").focus();

  // Simulate keyboard opening
  await page.evaluate((origHeight) => {
    const newHeight = Math.floor(origHeight * 0.6);
    if (window.visualViewport) {
      Object.defineProperty(window.visualViewport, "height", {
        value: newHeight,
        configurable: true,
      });
      window.visualViewport.dispatchEvent(new Event("resize"));
    }
  }, initialVV);

  // Wait until --askme-vh reflects the reduced viewport height
  await page.waitForFunction((origHeight) => {
    const vhVar = getComputedStyle(document.documentElement).getPropertyValue("--askme-vh").trim();
    const vhPx = parseFloat(vhVar);
    return vhPx > 0 && vhPx < origHeight * 0.01 * 0.9;
  }, initialVV);

  const visibility = await page.evaluate(() => {
    const wrapper = document.querySelector(".askme-wrapper");
    const inputSection = document.querySelector(".input-section");
    const wRect = wrapper?.getBoundingClientRect();
    const iRect = inputSection?.getBoundingClientRect();
    return {
      wrapperBottom: wRect ? wRect.top + wRect.height : 0,
      inputSectionBottom: iRect ? iRect.top + iRect.height : 0,
      inputSectionTop: iRect?.top ?? 0,
    };
  });

  // input-section should be entirely within wrapper bounds
  expect(visibility.inputSectionBottom).toBeLessThanOrEqual(visibility.wrapperBottom + 10);
  expect(visibility.inputSectionTop).toBeGreaterThanOrEqual(0);
});
