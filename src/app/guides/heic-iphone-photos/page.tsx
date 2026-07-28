import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Share2, Smartphone, Wand2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Why iPhone Photos (HEIC) Won't Open Everywhere | BravoConvert",
  description: "What HEIC is, why some apps and devices reject it, and how to get a widely compatible JPG or PNG from an iPhone photo.",
  alternates: { canonical: "/guides/heic-iphone-photos" },
};

export default function HeicGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Smartphone className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            HEIC and iPhone Photos
          </h1>
          <p className="mb-8 text-xl text-black">Why some photos won't open on other devices</p>
          <p className="text-base text-gray-600">What HEIC is, and how to get a widely compatible file</p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">What is HEIC?</h2>
            <p className="text-gray-700 leading-7">
              HEIC (High Efficiency Image Container) is the default photo format on modern iPhones. Apple adopted it because it stores photos at roughly half the file size of an equivalent JPG at similar visual quality, which saves storage space and iCloud usage. It also supports features like storing multiple images (Live Photos, image bursts) in a single file.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <AlertTriangle className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Why it causes compatibility problems
            </h2>
            <p className="text-gray-700 leading-7">
              HEIC is far less universally supported than JPG or PNG. Many Windows PCs without additional codecs, older Android phones, some web upload forms, and various third-party apps cannot open a .heic file directly, showing a blank thumbnail or an error instead of the photo. This usually surprises people the first time they email or upload an iPhone photo to a service that expects JPG or PNG.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Share2 className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              The easiest fix: share or export as JPG
            </h2>
            <p className="text-gray-700 leading-7 mb-3">
              iPhones can export photos as JPG at the point of sharing. Two common approaches:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>In the Photos app, use Share and choose Mail, AirDrop, or Save to Files — depending on the destination and the phone's camera format setting, this often produces a JPG automatically.</li>
              <li>In Settings → Camera → Formats, choosing "Most Compatible" makes the camera save new photos directly as JPG instead of HEIC going forward.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Wand2 className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Once you have a JPG or PNG
            </h2>
            <p className="text-gray-700 leading-7">
              BravoConvert currently converts and edits JPG, PNG, and WebP images in the browser. If a photo has already been exported or shared from an iPhone as JPG or PNG, you can use the <Link className="underline font-medium" href="/convert/img">Image Converter</Link> to change its format, compress it, or combine it into a PDF, or the <Link className="underline font-medium" href="/edit/image">Image Editor</Link> to resize, rotate, or flip it. Native .heic files need to be exported to JPG or PNG first, using the phone's own share or export options above.
            </p>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              See the <Link className="underline font-medium" href="/guides/jpg-png-webp-comparison">JPG vs PNG vs WebP guide</Link> to decide which format to export to next.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
