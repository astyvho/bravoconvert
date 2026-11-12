import { expect, test, type Page } from "@playwright/test";

// Phase 3 of the redesign: the four remaining tools move onto the tool template (spec 7.3).
// Every case checks the same three things on a phone-sized screen, after the tool has work in it.

async function rejectOptionalCookies(page: Page) {
  const reject = page.getByRole("button", { name: "Reject", exact: true });
  if (await reject.isVisible()) await reject.click();
}

async function pngFiles(page: Page, testInfo: { outputPath: (name: string) => string }, count: number) {
  const files: string[] = [];
  for (let i = 0; i < count; i++) {
    const file = testInfo.outputPath(`t${i}.png`);
    await page.setContent(`<div style="width:64px;height:48px;background:hsl(${i * 40} 70% 50%)"></div>`);
    await page.locator("div").screenshot({ path: file });
    files.push(file);
  }
  return files;
}

async function expectRedesigned(page: Page, url: string, setup: () => Promise<void>) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(url);
  await rejectOptionalCookies(page);
  await setup();
  // (a) no legacy palette classes anywhere on the page
  const legacy = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[class*="gray-"],[class*="brand-"],[class*="bg-white"],[class*="text-black"]'))
      .map(el => `${el.tagName.toLowerCase()}.${String(el.getAttribute("class")).slice(0, 80)}`),
  );
  expect(legacy).toEqual([]);
  // (b) nothing wider than the phone
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  // (c) the work area comes before the panel when stacked
  const panel = page.locator("[data-tool-panel]");
  if (await panel.count()) {
    const mainTop = (await page.locator("[data-tool-main]").boundingBox())!.y;
    const panelTop = (await panel.boundingBox())!.y;
    expect(mainTop).toBeLessThan(panelTop);
  }
}

test("Image Converter uses the redesigned template", async ({ page }, testInfo) => {
  const files = await pngFiles(page, testInfo, 2);
  await expectRedesigned(page, "/convert/img/", async () => {
    await page.locator('input[type="file"]').first().setInputFiles(files);
    await expect(page.getByText("t1.png").first()).toBeVisible();
  });
});
