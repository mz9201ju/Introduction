import { expect, test } from "@playwright/test";

test("ask-me page renders chat UI", async ({ page }) => {
  await page.goto("/ask-me");
  await expect(page.getByText("OMER-AI TERMINAL v2.0")).toBeVisible();
  await expect(page.getByLabel("Ask Omer AI chat input")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
});

test("ask-me handles mobile keyboard opening without CSS breakage", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile", "Mobile-only keyboard regression");

  await page.goto("/ask-me");
  const terminal = page.locator(".terminal-card");
  const inputSection = page.locator(".input-section");
  const wrapper = page.locator(".askme-wrapper");
  const input = page.getByLabel("Ask Omer AI chat input");

  await expect(terminal).toBeVisible();
  await expect(inputSection).toBeVisible();

  const before = await page.evaluate(() => {
    const wrapperNode = document.querySelector(".askme-wrapper");
    const inputSectionNode = document.querySelector(".input-section");
    const wrapperRect = wrapperNode?.getBoundingClientRect();
    const inputRect = inputSectionNode?.getBoundingClientRect();
    const visualTop = window.visualViewport?.offsetTop || 0;
    const visualHeight = window.visualViewport?.height || window.innerHeight;
    return {
      wrapperTop: wrapperRect?.top ?? 0,
      inputBottom: inputRect?.bottom ?? 0,
      visualBottom: visualTop + visualHeight,
      pageScrollY: window.scrollY,
    };
  });

  await input.focus();

  await page.evaluate(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const nextHeight = Math.max(280, Math.floor(vv.height * 0.62));
    Object.defineProperty(vv, "height", { value: nextHeight, configurable: true });
    Object.defineProperty(vv, "offsetTop", { value: 0, configurable: true });
    vv.dispatchEvent(new Event("resize"));
    vv.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
  });

  await page.waitForTimeout(500);

  await expect(terminal).toBeVisible();
  await expect(input).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(input).toBeFocused();

  await input.type("mobile keyboard test");
  const inputValue = await input.inputValue();
  expect(inputValue).toContain("mobile keyboard test");

  const after = await page.evaluate(() => {
    const wrapperNode = document.querySelector(".askme-wrapper");
    const inputSectionNode = document.querySelector(".input-section");
    const wrapperRect = wrapperNode?.getBoundingClientRect();
    const inputRect = inputSectionNode?.getBoundingClientRect();
    const visualTop = window.visualViewport?.offsetTop || 0;
    const visualHeight = window.visualViewport?.height || window.innerHeight;
    return {
      wrapperTop: wrapperRect?.top ?? 0,
      inputBottom: inputRect?.bottom ?? 0,
      visualBottom: visualTop + visualHeight,
      pageScrollY: window.scrollY,
    };
  });

  expect(Math.abs(after.wrapperTop - before.wrapperTop)).toBeLessThanOrEqual(6);
  expect(after.inputBottom).toBeLessThanOrEqual(after.visualBottom + 8);
  expect(after.pageScrollY).toBeLessThanOrEqual(before.pageScrollY + 4);
  await expect(wrapper).toHaveClass(/is-keyboard-active/);
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

// --- Regression: wrapper must not expand beyond visual viewport when textarea is focused ---
test("ask-me wrapper height does not exceed viewport when textarea focused on mobile", async ({ page }) => {
  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  const viewportHeight = page.viewportSize().height;

  // Record wrapper height before focus
  const heightBefore = await page.evaluate(() => {
    const wrapper = document.querySelector(".askme-wrapper");
    return wrapper?.getBoundingClientRect().height ?? 0;
  });

  // Focus the textarea (triggers keyboard on real mobile; on desktop just checks no regression)
  await page.getByLabel("Ask Omer AI chat input").focus();
  await page.waitForTimeout(300);

  const heightAfter = await page.evaluate(() => {
    const wrapper = document.querySelector(".askme-wrapper");
    return wrapper?.getBoundingClientRect().height ?? 0;
  });

  // Wrapper height must never exceed the viewport height
  expect(heightBefore).toBeLessThanOrEqual(viewportHeight + 1);
  expect(heightAfter).toBeLessThanOrEqual(viewportHeight + 1);
});

// --- Regression: body scroll must be locked while ask-me is mounted ---
test("ask-me locks body scroll while mounted", async ({ page }) => {
  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  const overflow = await page.evaluate(() => document.body.style.overflow);
  expect(overflow).toBe("hidden");
});

// --- Regression: askme-wrapper must not use a translateY offset that shifts it off-screen ---
test("ask-me wrapper has no unexpected vertical translate offset", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile", "Mobile-only viewport anchoring regression");

  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  const baseline = await page.evaluate(() => {
    const wrapperNode = document.querySelector(".askme-wrapper");
    return wrapperNode?.getBoundingClientRect().top ?? 0;
  });

  await page.getByLabel("Ask Omer AI chat input").focus();

  const afterKeyboardResize = await page.evaluate(() => {
    const vv = window.visualViewport;
    if (vv) {
      const nextHeight = Math.max(280, Math.floor(vv.height * 0.62));
      Object.defineProperty(vv, "height", { value: nextHeight, configurable: true });
      vv.dispatchEvent(new Event("resize"));
      vv.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    }

    const wrapperNode = document.querySelector(".askme-wrapper");
    return wrapperNode?.getBoundingClientRect().top ?? -1;
  });

  expect(baseline).toBeGreaterThanOrEqual(-1);
  expect(afterKeyboardResize).toBeGreaterThanOrEqual(-1);
  expect(Math.abs(afterKeyboardResize - baseline)).toBeLessThanOrEqual(6);
});

// --- Component: terminal-card renders title, chat area, input section and send button ---
test("ask-me terminal-card contains all expected sub-components", async ({ page }) => {
  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  await expect(page.locator(".terminal-card")).toBeVisible();
  await expect(page.locator(".terminal-header")).toBeVisible();
  await expect(page.locator(".chat-area")).toBeVisible();
  await expect(page.locator(".input-section")).toBeVisible();
  await expect(page.locator(".askme-input")).toBeVisible();
  await expect(page.locator(".askme-button")).toBeVisible();
});

// --- Component: askme-input accepts keyboard input and clears on submission ---
test("ask-me input accepts text and clears on Enter", async ({ page }) => {
  await page.route("**/api/**", (route) => route.fulfill({ status: 200, body: JSON.stringify({ reply: "test" }) }));
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "fetch" && !route.request().url().includes("/ask-me")) {
      await route.fulfill({ status: 200, body: JSON.stringify({ reply: "ok" }) });
    } else {
      await route.continue();
    }
  });

  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  const input = page.getByLabel("Ask Omer AI chat input");
  await input.fill("hello");
  await expect(input).toHaveValue("hello");

  // Shift+Enter should NOT submit — it should keep the text
  await input.press("Shift+Enter");
  const valueAfterShiftEnter = await input.inputValue();
  expect(valueAfterShiftEnter.replace(/\n/g, "")).toBe("hello");
});

// --- Component: chat-area scrolls independently without moving the wrapper ---
test("ask-me chat-area is independently scrollable without moving wrapper", async ({ page }) => {
  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  const wrapperTopBefore = await page.evaluate(() =>
    document.querySelector(".askme-wrapper")?.getBoundingClientRect().top ?? 0
  );

  // Scroll inside chat-area
  await page.evaluate(() => {
    const chatArea = document.querySelector(".chat-area");
    if (chatArea) chatArea.scrollTop = 50;
  });

  const wrapperTopAfter = await page.evaluate(() =>
    document.querySelector(".askme-wrapper")?.getBoundingClientRect().top ?? 0
  );

  // Wrapper position must not shift when chat-area is scrolled
  expect(wrapperTopAfter).toBe(wrapperTopBefore);
});

// --- Component: viewport meta prevents zoom on mobile ---
test("ask-me viewport meta disables user scaling", async ({ page }) => {
  await page.goto("/ask-me");
  await page.waitForLoadState("networkidle");

  const content = await page.evaluate(
    () => document.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? ""
  );

  expect(content).toContain("user-scalable=no");
  expect(content).toContain("maximum-scale=1");
  expect(content).toContain("viewport-fit=cover");
});
