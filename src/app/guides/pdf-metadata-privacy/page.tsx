import type { Metadata } from "next";
import Link from "next/link";
import { Check, Download, FileImage, FileText, FlaskConical, MessageSquare, ShieldAlert, SquareStack, X } from "lucide-react";
import demo from "@/data/pdf-metadata-demo.json";

const PUBLISHED = "2026-11-08";
const UPDATED = demo.measuredOn;

export const metadata: Metadata = {
  title: "What a PDF Reveals About Who Made It: Tested Before and After | BravoConvert",
  description:
    "We gave a PDF an author, a title, keywords, an XMP packet and a reviewer's comment, then merged, split and rendered it. Document properties were dropped — the comment, and text hidden under a black box, were not.",
  alternates: { canonical: "/guides/pdf-metadata-privacy/" },
  openGraph: {
    title: "What a PDF Reveals About Who Made It",
    description:
      "A tagged PDF run through merge, extract, split and PDF-to-image, then read back. What was removed, what survived, and why.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

type Props = typeof demo.source.properties;

const PROPERTY_ROWS: { key: keyof Props; label: string; note: string }[] = [
  { key: "Title", label: "Title", note: "Often a working title or file name, drafts and version numbers included" },
  { key: "Author", label: "Author", note: "Usually filled in from the name on the account that saved the file" },
  { key: "Subject", label: "Subject", note: "Rarely seen, sometimes revealing" },
  { key: "Keywords", label: "Keywords", note: "Free text the author or a template added" },
  { key: "Creator", label: "Creator (app)", note: "The application the document was written in" },
  { key: "Producer", label: "Producer", note: "The software that wrote the PDF, often with a version" },
  { key: "CreationDate", label: "Created", note: "When the PDF was first made" },
  { key: "ModDate", label: "Modified", note: "When it was last saved" },
];

const show = (value: string | null) => {
  if (value === null) return null;
  return /^\d{4}-\d{2}-\d{2}T/.test(value) ? `${value.slice(0, 10)} ${value.slice(11, 19)} UTC` : value;
};

const outputs = [
  { id: "merged", label: "Merged with a second PDF", result: demo.merged },
  { id: "extracted", label: `Pages ${demo.extracted.range} extracted`, result: demo.extracted },
  { id: "split", label: "Split, first page", result: demo.splitFirstPage },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What a PDF Reveals About Who Made It: Tested Before and After",
  description:
    "An empirical test of which PDF document properties, XMP metadata and comments survive merging, page extraction, splitting and rendering to images.",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { "@type": "Organization", name: "BravoConvert" },
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://bravoconvert.com/guides/pdf-metadata-privacy/" },
};

function Gone() {
  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-green-700">
      <Check className="h-4 w-4" aria-hidden="true" /> gone
    </span>
  );
}

function Kept({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-red-700">
      <X className="h-4 w-4 flex-shrink-0" aria-hidden="true" /> {children}
    </span>
  );
}

export default function PdfMetadataGuide() {
  const commentSurvived = outputs.every((o) => o.result.comments.some((c) => c.author === demo.planted.commentAuthor));
  const xmpGone = outputs.every((o) => !o.result.xmp.present);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <FileText className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            What a PDF Reveals
          </h1>
          <p className="mb-4 text-xl text-black">The author, the app, the dates — and the comments you forgot about</p>
          <p className="text-base text-gray-600">
            We tagged a PDF, ran it through merge, extract, split and PDF-to-image, and read every output back
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Published <time dateTime={PUBLISHED}>{PUBLISHED}</time> · Updated <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <FileText className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              A PDF carries a second document about itself
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              Besides its pages, a PDF holds a small set of document properties — title, author, subject, keywords,
              the app it was written in, the software that produced the PDF, and when it was created and last
              saved. Many files also carry the same facts again in an XMP packet, a block of XML that some apps
              write and others read. None of it appears on the page. Most PDF readers show it only under
              File → Properties, which is why it gets forgotten.
            </p>
            <p className="text-gray-700 leading-7">
              Even a PDF nobody consciously tagged has some. We printed a plain HTML page to PDF in Chromium{" "}
              {demo.browser.replace("Chromium ", "")} with no settings changed, and it recorded the page title as{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">{demo.chromiumDefault.properties.Title}</code>, the
              creator as <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">{demo.chromiumDefault.properties.Creator}</code>,
              the producer as{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">{demo.chromiumDefault.properties.Producer}</code> —
              which names the browser&apos;s major version — and the exact second it was printed.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <FlaskConical className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              The test
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              We took that Chromium-printed {demo.source.pages}-page report and gave it the kind of properties an office
              app writes: an author, a draft title, a subject, keywords, the name of the writing app, created and
              modified dates from months earlier, and an XMP packet naming the author again. We also added one thing
              people forget far more often than properties — a reviewer&apos;s sticky-note comment on page 1. Every
              name and value is made up.
            </p>
            <p className="text-gray-700 leading-7">
              That file then went through the exact code behind{" "}
              <Link className="underline font-medium" href="/edit/pdf/">Merge &amp; Split PDF</Link> three ways —
              merged with a second PDF, pages {demo.extracted.range} extracted, and split into single pages — and through
              the same PDF.js render and canvas encode that the{" "}
              <Link className="underline font-medium" href="/convert/pdf/">PDF to Image converter</Link> uses. Each output
              was opened and read back.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <SquareStack className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Merge, extract and split: the properties were dropped
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Property</th>
                    <th className="p-3 font-bold">In the tagged original</th>
                    <th className="p-3 font-bold">After merge, extract or split</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {PROPERTY_ROWS.map((row) => {
                    const before = show(demo.source.properties[row.key]);
                    const after = show(demo.merged.properties[row.key]);
                    const sameEverywhere = outputs.every((o) => show(o.result.properties[row.key]) === after);
                    return (
                      <tr key={row.key} className="border-t border-gray-200 align-top">
                        <td className="p-3">
                          <div className="font-medium text-black">{row.label}</div>
                          <div className="text-xs text-gray-500">{row.note}</div>
                        </td>
                        <td className="p-3 font-mono text-xs">{before ?? "—"}</td>
                        <td className="p-3">
                          {after === null ? (
                            <Gone />
                          ) : (
                            <span className="text-gray-700">
                              Replaced: <span className="font-mono text-xs">{after}</span>
                              {!sameEverywhere && " (varies by output)"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-gray-200 align-top">
                    <td className="p-3">
                      <div className="font-medium text-black">XMP packet</div>
                      <div className="text-xs text-gray-500">A second copy of author and app, in XML</div>
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {demo.source.xmp.present ? `present, names ${demo.planted.xmpCreator}` : "absent"}
                    </td>
                    <td className="p-3">{xmpGone ? <Gone /> : <Kept>still present</Kept>}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-5 text-gray-800 leading-7">
              <strong>All three outputs behaved the same.</strong> The tool builds a new, empty PDF and copies pages into
              it, and document properties belong to the document rather than to any page, so there is nothing to copy
              them from. The new file does get properties of its own: the producer and creator name the PDF library the
              tool uses, and the created and modified dates are the moment you ran the tool
              {demo.merged.rawCreationDate?.endsWith("Z") ? ", written in UTC" : ""}. If the time you prepared a
              file is itself sensitive, that is worth knowing.
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <MessageSquare className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              The comment survived every time
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              This is the result that matters most. Comments, highlights and sticky notes are annotations, and
              annotations are attached to the page they sit on. Copying the page copies them.
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Output</th>
                    <th className="p-3 font-bold">Comment author</th>
                    <th className="p-3 font-bold">Comment text</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {outputs.map((o) => {
                    const comment = o.result.comments[0];
                    return (
                      <tr key={o.id} className="border-t border-gray-200 align-top">
                        <td className="p-3 font-medium text-black">{o.label}</td>
                        <td className="p-3">{comment ? <Kept>{comment.author}</Kept> : <Gone />}</td>
                        <td className="p-3 text-xs">{comment ? `“${comment.text}”` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-gray-700 leading-7">
              {commentSurvived
                ? "Removing the author from the properties while leaving a reviewer's name and an internal remark on page 1 is the kind of half-clean file that causes real embarrassment."
                : "In this run the comment did not survive every output; check your own file rather than relying on this result."}{" "}
              Delete comments in the app that made the PDF, or turn the pages into images (below), before the file
              leaves your hands.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <ShieldAlert className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              A black box over text is not a redaction
            </h2>
            <p className="text-gray-700 leading-7">
              We drew a filled black rectangle over the heading of page 1 — the way people often &ldquo;black out&rdquo; a
              name — and then extracted that page. The heading text &ldquo;{demo.coveredText.text}&rdquo; was{" "}
              {demo.coveredText.extractableInSource ? "still extractable from the covered original" : "not extractable from the covered original"}
              {demo.coveredText.extractableAfterExtract ? ", and still extractable from the extracted page" : ""}. The box
              is drawn on top; the words underneath remain part of the page, so selecting and copying, or any text
              extraction tool, recovers them. Page tools copy what is on the page, box and hidden text alike.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <FileImage className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Rendering a page to an image: pixels and nothing else
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              Page 1 of the tagged file was rendered at {demo.pageAsImage.pixelSize.width}×{demo.pageAsImage.pixelSize.height}{" "}
              pixels and encoded as PNG and as JPG, the way the converter does it. We then listed every block inside each
              image file.
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Output</th>
                    <th className="p-3 font-bold">What the file contains</th>
                    <th className="p-3 font-bold">Document properties or comment text</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-t border-gray-200 align-top">
                    <td className="p-3 font-medium text-black">PNG</td>
                    <td className="p-3 text-xs">
                      Chunks: <span className="font-mono">{demo.pageAsImage.png.structure.join(", ")}</span> — the header,
                      the pixel data and the end marker. No text, EXIF or XMP chunks.
                    </td>
                    <td className="p-3">{demo.pageAsImage.png.containsAnyDocumentText ? <Kept>found</Kept> : <Gone />}</td>
                  </tr>
                  <tr className="border-t border-gray-200 align-top">
                    <td className="p-3 font-medium text-black">JPG</td>
                    <td className="p-3 text-xs">
                      A JFIF header, an ICC colour profile, and the compressed image. No EXIF or XMP segment.
                    </td>
                    <td className="p-3">
                      {demo.pageAsImage.jpeg.containsAnyDocumentText || demo.pageAsImage.jpeg.exif ? <Kept>found</Kept> : <Gone />}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-gray-700 leading-7">
              An image of a page has no properties to inherit, no annotation layer and no text layer — what you see is
              all there is. That also makes it the one output here that genuinely removes text hidden under a box,
              because only the visible pixels are kept. The cost is real: text is no longer selectable or searchable,
              and at {demo.pageAsImage.pixelSize.width}×{demo.pageAsImage.pixelSize.height} the file suits screens rather
              than print. The{" "}
              <Link className="underline font-medium" href="/guides/pdf-to-image-use-cases/">PDF to image guide</Link>{" "}
              covers that trade-off in numbers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">What this test does not cover</h2>
            <ul className="space-y-3 text-gray-700 leading-7">
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                <strong>What is printed on the page.</strong> Names in headers, footers, signatures, file paths in
                footnotes and tracked changes that were printed into the PDF are page content, and survive every page tool.
              </li>
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                <strong>Every way a PDF can hide data.</strong> PDFs can also hold attached files, form field values,
                JavaScript and leftover objects from earlier edits. We tested properties, XMP and comments — the common
                cases — not every structure the format allows.
              </li>
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                <strong>Encrypted PDFs.</strong> Password-protected files cannot be opened by these tools at all.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">Before you send a PDF</h2>
            <ol className="list-decimal space-y-2 pl-6 text-gray-700 leading-7">
              <li>Open File → Properties in your PDF reader and look at Title and Author.</li>
              <li>Open the comments panel and delete any comments, highlights or notes you did not mean to send.</li>
              <li>
                Never hide text by drawing over it. Use a real redaction tool, or render the affected page to an image
                with the <Link className="underline font-medium" href="/convert/pdf/">PDF to Image converter</Link>.
              </li>
              <li>
                To send only some pages, <Link className="underline font-medium" href="/edit/pdf/">extract them</Link> —
                the new file drops the original&apos;s title, author and XMP — then check its comments panel again.
              </li>
            </ol>
          </section>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Measured on {UPDATED} with {demo.browser} and {demo.library}. The test file is synthetic, and every name in it
            is invented.
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 font-bold text-black">
              <Download className="h-5 w-5" aria-hidden="true" /> Try it yourself
            </div>
            <p className="mb-3 text-sm text-gray-700">
              Download the tagged sample, open its properties and comments in any PDF reader, then extract a page with the
              tool and compare.
            </p>
            <a className="underline font-medium text-gray-800" href={demo.sampleFile} download>
              pdf-metadata-sample.pdf ({Math.round(demo.source.bytes / 1024)} KB)
            </a>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Sharing photos rather than documents? The{" "}
              <Link className="underline font-medium" href="/guides/exif-metadata-privacy/">EXIF and privacy guide</Link>{" "}
              runs the same kind of test on a photo&apos;s location and camera data, and the{" "}
              <Link className="underline font-medium" href="/view/exif/">EXIF Viewer</Link> checks a photo before you share it.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
