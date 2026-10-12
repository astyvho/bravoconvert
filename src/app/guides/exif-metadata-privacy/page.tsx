import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  Check,
  Download,
  Fingerprint,
  FlaskConical,
  MapPin,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react";
import demo from "@/data/exif-demo.json";

const PUBLISHED = "2026-07-28";
const UPDATED = demo.generatedAt;

export const metadata: Metadata = {
  title: "EXIF Data and Privacy: Tested Before and After Conversion | BravoConvert",
  description:
    "We built a JPG carrying GPS coordinates, camera model and a timestamp, ran it through the converter, and read the metadata back. Here is exactly what survived — and what removing EXIF does not protect you from.",
  alternates: { canonical: "/guides/exif-metadata-privacy/" },
  openGraph: {
    title: "EXIF Data and Privacy: Tested Before and After Conversion",
    description:
      "A tagged sample photo, converted, then re-read field by field. Includes the limits of metadata removal.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const FIELD_LABELS: Record<string, string> = {
  Make: "Camera make",
  Model: "Camera model",
  DateTimeOriginal: "Capture timestamp",
  Orientation: "Orientation flag",
  latitude: "GPS latitude",
  longitude: "GPS longitude",
  GPSLatitudeRef: "Latitude hemisphere",
  GPSLongitudeRef: "Longitude hemisphere",
};

const rows = demo.before.map((row, index) => ({
  field: row.field,
  label: FIELD_LABELS[row.field] ?? row.field,
  before: row.value,
  after: demo.after[index].value,
}));

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "EXIF Data and Privacy: Tested Before and After Conversion",
  description:
    "An empirical test of whether converting an image through BravoConvert removes the EXIF metadata, including GPS coordinates, plus the limits of that protection.",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { "@type": "Organization", name: "BravoConvert" },
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://bravoconvert.com/guides/exif-metadata-privacy/",
  },
};

export default function ExifPrivacyGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <Fingerprint className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            EXIF Data and Privacy
          </h1>
          <p className="mb-4 text-xl text-black">What is hiding inside a photo file</p>
          <p className="text-base text-gray-600">
            We tagged a photo, converted it, and read the metadata back field by field
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Published <time dateTime={PUBLISHED}>{PUBLISHED}</time> · Updated{" "}
            <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Camera className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              What EXIF data is
            </h2>
            <p className="text-gray-700 leading-7">
              EXIF (Exchangeable Image File Format) is a block of metadata that cameras and phones
              write inside a JPG alongside the pixels. It typically records the capture date and time,
              the camera or phone model, exposure and lens settings, an orientation flag telling
              viewers which way up the image goes — and, if location services were on, the GPS
              coordinates of where the shutter fired. None of it is visible when you look at the
              photo, and all of it travels with the file.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <FlaskConical className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              We tested it rather than assuming
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              It is easy to claim that converting an image strips its metadata. We built a JPG that
              carries a full EXIF block — camera make and model, a capture timestamp, an orientation
              flag, and GPS coordinates pointing at Trafalgar Square — then put it through the same
              decode-to-canvas-and-re-encode path the{" "}
              <Link className="underline font-medium" href="/convert/img/">
                Image Converter
              </Link>{" "}
              uses, and parsed the metadata again on the other side.
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Field</th>
                    <th className="p-3 font-bold">In the original</th>
                    <th className="p-3 font-bold">After conversion</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {rows.map((row) => (
                    <tr key={row.field} className="border-t border-gray-200">
                      <td className="p-3 font-medium text-black">{row.label}</td>
                      <td className="p-3 font-mono text-xs">{String(row.before)}</td>
                      <td className="p-3">
                        {row.after === null ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-green-700">
                            <Check className="h-4 w-4" aria-hidden="true" /> gone
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-medium text-red-700">
                            <X className="h-4 w-4" aria-hidden="true" /> {String(row.after)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-5 text-gray-800">
              <strong>Every field was gone.</strong> The EXIF block accounted for{" "}
              {demo.exifBlockBytes} bytes of the {demo.sourceBytes.toLocaleString()}-byte original —
              about {Math.round((demo.exifBlockBytes / demo.sourceBytes) * 100)}% of the file. After
              conversion the parser found none of it, because the output is encoded fresh from raw
              pixels and there is nowhere for the original metadata to ride along.
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Tested on Chromium {demo.engine} on {UPDATED} using the{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5">exifr</code> parser. The sample is
              synthetic and the coordinates point at a public landmark, not anyone&rsquo;s home.
            </div>

            <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2 font-bold text-black">
                <Download className="h-5 w-5" aria-hidden="true" /> Try it yourself
              </div>
              <img
                src={demo.sourceFile}
                width={640}
                height={480}
                alt="The synthetic sample photograph: a sunset gradient above a dark ridge line. Nothing in the picture hints at the GPS coordinates stored inside the file."
                className="mb-3 h-auto w-full max-w-md rounded-lg border border-gray-200"
                loading="lazy"
              />
              <p className="mb-3 text-sm text-gray-700">
                Nothing in that picture suggests it knows where it was taken. Download the tagged
                sample, open it in any EXIF viewer to confirm the metadata is there, then run it
                through the converter and check again.
              </p>
              <a
                className="underline font-medium text-gray-800"
                href={demo.sourceFile}
                download
              >
                exif-sample-with-metadata.jpg ({Math.round(demo.sourceBytes / 1024)} KB)
              </a>
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <MapPin className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Why this matters
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              The coordinates above resolve to a specific point on a map to within a few metres. That
              is the whole problem in one line: a photo taken in your living room and posted publicly
              can carry the address of your living room, and nothing on screen hints at it.
            </p>
            <ul className="space-y-3 text-gray-700 leading-7">
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                Listing an item for sale with photos shot at home publishes where you live along with
                the price.
              </li>
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                Photos of children posted to a public account can carry the coordinates of a school or
                a house.
              </li>
              <li className="rounded-lg border-l-4 border-black bg-gray-50 p-4">
                Timestamps and device models across several photos link otherwise separate accounts to
                the same person and phone.
              </li>
            </ul>
            <p className="mt-4 text-gray-700 leading-7">
              Some social platforms strip EXIF when you upload. Many messaging apps, file-sharing
              services, email attachments, and forum uploads do not. It is not safe to assume the
              destination will handle it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <ShieldAlert className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              What removing EXIF does not do
            </h2>
            <p className="text-gray-700 leading-7 mb-4">
              This is where most articles stop, and it is the part that actually protects you. Stripping
              metadata is narrow.
            </p>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-1 font-bold text-black">
                  It does nothing about what is visible in the picture
                </div>
                <p className="text-sm text-gray-700 leading-6">
                  A street sign, a house number, a reflection, a screen showing an email, a name badge —
                  all of that is pixel data and survives every conversion. Removing GPS coordinates from
                  a photo that plainly shows your front door achieves very little.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-1 font-bold text-black">
                  It cannot recall a file you already sent
                </div>
                <p className="text-sm text-gray-700 leading-6">
                  Converting a copy today does not touch the copy someone downloaded last week. Strip
                  before sharing, not after.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-1 font-bold text-black">
                  It is a consequence of re-encoding, not a scrubbing feature
                </div>
                <p className="text-sm text-gray-700 leading-6">
                  The metadata disappears because the output is built from decoded pixels rather than
                  copied from the source file. That is reliable for the EXIF block, but it is not the
                  same thing as a forensic guarantee about every byte a particular camera might have
                  written.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <div className="mb-1 font-bold text-black">It will not shrink your file</div>
                <p className="text-sm text-gray-700 leading-6">
                  The EXIF block here was {demo.exifBlockBytes} bytes. Our converted output actually came
                  out <em>larger</em> than the original ({demo.convertedBytes.toLocaleString()} bytes
                  against {demo.sourceBytes.toLocaleString()}), because re-compressing already-compressed
                  pixels costs more than the metadata saved. If size is your goal, see the{" "}
                  <Link className="underline font-medium" href="/guides/reduce-image-file-size/">
                    file size guide
                  </Link>{" "}
                  instead.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <RefreshCw className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              The orientation flag is a special case
            </h2>
            <p className="text-gray-700 leading-7">
              One EXIF field does real work: orientation. Phones often record the sensor as-is and set
              a flag saying &ldquo;display this rotated 90°&rdquo;. Strip that flag naively and the
              photo appears sideways. The converter reads the orientation first and bakes the rotation
              into the pixels, so the output looks correct without needing the flag — which is why the
              orientation row above reads <em>Rotate 90 CW</em> before and nothing after, with the
              image still the right way up.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-black">Practical habit</h2>
            <p className="text-gray-700 leading-7">
              Before posting a photo publicly or sending it to someone you do not know, check what it
              carries in the{" "}
              <Link className="underline font-medium" href="/view/exif/">
                EXIF Viewer
              </Link>
              , then run it through the{" "}
              <Link className="underline font-medium" href="/convert/img/">
                Image Converter
              </Link>{" "}
              and share the output rather than the original. The conversion happens inside your
              browser, so the file with the coordinates still in it never gets uploaded anywhere — not
              to us, not to anyone. Turning off location tagging in your camera app is the better
              long-term fix, since it stops the data being written in the first place.
            </p>
          </section>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-gray-700">
              Convert a photo in the{" "}
              <Link className="underline font-medium" href="/convert/img/">
                Image Converter
              </Link>
              , or resize one first in the{" "}
              <Link className="underline font-medium" href="/edit/image/">
                Image Editor
              </Link>
              . Both re-encode through the same path tested on this page. Then open the result in the{" "}
              <Link className="underline font-medium" href="/view/exif/">
                EXIF Viewer
              </Link>{" "}
              to confirm nothing is left.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
