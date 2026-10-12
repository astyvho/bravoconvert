import type { Metadata } from "next";
import Link from "next/link";
import { BookmarkX, CircleAlert, Combine, FileStack, Gauge, ListOrdered, Scissors, ShieldCheck } from "lucide-react";
import PdfOrganizer from "@/components/PdfOrganizer";
import data from "@/data/pdf-tool-benchmarks.json";

export const metadata: Metadata = {
  alternates: { canonical: "/edit/pdf/" },
  title: "Merge PDF and Split PDF Online Free - No Upload | BravoConvert",
  description: "Combine PDF files into one or extract pages from a PDF directly in your browser. Pages are copied, not re-rendered, so text stays selectable. Nothing is uploaded.",
  keywords: ["merge pdf", "split pdf", "combine pdf files", "extract pdf pages", "pdf page range", "merge pdf without upload"],
  openGraph: {
    title: "Merge and Split PDF Files in Your Browser",
    description: "Combine PDFs or extract pages without uploading them. Text stays selectable.",
    type: "website",
  },
};

const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;
const pct = (ratio: number) => `${Math.round(ratio * 100)}%`;

const SECTION = "flex items-center gap-3 text-2xl font-bold text-black";
const ICON = "h-7 w-7 flex-shrink-0 text-gray-700";

export default function PdfOrganizerPage() {
  const { sources, merge, split, extract } = data;
  const resavedSum = sources.a.resavedBytes + sources.b.resavedBytes;
  const averageSingle = split.total / split.files;

  return (
    <main className="min-h-screen bg-white pt-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "BravoConvert PDF Merge and Split",
            url: "https://bravoconvert.com/edit/pdf/",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: ["Merge PDF files", "Reorder files before merging", "Extract page ranges", "Split every page into separate PDFs", "Browser-only processing"],
          }),
        }}
      />
      <PdfOrganizer />

      <article className="mx-auto mt-8 max-w-4xl space-y-10 rounded-3xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm md:p-10">
        <header>
          <h2 className={SECTION}>
            <Combine className={ICON} aria-hidden="true" />
            Combine and split PDFs without uploading them
          </h2>
          <p className="mt-4 leading-7">
            This tool joins several PDF files into one document, pulls chosen pages out of a PDF, or breaks a PDF into one file per page. It runs entirely in your browser: the documents are read from your device, rebuilt in memory, and handed back as a download. Nothing is sent to a BravoConvert server, which matters for the kinds of files people usually combine — contracts, invoices, medical forms, scanned IDs.
          </p>
        </header>

        <section>
          <h2 className={SECTION}>
            <FileStack className={ICON} aria-hidden="true" />
            Pages are copied, not re-rendered
          </h2>
          <p className="mt-3 leading-7">
            A PDF page is a set of drawing instructions — place this text in this font here, draw this line, show this image — rather than a picture. Merging and splitting here copy those instructions from the source file into a new one without redrawing anything. Text stays as text you can select, search, and copy; vector drawings stay sharp at any zoom; embedded images keep their original data.
          </p>
          <p className="mt-3 leading-7">
            We checked this rather than assuming it. After merging two test documents, the text on the first page of each was extracted back out of the merged file: both came back as real, selectable text ({merge.textSelectableFromA && merge.textSelectableFromB ? "confirmed for both documents" : "not confirmed"}). That is the difference from the <Link href="/convert/pdf/" className="font-medium text-black underline">PDF to image converter</Link>, which deliberately turns each page into a 144 DPI picture — useful for slides and previews, but the text is no longer text.
          </p>
        </section>

        <section>
          <h2 className={SECTION}>
            <Gauge className={ICON} aria-hidden="true" />
            What happened to file size when we measured it
          </h2>
          <p className="mt-3 leading-7">
            We printed two report-style documents from Chromium — {sources.a.pages} and {sources.b.pages} pages, with headings, tables, embedded fonts, bookmarks, and accessibility tags — then ran them through the same merge and split code this page uses.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-black">
                  <th className="py-2 pr-4 font-semibold">Operation</th>
                  <th className="py-2 pr-4 font-semibold">Pages</th>
                  <th className="py-2 pr-4 font-semibold">Size</th>
                  <th className="py-2 font-semibold">Compared with</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200"><td className="py-2 pr-4">Source A</td><td className="py-2 pr-4">{sources.a.pages}</td><td className="py-2 pr-4">{kb(sources.a.bytes)}</td><td className="py-2">—</td></tr>
                <tr className="border-b border-gray-200"><td className="py-2 pr-4">Source B</td><td className="py-2 pr-4">{sources.b.pages}</td><td className="py-2 pr-4">{kb(sources.b.bytes)}</td><td className="py-2">—</td></tr>
                <tr className="border-b border-gray-200"><td className="py-2 pr-4">Merge A + B</td><td className="py-2 pr-4">{merge.pages}</td><td className="py-2 pr-4">{kb(merge.bytes)}</td><td className="py-2">{pct(merge.ratioToSum)} of {kb(merge.sumOfSources)} combined</td></tr>
                <tr className="border-b border-gray-200"><td className="py-2 pr-4">Extract pages {extract.range} of A</td><td className="py-2 pr-4">{extract.pages}</td><td className="py-2 pr-4">{kb(extract.bytes)}</td><td className="py-2">{pct(extract.ratioToSource)} of A for {pct(extract.shareOfPages)} of its pages</td></tr>
                <tr><td className="py-2 pr-4">Split A into single pages</td><td className="py-2 pr-4">{split.files} files</td><td className="py-2 pr-4">{kb(split.total)} total</td><td className="py-2">{split.ratioToSource.toFixed(2)}× the size of A</td></tr>
              </tbody>
            </table>
          </div>
          <h3 className="mt-6 text-lg font-semibold text-black">Why the merged file came out smaller</h3>
          <p className="mt-2 leading-7">
            A merged file smaller than its inputs looks like something was thrown away, so we isolated the cause. Re-saving source A on its own, with no pages changed, already took it from {kb(sources.a.bytes)} to {kb(sources.a.resavedBytes)}: the library writes the PDF&apos;s internal objects in a compressed form that the original file did not use. The two re-saved sources add up to {kb(resavedSum)}, and the merged file is {kb(merge.bytes)}. That remaining gap is the document-level extras described below, which a merge does not carry over. The page content itself is unchanged.
          </p>
          <h3 className="mt-6 text-lg font-semibold text-black">Why splitting every page made the total bigger</h3>
          <p className="mt-2 leading-7">
            The {split.files} single-page files averaged {kb(averageSingle)} each, about {split.ratioToSource.toFixed(1)}× the original in total. In the original, all pages share one copy of each embedded font. Once every page is a separate document, each file has to carry its own copy of the fonts it uses. Extracting a range behaves the same way on a smaller scale: three pages of six kept {pct(extract.ratioToSource)} of the size rather than half, because the fonts came along whole. If the goal is a smaller file to email, splitting is not the way to get it.
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Measured on {data.measuredOn} with {data.browser} and {data.library}. Your documents will produce different absolute numbers; the direction of each effect is what transfers.
          </p>
        </section>

        <section>
          <h2 className={SECTION}>
            <BookmarkX className={ICON} aria-hidden="true" />
            What does not carry over
          </h2>
          <p className="mt-3 leading-7">
            Some parts of a PDF belong to the document as a whole rather than to any page. The new file is built from pages only, so these are left behind:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li><strong className="text-black">Bookmarks.</strong> Both test sources had a bookmark panel; the merged file had none ({merge.hasOutline ? "still present" : "measured"}). Long reports that rely on bookmarks for navigation will need them added again in a PDF editor.</li>
            <li><strong className="text-black">Accessibility tags.</strong> Both sources were tagged PDFs, the structure screen readers use to read headings, lists, and tables in order. The merged file was not ({merge.hasStructTree ? "still present" : "measured"}). If a document has to meet an accessibility requirement, merge it in software that preserves tags.</li>
            <li><strong className="text-black">Digital signatures.</strong> A merged or extracted file is a new document, so it cannot carry a valid signature from the original. Keep the signed original for anything that has to be verified.</li>
          </ul>
          <p className="mt-3 leading-7">
            Document title and author fields are also not copied from the sources. For fillable forms, open the result and check the fields still behave as expected before relying on it.
          </p>
        </section>

        <section>
          <h2 className={SECTION}>
            <ListOrdered className={ICON} aria-hidden="true" />
            Writing page ranges
          </h2>
          <p className="mt-3 leading-7">
            In Split mode, the pages box accepts single pages and ranges separated by commas. Pages are numbered from 1, as in any PDF viewer.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-black">1-3, 5</code> — pages 1, 2, 3 and 5.</li>
            <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-black">5, 1</code> — page 5 followed by page 1. The new PDF follows the order you type, so this is also a quick way to reorder a few pages.</li>
            <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-black">2, 2</code> — page 2 twice. Repeats are kept, which is handy for duplicating a cover sheet.</li>
          </ul>
          <p className="mt-3 leading-7">
            A range must run from the smaller number to the larger one, and a page beyond the end of the document is rejected with a message naming the last page, rather than being silently skipped.
          </p>
        </section>

        <section>
          <h2 className={SECTION}>
            <Scissors className={ICON} aria-hidden="true" />
            Which BravoConvert tool to use
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li>Join PDFs, remove pages, or reorder a few pages while keeping text selectable: this tool.</li>
            <li>Turn PDF pages into JPG or PNG pictures for slides, social posts, or thumbnails: the <Link href="/convert/pdf/" className="font-medium text-black underline">PDF to image converter</Link>.</li>
            <li>Turn photos or screenshots into a PDF: the <Link href="/convert/img/" className="font-medium text-black underline">image converter</Link> with PDF selected as the output.</li>
          </ul>
        </section>

        <section>
          <h2 className={SECTION}>
            <ShieldCheck className={ICON} aria-hidden="true" />
            Limits and private processing
          </h2>
          <p className="mt-3 leading-7">
            Each PDF can be up to 50 MB, and a merge can take up to 30 files with a combined size of 150 MB. The whole job happens in your browser&apos;s memory, so these limits exist to keep phones and older laptops from running out of it partway through. Password-protected and encrypted PDFs cannot be opened; remove the protection in the application that created the file first.
          </p>
        </section>

        <section>
          <h2 className={SECTION}>
            <CircleAlert className={ICON} aria-hidden="true" />
            Troubleshooting
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li><strong className="text-black">&ldquo;Not a PDF file.&rdquo;</strong> The file is another format with a .pdf name, or the browser did not report it as a PDF. Open it in a PDF viewer to confirm.</li>
            <li><strong className="text-black">&ldquo;Password-protected or encrypted.&rdquo;</strong> Remove the password in the original application, save a copy, and add that copy.</li>
            <li><strong className="text-black">A large merge stops responding.</strong> Merge in smaller groups, then merge the results, and close other heavy tabs.</li>
            <li><strong className="text-black">The merged file has no bookmarks.</strong> Expected; see &ldquo;What does not carry over&rdquo; above.</li>
          </ul>
          <p className="mt-4 leading-7">
            If a valid PDF consistently fails, see the <Link href="/faq/" className="font-medium text-black underline">FAQ</Link> or use the <Link href="/contact/" className="font-medium text-black underline">contact page</Link> with your browser, device, and the error shown — but do not send the document itself.
          </p>
        </section>
      </article>
    </main>
  );
}
