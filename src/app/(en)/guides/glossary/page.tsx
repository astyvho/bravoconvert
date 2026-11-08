import type { Metadata } from "next";
import Link from "next/link";
import { Library } from "lucide-react";
import benchmarks from "@/data/format-benchmarks.json";

const PUBLISHED = "2026-07-28";
const UPDATED = benchmarks.generatedAt;

export const metadata: Metadata = {
  title: "Image and PDF Terminology Glossary | BravoConvert",
  description:
    "Plain-language definitions for resolution, DPI, compression, alpha channel, EXIF, chroma subsampling and the other terms that come up when converting images and PDFs — with what each one means in practice.",
  alternates: { canonical: "/guides/glossary/" },
  openGraph: {
    title: "Image and PDF Terminology Glossary",
    description:
      "What the terms mean, and why each one changes what comes out of a converter.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

type Term = {
  term: string;
  group: string;
  body: string;
  practical?: string;
};

const terms: Term[] = [
  {
    term: "Pixel",
    group: "Size and shape",
    body: "The smallest unit of an image: one square of a single colour. Everything else on this page is ultimately a statement about pixels — how many there are, how they are stored, and how faithfully they are reproduced.",
  },
  {
    term: "Resolution",
    group: "Size and shape",
    body: "The width and height of an image in pixels, written as 1920×1080. It describes how much detail the file can hold, and nothing about physical size.",
    practical:
      "Resolution is the biggest single driver of file size after format. Halving both dimensions removes three quarters of the pixels.",
  },
  {
    term: "Megapixel",
    group: "Size and shape",
    body: "One million pixels — width times height, divided by a million. A 4000×3000 photo is 12 megapixels.",
    practical:
      "Useful for judging memory cost. Every megapixel needs about 4 MB of RAM while being processed, which is why very large photos fail on phones.",
  },
  {
    term: "Aspect ratio",
    group: "Size and shape",
    body: "The proportional relationship between width and height, such as 16:9 or 4:3. Two images can share an aspect ratio at wildly different resolutions.",
    practical:
      "Leave the aspect ratio locked when resizing unless you deliberately want a stretched image. Unlocking it is how photos end up looking squashed.",
  },
  {
    term: "DPI (dots per inch)",
    group: "Size and shape",
    body: "How densely pixels are packed when an image is printed at a given physical size. It is a property of printing, not of the file — changing the DPI number alone adds no detail.",
    practical: `The PDF Converter renders pages at ${benchmarks.pdfPage.dpi} DPI, which is sharp on screen. Commercial print generally expects 300 DPI.`,
  },

  {
    term: "Lossy compression",
    group: "How files get smaller",
    body: "A method that permanently discards image detail to reach a smaller file. JPG and lossy WebP work this way. What gets discarded is chosen to be what the eye notices least.",
    practical:
      "Each re-encode loses a little more. Editing a JPG repeatedly and re-saving compounds the damage; work from the original whenever you can.",
  },
  {
    term: "Lossless compression",
    group: "How files get smaller",
    body: "A method that shrinks the file with no loss at all — decompressing reproduces the original pixels exactly. PNG and lossless WebP work this way.",
    practical:
      "Lossless is not automatically smaller. On a photograph, PNG can be more than ten times the size of a JPG of the same image.",
  },
  {
    term: "Quality setting",
    group: "How files get smaller",
    body: "A dial on lossy formats controlling how aggressively detail is discarded, usually expressed from 0 to 1 or 0 to 100.",
    practical:
      "The scale is not linear. On our test photo, moving from quality 0.8 to 0.95 roughly tripled the file for a difference most people cannot see.",
  },
  {
    term: "Compression artifact",
    group: "How files get smaller",
    body: "Visible damage introduced by lossy compression: blocky squares in smooth gradients, halos around hard edges, or smeared fine texture.",
    practical:
      "Artifacts appear first around text and sharp lines, which is why lossy formats suit photographs and suit screenshots badly.",
  },
  {
    term: "Chroma subsampling",
    group: "How files get smaller",
    body: "A trick used by JPG where colour information is stored at lower resolution than brightness, because human vision is far more sensitive to brightness detail than to colour detail.",
    practical:
      "It is part of why fine red text on a JPG can look muddier than the same text in a PNG.",
  },
  {
    term: "Target file size",
    group: "How files get smaller",
    body: "An option where you name a size in KB and the converter searches for a quality setting that lands under it, re-encoding several times and keeping the closest result.",
    practical:
      "It is an approach, not a calculation. A noisy photograph has a much higher achievable floor than a flat graphic does.",
  },

  {
    term: "Alpha channel",
    group: "Colour and transparency",
    body: "A per-pixel transparency value stored alongside colour. It is what lets a logo sit cleanly on any background instead of arriving in a white box.",
    practical:
      "PNG and WebP have one. JPG does not, and never will — converting a transparent image to JPG fills the transparent pixels with a solid colour.",
  },
  {
    term: "Colour depth",
    group: "Colour and transparency",
    body: "How many bits describe each pixel. Ordinary web images use 8 bits per channel, giving 256 levels each of red, green and blue.",
    practical:
      "Low colour depth causes banding — visible steps in what should be a smooth gradient, most noticeable in skies.",
  },
  {
    term: "Colour profile",
    group: "Colour and transparency",
    body: "A tag describing which colour space the numbers in a file refer to, such as sRGB or Display P3. The same RGB values mean different colours in different spaces.",
    practical:
      "A photo that looks vivid in one app and flat in another is usually a profile mismatch rather than a conversion fault.",
  },

  {
    term: "EXIF metadata",
    group: "Metadata and privacy",
    body: "A block of data cameras and phones write inside an image: capture time, camera model, exposure settings, an orientation flag, and often GPS coordinates.",
    practical:
      "Invisible in the picture but easy to read with common tools. See the EXIF and privacy guide, which tests what survives a conversion.",
  },
  {
    term: "Orientation flag",
    group: "Metadata and privacy",
    body: "An EXIF field telling viewers which way up the image should be displayed, used because phones often store the sensor image as captured rather than rotating the pixels.",
    practical:
      "Software that ignores the flag shows the photo sideways. BravoConvert reads it and bakes the rotation into the pixels, so the output needs no flag.",
  },

  {
    term: "Rendering (PDF)",
    group: "PDF",
    body: "Drawing a PDF page's vector instructions onto a pixel canvas so it can be saved as an image, at a chosen scale relative to the page's own coordinate system.",
    practical:
      "PDF measures pages in points at 72 to the inch, so a scale factor of 2 produces 144 DPI.",
  },
  {
    term: "Vector vs raster",
    group: "PDF",
    body: "Vector content is stored as shapes and text that can be redrawn at any size; raster content is a fixed grid of pixels. PDFs usually hold vector text; images are always raster.",
    practical:
      "Converting a PDF page to an image turns vector into raster, which is why the result softens when enlarged and why the text stops being selectable.",
  },

  {
    term: "Batch conversion",
    group: "Working with files",
    body: "Converting several files to the same output format in one operation instead of one at a time.",
    practical:
      "Results arrive as a ZIP when there is more than one file. On iOS you have to tap the ZIP to expand it.",
  },
  {
    term: "Non-destructive editing",
    group: "Working with files",
    body: "An approach where edits are held as instructions against a working copy, leaving the source untouched until you export.",
    practical:
      "It is why Reset returns the original image intact, and why nothing you do in the editor changes the file on your disk.",
  },
  {
    term: "Client-side processing",
    group: "Working with files",
    body: "Work performed by your own browser rather than by a server. The file is read from disk into memory on your device and never transmitted.",
    practical:
      "This is why there are size ceilings and why speed depends on your hardware — and why your files are never uploaded anywhere.",
  },
];

const groups = Array.from(new Set(terms.map((t) => t.group)));

const glossarySchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "Image and PDF Terminology Glossary",
  description:
    "Definitions of the image and PDF terms used across BravoConvert, with practical notes on what each one changes.",
  hasDefinedTerm: terms.map((t) => ({
    "@type": "DefinedTerm",
    name: t.term,
    description: t.body,
  })),
};

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossarySchema) }}
      />
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Library className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Glossary
          </h1>
          <p className="mb-4 text-xl text-black">
            {terms.length} terms, in plain language
          </p>
          <p className="text-base text-gray-600">
            Each one with what it means and what it actually changes about your file
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Published <time dateTime={PUBLISHED}>{PUBLISHED}</time> · Updated{" "}
            <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </header>

        <article className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <nav aria-label="Sections" className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <a
                key={group}
                href={`#${group.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className="rounded-full border border-gray-300 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                {group}
              </a>
            ))}
          </nav>

          {groups.map((group) => (
            <section key={group} id={group.toLowerCase().replace(/[^a-z]+/g, "-")}>
              <h2 className="mb-4 border-b border-gray-200 pb-2 text-2xl font-bold text-black">
                {group}
              </h2>
              <dl className="divide-y divide-gray-200">
                {terms
                  .filter((t) => t.group === group)
                  .map((item) => (
                    <div key={item.term} className="py-5 first:pt-0 last:pb-0">
                      <dt className="mb-2 text-lg font-bold text-black">{item.term}</dt>
                      <dd className="text-gray-700 leading-7">
                        {item.body}
                        {item.practical && (
                          <span className="mt-2 block rounded-lg border-l-4 border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-600">
                            <strong className="text-gray-700">In practice:</strong> {item.practical}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
              </dl>
            </section>
          ))}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Several of these terms are explored with measured numbers in the{" "}
              <Link className="underline font-medium" href="/guides/jpg-png-webp-comparison/">
                format comparison
              </Link>{" "}
              and{" "}
              <Link className="underline font-medium" href="/guides/reduce-image-file-size/">
                file size
              </Link>{" "}
              guides, or browse everything in the{" "}
              <Link className="underline font-medium" href="/guides/">
                guides index
              </Link>
              .
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
