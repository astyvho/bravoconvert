/**
 * Measures what a PDF says about who made it, and how much of that survives
 * the site's own PDF tools.
 *
 * A report is printed from Chromium (so its default properties are real, not
 * invented), then given the kind of properties an office app writes — author,
 * title, subject, keywords, creator app, an XMP packet — plus a reviewer's
 * sticky-note comment on page 1. That tagged file is run through
 * src/lib/pdf-tools.ts (merge, extract, split) and through the PDF-to-image
 * path (PDF.js render → canvas.toBlob), and each output is read back.
 *
 *   node --experimental-strip-types scripts/generate-pdf-metadata-data.mjs
 *
 * Output:
 *   src/data/pdf-metadata-demo.json
 *   public/guides/pdf-metadata-sample.pdf   (the tagged source, for readers to inspect)
 */

import { chromium } from "@playwright/test";
import exifr from "exifr";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFRawStream, PDFString, decodePDFRawStream, rgb } from "pdf-lib";
import { extractPages, mergePdfs, parsePageRanges, splitEveryPage } from "../src/lib/pdf-tools.ts";

const require = createRequire(import.meta.url);
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const PUBLIC_DIR = path.join(ROOT, "public", "guides");

// 가짜지만 그럴듯한 값. 실존 인물/제품명을 쓰지 않는다.
const TAGS = {
  title: "Riverside Station - Q3 maintenance (DRAFT v4)",
  author: "Jordan Example",
  subject: "Internal - pump replacement costs",
  keywords: ["budget", "confidential", "pump 2 failure"],
  creator: "ExampleWriter 7.2 (Windows)",
};
const SOURCE_CREATED = new Date("2026-05-11T08:42:00Z");
const SOURCE_MODIFIED = new Date("2026-06-02T17:15:30Z");
const XMP_TOOL ="ExampleWriter 7.2 (Windows)";
const XMP_CREATOR = "Jordan Example";
const COMMENT_AUTHOR = "Sam Reviewer";
const COMMENT_TEXT = "Remove the supplier quote before this goes outside the company.";

const PARAGRAPH = "The inspection covered intake screens, the two primary pumps, the standby generator, and the control cabinet. Readings outside the expected band were repeated after ten minutes to rule out start-up effects.";

function reportHtml(title, pages) {
  const body = Array.from({ length: pages }, (_, i) => `
    <section style="page-break-after: ${i === pages - 1 ? "auto" : "always"}">
      <h1>${title}${i ? ` — part ${i + 1}` : ""}</h1><p>${PARAGRAPH}</p><p>${PARAGRAPH}</p>
    </section>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.5}</style></head><body>${body}</body></html>`;
}

async function printPdf(browser, html) {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  const bytes = await page.pdf({ format: "A4", margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" } });
  await page.close();
  return new Uint8Array(bytes);
}

function xmpPacket() {
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
<dc:creator><rdf:Seq><rdf:li>${XMP_CREATOR}</rdf:li></rdf:Seq></dc:creator>
<xmp:CreatorTool>${XMP_TOOL}</xmp:CreatorTool>
</rdf:Description></rdf:RDF></x:xmpmeta>
<?xpacket end="w"?>`;
}

// 사무용 앱이 저장할 때 남기는 종류의 속성을 덧붙인다. 원본 Chromium 이 쓴 Producer/날짜는 그대로 둔다.
async function tag(bytes) {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  doc.setTitle(TAGS.title);
  doc.setAuthor(TAGS.author);
  doc.setSubject(TAGS.subject);
  doc.setKeywords(TAGS.keywords);
  doc.setCreator(TAGS.creator);
  // 원본 날짜를 과거로 고정해야 출력 파일의 날짜가 복사된 것인지 새로 찍힌 것인지 구분된다.
  doc.setCreationDate(SOURCE_CREATED);
  doc.setModificationDate(SOURCE_MODIFIED);

  const xmp = doc.context.stream(xmpPacket(), { Type: "Metadata", Subtype: "XML" });
  doc.catalog.set(PDFName.of("Metadata"), doc.context.register(xmp));

  const page = doc.getPage(0);
  const note = doc.context.obj({
    Type: "Annot",
    Subtype: "Text",
    Rect: [460, 760, 480, 780],
    Contents: PDFString.of(COMMENT_TEXT),
    T: PDFString.of(COMMENT_AUTHOR),
    Name: "Comment",
  });
  page.node.set(PDFName.of("Annots"), doc.context.obj([doc.context.register(note)]));
  return doc.save();
}

// 흔한 "가리기" 실수: 글자 위에 검은 사각형만 그린다. 글자 자체는 페이지 내용에 그대로 남는다.
async function coverTitle(bytes) {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const page = doc.getPage(0);
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 40, y: height - 130, width: width - 80, height: 90, color: rgb(0, 0, 0) });
  return doc.save();
}

async function pageText(bytes, pageNumber) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: false }).promise;
  const content = await (await doc.getPage(pageNumber)).getTextContent();
  const value = content.items.map(item => item.str).join(" ").replace(/\s+/g, " ");
  await doc.destroy();
  return value;
}

const text = value => (value instanceof PDFString || value instanceof PDFHexString ? value.decodeText() : null);

async function inspect(bytes) {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const metadataRef = doc.catalog.get(PDFName.of("Metadata"));
  let xmp = null;
  if (metadataRef) {
    const stream = doc.context.lookup(metadataRef);
    if (stream instanceof PDFRawStream) xmp = new TextDecoder().decode(decodePDFRawStream(stream).decode());
  }
  const comments = [];
  for (const page of doc.getPages()) {
    const annots = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
    if (!annots) continue;
    for (let i = 0; i < annots.size(); i += 1) {
      const annot = annots.lookup(i, PDFDict);
      comments.push({ author: text(annot.get(PDFName.of("T"))), text: text(annot.get(PDFName.of("Contents"))) });
    }
  }
  const date = value => (value ? value.toISOString() : null);
  return {
    bytes: bytes.length,
    pages: doc.getPageCount(),
    properties: {
      Title: doc.getTitle() ?? null,
      Author: doc.getAuthor() ?? null,
      Subject: doc.getSubject() ?? null,
      Keywords: doc.getKeywords() ?? null,
      Creator: doc.getCreator() ?? null,
      Producer: doc.getProducer() ?? null,
      CreationDate: date(doc.getCreationDate()),
      ModDate: date(doc.getModificationDate()),
    },
    // 원문 날짜 문자열. 시간대 표기(Z 또는 +09'00')가 남는지 보기 위해 그대로 둔다.
    rawCreationDate: text(doc.getInfoDict().get(PDFName.of("CreationDate"))),
    xmp: {
      present: xmp !== null,
      hasCreatorName: xmp?.includes(XMP_CREATOR) ?? false,
      hasCreatorTool: xmp?.includes(XMP_TOOL) ?? false,
    },
    comments,
  };
}

// PDFConverter.tsx 와 같은 경로: PDF.js 로 scale 2.0 렌더 → canvas.toBlob.
async function renderToImages(browser, pdfBytes) {
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addScriptTag({ path: require.resolve("pdfjs-dist/build/pdf.min.js") });
  const workerSource = await readFile(require.resolve("pdfjs-dist/build/pdf.worker.min.js"), "utf8");
  const result = await page.evaluate(async ({ base64, workerSource }) => {
    const lib = window.pdfjsLib;
    lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const data = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const doc = await lib.getDocument({ data }).promise;
    const pdfPage = await doc.getPage(1);
    const viewport = pdfPage.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await pdfPage.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    const encode = (type, quality) => new Promise(resolve => canvas.toBlob(async blob => {
      const buffer = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (const byte of buffer) binary += String.fromCharCode(byte);
      resolve(btoa(binary));
    }, type, quality));
    return { png: await encode("image/png"), jpeg: await encode("image/jpeg", 0.95), width: canvas.width, height: canvas.height };
  }, { base64: Buffer.from(pdfBytes).toString("base64"), workerSource });
  await page.close();
  return { png: Buffer.from(result.png, "base64"), jpeg: Buffer.from(result.jpeg, "base64"), width: result.width, height: result.height };
}

function pngChunks(bytes) {
  const chunks = [];
  for (let offset = 8; offset + 8 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    chunks.push(bytes.toString("ascii", offset + 4, offset + 8));
    offset += 12 + length;
  }
  return [...new Set(chunks)];
}

function jpegMarkers(bytes) {
  const markers = [];
  for (let offset = 2; offset + 4 <= bytes.length;) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    const name = `0xFF${marker.toString(16).toUpperCase().padStart(2, "0")}`;
    // APPn 세그먼트는 식별 문자열(JFIF, ICC_PROFILE, Exif 등)로 내용 종류를 알 수 있다.
    const id = marker >= 0xe0 && marker <= 0xef ? bytes.toString("latin1", offset + 4, offset + 16).split("\0")[0] : null;
    markers.push(id ? `${name} ${id}` : name);
    if (marker === 0xda) break; // 스캔 데이터 시작 — 이후는 픽셀
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  return markers;
}

function containsText(bytes, needle) {
  return Buffer.from(bytes).includes(Buffer.from(needle, "latin1"));
}

async function main() {
  const startedAt = new Date();
  const browser = await chromium.launch();
  const browserVersion = browser.version();

  const plain = await printPdf(browser, reportHtml("Riverside Station Report", 4));
  const other = await printPdf(browser, reportHtml("Inspection Appendix", 2));
  const tagged = await tag(plain);

  const merged = await mergePdfs([tagged, other]);
  const extracted = await extractPages(tagged, parsePageRanges("1-2", 4));
  const [firstSingle] = await splitEveryPage(tagged);
  const images = await renderToImages(browser, tagged);
  const covered = await coverTitle(plain);
  const coveredExtract = await extractPages(covered, [0]);
  await browser.close();
  const coveredTitle = "Riverside Station Report";

  const leaks = [TAGS.author, TAGS.title, XMP_CREATOR, COMMENT_AUTHOR, COMMENT_TEXT];
  const imageReport = async (bytes, structure) => ({
    bytes: bytes.length,
    structure,
    exif: (await exifr.parse(bytes, { tiff: true, xmp: true, iptc: true }).catch(() => null)) ?? null,
    containsAnyDocumentText: leaks.some(needle => containsText(bytes, needle)),
  });

  const result = {
    measuredOn: new Date().toISOString().slice(0, 10),
    // 출력 파일의 날짜가 이 실행 시각 근처면 "처리한 시각이 새로 찍힌다"는 뜻이다.
    ranAt: startedAt.toISOString(),
    browser: `Chromium ${browserVersion}`,
    library: `pdf-lib ${require("pdf-lib/package.json").version}, PDF.js ${require("pdfjs-dist/package.json").version}`,
    sampleFile: "/guides/pdf-metadata-sample.pdf",
    planted: { ...TAGS, xmpCreator: XMP_CREATOR, xmpCreatorTool: XMP_TOOL, commentAuthor: COMMENT_AUTHOR, commentText: COMMENT_TEXT },
    chromiumDefault: await inspect(plain),
    source: await inspect(tagged),
    merged: await inspect(merged),
    extracted: { range: "1-2", ...(await inspect(extracted)) },
    splitFirstPage: await inspect(firstSingle),
    coveredText: {
      method: "A filled black rectangle drawn over the heading on page 1",
      text: coveredTitle,
      extractableInSource: (await pageText(covered, 1)).includes(coveredTitle),
      extractableAfterExtract: (await pageText(coveredExtract, 1)).includes(coveredTitle),
    },
    pageAsImage: {
      pixelSize: { width: images.width, height: images.height },
      png: await imageReport(images.png, pngChunks(images.png)),
      jpeg: await imageReport(images.jpeg, jpegMarkers(images.jpeg)),
    },
  };

  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(PUBLIC_DIR, { recursive: true });
  await writeFile(path.join(PUBLIC_DIR, "pdf-metadata-sample.pdf"), tagged);
  await writeFile(path.join(DATA_DIR, "pdf-metadata-demo.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
