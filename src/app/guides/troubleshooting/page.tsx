import type { Metadata } from "next";
import Link from "next/link";
import { Cpu, LifeBuoy, ListChecks, Smartphone } from "lucide-react";

const PUBLISHED = "2026-07-28";
const UPDATED = "2026-09-02";

export const metadata: Metadata = {
  title: "Troubleshooting Conversion Problems | BravoConvert",
  description:
    "Why a file gets rejected, why a conversion stalls, why the download never appears, and why output can look worse than expected — with the actual limits behind each one.",
  alternates: { canonical: "/guides/troubleshooting/" },
  openGraph: {
    title: "Troubleshooting Conversion Problems",
    description: "The real limits behind each failure, and what to change to get past it.",
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
  },
};

const limits = [
  {
    tool: "Image Converter",
    accepts: "JPG / JPEG / JPE / JFIF, PNG, WebP",
    produces: "WebP, JPG, PNG, PDF",
    ceiling: "10 MB per image",
    href: "/convert/img/",
  },
  {
    tool: "Image Editor",
    accepts: "JPG / JPEG, PNG, WebP",
    produces: "JPG, PNG, WebP",
    ceiling: "10 MB, 16,384 px per side, 64 megapixels",
    href: "/edit/image/",
  },
  {
    tool: "PDF Converter",
    accepts: "PDF",
    produces: "PNG, JPG",
    ceiling: "50 MB per document",
    href: "/convert/pdf/",
  },
];

const issues = [
  {
    problem: "The file is rejected the moment I add it",
    cause:
      "The format is not on the accepted list, or the file is over the size ceiling for that tool.",
    fix: (
      <>
        Check the table above. The image tools take JPG, PNG and WebP only — not HEIC from an iPhone,
        not RAW files like CR2 or DNG, not TIFF, GIF, BMP or SVG. A file renamed from{" "}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">.heic</code> to{" "}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">.jpg</code> is still HEIC inside
        and will still be rejected, because the check reads the file&rsquo;s actual type rather than
        its name. On an iPhone, setting <em>Camera → Formats → Most Compatible</em> makes new photos
        JPG.
      </>
    ),
  },
  {
    problem: "A PDF will not open",
    cause: "The document is password-protected or encrypted, or it is over 50 MB.",
    fix: (
      <>
        Encrypted PDFs cannot be decoded in the browser and will fail to load. Remove the password in
        whatever application created the document, then convert the unprotected copy. If the file is
        simply large, splitting it into fewer pages per file keeps each one under the ceiling.
      </>
    ),
  },
  {
    problem: "Conversion is slow, stalls, or the tab becomes unresponsive",
    cause:
      "Everything runs on your own device. There is no server queue — the work is competing for your CPU and memory.",
    fix: (
      <>
        A long PDF or a batch of large photos can take real time, especially on a phone. Close other
        tabs and applications, convert in smaller batches, and leave the tab in the foreground —
        browsers throttle background tabs aggressively, which is the usual reason a job seems to
        freeze halfway. If a single image is enormous, resizing it first in the{" "}
        <Link className="underline font-medium" href="/edit/image/">
          Image Editor
        </Link>{" "}
        makes the conversion much lighter.
      </>
    ),
  },
  {
    problem: "The download never started, or I cannot find the file",
    cause:
      "Browsers block or batch multiple automatic downloads, and the destination folder is not always the obvious one.",
    fix: (
      <>
        Look for a blocked-popup or &ldquo;allow multiple downloads&rdquo; prompt near the address bar
        and permit it. Check your browser&rsquo;s download list rather than the Downloads folder, since
        some browsers route files elsewhere. On iOS, files usually land in the Files app under{" "}
        <em>Downloads</em> rather than the photo library — converting several images produces a ZIP,
        which iOS will not expand on its own until you tap it.
      </>
    ),
  },
  {
    problem: "The output looks blurry, blocky, or washed out",
    cause: "The quality setting is too low, or the image was enlarged rather than reduced.",
    fix: (
      <>
        Raise the quality; around 0.8 is the usual sweet spot, and below 0.6 artifacts become visible.
        Enlarging never adds detail — scaling a 400 px image up to 2000 px just produces a soft 2000 px
        image. Always start from the largest original you have rather than from a copy that has already
        been compressed once, since each re-encode compounds the loss. The{" "}
        <Link className="underline font-medium" href="/guides/reduce-image-file-size/">
          file size guide
        </Link>{" "}
        shows measured quality-versus-size numbers.
      </>
    ),
  },
  {
    problem: "Transparency turned black or white after converting to JPG",
    cause: "JPG has no alpha channel. Transparent pixels have to become some solid colour.",
    fix: (
      <>
        This is a format limitation, not a bug. Choose PNG or WebP to keep transparency. If you do need
        JPG, the{" "}
        <Link className="underline font-medium" href="/edit/image/">
          Image Editor
        </Link>{" "}
        lets you pick the background colour that fills the transparent areas; the Image Converter fills
        them automatically without asking.
      </>
    ),
  },
  {
    problem: "A converted page from a PDF looks soft when printed",
    cause: "Pages render at 144 DPI, which is a screen resolution rather than a print one.",
    fix: (
      <>
        Commercial printing generally expects 300 DPI. For anything going to a printer, send the
        original PDF — its text is vector and stays sharp at any size. See the{" "}
        <Link className="underline font-medium" href="/guides/pdf-to-image-use-cases/">
          PDF guide
        </Link>{" "}
        for the exact output dimensions per page size.
      </>
    ),
  },
  {
    problem: "The photo came out rotated the wrong way",
    cause:
      "Phones often store the sensor image as-is plus an orientation flag, and not every tool honours that flag.",
    fix: (
      <>
        The converter reads the orientation flag and bakes the rotation into the pixels, so output
        should be upright. If a source file has a wrong or missing flag, the rotation controls in the{" "}
        <Link className="underline font-medium" href="/edit/image/">
          Image Editor
        </Link>{" "}
        will fix it in one step.
      </>
    ),
  },
  {
    problem: "The target file size I asked for was not hit exactly",
    cause: "A target size is approached by trial, not calculated.",
    fix: (
      <>
        The converter repeatedly re-encodes at different quality levels, narrowing in on your target and
        keeping the closest result under it. How near it lands depends entirely on the image — a noisy
        photo has a much higher floor than a flat graphic. Treat the target as a ceiling to aim at
        rather than an exact number.
      </>
    ),
  },
  {
    problem: "It worked on my laptop but fails on my phone",
    cause: "Mobile browsers have far tighter memory limits and reclaim background tabs quickly.",
    fix: (
      <>
        Convert fewer files at once, keep the tab in the foreground for the whole job, and resize large
        photos before converting. A 48-megapixel photo needs roughly 190 MB of memory just to hold
        uncompressed while it is processed, which is enough to get a mobile tab killed.
      </>
    ),
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: issues.map((issue) => ({
    "@type": "Question",
    name: issue.problem,
    acceptedAnswer: { "@type": "Answer", text: issue.cause },
  })),
};

export default function TroubleshootingGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <LifeBuoy className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Troubleshooting
          </h1>
          <p className="mb-4 text-xl text-black">What went wrong, and why</p>
          <p className="text-base text-gray-600">
            Most failures come down to a format, a size ceiling, or your device running out of room
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Published <time dateTime={PUBLISHED}>{PUBLISHED}</time> · Updated{" "}
            <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </header>

        <article className="space-y-10 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Cpu className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              First, the thing that explains most problems
            </h2>
            <p className="text-gray-700 leading-7">
              Every conversion on this site runs inside your browser. Nothing is uploaded, and there is
              no server doing the work. That is good for privacy, and it is also why the limits look the
              way they do: the ceilings exist because your device has to hold the whole image in memory,
              and a slow conversion means your CPU is busy rather than a queue being long. Closing other
              tabs genuinely helps, in a way it never would with a server-based tool.
            </p>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-black">
              <ListChecks className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              The actual limits
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Tool</th>
                    <th className="p-3 font-bold">Accepts</th>
                    <th className="p-3 font-bold">Produces</th>
                    <th className="p-3 font-bold">Ceiling</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {limits.map((row) => (
                    <tr key={row.tool} className="border-t border-gray-200">
                      <td className="p-3 font-medium text-black">
                        <Link className="underline" href={row.href}>
                          {row.tool}
                        </Link>
                      </td>
                      <td className="p-3">{row.accepts}</td>
                      <td className="p-3">{row.produces}</td>
                      <td className="p-3">{row.ceiling}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              HEIC, RAW formats, TIFF, GIF, BMP, SVG and AVIF are not accepted as input. If a file is
              rejected and you are sure of the extension, the file&rsquo;s real format is probably not
              what its name claims.
            </p>
          </section>

          <section>
            <h2 className="mb-5 text-2xl font-bold text-black">Common problems</h2>
            <div className="space-y-5">
              {issues.map((item, index) => (
                <div key={item.problem} className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                  <h3 className="mb-2 flex items-start gap-3 text-lg font-bold text-black">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-black to-gray-800 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    {item.problem}
                  </h3>
                  <p className="mb-2 pl-9 text-sm font-medium text-gray-600">Why: {item.cause}</p>
                  <p className="pl-9 text-gray-700 leading-7">{item.fix}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <Smartphone className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Still stuck?
            </h2>
            <p className="text-gray-700 leading-7">
              If none of the above fits, the{" "}
              <Link className="underline font-medium" href="/faq/">
                FAQ
              </Link>{" "}
              covers more ground. When you{" "}
              <Link className="underline font-medium" href="/contact/">
                get in touch
              </Link>
              , the three things that make a report actionable are your browser and version, the source
              file&rsquo;s real format and size, and the exact wording of any message you saw. Please do
              not attach the file itself — we cannot accept uploads, and describing it is enough.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
