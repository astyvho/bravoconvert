/**
 * Generates the comparison imagery and the measured file-size data used by the
 * /guides articles.
 *
 * Everything is produced in Playwright's bundled Chromium through the same
 * Canvas `toBlob` path the site's converters use, so the numbers printed in the
 * guides match what a visitor actually gets out of BravoConvert.
 *
 *   node scripts/generate-guide-assets.mjs
 *
 * Outputs:
 *   public/guides/*.png      comparison imagery
 *   src/data/format-benchmarks.json   measured sizes, imported by the guides
 */

import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_DIR = path.join(ROOT, "public", "guides");
const DATA_DIR = path.join(ROOT, "src", "data");

const SAMPLE_WIDTH = 900;
const SAMPLE_HEIGHT = 600;

/**
 * Three synthetic sources, each standing in for a content class that compresses
 * very differently. They are drawn deterministically so re-running the script
 * reproduces the same numbers.
 */
const SAMPLES = [
  {
    id: "photo",
    label: "Photographic",
    description: "Soft gradients and grain, the way a camera photo behaves",
  },
  {
    id: "graphic",
    label: "Flat graphic",
    description: "Solid fills, sharp edges and text, the way a logo or UI screenshot behaves",
  },
  {
    id: "detail",
    label: "Fine detail",
    description: "Dense high-frequency texture, the hardest case for any codec",
  },
];

const JPEG_QUALITIES = [0.4, 0.6, 0.8, 0.95];
const RESIZE_SCALES = [1, 0.75, 0.5, 0.25];
const WEBP_QUALITIES = [0.4, 0.6, 0.8, 0.95];

/** Drawing routines run inside the browser; kept as a string for page.evaluate. */
const DRAW_SOURCE = `
// Deterministic PRNG so every run produces byte-identical output.
function makeRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function drawPhoto(ctx, w, h) {
  const random = makeRandom(1337);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#1b3a5c");
  sky.addColorStop(0.45, "#c96f4a");
  sky.addColorStop(0.7, "#e8b07a");
  sky.addColorStop(1, "#2d2418");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Soft sun bloom.
  const bloom = ctx.createRadialGradient(w * 0.68, h * 0.52, 0, w * 0.68, h * 0.52, w * 0.42);
  bloom.addColorStop(0, "rgba(255,236,190,0.95)");
  bloom.addColorStop(0.35, "rgba(255,190,120,0.35)");
  bloom.addColorStop(1, "rgba(255,170,90,0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);

  // Layered hills, back to front.
  const ridges = [
    { y: 0.68, color: "#5a4636", amp: 26 },
    { y: 0.78, color: "#3f3227", amp: 34 },
    { y: 0.88, color: "#271f18", amp: 20 },
  ];
  for (const ridge of ridges) {
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 6) {
      const t = x / w;
      const y =
        h * ridge.y +
        Math.sin(t * 7.3 + ridge.amp) * ridge.amp +
        Math.sin(t * 19.1 + ridge.amp * 2) * (ridge.amp * 0.35);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = ridge.color;
    ctx.fill();
  }

  // Film-like grain: what makes photographic content expensive for PNG.
  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (random() - 0.5) * 18;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(image, 0, 0);
}

function drawGraphic(ctx, w, h) {
  ctx.fillStyle = "#f4f6f8";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, w, 64);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 26px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("Dashboard", 28, 41);

  const swatches = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"];
  swatches.forEach((color, index) => {
    const x = 28 + index * 214;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, 96, 190, 120);
    ctx.fillStyle = color;
    ctx.fillRect(x, 96, 190, 8);
    ctx.fillStyle = "#111827";
    ctx.font = "700 34px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(String((index + 2) * 137), x + 18, 168);
    ctx.fillStyle = "#6b7280";
    ctx.font = "15px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("Metric " + (index + 1), x + 18, 196);
  });

  // Bar chart with hard edges.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(28, 248, 844, 320);
  const bars = [0.42, 0.68, 0.35, 0.81, 0.57, 0.93, 0.48, 0.72];
  bars.forEach((value, index) => {
    const barW = 78;
    const x = 62 + index * 100;
    const barH = value * 236;
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(x, 536 - barH, barW, barH);
  });
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 536);
  ctx.lineTo(852, 536);
  ctx.stroke();
}

function drawDetail(ctx, w, h) {
  const random = makeRandom(90210);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, w, h);
  // Dense woven texture: high entropy in every direction.
  for (let y = 0; y < h; y += 3) {
    for (let x = 0; x < w; x += 3) {
      const v = Math.floor(random() * 255);
      ctx.fillStyle = "rgb(" + v + "," + Math.floor(v * 0.7 + random() * 60) + "," + Math.floor(v * 0.45 + random() * 90) + ")";
      ctx.fillRect(x, y, 3, 3);
    }
  }
  for (let i = 0; i < 90; i += 1) {
    ctx.strokeStyle = "rgba(255,255,255," + (0.05 + random() * 0.25).toFixed(3) + ")";
    ctx.lineWidth = 1 + random() * 2;
    ctx.beginPath();
    ctx.moveTo(random() * w, random() * h);
    ctx.lineTo(random() * w, random() * h);
    ctx.stroke();
  }
}

function drawDocument(ctx, w, h) {
  const random = makeRandom(4242);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const margin = Math.round(w * 0.1);
  let y = margin;

  ctx.fillStyle = "#111827";
  ctx.font = "700 " + Math.round(w * 0.038) + "px Georgia, serif";
  ctx.fillText("Quarterly Operations Review", margin, y);
  y += Math.round(w * 0.03);

  ctx.fillStyle = "#6b7280";
  ctx.font = Math.round(w * 0.016) + "px Georgia, serif";
  ctx.fillText("Prepared for the board  |  Fiscal year 2026", margin, y);
  y += Math.round(w * 0.045);

  // Body text: grey rules stand in for justified prose at document scale.
  const lineH = Math.round(w * 0.026);
  const drawParagraph = (lines) => {
    ctx.fillStyle = "#374151";
    for (let i = 0; i < lines; i += 1) {
      const width = i === lines - 1 ? (w - margin * 2) * (0.4 + random() * 0.35) : w - margin * 2;
      ctx.fillRect(margin, y, width, Math.round(lineH * 0.42));
      y += lineH;
    }
    y += Math.round(lineH * 0.6);
  };
  drawParagraph(6);

  ctx.fillStyle = "#111827";
  ctx.font = "700 " + Math.round(w * 0.022) + "px Georgia, serif";
  ctx.fillText("1. Revenue by segment", margin, y);
  y += Math.round(lineH * 1.2);
  drawParagraph(4);

  // Table
  const tableW = w - margin * 2;
  const rowH = Math.round(lineH * 1.15);
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(margin, y, tableW, rowH);
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  for (let r = 0; r < 6; r += 1) {
    ctx.strokeRect(margin, y + r * rowH, tableW, rowH);
    ctx.fillStyle = r === 0 ? "#111827" : "#4b5563";
    for (let c = 0; c < 4; c += 1) {
      const cw = tableW / 4;
      ctx.fillRect(margin + c * cw + 10, y + r * rowH + rowH * 0.35, cw * (0.35 + random() * 0.3), Math.round(lineH * 0.34));
    }
  }
  y += rowH * 6 + Math.round(lineH * 1.4);

  // Bar chart
  const chartH = Math.round(h * 0.16);
  const bars = [0.5, 0.72, 0.41, 0.88, 0.63, 0.77];
  const barW = Math.round((tableW / bars.length) * 0.55);
  bars.forEach((v, i) => {
    const x = margin + i * (tableW / bars.length);
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(x, y + chartH - v * chartH, barW, v * chartH);
  });
  ctx.strokeStyle = "#9ca3af";
  ctx.beginPath();
  ctx.moveTo(margin, y + chartH);
  ctx.lineTo(margin + tableW, y + chartH);
  ctx.stroke();
  y += chartH + Math.round(lineH * 1.6);

  drawParagraph(5);

  ctx.fillStyle = "#9ca3af";
  ctx.font = Math.round(w * 0.014) + "px Georgia, serif";
  ctx.fillText("Page 4 of 18", margin, h - Math.round(margin * 0.5));
}

window.__draw = { photo: drawPhoto, graphic: drawGraphic, detail: drawDetail, document: drawDocument };
`;

async function main() {
  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.setContent("<!doctype html><meta charset='utf-8'><body></body>");
  await page.addScriptTag({ content: DRAW_SOURCE });

  const results = [];

  for (const sample of SAMPLES) {
    const measured = await page.evaluate(
      async ({ id, width, height, jpegQualities, webpQualities }) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        window.__draw[id](ctx, width, height);

        const encode = (type, quality) =>
          new Promise((resolve) => {
            canvas.toBlob(
              (blob) => resolve({ bytes: blob.size, type: blob.type }),
              type,
              quality
            );
          });

        const png = await encode("image/png", undefined);
        const jpeg = [];
        for (const q of jpegQualities) {
          const r = await encode("image/jpeg", q);
          jpeg.push({ quality: q, bytes: r.bytes });
        }
        const webp = [];
        for (const q of webpQualities) {
          const r = await encode("image/webp", q);
          webp.push({ quality: q, bytes: r.bytes });
        }

        return {
          pngBytes: png.bytes,
          jpeg,
          webp,
          dataUrl: canvas.toDataURL("image/png"),
        };
      },
      {
        id: sample.id,
        width: SAMPLE_WIDTH,
        height: SAMPLE_HEIGHT,
        jpegQualities: JPEG_QUALITIES,
        webpQualities: WEBP_QUALITIES,
      }
    );

    await writeFile(
      path.join(IMAGE_DIR, `sample-${sample.id}.png`),
      Buffer.from(measured.dataUrl.split(",")[1], "base64")
    );

    results.push({
      id: sample.id,
      label: sample.label,
      description: sample.description,
      width: SAMPLE_WIDTH,
      height: SAMPLE_HEIGHT,
      png: measured.pngBytes,
      jpeg: measured.jpeg,
      webp: measured.webp,
    });

    console.log(
      `${sample.label.padEnd(14)} PNG ${(measured.pngBytes / 1024).toFixed(0).padStart(5)} KB` +
        `  JPEG q80 ${(measured.jpeg.find((j) => j.quality === 0.8).bytes / 1024).toFixed(0).padStart(4)} KB` +
        `  WebP q80 ${(measured.webp.find((w) => w.quality === 0.8).bytes / 1024).toFixed(0).padStart(4)} KB`
    );
  }

  // Display copies: the raw PNG samples are far too heavy to ship on a guide
  // page, so emit a WebP rendition of each alongside a zoomed strip that shows
  // what JPEG quality actually costs you.
  for (const sample of SAMPLES) {
    const display = await page.evaluate(
      async ({ id, width, height }) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        window.__draw[id](ctx, width, height);
        return canvas.toDataURL("image/webp", 0.82);
      },
      { id: sample.id, width: SAMPLE_WIDTH, height: SAMPLE_HEIGHT }
    );
    await writeFile(
      path.join(IMAGE_DIR, `sample-${sample.id}.webp`),
      Buffer.from(display.split(",")[1], "base64")
    );
  }

  // Artifact ladder: one 260x200 crop of the photographic sample re-encoded at
  // each JPEG quality, magnified 2x and laid side by side so blocking and
  // colour banding are actually visible at reading size.
  const ladder = await page.evaluate(
    async ({ width, height, qualities, cropW, cropH, zoom }) => {
      const source = document.createElement("canvas");
      source.width = width;
      source.height = height;
      const sctx = source.getContext("2d", { willReadFrequently: true });
      window.__draw.photo(sctx, width, height);

      const cropX = Math.round(width * 0.52);
      const cropY = Math.round(height * 0.38);

      const label = 34;
      const gap = 8;
      const cellW = cropW * zoom;
      const cellH = cropH * zoom;
      const out = document.createElement("canvas");
      out.width = cellW * qualities.length + gap * (qualities.length - 1);
      out.height = cellH + label;
      const octx = out.getContext("2d");
      octx.fillStyle = "#ffffff";
      octx.fillRect(0, 0, out.width, out.height);

      for (let i = 0; i < qualities.length; i += 1) {
        const q = qualities[i];
        const crop = document.createElement("canvas");
        crop.width = cropW;
        crop.height = cropH;
        crop
          .getContext("2d")
          .drawImage(source, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        const encoded = crop.toDataURL("image/jpeg", q);
        const img = new Image();
        await new Promise((done) => {
          img.onload = done;
          img.src = encoded;
        });

        const x = i * (cellW + gap);
        octx.imageSmoothingEnabled = false;
        octx.drawImage(img, 0, 0, cropW, cropH, x, label, cellW, cellH);
        octx.strokeStyle = "#d1d5db";
        octx.lineWidth = 1;
        octx.strokeRect(x + 0.5, label + 0.5, cellW - 1, cellH - 1);

        const bytes = Math.round((encoded.length - encoded.indexOf(",") - 1) * 0.75);
        octx.fillStyle = "#111827";
        octx.font = "600 15px system-ui, -apple-system, Segoe UI, sans-serif";
        octx.fillText(`quality ${q}`, x, 16);
        octx.fillStyle = "#6b7280";
        octx.font = "13px system-ui, -apple-system, Segoe UI, sans-serif";
        octx.fillText(`${Math.round(bytes / 1024)} KB`, x, 30);
      }

      return out.toDataURL("image/webp", 0.9);
    },
    {
      width: SAMPLE_WIDTH,
      height: SAMPLE_HEIGHT,
      qualities: JPEG_QUALITIES,
      cropW: 260,
      cropH: 200,
      zoom: 2,
    }
  );
  await writeFile(
    path.join(IMAGE_DIR, "jpeg-quality-ladder.webp"),
    Buffer.from(ladder.split(",")[1], "base64")
  );
  console.log("Wrote display renditions and jpeg-quality-ladder.webp");

  // Does shrinking dimensions really cut bytes in proportion to pixel count?
  // Encode the photographic sample at several scales and let the numbers answer.
  const resize = await page.evaluate(
    async ({ width, height, scales, quality }) => {
      const source = document.createElement("canvas");
      source.width = width;
      source.height = height;
      window.__draw.photo(source.getContext("2d", { willReadFrequently: true }), width, height);

      const rows = [];
      for (const scale of scales) {
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        const scaled = document.createElement("canvas");
        scaled.width = w;
        scaled.height = h;
        const sctx = scaled.getContext("2d");
        sctx.imageSmoothingQuality = "high";
        sctx.drawImage(source, 0, 0, w, h);

        const encode = (type) =>
          new Promise((resolve) => scaled.toBlob((b) => resolve(b.size), type, quality));

        rows.push({
          scale,
          width: w,
          height: h,
          pixels: w * h,
          jpeg: await encode("image/jpeg"),
          webp: await encode("image/webp"),
        });
      }
      return rows;
    },
    { width: SAMPLE_WIDTH, height: SAMPLE_HEIGHT, scales: RESIZE_SCALES, quality: 0.8 }
  );

  for (const row of resize) {
    const full = resize[0];
    console.log(
      `scale ${String(row.scale).padEnd(5)} ${String(row.width).padStart(4)}x${String(row.height).padEnd(4)}` +
        ` pixels ${(row.pixels / full.pixels * 100).toFixed(0).padStart(3)}%` +
        ` JPEG ${(row.jpeg / 1024).toFixed(0).padStart(3)} KB (${(row.jpeg / full.jpeg * 100).toFixed(0).padStart(3)}%)` +
        ` WebP ${(row.webp / 1024).toFixed(0).padStart(3)} KB`
    );
  }

  // A PDF page rendered at the scale PDFConverter actually uses. PDF user space
  // is 72 units per inch, so scale 2.0 lands at 144 DPI.
  const PDF_SCALE = 2.0;
  const A4_PT = { width: 595, height: 842 };
  const pdfW = Math.round(A4_PT.width * PDF_SCALE);
  const pdfH = Math.round(A4_PT.height * PDF_SCALE);

  const pdfPage = await page.evaluate(
    async ({ width, height, qualities }) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      window.__draw.document(canvas.getContext("2d", { willReadFrequently: true }), width, height);

      const encode = (type, q) =>
        new Promise((resolve) => canvas.toBlob((b) => resolve(b.size), type, q));

      const jpeg = [];
      for (const q of qualities) jpeg.push({ quality: q, bytes: await encode("image/jpeg", q) });
      const webp = [];
      for (const q of qualities) webp.push({ quality: q, bytes: await encode("image/webp", q) });

      return {
        png: await encode("image/png", undefined),
        jpeg,
        webp,
        preview: canvas.toDataURL("image/webp", 0.85),
      };
    },
    { width: pdfW, height: pdfH, qualities: JPEG_QUALITIES }
  );

  await writeFile(
    path.join(IMAGE_DIR, "pdf-page-render.webp"),
    Buffer.from(pdfPage.preview.split(",")[1], "base64")
  );
  const pdfPageData = {
    scale: PDF_SCALE,
    dpi: 72 * PDF_SCALE,
    pointSize: A4_PT,
    pixelSize: { width: pdfW, height: pdfH },
    png: pdfPage.png,
    jpeg: pdfPage.jpeg,
    webp: pdfPage.webp,
  };
  console.log(
    `PDF page  ${pdfW}x${pdfH} @ ${72 * PDF_SCALE} DPI   PNG ${(pdfPage.png / 1024).toFixed(0)} KB` +
      `  JPEG q80 ${(pdfPage.jpeg.find((j) => j.quality === 0.8).bytes / 1024).toFixed(0)} KB` +
      `  WebP q80 ${(pdfPage.webp.find((x) => x.quality === 0.8).bytes / 1024).toFixed(0)} KB`
  );

  // Resize strip: the same photo at each scale, drawn at its true relative size
  // so the reduction is visible rather than just tabulated.
  const strip = await page.evaluate(
    async ({ width, height, scales, quality }) => {
      const source = document.createElement("canvas");
      source.width = width;
      source.height = height;
      window.__draw.photo(source.getContext("2d", { willReadFrequently: true }), width, height);

      const label = 40;
      const gap = 14;
      const cellW = Math.round(width * 0.42);
      const cellH = Math.round(height * 0.42);
      const out = document.createElement("canvas");
      out.width = cellW * scales.length + gap * (scales.length - 1);
      out.height = cellH + label;
      const ctx = out.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, out.width, out.height);

      for (let i = 0; i < scales.length; i += 1) {
        const scale = scales[i];
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        const shrunk = document.createElement("canvas");
        shrunk.width = w;
        shrunk.height = h;
        const sctx = shrunk.getContext("2d");
        sctx.imageSmoothingQuality = "high";
        sctx.drawImage(source, 0, 0, w, h);
        const bytes = await new Promise((r) => shrunk.toBlob((b) => r(b.size), "image/jpeg", quality));

        const x = i * (cellW + gap);
        const drawW = Math.round(cellW * scale);
        const drawH = Math.round(cellH * scale);
        ctx.drawImage(shrunk, x, label + (cellH - drawH), drawW, drawH);
        ctx.strokeStyle = "#d1d5db";
        ctx.strokeRect(x + 0.5, label + (cellH - drawH) + 0.5, drawW - 1, drawH - 1);

        ctx.fillStyle = "#111827";
        ctx.font = "600 17px system-ui, -apple-system, Segoe UI, sans-serif";
        ctx.fillText(w + " x " + h, x, 18);
        ctx.fillStyle = "#6b7280";
        ctx.font = "15px system-ui, -apple-system, Segoe UI, sans-serif";
        ctx.fillText(Math.round(bytes / 1024) + " KB at quality " + quality, x, 34);
      }
      return out.toDataURL("image/webp", 0.9);
    },
    { width: SAMPLE_WIDTH, height: SAMPLE_HEIGHT, scales: RESIZE_SCALES, quality: 0.8 }
  );
  await writeFile(
    path.join(IMAGE_DIR, "resize-ladder.webp"),
    Buffer.from(strip.split(",")[1], "base64")
  );
  console.log("Wrote resize-ladder.webp");

  await writeFile(
    path.join(DATA_DIR, "format-benchmarks.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString().slice(0, 10),
        engine: await browser.version(),
        note:
          "Measured with Canvas toBlob in Chromium, the same encoding path BravoConvert uses in the browser.",
        samples: results,
        resize: { quality: 0.8, sourceId: "photo", rows: resize },
        pdfPage: pdfPageData,
      },
      null,
      2
    ) + "\n"
  );

  await browser.close();
  console.log(`\nWrote ${path.relative(ROOT, path.join(DATA_DIR, "format-benchmarks.json"))}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
