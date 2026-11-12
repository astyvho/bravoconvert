import { expect, test } from "@playwright/test";

test("pages use the warm token palette and the new fonts", async ({ page }) => {
  await page.goto("/");
  const body = page.locator("body");
  await expect(body).toHaveCSS("background-color", "rgb(255, 248, 241)");
  await expect(body).toHaveCSS("color", "rgb(42, 36, 32)");
  // next/font names the family "__Plus_Jakarta_Sans_<hash>", so allow either spaces or underscores.
  expect(await body.evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/Plus[ _]Jakarta[ _]Sans/);
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute("content", /^(?!.*maximum-scale)/);

  await page.goto("/ko/");
  expect(await page.locator("body").evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/Pretendard/);
  await expect(page.locator('link[href*="pretendard"]')).toHaveCount(1);
});
