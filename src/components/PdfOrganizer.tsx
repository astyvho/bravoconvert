"use client";

import { ArrowDown, ArrowUp, Combine, Download, FileText, Scissors, Trash2, Upload } from "lucide-react";
import JSZip from "jszip";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  MAX_MERGE_FILES,
  MAX_PDF_BYTES,
  MAX_TOTAL_BYTES,
  PdfToolError,
  countPages,
  extractPages,
  mergePdfs,
  parsePageRanges,
  splitEveryPage,
} from "@/lib/pdf-tools";

type Mode = "merge" | "split";
type SplitMode = "range" | "every";

type QueuedPdf = {
  id: string;
  file: File;
  pages: number | null;
  error: string | null;
};

type Result = {
  url: string;
  name: string;
  bytes: number;
  detail: string;
};

const TOOL_BUTTON = "inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-black transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";
const PRIMARY_BUTTON = "inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// 일부 브라우저는 PDF 의 MIME 을 비워서 넘기므로 확장자도 함께 본다.
const isPdf = (file: File) => file.type === "application/pdf" || (file.type === "" && /\.pdf$/i.test(file.name));
const baseName = (name: string) => name.replace(/\.pdf$/i, "") || "document";
const errorMessage = (error: unknown) => (error instanceof PdfToolError ? error.message : "Something went wrong while processing the PDF. Try a smaller file or reload the page.");

export default function PdfOrganizer() {
  const [mode, setMode] = useState<Mode>("merge");
  const [queue, setQueue] = useState<QueuedPdf[]>([]);
  const [splitSource, setSplitSource] = useState<QueuedPdf | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>("range");
  const [rangeInput, setRangeInput] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<Result[]>([]);

  // 결과 blob URL 은 교체되거나 페이지를 떠날 때 해제한다.
  const replaceResults = (next: Result[]) => {
    resultsRef.current.forEach(result => URL.revokeObjectURL(result.url));
    resultsRef.current = next;
    setResults(next);
  };
  useEffect(() => () => resultsRef.current.forEach(result => URL.revokeObjectURL(result.url)), []);

  const inspect = async (file: File): Promise<QueuedPdf> => {
    const id = `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
    if (!isPdf(file)) return { id, file, pages: null, error: "Not a PDF file." };
    if (file.size > MAX_PDF_BYTES) return { id, file, pages: null, error: `Larger than ${formatBytes(MAX_PDF_BYTES)}.` };
    try {
      return { id, file, pages: await countPages(await file.arrayBuffer()), error: null };
    } catch (caught) {
      return { id, file, pages: null, error: errorMessage(caught) };
    }
  };

  const addFiles = async (list: FileList | File[] | null) => {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    setError(null);
    replaceResults([]);

    if (mode === "split") {
      const inspected = await inspect(files[0]);
      setSplitSource(inspected);
      if (inspected.pages) setRangeInput(inspected.pages > 1 ? `1-${Math.min(inspected.pages, 3)}` : "1");
      if (files.length > 1) setError("Split works on one PDF at a time, so only the first file was added.");
      return;
    }

    const room = MAX_MERGE_FILES - queue.length;
    if (room <= 0) {
      setError(`You can merge up to ${MAX_MERGE_FILES} files at once.`);
      return;
    }
    if (files.length > room) setError(`Only ${room} more file${room === 1 ? "" : "s"} can be added (limit ${MAX_MERGE_FILES}).`);
    setBusy(true);
    const inspected: QueuedPdf[] = [];
    for (const file of files.slice(0, room)) inspected.push(await inspect(file));
    setQueue(current => [...current, ...inspected]);
    setBusy(false);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const move = (index: number, offset: -1 | 1) => {
    setQueue(current => {
      const next = [...current];
      const target = index + offset;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    replaceResults([]);
  };

  const remove = (id: string) => {
    setQueue(current => current.filter(item => item.id !== id));
    replaceResults([]);
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setError(null);
    replaceResults([]);
  };

  const ready = queue.filter(item => !item.error);
  const totalBytes = ready.reduce((sum, item) => sum + item.file.size, 0);
  const totalPages = ready.reduce((sum, item) => sum + (item.pages ?? 0), 0);

  const runMerge = async () => {
    if (ready.length < 2) return;
    if (totalBytes > MAX_TOTAL_BYTES) {
      setError(`The selected files add up to ${formatBytes(totalBytes)}. Keep the total under ${formatBytes(MAX_TOTAL_BYTES)}.`);
      return;
    }
    setBusy(true);
    setError(null);
    replaceResults([]);
    try {
      const sources = await Promise.all(ready.map(item => item.file.arrayBuffer()));
      const bytes = await mergePdfs(sources);
      const blob = new Blob([bytes], { type: "application/pdf" });
      replaceResults([{ url: URL.createObjectURL(blob), name: "merged.pdf", bytes: blob.size, detail: `${totalPages} pages from ${ready.length} files` }]);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const runSplit = async () => {
    if (!splitSource?.pages) return;
    setBusy(true);
    setError(null);
    replaceResults([]);
    try {
      const source = await splitSource.file.arrayBuffer();
      const base = baseName(splitSource.file.name);
      if (splitMode === "range") {
        const indices = parsePageRanges(rangeInput, splitSource.pages);
        const bytes = await extractPages(source, indices);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const label = rangeInput.replace(/\s+/g, "").replace(/,/g, "_");
        replaceResults([{ url: URL.createObjectURL(blob), name: `${base}-pages-${label}.pdf`, bytes: blob.size, detail: `${indices.length} page${indices.length === 1 ? "" : "s"}` }]);
      } else {
        const pages = await splitEveryPage(source);
        const width = String(pages.length).length;
        const zip = new JSZip();
        pages.forEach((bytes, index) => zip.file(`${base}-page-${String(index + 1).padStart(width, "0")}.pdf`, bytes));
        const blob = await zip.generateAsync({ type: "blob" });
        replaceResults([{ url: URL.createObjectURL(blob), name: `${base}-pages.zip`, bytes: blob.size, detail: `${pages.length} single-page PDFs in a ZIP` }]);
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const dropzone = (
    <div
      className={`rounded-3xl border-2 border-dashed p-8 text-center transition md:p-12 ${dragging ? "border-black bg-gray-200 shadow-md" : "border-gray-400 bg-gray-100 hover:border-gray-500 hover:bg-gray-200 hover:shadow-md"}`}
      onDragEnter={event => { event.preventDefault(); setDragging(true); }}
      onDragOver={event => event.preventDefault()}
      onDragLeave={event => { if (event.currentTarget === event.target) setDragging(false); }}
      onDrop={onDrop}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
        <Upload className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-black">
        {mode === "merge" ? (queue.length ? "Add more PDFs" : "Drop PDF files here") : (splitSource ? "Drop a different PDF" : "Drop a PDF here")}
      </h2>
      <button type="button" onClick={() => fileInputRef.current?.click()} className={`${PRIMARY_BUTTON} mt-5`}>
        {mode === "merge" ? "Choose PDFs" : "Choose a PDF"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple={mode === "merge"}
        onChange={onFileChange}
        className="sr-only"
        aria-label={mode === "merge" ? "Choose PDF files to merge" : "Choose a PDF to split"}
      />
      <p className="mt-4 text-sm text-gray-500">
        {mode === "merge"
          ? `PDF only · Up to ${MAX_MERGE_FILES} files · ${formatBytes(MAX_PDF_BYTES)} each, ${formatBytes(MAX_TOTAL_BYTES)} total`
          : `One PDF · Up to ${formatBytes(MAX_PDF_BYTES)}`}
      </p>
    </div>
  );

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-12">
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
          <FileText className="h-4 w-4" aria-hidden="true" /> Browser-based PDF tool
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-black md:text-5xl">Merge and split PDF files</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">Combine several PDFs into one, or pull pages out of a PDF. Pages are copied as they are, so text stays selectable — and the files never leave your device.</p>
      </header>

      <div className="mx-auto mb-6 flex max-w-md rounded-2xl bg-gray-100 p-1" role="tablist" aria-label="PDF tool mode">
        {([["merge", "Merge PDFs", Combine], ["split", "Split a PDF", Scissors]] as const).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => switchMode(value)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${mode === value ? "bg-white text-black shadow-sm" : "text-gray-600 hover:text-black"}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {dropzone}

        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        {mode === "merge" && queue.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-black">Merge order</h2>
              <p className="text-sm text-gray-600">{ready.length} file{ready.length === 1 ? "" : "s"} · {totalPages} pages · {formatBytes(totalBytes)}</p>
            </div>
            <ol className="space-y-2">
              {queue.map((item, index) => (
                <li key={item.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${item.error ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
                  <span className="w-6 text-center text-sm font-semibold text-gray-500">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-black">{item.file.name}</p>
                    <p className={`text-xs ${item.error ? "text-red-700" : "text-gray-500"}`}>
                      {item.error ?? `${item.pages} page${item.pages === 1 ? "" : "s"} · ${formatBytes(item.file.size)}`}
                    </p>
                  </div>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-lg p-2 hover:bg-white disabled:opacity-30" aria-label={`Move ${item.file.name} up`}><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === queue.length - 1} className="rounded-lg p-2 hover:bg-white disabled:opacity-30" aria-label={`Move ${item.file.name} down`}><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => remove(item.id)} className="rounded-lg p-2 hover:bg-white" aria-label={`Remove ${item.file.name}`}><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={runMerge} disabled={busy || ready.length < 2} className={PRIMARY_BUTTON}>
                <Combine className="h-4 w-4" aria-hidden="true" /> {busy ? "Working…" : ready.length >= 2 ? `Merge ${ready.length} PDFs` : "Merge PDFs"}
              </button>
              <button type="button" onClick={() => { setQueue([]); replaceResults([]); setError(null); }} className={TOOL_BUTTON}>Clear list</button>
              {ready.length < 2 && <p className="text-sm text-gray-500">Add at least two readable PDFs.</p>}
            </div>
          </div>
        )}

        {mode === "split" && splitSource && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="truncate text-sm font-semibold text-black">{splitSource.file.name}</p>
            <p className={`text-xs ${splitSource.error ? "text-red-700" : "text-gray-500"}`}>
              {splitSource.error ?? `${splitSource.pages} page${splitSource.pages === 1 ? "" : "s"} · ${formatBytes(splitSource.file.size)}`}
            </p>

            {splitSource.pages && (
              <>
                <fieldset className="mt-5 space-y-3">
                  <legend className="text-sm font-semibold text-black">What do you want to get?</legend>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
                    <input type="radio" name="split-mode" checked={splitMode === "range"} onChange={() => setSplitMode("range")} className="mt-1" />
                    <span>
                      <span className="block text-sm font-semibold text-black">Selected pages as one PDF</span>
                      <span className="block text-xs text-gray-600">Type pages and ranges. The new PDF follows the order you type.</span>
                    </span>
                  </label>
                  {splitMode === "range" && (
                    <div className="pl-3">
                      <label htmlFor="page-range" className="block text-sm font-medium text-gray-700">Pages (1–{splitSource.pages})</label>
                      <input
                        id="page-range"
                        value={rangeInput}
                        onChange={event => setRangeInput(event.target.value)}
                        placeholder="e.g. 1-3, 5, 8-10"
                        className="mt-2 w-full max-w-sm rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
                    <input type="radio" name="split-mode" checked={splitMode === "every"} onChange={() => setSplitMode("every")} className="mt-1" />
                    <span>
                      <span className="block text-sm font-semibold text-black">Every page as its own PDF</span>
                      <span className="block text-xs text-gray-600">{splitSource.pages} single-page PDFs, downloaded together as a ZIP.</span>
                    </span>
                  </label>
                </fieldset>
                <button type="button" onClick={runSplit} disabled={busy} className={`${PRIMARY_BUTTON} mt-5`}>
                  <Scissors className="h-4 w-4" aria-hidden="true" /> {busy ? "Working…" : splitMode === "range" ? "Extract pages" : `Split into ${splitSource.pages} files`}
                </button>
              </>
            )}
          </div>
        )}

        <div aria-live="polite">
          {results.map(result => (
            <div key={result.url} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="min-w-0">
                <p className="truncate font-semibold text-black">{result.name}</p>
                <p className="text-sm text-gray-600">{result.detail} · {formatBytes(result.bytes)}</p>
              </div>
              <a href={result.url} download={result.name} className={PRIMARY_BUTTON}>
                <Download className="h-4 w-4" aria-hidden="true" /> Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
