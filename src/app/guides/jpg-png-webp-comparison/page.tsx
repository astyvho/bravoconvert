import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CheckCircle2, Image as ImageIcon, Layers, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "JPG vs PNG vs WebP: Which Format Should You Use? | BravoConvert",
  description: "A practical comparison of JPG, PNG, and WebP covering compression, transparency, typical file size, and when to choose each format.",
  alternates: { canonical: "/guides/jpg-png-webp-comparison" },
};

const sizeBars = [
  { label: "PNG (lossless)", percent: 100, note: "Largest, exact pixels" },
  { label: "JPG (quality 80)", percent: 35, note: "Smaller, some detail loss" },
  { label: "WebP (quality 80)", percent: 25, note: "Smallest at similar quality" },
];

export default function JpgPngWebpGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <BarChart3 className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            JPG vs PNG vs WebP
          </h1>
          <p className="mb-8 text-xl text-black">Which format should you actually use?</p>
          <p className="text-base text-gray-600">A practical comparison, not just a spec sheet</p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-5 text-gray-800">
            <strong>Quick answer:</strong> use JPG for photos you'll share or upload, PNG when you need transparency or exact pixel-for-pixel graphics, and WebP when you want the smallest file at similar visual quality and your destination supports it.
          </div>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Layers className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              How each format compresses
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              PNG uses lossless compression: every pixel in the output matches the source exactly, which is why re-saving a PNG repeatedly does not degrade it. JPG uses lossy compression: it discards detail the human eye is less likely to notice, trading some accuracy for a much smaller file. WebP supports both a lossy mode (comparable idea to JPG, generally smaller at the same quality) and a lossless mode (comparable idea to PNG, often somewhat smaller).
            </p>
            <p className="text-gray-700 leading-7">
              This is why the same photo saved as PNG can be several times larger than the same photo saved as JPG or WebP at a reasonable quality setting.
            </p>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-black">
              <BarChart3 className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Typical relative file size
            </h2>
            <p className="text-gray-700 leading-7 mb-5">
              Actual results depend heavily on the source image, but for a typical photograph, relative output sizes at a comparable visual quality tend to look roughly like this:
            </p>
            <div className="space-y-4">
              {sizeBars.map((bar) => (
                <div key={bar.label}>
                  <div className="mb-1 flex items-center justify-between text-sm font-medium text-black">
                    <span>{bar.label}</span>
                    <span className="text-gray-500">{bar.note}</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gray-700 to-black"
                      style={{ width: `${bar.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Illustrative proportions for a typical photo, not a guaranteed ratio — graphics with flat colors or transparency behave differently, and screenshots or line art can compress very differently than photographs.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <ImageIcon className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Transparency support
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black">
                  <XCircle className="h-5 w-5 text-gray-500" /> JPG
                </div>
                <p className="text-sm text-gray-700">No alpha channel. Transparent areas must be filled with a background color when exporting.</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black">
                  <CheckCircle2 className="h-5 w-5 text-gray-700" /> PNG
                </div>
                <p className="text-sm text-gray-700">Full alpha channel support. The standard choice for logos, icons, and screenshots with transparent backgrounds.</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black">
                  <CheckCircle2 className="h-5 w-5 text-gray-700" /> WebP
                </div>
                <p className="text-sm text-gray-700">Also supports an alpha channel, generally at a smaller file size than an equivalent PNG.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">When to choose each format</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Format</th>
                    <th className="p-3 font-bold">Best for</th>
                    <th className="p-3 font-bold">Avoid when</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium text-black">JPG</td>
                    <td className="p-3">Photographs, social media uploads, email attachments where size matters</td>
                    <td className="p-3">You need transparency or lossless accuracy</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium text-black">PNG</td>
                    <td className="p-3">Logos, screenshots, diagrams, images with transparency</td>
                    <td className="p-3">The source is a large photo and small file size matters most</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium text-black">WebP</td>
                    <td className="p-3">Websites and apps where smaller downloads improve load time</td>
                    <td className="p-3">The destination is an older system that only accepts JPG or PNG</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">Compatibility note</h2>
            <p className="text-gray-700 leading-7">
              JPG and PNG are accepted almost everywhere. WebP is well supported by current browsers and many apps, but some older software, printers, or forms that require file uploads still expect JPG or PNG. If a destination rejects WebP, converting it to JPG or PNG resolves that.
            </p>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Ready to convert? Use the <Link className="underline font-medium" href="/convert/img">Image Converter</Link> to switch between JPG, PNG, and WebP, or read <Link className="underline font-medium" href="/guides/reduce-image-file-size">how to reduce file size</Link> for more control over the result.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
