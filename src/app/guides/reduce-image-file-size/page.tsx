import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Gauge, Minimize2, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Reduce Image File Size Without Losing Quality | BravoConvert",
  description: "Four practical ways to shrink a photo or graphic: choosing the right format, adjusting quality, resizing dimensions, and removing metadata.",
  alternates: { canonical: "/guides/reduce-image-file-size/" },
};

export default function ReduceFileSizeGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Minimize2 className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Reduce Image File Size
          </h1>
          <p className="mb-8 text-xl text-black">Without losing quality that actually matters</p>
          <p className="text-base text-gray-600">Four levers you can pull, in the order that usually helps most</p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <p className="text-gray-700 leading-7">
            Large image files slow down page loads, get rejected by upload forms with size limits, and fill up email attachments and storage quotas. Before shrinking an image, it helps to know which lever actually reduces size the most for your situation.
          </p>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white">1</span>
              Choose the right format first
            </h2>
            <p className="text-gray-700 leading-7">
              This is usually the single biggest factor. A photograph saved as PNG can be several times larger than the same photo saved as JPG or WebP, because PNG is lossless and photographs rarely need pixel-perfect accuracy. See the <Link className="underline font-medium" href="/guides/jpg-png-webp-comparison/">format comparison guide</Link> for details. If the image needs transparency, WebP is usually smaller than PNG at similar quality.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white">2</span>
              Adjust the quality level
            </h2>
            <p className="text-gray-700 leading-7 mb-3">
              For JPG and WebP output, lowering the quality percentage reduces file size by discarding more fine detail. Quality changes are often hard to notice above roughly 70–80%, while file size keeps dropping. The Image Converter's compression option lets you set a quality level or enter a target size in KB so you don't have to guess.
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
              A target size is an estimate, not a guarantee: the browser adjusts quality to get close to your target, but the exact result depends on the image content.
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white">3</span>
              Resize the dimensions
            </h2>
            <p className="text-gray-700 leading-7">
              A photo captured at 4000×3000 pixels is far larger than it needs to be for a web page, a form upload, or a chat attachment. Reducing pixel dimensions with the Image Editor's resize tool cuts file size roughly in proportion to the drop in total pixel count, independent of any quality/compression setting. Keep aspect ratio locked to avoid stretching, and only resize down from a copy — reducing resolution cannot be reversed.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white">4</span>
              Remove embedded metadata
            </h2>
            <p className="text-gray-700 leading-7">
              Camera and phone photos often carry an EXIF block with camera settings, timestamps, and sometimes GPS coordinates. This metadata is usually small compared to pixel data, so it rarely explains a large file on its own, but converting through BravoConvert re-encodes the image and does not carry the source EXIF block into JPG, PNG, or WebP output. See the <Link className="underline font-medium" href="/guides/exif-metadata-privacy/">EXIF and privacy guide</Link> for why that also matters beyond file size.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Gauge className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Putting it together
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black"><SlidersHorizontal className="h-5 w-5" /> Sharing a photo online</div>
                <p className="text-sm text-gray-700">Convert to JPG or WebP, quality around 75–85%, resize to the dimensions the destination actually displays.</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center gap-2 font-bold text-black"><Layers className="h-5 w-5" /> A logo or screenshot with transparency</div>
                <p className="text-sm text-gray-700">Keep PNG or use WebP for a smaller file; avoid JPG since it cannot preserve transparent pixels.</p>
              </div>
            </div>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Start with the <Link className="underline font-medium" href="/convert/img/">Image Converter</Link> for format and quality control, or the <Link className="underline font-medium" href="/edit/image/">Image Editor</Link> to resize a single image first.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
