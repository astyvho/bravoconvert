"use client";

import Link from "next/link";
import { Camera, CheckCircle2, ChevronDown, Clock, Fingerprint, ImageIcon, MapPin, PenLine, ShieldAlert, Upload, User, X } from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { formatExifDate, readMetadata, type Metadata } from "@/lib/photo-metadata";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SAMPLE_URL = "/guides/exif-sample-with-metadata.jpg";

type Loaded = {
  file: File;
  url: string;
  meta: Metadata;
  width: number | null;
  height: number | null;
};

type Check = {
  id: string;
  label: string;
  icon: typeof MapPin;
  keys: string[];
  describe?: (meta: Metadata) => string | null;
};

const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

const coordinates = (meta: Metadata) => {
  const lat = num(meta.latitude);
  const lon = num(meta.longitude);
  return lat === null || lon === null ? null : { lat, lon };
};

// 사진을 공유할 때 개인을 특정할 수 있는 항목들. keys 중 하나라도 값이 있으면 "발견"으로 본다.
const CHECKS: Check[] = [
  {
    id: "location",
    label: "Location (GPS)",
    icon: MapPin,
    keys: ["latitude", "longitude", "GPSLatitude", "GPSLongitude"],
    describe: meta => {
      const point = coordinates(meta);
      return point ? `${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}` : "Present, but could not be converted to coordinates";
    },
  },
  {
    id: "time",
    label: "Date and time taken",
    icon: Clock,
    keys: ["DateTimeOriginal", "CreateDate", "DateTimeDigitized", "ModifyDate", "DateTime"],
    describe: meta => formatExifDate(meta.DateTimeOriginal ?? meta.CreateDate ?? meta.DateTimeDigitized ?? meta.ModifyDate ?? meta.DateTime),
  },
  {
    id: "device",
    label: "Camera or phone model",
    icon: Camera,
    keys: ["Make", "Model", "LensModel"],
    describe: meta => [meta.Make, meta.Model].filter(value => typeof value === "string" && value.trim()).join(" ") || String(meta.LensModel ?? ""),
  },
  {
    id: "serial",
    label: "Device serial number",
    icon: Fingerprint,
    keys: ["BodySerialNumber", "SerialNumber", "LensSerialNumber", "InternalSerialNumber"],
  },
  {
    id: "person",
    label: "Owner or author name",
    icon: User,
    keys: ["Artist", "OwnerName", "CameraOwnerName", "Copyright", "creator", "byline"],
  },
  {
    id: "software",
    label: "Editing software",
    icon: PenLine,
    keys: ["Software", "HostComputer", "CreatorTool"],
  },
];

const hasValue = (value: unknown) => value !== undefined && value !== null && !(typeof value === "string" && value.trim() === "");

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

function show(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof ArrayBuffer) return `binary data (${value.byteLength} bytes)`;
  if (ArrayBuffer.isView(value)) return `binary data (${value.byteLength} bytes)`;
  if (Array.isArray(value)) return value.map(show).join(", ");
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6)));
  if (typeof value === "object") return JSON.stringify(value);
  return formatExifDate(value) ?? String(value);
}

const SETTINGS: Array<[string, (meta: Metadata) => string | null]> = [
  ["Exposure", meta => { const t = num(meta.ExposureTime); return t === null ? null : t >= 1 ? `${t} s` : `1/${Math.round(1 / t)} s`; }],
  ["Aperture", meta => { const f = num(meta.FNumber); return f === null ? null : `f/${f}`; }],
  ["ISO", meta => (hasValue(meta.ISO) ? show(meta.ISO) : null)],
  ["Focal length", meta => { const f = num(meta.FocalLength); const eq = num(meta.FocalLengthIn35mmFormat); return f === null ? null : `${f} mm${eq ? ` (${eq} mm equivalent)` : ""}`; }],
  ["Lens", meta => (hasValue(meta.LensModel) ? show(meta.LensModel) : null)],
  ["Flash", meta => (hasValue(meta.Flash) ? show(meta.Flash) : null)],
  ["Orientation flag", meta => (hasValue(meta.Orientation) ? show(meta.Orientation) : null)],
];

export default function ExifViewer() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const setUrl = (url: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = url;
  };
  useEffect(() => () => setUrl(null), []);

  const open = async (file: File) => {
    setError(null);
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`This image is larger than ${formatBytes(MAX_FILE_SIZE)}.`);
      return;
    }
    setBusy(true);
    try {
      const meta = await readMetadata(new Uint8Array(await file.arrayBuffer()));
      const url = URL.createObjectURL(file);
      setUrl(url);
      setShowAll(false);
      setLoaded({ file, url, meta, width: null, height: null });
    } catch {
      setError("The metadata in this image could not be read. The file may be damaged.");
    } finally {
      setBusy(false);
    }
  };

  const openSample = async () => {
    setBusy(true);
    try {
      const blob = await (await fetch(SAMPLE_URL)).blob();
      await open(new File([blob], "sample-photo-with-gps.jpg", { type: "image/jpeg" }));
    } catch {
      setError("The sample photo could not be loaded.");
      setBusy(false);
    }
  };

  const clear = () => {
    setUrl(null);
    setLoaded(null);
    setError(null);
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) open(file);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) open(file);
  };

  const meta = loaded?.meta ?? {};
  const results = CHECKS.map(check => {
    const found = check.keys.some(key => hasValue(meta[key]));
    const detail = found ? (check.describe?.(meta) || check.keys.filter(key => hasValue(meta[key])).map(key => show(meta[key])).join(" · ")) : null;
    return { ...check, found, detail };
  });
  const foundCount = results.filter(result => result.found).length;
  const point = coordinates(meta);
  const settings = SETTINGS.map(([label, read]) => [label, read(meta)] as const).filter(([, value]) => value);
  const allFields = Object.entries(meta).filter(([, value]) => hasValue(value));

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-12">
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
          <ImageIcon className="h-4 w-4" aria-hidden="true" /> Private photo metadata check
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-black md:text-5xl">EXIF viewer</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">See what a photo reveals before you share it — location, time, device, and more. The photo is read on your device and never uploaded.</p>
      </header>

      {!loaded && (
        <div
          className={`mx-auto max-w-4xl rounded-3xl border-2 border-dashed p-10 text-center transition md:p-14 ${dragging ? "border-black bg-gray-200 shadow-md" : "border-gray-400 bg-gray-100 hover:border-gray-500 hover:bg-gray-200 hover:shadow-md"}`}
          onDragEnter={event => { event.preventDefault(); setDragging(true); }}
          onDragOver={event => event.preventDefault()}
          onDragLeave={event => { if (event.currentTarget === event.target) setDragging(false); }}
          onDrop={onDrop}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white">
            <Upload className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-black">Drop a photo here</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50">
              {busy ? "Reading…" : "Choose a photo"}
            </button>
            <button type="button" onClick={openSample} disabled={busy} className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-black transition hover:border-gray-500 disabled:opacity-50">
              Try a sample photo
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onInput} className="sr-only" aria-label="Choose a JPG, PNG, or WebP photo" />
          <p className="mt-5 text-sm text-gray-500">JPG, PNG, or WebP · Up to {formatBytes(MAX_FILE_SIZE)} · The sample contains made-up camera details and a public landmark&apos;s coordinates</p>
        </div>
      )}

      {error && <p role="alert" className="mx-auto mt-4 max-w-4xl rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">{error}</p>}

      {loaded && (
        <div className="space-y-6">
          <div className="flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={loaded.url}
              alt="Preview of the selected photo"
              className="h-40 w-full rounded-2xl bg-gray-100 object-contain md:w-56"
              onLoad={event => { const image = event.currentTarget; setLoaded(current => current && { ...current, width: image.naturalWidth, height: image.naturalHeight }); }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-black">{loaded.file.name}</p>
                  <p className="text-sm text-gray-500">{formatBytes(loaded.file.size)}{loaded.width ? ` · ${loaded.width} × ${loaded.height}px` : ""}</p>
                </div>
                <button type="button" onClick={clear} className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-black hover:bg-gray-50">
                  <X className="h-4 w-4" aria-hidden="true" /> Check another
                </button>
              </div>
              <p className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${foundCount ? "bg-amber-50 text-amber-900" : "bg-green-50 text-green-800"}`}>
                {foundCount ? <ShieldAlert className="h-5 w-5 flex-shrink-0" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />}
                {foundCount
                  ? `This photo carries ${foundCount} kind${foundCount === 1 ? "" : "s"} of identifying information.`
                  : "No identifying metadata found in this file."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-black">Privacy check</h2>
            <ul className="mt-4 divide-y divide-gray-100">
              {results.map(result => (
                <li key={result.id} className="flex items-start gap-3 py-3" data-check={result.id}>
                  <result.icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${result.found ? "text-amber-600" : "text-gray-400"}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-black">{result.label}</p>
                    <p className={`break-words text-sm ${result.found ? "text-gray-800" : "text-gray-500"}`}>{result.found ? result.detail : "Not found"}</p>
                    {result.id === "location" && point && (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${point.lat.toFixed(5)}&mlon=${point.lon.toFixed(5)}#map=16/${point.lat.toFixed(5)}/${point.lon.toFixed(5)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm font-medium text-black underline"
                      >
                        Show on OpenStreetMap
                      </a>
                    )}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${result.found ? "bg-amber-100 text-amber-900" : "bg-gray-100 text-gray-600"}`}>{result.found ? "Found" : "None"}</span>
                </li>
              ))}
            </ul>
            {point && <p className="mt-2 text-xs text-gray-500">Opening the map sends these coordinates to openstreetmap.org. Nothing is sent unless you click it.</p>}
          </div>

          {foundCount > 0 && (
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
              <h2 className="text-lg font-bold text-black">Removing it before you share</h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                The <Link href="/convert/img/" className="font-medium text-black underline">Image Converter</Link> and the <Link href="/edit/image/" className="font-medium text-black underline">Image Editor</Link> both rebuild the picture from its pixels, so none of the fields above are copied into the new file. The Image Converter reads the rotation flag and applies it to the pixels first, so a phone photo still faces the right way once the flag is gone. Run the result back through this viewer to confirm.
              </p>
            </div>
          )}

          {settings.length > 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-black">Camera settings</h2>
              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {settings.map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-gray-50 px-4 py-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-black">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {allFields.length > 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <button type="button" onClick={() => setShowAll(value => !value)} aria-expanded={showAll} className="flex w-full items-center justify-between text-left">
                <h2 className="text-lg font-bold text-black">All {allFields.length} fields</h2>
                <ChevronDown className={`h-5 w-5 transition-transform ${showAll ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {showAll && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <tbody>
                      {allFields.map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-100 align-top">
                          <th className="py-2 pr-4 font-medium text-gray-600">{key}</th>
                          <td className="break-all py-2 text-black">{show(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
