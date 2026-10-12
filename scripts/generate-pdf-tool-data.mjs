/**
 * Measures what the PDF merge and split tool actually does, by running the
 * site's own logic (src/lib/pdf-tools.ts) against PDFs that Chromium prints
 * from deterministic HTML.
 *
 * The page at /edit/pdf/ imports the JSON this writes, so every figure it
 * quotes — file sizes, whether bookmarks survive, whether text stays
 * selectable — comes from a real run rather than from assumption.
 *
 *   node --experimental-strip-types scripts/generate-pdf-tool-data.mjs
 *
 * Output:
 *   src/data/pdf-tool-benchmarks.json
 */

import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, PDFName } from "pdf-lib";
import { extractPages, mergePdfs, parsePageRanges, splitEveryPage } from "../src/lib/pdf-tools.ts";

const require = createRequire(import.meta.url);
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "src", "data");

// 각 문서의 첫 페이지에 넣는 표식 문장. 병합 결과에서 텍스트로 다시 찾아 래스터화되지 않았음을 확인한다.
const MARKER_A = "Quarterly maintenance report for the Riverside pumping station";
const MARKER_B = "Appendix of inspection photographs and meter readings";

const PARAGRAPH = "The inspection covered intake screens, the two primary pumps, the standby generator, and the control cabinet. Each item was checked against the previous visit, and any change in vibration, temperature, or noise was recorded with the time of observation. Readings outside the expected band were repeated after ten minutes to rule out start-up effects.";

function documentHtml(title, marker, pageCount) {
  const pages = Array.from({ length: pageCount }, (_, index) => `
    <section style="page-break-after: ${index === pageCount - 1 ? "auto" : "always"}">
      <h1>${index === 0 ? title : `${title} — section ${index + 1}`}</h1>
      ${index === 0 ? `<p><strong>${marker}.</strong></p>` : ""}
      <h2>Observations ${index + 1}.1</h2>
      <p>${PARAGRAPH}</p><p>${PARAGRAPH}</p>
      <h2>Observations ${index + 1}.2</h2>
      <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%">
        <tr><th>Item</th><th>Reading</th><th>Previous</th><th>Status</th></tr>
        ${Array.from({ length: 8 }, (_, row) => `<tr><td>Point ${row + 1}</td><td>${(41.2 + row * 1.7 + index).toFixed(1)}</td><td>${(40.8 + row * 1.6 + index).toFixed(1)}</td><td>${row % 3 === 0 ? "Review" : "Normal"}</td></tr>`).join("")}
      </table>
      <p>${PARAGRAPH}</p>
    </section>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.5; margin: 0; }
    h1 { font-family: Arial, sans-serif; font-size: 20pt; } h2 { font-family: Arial, sans-serif; font-size: 14pt; }
  </style></head><body>${pages}</body></html>`;
}

async function printPdf(browser, html) {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  const bytes = await page.pdf({ format: "A4", margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" }, outline: true, tagged: true });
  await page.close();
  return new Uint8Array(bytes);
}

async function hasOutline(bytes) {
  const doc = await PDFDocument.load(bytes);
  return doc.catalog.get(PDFName.of("Outlines")) !== undefined;
}

async function hasStructTree(bytes) {
  const doc = await PDFDocument.load(bytes);
  return doc.catalog.get(PDFName.of("StructTreeRoot")) !== undefined;
}

// 내용 변경 없이 pdf-lib 로 다시 저장만 한 크기. 병합 결과가 작아진 이유가 재압축인지, 빠진 구조 때문인지 가르는 기준선이다.
async function resavedBytes(bytes) {
  return (await (await PDFDocument.load(bytes)).save()).length;
}

async function pageText(bytes, pageNumber) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: false }).promise;
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();
  const text = content.items.map(item => item.str).join(" ").replace(/\s+/g, " ");
  await doc.destroy();
  return text;
}

async function main() {
  const browser = await chromium.launch();
  const browserVersion = browser.version();

  const docA = await printPdf(browser, documentHtml("Riverside Station Report", MARKER_A, 6));
  const docB = await printPdf(browser, documentHtml("Inspection Appendix", MARKER_B, 4));
  await browser.close();

  const pagesA = (await PDFDocument.load(docA)).getPageCount();
  const pagesB = (await PDFDocument.load(docB)).getPageCount();

  const merged = await mergePdfs([docA, docB]);
  const mergedPages = (await PDFDocument.load(merged)).getPageCount();
  const mergedFirstText = await pageText(merged, 1);
  const mergedSecondDocText = await pageText(merged, pagesA + 1);

  const singles = await splitEveryPage(docA);
  const singlesTotal = singles.reduce((sum, bytes) => sum + bytes.length, 0);

  const range = "1-3";
  const extracted = await extractPages(docA, parsePageRanges(range, pagesA));

  const result = {
    measuredOn: new Date().toISOString().slice(0, 10),
    browser: `Chromium ${browserVersion}`,
    library: `pdf-lib ${require("pdf-lib/package.json").version}`,
    sources: {
      a: { pages: pagesA, bytes: docA.length, resavedBytes: await resavedBytes(docA), hasOutline: await hasOutline(docA), hasStructTree: await hasStructTree(docA) },
      b: { pages: pagesB, bytes: docB.length, resavedBytes: await resavedBytes(docB), hasOutline: await hasOutline(docB), hasStructTree: await hasStructTree(docB) },
    },
    merge: {
      pages: mergedPages,
      bytes: merged.length,
      sumOfSources: docA.length + docB.length,
      ratioToSum: Number((merged.length / (docA.length + docB.length)).toFixed(3)),
      hasOutline: await hasOutline(merged),
      hasStructTree: await hasStructTree(merged),
      textSelectableFromA: mergedFirstText.includes(MARKER_A),
      textSelectableFromB: mergedSecondDocText.includes(MARKER_B),
    },
    split: {
      files: singles.length,
      bytesPerFile: singles.map(bytes => bytes.length),
      total: singlesTotal,
      ratioToSource: Number((singlesTotal / docA.length).toFixed(3)),
    },
    extract: {
      range,
      pages: (await PDFDocument.load(extracted)).getPageCount(),
      bytes: extracted.length,
      ratioToSource: Number((extracted.length / docA.length).toFixed(3)),
      shareOfPages: Number((3 / pagesA).toFixed(3)),
    },
  };

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, "pdf-tool-benchmarks.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
