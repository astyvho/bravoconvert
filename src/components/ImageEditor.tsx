"use client";

import {
  Check,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  ImageIcon,
  Link2,
  Redo2,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  Undo2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_SIDE = 16384;
const MAX_PIXELS = 64_000_000;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const TOOL_BUTTON = "inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-black transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";
const PANEL = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm";
const LABEL = "block text-sm font-medium text-gray-700";
const INPUT = "mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black";
const CHECKER_STYLE = {
  backgroundColor: "#f3f4f6",
  backgroundImage: "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
  backgroundSize: "16px 16px",
};

type OutputFormat = "jpeg" | "png" | "webp";

type EditState = {
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  flipX: boolean;
  flipY: boolean;
};

type LoadedImage = {
  file: File;
  element: HTMLImageElement;
  url: string;
  width: number;
  height: number;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const sanitizeFilename = (value: string) =>
  value.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();

const initialEdit = (width: number, height: number): EditState => ({
  width,
  height,
  rotation: 0,
  flipX: false,
  flipY: false,
});

export default function ImageEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const loadedRef = useRef<LoadedImage | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [history, setHistory] = useState<EditState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [quality, setQuality] = useState(90);
  const [background, setBackground] = useState("#ffffff");
  const [filename, setFilename] = useState("edited-image");
  const [zoom, setZoom] = useState(100);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);

  useEffect(() => () => {
    if (loadedRef.current) URL.revokeObjectURL(loadedRef.current.url);
  }, []);

  const outputDimensions = useMemo(() => {
    if (!edit) return { width: 0, height: 0 };
    return edit.rotation % 180 === 0
      ? { width: edit.width, height: edit.height }
      : { width: edit.height, height: edit.width };
  }, [edit]);

  const commitEdit = useCallback((next: EditState) => {
    setEdit(next);
    setHistory(current => {
      const nextHistory = current.slice(0, historyIndex + 1);
      nextHistory.push(next);
      return nextHistory;
    });
    setHistoryIndex(current => current + 1);
    setSaved(false);
  }, [historyIndex]);

  const loadFile = useCallback((file: File) => {
    setError("");
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("The image is larger than 10 MB. Please choose a smaller file.");
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        URL.revokeObjectURL(url);
        setError("This image could not be read.");
        return;
      }
      if (image.naturalWidth > MAX_SIDE || image.naturalHeight > MAX_SIDE || image.naturalWidth * image.naturalHeight > MAX_PIXELS) {
        URL.revokeObjectURL(url);
        setError("This image is too large to edit safely in the browser. Use an image below 16,384px per side and 64 megapixels.");
        return;
      }
      if (loadedRef.current) URL.revokeObjectURL(loadedRef.current.url);
      const nextLoaded = {
        file,
        element: image,
        url,
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
      const nextEdit = initialEdit(image.naturalWidth, image.naturalHeight);
      loadedRef.current = nextLoaded;
      setLoaded(nextLoaded);
      setEdit(nextEdit);
      setHistory([nextEdit]);
      setHistoryIndex(0);
      setAspectLocked(true);
      setZoom(100);
      setSaved(false);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      setFilename(`${baseName || "image"}-edited`);
      if (file.type === "image/png") setFormat("png");
      else if (file.type === "image/webp") setFormat("webp");
      else setFormat("jpeg");
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError("This image is damaged or cannot be decoded by your browser.");
    };
    image.src = url;
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find(
        candidate => candidate.kind === "file" && SUPPORTED_TYPES.includes(candidate.type),
      );
      const file = item?.getAsFile();
      if (!file) return;
      event.preventDefault();
      const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      loadFile(new File([file], `pasted-image-${Date.now()}.${extension}`, { type: file.type }));
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadFile]);

  const renderCanvas = useCallback((canvas: HTMLCanvasElement, forExport = false) => {
    if (!loaded || !edit) return;
    const rotated = edit.rotation % 180 !== 0;
    canvas.width = rotated ? edit.height : edit.width;
    canvas.height = rotated ? edit.width : edit.height;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    if (forExport && format === "jpeg") {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((edit.rotation * Math.PI) / 180);
    context.scale(edit.flipX ? -1 : 1, edit.flipY ? -1 : 1);
    context.drawImage(loaded.element, -edit.width / 2, -edit.height / 2, edit.width, edit.height);
    context.restore();
  }, [background, edit, format, loaded]);

  useEffect(() => {
    if (previewCanvasRef.current) renderCanvas(previewCanvasRef.current);
  }, [renderCanvas]);

  const updateDimension = (axis: "width" | "height", rawValue: string) => {
    if (!edit || !loaded) return;
    const value = Math.max(1, Math.min(MAX_SIDE, Number.parseInt(rawValue, 10) || 1));
    let nextWidth = axis === "width" ? value : edit.width;
    let nextHeight = axis === "height" ? value : edit.height;
    if (aspectLocked) {
      const ratio = loaded.width / loaded.height;
      if (axis === "width") nextHeight = Math.max(1, Math.round(value / ratio));
      else nextWidth = Math.max(1, Math.round(value * ratio));
    }
    if (nextWidth * nextHeight > MAX_PIXELS) {
      setError("The requested resolution is too large. Keep the image below 64 megapixels.");
      return;
    }
    setError("");
    commitEdit({ ...edit, width: nextWidth, height: nextHeight });
  };

  const applyPreset = (percent: number) => {
    if (!loaded || !edit) return;
    commitEdit({
      ...edit,
      width: Math.max(1, Math.round(loaded.width * percent / 100)),
      height: Math.max(1, Math.round(loaded.height * percent / 100)),
    });
  };

  const rotate = (direction: -90 | 90) => {
    if (!edit) return;
    commitEdit({ ...edit, rotation: ((edit.rotation + direction + 360) % 360) as EditState["rotation"] });
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setEdit(history[nextIndex]);
    setSaved(false);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setEdit(history[nextIndex]);
    setSaved(false);
  };

  const reset = () => {
    if (!loaded) return;
    const next = initialEdit(loaded.width, loaded.height);
    setEdit(next);
    setHistory([next]);
    setHistoryIndex(0);
    setAspectLocked(true);
    setZoom(100);
    setSaved(false);
    setError("");
  };

  const removeImage = () => {
    if (loaded) URL.revokeObjectURL(loaded.url);
    loadedRef.current = null;
    setLoaded(null);
    setEdit(null);
    setHistory([]);
    setHistoryIndex(-1);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const exportImage = async () => {
    if (!loaded || !edit || isExporting) return;
    setIsExporting(true);
    setSaved(false);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      renderCanvas(canvas, true);
      const mime = `image/${format}`;
      let blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, mime, format === "png" ? undefined : quality / 100),
      );

      if (format === "webp" && (!blob || blob.type !== "image/webp")) {
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is unavailable.");
        const { encode } = await import("@jsquash/webp");
        const encoded = await encode(context.getImageData(0, 0, canvas.width, canvas.height), { quality });
        blob = new Blob([encoded], { type: mime });
      }
      if (!blob) throw new Error("The browser could not create the edited image.");

      const extension = format === "jpeg" ? "jpg" : format;
      const safeName = sanitizeFilename(filename) || "edited-image";
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `${safeName}.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The image could not be exported.");
    } finally {
      setIsExporting(false);
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadFile(file);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  if (!loaded || !edit) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 pb-12">
        <header className="mx-auto mb-8 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
            <ImageIcon className="h-4 w-4" aria-hidden="true" /> Browser-based image editor
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-black md:text-5xl">Edit an image in your browser</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">Resize, rotate, flip, and export JPG, PNG, or WebP files. Your image stays on your device.</p>
        </header>
        <div
          className={`mx-auto max-w-4xl rounded-3xl border-2 border-dashed p-10 text-center transition md:p-16 ${dragging ? "border-black bg-gray-200 shadow-md" : "border-gray-400 bg-gray-100 hover:border-gray-500 hover:bg-gray-200 hover:shadow-md"}`}
          onDragEnter={event => { event.preventDefault(); setDragging(true); }}
          onDragOver={event => event.preventDefault()}
          onDragLeave={event => { if (event.currentTarget === event.target) setDragging(false); }}
          onDrop={onDrop}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white">
            <Upload className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-black">Drop an image here</h2>
          <p className="mt-2 text-gray-600">or paste from your clipboard with Ctrl+V / ⌘V</p>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-7 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
            Choose image
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="sr-only" aria-label="Choose a JPG, PNG, or WebP image" />
          <p className="mt-5 text-sm text-gray-500">JPG, PNG, or WebP · One image · Up to 10 MB</p>
        </div>
        {error && <p role="alert" className="mx-auto mt-4 max-w-4xl rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">{error}</p>}
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-12">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Image Editor</p>
          <h1 className="mt-2 text-3xl font-bold text-black md:text-4xl">Make it fit, then save it</h1>
          <p className="mt-2 text-gray-600">All edits stay in your browser and remain non-destructive until export.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={undo} disabled={historyIndex <= 0} className={TOOL_BUTTON} aria-label="Undo"><Undo2 className="h-4 w-4" /> Undo</button>
          <button type="button" onClick={redo} disabled={historyIndex >= history.length - 1} className={TOOL_BUTTON} aria-label="Redo"><Redo2 className="h-4 w-4" /> Redo</button>
          <button type="button" onClick={reset} className={TOOL_BUTTON}><RefreshCcw className="h-4 w-4" /> Reset</button>
        </div>
      </header>

      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-black">{loaded.file.name}</p>
              <p className="text-xs text-gray-500">{loaded.width} × {loaded.height}px · {formatBytes(loaded.file.size)}</p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
              <button type="button" onClick={() => setZoom(value => Math.max(25, value - 25))} className="rounded-lg p-2 hover:bg-white" aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
              <button type="button" onClick={() => setZoom(100)} className="min-w-14 rounded-lg px-2 py-1.5 text-xs font-semibold hover:bg-white" aria-label="Reset zoom">{zoom}%</button>
              <button type="button" onClick={() => setZoom(value => Math.min(200, value + 25))} className="rounded-lg p-2 hover:bg-white" aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex min-h-[420px] items-center justify-center overflow-auto p-6 md:min-h-[620px]" style={CHECKER_STYLE}>
            <canvas ref={previewCanvasRef} className="h-auto max-w-none shadow-2xl" style={{ width: `${Math.max(1, outputDimensions.width) * zoom / 100}px`, maxWidth: zoom === 100 ? "100%" : "none" }} aria-label="Edited image preview" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3 text-sm">
            <span className="text-gray-600">Output: <strong className="text-black">{outputDimensions.width} × {outputDimensions.height}px</strong></span>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 font-semibold text-black hover:text-gray-600"><Upload className="h-4 w-4" /> Replace image</button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="sr-only" aria-label="Replace image" />
          </div>
        </div>

        <aside className="space-y-4">
          <div className={PANEL}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">Resize</h2>
              <button type="button" onClick={() => setAspectLocked(value => !value)} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${aspectLocked ? "bg-black text-white" : "bg-gray-100 text-gray-600"}`} aria-pressed={aspectLocked}>
                <Link2 className="h-3.5 w-3.5" /> {aspectLocked ? "Ratio locked" : "Ratio unlocked"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className={LABEL}>Width (px)<input className={INPUT} type="number" min="1" max={MAX_SIDE} value={edit.width} onChange={event => updateDimension("width", event.target.value)} /></label>
              <label className={LABEL}>Height (px)<input className={INPUT} type="number" min="1" max={MAX_SIDE} value={edit.height} onChange={event => updateDimension("height", event.target.value)} /></label>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map(percent => <button key={percent} type="button" onClick={() => applyPreset(percent)} className="rounded-lg border border-gray-200 py-2 text-xs font-semibold hover:border-black hover:bg-gray-50">{percent}%</button>)}
            </div>
          </div>

          <div className={PANEL}>
            <h2 className="mb-4 text-lg font-bold text-black">Rotate & flip</h2>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => rotate(-90)} className={`${TOOL_BUTTON} justify-center`}><RotateCcw className="h-4 w-4" /> Left 90°</button>
              <button type="button" onClick={() => rotate(90)} className={`${TOOL_BUTTON} justify-center`}><RotateCw className="h-4 w-4" /> Right 90°</button>
              <button type="button" onClick={() => commitEdit({ ...edit, flipX: !edit.flipX })} className={`${TOOL_BUTTON} justify-center`} aria-label="Flip horizontally"><FlipHorizontal2 className="h-4 w-4" /> Horizontal</button>
              <button type="button" onClick={() => commitEdit({ ...edit, flipY: !edit.flipY })} className={`${TOOL_BUTTON} justify-center`} aria-label="Flip vertically"><FlipVertical2 className="h-4 w-4" /> Vertical</button>
            </div>
          </div>

          <div className={PANEL}>
            <h2 className="mb-4 text-lg font-bold text-black">Export</h2>
            <label className={LABEL}>Format
              <select value={format} onChange={event => { setFormat(event.target.value as OutputFormat); setSaved(false); }} className={INPUT}>
                <option value="jpeg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option>
              </select>
            </label>
            {format !== "png" && <label className={`${LABEL} mt-4`}>Quality <span className="float-right font-semibold text-black">{quality}%</span><input type="range" min="1" max="100" value={quality} onChange={event => { setQuality(Number(event.target.value)); setSaved(false); }} className="mt-3 w-full accent-black" /></label>}
            {format === "jpeg" && <label className={`${LABEL} mt-4`}>Transparency background<div className="mt-2 flex items-center gap-3"><input type="color" value={background} onChange={event => { setBackground(event.target.value); setSaved(false); }} className="h-11 w-14 cursor-pointer rounded-lg border border-gray-200 bg-white p-1" aria-label="JPEG background color" /><input value={background} onChange={event => setBackground(event.target.value)} className={`${INPUT} mt-0 uppercase`} aria-label="JPEG background color value" /></div></label>}
            <label className={`${LABEL} mt-4`}>File name<div className="mt-2 flex items-center rounded-xl border border-gray-300 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black"><input value={filename} onChange={event => { setFilename(event.target.value); setSaved(false); }} className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-sm outline-none" aria-label="Output file name" /><span className="pr-3 text-sm text-gray-500">.{format === "jpeg" ? "jpg" : format}</span></div></label>
            <button type="button" onClick={exportImage} disabled={isExporting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400">
              {saved ? <Check className="h-5 w-5" /> : <Download className="h-5 w-5" />} {isExporting ? "Exporting…" : saved ? "Downloaded" : "Export image"}
            </button>
          </div>

          <button type="button" onClick={removeImage} className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-black"><X className="h-4 w-4" /> Remove image</button>
        </aside>
      </div>
    </section>
  );
}
