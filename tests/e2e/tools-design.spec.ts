import { expect, test, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";

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

async function pdfFile(testInfo: { outputPath: (name: string) => string }, name: string, pages: number) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([400 + i * 10, 560]);
  const path = testInfo.outputPath(name);
  await writeFile(path, await doc.save());
  return path;
}

test("PDF to Image uses the redesigned template", async ({ page }, testInfo) => {
  test.slow();
  const pdf = await pdfFile(testInfo, "doc.pdf", 2);
  await expectRedesigned(page, "/convert/pdf/", async () => {
    await expect(page.getByText("Loading the converter…")).toHaveCount(0, { timeout: 30_000 });
    const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.getByText("Select PDF Files", { exact: true }).click()]);
    await chooser.setFiles(pdf);
    await page.getByRole("button", { name: "Convert to Images" }).click();
    await expect(page.getByText("Converted Pages (2)")).toBeVisible();
  });
});

test("Image Editor uses the redesigned template", async ({ page }, testInfo) => {
  const [png] = await pngFiles(page, testInfo, 1);
  await expectRedesigned(page, "/edit/image/", async () => {
    await page.getByLabel("Choose a JPG, PNG, or WebP image").setInputFiles(png);
    await expect(page.getByText("Output: 64 × 48px")).toBeVisible();
  });
});
