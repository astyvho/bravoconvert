import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function rejectOptionalCookies(page: Page) {
  const reject = page.getByRole("button", { name: "Reject", exact: true });
  if (await reject.isVisible()) await reject.click();
}

async function createFixture(page: Page, path: string, width: number, height: number) {
  await page.setContent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="transparent"/><rect width="70%" height="100%" fill="#e11d48"/><circle cx="${Math.round(width * 0.8)}" cy="${Math.round(height * 0.25)}" r="${Math.max(8, Math.round(Math.min(width, height) * 0.15))}" fill="#2563eb"/></svg>`);
  await page.locator("svg").screenshot({ path, omitBackground: true });
}

async function imageInfo(page: Page, path: string, mime: string) {
  const bytes = await readFile(path);
  return page.evaluate(async ({ source, type }) => {
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Downloaded image could not be decoded"));
    });
    image.src = `data:${type};base64,${source}`;
    await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.drawImage(image, 0, 0);
    return { width: image.naturalWidth, height: image.naturalHeight, corner: Array.from(context.getImageData(image.naturalWidth - 1, image.naturalHeight - 1, 1, 1).data) };
  }, { source: bytes.toString("base64"), type: mime });
}

test("editor supports resizing, rotation, flips, history, replacement, and all exports", async ({ page }, testInfo) => {
  const source = testInfo.outputPath("source.png");
  const replacement = testInfo.outputPath("replacement.png");
  await createFixture(page, source, 400, 300);
  await createFixture(page, replacement, 240, 360);

  await page.goto("/edit/image/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP image").setInputFiles(source);
  await expect(page.getByText("Output: 400 × 300px")).toBeVisible();

  await page.getByLabel("Width (px)").fill("200");
  await expect(page.getByLabel("Height (px)")).toHaveValue("150");
  await page.getByRole("button", { name: "Right 90°" }).click();
  await expect(page.getByText("Output: 150 × 200px")).toBeVisible();
  await page.getByRole("button", { name: "Right 90°" }).click();
  await expect(page.getByText("Output: 200 × 150px")).toBeVisible();
  await page.getByRole("button", { name: "Right 90°" }).click();
  await expect(page.getByText("Output: 150 × 200px")).toBeVisible();

  const beforeFlip = await page.getByLabel("Edited image preview").screenshot();
  await page.getByRole("button", { name: "Flip horizontally" }).click();
  await page.mouse.move(0, 0);
  const afterHorizontal = await page.getByLabel("Edited image preview").screenshot();
  expect(afterHorizontal.equals(beforeFlip)).toBeFalsy();
  await page.getByRole("button", { name: "Flip vertically" }).click();
  const afterVertical = await page.getByLabel("Edited image preview").screenshot();
  expect(afterVertical.equals(afterHorizontal)).toBeFalsy();

  await page.getByRole("button", { name: "Undo" }).click();
  expect((await page.getByLabel("Edited image preview").screenshot()).equals(afterHorizontal)).toBeTruthy();
  await page.getByRole("button", { name: "Redo" }).click();
  expect((await page.getByLabel("Edited image preview").screenshot()).equals(afterVertical)).toBeTruthy();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByText("Output: 400 × 300px")).toBeVisible();

  await page.getByLabel("Replace image").setInputFiles(replacement);
  await expect(page.getByText("Output: 240 × 360px")).toBeVisible();
  await page.getByLabel("Width (px)").fill("120");
  await expect(page.getByText("Output: 120 × 180px")).toBeVisible();

  for (const format of ["PNG", "WebP"] as const) {
    await page.getByLabel("Format").selectOption({ label: format });
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export image" }).click();
    const download = await downloadPromise;
    const extension = format === "PNG" ? ".png" : ".webp";
    expect(download.suggestedFilename().endsWith(extension)).toBeTruthy();
    const target = testInfo.outputPath(`result${extension}`);
    await download.saveAs(target);
    const info = await imageInfo(page, target, format === "PNG" ? "image/png" : "image/webp");
    expect(info.width).toBe(120);
    expect(info.height).toBe(180);
  }

  await page.getByLabel("Format").selectOption({ label: "JPG" });
  await page.getByLabel("JPEG background color value").fill("#22C55E");
  const jpgDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export image" }).click();
  const jpgDownload = await jpgDownloadPromise;
  expect(jpgDownload.suggestedFilename().endsWith(".jpg")).toBeTruthy();
  const jpgTarget = testInfo.outputPath("result.jpg");
  await jpgDownload.saveAs(jpgTarget);
  const jpgInfo = await imageInfo(page, jpgTarget, "image/jpeg");
  expect(jpgInfo.width).toBe(120);
  expect(jpgInfo.height).toBe(180);
  expect(jpgInfo.corner[1]).toBeGreaterThan(jpgInfo.corner[0]);
  expect(jpgInfo.corner[1]).toBeGreaterThan(jpgInfo.corner[2]);
});

test("all tools and consent layout render at desktop and iPhone widths", async ({ page }) => {
  test.slow(); // ten page loads on a dev server that compiles each route on first visit
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/edit/image/");
    await expect(page.getByRole("heading", { name: "Edit an image in your browser" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reject", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Reject", exact: true }).click();
    await page.goto("/convert/img/");
    await expect(page.getByRole("heading", { name: "Image Converter", exact: true })).toBeVisible();
    await page.goto("/convert/pdf/");
    await expect(page.getByRole("heading", { name: "PDF to Image Converter" })).toBeVisible();
    await page.goto("/edit/pdf/");
    await expect(page.getByRole("heading", { name: "Merge and split PDF files" })).toBeVisible();
    await page.goto("/view/exif/");
    await expect(page.getByRole("heading", { name: "EXIF viewer" })).toBeVisible();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Check what a photo reveals before you share it" })).toBeVisible();
    await page.locator("summary", { hasText: "Tested, not assumed" }).click();
    await expect(page.getByText("None of the fields survived.")).toBeVisible();
    await page.goto("/guides/pdf-metadata-privacy/");
    await expect(page.getByRole("heading", { name: "The comment survived every time" })).toBeVisible();
    await expect(page.getByRole("link", { name: /pdf-metadata-sample\.pdf/ })).toHaveAttribute("href", "/guides/pdf-metadata-sample.pdf");
    await page.evaluate(() => localStorage.removeItem("bravoconvert-consent-v1"));
  }
});

// Redesign (spec 7.3): icon buttons with tooltips above the preview, three panel groups split by
// separators, and flip buttons that keep the rotate buttons' look (AGENTS.md).

async function openEditor(page: Page, testInfo: { outputPath: (name: string) => string }) {
  const source = testInfo.outputPath("source.png");
  await createFixture(page, source, 400, 300);
  await page.goto("/edit/image/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP image").setInputFiles(source);
  await expect(page.getByText("Output: 400 × 300px")).toBeVisible();
}

test("history and replace are icon buttons with tooltips above the preview", async ({ page }, testInfo) => {
  await openEditor(page, testInfo);
  const undo = page.getByRole("button", { name: "Undo" });
  expect((await undo.boundingBox())!.y).toBeLessThan((await page.getByLabel("Edited image preview").boundingBox())!.y);
  // Undo is disabled until there is history, and disabled buttons get no hover, so check Reset.
  await page.getByRole("button", { name: "Reset", exact: true }).hover();
  await expect(page.getByRole("tooltip", { name: "Reset" })).toBeVisible();
  await expect(page.getByLabel("Replace image")).toHaveCount(1);
  // the file input itself also has role button in Chromium, so count real <button>s
  await expect(page.locator("button", { hasText: "Replace image" })).toHaveCount(1);
});

test("flip buttons look like the rotate buttons after toggling", async ({ page }, testInfo) => {
  await openEditor(page, testInfo);
  await page.getByRole("button", { name: "Flip horizontally" }).click();
  await page.mouse.move(0, 0);
  const look = (name: string) => page.getByRole("button", { name }).evaluate(el => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color, getComputedStyle(el).borderRadius]);
  await expect.poll(async () => JSON.stringify(await look("Flip horizontally"))).toBe(JSON.stringify(await look("Right 90°")));
});

test("the panel groups are separated", async ({ page }, testInfo) => {
  await openEditor(page, testInfo);
  const panel = page.locator("[data-tool-panel]");
  await expect(panel.getByRole("heading", { level: 2 })).toHaveText(["Resize", "Rotate & flip", "Export"]);
  expect(await panel.getByRole("separator").count()).toBeGreaterThanOrEqual(2);
});

// Phase 3 review: "Choose image" unmounts once an image loads; focus must land on the preview card.
test("focus moves to the preview once an image is loaded", async ({ page }, testInfo) => {
  await openEditor(page, testInfo);
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest("[data-tool-main]"))).toBe(true);
});
