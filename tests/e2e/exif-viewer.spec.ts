import { expect, test, type Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";
import path from "node:path";

const SAMPLE = path.join(__dirname, "..", "..", "public", "guides", "exif-sample-with-metadata.jpg");

async function rejectOptionalCookies(page: Page) {
  const reject = page.getByRole("button", { name: "Reject", exact: true });
  if (await reject.isVisible()) await reject.click();
}

function check(page: Page, id: string) {
  return page.locator(`[data-check="${id}"]`);
}

/** The TIFF payload of the sample JPEG's APP1 segment, reused to tag other formats. */
async function sampleTiff() {
  const jpg = await readFile(SAMPLE);
  let offset = 2;
  while (offset < jpg.length) {
    const length = jpg.readUInt16BE(offset + 2);
    if (jpg[offset + 1] === 0xe1) return jpg.subarray(offset + 10, offset + 2 + length);
    offset += 2 + length;
  }
  throw new Error("Sample has no APP1 segment");
}

function riffChunk(id: string, data: Buffer) {
  const header = Buffer.alloc(8);
  header.write(id, 0, "ascii");
  header.writeUInt32LE(data.length, 4);
  return Buffer.concat([header, data, Buffer.alloc(data.length % 2)]);
}

test("sample photo shows location, time, and device, and nothing else", async ({ page }) => {
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByRole("button", { name: "Try a sample photo" }).click();

  await expect(page.getByText("This photo carries 3 kinds of identifying information.")).toBeVisible();
  await expect(check(page, "location")).toContainText("51.50806, -0.12806");
  await expect(check(page, "time")).toContainText("2026-05-17 14:32:08");
  await expect(check(page, "device")).toContainText("BravoCam BC-900 Demo");
  // Items that are not in the photo are grouped on one "Not found" line instead of a row each.
  for (const id of ["serial", "person", "software"]) await expect(page.locator(`[data-none] [data-check="${id}"]`)).toBeVisible();
  await expect(page.locator("[data-none]")).toContainText("Not found");

  const map = page.getByRole("link", { name: "Show on OpenStreetMap" });
  await expect(map).toHaveAttribute("href", /mlat=51\.50806&mlon=-0\.12806/);
  await expect(page.getByText("Rotate 90 CW")).toBeVisible();
});

test("a photo without metadata is reported as clean", async ({ page }, testInfo) => {
  const plain = testInfo.outputPath("plain.png");
  await page.setContent(`<div style="width:120px;height:80px;background:#2563eb"></div>`);
  await page.locator("div").screenshot({ path: plain });

  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles(plain);
  await expect(page.getByText("No identifying metadata found in this file.")).toBeVisible();
  await expect(page.getByText("120 × 80px")).toBeVisible();
});

test("reads EXIF from a WebP file", async ({ page }, testInfo) => {
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);

  // A real, decodable WebP from the browser, rewrapped in the extended format with an EXIF chunk.
  const encoded = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 48;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#e11d48";
    context.fillRect(0, 0, 64, 48);
    return canvas.toDataURL("image/webp").split(",")[1];
  });
  // Chrome may already emit the extended format (VP8X + ICCP), so keep its chunks
  // and its VP8X flags, and only add the EXIF flag and chunk.
  const source = Buffer.from(encoded, "base64");
  const kept: Buffer[] = [];
  let flags = 0;
  for (let offset = 12; offset + 8 <= source.length;) {
    const id = source.toString("ascii", offset, offset + 4);
    const size = source.readUInt32LE(offset + 4);
    const end = offset + 8 + size + (size % 2);
    if (id === "VP8X") flags = source[offset + 8];
    else kept.push(source.subarray(offset, end));
    offset = end;
  }
  const vp8x = Buffer.alloc(10);
  vp8x[0] = flags | 0x08; // EXIF present
  vp8x.writeUIntLE(64 - 1, 4, 3);
  vp8x.writeUIntLE(48 - 1, 7, 3);
  const body = Buffer.concat([Buffer.from("WEBP"), riffChunk("VP8X", vp8x), ...kept, riffChunk("EXIF", await sampleTiff())]);
  const header = Buffer.alloc(8);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(body.length, 4);
  const webp = testInfo.outputPath("tagged.webp");
  await writeFile(webp, Buffer.concat([header, body]));

  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles(webp);
  await expect(check(page, "device")).toContainText("BravoCam BC-900 Demo");
  await expect(check(page, "location")).toContainText("51.50806, -0.12806");
  await expect(page.getByText("64 × 48px")).toBeVisible();
});

test("unsupported formats are rejected", async ({ page }, testInfo) => {
  const gif = testInfo.outputPath("animation.gif");
  await writeFile(gif, Buffer.from("R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=", "base64"));

  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles(gif);
  await expect(page.getByText("Choose a JPG, PNG, or WebP image.")).toBeVisible();
});

test("the clean copy button downloads a photo with no metadata, turned the right way up", async ({ page }, testInfo) => {
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  await expect(page.getByText("This photo carries 3 kinds of identifying information.")).toBeVisible();

  await page.getByRole("button", { name: "Remove it now" }).click();
  const picker = page.getByRole("group", { name: "Save the clean copy as" });
  await expect(picker.getByRole("button")).toHaveCount(3);
  await expect(picker.getByRole("button").first()).toContainText("same as the original");
  const downloadPromise = page.waitForEvent("download");
  await picker.getByRole("button", { name: /Clean copy as JPG/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sample-photo-with-gps-clean.jpg");
  await expect(page.getByText("The clean copy was checked again: no identifying information found.")).toBeVisible();
  await expect(check(page, "location")).toContainText("Removed in copy");

  // 받은 파일을 뷰어로 다시 열어 독립적으로 확인한다. 샘플은 640×480 에 90° 회전 플래그가 있으므로 결과는 480×640 이어야 한다.
  const saved = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(saved);
  await page.getByRole("button", { name: "Check another" }).click();
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles(saved);
  await expect(page.getByText("No identifying metadata found in this file.")).toBeVisible();
  await expect(page.getByText("480 × 640px")).toBeVisible();
  await expect(page.getByText("Rotate 90 CW")).toHaveCount(0);
});

test("the clean copy can be saved in another format", async ({ page }, testInfo) => {
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  await page.getByRole("button", { name: "Remove it now" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Clean copy as WebP/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sample-photo-with-gps-clean.webp");
  await expect(page.getByText("The clean copy was checked again: no identifying information found.")).toBeVisible();

  const saved = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(saved);
  await page.getByRole("button", { name: "Check another" }).click();
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles(saved);
  await expect(page.getByText("No identifying metadata found in this file.")).toBeVisible();
  await expect(page.getByText("480 × 640px")).toBeVisible();
});

test("several photos can be checked and cleaned at once into one ZIP", async ({ page }, testInfo) => {
  const jpg = await readFile(SAMPLE);
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles([
    { name: "kitchen.jpg", mimeType: "image/jpeg", buffer: jpg },
    { name: "garden.jpg", mimeType: "image/jpeg", buffer: jpg },
  ]);
  await expect(page.getByText("2 photos · 2 carry identifying information")).toBeVisible();

  await page.getByRole("button", { name: "Remove from all" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("group", { name: "Save the clean copy as" }).getByRole("button", { name: /Clean copy as JPG/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("clean-photos.zip");
  await expect(page.getByText("All 2 clean copies were checked again: no identifying information found.")).toBeVisible();
  await expect(page.locator("[data-batch] li").getByText("Cleaned")).toHaveCount(2);

  const saved = testInfo.outputPath("clean-photos.zip");
  await download.saveAs(saved);
  const zip = await JSZip.loadAsync(await readFile(saved));
  expect(Object.keys(zip.files).sort()).toEqual(["garden-clean.jpg", "kitchen-clean.jpg"]);
});

test("the shrink option brings the long side down to 2048 px", async ({ page }) => {
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  // 3000×1500 JPEG 을 브라우저에서 만들고, 샘플의 EXIF 를 붙이지 않아도 되도록 재인코딩 경로만 확인한다.
  const big = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 3000;
    canvas.height = 1500;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#3a7";
    context.fillRect(0, 0, 3000, 1500);
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), "image/jpeg", 0.9));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  const tagged = Buffer.from(big);
  // APP1(EXIF) 를 SOI 바로 뒤에 넣어 "정보 발견" 상태로 만든다.
  const tiff = await sampleTiff();
  const app1Body = Buffer.concat([Buffer.from("Exif\0\0", "binary"), tiff]);
  const app1 = Buffer.alloc(4);
  app1.writeUInt16BE(0xffe1, 0);
  app1.writeUInt16BE(app1Body.length + 2, 2);
  const withExif = Buffer.concat([tagged.subarray(0, 2), app1, app1Body, tagged.subarray(2)]);

  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles({ name: "wide.jpg", mimeType: "image/jpeg", buffer: withExif });
  await page.getByRole("button", { name: "Remove it now" }).click();
  await page.getByLabel("Shrink the long side to 2048 px (smaller file)").check();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Clean copy as JPG/ }).click();
  const download = await downloadPromise;
  const bytes = await readFile(await download.path());
  // SOF0 에서 크기를 읽는다.
  let offset = 2;
  let size: [number, number] | null = null;
  while (offset < bytes.length) {
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc2) { size = [bytes.readUInt16BE(offset + 7), bytes.readUInt16BE(offset + 5)]; break; }
    offset += 2 + length;
  }
  // The sample EXIF carries a 90° rotation, so the 3000×1500 picture comes out upright as 1024×2048.
  expect(size).toEqual([1024, 2048]);
});

test("the home page and the converter take the photo without choosing it again", async ({ page }) => {
  await page.goto("/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose photos to check").setInputFiles(SAMPLE);
  // The dev server may compile the viewer on first visit, which can take longer than 5 s under load.
  await expect(page).toHaveURL(/\/view\/exif\/$/, { timeout: 20_000 });
  await expect(page.getByText("This photo carries 3 kinds of identifying information.")).toBeVisible();

  await page.locator("[data-clean]").getByRole("link", { name: "Image Converter" }).click();
  await expect(page).toHaveURL(/\/convert\/img\/\?from=exif&handoff=1$/, { timeout: 20_000 });
  await expect(page.locator("[data-metadata-notice]")).toContainText("The photos you were checking are already added below.");
  await expect(page.getByText("exif-sample-with-metadata.jpg").first()).toBeVisible();
});

test("a photo chosen on the home page before the scripts finish loading is still checked", async ({ page }) => {
  let release!: () => void;
  const scriptsHeld = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/_next\/static\/chunks\/app\//, async route => { await scriptsHeld; await route.continue(); });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Choose photos to check").setInputFiles(SAMPLE);
  release();
  await expect(page).toHaveURL(/\/view\/exif\/\?handoff=1$|\/view\/exif\/$/, { timeout: 20_000 });
  await expect(page.getByText("This photo carries 3 kinds of identifying information.")).toBeVisible();
});

test("if the ZIP library cannot load, the clean copies still download one by one", async ({ page }) => {
  const jpg = await readFile(SAMPLE);
  await page.route(/jszip/i, route => route.abort());
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles([
    { name: "kitchen.jpg", mimeType: "image/jpeg", buffer: jpg },
    { name: "garden.jpg", mimeType: "image/jpeg", buffer: jpg },
  ]);
  await page.getByRole("button", { name: "Remove from all" }).click();
  const names: string[] = [];
  page.on("download", download => names.push(download.suggestedFilename()));
  await page.getByRole("group", { name: "Save the clean copy as" }).getByRole("button", { name: /Clean copy as JPG/ }).click();
  await expect(page.getByText("so the 2 files were downloaded one by one")).toBeVisible();
  await expect(page.locator("main [role=alert]")).toHaveCount(0);
  await expect.poll(() => names.sort()).toEqual(["garden-clean.jpg", "kitchen-clean.jpg"]);
});

test("with many photos on a phone the report sits above the list and nothing overflows", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  const files: string[] = [];
  for (let i = 0; i < 30; i++) {
    const file = testInfo.outputPath(`p${i}.png`);
    await page.setContent(`<div style="width:64px;height:48px;background:hsl(${i * 12} 70% 50%)"></div>`);
    await page.locator("div").screenshot({ path: file });
    files.push(file);
  }
  await page.goto("/view/exif/");
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles(files);
  await expect(page.getByText("30 photos · 0 carry identifying information")).toBeVisible();
  const list = page.getByRole("list", { name: "Photos you added" });
  await expect(list.getByRole("listitem")).toHaveCount(30);
  const report = page.getByTestId("exif-report");
  expect((await report.boundingBox())!.y).toBeLessThan((await list.boundingBox())!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("on a phone the action bar never sits under the consent banner", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/view/exif/");
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  await expect(page.getByText("This photo carries 3 kinds of identifying information.")).toBeVisible();
  const bar = page.locator("[data-action-bar]");
  await expect(bar).toHaveAttribute("data-fixed", "false");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(bar).toHaveAttribute("data-fixed", "true");
  await expect(page.getByRole("button", { name: "Remove it now" })).toBeInViewport();
});

test("reduced motion disables the result animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  const report = page.getByTestId("exif-report");
  await expect(report).toBeVisible();
  await expect(report).toHaveAttribute("data-motion", "off");
  expect(await report.evaluate(el => el.getAttribute("style") ?? "")).not.toMatch(/opacity|transform/);
});

test("an in-app browser gets the press-and-hold preview after cleaning", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: "Mozilla/5.0 (iPhone) KAKAOTALK 10.0", viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto("/view/exif/");
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  await page.getByRole("button", { name: "Remove it now" }).click();
  await page.getByRole("group", { name: "Save the clean copy as" }).getByRole("button", { name: /Clean copy as JPG/ }).click();
  await expect(page.getByText("Press and hold an image below to save it.")).toBeVisible();
  await context.close();
});

// Final-review findings. Each test failed before its fix.

async function pngFiles(page: Page, testInfo: { outputPath: (name: string) => string }, count: number) {
  const files: string[] = [];
  for (let i = 0; i < count; i++) {
    const file = testInfo.outputPath(`r${i}.png`);
    await page.setContent(`<div style="width:64px;height:48px;background:hsl(${i * 17} 70% 50%)"></div>`);
    await page.locator("div").screenshot({ path: file });
    files.push(file);
  }
  return files;
}

test("on a phone, tapping a photo far down the list brings its report into view", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const files = await pngFiles(page, testInfo, 20);
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles([SAMPLE, ...files]);
  await expect(page.getByText("21 photos · 1 carry identifying information")).toBeVisible();
  await page.getByRole("list", { name: "Photos you added" }).getByRole("listitem").nth(18).getByRole("button").click();
  await expect(page.getByTestId("exif-report")).toBeInViewport();
});

test("on a phone the opened format picker is not hidden under the pinned action bar", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  await page.getByRole("button", { name: "Remove it now" }).click();
  const bar = page.locator("[data-action-bar]");
  await expect(bar).toHaveAttribute("data-fixed", "true");
  const shrink = page.getByLabel("Shrink the long side to 2048 px (smaller file)");
  await expect.poll(async () => (await shrink.boundingBox())!.y + (await shrink.boundingBox())!.height <= (await bar.boundingBox())!.y).toBe(true);
});

test("on a short desktop screen the sticky report panel still fits on screen", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  const files = await pngFiles(page, testInfo, 29);
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles([SAMPLE, ...files]);
  await expect(page.getByText("30 photos · 1 carry identifying information")).toBeVisible();
  await page.getByRole("button", { name: "Remove it now" }).click();
  await page.waitForTimeout(600);
  // Part-way down the 30-row list, where the panel is stuck under the header.
  await page.evaluate(() => window.scrollTo(0, 400));
  const panel = page.getByTestId("exif-report").locator("xpath=..");
  await expect.poll(async () => {
    const box = (await panel.boundingBox())!;
    return box.y >= 0 && box.y + box.height <= 600;
  }).toBe(true);
  const shrink = page.getByLabel("Shrink the long side to 2048 px (smaller file)");
  await shrink.scrollIntoViewIfNeeded();
  await expect(shrink).toBeInViewport();
});

test("the report comes before the photo list in reading and focus order", async ({ page }, testInfo) => {
  const files = await pngFiles(page, testInfo, 2);
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles([SAMPLE, ...files]);
  await expect(page.getByText("3 photos · 1 carry identifying information")).toBeVisible();
  const reportFirst = await page.evaluate(() => {
    const report = document.querySelector('[data-testid="exif-report"]')!;
    const list = document.querySelector('ul[aria-label="Photos you added"]')!;
    return Boolean(report.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(reportFirst).toBe(true);
});

test("the viewer still works where media queries have no addEventListener (Safari 13)", async ({ page }) => {
  await page.addInitScript(() => {
    // Safari before 14 only has the older addListener/removeListener. The methods are inherited
    // from EventTarget, so they are shadowed with undefined rather than deleted.
    Object.defineProperty(MediaQueryList.prototype, "addEventListener", { value: undefined, configurable: true });
    Object.defineProperty(MediaQueryList.prototype, "removeEventListener", { value: undefined, configurable: true });
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  await expect(page.getByText("This photo carries 3 kinds of identifying information.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove it now" })).toBeVisible();
});

test("custom radius and shadow tokens win over component defaults", async ({ page }) => {
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByRole("button", { name: "Try a sample photo" }).click();
  await page.getByRole("button", { name: "Remove it now" }).click();
  const choice = page.getByRole("group", { name: "Save the clean copy as" }).getByRole("button").first();
  expect(await choice.evaluate(el => getComputedStyle(el).borderTopLeftRadius)).toBe("16px");
  // shadow-none computes to transparent layers, shadow-soft to a visible one.
  expect(await page.locator("[data-clean]").evaluate(el => getComputedStyle(el).boxShadow)).toMatch(/^(none|(rgba\(0, 0, 0, 0\) 0px 0px 0px 0px(, )?)+)$/);
  // Badges combine text-caption with a status colour; both must survive the class merge.
  const badge = page.locator('[data-check="location"]').getByText("Found", { exact: true });
  expect(await badge.evaluate(el => getComputedStyle(el).fontSize)).toBe("12px");
});
