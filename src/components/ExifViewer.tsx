"use client";

import Link from "next/link";
import { Camera, CheckCircle2, ChevronDown, Clock, Download, Eraser, Fingerprint, ImageIcon, MapPin, PenLine, Plus, RotateCcw, Share2, ShieldAlert, Upload, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { formatExifDate, readMetadata, type Metadata } from "@/lib/photo-metadata";
import type { Locale } from "@/lib/locale";
import { HANDOFF_PARAM, putHandoff, takeHandoff, withHandoff } from "@/lib/file-handoff";

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
    intro: "See whether a photo carries the place, time and device it was taken with — and remove them in one click.",
    drop: "Drop one or more photos here",
    reading: "Reading…",
    choose: "Choose a photo",
    sample: "Try a sample photo",
    inputLabel: "Choose a JPG, PNG, or WebP photo",
    limits: (max: string) => `JPG, PNG or WebP · up to ${max} each`,
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
    mapNote: "The map opens on openstreetmap.org, which then receives these coordinates.",
    noCoordinates: "Present, but could not be converted to coordinates",
    converter: "Image Converter",
    toolQuery: "?from=exif",
    editor: "Image Editor",
    cleanTitle: "Need more than a clean copy?",
    jumpToClean: "Remove it now",
    jumpHint: "Your original file is not changed.",
    pickTitle: "Save the clean copy as",
    sameAsOriginal: "same as the original",
    formatNotes: { "image/jpeg": "Works everywhere; best for sharing photos", "image/png": "No quality loss; larger file", "image/webp": "Smallest file; a few apps cannot open it" } as Record<OutputType, string>,
    saveAs: (label: string) => `Clean copy as ${label}`,
    verifyFailed: "The clean copy was saved, but it could not be checked again here. Open it in this viewer to confirm.",
    jpgNote: "JPG has no transparency; transparent areas become white.",
    cleaning: "Cleaning…",
    cleanFailed: "The clean copy could not be made in this browser. Try the Image Converter instead.",
    cleanedOk: "The clean copy was checked again: no identifying information found.",
    cleanedLeft: (n: number) => `The clean copy was checked again and still carries ${n} kind${n === 1 ? "" : "s"} of identifying information.`,
    cleanedSaved: (name: string, size: string) => `Saved as ${name} (${size}).`,
    downloadAgain: "Download again",
    share: "Share",
    otherFormat: "Another format",
    removedInCopy: "Removed in copy",
    noneNext: "You can share it as it is. Still look at the picture itself: street signs, faces and screens are not metadata.",
    inAppHint: "This app's built-in browser may not save downloads. Press and hold an image below to save it.",
    shrink: "Shrink the long side to 2048 px (smaller file)",
    keepAll: "Each in its own format",
    keepAllNote: "JPG stays JPG, PNG stays PNG, WebP stays WebP",
    batchSummary: (n: number, m: number) => `${n} photos · ${m} carry identifying information`,
    cleanAll: "Remove from all",
    cleaningN: (i: number, n: number) => `Cleaning ${i} of ${n}…`,
    batchDone: (n: number, left: number) => (left === 0 ? `All ${n} clean copies were checked again: no identifying information found.` : `${left} of ${n} clean copies still carry identifying information.`),
    batchFailed: (n: number) => `${n} photo${n === 1 ? "" : "s"} could not be cleaned in this browser and ${n === 1 ? "was" : "were"} left out.`,
    addMore: "Add photos",
    skipped: (n: number, max: string) => `${n} file${n === 1 ? " was" : "s were"} skipped: only JPG, PNG or WebP up to ${max}.`,
    tooMany: (max: number) => `Up to ${max} photos at a time; the rest were skipped.`,
    unreadableN: (n: number) => `${n} file${n === 1 ? "" : "s"} could not be read and ${n === 1 ? "was" : "were"} skipped.`,
    savedSeparately: (n: number) => `They could not be bundled into a ZIP here, so the ${n} files were downloaded one by one.`,
    rowFound: (n: number) => `${n} found`,
    rowCleaned: "Cleaned",
    listLabel: "Photos you added",
    cleanMore: (converter: ReactNode, editor: ReactNode) => (
      <>Need a target file size or one PDF of these photos? The {converter} takes them as they are, and the {editor} resizes and rotates this one. Both remove the same information.</>
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
    intro: "사진에 찍은 장소·시간·기기 정보가 들어 있는지 확인하고, 한 번에 지웁니다.",
    drop: "여기에 사진을 끌어다 놓으세요 (여러 장 가능)",
    reading: "읽는 중…",
    choose: "사진 선택",
    sample: "샘플 사진으로 해보기",
    inputLabel: "JPG, PNG, WebP 사진 선택",
    limits: (max: string) => `JPG, PNG, WebP · 장당 최대 ${max}`,
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
    mapNote: "지도는 openstreetmap.org에서 열리며, 이때 이 좌표가 그쪽으로 전송됩니다.",
    noCoordinates: "값은 있지만 좌표로 변환할 수 없습니다",
    converter: "이미지 변환기(영문)",
    toolQuery: "?from=exif&lang=ko",
    editor: "이미지 편집기(영문)",
    cleanTitle: "사본 말고 더 필요하면",
    jumpToClean: "바로 지우기",
    jumpHint: "원본 파일은 바뀌지 않습니다.",
    pickTitle: "어떤 형식으로 받을까요?",
    sameAsOriginal: "원본과 같은 형식",
    formatNotes: { "image/jpeg": "어디서나 열림, 사진 공유에 무난", "image/png": "화질 손실 없음, 용량 큼", "image/webp": "용량이 가장 작음, 일부 앱은 못 엶" } as Record<OutputType, string>,
    saveAs: (label: string) => `${label}로 받기`,
    verifyFailed: "사본은 저장했지만 여기서 다시 검사하지 못했습니다. 뷰어로 열어 확인해 주세요.",
    jpgNote: "JPG는 투명 배경을 지원하지 않아 투명한 부분이 흰색이 됩니다.",
    cleaning: "지우는 중…",
    cleanFailed: "이 브라우저에서는 사본을 만들지 못했습니다. 이미지 변환기를 이용해 주세요.",
    cleanedOk: "받은 사본을 다시 검사했습니다. 신원을 드러낼 정보가 남아 있지 않습니다.",
    cleanedLeft: (n: number) => `받은 사본을 다시 검사했더니 아직 ${n}종류의 정보가 남아 있습니다.`,
    cleanedSaved: (name: string, size: string) => `${name} (${size})로 저장했습니다.`,
    downloadAgain: "다시 받기",
    share: "공유하기",
    otherFormat: "다른 형식으로 받기",
    removedInCopy: "사본에서 지움",
    noneNext: "이대로 보내도 됩니다. 다만 사진에 찍힌 간판·얼굴·화면은 메타데이터가 아니니 직접 확인하세요.",
    inAppHint: "이 앱 안의 브라우저에서는 내려받기가 안 될 수 있습니다. 아래 이미지를 길게 눌러 저장하세요.",
    shrink: "긴 변을 2048px로 줄이기 (용량 줄이기)",
    keepAll: "사진마다 원래 형식으로",
    keepAllNote: "JPG는 JPG로, PNG는 PNG로, WebP는 WebP로",
    batchSummary: (n: number, m: number) => `사진 ${n}장 · ${m}장에서 정보 발견`,
    cleanAll: "모두 지우기",
    cleaningN: (i: number, n: number) => `지우는 중 ${i}/${n}…`,
    batchDone: (n: number, left: number) => (left === 0 ? `사본 ${n}장을 모두 다시 검사했습니다. 신원을 드러낼 정보가 남아 있지 않습니다.` : `사본 ${n}장 중 ${left}장에 아직 정보가 남아 있습니다.`),
    batchFailed: (n: number) => `${n}장은 이 브라우저에서 지우지 못해 빠졌습니다.`,
    addMore: "사진 추가",
    skipped: (n: number, max: string) => `${n}개 파일은 건너뛰었습니다. ${max} 이하의 JPG, PNG, WebP만 확인할 수 있습니다.`,
    tooMany: (max: number) => `한 번에 ${max}장까지 확인할 수 있어 나머지는 건너뛰었습니다.`,
    unreadableN: (n: number) => `${n}개 파일은 읽지 못해 건너뛰었습니다.`,
    savedSeparately: (n: number) => `ZIP으로 묶지 못해 ${n}개 파일을 한 장씩 내려받았습니다.`,
    rowFound: (n: number) => `${n}종류 발견`,
    rowCleaned: "지움",
    listLabel: "추가한 사진",
    cleanMore: (converter: ReactNode, editor: ReactNode) => (
      <>목표 용량을 정하거나 PDF 하나로 묶으려면 {converter}로, 이 사진의 크기 조절과 회전은 {editor}로 그대로 넘길 수 있습니다. 둘 다 같은 정보를 지웁니다.</>
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

type Cleaned = { blob: Blob; url: string; name: string; size: number; remaining: number | null };
type Item = { id: string; file: File; url: string; meta: Metadata; found: number; width: number | null; height: number | null };
// zip 이 null 이면 묶지 못해 사본을 한 장씩 내려받은 경우다.
type Batch = { zip: { url: string; name: string; size: number } | null; files: Cleaned[]; left: number };
type Working = { scope: "single" | "batch"; label: string };

const findCount = (meta: Metadata) => CHECKS.filter(check => check.keys.some(key => hasValue(meta[key]))).length;

const FORMATS = [
  { type: "image/jpeg", label: "JPG", ext: ".jpg" },
  { type: "image/png", label: "PNG", ext: ".png" },
  { type: "image/webp", label: "WebP", ext: ".webp" },
] as const;
type OutputType = (typeof FORMATS)[number]["type"];
type Choice = OutputType | "keep";
type PickOption = { choice: Choice; label: string; note: string; primary: boolean };

const MAX_FILES = 30;
const SHRINK_SIDE = 2048;
const ZIP_NAME = "clean-photos.zip";
// 카카오톡·네이버·인스타그램 등 앱 안의 브라우저. 내려받기가 막히는 경우가 많아 길게 눌러 저장하도록 안내한다.
const IN_APP_BROWSER = /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\/|DaumApps|everytimeApp/i;

// 회전 정보를 반영해 디코딩한다. 일부 파일은 createImageBitmap 이 거부하므로 <img> 로 한 번 더 시도한다.
// <img> 도 기본값(image-orientation: from-image)으로 EXIF 회전을 적용한다.
async function decodeOriented(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; release: () => void }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  } catch (error) {
    console.warn("createImageBitmap failed, falling back to <img>", error);
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  try {
    await image.decode();
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
  return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => URL.revokeObjectURL(url) };
}

async function makeCleanCopy(file: File, type: string, maxSide: number | null): Promise<Blob> {
  const decoded = await decodeOriented(file);
  const longest = Math.max(decoded.width, decoded.height);
  const scale = maxSide && longest > maxSide ? maxSide / longest : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(decoded.width * scale));
  canvas.height = Math.max(1, Math.round(decoded.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  if (type === "image/jpeg") {
    // JPG 에는 투명도가 없으므로 흰 배경을 먼저 깐다.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.imageSmoothingQuality = "high";
  context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
  decoded.release();
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, type === "image/png" ? undefined : 0.92));
  if (!blob || blob.type !== type) throw new Error(`Encoding to ${type} failed at ${canvas.width}×${canvas.height}`);
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

const uniqueName = (name: string, used: Set<string>) => {
  let candidate = name;
  const dot = name.lastIndexOf(".");
  for (let n = 2; used.has(candidate); n++) candidate = dot > 0 ? `${name.slice(0, dot)} (${n})${name.slice(dot)}` : `${name} (${n})`;
  used.add(candidate);
  return candidate;
};

const asFile = (cleaned: Cleaned) => new File([cleaned.blob], cleaned.name, { type: cleaned.blob.type });

function canShareFiles(files: File[]) {
  try {
    return typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files });
  } catch {
    return false;
  }
}

async function shareFiles(files: File[]) {
  try {
    await navigator.share({ files });
  } catch (error) {
    if ((error as DOMException | null)?.name !== "AbortError") console.warn("Sharing failed", error);
  }
}

// 형식이 모두 같으면 원래 형식을 맨 앞에, 섞여 있으면 "사진마다 원래 형식"을 맨 앞에 둔다.
function pickOptions(types: string[], t: Strings): PickOption[] {
  const unique = Array.from(new Set(types));
  if (unique.length === 1) {
    return [...FORMATS]
      .sort((a, b) => Number(b.type === unique[0]) - Number(a.type === unique[0]))
      .map(format => {
        const same = format.type === unique[0];
        return { choice: same ? "keep" : format.type, label: t.saveAs(format.label), note: `${same ? `${t.sameAsOriginal} · ` : ""}${t.formatNotes[format.type]}`, primary: same };
      });
  }
  return [
    { choice: "keep", label: t.keepAll, note: t.keepAllNote, primary: true },
    ...FORMATS.map(format => ({ choice: format.type, label: t.saveAs(format.label), note: t.formatNotes[format.type], primary: false })),
  ];
}

const primaryButton = "inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:opacity-50";
const secondaryButton = "inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-black hover:border-gray-500 disabled:opacity-50";

function FormatPicker({ id, t, options, onPick, disabled, shrink, onShrink, jpgNote }: {
  id: string;
  t: Strings;
  options: PickOption[];
  onPick: (choice: Choice) => void;
  disabled: boolean;
  shrink: boolean;
  onShrink: (value: boolean) => void;
  jpgNote: boolean;
}) {
  return (
    <div id={id} role="group" aria-label={t.pickTitle} className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-sm font-semibold text-black">{t.pickTitle}</p>
      <div className={`mt-2 grid grid-cols-1 gap-2 ${options.length > 3 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {options.map(option => (
          <button
            key={option.choice}
            type="button"
            onClick={() => onPick(option.choice)}
            disabled={disabled}
            className={`flex min-h-[44px] flex-col items-start rounded-xl border px-3 py-2 text-left disabled:opacity-50 ${option.primary ? "border-brand-600 bg-brand-50" : "border-gray-300 hover:border-gray-500"}`}
          >
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-black">
              <Download className="h-4 w-4" aria-hidden="true" /> {option.label}
            </span>
            <span className="mt-0.5 text-xs font-normal text-gray-600">{option.note}</span>
          </button>
        ))}
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-gray-800">
        <input type="checkbox" checked={shrink} onChange={event => onShrink(event.target.checked)} className="h-4 w-4 accent-brand-600" />
        {t.shrink}
      </label>
      {jpgNote && <p className="mt-2 text-xs text-gray-600">{t.jpgNote}</p>}
    </div>
  );
}

// 지운 뒤의 완료 카드. 결과 문장, 다음 행동 버튼, 앱 안 브라우저라면 길게 눌러 저장할 미리보기.
function DoneCard({ ok, t, previews, actions, children }: { ok: boolean; t: Strings; previews: string[] | null; actions: ReactNode; children: ReactNode }) {
  return (
    <div data-done className={`mt-4 rounded-xl px-4 py-3 ${ok ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"}`}>
      <p role="status" className="flex items-start gap-2 text-sm font-semibold">
        {ok ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" /> : <ShieldAlert className="h-5 w-5 flex-shrink-0" aria-hidden="true" />}
        <span>{children}</span>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div>
      {previews && (
        <>
          <p className="mt-3 text-xs">{t.inAppHint}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {previews.map(url => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="w-full rounded-lg bg-white object-contain" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ExifViewer({ locale = "en" }: { locale?: Locale }) {
  const t = STRINGS[locale];
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [cleanedMap, setCleanedMap] = useState<Record<string, Cleaned>>({});
  const [batch, setBatch] = useState<Batch | null>(null);
  const [working, setWorking] = useState<Working | null>(null);
  const [cleanError, setCleanError] = useState<string | null>(null);
  const [picking, setPicking] = useState<"single" | "batch" | null>(null);
  const [shrink, setShrink] = useState(false);
  const [inApp, setInApp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrollPending = useRef(false);
  const started = useRef(false);
  const nextId = useRef(0);
  const urls = useRef(new Set<string>());

  const makeUrl = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    return url;
  };
  const dropUrl = (url?: string | null) => {
    if (url && urls.current.delete(url)) URL.revokeObjectURL(url);
  };
  useEffect(() => {
    const owned = urls.current;
    return () => {
      owned.forEach(url => URL.revokeObjectURL(url));
      owned.clear();
    };
  }, []);
  useEffect(() => setInApp(IN_APP_BROWSER.test(navigator.userAgent)), []);

  const active = items.find(item => item.id === activeId) ?? items[0] ?? null;
  const multi = items.length > 1;

  // 여러 장이면 ZIP 모듈을 미리 불러 둔다. 누를 때 불러오면 그사이 새 버전이 배포되거나 연결이 끊긴 경우 실패한다.
  useEffect(() => {
    if (multi) import("jszip").catch(() => undefined);
  }, [multi]);
  const activeCleaned = active ? cleanedMap[active.id] ?? null : null;

  const resetCleaning = () => {
    setPicking(null);
    setCleanError(null);
    setCleanedMap(current => {
      Object.values(current).forEach(cleaned => dropUrl(cleaned.url));
      return {};
    });
    setBatch(current => {
      dropUrl(current?.zip?.url);
      return null;
    });
  };

  const download = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const open = async (list: File[], append = false) => {
    setError(null);
    if (list.length === 0) return;
    const accepted = list.filter(file => SUPPORTED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE);
    if (list.length === 1 && accepted.length === 0) {
      setError(SUPPORTED_TYPES.includes(list[0].type) ? t.tooLarge(formatBytes(MAX_FILE_SIZE)) : t.wrongType);
      return;
    }
    const room = Math.max(MAX_FILES - (append ? items.length : 0), 0);
    const taking = accepted.slice(0, room);
    const messages: string[] = [];
    if (list.length > accepted.length) messages.push(t.skipped(list.length - accepted.length, formatBytes(MAX_FILE_SIZE)));
    if (accepted.length > taking.length) messages.push(t.tooMany(MAX_FILES));

    setBusy(true);
    const added: Item[] = [];
    let unreadable = 0;
    for (const file of taking) {
      try {
        const meta = await readMetadata(new Uint8Array(await file.arrayBuffer()));
        added.push({ id: `photo-${nextId.current++}`, file, url: makeUrl(file), meta, found: findCount(meta), width: null, height: null });
      } catch {
        unreadable++;
      }
    }
    setBusy(false);
    if (unreadable) messages.push(taking.length === 1 ? t.unreadable : t.unreadableN(unreadable));
    if (messages.length) setError(messages.join(" "));
    if (added.length === 0) return;

    if (append) {
      setPicking(null);
      setBatch(current => {
        dropUrl(current?.zip?.url);
        return null;
      });
      setItems(current => [...current, ...added]);
      return;
    }
    items.forEach(item => dropUrl(item.url));
    resetCleaning();
    setShowAll(false);
    setItems(added);
    setActiveId(added[0].id);
    scrollPending.current = true;
  };

  // 결과가 처음 나타나면 결과 카드로 스크롤한다. 휴대폰에서는 소개 문단 때문에 결과가 첫 화면 밖에 있다.
  useEffect(() => {
    if (!scrollPending.current || items.length === 0) return;
    scrollPending.current = false;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [items]);

  const openSample = async () => {
    setBusy(true);
    try {
      const blob = await (await fetch(SAMPLE_URL)).blob();
      await open([new File([blob], "sample-photo-with-gps.jpg", { type: "image/jpeg" })]);
    } catch {
      setError(t.sampleFailed);
      setBusy(false);
    }
  };

  // 홈에서 넘겨받은 사진(?handoff=1)이나 샘플(?sample=1)을 바로 연다. StrictMode 의 이중 실행에도 한 번만 꺼낸다.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    if (!params.has(HANDOFF_PARAM) && params.get("sample") !== "1") return;
    window.history.replaceState(null, "", window.location.pathname);
    (async () => {
      const handed = params.has(HANDOFF_PARAM) ? await takeHandoff() : [];
      if (handed.length) await open(handed);
      else if (params.get("sample") === "1") await openSample();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clear = () => {
    items.forEach(item => dropUrl(item.url));
    setItems([]);
    setActiveId(null);
    setError(null);
    resetCleaning();
  };

  const cleanOne = async (item: Item, choice: Choice): Promise<Cleaned> => {
    const type = choice === "keep" ? item.file.type : choice;
    const blob = await makeCleanCopy(item.file, type, shrink ? SHRINK_SIDE : null);
    // 만든 사본을 같은 파서로 다시 읽어, 실제로 지워졌는지 화면에 보여 준다. 재검사가 실패해도 사본은 준다.
    let remaining: number | null = null;
    try {
      remaining = findCount(await readMetadata(new Uint8Array(await blob.arrayBuffer())));
    } catch (error) {
      console.warn("Re-checking the clean copy failed", error);
    }
    const name = cleanName(item.file.name, choice === "keep" || choice === item.file.type ? "keep" : type);
    return { blob, url: makeUrl(blob), name, size: blob.size, remaining };
  };

  const remember = (id: string, cleaned: Cleaned) =>
    setCleanedMap(current => {
      dropUrl(current[id]?.url);
      return { ...current, [id]: cleaned };
    });

  const cleanActive = async (choice: Choice) => {
    if (!active) return;
    setPicking(null);
    setCleanError(null);
    setWorking({ scope: "single", label: t.cleaning });
    try {
      const cleaned = await cleanOne(active, choice);
      remember(active.id, cleaned);
      download(cleaned.url, cleaned.name);
    } catch (error) {
      console.error("Making the clean copy failed", error);
      setCleanError(t.cleanFailed);
    } finally {
      setWorking(null);
    }
  };

  const cleanAll = async (choice: Choice) => {
    setPicking(null);
    setCleanError(null);
    setBatch(current => {
      dropUrl(current?.zip?.url);
      return null;
    });
    const done: Cleaned[] = [];
    let failed = 0;
    try {
      for (const [index, item] of items.entries()) {
        setWorking({ scope: "batch", label: t.cleaningN(index + 1, items.length) });
        try {
          const cleaned = await cleanOne(item, choice);
          remember(item.id, cleaned);
          done.push(cleaned);
        } catch (error) {
          console.error("Making a clean copy failed", item.file.name, error);
          failed++;
        }
      }
      if (done.length) {
        const left = done.filter(cleaned => (cleaned.remaining ?? 0) > 0).length;
        let zip: Batch["zip"] = null;
        try {
          const { default: JSZip } = await import("jszip");
          const bundle = new JSZip();
          const used = new Set<string>();
          done.forEach(cleaned => bundle.file(uniqueName(cleaned.name, used), cleaned.blob));
          const blob = await bundle.generateAsync({ type: "blob" });
          zip = { url: makeUrl(blob), name: ZIP_NAME, size: blob.size };
        } catch (error) {
          // 사본은 이미 만들어졌으니 버리지 않고 한 장씩 내려받는다.
          console.error("Bundling the clean copies failed; downloading them one by one", error);
        }
        setBatch({ zip, files: done, left });
        await saveBatch(zip, done);
      }
      if (failed) setCleanError(done.length ? t.batchFailed(failed) : t.cleanFailed);
    } catch (error) {
      console.error("Cleaning the photos failed", error);
      setCleanError(t.cleanFailed);
    } finally {
      setWorking(null);
    }
  };

  const saveBatch = async (zip: Batch["zip"], files: Cleaned[]) => {
    if (zip) {
      download(zip.url, zip.name);
      return;
    }
    // 브라우저가 연속 내려받기를 막지 않도록 조금씩 간격을 둔다.
    for (const cleaned of files) {
      download(cleaned.url, cleaned.name);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  };

  // 변환기·편집기로 넘어갈 때 지금 보고 있는 사진을 그대로 넘긴다.
  const handTo = async (href: string, files: File[]) => {
    const handed = await putHandoff(files);
    router.push(handed ? withHandoff(href) : href);
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>, append = false) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    open(files, append);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    open(Array.from(event.dataTransfer.files ?? []));
  };

  const meta = active?.meta ?? {};
  const results = CHECKS.map(check => {
    const found = check.keys.some(key => hasValue(meta[key]));
    const detail = found ? (check.describe?.(meta, t) || check.keys.filter(key => hasValue(meta[key])).map(key => show(meta[key], t)).join(" · ")) : null;
    return { ...check, label: check.label[locale], found, detail };
  });
  const foundCount = active?.found ?? 0;
  const photosWithInfo = items.filter(item => item.found > 0).length;
  const point = coordinates(meta);
  const settings = SETTINGS.map(([key, read]) => [t.settingLabels[key], read(meta, t)] as const).filter(([, value]) => value);
  const allFields = Object.entries(meta).filter(([, value]) => hasValue(value));
  const removedInCopy = activeCleaned?.remaining === 0;
  const converterHref = `/convert/img/${t.toolQuery}`;
  const editorHref = `/edit/image/${t.toolQuery}`;
  const activeCleanFile = activeCleaned ? asFile(activeCleaned) : null;
  const batchFiles = batch ? batch.files.map(asFile) : [];

  const picker = (scope: "single" | "batch") => {
    const targets = scope === "single" && active ? [active] : items;
    return (
      <FormatPicker
        id={scope === "single" ? "clean-format-picker" : "batch-format-picker"}
        t={t}
        options={pickOptions(targets.map(item => item.file.type), t)}
        onPick={scope === "single" ? cleanActive : cleanAll}
        disabled={working !== null}
        shrink={shrink}
        onShrink={setShrink}
        jpgNote={targets.some(item => item.file.type !== "image/jpeg")}
      />
    );
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-12">
      <header className="mx-auto mb-8 max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
          <ImageIcon className="h-4 w-4" aria-hidden="true" /> {t.badge}
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-black md:text-5xl">{t.title}</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">{t.intro}</p>
      </header>

      {!active && (
        <div
          className={`mx-auto max-w-4xl rounded-3xl border-2 border-dashed p-10 text-center transition md:p-14 ${dragging ? "border-black bg-gray-200 shadow-md" : "border-gray-400 bg-gray-100 hover:border-gray-500 hover:bg-gray-200 hover:shadow-md"}`}
          onDragEnter={event => { event.preventDefault(); setDragging(true); }}
          onDragOver={event => event.preventDefault()}
          onDragLeave={event => { if (event.currentTarget === event.target) setDragging(false); }}
          onDrop={onDrop}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <Upload className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-black">{t.drop}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:opacity-50">
              {busy ? t.reading : t.choose}
            </button>
            <button type="button" onClick={openSample} disabled={busy} className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-black transition hover:border-gray-500 disabled:opacity-50">
              {t.sample}
            </button>
          </div>
          <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event => onInput(event)} className="sr-only" aria-label={t.inputLabel} />
          <p className="mt-5 text-sm text-gray-500">{t.limits(formatBytes(MAX_FILE_SIZE))}</p>
        </div>
      )}
      <input ref={addRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event => onInput(event, true)} className="sr-only" aria-label={t.addMore} tabIndex={-1} />

      {error && <p role="alert" className="mx-auto mt-4 max-w-4xl rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">{error}</p>}

      {active && (
        <div ref={resultsRef} className="scroll-mt-28 space-y-6">
          {multi && (
            <div data-batch className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <p className="min-w-0 flex-1 font-semibold text-black">{t.batchSummary(items.length, photosWithInfo)}</p>
                <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                  {!batch && (
                    <button type="button" onClick={() => setPicking(current => (current === "batch" ? null : "batch"))} disabled={working !== null} aria-expanded={picking === "batch"} aria-controls="batch-format-picker" className={primaryButton}>
                      <Eraser className="h-4 w-4" aria-hidden="true" /> {working?.scope === "batch" ? working.label : t.cleanAll}
                    </button>
                  )}
                  <button type="button" onClick={() => addRef.current?.click()} disabled={working !== null || items.length >= MAX_FILES} className={secondaryButton}>
                    <Plus className="h-4 w-4" aria-hidden="true" /> {t.addMore}
                  </button>
                  <button type="button" onClick={clear} disabled={working !== null} className={secondaryButton}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t.another}
                  </button>
                </div>
              </div>
              {picking === "batch" && picker("batch")}
              {batch && (
                <DoneCard
                  ok={batch.left === 0}
                  t={t}
                  previews={inApp ? batch.files.map(cleaned => cleaned.url) : null}
                  actions={
                    <>
                      {canShareFiles(batchFiles) && (
                        <button type="button" onClick={() => shareFiles(batchFiles)} className={primaryButton}>
                          <Share2 className="h-4 w-4" aria-hidden="true" /> {t.share}
                        </button>
                      )}
                      <button type="button" onClick={() => saveBatch(batch.zip, batch.files)} className={secondaryButton}>
                        <Download className="h-4 w-4" aria-hidden="true" /> {t.downloadAgain}
                      </button>
                      <button type="button" onClick={() => setPicking(current => (current === "batch" ? null : "batch"))} aria-expanded={picking === "batch"} className={secondaryButton}>
                        {t.otherFormat}
                      </button>
                    </>
                  }
                >
                  {t.batchDone(batch.files.length, batch.left)} {batch.zip ? t.cleanedSaved(batch.zip.name, formatBytes(batch.zip.size)) : t.savedSeparately(batch.files.length)}
                </DoneCard>
              )}
              <ul aria-label={t.listLabel} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {items.map(item => {
                  const cleaned = cleanedMap[item.id];
                  const current = item.id === active.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => { setActiveId(item.id); setPicking(open => (open === "single" ? null : open)); setShowAll(false); }}
                        aria-current={current ? "true" : undefined}
                        className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left ${current ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-gray-400"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 object-cover" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-black">{item.file.name}</span>
                          <span className="text-xs text-gray-500">{formatBytes(item.file.size)}</span>
                        </span>
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${cleaned?.remaining === 0 ? "bg-green-100 text-green-800" : item.found ? "bg-amber-100 text-amber-900" : "bg-gray-100 text-gray-600"}`}>
                          {cleaned?.remaining === 0 ? t.rowCleaned : item.found ? t.rowFound(item.found) : t.none}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active.id}
              src={active.url}
              alt={t.previewAlt}
              className="h-40 w-full rounded-2xl bg-gray-100 object-contain md:w-56"
              onLoad={event => {
                const image = event.currentTarget;
                const id = active.id;
                setItems(current => current.map(item => (item.id === id ? { ...item, width: image.naturalWidth, height: image.naturalHeight } : item)));
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-black">{active.file.name}</p>
                  <p className="text-sm text-gray-500">{formatBytes(active.file.size)}{active.width ? ` · ${active.width} × ${active.height}px` : ""}</p>
                </div>
                {!multi && !activeCleaned && (
                  <button type="button" onClick={clear} className="inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-black hover:bg-gray-50">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t.another}
                  </button>
                )}
              </div>

              {activeCleaned && activeCleanFile ? (
                <DoneCard
                  ok={activeCleaned.remaining === 0}
                  t={t}
                  previews={inApp ? [activeCleaned.url] : null}
                  actions={
                    <>
                      {canShareFiles([activeCleanFile]) && (
                        <button type="button" onClick={() => shareFiles([activeCleanFile])} className={primaryButton}>
                          <Share2 className="h-4 w-4" aria-hidden="true" /> {t.share}
                        </button>
                      )}
                      <button type="button" onClick={() => download(activeCleaned.url, activeCleaned.name)} className={secondaryButton}>
                        <Download className="h-4 w-4" aria-hidden="true" /> {t.downloadAgain}
                      </button>
                      <button type="button" onClick={() => setPicking(current => (current === "single" ? null : "single"))} disabled={working !== null} aria-expanded={picking === "single"} aria-controls="clean-format-picker" className={secondaryButton}>
                        {working?.scope === "single" ? working.label : t.otherFormat}
                      </button>
                      {!multi && (
                        <button type="button" onClick={clear} className={secondaryButton}>
                          <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t.another}
                        </button>
                      )}
                    </>
                  }
                >
                  {activeCleaned.remaining === null ? t.verifyFailed : activeCleaned.remaining === 0 ? t.cleanedOk : t.cleanedLeft(activeCleaned.remaining)}{" "}
                  {t.cleanedSaved(activeCleaned.name, formatBytes(activeCleaned.size))}
                </DoneCard>
              ) : (
                <div className={`mt-4 rounded-xl px-4 py-3 ${foundCount ? "bg-amber-50 text-amber-900" : "bg-green-50 text-green-800"}`}>
                  <div className="flex flex-col gap-3 text-sm font-semibold sm:flex-row sm:items-center">
                    <span className="flex min-w-0 flex-1 items-start gap-2">
                      {foundCount ? <ShieldAlert className="h-5 w-5 flex-shrink-0" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />}
                      <span>{foundCount ? t.foundSummary(foundCount) : t.noneSummary}</span>
                    </span>
                    {foundCount > 0 && (
                      <button
                        type="button"
                        onClick={() => { setCleanError(null); setPicking(current => (current === "single" ? null : "single")); }}
                        disabled={working !== null}
                        aria-expanded={picking === "single"}
                        aria-controls="clean-format-picker"
                        className={`${primaryButton} w-full flex-shrink-0 sm:w-auto`}
                      >
                        <Eraser className="h-4 w-4" aria-hidden="true" />
                        {working?.scope === "single" ? working.label : t.jumpToClean}
                      </button>
                    )}
                    {foundCount === 0 && canShareFiles([active.file]) && (
                      <button type="button" onClick={() => shareFiles([active.file])} className={`${primaryButton} w-full flex-shrink-0 sm:w-auto`}>
                        <Share2 className="h-4 w-4" aria-hidden="true" /> {t.share}
                      </button>
                    )}
                  </div>
                  {foundCount > 0 && picking !== "single" && !cleanError && <p className="mt-2 text-xs font-normal text-amber-800">{t.jumpHint}</p>}
                  {foundCount === 0 && <p className="mt-2 text-xs font-normal">{t.noneNext}</p>}
                </div>
              )}
              {picking === "single" && picker("single")}
              {cleanError && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{cleanError}</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-black">{t.checkTitle}</h2>
            <ul className="mt-4 divide-y divide-gray-100">
              {results.filter(result => result.found).map(result => (
                <li key={result.id} className="flex items-start gap-3 py-3" data-check={result.id}>
                  <result.icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${removedInCopy ? "text-green-600" : "text-amber-600"}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-black">{result.label}</p>
                    <p className="break-words text-sm text-gray-800">{result.detail}</p>
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
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${removedInCopy ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>
                    {removedInCopy ? t.removedInCopy : t.found}
                  </span>
                </li>
              ))}
              {results.some(result => !result.found) && (
                <li data-none className="flex items-start gap-3 py-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                  <p className="min-w-0 flex-1 text-gray-600">
                    <span className="font-semibold text-gray-800">{t.notFound}: </span>
                    {results.filter(result => !result.found).map((result, index, missing) => (
                      <span key={result.id} data-check={result.id}>{result.label}{index < missing.length - 1 ? " · " : ""}</span>
                    ))}
                  </p>
                </li>
              )}
            </ul>
            {point && <p className="mt-2 text-xs text-gray-500">{t.mapNote}</p>}
          </div>

          {(photosWithInfo > 0 || multi) && (
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5" data-clean>
              <h2 className="text-base font-bold text-black">{t.cleanTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {t.cleanMore(
                  <Link href={converterHref} onClick={event => { event.preventDefault(); handTo(converterHref, items.map(item => item.file)); }} className="font-medium text-black underline">{t.converter}</Link>,
                  <Link href={editorHref} onClick={event => { event.preventDefault(); handTo(editorHref, [active.file]); }} className="font-medium text-black underline">{t.editor}</Link>,
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
