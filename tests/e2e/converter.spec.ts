import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import JSZip from "jszip";

async function rejectOptionalCookies(page: Page) {
  const reject = page.getByRole("button", { name: "Reject", exact: true });
  if (await reject.isVisible()) await reject.click();
}

async function pngFiles(page: Page, testInfo: { outputPath: (name: string) => string }, count: number) {
  const files: string[] = [];
  for (let i = 0; i < count; i++) {
    const file = testInfo.outputPath(`photo-${i + 1}.png`);
    await page.setContent(`<div style="width:64px;height:48px;background:hsl(${i * 40} 70% 50%)"></div>`);
    await page.locator("div").screenshot({ path: file });
    files.push(file);
  }
  return files;
}

const addImages = (page: Page, files: string[]) => page.locator('input[type="file"]').first().setInputFiles(files);

test("converts two PNGs to WebP and downloads them together", async ({ page }, testInfo) => {
  const files = await pngFiles(page, testInfo, 2);
  await page.goto("/convert/img/");
  await rejectOptionalCookies(page);
  await addImages(page, files);
  await expect(page.getByText("photo-1.png").first()).toBeVisible();
  await expect(page.getByText("photo-2.png").first()).toBeVisible();
  await page.getByRole("button", { name: "Convert All" }).click();
  const downloadAll = page.getByRole("button", { name: "Download All" });
  await expect(downloadAll).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent("download"), downloadAll.click()]);
  expect(download.suggestedFilename()).toBe("BravoConvert.zip");
  const zip = await JSZip.loadAsync(await readFile(await download.path()));
  const names = Object.keys(zip.files);
  expect(names).toHaveLength(2);
  expect(names.every(name => name.endsWith(".webp"))).toBe(true);
});

test("names the Select Images and Convert All buttons the Korean notice quotes", async ({ page }, testInfo) => {
  const files = await pngFiles(page, testInfo, 1);
  await page.goto("/convert/img/?from=exif&lang=ko");
  await rejectOptionalCookies(page);
  const notice = page.locator("[data-metadata-notice]");
  await expect(notice).toContainText("Select Images");
  await expect(notice).toContainText("Convert All");
  await expect(page.getByText("Select Images", { exact: true })).toBeVisible();
  await addImages(page, files);
  await expect(page.getByRole("button", { name: "Convert All" })).toBeVisible();
});
