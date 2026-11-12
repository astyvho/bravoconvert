import { expect, test, type Page } from "@playwright/test";

// Phase 4 of the redesign: content pages share one header (label pill, H1, one line, date) and the
// Prose body (spec 7.4). Every page is checked on a phone-sized screen.

async function expectContentRedesigned(page: Page, url: string) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(url);
  // (a) no legacy palette classes
  const legacy = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[class*="gray-"],[class*="brand-"],[class*="blue-"],[class*="bg-white"],[class*="text-black"],[class*="bg-black"],[class*="from-black"],[class*="amber-"],[class*="green-"],[class*="red-"]'))
      .map(el => `${el.tagName.toLowerCase()}.${String(el.getAttribute("class")).slice(0, 80)}`),
  );
  expect(legacy).toEqual([]);
  // (b) nothing wider than the phone; wide tables scroll inside their own box
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  // (c) exactly one H1
  await expect(page.locator("h1")).toHaveCount(1);
  // (d) the label pill sits in the page header
  await expect(page.locator("header [data-content-label]")).toHaveCount(1);
}

test("About uses the content template", async ({ page }) => {
  await expectContentRedesigned(page, "/about/");
});

test("FAQ uses the content template", async ({ page }) => {
  await expectContentRedesigned(page, "/faq/");
});

test("FAQ answers are in the static HTML even while folded", async ({ page }) => {
  const html = await (await page.request.get("/faq/")).text();
  expect(html).toContain("does not require an app, extension, account, or login");
  await page.goto("/faq/");
  await expect(page.locator("details")).not.toHaveCount(0);
  await expect(page.locator("details[open]")).toHaveCount(0);
});

test("FAQ questions open and close from the keyboard", async ({ page }) => {
  await page.goto("/faq/");
  const question = page.locator("summary", { hasText: "What image formats can I convert?" });
  const answer = page.getByText("You can convert JPG/JPEG, PNG, and WebP images to JPG, PNG, or WebP.");
  await expect(answer).toBeHidden();
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(answer).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(answer).toBeHidden();
});
