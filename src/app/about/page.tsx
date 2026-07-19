import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About BravoConvert",
  description: "Learn how BravoConvert provides practical browser-based image and PDF conversion tools.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-4xl mx-auto bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-200 space-y-8">
        <header>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About BravoConvert</h1>
          <p className="text-xl text-gray-700">Straightforward file conversion with local browser processing.</p>
        </header>
        <section>
          <h2 className="text-2xl font-bold mb-3">What the service does</h2>
          <p className="text-gray-700 leading-7">BravoConvert converts common image formats, combines images into PDF documents, and renders PDF pages as JPG or PNG images. The conversion work runs on your device, so selected files are not uploaded to a BravoConvert conversion server.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-3">Why local processing matters</h2>
          <p className="text-gray-700 leading-7">Local processing reduces upload time and limits exposure of document contents. Performance and format compatibility still depend on your browser, available memory, and device capabilities, so keeping original backups is recommended.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-3">Supported workflows</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>JPG/JPEG, PNG, and WebP conversion</li>
            <li>Batch conversion and ZIP download</li>
            <li>Multiple images combined into one PDF</li>
            <li>PDF pages rendered to JPG or PNG</li>
            <li>Quality controls and optional target file size for JPG and WebP output</li>
          </ul>
        </section>
        <p className="text-gray-700">Read the <Link className="underline font-medium" href="/how-to-use">usage guide</Link>, review the <Link className="underline font-medium" href="/faq">FAQ</Link>, or <Link className="underline font-medium" href="/contact">contact us</Link>.</p>
      </article>
    </main>
  );
}
