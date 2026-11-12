import type { Metadata } from "next";
import ContentHeader from "@/components/content/content-header";
import IconTile from "@/components/tool/icon-tile";
import Prose from "@/components/tool/prose";
import { alternatesFor } from "@/lib/locale";
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
  alternates: alternatesFor("/guides/exif-metadata-privacy/", "en"),
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
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6">
        <ContentHeader label="Guide" title="EXIF Data and Privacy">
          <p className="mt-3 text-lg leading-relaxed text-foreground">What is hiding inside a photo file</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            We tagged a photo, converted it, and read the metadata back field by field
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Published <time dateTime={PUBLISHED}>{PUBLISHED}</time> · Updated{" "}
            <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </ContentHeader>

        <Prose as="article" className="mt-10 max-w-[720px] space-y-10">
          <section>
            <h2>
              <IconTile icon={Camera} size="sm" tone="blue" className="hidden sm:inline-flex" />
              What EXIF data is
            </h2>
            <p className="text-muted-foreground leading-7">
              EXIF (Exchangeable Image File Format) is a block of metadata that cameras and phones
              write inside a JPG alongside the pixels. It typically records the capture date and time,
              the camera or phone model, exposure and lens settings, an orientation flag telling
              viewers which way up the image goes — and, if location services were on, the GPS
              coordinates of where the shutter fired. None of it is visible when you look at the
              photo, and all of it travels with the file.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={FlaskConical} size="sm" tone="blue" className="hidden sm:inline-flex" />
              We tested it rather than assuming
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              It is easy to claim that converting an image strips its metadata. We built a JPG that
              carries a full EXIF block — camera make and model, a capture timestamp, an orientation
              flag, and GPS coordinates pointing at Trafalgar Square — then put it through the same
              decode-to-canvas-and-re-encode path the{" "}
              <Link className="underline font-medium" href="/convert/img/?from=exif">
                Image Converter
              </Link>{" "}
              uses, and parsed the metadata again on the other side.
            </p>

            <div className="prose-wide">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="p-3 font-bold">Field</th>
                    <th className="p-3 font-bold">In the original</th>
                    <th className="p-3 font-bold">After conversion</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {rows.map((row) => (
                    <tr key={row.field} className="border-t border-border">
                      <td className="p-3 font-medium text-foreground">{row.label}</td>
                      <td className="p-3 font-mono text-xs">{String(row.before)}</td>
                      <td className="p-3">
                        {row.after === null ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-status-clean-foreground">
                            <Check className="h-4 w-4" aria-hidden="true" /> gone
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-medium text-status-found-foreground">
                            <X className="h-4 w-4" aria-hidden="true" /> {String(row.after)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-field bg-primary-soft border border-transparent p-5 text-foreground">
              <strong>Every field was gone.</strong> The EXIF block accounted for{" "}
              {demo.exifBlockBytes} bytes of the {demo.sourceBytes.toLocaleString()}-byte original —
              about {Math.round((demo.exifBlockBytes / demo.sourceBytes) * 100)}% of the file. After
              conversion the parser found none of it, because the output is encoded fresh from raw
              pixels and there is nowhere for the original metadata to ride along.
            </div>

            <div className="mt-4 rounded-field border border-border bg-muted p-4 text-sm text-muted-foreground">
              Tested on Chromium {demo.engine} on {UPDATED} using the{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">exifr</code> parser. The sample is
              synthetic and the coordinates point at a public landmark, not anyone&rsquo;s home.
            </div>

            <div className="mt-5 rounded-field border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
                <Download className="h-5 w-5" aria-hidden="true" /> Try it yourself
              </div>
              <img
                src={demo.sourceFile}
                width={640}
                height={480}
                alt="The synthetic sample photograph: a sunset gradient above a dark ridge line. Nothing in the picture hints at the GPS coordinates stored inside the file."
                className="mb-3 h-auto w-full max-w-md rounded-field border border-border"
                loading="lazy"
              />
              <p className="mb-3 text-sm text-muted-foreground">
                Nothing in that picture suggests it knows where it was taken. Download the tagged
                sample, open it in any EXIF viewer to confirm the metadata is there, then run it
                through the converter and check again.
              </p>
              <a
                className="underline font-medium text-foreground"
                href={demo.sourceFile}
                download
              >
                exif-sample-with-metadata.jpg ({Math.round(demo.sourceBytes / 1024)} KB)
              </a>
            </div>
          </section>

          <section>
            <h2>
              <IconTile icon={MapPin} size="sm" tone="blue" className="hidden sm:inline-flex" />
              Why this matters
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              The coordinates above resolve to a specific point on a map to within a few metres. That
              is the whole problem in one line: a photo taken in your living room and posted publicly
              can carry the address of your living room, and nothing on screen hints at it.
            </p>
            <ul className="space-y-3 text-muted-foreground leading-7">
              <li className="rounded-field border-l-4 border-primary bg-muted p-4">
                Listing an item for sale with photos shot at home publishes where you live along with
                the price.
              </li>
              <li className="rounded-field border-l-4 border-primary bg-muted p-4">
                Photos of children posted to a public account can carry the coordinates of a school or
                a house.
              </li>
              <li className="rounded-field border-l-4 border-primary bg-muted p-4">
                Timestamps and device models across several photos link otherwise separate accounts to
                the same person and phone.
              </li>
            </ul>
            <p className="mt-4 text-muted-foreground leading-7">
              Some social platforms strip EXIF when you upload. Many messaging apps, file-sharing
              services, email attachments, and forum uploads do not. It is not safe to assume the
              destination will handle it.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={ShieldAlert} size="sm" tone="blue" className="hidden sm:inline-flex" />
              What removing EXIF does not do
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              This is where most articles stop, and it is the part that actually protects you. Stripping
              metadata is narrow.
            </p>
            <div className="space-y-4">
              <div className="rounded-field border border-border bg-muted p-5">
                <div className="mb-1 font-bold text-foreground">
                  It does nothing about what is visible in the picture
                </div>
                <p className="text-sm text-muted-foreground leading-6">
                  A street sign, a house number, a reflection, a screen showing an email, a name badge —
                  all of that is pixel data and survives every conversion. Removing GPS coordinates from
                  a photo that plainly shows your front door achieves very little.
                </p>
              </div>
              <div className="rounded-field border border-border bg-muted p-5">
                <div className="mb-1 font-bold text-foreground">
                  It cannot recall a file you already sent
                </div>
                <p className="text-sm text-muted-foreground leading-6">
                  Converting a copy today does not touch the copy someone downloaded last week. Strip
                  before sharing, not after.
                </p>
              </div>
              <div className="rounded-field border border-border bg-muted p-5">
                <div className="mb-1 font-bold text-foreground">
                  It is a consequence of re-encoding, not a scrubbing feature
                </div>
                <p className="text-sm text-muted-foreground leading-6">
                  The metadata disappears because the output is built from decoded pixels rather than
                  copied from the source file. That is reliable for the EXIF block, but it is not the
                  same thing as a forensic guarantee about every byte a particular camera might have
                  written.
                </p>
              </div>
              <div className="rounded-field border border-border bg-muted p-5">
                <div className="mb-1 font-bold text-foreground">It will not shrink your file</div>
                <p className="text-sm text-muted-foreground leading-6">
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
            <h2>
              <IconTile icon={RefreshCw} size="sm" tone="blue" className="hidden sm:inline-flex" />
              The orientation flag is a special case
            </h2>
            <p className="text-muted-foreground leading-7">
              One EXIF field does real work: orientation. Phones often record the sensor as-is and set
              a flag saying &ldquo;display this rotated 90°&rdquo;. Strip that flag naively and the
              photo appears sideways. The converter reads the orientation first and bakes the rotation
              into the pixels, so the output looks correct without needing the flag — which is why the
              orientation row above reads <em>Rotate 90 CW</em> before and nothing after, with the
              image still the right way up.
            </p>
          </section>

          <section>
            <h2>Practical habit</h2>
            <p className="text-muted-foreground leading-7">
              Before posting a photo publicly or sending it to someone you do not know, check what it
              carries in the{" "}
              <Link className="underline font-medium" href="/view/exif/">
                EXIF Viewer
              </Link>
              , then run it through the{" "}
              <Link className="underline font-medium" href="/convert/img/?from=exif">
                Image Converter
              </Link>{" "}
              and share the output rather than the original. The conversion happens inside your
              browser, so the file with the coordinates still in it never gets uploaded anywhere — not
              to us, not to anyone. Turning off location tagging in your camera app is the better
              long-term fix, since it stops the data being written in the first place.
            </p>
          </section>

          <div className="rounded-field border border-border bg-muted p-6">
            <p className="text-muted-foreground">
              Convert a photo in the{" "}
              <Link className="underline font-medium" href="/convert/img/?from=exif">
                Image Converter
              </Link>
              , or resize one first in the{" "}
              <Link className="underline font-medium" href="/edit/image/?from=exif">
                Image Editor
              </Link>
              . Both re-encode through the same path tested on this page. Then open the result in the{" "}
              <Link className="underline font-medium" href="/view/exif/">
                EXIF Viewer
              </Link>{" "}
              to confirm nothing is left.
            </p>
          </div>
        </Prose>
      </div>
    </main>
  );
}
