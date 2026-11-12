import demo from "@/data/exif-demo.json";
import type { Locale } from "@/lib/locale";

// The six things the EXIF viewer checks, as a small data shape shared by the home page's sample
// report, the hero bubbles and the viewer's report panel. Values come from src/data/exif-demo.json,
// which scripts/generate-exif-demo.mjs measured from the real sample photo — never typed by hand.
export type ReportItemId = "location" | "time" | "device" | "serial" | "person" | "software";

export type ReportItem = {
  id: ReportItemId;
  label: string;
  /** The value as the viewer would show it, or null when the photo does not carry it. */
  value: string | null;
  found: boolean;
};

export const REPORT_IDS: ReportItemId[] = ["location", "time", "device", "serial", "person", "software"];

export const REPORT_LABELS: Record<Locale, Record<ReportItemId, string>> = {
  en: {
    location: "Where it was taken",
    time: "When it was taken",
    device: "What took it",
    serial: "Which device exactly",
    person: "Who owns it",
    software: "What edited it",
  },
  ko: {
    location: "어디서 찍었는지",
    time: "언제 찍었는지",
    device: "무엇으로 찍었는지",
    serial: "정확히 어느 기기인지",
    person: "누구의 기기인지",
    software: "무엇으로 편집했는지",
  },
};

function field(name: string): unknown {
  return demo.before.find((entry) => entry.field === name)?.value ?? null;
}

/** "2026:05:17 14:32:08" → "2026-05-17 14:32:08", the same shape the viewer prints. */
function exifDate(value: unknown): string | null {
  return typeof value === "string" ? value.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3") : null;
}

export function demoReport(locale: Locale): ReportItem[] {
  const labels = REPORT_LABELS[locale];
  const lat = field("latitude");
  const lon = field("longitude");
  const location = typeof lat === "number" && typeof lon === "number" ? `${lat}, ${lon}` : null;
  const time = exifDate(field("DateTimeOriginal"));
  const device = [field("Make"), field("Model")].filter((part): part is string => typeof part === "string").join(" ") || null;
  const values: Record<ReportItemId, string | null> = { location, time, device, serial: null, person: null, software: null };
  return REPORT_IDS.map((id) => ({ id, label: labels[id], value: values[id], found: values[id] !== null }));
}

export function demoReportCounts(locale: Locale): { found: number; total: number } {
  const items = demoReport(locale);
  return { found: items.filter((item) => item.found).length, total: items.length };
}
