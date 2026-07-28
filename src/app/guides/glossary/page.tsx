import type { Metadata } from "next";
import { Library } from "lucide-react";

export const metadata: Metadata = {
  title: "Image and PDF Terminology Glossary | BravoConvert",
  description: "Plain-language definitions for resolution, DPI, compression, alpha channel, EXIF, and other terms used across BravoConvert.",
  alternates: { canonical: "/guides/glossary/" },
};

const terms = [
  {
    term: "Resolution",
    body: "The width and height of an image measured in pixels, such as 1920×1080. Higher resolution means more pixel detail and generally a larger file size.",
  },
  {
    term: "DPI (dots per inch)",
    body: "A print-related measurement of how densely pixels are packed when an image is printed at a given physical size. It does not change how many pixels a file contains, only how large or small those pixels appear on paper.",
  },
  {
    term: "Lossy compression",
    body: "A compression method that discards some image detail to achieve a smaller file size. JPG and lossy WebP use this approach; the loss is usually invisible at high quality settings but becomes visible as quality is lowered.",
  },
  {
    term: "Lossless compression",
    body: "A compression method that reduces file size without discarding any pixel data — decompressing the file reproduces the exact original pixels. PNG and lossless WebP use this approach.",
  },
  {
    term: "Alpha channel",
    body: "An extra layer of image data that stores transparency information per pixel, in addition to color. PNG and WebP support an alpha channel; JPG does not.",
  },
  {
    term: "Quality setting",
    body: "A percentage-style control for lossy formats like JPG and WebP that trades file size against visual detail. Lower quality means a smaller file and more visible compression artifacts.",
  },
  {
    term: "Target file size",
    body: "An optional setting where you specify a desired output size in KB, and the converter adjusts the quality level to approach that target. The result is an estimate, since exact size depends on the image content.",
  },
  {
    term: "EXIF metadata",
    body: "A block of information embedded in an image file by cameras and phones, which can include capture date, camera settings, and GPS location. See the dedicated EXIF and privacy guide for more.",
  },
  {
    term: "Batch conversion",
    body: "Converting multiple files to the same output format in a single operation, rather than one at a time.",
  },
  {
    term: "Aspect ratio",
    body: "The proportional relationship between an image's width and height, such as 16:9 or 4:3. Locking aspect ratio while resizing prevents an image from looking stretched or squeezed.",
  },
  {
    term: "Non-destructive editing",
    body: "An editing approach where changes are only applied to a preview or working copy, leaving the original file untouched until you explicitly export the result.",
  },
  {
    term: "Rendering (PDF)",
    body: "The process of drawing a PDF page's content onto a canvas so it can be captured as a JPG or PNG image, typically at a defined scale relative to the page's original size.",
  },
];

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Library className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Glossary
          </h1>
          <p className="mb-8 text-xl text-black">Terms used across BravoConvert, in plain language</p>
        </header>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <dl className="divide-y divide-gray-200">
            {terms.map((item) => (
              <div key={item.term} className="py-5 first:pt-0 last:pb-0">
                <dt className="mb-2 text-xl font-bold text-black">{item.term}</dt>
                <dd className="text-gray-700 leading-7">{item.body}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </main>
  );
}
