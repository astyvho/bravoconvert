import { expect, test, type Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SAMPLE = path.join(__dirname, "..", "..", "public", "guides", "exif-sample-with-metadata.jpg");

async function rejectOptionalCookies(page: Page) {
  const reject = page.getByRole("button", { name: "Reject", exact: true });
  if (await reject.isVisible()) await reject.click();
}

function check(page: Page, id: string) {
  return page.locator(`[data-check="${id}"]`);
}

/** The TIFF payload of the sample JPEG's APP1 segment, reused to tag other formats. */
async function sampleTiff() {
  const jpg = await readFile(SAMPLE);
  let offset = 2;
  while (offset < jpg.length) {
    const length = jpg.readUInt16BE(offset + 2);
    if (jpg[offset + 1] === 0xe1) return jpg.subarray(offset + 10, offset + 2 + length);
    offset += 2 + length;
  }
  throw new Error("Sample has no APP1 segment");
}

function riffChunk(id: string, data: Buffer) {
  const header = Buffer.alloc(8);
  header.write(id, 0, "ascii");
  header.writeUInt32LE(data.length, 4);
  return Buffer.concat([header, data, Buffer.alloc(data.length % 2)]);
}

test("sample photo shows location, time, and device, and nothing else", async ({ page }) => {
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByRole("button", { name: "Try a sample photo" }).click();

  await expect(page.getByText("This photo carries 3 kinds of identifying information.")).toBeVisible();
  await expect(check(page, "location")).toContainText("51.50806, -0.12806");
  await expect(check(page, "time")).toContainText("2026-05-17 14:32:08");
  await expect(check(page, "device")).toContainText("BravoCam BC-900 Demo");
  for (const id of ["serial", "person", "software"]) await expect(check(page, id)).toContainText("Not found");

  const map = page.getByRole("link", { name: "Show on OpenStreetMap" });
  await expect(map).toHaveAttribute("href", /mlat=51\.50806&mlon=-0\.12806/);
  await expect(page.getByText("Rotate 90 CW")).toBeVisible();
});

test("a photo without metadata is reported as clean", async ({ page }, testInfo) => {
  const plain = testInfo.outputPath("plain.png");
  await page.setContent(`<div style="width:120px;height:80px;background:#2563eb"></div>`);
  await page.locator("div").screenshot({ path: plain });

  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles(plain);
  await expect(page.getByText("No identifying metadata found in this file.")).toBeVisible();
  await expect(page.getByText("120 × 80px")).toBeVisible();
});

test("reads EXIF from a WebP file", async ({ page }, testInfo) => {
  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);

  // A real, decodable WebP from the browser, rewrapped in the extended format with an EXIF chunk.
  const encoded = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 48;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#e11d48";
    context.fillRect(0, 0, 64, 48);
    return canvas.toDataURL("image/webp").split(",")[1];
  });
  // Chrome may already emit the extended format (VP8X + ICCP), so keep its chunks
  // and its VP8X flags, and only add the EXIF flag and chunk.
  const source = Buffer.from(encoded, "base64");
  const kept: Buffer[] = [];
  let flags = 0;
  for (let offset = 12; offset + 8 <= source.length;) {
    const id = source.toString("ascii", offset, offset + 4);
    const size = source.readUInt32LE(offset + 4);
    const end = offset + 8 + size + (size % 2);
    if (id === "VP8X") flags = source[offset + 8];
    else kept.push(source.subarray(offset, end));
    offset = end;
  }
  const vp8x = Buffer.alloc(10);
  vp8x[0] = flags | 0x08; // EXIF present
  vp8x.writeUIntLE(64 - 1, 4, 3);
  vp8x.writeUIntLE(48 - 1, 7, 3);
  const body = Buffer.concat([Buffer.from("WEBP"), riffChunk("VP8X", vp8x), ...kept, riffChunk("EXIF", await sampleTiff())]);
  const header = Buffer.alloc(8);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(body.length, 4);
  const webp = testInfo.outputPath("tagged.webp");
  await writeFile(webp, Buffer.concat([header, body]));

  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles(webp);
  await expect(check(page, "device")).toContainText("BravoCam BC-900 Demo");
  await expect(check(page, "location")).toContainText("51.50806, -0.12806");
  await expect(page.getByText("64 × 48px")).toBeVisible();
});

test("unsupported formats are rejected", async ({ page }, testInfo) => {
  const gif = testInfo.outputPath("animation.gif");
  await writeFile(gif, Buffer.from("R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=", "base64"));

  await page.goto("/view/exif/");
  await rejectOptionalCookies(page);
  await page.getByLabel("Choose a JPG, PNG, or WebP photo").setInputFiles(gif);
  await expect(page.getByText("Choose a JPG, PNG, or WebP image.")).toBeVisible();
});
