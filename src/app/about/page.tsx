import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Info, ListChecks, Map, ShieldCheck, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "About BravoConvert",
  description: "Learn how BravoConvert provides practical browser-based image editing, image conversion, and PDF-to-image tools.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Info className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            About BravoConvert
          </h1>
          <p className="mb-8 text-xl text-black">Straightforward image editing and file conversion in your browser</p>
          <p className="text-base text-gray-600">Learn what BravoConvert does and why your files stay on your device</p>
        </header>

        <article className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
        <section>
          <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold">
            <Compass className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Why BravoConvert exists
          </h2>
          <p className="text-gray-700 leading-7">BravoConvert started from a simple frustration: most online image and PDF tools ask you to upload a file to a server before doing something as basic as changing its format or resizing it. That means waiting for an upload, trusting a third party with the file's contents, and often creating an account first. This site was built to do the same everyday tasks — convert a format, resize a photo, turn a PDF page into an image — entirely inside your browser instead.</p>
        </section>
        <section>
          <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold">
            <Wrench className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            What the service does
          </h2>
          <p className="text-gray-700 leading-7">BravoConvert resizes, rotates, and flips images, converts common image formats, combines images into PDF documents, and renders PDF pages as JPG or PNG images. Editing and conversion run on your device, so selected files are not uploaded to a BravoConvert processing server.</p>
        </section>
        <section>
          <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold">
            <ShieldCheck className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Why local processing matters
          </h2>
          <p className="text-gray-700 leading-7">Local processing reduces upload time and limits exposure of document contents. Performance and format compatibility still depend on your browser, available memory, and device capabilities, so keeping original backups is recommended.</p>
        </section>
        <section>
          <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold">
            <ListChecks className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Supported workflows
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Single-image resizing with optional aspect ratio locking</li>
            <li>90-degree rotation and horizontal or vertical flipping</li>
            <li>Edited image export as JPG, PNG, or WebP</li>
            <li>JPG/JPEG, PNG, and WebP conversion</li>
            <li>Batch conversion and ZIP download</li>
            <li>Multiple images combined into one PDF</li>
            <li>PDF pages rendered to JPG or PNG</li>
            <li>Quality controls and optional target file size for JPG and WebP output</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold">
            <Map className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            What's next
          </h2>
          <p className="text-gray-700 leading-7">The Image Editor currently covers resize, rotate, and flip. Free-form cropping, batch editing, and support for additional input formats are being considered for future releases, added only once they can be delivered reliably in the browser. The <Link className="underline font-medium" href="/changelog">changelog</Link> tracks what has actually shipped.</p>
        </section>
        <p className="text-gray-700">Read the <Link className="underline font-medium" href="/how-to-use">usage guide</Link>, browse the <Link className="underline font-medium" href="/guides">guides</Link>, review the <Link className="underline font-medium" href="/faq">FAQ</Link>, or <Link className="underline font-medium" href="/contact">contact us</Link>.</p>
        </article>
      </div>
    </main>
  );
}
