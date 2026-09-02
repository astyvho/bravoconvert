import type { Metadata } from "next";
import { History } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog | BravoConvert",
  description: "What's changed in BravoConvert's image editor, image converter, and PDF-to-image tools over time.",
  alternates: { canonical: "/changelog/" },
};

const entries = [
  {
    date: "September 2, 2026",
    title: "Contact address no longer obscured",
    body: "The email address on the Contact and Privacy Policy pages was being rewritten by the CDN into a placeholder behind a link that led nowhere for anyone browsing without JavaScript. Both pages now show the real address, and the link works.",
  },
  {
    date: "September 2, 2026",
    title: "Corrected the Privacy Policy",
    body: "The policy still described the previous behaviour, where the Google Analytics and AdSense scripts loaded only after you accepted cookies. Since August that has not been how the site works: both tags load with the page, and Consent Mode holds storage and personalisation off until you choose. The policy now says so, and adds the honest caveat that Google receives the request itself either way.",
  },
  {
    date: "September 2, 2026",
    title: "Guides rebuilt on measured data",
    body: "All six guides were rewritten around byte counts measured in the same browser engine the converters use, with the test images published so anyone can reproduce them. Several previous claims turned out to be wrong when tested — downscaling shrinks files by more than the pixel count suggests, WebP is not always smaller than JPG, and for text documents PNG beats JPG on both size and quality.",
  },
  {
    date: "September 2, 2026",
    title: "English error messages in the PDF converter",
    body: "Some error messages in the PDF tool were still appearing in Korean on an otherwise English site. All of them are now in English, and several were rewritten to say what to do next rather than only what went wrong.",
  },
  {
    date: "September 2, 2026",
    title: "PDF page heading fixed",
    body: "While PDF.js was still loading, the converter page replaced its entire heading with a setup message. The page title and description now stay visible throughout, with a quieter loading indicator beneath them.",
  },
  {
    date: "August 20, 2026",
    title: "Analytics and advertising tags now load on every page",
    body: "Both Google tags previously waited for a consent click before loading at all. They now load with the page and rely on Consent Mode, denied by default, to govern what they may store or personalise — the arrangement Google documents for this purpose.",
  },
  {
    date: "July 28, 2026",
    title: "Improved cookie consent and privacy verification",
    body: "Clarified the consent flow for optional analytics and advertising cookies, and reviewed production behavior against the Privacy Policy.",
  },
  {
    date: "July 19, 2026",
    title: "Added the Image Editor",
    body: "Introduced a dedicated Image Editor for resizing with aspect-ratio locking, 90-degree rotation, horizontal and vertical flipping, and JPG/PNG/WebP export — kept separate from the Image Converter so each tool stays focused.",
  },
  {
    date: "July 19, 2026",
    title: "Expanded usage guides and page content",
    body: "Rewrote the How to Use, About, and Privacy Policy pages with clearer, more specific explanations of local processing and supported workflows.",
  },
  {
    date: "July 18, 2026",
    title: "Clipboard paste support",
    body: "Added support for pasting a supported image directly from the clipboard into the Image Converter, instead of requiring a file picker or drag-and-drop every time.",
  },
  {
    date: "July 18, 2026",
    title: "Compression and target file size controls",
    body: "Added an adjustable quality level and an optional target file size in KB for JPG and WebP output, alongside continued production reliability fixes for image conversion.",
  },
  {
    date: "2025",
    title: "Initial release",
    body: "Launched browser-based JPG, PNG, and WebP image conversion, batch processing with ZIP downloads, combining images into a PDF, and rendering PDF pages as JPG or PNG — all processed locally without uploading file contents.",
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <History className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Changelog
          </h1>
          <p className="mb-8 text-xl text-black">What's changed in BravoConvert</p>
          <p className="text-base text-gray-600">A running log of notable updates to the editor, converter, and PDF tools</p>
        </header>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <ol className="space-y-8">
            {entries.map((entry) => (
              <li key={entry.title + entry.date} className="border-l-4 border-black pl-6">
                <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">{entry.date}</div>
                <h2 className="mb-2 text-xl font-bold text-black">{entry.title}</h2>
                <p className="text-gray-700 leading-7">{entry.body}</p>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </main>
  );
}
