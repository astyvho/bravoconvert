"use client";

import { ArrowDown, ArrowUp, Check, Combine, Download, FileText, Scissors, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageContainer from "@/components/site/page-container";
import ActionBar from "@/components/tool/action-bar";
import DropZone from "@/components/tool/drop-zone";
import IconTile from "@/components/tool/icon-tile";
import ToolLayout from "@/components/tool/tool-layout";
import ToolPageHeader from "@/components/tool/tool-page-header";
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

  const hasWork = mode === "merge" ? queue.length > 0 : splitSource !== null;

  const dropzone = (
    <DropZone
      title={mode === "merge" ? (queue.length ? "Add more PDFs" : "Drop PDF files here") : (splitSource ? "Drop a different PDF" : "Drop a PDF here")}
      note={mode === "merge"
        ? `PDF only · Up to ${MAX_MERGE_FILES} files · ${formatBytes(MAX_PDF_BYTES)} each, ${formatBytes(MAX_TOTAL_BYTES)} total`
        : `One PDF · Up to ${formatBytes(MAX_PDF_BYTES)}`}
      dragging={dragging}
      onDragEnter={event => { event.preventDefault(); setDragging(true); }}
      onDragOver={event => event.preventDefault()}
      onDragLeave={event => { if (event.currentTarget === event.target) setDragging(false); }}
      onDrop={onDrop}
      actions={
        <Button variant={hasWork ? "secondary" : "primary"} onClick={() => fileInputRef.current?.click()}>
          {mode === "merge" ? "Choose PDFs" : "Choose a PDF"}
        </Button>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple={mode === "merge"}
        onChange={onFileChange}
        className="sr-only"
        aria-label={mode === "merge" ? "Choose PDF files to merge" : "Choose a PDF to split"}
      />
    </DropZone>
  );

  const fileMeta = (item: QueuedPdf) =>
    item.error ?? `${item.pages} page${item.pages === 1 ? "" : "s"} · ${formatBytes(item.file.size)}`;

  const mergeMain = (
    <div data-tool-main className="space-y-5">
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-h3">Merge order</h2>
          <p className="text-sm text-muted-foreground">{ready.length} file{ready.length === 1 ? "" : "s"} · {totalPages} pages · {formatBytes(totalBytes)}</p>
        </div>
        <ol className="space-y-2">
          {queue.map((item, index) => (
            <li key={item.id} className={`flex items-center gap-3 rounded-field px-3 py-2.5 ${item.error ? "bg-destructive" : "bg-muted"}`}>
              <span className="w-6 text-center text-sm font-bold text-muted-foreground">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{item.file.name}</p>
                <p className={`text-xs ${item.error ? "text-destructive-foreground" : "text-muted-foreground"}`}>{fileMeta(item)}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${item.file.name} up`}><ArrowUp aria-hidden="true" /></Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => move(index, 1)} disabled={index === queue.length - 1} aria-label={`Move ${item.file.name} down`}><ArrowDown aria-hidden="true" /></Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => remove(item.id)} aria-label={`Remove ${item.file.name}`}><Trash2 aria-hidden="true" /></Button>
            </li>
          ))}
        </ol>
      </Card>
      {dropzone}
    </div>
  );

  const mergePanel = (
    <Card data-tool-panel className="p-5">
      <h2 className="text-h3">Merge</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Files are joined in the order shown. Pages are copied as they are, so text stays selectable.
      </p>
      {ready.length < 2 && <p className="mt-3 text-sm font-semibold text-foreground">Add at least two readable PDFs.</p>}
      <ActionBar className="mt-5">
        <Button size="lg" className="w-full" onClick={runMerge} disabled={busy || ready.length < 2}>
          <Combine aria-hidden="true" /> {busy ? "Working…" : ready.length >= 2 ? `Merge ${ready.length} PDFs` : "Merge PDFs"}
        </Button>
      </ActionBar>
      <Button variant="secondary" className="mt-2 w-full" onClick={() => { setQueue([]); replaceResults([]); setError(null); }}>Clear list</Button>
    </Card>
  );

  const splitMain = splitSource && (
    <div data-tool-main className="space-y-5">
      <Card className="flex items-center gap-3 p-5">
        <IconTile icon={FileText} tone="blue" size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{splitSource.file.name}</p>
          <p className={`text-xs ${splitSource.error ? "text-destructive-foreground" : "text-muted-foreground"}`}>{fileMeta(splitSource)}</p>
        </div>
      </Card>
      {dropzone}
    </div>
  );

  const choice = (checked: boolean) =>
    `flex cursor-pointer items-start gap-3 rounded-field p-3 transition-colors ${checked ? "bg-primary-soft" : "bg-muted hover:bg-muted/70"}`;

  const splitPanel = splitSource && (
    <Card data-tool-panel className="p-5">
      <h2 className="text-h3">Split</h2>
      {splitSource.pages ? (
        <>
          <fieldset className="mt-4 space-y-3">
            <legend className="mb-3 text-sm font-semibold text-foreground">What do you want to get?</legend>
            <label className={choice(splitMode === "range")}>
              <input type="radio" name="split-mode" checked={splitMode === "range"} onChange={() => setSplitMode("range")} className="mt-1 accent-primary" />
              <span>
                <span className="block text-sm font-bold text-foreground">Selected pages as one PDF</span>
                <span className="block text-xs text-muted-foreground">Type pages and ranges. The new PDF follows the order you type.</span>
              </span>
            </label>
            {splitMode === "range" && (
              <div className="pl-3">
                <label htmlFor="page-range" className="block text-sm font-semibold text-foreground">Pages (1–{splitSource.pages})</label>
                <input
                  id="page-range"
                  value={rangeInput}
                  onChange={event => setRangeInput(event.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="mt-2 h-11 w-full rounded-field border-2 border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
            <label className={choice(splitMode === "every")}>
              <input type="radio" name="split-mode" checked={splitMode === "every"} onChange={() => setSplitMode("every")} className="mt-1 accent-primary" />
              <span>
                <span className="block text-sm font-bold text-foreground">Every page as its own PDF</span>
                <span className="block text-xs text-muted-foreground">{splitSource.pages} single-page PDFs, downloaded together as a ZIP.</span>
              </span>
            </label>
          </fieldset>
          <ActionBar className="mt-5">
            <Button size="lg" className="w-full" onClick={runSplit} disabled={busy}>
              <Scissors aria-hidden="true" /> {busy ? "Working…" : splitMode === "range" ? "Extract pages" : `Split into ${splitSource.pages} files`}
            </Button>
          </ActionBar>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Choose a different PDF to split.</p>
      )}
    </Card>
  );

  const resultCards = (
    <div aria-live="polite" className="space-y-3">
      {results.map(result => (
        <Card key={result.url} className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <IconTile icon={Check} tone="clean" size="sm" />
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">{result.name}</p>
              <p className="text-sm text-muted-foreground">{result.detail} · {formatBytes(result.bytes)}</p>
            </div>
          </div>
          <a href={result.url} download={result.name} className={buttonVariants()}>
            <Download aria-hidden="true" /> Download
          </a>
        </Card>
      ))}
    </div>
  );

  const workArea = (
    <ToolLayout
      main={hasWork ? (mode === "merge" ? mergeMain : splitMain) : dropzone}
      panel={hasWork ? (mode === "merge" ? mergePanel : splitPanel) : null}
      results={resultCards}
    />
  );

  return (
    <PageContainer className="pb-6">
      <ToolPageHeader
        crumb={["Tools", "Merge & Split PDF"]}
        title="Merge and split PDF files"
        intro="Combine several PDFs into one, or pull pages out of a PDF. Pages are copied as they are, so text stays selectable — and the files never leave your device."
        icon={FileText}
        chips={[{ label: "PDF" }, { label: `Up to ${MAX_MERGE_FILES} files` }, { label: `${formatBytes(MAX_PDF_BYTES)} each · ${formatBytes(MAX_TOTAL_BYTES)} total` }, { label: "Nothing uploaded", ok: true }]}
      />
      <Tabs value={mode} onValueChange={value => switchMode(value as Mode)} className="mt-6">
        <TabsList aria-label="PDF tool mode" className="flex w-full max-w-md">
          <TabsTrigger value="merge"><Combine aria-hidden="true" /> Merge PDFs</TabsTrigger>
          <TabsTrigger value="split"><Scissors aria-hidden="true" /> Split a PDF</TabsTrigger>
        </TabsList>
        {(["merge", "split"] as const).map(value => (
          <TabsContent key={value} value={value} className="mt-5">
            {error && <p role="alert" className="mb-4 rounded-field bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground">{error}</p>}
            {workArea}
          </TabsContent>
        ))}
      </Tabs>
    </PageContainer>
  );
}
