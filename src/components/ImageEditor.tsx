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
import { ChangeEvent, DragEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PageContainer from "@/components/site/page-container";
import ActionBar from "@/components/tool/action-bar";
import DropZone from "@/components/tool/drop-zone";
import ToolLayout from "@/components/tool/tool-layout";
import ToolPageHeader from "@/components/tool/tool-page-header";
import { takeHandoffIfRequested } from "@/lib/file-handoff";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_SIDE = 16384;
const MAX_PIXELS = 64_000_000;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const LABEL = "block text-sm font-semibold text-foreground";
const INPUT = "mt-2 h-11 w-full rounded-field border-2 border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";
const CHECKER_STYLE = {
  backgroundColor: "rgb(var(--muted))",
  backgroundImage: "linear-gradient(45deg, rgb(var(--border)) 25%, transparent 25%), linear-gradient(-45deg, rgb(var(--border)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(var(--border)) 75%), linear-gradient(-45deg, transparent 75%, rgb(var(--border)) 75%)",
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

export default function ImageEditor({ notice }: { notice?: ReactNode } = {}) {
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

  // A photo handed over from the EXIF viewer (?handoff=1) opens straight away.
  const handoffStarted = useRef(false);
  useEffect(() => {
    if (handoffStarted.current) return;
    handoffStarted.current = true;
    takeHandoffIfRequested().then(files => {
      if (files[0]) loadFile(files[0]);
    });
  }, [loadFile]);

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

  const header = (
    <ToolPageHeader
      crumb={["Tools", "Image Editor"]}
      title="Edit an image in your browser"
      intro="Resize, rotate, flip, and export JPG, PNG, or WebP files. Your image stays on your device."
      icon={ImageIcon}
      chips={[{ label: "JPG" }, { label: "PNG" }, { label: "WebP" }, { label: "One image · Up to 10 MB" }, { label: "Nothing uploaded", ok: true }]}
    >
      {notice}
    </ToolPageHeader>
  );

  const errorAlert = error && (
    <p role="alert" className="mb-4 rounded-field bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground">{error}</p>
  );

  if (!loaded || !edit) {
    return (
      <PageContainer className="pb-6">
        {header}
        <div className="mt-6">
          {errorAlert}
          <DropZone
            title="Drop an image here"
            note="or paste from your clipboard with Ctrl+V / ⌘V · JPG, PNG, or WebP · One image · Up to 10 MB"
            dragging={dragging}
            onDragEnter={event => { event.preventDefault(); setDragging(true); }}
            onDragOver={event => event.preventDefault()}
            onDragLeave={event => { if (event.currentTarget === event.target) setDragging(false); }}
            onDrop={onDrop}
            actions={<Button onClick={() => fileInputRef.current?.click()}>Choose image</Button>}
          >
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="sr-only" aria-label="Choose a JPG, PNG, or WebP image" />
          </DropZone>
        </div>
      </PageContainer>
    );
  }

  const iconButton = (label: string, icon: ReactNode, onClick: () => void, options: { disabled?: boolean; srOnly?: boolean } = {}) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={onClick}
          disabled={options.disabled}
          aria-label={options.srOnly ? undefined : label}
        >
          {icon}
          {options.srOnly && <span className="sr-only">{label}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );

  const main = (
    <Card data-tool-main className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{loaded.file.name}</p>
          <p className="text-xs text-muted-foreground">{loaded.width} × {loaded.height}px · {formatBytes(loaded.file.size)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <TooltipProvider delayDuration={300}>
            {iconButton("Undo", <Undo2 aria-hidden="true" />, undo, { disabled: historyIndex <= 0 })}
            {iconButton("Redo", <Redo2 aria-hidden="true" />, redo, { disabled: historyIndex >= history.length - 1 })}
            {iconButton("Reset", <RefreshCcw aria-hidden="true" />, reset)}
            {iconButton("Replace image", <Upload aria-hidden="true" />, () => fileInputRef.current?.click(), { srOnly: true })}
          </TooltipProvider>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center gap-0.5 rounded-full bg-muted p-1">
            <button type="button" onClick={() => setZoom(value => Math.max(25, value - 25))} className="rounded-full p-2 text-foreground hover:bg-card" aria-label="Zoom out"><ZoomOut className="h-4 w-4" aria-hidden="true" /></button>
            <button type="button" onClick={() => setZoom(100)} className="min-w-14 rounded-full px-2 py-1.5 text-xs font-bold text-foreground hover:bg-card" aria-label="Reset zoom">{zoom}%</button>
            <button type="button" onClick={() => setZoom(value => Math.min(200, value + 25))} className="rounded-full p-2 text-foreground hover:bg-card" aria-label="Zoom in"><ZoomIn className="h-4 w-4" aria-hidden="true" /></button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="sr-only" aria-label="Replace image" />
        </div>
      </div>
      <div className="flex min-h-[360px] items-center justify-center overflow-auto p-6 md:min-h-[560px]" style={CHECKER_STYLE}>
        <canvas ref={previewCanvasRef} className="h-auto max-w-none shadow-soft" style={{ width: `${Math.max(1, outputDimensions.width) * zoom / 100}px`, maxWidth: zoom === 100 ? "100%" : "none" }} aria-label="Edited image preview" />
      </div>
      <div className="px-4 py-3 text-sm">
        <span className="text-muted-foreground">Output: <strong className="text-foreground">{outputDimensions.width} × {outputDimensions.height}px</strong></span>
      </div>
    </Card>
  );

  const panel = (
    <Card data-tool-panel className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-h3">Resize</h2>
        <button type="button" onClick={() => setAspectLocked(value => !value)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${aspectLocked ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"}`} aria-pressed={aspectLocked}>
          <Link2 className="h-3.5 w-3.5" aria-hidden="true" /> {aspectLocked ? "Ratio locked" : "Ratio unlocked"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className={LABEL}>Width (px)<input className={INPUT} type="number" min="1" max={MAX_SIDE} value={edit.width} onChange={event => updateDimension("width", event.target.value)} /></label>
        <label className={LABEL}>Height (px)<input className={INPUT} type="number" min="1" max={MAX_SIDE} value={edit.height} onChange={event => updateDimension("height", event.target.value)} /></label>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {[25, 50, 75, 100].map(percent => <Button key={percent} type="button" variant="secondary" size="sm" className="px-0" onClick={() => applyPreset(percent)}>{percent}%</Button>)}
      </div>

      <Separator className="my-5" decorative={false} />
      <h2 className="mb-4 text-h3">Rotate & flip</h2>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => rotate(-90)}><RotateCcw aria-hidden="true" /> Left 90°</Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => rotate(90)}><RotateCw aria-hidden="true" /> Right 90°</Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => commitEdit({ ...edit, flipX: !edit.flipX })} aria-label="Flip horizontally"><FlipHorizontal2 aria-hidden="true" /> Horizontal</Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => commitEdit({ ...edit, flipY: !edit.flipY })} aria-label="Flip vertically"><FlipVertical2 aria-hidden="true" /> Vertical</Button>
      </div>

      <Separator className="my-5" decorative={false} />
      <h2 className="mb-4 text-h3">Export</h2>
      <label className={LABEL}>Format
        <select value={format} onChange={event => { setFormat(event.target.value as OutputFormat); setSaved(false); }} className={INPUT}>
          <option value="jpeg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option>
        </select>
      </label>
      {format !== "png" && <label className={`${LABEL} mt-4`}>Quality <span className="float-right font-bold text-foreground">{quality}%</span><input type="range" min="1" max="100" value={quality} onChange={event => { setQuality(Number(event.target.value)); setSaved(false); }} className="mt-3 w-full accent-primary" /></label>}
      {format === "jpeg" && <label className={`${LABEL} mt-4`}>Transparency background<div className="mt-2 flex items-center gap-3"><input type="color" value={background} onChange={event => { setBackground(event.target.value); setSaved(false); }} className="h-11 w-14 shrink-0 cursor-pointer rounded-field border-2 border-border bg-card p-1" aria-label="JPEG background color" /><input value={background} onChange={event => setBackground(event.target.value)} className={`${INPUT} mt-0 uppercase`} aria-label="JPEG background color value" /></div></label>}
      <label className={`${LABEL} mt-4`}>File name<div className="mt-2 flex items-center rounded-field border-2 border-border bg-card focus-within:ring-2 focus-within:ring-ring"><input value={filename} onChange={event => { setFilename(event.target.value); setSaved(false); }} className="h-10 min-w-0 flex-1 rounded-field bg-transparent px-3 text-sm text-foreground outline-none" aria-label="Output file name" /><span className="pr-3 text-sm text-muted-foreground">.{format === "jpeg" ? "jpg" : format}</span></div></label>
      <ActionBar className="mt-5">
        <Button size="lg" className="w-full" onClick={exportImage} disabled={isExporting}>
          {saved ? <Check aria-hidden="true" /> : <Download aria-hidden="true" />} {isExporting ? "Exporting…" : saved ? "Downloaded" : "Export image"}
        </Button>
      </ActionBar>
      <Button variant="ghost" className="mt-2 w-full" onClick={removeImage}><X aria-hidden="true" /> Remove image</Button>
    </Card>
  );

  return (
    <PageContainer className="pb-6">
      {header}
      <div className="mt-6">
        {errorAlert}
        <ToolLayout main={main} panel={panel} />
      </div>
    </PageContainer>
  );
}
