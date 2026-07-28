import type { Metadata } from "next";
import { History } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog | BravoConvert",
  description: "What's changed in BravoConvert's image editor, image converter, and PDF-to-image tools over time.",
  alternates: { canonical: "/changelog/" },
};

const entries = [
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
