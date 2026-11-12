import { expect, test, type Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";
import { PDFDocument, StandardFonts } from "pdf-lib";

async function rejectOptionalCookies(page: Page) {
  const reject = page.getByRole("button", { name: "Reject", exact: true });
  if (await reject.isVisible()) await reject.click();
}

async function writeTwoPagePdf(path: string) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const [index, width] of [500, 600].entries()) {
    const page = doc.addPage([width, 700]);
    page.drawText(`Page ${index + 1}`, { x: 40, y: 640, size: 18, font });
  }
  await writeFile(path, await doc.save());
}

async function openPdf(page: Page, path: string) {
  await page.goto("/convert/pdf/");
  await rejectOptionalCookies(page);
  await expect(page.getByText("Loading the converter…")).toHaveCount(0, { timeout: 30_000 });
  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.getByText("Select PDF Files", { exact: true }).click()]);
  await chooser.setFiles(path);
}

test("renders each page of a PDF and downloads them all", async ({ page }, testInfo) => {
  test.slow();
  const pdf = testInfo.outputPath("two-pages.pdf");
  await writeTwoPagePdf(pdf);
  await openPdf(page, pdf);
  await page.getByRole("button", { name: "Convert to Images" }).click();
  await expect(page.getByText("Converted Pages (2)")).toBeVisible();

  const [all] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download All" }).click()]);
  const zip = await JSZip.loadAsync(await readFile(await all.path()));
  const names = Object.keys(zip.files);
  expect(names).toHaveLength(2);
  expect(names.every(name => name.endsWith(".png"))).toBe(true);

  const [one] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download", exact: true }).first().click()]);
  expect(one.suggestedFilename()).toBe("two-pages_page_1.png");
});

// Redesign (spec 7.3): PNG/JPG is a two-option radio group in the side panel.

test("output format is a two-option radio group", async ({ page }, testInfo) => {
  test.slow();
  const pdf = testInfo.outputPath("two-pages.pdf");
  await writeTwoPagePdf(pdf);
  await openPdf(page, pdf);
  const group = page.getByRole("radiogroup", { name: "Output format" });
  await expect(group.getByRole("radio", { name: "PNG" })).toHaveAttribute("aria-checked", "true");
  await group.getByRole("radio", { name: "JPG" }).click();
  await expect(group.getByRole("radio", { name: "JPG" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Convert to Images" }).click();
  await expect(page.getByText("Converted Pages (2)")).toBeVisible();
  const [one] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download", exact: true }).first().click()]);
  expect(one.suggestedFilename()).toBe("two-pages_page_1.jpg");
});

test("the heading is in the static HTML before the engine loads", async ({ page }) => {
  const html = await (await page.request.get("/convert/pdf/")).text();
  expect(html).toContain("PDF to Image Converter");
  expect(html).toMatch(/<h1[^>]*>[^<]*PDF to Image Converter/);
});
