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
