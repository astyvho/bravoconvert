import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, Gauge, Layers, Minimize2, SlidersHorizontal, Tag } from "lucide-react";
import benchmarks from "@/data/format-benchmarks.json";

const PUBLISHED = "2026-07-28";
const UPDATED = benchmarks.generatedAt;

export const metadata: Metadata = {
  title: "How to Reduce Image File Size: Measured Results | BravoConvert",
  description:
    "Four levers shrink an image, and they are not equally effective. We measured each one on the same source photo — including the resize result that beats the usual rule of thumb.",
  alternates: { canonical: "/guides/reduce-image-file-size/" },
  openGraph: {
    title: "How to Reduce Image File Size: Measured Results",
    description:
      "Format, dimensions, quality, metadata — measured byte by byte on one source image.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const photo = benchmarks.samples.find((s) => s.id === "photo")!;
const resize = benchmarks.resize;
const full = resize.rows[0];

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;
const pct = (part: number, whole: number) => `${Math.round((1 - part / whole) * 100)}%`;

const jpegAt = (q: number) => photo.jpeg.find((e) => e.quality === q)!.bytes;
const webpAt = (q: number) => photo.webp.find((e) => e.quality === q)!.bytes;

const half = resize.rows.find((r) => r.scale === 0.5)!;

const cascade = [
  {
    step: "Original, saved as PNG",
    detail: `${photo.width}×${photo.height}, lossless`,
    bytes: photo.png,
  },
  {
    step: "Switch format to WebP",
    detail: "quality 0.8, same dimensions",
    bytes: webpAt(0.8),
  },
  {
    step: "Also halve the dimensions",
    detail: `${half.width}×${half.height}, quality 0.8`,
    bytes: half.webp,
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to reduce image file size",
  description:
    "Four measured techniques for shrinking an image file: choosing the format, reducing dimensions, lowering quality, and dropping metadata.",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { "@type": "Organization", name: "BravoConvert" },
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://bravoconvert.com/guides/reduce-image-file-size/",
  },
  step: [
    {
      "@type": "HowToStep",
      name: "Choose the right format",
      text: `Re-encoding the sample photo from PNG to WebP at quality 0.8 took it from ${kb(
        photo.png
      )} to ${kb(webpAt(0.8))}.`,
    },
    {
      "@type": "HowToStep",
      name: "Reduce the pixel dimensions",
      text: `Halving each side left 25% of the pixels but only ${Math.round(
        (half.webp / full.webp) * 100
      )}% of the bytes.`,
    },
    {
      "@type": "HowToStep",
      name: "Lower the quality setting",
      text: `Moving from quality 0.8 to 0.6 cut the JPG from ${kb(jpegAt(0.8))} to ${kb(
        jpegAt(0.6)
      )}.`,
    },
    {
      "@type": "HowToStep",
      name: "Drop embedded metadata",
      text: "Re-encoding through Canvas does not carry the source EXIF block into the output.",
    },
  ],
};

export default function ReduceFileSizeGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Minimize2 className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Reduce Image File Size
          </h1>
          <p className="mb-4 text-xl text-black">Four levers, measured against each other</p>
          <p className="text-base text-gray-600">
            The same source photo run through each technique, with the byte count of every result
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Published <time dateTime={PUBLISHED}>{PUBLISHED}</time> · Updated{" "}
            <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <p className="text-gray-700 leading-7">
            Large images slow down pages, get bounced by upload limits, and eat storage. Four things
            change the file size: the format you pick, the pixel dimensions, the quality setting, and
            the metadata riding along. They are not close to equal, so the order you pull them matters.
          </p>

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-5 text-gray-800">
            <strong>Short version:</strong> format and dimensions do the heavy lifting. On our test
            photo, switching from PNG to WebP removed {pct(webpAt(0.8), photo.png)} of the file before
            touching anything else, and halving the dimensions removed a further{" "}
            {pct(half.webp, webpAt(0.8))}. Quality is the fine adjustment after that. Metadata is
            almost never the reason a file is big.
          </div>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <FlaskConical className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Where these numbers come from
            </h2>
            <p className="text-gray-700 leading-7">
              Every figure below was produced by encoding one deterministic {photo.width}×{photo.height}{" "}
              test photograph through the Canvas <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">toBlob</code>{" "}
              API in Chromium {benchmarks.engine} on {UPDATED} — the same encode path the{" "}
              <Link className="underline font-medium" href="/convert/img/">
                Image Converter
              </Link>{" "}
              runs in your browser. Absolute numbers depend on the image; the{" "}
              <Link className="underline font-medium" href="/guides/jpg-png-webp-comparison/">
                format comparison guide
              </Link>{" "}
              explains the method in full and lets you download the source files.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                1
              </span>
              Choose the format first
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              This is the largest single lever for photographs, and it costs you nothing visible. The
              test photo is {kb(photo.png)} as a PNG because PNG is lossless and has to record every
              grain of sensor noise exactly. The same image at quality 0.8 is {kb(jpegAt(0.8))} as JPG
              and {kb(webpAt(0.8))} as WebP.
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Format</th>
                    <th className="p-3 font-bold">Size</th>
                    <th className="p-3 font-bold">Saved vs PNG</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium text-black">PNG</td>
                    <td className="p-3">{kb(photo.png)}</td>
                    <td className="p-3 text-gray-400">—</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium text-black">JPG, quality 0.8</td>
                    <td className="p-3">{kb(jpegAt(0.8))}</td>
                    <td className="p-3">{pct(jpegAt(0.8), photo.png)}</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium text-black">WebP, quality 0.8</td>
                    <td className="p-3">{kb(webpAt(0.8))}</td>
                    <td className="p-3">{pct(webpAt(0.8), photo.png)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-gray-700 leading-7">
              If the image needs transparency you cannot use JPG at all, but WebP keeps the alpha
              channel and is still far smaller than PNG. The one case where PNG is the right answer is
              flat graphics and screenshots, where lossless is both smaller and cleaner than a lossy
              format would be.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                2
              </span>
              Reduce the dimensions — this beats the rule of thumb
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              The common advice is that file size falls in proportion to pixel count: half the width
              and half the height means a quarter of the pixels, so expect roughly a quarter of the
              bytes. The measurements say you do better than that.
            </p>
            <img
              src="/guides/resize-ladder.webp"
              width={1554}
              height={292}
              alt="The same photograph at 900x600, 675x450, 450x300 and 225x150 pixels, drawn at true relative size with the file size of each"
              className="mb-5 h-auto w-full rounded-lg border border-gray-200"
              loading="lazy"
            />
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Scale</th>
                    <th className="p-3 font-bold">Dimensions</th>
                    <th className="p-3 font-bold">Pixels remaining</th>
                    <th className="p-3 font-bold">JPG bytes remaining</th>
                    <th className="p-3 font-bold">WebP bytes remaining</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {resize.rows.map((row) => (
                    <tr key={row.scale} className="border-t border-gray-200">
                      <td className="p-3 font-medium text-black">
                        {Math.round(row.scale * 100)}%
                      </td>
                      <td className="p-3">
                        {row.width}×{row.height}
                      </td>
                      <td className="p-3">{Math.round((row.pixels / full.pixels) * 100)}%</td>
                      <td className="p-3">
                        {kb(row.jpeg)}{" "}
                        <span className="text-gray-500">
                          ({Math.round((row.jpeg / full.jpeg) * 100)}%)
                        </span>
                      </td>
                      <td className="p-3">
                        {kb(row.webp)}{" "}
                        <span className="text-gray-500">
                          ({Math.round((row.webp / full.webp) * 100)}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-gray-700 leading-7">
              At 75% scale the image keeps{" "}
              {Math.round((resize.rows[1].pixels / full.pixels) * 100)}% of its pixels but only{" "}
              {Math.round((resize.rows[1].jpeg / full.jpeg) * 100)}% of its JPG bytes. At 50% it keeps
              a quarter of the pixels and under a fifth of the bytes.
            </p>
            <p className="mt-4 text-gray-700 leading-7">
              The reason is that downscaling averages neighbouring pixels together, and that averaging
              destroys exactly the high-frequency noise that is most expensive to encode. You are not
              only sending fewer pixels — you are sending pixels that compress better. WebP gains even
              more from this than JPG.
            </p>
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Resizing down cannot be undone, so work from a copy. Keep the aspect ratio locked in the{" "}
              <Link className="underline font-medium" href="/edit/image/">
                Image Editor
              </Link>{" "}
              unless you deliberately want to stretch the image, and pick dimensions based on where the
              image will actually be displayed rather than shrinking arbitrarily.
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                3
              </span>
              Lower the quality setting
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              Quality is the fine adjustment. It moves the file a lot at the top of the scale and much
              less at the bottom, which is the opposite of how people usually reach for it.
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Quality</th>
                    <th className="p-3 font-bold">JPG</th>
                    <th className="p-3 font-bold">WebP</th>
                    <th className="p-3 font-bold">Change from 0.95</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {photo.jpeg.map((entry) => (
                    <tr key={entry.quality} className="border-t border-gray-200">
                      <td className="p-3 font-medium text-black">{entry.quality}</td>
                      <td className="p-3">{kb(entry.bytes)}</td>
                      <td className="p-3">{kb(webpAt(entry.quality))}</td>
                      <td className="p-3 text-gray-500">
                        {entry.quality === 0.95 ? "—" : `−${pct(entry.bytes, jpegAt(0.95))}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-gray-700 leading-7">
              Dropping from 0.95 to 0.8 removes {pct(jpegAt(0.8), jpegAt(0.95))} of the file for a
              difference most people cannot see. Going further to 0.6 removes{" "}
              {pct(jpegAt(0.6), jpegAt(0.95))} in total, and by 0.4 the encoder is visibly smoothing
              detail away. Around 0.8 is the usual sweet spot; below 0.6 you should be looking at the
              result rather than trusting the number.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                4
              </span>
              Drop embedded metadata
            </h2>
            <p className="text-gray-700 leading-7">
              Camera and phone photos carry an EXIF block holding camera settings, timestamps, and
              sometimes GPS coordinates. It is worth removing — but be clear about why. A typical EXIF
              block is a few kilobytes against a photo measured in hundreds, so it will not rescue an
              oversized file. Converting through BravoConvert re-encodes pixels through Canvas and does
              not carry the source EXIF block into the output, which matters more for{" "}
              <Link className="underline font-medium" href="/guides/exif-metadata-privacy/">
                privacy than for size
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-black">
              <Gauge className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Stacking the levers
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              Applied together on the same source image, the first two levers alone account for almost
              the entire reduction:
            </p>
            <div className="space-y-3">
              {cascade.map((row, index) => (
                <div
                  key={row.step}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div>
                    <div className="font-medium text-black">{row.step}</div>
                    <div className="text-sm text-gray-600">{row.detail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-black">{kb(row.bytes)}</div>
                    {index > 0 && (
                      <div className="text-sm text-gray-500">
                        {pct(row.bytes, cascade[0].bytes)} smaller than the original
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-gray-700 leading-7">
              {kb(cascade[0].bytes)} down to {kb(cascade[2].bytes)} — a{" "}
              {pct(cascade[2].bytes, cascade[0].bytes)} reduction, without ever moving the quality
              slider below 0.8.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-black">Recipes</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black">
                  <SlidersHorizontal className="h-5 w-5" /> Photo for a web page
                </div>
                <p className="text-sm text-gray-700">
                  WebP at quality 0.8, resized to the width the page actually renders. Sending a
                  4000px-wide photo into a 800px slot wastes most of the file.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black">
                  <Tag className="h-5 w-5" /> Upload with a hard size limit
                </div>
                <p className="text-sm text-gray-700">
                  Resize first, then lower quality only if you are still over. Resizing preserves
                  apparent sharpness better than heavy compression at full size does.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black">
                  <Layers className="h-5 w-5" /> Logo or screenshot with transparency
                </div>
                <p className="text-sm text-gray-700">
                  WebP if the destination accepts it, PNG otherwise. Never JPG — it cannot store
                  transparent pixels and will fill them with a solid colour.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black">
                  <Gauge className="h-5 w-5" /> Email attachment
                </div>
                <p className="text-sm text-gray-700">
                  JPG at 0.8 resized to around 1600px on the long edge. Universally readable and
                  comfortably under typical attachment limits.
                </p>
              </div>
            </div>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Start with the{" "}
              <Link className="underline font-medium" href="/convert/img/">
                Image Converter
              </Link>{" "}
              for format and quality, or the{" "}
              <Link className="underline font-medium" href="/edit/image/">
                Image Editor
              </Link>{" "}
              to resize first. Both run entirely in your browser, so the file never leaves your device.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
