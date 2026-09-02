/**
 * Builds a JPEG carrying a realistic EXIF block — camera make and model, a
 * capture timestamp, an orientation flag and GPS coordinates — then pushes it
 * through the same Canvas round trip the image worker performs and reads the
 * metadata back on both sides.
 *
 * The point is to verify, rather than assert, the claim the privacy guide makes:
 * that converting an image through BravoConvert leaves the source EXIF behind.
 *
 *   node scripts/generate-exif-demo.mjs
 *
 * Outputs:
 *   public/guides/exif-sample-with-metadata.jpg   the tagged source
 *   src/data/exif-demo.json                       what exifr found before/after
 */

import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import exifr from "exifr";

const { parse } = exifr;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_DIR = path.join(ROOT, "public", "guides");
const DATA_DIR = path.join(ROOT, "src", "data");

/** Values written into the sample. Deliberately recognisable, not real. */
const FIXTURE = {
  make: "BravoCam",
  model: "BC-900 Demo",
  dateTimeOriginal: "2026:05:17 14:32:08",
  orientation: 6,
  // Trafalgar Square, chosen because it is unmistakably a public landmark.
  latitude: [51, 30, 29.0],
  longitude: [0, 7, 41.0],
  latitudeRef: "N",
  longitudeRef: "W",
};

const TYPE = { ASCII: 2, SHORT: 3, LONG: 4, RATIONAL: 5 };

/**
 * Lays out one IFD plus its overflow data area.
 * Entries whose payload exceeds four bytes are appended to `data` and referenced
 * by an offset relative to the start of the TIFF header.
 */
function buildIfd(entries, tiffOffsetOfIfd, nextIfdOffset = 0) {
  const count = entries.length;
  const dirSize = 2 + count * 12 + 4;
  const dataStart = tiffOffsetOfIfd + dirSize;

  const dir = Buffer.alloc(dirSize);
  const chunks = [];
  let dataLen = 0;

  dir.writeUInt16LE(count, 0);

  entries.forEach((entry, index) => {
    const base = 2 + index * 12;
    dir.writeUInt16LE(entry.tag, base);
    dir.writeUInt16LE(entry.type, base + 2);
    dir.writeUInt32LE(entry.count, base + 4);

    if (entry.inline !== undefined) {
      dir.writeUInt32LE(entry.inline, base + 8);
      return;
    }
    if (entry.payload.length <= 4) {
      entry.payload.copy(dir, base + 8);
      return;
    }
    dir.writeUInt32LE(dataStart + dataLen, base + 8);
    chunks.push(entry.payload);
    dataLen += entry.payload.length;
  });

  dir.writeUInt32LE(nextIfdOffset, 2 + count * 12);
  return { buffer: Buffer.concat([dir, ...chunks]), size: dirSize + dataLen };
}

const ascii = (value) => Buffer.from(`${value}\0`, "latin1");

function rationals(triple) {
  const buf = Buffer.alloc(triple.length * 8);
  triple.forEach((value, index) => {
    // Two decimal places is plenty for seconds and keeps the maths exact.
    const denominator = Number.isInteger(value) ? 1 : 100;
    buf.writeUInt32LE(Math.round(value * denominator), index * 8);
    buf.writeUInt32LE(denominator, index * 8 + 4);
  });
  return buf;
}

function buildExifApp1() {
  // The three directories are laid out back to back after the TIFF header.
  // IFD0 sizes are known only once its entries exist, so build inner ones first
  // against provisional offsets and then place them.
  const exifEntries = [
    { tag: 0x9003, type: TYPE.ASCII, count: 20, payload: ascii(FIXTURE.dateTimeOriginal) },
  ];
  const gpsEntries = [
    { tag: 0x0001, type: TYPE.ASCII, count: 2, payload: ascii(FIXTURE.latitudeRef) },
    { tag: 0x0002, type: TYPE.RATIONAL, count: 3, payload: rationals(FIXTURE.latitude) },
    { tag: 0x0003, type: TYPE.ASCII, count: 2, payload: ascii(FIXTURE.longitudeRef) },
    { tag: 0x0004, type: TYPE.RATIONAL, count: 3, payload: rationals(FIXTURE.longitude) },
  ];

  const ifd0Entries = [
    { tag: 0x010f, type: TYPE.ASCII, count: FIXTURE.make.length + 1, payload: ascii(FIXTURE.make) },
    { tag: 0x0110, type: TYPE.ASCII, count: FIXTURE.model.length + 1, payload: ascii(FIXTURE.model) },
    { tag: 0x0112, type: TYPE.SHORT, count: 1, inline: FIXTURE.orientation },
    { tag: 0x8769, type: TYPE.LONG, count: 1, inline: 0 },
    { tag: 0x8825, type: TYPE.LONG, count: 1, inline: 0 },
  ];

  const IFD0_OFFSET = 8;
  const ifd0Probe = buildIfd(ifd0Entries, IFD0_OFFSET);
  const exifOffset = IFD0_OFFSET + ifd0Probe.size;
  const exifIfd = buildIfd(exifEntries, exifOffset);
  const gpsOffset = exifOffset + exifIfd.size;
  const gpsIfd = buildIfd(gpsEntries, gpsOffset);

  ifd0Entries[3].inline = exifOffset;
  ifd0Entries[4].inline = gpsOffset;
  const ifd0 = buildIfd(ifd0Entries, IFD0_OFFSET);

  const tiffHeader = Buffer.alloc(8);
  tiffHeader.write("II", 0, "latin1");
  tiffHeader.writeUInt16LE(0x002a, 2);
  tiffHeader.writeUInt32LE(IFD0_OFFSET, 4);

  const tiff = Buffer.concat([tiffHeader, ifd0.buffer, exifIfd.buffer, gpsIfd.buffer]);
  const body = Buffer.concat([Buffer.from("Exif\0\0", "latin1"), tiff]);

  const segment = Buffer.alloc(4);
  segment.writeUInt16BE(0xffe1, 0);
  segment.writeUInt16BE(body.length + 2, 2);
  return Buffer.concat([segment, body]);
}

/** Splices an APP1 segment in immediately after the SOI marker. */
function insertApp1(jpeg, app1) {
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) throw new Error("not a JPEG");
  return Buffer.concat([jpeg.subarray(0, 2), app1, jpeg.subarray(2)]);
}

async function main() {
  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent("<!doctype html><meta charset='utf-8'><body></body>");

  // A small photographic-looking source so the file stays sensible to download.
  const baseJpegDataUrl = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    const sky = ctx.createLinearGradient(0, 0, 0, 480);
    sky.addColorStop(0, "#20496b");
    sky.addColorStop(0.6, "#d98a55");
    sky.addColorStop(1, "#2b241c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = "#1d1912";
    ctx.beginPath();
    ctx.moveTo(0, 480);
    for (let x = 0; x <= 640; x += 8) {
      ctx.lineTo(x, 360 + Math.sin(x / 70) * 28 + Math.sin(x / 23) * 9);
    }
    ctx.lineTo(640, 480);
    ctx.closePath();
    ctx.fill();
    return canvas.toDataURL("image/jpeg", 0.85);
  });

  const plainJpeg = Buffer.from(baseJpegDataUrl.split(",")[1], "base64");
  const tagged = insertApp1(plainJpeg, buildExifApp1());
  const taggedPath = path.join(IMAGE_DIR, "exif-sample-with-metadata.jpg");
  await writeFile(taggedPath, tagged);

  const before = await parse(tagged, true);

  // The round trip: decode to a bitmap, draw to a canvas, re-encode. This is
  // what image-worker.js does for every conversion.
  const convertedDataUrl = await page.evaluate(async (dataUrl) => {
    const blob = await (await fetch(dataUrl)).blob();
    const bitmap = await createImageBitmap(blob, { imageOrientation: "none" });
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.85);
  }, `data:image/jpeg;base64,${tagged.toString("base64")}`);

  const converted = Buffer.from(convertedDataUrl.split(",")[1], "base64");
  const after = await parse(converted, true);

  const interesting = [
    "Make",
    "Model",
    "DateTimeOriginal",
    "Orientation",
    "latitude",
    "longitude",
    "GPSLatitudeRef",
    "GPSLongitudeRef",
  ];
  const formatValue = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value === "number") return Number(value.toFixed(5));
    // exifr turns EXIF timestamps into Date objects; keep the EXIF spelling.
    if (value instanceof Date) {
      const pad = (n) => String(n).padStart(2, "0");
      return (
        value.getFullYear() +
        ":" + pad(value.getMonth() + 1) +
        ":" + pad(value.getDate()) +
        " " + pad(value.getHours()) +
        ":" + pad(value.getMinutes()) +
        ":" + pad(value.getSeconds())
      );
    }
    return String(value);
  };

  const summarise = (data) =>
    interesting.map((key) => ({
      field: key,
      value: formatValue(data ? data[key] : undefined),
    }));

  const result = {
    generatedAt: new Date().toISOString().slice(0, 10),
    engine: await browser.version(),
    note:
      "The tagged JPEG was decoded to a bitmap, drawn to a canvas and re-encoded — the same path image-worker.js takes — then re-parsed with exifr.",
    sourceFile: "/guides/exif-sample-with-metadata.jpg",
    sourceBytes: tagged.length,
    convertedBytes: converted.length,
    exifBlockBytes: tagged.length - plainJpeg.length,
    before: summarise(before),
    after: summarise(after),
    anyFieldSurvived: interesting.some((k) => after && after[k] !== undefined && after[k] !== null),
  };

  await writeFile(path.join(DATA_DIR, "exif-demo.json"), JSON.stringify(result, null, 2) + "\n");
  await browser.close();

  console.log(`EXIF block: ${result.exifBlockBytes} bytes of a ${result.sourceBytes} byte file`);
  console.log("\nfield              before                    after");
  result.before.forEach((row, i) => {
    const a = result.after[i].value;
    console.log(
      `  ${row.field.padEnd(17)} ${String(row.value ?? "-").padEnd(25)} ${a === null ? "(absent)" : a}`
    );
  });
  console.log(`\nany field survived: ${result.anyFieldSurvived}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
