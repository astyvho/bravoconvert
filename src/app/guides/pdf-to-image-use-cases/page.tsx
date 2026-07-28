import type { Metadata } from "next";
import Link from "next/link";
import { Files, Presentation, Printer, ScanEye, Share2, Sheet } from "lucide-react";

export const metadata: Metadata = {
  title: "Why and When to Convert PDF Pages to Images | BravoConvert",
  description: "Common real-world situations where turning a PDF page into a JPG or PNG is more useful than sharing the whole document.",
  alternates: { canonical: "/guides/pdf-to-image-use-cases" },
};

const cases = [
  {
    icon: Share2,
    title: "Sharing a preview without the full document",
    body: "Sending every page of a multi-page PDF is overkill when someone only needs to see one page — a single image is faster to open, view, and forward in a chat app.",
  },
  {
    icon: Presentation,
    title: "Embedding a page in a slide or document",
    body: "Some presentation and word-processing tools handle images more predictably than embedded PDFs. Converting the page to a PNG keeps text and diagrams sharp when dropped into a slide.",
  },
  {
    icon: Printer,
    title: "Printing or displaying a specific page",
    body: "Kiosks, signage software, or older printing workflows sometimes only accept image files. Converting the relevant PDF page to JPG or PNG sidesteps needing a full PDF viewer.",
  },
  {
    icon: ScanEye,
    title: "Extracting a chart or diagram from a report",
    body: "Pulling one figure out of a long report as an image is often simpler than trying to copy vector content out of a PDF, especially when the source PDF was itself created from scanned pages.",
  },
  {
    icon: Sheet,
    title: "Working around tools that don't accept PDF uploads",
    body: "Some online forms, editors, or ID-verification systems only accept JPG or PNG uploads. Rendering the relevant PDF page as an image lets you use those tools without extra software.",
  },
];

export default function PdfUseCasesGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Files className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            PDF to Image Use Cases
          </h1>
          <p className="mb-8 text-xl text-black">Why turn a PDF page into a JPG or PNG at all?</p>
          <p className="text-base text-gray-600">Situations where an image is more useful than the original file</p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <p className="text-gray-700 leading-7">
            A PDF is a document format built for page layout and printing, not for easy previewing or embedding. Converting a page to an image trades away text selectability and small file size in exchange for something that opens instantly, anywhere, in any image viewer.
          </p>

          <div className="space-y-6">
            {cases.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <h2 className="mb-2 flex items-center gap-3 text-xl font-bold text-black">
                    <Icon className="h-6 w-6 flex-shrink-0 text-gray-700" aria-hidden="true" />
                    {item.title}
                  </h2>
                  <p className="text-gray-700 leading-7">{item.body}</p>
                </div>
              );
            })}
          </div>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">JPG or PNG for a PDF page?</h2>
            <p className="text-gray-700 leading-7">
              Pages that are mostly text, line art, or diagrams usually look sharper as PNG, since lossless compression avoids the soft edges JPG can introduce around high-contrast lines. Pages dominated by photographs or scanned color images typically produce a smaller file as JPG at a high quality setting. See the <Link className="underline font-medium" href="/guides/jpg-png-webp-comparison">format comparison guide</Link> for more on the tradeoff.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">What to keep in mind</h2>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>Each PDF page becomes a separate image; a multi-page PDF produces multiple files, downloadable together as a ZIP.</li>
              <li>Output pixel dimensions depend on the PDF page size and the rendering scale, not on the original scan resolution alone.</li>
              <li>Password-protected or encrypted PDFs cannot be processed without removing the protection first.</li>
              <li>Converting to an image drops the PDF's selectable text and any embedded links.</li>
            </ul>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Try it with the <Link className="underline font-medium" href="/convert/pdf">PDF to Image converter</Link>, or read the <Link className="underline font-medium" href="/how-to-use">step-by-step usage guide</Link>.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
