import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  BookMarked,
  Fingerprint,
  FlaskConical,
  LifeBuoy,
  Library,
  Minimize2,
  Files,
} from "lucide-react";
import benchmarks from "@/data/format-benchmarks.json";
import exifDemo from "@/data/exif-demo.json";

const PUBLISHED = "2026-07-28";
const UPDATED = benchmarks.generatedAt;

export const metadata: Metadata = {
  title: "Guides: Measured Answers About Image and PDF Conversion | BravoConvert",
  description:
    "Six guides built on byte counts we measured ourselves, in the same browser engine the converters use — format comparisons, file size, PDF output resolution, EXIF privacy, troubleshooting and terminology.",
  alternates: { canonical: "/guides/" },
  openGraph: {
    title: "Guides: Measured Answers About Image and PDF Conversion",
    description:
      "Not rules of thumb — actual measurements, with the test files published so you can check them.",
    type: "website",
  },
};

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;

const photo = benchmarks.samples.find((s) => s.id === "photo")!;
const detail = benchmarks.samples.find((s) => s.id === "detail")!;
const half = benchmarks.resize.rows.find((r) => r.scale === 0.5)!;
const jpegAt = (s: typeof photo, q: number) => s.jpeg.find((e) => e.quality === q)!.bytes;
const webpAt = (s: typeof photo, q: number) => s.webp.find((e) => e.quality === q)!.bytes;
const pdfJpg95 = benchmarks.pdfPage.jpeg.find((e) => e.quality === 0.95)!.bytes;

const groups = [
  {
    heading: "Choosing a format and a size",
    blurb:
      "The two decisions that change your file more than anything else, with the numbers behind each.",
    items: [
      {
        href: "/guides/jpg-png-webp-comparison/",
        icon: BarChart3,
        title: "JPG vs PNG vs WebP",
        description:
          "Three test images encoded at four quality levels each, with every byte count published. Covers transparency, compatibility, and when each format is the wrong choice.",
        finding: `WebP is not always smaller. On dense texture at quality 0.4, JPG produced ${kb(
          jpegAt(detail, 0.4)
        )} against WebP's ${kb(webpAt(detail, 0.4))}.`,
      },
      {
        href: "/guides/reduce-image-file-size/",
        icon: Minimize2,
        title: "How to reduce image file size",
        description:
          "Format, dimensions, quality and metadata measured against each other on one source photo, so you can see which lever is worth pulling first.",
        finding: `Downscaling beats the usual rule of thumb: halving both sides left a quarter of the pixels but under a fifth of the bytes — ${kb(
          photo.png
        )} down to ${kb(half.webp)} once format and size are both handled.`,
      },
    ],
  },
  {
    heading: "Working with PDFs and metadata",
    blurb: "What actually comes out of the tools, and what travels along with your files.",
    items: [
      {
        href: "/guides/pdf-to-image-use-cases/",
        icon: Files,
        title: "PDF to image: resolution and format",
        description:
          "The output resolution nobody documents, a page-size conversion table, and the cases where keeping the PDF is the better call.",
        finding: `Pages render at ${benchmarks.pdfPage.dpi} DPI, so A4 becomes ${benchmarks.pdfPage.pixelSize.width}×${benchmarks.pdfPage.pixelSize.height}. For a text document, JPG came out ${(
          pdfJpg95 / benchmarks.pdfPage.png
        ).toFixed(1)}× larger than PNG.`,
      },
      {
        href: "/guides/exif-metadata-privacy/",
        icon: Fingerprint,
        title: "EXIF data and privacy",
        description:
          "We built a photo carrying GPS coordinates, camera model and a timestamp, converted it, and read the metadata back field by field. Includes what stripping EXIF does not protect you from.",
        finding: `Every field was gone after conversion — ${exifDemo.exifBlockBytes} bytes of metadata that a viewer never sees but any EXIF reader can pull out.`,
      },
    ],
  },
  {
    heading: "Reference",
    blurb: "For when something goes wrong, or a word needs pinning down.",
    items: [
      {
        href: "/guides/troubleshooting/",
        icon: LifeBuoy,
        title: "Troubleshooting conversion problems",
        description:
          "Why a file gets rejected, why a job stalls, why a download vanishes — each with the cause rather than just the fix, plus the real size and format ceilings for all three tools.",
        finding:
          "Most failures trace back to one fact: the work happens on your own device, so the limits are your memory, not our servers.",
      },
      {
        href: "/guides/glossary/",
        icon: Library,
        title: "Image and PDF terminology",
        description:
          "Resolution, DPI, lossy and lossless, alpha, chroma subsampling, vector versus raster — defined plainly, each with a note on what it changes in practice.",
        finding: "Grouped by topic so you can read a section rather than hunt an alphabetical list.",
      },
    ],
  },
];

const totalGuides = groups.reduce((n, g) => n + g.items.length, 0);

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "BravoConvert Guides",
  description:
    "Guides about image and PDF conversion built on measurements taken in the same browser engine the site's converters use.",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: totalGuides,
    itemListElement: groups
      .flatMap((g) => g.items)
      .map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://bravoconvert.com${item.href}`,
        name: item.title,
      })),
  },
};

export default function GuidesIndexPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <BookMarked className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Guides
          </h1>
          <p className="mb-4 text-xl text-black">Measured answers, not rules of thumb</p>
          <p className="text-base text-gray-600">
            {totalGuides} guides on picking formats, shrinking files, converting PDFs, and what
            travels inside an image
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Published <time dateTime={PUBLISHED}>{PUBLISHED}</time> · Updated{" "}
            <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </header>

        <div className="mb-10 rounded-xl border border-blue-200 bg-blue-50 p-6 text-gray-800">
          <div className="mb-2 flex items-center gap-3 font-bold text-black">
            <FlaskConical className="h-6 w-6 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Why these guides quote exact numbers
          </div>
          <p className="leading-7">
            Most articles about image formats repeat the same approximate ratios without saying where
            they came from. The figures here were produced by a script in this project that encodes
            deterministic test images through the Canvas{" "}
            <code className="rounded bg-white/70 px-1.5 py-0.5 text-sm">toBlob</code> API in Chromium{" "}
            {benchmarks.engine} — the same code path the{" "}
            <Link className="underline font-medium" href="/convert/img/">
              Image Converter
            </Link>{" "}
            runs in your browser. So when a guide says a photo lands at {kb(webpAt(photo, 0.8))}, that
            is what this site would actually hand you. The source images are published for download so
            you can reproduce any of it.
          </p>
        </div>

        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.heading}>
              <h2 className="mb-1 text-2xl font-bold text-black">{group.heading}</h2>
              <p className="mb-5 text-gray-600">{group.blurb}</p>
              <div className="grid gap-6 md:grid-cols-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gray-400 hover:shadow-xl"
                    >
                      <Icon className="mb-4 h-8 w-8 flex-shrink-0 text-gray-700" aria-hidden="true" />
                      <h3 className="mb-2 text-xl font-bold text-black group-hover:underline">
                        {item.title}
                      </h3>
                      <p className="mb-4 leading-6 text-gray-700">{item.description}</p>
                      <p className="mt-auto rounded-lg border-l-4 border-gray-300 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
                        <strong className="text-gray-700">What we found:</strong> {item.finding}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg md:p-8">
          <h2 className="mb-3 text-2xl font-bold text-black">Where to start</h2>
          <p className="mb-4 text-gray-700 leading-7">
            If you are here because a file is too big, read{" "}
            <Link className="underline font-medium" href="/guides/reduce-image-file-size/">
              how to reduce image file size
            </Link>{" "}
            first — it ranks the four things you can change by how much they actually move the number.
            If you are choosing between formats, start with the{" "}
            <Link className="underline font-medium" href="/guides/jpg-png-webp-comparison/">
              format comparison
            </Link>
            . If something is failing outright, go straight to{" "}
            <Link className="underline font-medium" href="/guides/troubleshooting/">
              troubleshooting
            </Link>
            .
          </p>
          <p className="text-gray-700 leading-7">
            Prefer to just use the tools? The{" "}
            <Link className="underline font-medium" href="/convert/img/">
              Image Converter
            </Link>
            ,{" "}
            <Link className="underline font-medium" href="/convert/pdf/">
              PDF Converter
            </Link>{" "}
            and{" "}
            <Link className="underline font-medium" href="/edit/image/">
              Image Editor
            </Link>{" "}
            all run entirely in your browser, and the{" "}
            <Link className="underline font-medium" href="/how-to-use/">
              how-to page
            </Link>{" "}
            walks through each one.
          </p>
        </section>
      </div>
    </main>
  );
}
