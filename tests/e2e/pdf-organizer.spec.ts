import { expect, test, type Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";
import { PDFDocument, StandardFonts } from "pdf-lib";

// Each fixture page gets a distinct width, so the order of pages in an output
// file can be checked from page sizes alone.
const WIDTHS_A = [500, 510, 520];
const WIDTHS_B = [600, 610];

async function rejectOptionalCookies(page: Page) {
  const reject = page.getByRole("button", { name: "Reject", exact: true });
  if (await reject.isVisible()) await reject.click();
}

async function writeFixture(path: string, widths: number[], label: string) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  widths.forEach((width, index) => {
    const page = doc.addPage([width, 700]);
    page.drawText(`${label} page ${index + 1}`, { x: 40, y: 640, size: 18, font });
  });
  await writeFile(path, await doc.save());
}

async function writeEncryptedFixture(path: string) {
  const doc = await PDFDocument.create();
  doc.addPage([300, 300]);
  doc.context.trailerInfo.Encrypt = doc.context.register(doc.context.obj({ Filter: "Standard", V: 1, R: 2, P: -4 }));
  await writeFile(path, await doc.save({ useObjectStreams: false }));
}

async function pageWidths(bytes: Uint8Array | Buffer) {
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map(page => Math.round(page.getWidth()));
}

async function download(page: Page) {
  const [file] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Download" }).click()]);
  return { name: file.suggestedFilename(), bytes: await readFile(await file.path()) };
}

test("merges PDFs in the chosen order", async ({ page }, testInfo) => {
  const a = testInfo.outputPath("a.pdf");
  const b = testInfo.outputPath("b.pdf");
  await writeFixture(a, WIDTHS_A, "A");
  await writeFixture(b, WIDTHS_B, "B");

  await page.goto("/edit/pdf/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose PDF files to merge").setInputFiles([a, b]);
  await expect(page.getByText("2 files · 5 pages")).toBeVisible();

  await page.getByRole("button", { name: "Move b.pdf up" }).click();
  await page.getByRole("button", { name: "Merge 2 PDFs" }).click();
  await expect(page.getByText("5 pages from 2 files")).toBeVisible();

  const result = await download(page);
  expect(result.name).toBe("merged.pdf");
  expect(await pageWidths(result.bytes)).toEqual([...WIDTHS_B, ...WIDTHS_A]);
});

test("extracts a page range in the typed order", async ({ page }, testInfo) => {
  const a = testInfo.outputPath("report.pdf");
  await writeFixture(a, WIDTHS_A, "A");

  await page.goto("/edit/pdf/");
  await rejectOptionalCookies(page);
  await page.getByRole("tab", { name: "Split a PDF" }).click();
  await page.getByLabel("Choose a PDF to split").setInputFiles(a);
  await expect(page.getByText("3 pages ·")).toBeVisible();

  await page.getByLabel("Pages (1–3)").fill("3, 1");
  await page.getByRole("button", { name: "Extract pages" }).click();
  const result = await download(page);
  expect(result.name).toBe("report-pages-3_1.pdf");
  expect(await pageWidths(result.bytes)).toEqual([WIDTHS_A[2], WIDTHS_A[0]]);

  await page.getByLabel("Pages (1–3)").fill("2-9");
  await page.getByRole("button", { name: "Extract pages" }).click();
  await expect(page.getByText("page 9 does not exist")).toBeVisible();
  // 실패한 실행 뒤에 이전 결과의 다운로드 버튼이 남아 있으면 안 된다.
  await expect(page.getByRole("link", { name: "Download" })).toHaveCount(0);
});

test("splits every page into a ZIP of single-page PDFs", async ({ page }, testInfo) => {
  const a = testInfo.outputPath("report.pdf");
  await writeFixture(a, WIDTHS_A, "A");

  await page.goto("/edit/pdf/");
  await rejectOptionalCookies(page);
  await page.getByRole("tab", { name: "Split a PDF" }).click();
  await page.getByLabel("Choose a PDF to split").setInputFiles(a);
  await page.getByLabel(/Every page as its own PDF/).check();
  await page.getByRole("button", { name: "Split into 3 files" }).click();

  const result = await download(page);
  expect(result.name).toBe("report-pages.zip");
  const zip = await JSZip.loadAsync(result.bytes);
  const names = Object.keys(zip.files).sort();
  expect(names).toEqual(["report-page-1.pdf", "report-page-2.pdf", "report-page-3.pdf"]);
  for (const [index, name] of names.entries()) {
    expect(await pageWidths(await zip.files[name].async("uint8array"))).toEqual([WIDTHS_A[index]]);
  }
});

test("rejects encrypted and non-PDF files with a clear message", async ({ page }, testInfo) => {
  const good = testInfo.outputPath("good.pdf");
  const locked = testInfo.outputPath("locked.pdf");
  const fake = testInfo.outputPath("fake.pdf");
  await writeFixture(good, WIDTHS_A, "A");
  await writeEncryptedFixture(locked);
  await writeFile(fake, "this is plain text, not a PDF");

  await page.goto("/edit/pdf/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose PDF files to merge").setInputFiles([good, locked, fake]);

  await expect(page.getByText("This PDF is password-protected or encrypted")).toBeVisible();
  await expect(page.getByText("could not be read as a PDF")).toBeVisible();
  await expect(page.getByText("Add at least two readable PDFs.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Merge PDFs" })).toBeDisabled();
});

// Redesign (spec 7.3): Radix tabs with arrow-key movement, and the primary action in the side panel.

test("mode tabs move with the arrow keys", async ({ page }) => {
  await page.goto("/edit/pdf/");
  await rejectOptionalCookies(page);
  await page.getByRole("tab", { name: "Merge PDFs" }).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name: "Split a PDF" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("Choose a PDF to split")).toHaveCount(1);
});

test("every tab points at a panel that exists", async ({ page }) => {
  await page.goto("/edit/pdf/");
  const selected = page.getByRole("tab", { selected: true });
  const controls = await selected.getAttribute("aria-controls");
  expect(controls).toBeTruthy();
  await expect(page.locator(`[id="${controls}"]`)).toHaveCount(1);
});

test("the primary action lives in the side panel", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const a = testInfo.outputPath("a.pdf");
  const b = testInfo.outputPath("b.pdf");
  await writeFixture(a, WIDTHS_A, "A");
  await writeFixture(b, WIDTHS_B, "B");
  await page.goto("/edit/pdf/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose PDF files to merge").setInputFiles([a, b]);
  await expect(page.locator("[data-tool-panel]").getByRole("button", { name: "Merge 2 PDFs" })).toBeVisible();
});

// Phase 3 review: arrow keys only move focus between the tabs; Enter switches, so exploring with
// the keyboard never throws away a result the visitor has not downloaded yet.
test("arrow keys on the mode tabs keep the merged result", async ({ page }, testInfo) => {
  const a = testInfo.outputPath("a.pdf");
  const b = testInfo.outputPath("b.pdf");
  await writeFixture(a, WIDTHS_A, "A");
  await writeFixture(b, WIDTHS_B, "B");
  await page.goto("/edit/pdf/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose PDF files to merge").setInputFiles([a, b]);
  await page.getByRole("button", { name: "Merge 2 PDFs" }).click();
  await expect(page.getByRole("link", { name: "Download" })).toBeVisible();
  await page.getByRole("tab", { name: "Merge PDFs" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Split a PDF" })).toBeFocused();
  await expect(page.getByRole("tab", { name: "Merge PDFs" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("link", { name: "Download" })).toBeVisible();
});

test("focus moves to the work area once PDFs are added", async ({ page }, testInfo) => {
  const a = testInfo.outputPath("a.pdf");
  await writeFixture(a, WIDTHS_A, "A");
  await page.goto("/edit/pdf/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose PDF files to merge").setInputFiles([a]);
  await expect(page.getByText("1 file · 3 pages")).toBeVisible();
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest("[data-tool-main]"))).toBe(true);
});
