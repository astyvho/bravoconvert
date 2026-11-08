import type { Metadata } from "next";
import { History } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog | BravoConvert",
  description: "What's changed in BravoConvert's image editor, image converter, PDF-to-image, PDF merge and split, and EXIF viewer tools over time.",
  alternates: { canonical: "/changelog/" },
};

const entries = [
  {
    date: "November 8, 2026",
    title: "Remove metadata straight from the EXIF viewer",
    body: "When the viewer finds a location, time or device in a photo, a Remove it now button next to the result asks which format you want — the original's, JPG, PNG or WebP, each with a one-line note on when to use it — and the clean copy downloads as soon as you pick, instead of sending you to another tool to choose the file again. The copy is redrawn from its pixels, turned the right way up, and checked again automatically so you can see that nothing identifying is left. When you go on to the converter or editor from the viewer or the Korean pages, those tools now say at the top that their output leaves the EXIF information behind.",
  },
  {
    date: "November 8, 2026",
    title: "Korean versions of the EXIF viewer and privacy guides",
    body: "The EXIF viewer, the home page and both privacy guides — what a photo reveals and what a PDF reveals — are now available in Korean under /ko/, written for Korean readers rather than machine-translated, and built on the same measurements as the English pages. A language switch in the menu moves between the two versions of each page. The converters, PDF tools and policy pages remain in English.",
  },
  {
    date: "November 8, 2026",
    title: "New guide: what a PDF reveals about who made it",
    body: "We tagged a PDF with an author, a draft title, keywords, an XMP packet and a reviewer's comment, then ran it through the merge, extract, split and PDF-to-image paths and read every output back. The document properties were dropped every time, but the comment survived all three page tools, and text hidden under a drawn black box stayed extractable. The tagged sample is published so the test can be repeated.",
  },
  {
    date: "November 8, 2026",
    title: "A clearer focus: check files before you share them",
    body: "The home page now leads with the job the site does best — finding out what a photo reveals about where, when and on what it was taken, removing it, and confirming the result. It shows the before-and-after measurement from our metadata test directly, along with what removing metadata does not protect you from. The format and PDF tools are unchanged and still listed; the EXIF viewer now comes first in the menus.",
  },
  {
    date: "October 13, 2026",
    title: "New tool: EXIF viewer",
    body: "A fifth tool shows what a JPG, PNG, or WebP photo reveals before you share it — GPS location, capture time, device, serial number, owner name, and editing software — without uploading it. The parsing library it uses cannot read WebP, so the viewer extracts the EXIF chunk from WebP files itself; all three formats were tested with the same metadata block. A sample photo with made-up details lets you try it without using one of your own.",
  },
  {
    date: "October 13, 2026",
    title: "New tool: merge and split PDF files",
    body: "A fourth tool joins several PDFs into one, extracts chosen pages, or splits every page into its own file. Pages are copied as PDF content rather than redrawn, so text stays selectable. The tool page reports what we measured when testing it, including two trade-offs: bookmarks and accessibility tags from the originals do not carry over, and splitting every page makes the files larger in total because each one carries its own copy of the fonts.",
  },
  {
    date: "October 13, 2026",
    title: "Feed descriptions corrected",
    body: "The RSS feed described the image converter as supporting GIF, which it has never accepted. The feed now lists the formats the converter actually handles — JPG, PNG, and WebP — and its links point straight to each page instead of through a redirect.",
  },
  {
    date: "September 19, 2026",
    title: "Tool links on every page, and a smaller cookie banner",
    body: "Links to the tools now appear in the footer of every page, so they can be reached from anywhere on the site. The privacy choices banner was reduced from a large card to a slim bar that no longer covers the upload area on phones, and the Privacy Policy now explains how to opt out of personalised advertising from Google and other ad networks.",
  },
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
