// PDF 병합/분할 핵심 로직. 페이지를 래스터화하지 않고 PDF 객체 그대로 복사한다.
// scripts/generate-pdf-tool-data.mjs 가 이 파일을 직접 import 해서 측정하므로,
// Node 의 --experimental-strip-types 로 읽을 수 있는 문법(타입 제거만으로 실행 가능)만 쓴다.
import { PDFDocument } from "pdf-lib";

export const MAX_PDF_BYTES = 50 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 150 * 1024 * 1024;
export const MAX_MERGE_FILES = 30;

export class PdfToolError extends Error {}

export async function loadPdf(bytes: ArrayBuffer | Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    if (error instanceof Error && /encrypt/i.test(error.message)) {
      throw new PdfToolError("This PDF is password-protected or encrypted. Remove the protection in the app that created it, then try again.");
    }
    throw new PdfToolError("This file could not be read as a PDF. It may be damaged or not a real PDF.");
  }
}

export async function countPages(bytes: ArrayBuffer | Uint8Array): Promise<number> {
  const doc = await loadPdf(bytes);
  return doc.getPageCount();
}

/** Joins every page of every source, in the order given. */
export async function mergePdfs(sources: Array<ArrayBuffer | Uint8Array>): Promise<Uint8Array> {
  if (sources.length < 2) throw new PdfToolError("Add at least two PDF files to merge.");
  const output = await PDFDocument.create();
  for (const bytes of sources) {
    const source = await loadPdf(bytes);
    const pages = await output.copyPages(source, source.getPageIndices());
    for (const page of pages) output.addPage(page);
  }
  return output.save();
}

/**
 * Parses "1-3, 5, 8-10" into zero-based page indices, in the order typed.
 * Order is kept so "5, 1" produces page 5 followed by page 1.
 */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const tokens = input.split(",").map(token => token.trim()).filter(Boolean);
  if (tokens.length === 0) throw new PdfToolError("Enter the pages to extract, for example 1-3, 5.");

  const indices: number[] = [];
  for (const token of tokens) {
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(token);
    if (!match) throw new PdfToolError(`"${token}" is not a page number or range. Use a format like 1-3, 5.`);
    const start = Number(match[1]);
    const end = match[2] === undefined ? start : Number(match[2]);
    if (start < 1 || end < 1) throw new PdfToolError("Page numbers start at 1.");
    if (start > end) throw new PdfToolError(`In "${token}" the first page is after the last. Write the smaller number first.`);
    if (end > pageCount) throw new PdfToolError(`This PDF has ${pageCount} page${pageCount === 1 ? "" : "s"}, so page ${end} does not exist.`);
    for (let page = start; page <= end; page += 1) indices.push(page - 1);
  }
  return indices;
}

/** Builds a new PDF containing only the given zero-based pages. */
export async function extractPages(bytes: ArrayBuffer | Uint8Array, indices: number[]): Promise<Uint8Array> {
  if (indices.length === 0) throw new PdfToolError("Choose at least one page.");
  const source = await loadPdf(bytes);
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indices);
  for (const page of pages) output.addPage(page);
  return output.save();
}

/** Produces one single-page PDF per page of the source. */
export async function splitEveryPage(bytes: ArrayBuffer | Uint8Array): Promise<Uint8Array[]> {
  const source = await loadPdf(bytes);
  const results: Uint8Array[] = [];
  for (const index of source.getPageIndices()) {
    const output = await PDFDocument.create();
    const [page] = await output.copyPages(source, [index]);
    output.addPage(page);
    results.push(await output.save());
  }
  return results;
}
