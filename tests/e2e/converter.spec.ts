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

// Redesign (spec 7.3): format choice is a labelled Select, the notice sits in the tool header, and the
// primary action is pinned only when the consent banner is out of the way.

test("output format is a labelled select you can drive with the keyboard", async ({ page }, testInfo) => {
  const files = await pngFiles(page, testInfo, 2);
  await page.goto("/convert/img/");
  await rejectOptionalCookies(page);
  // Formats are chosen first: the reducer starts a new list when a format changes.
  const output = page.getByRole("combobox", { name: "Output format" });
  await output.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "WEBP" })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("option", { name: "PDF" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(output).toHaveText("PDF");
  await addImages(page, files);
  await expect(page.getByRole("button", { name: "Convert to PDF (2 images)" })).toBeVisible();
  await expect(page.getByText("Changing a format starts a new list.", { exact: false })).toBeVisible();
});

test("the metadata notice sits inside the tool header", async ({ page }) => {
  await page.goto("/convert/img/?from=exif");
  const notice = page.locator("header [data-metadata-notice]");
  await expect(notice).toBeVisible();
  const h1 = await page.getByRole("heading", { level: 1, name: "Image Converter" }).boundingBox();
  expect((await notice.boundingBox())!.y).toBeGreaterThan(h1!.y);
});

test("on a phone with the consent banner open the action bar is not pinned", async ({ page }, testInfo) => {
  const files = await pngFiles(page, testInfo, 1);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/convert/img/");
  await page.evaluate(() => localStorage.removeItem("bravoconvert-consent-v1"));
  await page.reload();
  await addImages(page, files);
  const bar = page.locator("[data-action-bar]");
  await expect(bar).toHaveAttribute("data-fixed", "false");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(bar).toHaveAttribute("data-fixed", "true");
});
