import { Metadata } from 'next';
import PDFConverter from '@/components/PDFConverter';
import Link from 'next/link';
import {
  CircleAlert,
  Download,
  FileCheck2,
  FileImage,
  Images,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  alternates: { canonical: '/convert/pdf' },
  title: 'PDF to Image Converter - Convert PDF to JPG, PNG Online Free | BravoConvert',
  description: 'Render PDF pages as high-quality JPG or PNG images online. Free browser-based PDF converter with batch download.',
  keywords: 'PDF to image, PDF to JPG, PDF to PNG, convert PDF, PDF converter, free PDF converter, online PDF to image',
  openGraph: {
    title: 'PDF to Image Converter - Convert PDF to JPG, PNG Online Free',
    description: 'Convert PDF pages to high-quality JPG or PNG images online. Batch processing available.',
    url: '/convert/pdf',
  },
};

export default function PDFConvertPage() {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <PDFConverter />

        <article className="mx-auto mt-8 max-w-4xl space-y-10 rounded-3xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm md:p-10">
          <header>
            <h2 className="flex items-center gap-3 text-3xl font-bold text-black">
              <FileImage className="h-8 w-8 flex-shrink-0 text-gray-700" aria-hidden="true" />
              A practical guide to converting PDF pages into images
            </h2>
            <p className="mt-4 leading-7">
              PDF and image files solve different problems. A PDF preserves a document&apos;s page structure, while a JPG or PNG is easier to insert into a presentation, publish on a website, annotate in an image editor, or share as an individual page. BravoConvert renders each PDF page in your browser and creates a separate image without uploading the document contents to a BravoConvert conversion server.
            </p>
          </header>

          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
              <Images className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Choose JPG or PNG for the page content
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-5">
                <h3 className="text-lg font-semibold text-black">Use JPG for photo-heavy pages</h3>
                <p className="mt-2 leading-7">JPG is usually smaller when a page contains photographs, scanned paper, gradients, or other continuous-tone imagery. BravoConvert exports PDF pages as high-quality JPG images. Because JPG compression is lossy, very small text and sharp diagram lines can look softer than they do in a PNG.</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-5">
                <h3 className="text-lg font-semibold text-black">Use PNG for text and diagrams</h3>
                <p className="mt-2 leading-7">PNG uses lossless compression and is often the better option for text, line art, interface captures, charts, and diagrams. It can preserve sharp boundaries without JPG artifacts, but image files may be considerably larger—especially when a PDF page contains a full-page photograph.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
              <ScanLine className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              How page rendering works
            </h2>
            <p className="mt-3 leading-7">
              The converter uses PDF.js to interpret the document and draw each page to a browser canvas. Final pages are rendered at a 2× scale before encoding, so output pixel dimensions depend on the original PDF page dimensions. This is intended to produce readable text and useful detail without asking the user to install desktop software. It is rasterization rather than extraction: selectable PDF text, links, form controls, layers, and vector objects become pixels in the downloaded image.
            </p>
            <p className="mt-3 leading-7">
              A converted image will therefore not behave like the source PDF. You cannot select its text unless another application performs optical character recognition, and embedded links will no longer be clickable. Keep the original PDF when those document features matter.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
              <ShieldCheck className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Privacy and browser resource use
            </h2>
            <p className="mt-3 leading-7">
              Selected PDFs are processed locally in the browser. The file contents are not sent to BravoConvert for conversion or storage. This is useful for ordinary documents that you prefer not to upload to a conversion server, but no browser tool can remove every security consideration. Avoid processing a document on a shared or untrusted device, close the tab when finished, and follow your organization&apos;s rules for confidential material.
            </p>
            <p className="mt-3 leading-7">
              Local processing also means performance depends on the device. A long PDF, a page containing complex graphics, or several large page canvases can use significant memory. BravoConvert processes pages in order and updates progress as the conversion runs. Keep the tab open until all requested pages have completed.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
              <FileCheck2 className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Supported files and practical limits
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
              <li>The selected file must be a PDF and can be up to 50MB.</li>
              <li>Password-protected and encrypted PDFs are not supported because the browser cannot open them without the required access.</li>
              <li>Very complex or unusually long documents may exceed the memory available on a phone or tablet even when the file itself is below 50MB.</li>
              <li>Damaged files or PDFs using unsupported structures may fail during loading or on an individual page.</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
              <Download className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Downloading one page or the full set
            </h2>
            <p className="mt-3 leading-7">
              After conversion, each page receives a numbered filename and can be downloaded separately. This is useful when only a cover, chart, receipt, or selected page is needed. When several pages are required, Download All packages the completed images in a ZIP archive so the browser does not need to start many separate downloads. Extract the ZIP with the file manager built into your computer or mobile device.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
              <Sparkles className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Tips for clearer and smaller output
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
              <li>Choose PNG when small text, thin rules, screenshots, or diagrams are the main content.</li>
              <li>Choose JPG when pages are scans or photographs and a smaller download is more important than perfectly sharp edges.</li>
              <li>Judge quality at the size where the image will actually be read, not only from the thumbnail.</li>
              <li>If a social network or content system resizes uploads, preserve a copy of the original converted page before uploading it.</li>
              <li>For converting standalone JPG, PNG, or WebP files—or combining images into a PDF—use the <Link href="/convert/img" className="font-medium text-black underline">image converter</Link>.</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
              <CircleAlert className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Troubleshooting PDF conversion
            </h2>
            <p className="mt-3 leading-7">
              If the document does not load, first confirm that it opens normally in another PDF viewer and is not password protected. Reload the page, close other memory-heavy browser tabs, and try again with an up-to-date browser. On a phone, a shorter PDF may succeed when a long, graphics-heavy document exceeds available memory. If only one page fails, the PDF itself may contain damaged or unusual page data.
            </p>
            <p className="mt-4 leading-7">
              The <Link href="/how-to-use" className="font-medium text-black underline">usage guide</Link> explains the normal workflow, and the <Link href="/faq" className="font-medium text-black underline">FAQ</Link> covers supported formats and privacy. For a repeatable error, contact us through the <Link href="/contact" className="font-medium text-black underline">support page</Link> with the browser, device, page count, file size, and error message. Do not attach a confidential document.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
