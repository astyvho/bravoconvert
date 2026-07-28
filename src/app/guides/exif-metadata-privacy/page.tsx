import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Fingerprint, MapPin, RefreshCw, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "What Is EXIF Data, and Why Removing It Matters | BravoConvert",
  description: "How EXIF metadata embedded in photos can expose your location and device, and how re-encoding an image removes it.",
  alternates: { canonical: "/guides/exif-metadata-privacy/" },
};

export default function ExifPrivacyGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Fingerprint className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            EXIF Data and Privacy
          </h1>
          <p className="mb-8 text-xl text-black">What's hiding inside a photo file</p>
          <p className="text-base text-gray-600">Camera metadata, why it matters, and what removing it does and doesn't do</p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Camera className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              What is EXIF data?
            </h2>
            <p className="text-gray-700 leading-7">
              EXIF (Exchangeable Image File Format) is a block of metadata that cameras and phones embed inside JPG and some other image files alongside the actual pixel data. It commonly includes the date and time a photo was taken, the camera or phone model, exposure and lens settings, and — if location services were enabled — GPS coordinates of where the photo was captured.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <MapPin className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Why it can be a privacy problem
            </h2>
            <p className="text-gray-700 leading-7 mb-3">
              Most people never look inside a photo's metadata, but the information is easy to extract with common tools. A few situations where this matters in practice:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-gray-700">
              <li>Posting a photo taken at home can embed the exact GPS coordinates of that location.</li>
              <li>Selling an item online with a product photo can reveal the camera or phone model and capture timestamp.</li>
              <li>Sharing screenshots or photos from a workplace or private event can leak device identifiers alongside the image.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <RefreshCw className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              How re-encoding removes it
            </h2>
            <p className="text-gray-700 leading-7">
              When BravoConvert converts or edits an image, the browser decodes the source pixels and writes a new JPG, PNG, or WebP file from scratch. Because the output is newly encoded rather than a byte-for-byte copy of the original, the source EXIF block — including GPS and camera fields — is not carried over into the result.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <ShieldAlert className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              What this does not guarantee
            </h2>
            <p className="text-gray-700 leading-7">
              Removing EXIF metadata is not the same as making an image anonymous. It does nothing about identifying details visible in the picture itself — street signs, license plates, reflections, or recognizable faces and locations. Always look at what's actually visible in the frame before sharing a sensitive photo, in addition to relying on metadata removal.
            </p>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Any conversion through the <Link className="underline font-medium" href="/convert/img">Image Converter</Link> or <Link className="underline font-medium" href="/edit/image">Image Editor</Link> re-encodes the file this way. See the <Link className="underline font-medium" href="/privacy-policy">Privacy Policy</Link> for how the site itself handles data.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
