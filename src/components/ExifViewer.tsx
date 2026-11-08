"use client";

import Link from "next/link";
import { Camera, CheckCircle2, ChevronDown, Clock, Download, Eraser, Fingerprint, ImageIcon, MapPin, PenLine, ShieldAlert, Upload, User, X } from "lucide-react";
import { ChangeEvent, DragEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { formatExifDate, readMetadata, type Metadata } from "@/lib/photo-metadata";
import type { Locale } from "@/lib/locale";

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
  label: Record<Locale, string>;
  icon: typeof MapPin;
  keys: string[];
  describe?: (meta: Metadata, t: Strings) => string | null;
};

// 화면 문구. 영어가 기본이며 /ko/view/exif/ 에서만 한국어를 쓴다.
const STRINGS = {
  en: {
    badge: "Private photo metadata check",
    title: "EXIF viewer",
    intro: "See what a photo reveals before you share it — location, time, device, and more. The photo is read on your device and never uploaded.",
    drop: "Drop a photo here",
    reading: "Reading…",
    choose: "Choose a photo",
    sample: "Try a sample photo",
    inputLabel: "Choose a JPG, PNG, or WebP photo",
    limits: (max: string) => `JPG, PNG, or WebP · Up to ${max} · The sample contains made-up camera details and a public landmark's coordinates`,
    wrongType: "Choose a JPG, PNG, or WebP image.",
    tooLarge: (max: string) => `This image is larger than ${max}.`,
    unreadable: "The metadata in this image could not be read. The file may be damaged.",
    sampleFailed: "The sample photo could not be loaded.",
    previewAlt: "Preview of the selected photo",
    another: "Check another",
    foundSummary: (n: number) => `This photo carries ${n} kind${n === 1 ? "" : "s"} of identifying information.`,
    noneSummary: "No identifying metadata found in this file.",
    checkTitle: "Privacy check",
    notFound: "Not found",
    map: "Show on OpenStreetMap",
    found: "Found",
    none: "None",
    mapNote: "Opening the map sends these coordinates to openstreetmap.org. Nothing is sent unless you click it.",
    noCoordinates: "Present, but could not be converted to coordinates",
    converter: "Image Converter",
    editor: "Image Editor",
    cleanTitle: "Remove it before you share",
    cleanBody: "Make a copy of this photo that keeps only the picture. It is redrawn from its pixels in your browser, turned the right way up first, and saved in the same format — so none of the fields above go with it.",
    cleanButton: "Download a clean copy",
    jumpToClean: "Remove it",
    formatLabel: "Save as",
    sameFormat: (ext: string) => `Same as original (${ext})`,
    jpgNote: "JPG has no transparency; transparent areas become white.",
    cleaning: "Cleaning…",
    cleanFailed: "The clean copy could not be made in this browser. Try the Image Converter instead.",
    cleanedOk: "The clean copy was checked again: no identifying information found.",
    cleanedLeft: (n: number) => `The clean copy was checked again and still carries ${n} kind${n === 1 ? "" : "s"} of identifying information.`,
    cleanedSaved: (name: string, size: string) => `Saved as ${name} (${size}).`,
    downloadAgain: "Download again",
    cleanMore: (converter: ReactNode, editor: ReactNode) => (
      <>Several photos at once, a target file size, or a PDF? The {converter} handles batches, and the {editor} resizes and rotates. Both remove the same information.</>
    ),
    settingsTitle: "Camera settings",
    allFields: (n: number) => `All ${n} fields`,
    binary: (n: number) => `binary data (${n} bytes)`,
    equivalent: (mm: number) => ` (${mm} mm equivalent)`,
    settingLabels: { exposure: "Exposure", aperture: "Aperture", iso: "ISO", focal: "Focal length", lens: "Lens", flash: "Flash", orientation: "Orientation flag" },
  },
  ko: {
    badge: "업로드 없는 사진 메타데이터 확인",
    title: "EXIF 뷰어",
    intro: "사진을 보내기 전에 촬영 위치, 시간, 기기 같은 숨은 정보가 들어 있는지 확인하세요. 사진은 내 기기 안에서만 읽히고 어디에도 업로드되지 않습니다.",
    drop: "여기에 사진을 끌어다 놓으세요",
    reading: "읽는 중…",
    choose: "사진 선택",
    sample: "샘플 사진으로 해보기",
    inputLabel: "JPG, PNG, WebP 사진 선택",
    limits: (max: string) => `JPG, PNG, WebP · 최대 ${max} · 샘플에는 가상의 카메라 정보와 공공장소 좌표가 들어 있습니다`,
    wrongType: "JPG, PNG, WebP 이미지만 확인할 수 있습니다.",
    tooLarge: (max: string) => `${max}보다 큰 이미지는 확인할 수 없습니다.`,
    unreadable: "이 이미지의 메타데이터를 읽지 못했습니다. 파일이 손상되었을 수 있습니다.",
    sampleFailed: "샘플 사진을 불러오지 못했습니다.",
    previewAlt: "선택한 사진 미리보기",
    another: "다른 사진 확인",
    foundSummary: (n: number) => `이 사진에는 신원을 드러낼 수 있는 정보가 ${n}종류 들어 있습니다.`,
    noneSummary: "이 파일에서는 신원을 드러낼 메타데이터를 찾지 못했습니다.",
    checkTitle: "개인정보 점검",
    notFound: "없음",
    map: "OpenStreetMap에서 보기",
    found: "발견",
    none: "없음",
    mapNote: "지도를 열면 이 좌표가 openstreetmap.org로 전송됩니다. 누르지 않으면 아무것도 전송되지 않습니다.",
    noCoordinates: "값은 있지만 좌표로 변환할 수 없습니다",
    converter: "이미지 변환기(영문)",
    editor: "이미지 편집기(영문)",
    cleanTitle: "공유하기 전에 지우기",
    cleanBody: "그림만 남긴 사본을 만듭니다. 브라우저 안에서 픽셀을 새로 그려 같은 형식으로 저장하고, 회전도 미리 바로잡기 때문에 위 항목은 하나도 따라가지 않습니다.",
    cleanButton: "정보를 지운 사본 받기",
    jumpToClean: "바로 지우기",
    formatLabel: "저장 형식",
    sameFormat: (ext: string) => `원본과 같게 (${ext})`,
    jpgNote: "JPG는 투명 배경을 지원하지 않아 투명한 부분이 흰색이 됩니다.",
    cleaning: "지우는 중…",
    cleanFailed: "이 브라우저에서는 사본을 만들지 못했습니다. 이미지 변환기를 이용해 주세요.",
    cleanedOk: "받은 사본을 다시 검사했습니다. 신원을 드러낼 정보가 남아 있지 않습니다.",
    cleanedLeft: (n: number) => `받은 사본을 다시 검사했더니 아직 ${n}종류의 정보가 남아 있습니다.`,
    cleanedSaved: (name: string, size: string) => `${name} (${size})로 저장했습니다.`,
    downloadAgain: "다시 받기",
    cleanMore: (converter: ReactNode, editor: ReactNode) => (
      <>여러 장을 한꺼번에 처리하거나, 목표 용량을 정하거나, PDF로 묶으려면 {converter}를, 크기 조절과 회전은 {editor}를 쓰세요. 둘 다 같은 정보를 지웁니다.</>
    ),
    settingsTitle: "촬영 설정",
    allFields: (n: number) => `전체 필드 ${n}개`,
    binary: (n: number) => `바이너리 데이터 (${n}바이트)`,
    equivalent: (mm: number) => ` (35mm 환산 ${mm} mm)`,
    settingLabels: { exposure: "셔터 속도", aperture: "조리개", iso: "ISO", focal: "초점 거리", lens: "렌즈", flash: "플래시", orientation: "회전 정보" },
  },
};
type Strings = (typeof STRINGS)["en"];

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
    label: { en: "Location (GPS)", ko: "위치 (GPS)" },
    icon: MapPin,
    keys: ["latitude", "longitude", "GPSLatitude", "GPSLongitude"],
    describe: (meta, t) => {
      const point = coordinates(meta);
      return point ? `${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}` : t.noCoordinates;
    },
  },
  {
    id: "time",
    label: { en: "Date and time taken", ko: "촬영 날짜와 시간" },
    icon: Clock,
    keys: ["DateTimeOriginal", "CreateDate", "DateTimeDigitized", "ModifyDate", "DateTime"],
    describe: meta => formatExifDate(meta.DateTimeOriginal ?? meta.CreateDate ?? meta.DateTimeDigitized ?? meta.ModifyDate ?? meta.DateTime),
  },
  {
    id: "device",
    label: { en: "Camera or phone model", ko: "카메라·휴대폰 모델" },
    icon: Camera,
    keys: ["Make", "Model", "LensModel"],
    describe: meta => [meta.Make, meta.Model].filter(value => typeof value === "string" && value.trim()).join(" ") || String(meta.LensModel ?? ""),
  },
  {
    id: "serial",
    label: { en: "Device serial number", ko: "기기 일련번호" },
    icon: Fingerprint,
    keys: ["BodySerialNumber", "SerialNumber", "LensSerialNumber", "InternalSerialNumber"],
  },
  {
    id: "person",
    label: { en: "Owner or author name", ko: "소유자·작성자 이름" },
    icon: User,
    keys: ["Artist", "OwnerName", "CameraOwnerName", "Copyright", "creator", "byline"],
  },
  {
    id: "software",
    label: { en: "Editing software", ko: "편집 프로그램" },
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

function show(value: unknown, t: Strings = STRINGS.en): string {
  if (value === null || value === undefined) return "";
  if (value instanceof ArrayBuffer) return t.binary(value.byteLength);
  if (ArrayBuffer.isView(value)) return t.binary(value.byteLength);
  if (Array.isArray(value)) return value.map(item => show(item, t)).join(", ");
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6)));
  if (typeof value === "object") return JSON.stringify(value);
  return formatExifDate(value) ?? String(value);
}

const SETTINGS: Array<[keyof Strings["settingLabels"], (meta: Metadata, t: Strings) => string | null]> = [
  ["exposure", meta => { const t = num(meta.ExposureTime); return t === null ? null : t >= 1 ? `${t} s` : `1/${Math.round(1 / t)} s`; }],
  ["aperture", meta => { const f = num(meta.FNumber); return f === null ? null : `f/${f}`; }],
  ["iso", meta => (hasValue(meta.ISO) ? show(meta.ISO) : null)],
  ["focal", (meta, t) => { const f = num(meta.FocalLength); const eq = num(meta.FocalLengthIn35mmFormat); return f === null ? null : `${f} mm${eq ? t.equivalent(eq) : ""}`; }],
  ["lens", meta => (hasValue(meta.LensModel) ? show(meta.LensModel) : null)],
  ["flash", meta => (hasValue(meta.Flash) ? show(meta.Flash) : null)],
  ["orientation", meta => (hasValue(meta.Orientation) ? show(meta.Orientation) : null)],
];

type Cleaned = { url: string; name: string; size: number; remaining: number };

const findCount = (meta: Metadata) => CHECKS.filter(check => check.keys.some(key => hasValue(meta[key]))).length;

// 이미지 변환기와 같은 원리: 픽셀만 다시 그려 인코딩하므로 원본 메타데이터가 복사되지 않는다.
// imageOrientation "from-image" 로 EXIF 회전을 픽셀에 먼저 적용한다.
const FORMATS = [
  { type: "image/jpeg", label: "JPG", ext: ".jpg" },
  { type: "image/png", label: "PNG", ext: ".png" },
  { type: "image/webp", label: "WebP", ext: ".webp" },
] as const;
type OutputType = (typeof FORMATS)[number]["type"];

async function makeCleanCopy(file: File, type: string): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  if (type === "image/jpeg") {
    // JPG 에는 투명도가 없으므로 흰 배경을 먼저 깐다.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, type === "image/png" ? undefined : 0.92));
  if (!blob || blob.type !== type) throw new Error("Encoding failed");
  return blob;
}

const cleanName = (name: string, type: string) => {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const sameType = FORMATS.find(format => format.type === type)?.ext ?? "";
  // 형식이 그대로면 원래 확장자(.jpeg, .jfif 등)를 유지한다.
  const original = dot > 0 ? name.slice(dot) : "";
  return `${base}-clean${type === "keep" ? original : sameType}`;
};

export default function ExifViewer({ locale = "en" }: { locale?: Locale }) {
  const t = STRINGS[locale];
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);
  const [cleaned, setCleaned] = useState<Cleaned | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanError, setCleanError] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<OutputType | "keep">("keep");
  const cleanUrlRef = useRef<string | null>(null);

  const setCleanUrl = (url: string | null) => {
    if (cleanUrlRef.current) URL.revokeObjectURL(cleanUrlRef.current);
    cleanUrlRef.current = url;
  };
  useEffect(() => () => setCleanUrl(null), []);

  const resetClean = () => {
    setCleanUrl(null);
    setCleaned(null);
    setCleanError(null);
  };

  const download = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const clean = async () => {
    if (!loaded) return;
    setCleaning(true);
    setCleanError(null);
    try {
      const type = outputType === "keep" ? loaded.file.type : outputType;
      const blob = await makeCleanCopy(loaded.file, type);
      // 만든 사본을 같은 파서로 다시 읽어, 실제로 지워졌는지 화면에 보여 준다.
      const remaining = findCount(await readMetadata(new Uint8Array(await blob.arrayBuffer())));
      const url = URL.createObjectURL(blob);
      setCleanUrl(url);
      const name = cleanName(loaded.file.name, outputType === "keep" || outputType === loaded.file.type ? "keep" : type);
      setCleaned({ url, name, size: blob.size, remaining });
      download(url, name);
    } catch {
      setCleanError(t.cleanFailed);
    } finally {
      setCleaning(false);
    }
  };

  const setUrl = (url: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = url;
  };
  useEffect(() => () => setUrl(null), []);

  const open = async (file: File) => {
    setError(null);
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError(t.wrongType);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t.tooLarge(formatBytes(MAX_FILE_SIZE)));
      return;
    }
    setBusy(true);
    try {
      const meta = await readMetadata(new Uint8Array(await file.arrayBuffer()));
      const url = URL.createObjectURL(file);
      setUrl(url);
      setShowAll(false);
      resetClean();
      setOutputType("keep");
      setLoaded({ file, url, meta, width: null, height: null });
    } catch {
      setError(t.unreadable);
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
      setError(t.sampleFailed);
      setBusy(false);
    }
  };

  const clear = () => {
    setUrl(null);
    setLoaded(null);
    setError(null);
    resetClean();
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
    const detail = found ? (check.describe?.(meta, t) || check.keys.filter(key => hasValue(meta[key])).map(key => show(meta[key], t)).join(" · ")) : null;
    return { ...check, label: check.label[locale], found, detail };
  });
  const foundCount = results.filter(result => result.found).length;
  const point = coordinates(meta);
  const settings = SETTINGS.map(([key, read]) => [t.settingLabels[key], read(meta, t)] as const).filter(([, value]) => value);
  const allFields = Object.entries(meta).filter(([, value]) => hasValue(value));

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-12">
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
          <ImageIcon className="h-4 w-4" aria-hidden="true" /> {t.badge}
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-black md:text-5xl">{t.title}</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">{t.intro}</p>
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
          <h2 className="mt-6 text-2xl font-bold text-black">{t.drop}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50">
              {busy ? t.reading : t.choose}
            </button>
            <button type="button" onClick={openSample} disabled={busy} className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-black transition hover:border-gray-500 disabled:opacity-50">
              {t.sample}
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onInput} className="sr-only" aria-label={t.inputLabel} />
          <p className="mt-5 text-sm text-gray-500">{t.limits(formatBytes(MAX_FILE_SIZE))}</p>
        </div>
      )}

      {error && <p role="alert" className="mx-auto mt-4 max-w-4xl rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">{error}</p>}

      {loaded && (
        <div className="space-y-6">
          <div className="flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={loaded.url}
              alt={t.previewAlt}
              className="h-40 w-full rounded-2xl bg-gray-100 object-contain md:w-56"
              onLoad={event => { const image = event.currentTarget; setLoaded(current => current && { ...current, width: image.naturalWidth, height: image.naturalHeight }); }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-black">{loaded.file.name}</p>
                  <p className="text-sm text-gray-500">{formatBytes(loaded.file.size)}{loaded.width ? ` · ${loaded.width} × ${loaded.height}px` : ""}</p>
                </div>
                <button type="button" onClick={clear} className="inline-flex flex-shrink-0 whitespace-nowrap items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-black hover:bg-gray-50">
                  <X className="h-4 w-4" aria-hidden="true" /> {t.another}
                </button>
              </div>
              <p className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${foundCount ? "bg-amber-50 text-amber-900" : "bg-green-50 text-green-800"}`}>
                {foundCount ? <ShieldAlert className="h-5 w-5 flex-shrink-0" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />}
                <span className="flex-1">{foundCount ? t.foundSummary(foundCount) : t.noneSummary}</span>
                {foundCount > 0 && (
                  <button
                    type="button"
                    onClick={() => document.getElementById("clean-copy")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    className="flex-shrink-0 whitespace-nowrap rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
                  >
                    {t.jumpToClean}
                  </button>
                )}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-black">{t.checkTitle}</h2>
            <ul className="mt-4 divide-y divide-gray-100">
              {results.map(result => (
                <li key={result.id} className="flex items-start gap-3 py-3" data-check={result.id}>
                  <result.icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${result.found ? "text-amber-600" : "text-gray-400"}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-black">{result.label}</p>
                    <p className={`break-words text-sm ${result.found ? "text-gray-800" : "text-gray-500"}`}>{result.found ? result.detail : t.notFound}</p>
                    {result.id === "location" && point && (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${point.lat.toFixed(5)}&mlon=${point.lon.toFixed(5)}#map=16/${point.lat.toFixed(5)}/${point.lon.toFixed(5)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm font-medium text-black underline"
                      >
                        {t.map}
                      </a>
                    )}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${result.found ? "bg-amber-100 text-amber-900" : "bg-gray-100 text-gray-600"}`}>{result.found ? t.found : t.none}</span>
                </li>
              ))}
            </ul>
            {point && <p className="mt-2 text-xs text-gray-500">{t.mapNote}</p>}
          </div>

          {foundCount > 0 && (
            <div id="clean-copy" className="scroll-mt-32 rounded-3xl border-2 border-black bg-white p-5 shadow-sm" data-clean>
              <h2 className="flex items-center gap-2 text-lg font-bold text-black">
                <Eraser className="h-5 w-5 flex-shrink-0" aria-hidden="true" /> {t.cleanTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">{t.cleanBody}</p>
              <fieldset className="mt-4">
                <legend className="mb-2 text-sm font-semibold text-black">{t.formatLabel}</legend>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "keep" as const, label: t.sameFormat(FORMATS.find(format => format.type === loaded.file.type)?.label ?? "") },
                    ...FORMATS.filter(format => format.type !== loaded.file.type).map(format => ({ value: format.type, label: format.label })),
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition ${outputType === option.value ? "border-black bg-black text-white" : "border-gray-300 bg-white text-black hover:border-gray-500"}`}
                    >
                      <input
                        type="radio"
                        name="clean-format"
                        value={option.value}
                        checked={outputType === option.value}
                        onChange={() => { setOutputType(option.value); resetClean(); }}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {outputType === "image/jpeg" && loaded.file.type !== "image/jpeg" && <p className="mt-2 text-xs text-gray-500">{t.jpgNote}</p>}
              </fieldset>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={clean}
                  disabled={cleaning}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  {cleaning ? t.cleaning : t.cleanButton}
                </button>
                {cleaned && (
                  <button type="button" onClick={() => download(cleaned.url, cleaned.name)} className="text-sm font-medium text-black underline">
                    {t.downloadAgain}
                  </button>
                )}
              </div>
              {cleaned && (
                <p role="status" className={`mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${cleaned.remaining ? "bg-amber-50 text-amber-900" : "bg-green-50 text-green-800"}`}>
                  {cleaned.remaining ? <ShieldAlert className="h-5 w-5 flex-shrink-0" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />}
                  <span>
                    {cleaned.remaining ? t.cleanedLeft(cleaned.remaining) : t.cleanedOk} {t.cleanedSaved(cleaned.name, formatBytes(cleaned.size))}
                  </span>
                </p>
              )}
              {cleanError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{cleanError}</p>}
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {t.cleanMore(
                  <Link href="/convert/img/" className="font-medium text-black underline">{t.converter}</Link>,
                  <Link href="/edit/image/" className="font-medium text-black underline">{t.editor}</Link>,
                )}
              </p>
            </div>
          )}

          {settings.length > 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-black">{t.settingsTitle}</h2>
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
                <h2 className="text-lg font-bold text-black">{t.allFields(allFields.length)}</h2>
                <ChevronDown className={`h-5 w-5 transition-transform ${showAll ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {showAll && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <tbody>
                      {allFields.map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-100 align-top">
                          <th className="py-2 pr-4 font-medium text-gray-600">{key}</th>
                          <td className="break-all py-2 text-black">{show(value, t)}</td>
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
