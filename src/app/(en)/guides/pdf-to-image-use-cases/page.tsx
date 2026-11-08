import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Files,
  Monitor,
  Presentation,
  Printer,
  Ruler,
  ScanEye,
  Share2,
  Sheet,
} from "lucide-react";
import benchmarks from "@/data/format-benchmarks.json";

const PUBLISHED = "2026-07-28";
const UPDATED = benchmarks.generatedAt;
const pdf = benchmarks.pdfPage;

export const metadata: Metadata = {
  title: "PDF to Image: What Resolution You Get, and PNG vs JPG | BravoConvert",
  description:
    "Converting a PDF page to an image renders it at 144 DPI. We measured what that means for file size, and why PNG beats JPG for text documents by a wider margin than most people expect.",
  alternates: { canonical: "/guides/pdf-to-image-use-cases/" },
  openGraph: {
    title: "PDF to Image: What Resolution You Get, and PNG vs JPG",
    description:
      "Measured output sizes for a rendered A4 page, plus the cases where converting a PDF to an image is the right call.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;
const jpegAt = (q: number) => pdf.jpeg.find((e) => e.quality === q)!.bytes;

/** The quality PDFConverter passes to toDataURL for JPG output. */
const CONVERTER_JPG_QUALITY = 0.95;
const jpgActual = jpegAt(CONVERTER_JPG_QUALITY);

const pageSizes = [
  { name: "A4", w: 595, h: 842 },
  { name: "US Letter", w: 612, h: 792 },
  { name: "US Legal", w: 612, h: 1008 },
  { name: "A3", w: 842, h: 1191 },
];

const cases = [
  {
    icon: Share2,
    title: "Sharing one page instead of the whole document",
    body: "Sending an 18-page report when someone needs page 4 makes them hunt for it. A single image opens instantly in any chat app or mail client, with no PDF viewer and no scrolling.",
  },
  {
    icon: Presentation,
    title: "Embedding a page in a slide or document",
    body: "Presentation and word-processing tools handle images far more predictably than embedded PDFs, which can re-flow, lose fonts, or refuse to render at all depending on the viewer.",
  },
  {
    icon: Printer,
    title: "Feeding a system that only accepts images",
    body: "Kiosks, signage software, older printing workflows, and many ID-verification forms accept JPG or PNG but reject PDF outright. Rendering the page sidesteps the restriction.",
  },
  {
    icon: ScanEye,
    title: "Pulling a chart or diagram out of a report",
    body: "Extracting one figure as an image is usually simpler than fighting the PDF's vector layers — and it is the only option at all when the source PDF was built from scanned pages.",
  },
  {
    icon: Sheet,
    title: "Getting past upload forms that reject PDFs",
    body: "Some online editors and submission forms only take image uploads. Converting the relevant page lets you use them without installing anything.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "PDF to Image: What Resolution You Get, and PNG vs JPG",
  description:
    "Measured output for an A4 PDF page rendered to an image at 144 DPI, including why PNG produces a smaller file than JPG for text documents.",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { "@type": "Organization", name: "BravoConvert" },
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://bravoconvert.com/guides/pdf-to-image-use-cases/",
  },
  image: "https://bravoconvert.com/guides/pdf-page-render.webp",
};

export default function PdfUseCasesGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Files className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            PDF to Image
          </h1>
          <p className="mb-4 text-xl text-black">What you actually get, and when it is worth it</p>
          <p className="text-base text-gray-600">
            The output resolution, the format choice, and the cases where an image beats the PDF
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Published <time dateTime={PUBLISHED}>{PUBLISHED}</time> · Updated{" "}
            <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <p className="text-gray-700 leading-7">
            A PDF is built for page layout and printing. Converting a page to an image trades away
            selectable text, searchability, and vector sharpness at arbitrary zoom, in exchange for a
            file that opens instantly anywhere. Whether that is a good trade depends on what happens
            to the file next — and on the resolution you get, which is the part most guides never
            mention.
          </p>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Ruler className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              The resolution you actually get
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              PDF pages are measured in points, and there are 72 points to an inch. The{" "}
              <Link className="underline font-medium" href="/convert/pdf/">
                PDF Converter
              </Link>{" "}
              renders each page at a scale factor of <strong>{pdf.scale}</strong>, which works out to{" "}
              <strong>{pdf.dpi} DPI</strong>. So a standard A4 page comes out at{" "}
              {pdf.pixelSize.width}×{pdf.pixelSize.height} pixels.
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Page size</th>
                    <th className="p-3 font-bold">Points</th>
                    <th className="p-3 font-bold">Output pixels at {pdf.dpi} DPI</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {pageSizes.map((size) => (
                    <tr key={size.name} className="border-t border-gray-200">
                      <td className="p-3 font-medium text-black">{size.name}</td>
                      <td className="p-3">
                        {size.w} × {size.h}
                      </td>
                      <td className="p-3">
                        {Math.round(size.w * pdf.scale)} × {Math.round(size.h * pdf.scale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700">
              <strong>{pdf.dpi} DPI is a screen resolution, not a print one.</strong> It is comfortably
              sharp on any display and fine for slides, chat, and web use. Commercial print generally
              wants 300 DPI, so a converted page is not a substitute for sending the original PDF to a
              printer. If you need the page for print, send the PDF.
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Monitor className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              PNG or JPG? The answer is not the usual one
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              People reach for JPG out of habit, because for photographs it is dramatically smaller.
              A document page is not a photograph. It is mostly flat white with hard-edged black text —
              precisely the content JPG handles worst and PNG handles best.
            </p>
            <p className="text-gray-700 leading-7 mb-4">
              We rendered this synthetic report page at the exact size the converter produces and
              measured both outputs:
            </p>

            <img
              src="/guides/pdf-page-render.webp"
              width={pdf.pixelSize.width}
              height={pdf.pixelSize.height}
              alt={`A synthetic report page with a heading, body text, a table and a bar chart, rendered at ${pdf.pixelSize.width} by ${pdf.pixelSize.height} pixels`}
              className="mx-auto mb-5 h-auto w-full max-w-sm rounded-lg border border-gray-200"
              loading="lazy"
            />

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Output</th>
                    <th className="p-3 font-bold">Size</th>
                    <th className="p-3 font-bold">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-t border-gray-200 bg-green-50">
                    <td className="p-3 font-medium text-black">PNG</td>
                    <td className="p-3 font-medium text-black">{kb(pdf.png)}</td>
                    <td className="p-3">Lossless — text edges stay crisp</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium text-black">
                      JPG <span className="text-gray-500">(quality {CONVERTER_JPG_QUALITY})</span>
                    </td>
                    <td className="p-3 font-medium text-black">{kb(jpgActual)}</td>
                    <td className="p-3">
                      {(jpgActual / pdf.png).toFixed(1)}× larger than PNG, and lossy
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-5 text-gray-800">
              <strong>For text documents, choose PNG.</strong> On this page JPG produced a file{" "}
              {(jpgActual / pdf.png).toFixed(1)} times larger than PNG while also introducing ringing
              around every letter. You pay more bytes for worse text. JPG only starts winning when the
              page is dominated by photographs rather than text.
            </div>

            <p className="mt-4 text-gray-700 leading-7">
              For the curious: the converter uses quality {CONVERTER_JPG_QUALITY} for JPG output.
              Lower settings do get smaller — {kb(jpegAt(0.6))} at quality 0.6 — but they visibly
              degrade text, which defeats the point of converting a document you want people to read.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-black">When converting is the right call</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {cases.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="mb-2 flex items-center gap-2 font-bold text-black">
                      <Icon className="h-5 w-5 flex-shrink-0 text-gray-700" aria-hidden="true" />
                      {item.title}
                    </div>
                    <p className="text-sm text-gray-700 leading-6">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <AlertTriangle className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              When to keep the PDF instead
            </h2>
            <ul className="space-y-3 text-gray-700 leading-7">
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                <strong>The recipient needs to search or copy the text.</strong> Rendering flattens
                everything to pixels. There is no text left to select, search, or feed to a screen
                reader.
              </li>
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                <strong>It is going to a commercial printer.</strong> {pdf.dpi} DPI will look soft in
                print. The original PDF holds vector text that prints sharp at any size.
              </li>
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                <strong>The document is long.</strong> A 40-page report becomes 40 separate files.
                They arrive as a ZIP, but the recipient still has to open them one at a time.
              </li>
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                <strong>It needs to stay a legal or archival record.</strong> An image of a signed
                document is not the same artifact as the signed PDF.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">Practical limits</h2>
            <p className="text-gray-700 leading-7">
              The PDF Converter accepts files up to <strong>50 MB</strong> and works entirely in your
              browser, so the document never gets uploaded anywhere. Password-protected or encrypted
              PDFs cannot be opened and will fail to load — remove the password in whatever tool
              created the file first. Very long or graphically dense documents take longer and use more
              memory, because every page is rendered by your own device rather than a server; on a
              phone, a large report may be worth splitting up first with the{" "}
              <Link className="underline font-medium" href="/edit/pdf/">
                PDF merge and split tool
              </Link>
              , which extracts pages without re-rendering them. The{" "}
              <Link className="underline font-medium" href="/guides/troubleshooting/">
                troubleshooting guide
              </Link>{" "}
              covers what to do when a conversion stalls.
            </p>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Convert a document with the{" "}
              <Link className="underline font-medium" href="/convert/pdf/">
                PDF Converter
              </Link>
              . If you want the result smaller still, run the PNG through the{" "}
              <Link className="underline font-medium" href="/convert/img/">
                Image Converter
              </Link>{" "}
              — WebP took this same page down to{" "}
              {kb(pdf.webp.find((w) => w.quality === 0.8)!.bytes)} in our measurements.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
