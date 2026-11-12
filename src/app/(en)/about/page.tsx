import type { Metadata } from "next";
import ContentHeader from "@/components/content/content-header";
import IconTile from "@/components/tool/icon-tile";
import Prose from "@/components/tool/prose";
import Link from "next/link";
import {
  Compass,
  Cpu,
  FlaskConical,
  Info,
  ListChecks,
  Map,
  Megaphone,
  ShieldCheck,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import ContactEmail from "@/components/ContactEmail";
import benchmarks from "@/data/format-benchmarks.json";

const UPDATED = benchmarks.generatedAt;

export const metadata: Metadata = {
  title: "About BravoConvert",
  description:
    "What BravoConvert does, how it processes files without uploading them, what it deliberately cannot do, and how the site is funded.",
  alternates: { canonical: "/about/" },
};

const workflows = [
  "Check a JPG, PNG or WebP photo for location, time, device, serial number, owner and software details",
  "Remove a photo's EXIF block by converting or exporting it, then confirm in the viewer",
  "Convert between JPG, PNG and WebP, one file or a batch",
  "Combine several images into a single PDF document",
  "Render PDF pages as JPG or PNG images",
  "Resize a single image, with aspect ratio locking",
  "Rotate in 90-degree steps and flip horizontally or vertically",
  "Export edited images as JPG, PNG or WebP",
  "Set an output quality level, or aim for a target file size",
  "Download a batch as a ZIP archive",
];

const limits = [
  {
    title: "Input formats are narrow on purpose",
    body: "JPG, PNG and WebP for images; PDF for documents. HEIC from an iPhone, RAW files from a camera, TIFF, GIF, BMP and SVG are not accepted. Supporting them properly in a browser means shipping a decoder for each, and a half-working decoder is worse than an honest refusal.",
  },
  {
    title: "There are size ceilings, and they are your device's",
    body: "10 MB per image, 50 MB per PDF, and 64 megapixels in the editor. These exist because the file has to fit in your browser's memory — there is no server to hand the work to. Large jobs will fail on a phone before they fail on a desktop.",
  },
  {
    title: "Converted PDF pages are screen resolution",
    body: `Pages render at ${benchmarks.pdfPage.dpi} DPI. That is sharp on any display and fine for slides or sharing, but commercial printing wants 300 DPI. For print, send the original PDF.`,
  },
  {
    title: "Nothing is stored, which cuts both ways",
    body: "There are no accounts and no history. Close the tab and the working session is gone. Keep your originals — this is a tool for making copies, not a place to keep files.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6">
        <ContentHeader label="About" title="About BravoConvert">
          <p className="mt-3 text-lg leading-relaxed text-foreground">
            Know what your files reveal before you share them, and handle them without uploading anything
          </p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            What the site does, how it works, what it will not do, and how it pays for itself
          </p>
        </ContentHeader>

        <Prose as="article" className="mt-10 max-w-[720px] space-y-10">
          <section>
            <h2>
              <IconTile icon={Compass} size="sm" tone="blue" className="hidden sm:inline-flex" />
              Why BravoConvert exists
            </h2>
            <p className="text-muted-foreground leading-7">
              BravoConvert started from a simple frustration: most online image and PDF tools ask you
              to upload a file to a server before doing something as basic as changing its format or
              resizing it. That means waiting for an upload, trusting a stranger with the contents of
              a document, and often creating an account first — for a task your own computer could
              finish in a second. This site does those everyday jobs entirely inside your browser
              instead.
            </p>
            <p className="mt-4 text-muted-foreground leading-7">
              Building it made a second problem obvious. The files people share carry information they
              never see: a phone photo can hold the coordinates of the room it was taken in, the minute
              it was taken and the model of the phone. So the site&apos;s focus is now the step before
              sharing — check what a file reveals, remove what it should not carry, and confirm the
              result — with the format and PDF tools serving that job as well as the everyday ones.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={Wrench} size="sm" tone="blue" className="hidden sm:inline-flex" />
              What it does
            </h2>
            <p className="mb-4 text-muted-foreground leading-7">
              Five tools, each doing one thing:{" "}
              <Link className="underline font-medium" href="/view/exif/">
                EXIF Viewer
              </Link>{" "}
              for checking what a photo reveals about where, when, and on what it was taken before you share it,{" "}
              <Link className="underline font-medium" href="/convert/img/">
                Image Converter
              </Link>{" "}
              for changing formats and batching — and, because it rebuilds each image, for removing that metadata,{" "}
              <Link className="underline font-medium" href="/convert/pdf/">
                PDF Converter
              </Link>{" "}
              for turning document pages into images,{" "}
              <Link className="underline font-medium" href="/edit/image/">
                Image Editor
              </Link>{" "}
              for resizing, rotating and flipping a single picture,{" "}
              <Link className="underline font-medium" href="/edit/pdf/">
                Merge &amp; Split PDF
              </Link>{" "}
              for combining PDFs or pulling pages out of one while keeping them as real PDF pages.
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              {workflows.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>
              <IconTile icon={Cpu} size="sm" tone="blue" className="hidden sm:inline-flex" />
              How &ldquo;in your browser&rdquo; actually works
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              When you pick a file, the browser reads it from your disk into memory. Image conversion
              is handed to a Web Worker so the page stays responsive, where the image is decoded,
              drawn onto an off-screen canvas, and re-encoded in the format you asked for. PDF pages
              are rendered to a canvas by PDF.js and captured the same way. The result is handed back
              as a download.
            </p>
            <p className="text-muted-foreground leading-7">
              At no point does the file travel anywhere. There is no upload endpoint to send it to —
              the site is a set of static files, and the conversion code runs on your machine. A
              useful side effect: because output is rebuilt from decoded pixels rather than copied
              from the source file, camera metadata such as GPS coordinates does not survive the
              conversion. We{" "}
              <Link className="underline font-medium" href="/guides/exif-metadata-privacy/">
                tested that rather than assuming it
              </Link>
              .
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={TriangleAlert} size="sm" tone="blue" className="hidden sm:inline-flex" />
              What it deliberately does not do
            </h2>
            <p className="mb-4 text-muted-foreground leading-7">
              A tool is more useful when its limits are stated plainly rather than discovered.
            </p>
            <div className="space-y-4">
              {limits.map((limit) => (
                <div key={limit.title} className="rounded-field border-l-4 border-primary bg-muted p-5">
                  <div className="mb-1 font-bold text-foreground">{limit.title}</div>
                  <p className="text-sm leading-6 text-muted-foreground">{limit.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>
              <IconTile icon={FlaskConical} size="sm" tone="blue" className="hidden sm:inline-flex" />
              How the guides are written
            </h2>
            <p className="text-muted-foreground leading-7">
              The{" "}
              <Link className="underline font-medium" href="/guides/">
                guides
              </Link>{" "}
              avoid the approximate ratios that get copied between articles. Their numbers come from a
              script in this project that encodes deterministic test images through the same browser
              API the converters use, then records the exact byte counts — most recently on{" "}
              {UPDATED} against Chromium {benchmarks.engine}. The test files are published for
              download so anyone can reproduce the results, and where the measurements contradicted
              received wisdom, the guides say so rather than repeating the received wisdom.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={Megaphone} size="sm" tone="blue" className="hidden sm:inline-flex" />
              Who runs it, and how it is paid for
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              BravoConvert is an independently operated site, not a company product. The tools are
              free to use, there is nothing to sign up for, and there is no paid tier.
            </p>
            <p className="text-muted-foreground leading-7">
              Running costs are covered by advertising. That is the only revenue involved: the site
              does not sell data, and the contents of the files you convert are never transmitted
              anywhere, so there is nothing about them to sell. What advertising does mean is that
              Google's advertising and analytics tags load on these pages, and the{" "}
              <Link className="underline font-medium" href="/privacy-policy/">
                privacy policy
              </Link>{" "}
              sets out exactly what they may and may not do before and after you make a choice in the
              consent panel.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={ListChecks} size="sm" tone="blue" className="hidden sm:inline-flex" />
              Corrections welcome
            </h2>
            <p className="text-muted-foreground leading-7">
              If something here is wrong, or a guide claims a behaviour the site does not actually
              have, that is worth knowing — several claims have already been corrected after being
              checked against the code. Email <ContactEmail className="underline font-medium text-muted-foreground" />{" "}
              and say what you saw.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={Map} size="sm" tone="blue" className="hidden sm:inline-flex" />
              What is next
            </h2>
            <p className="text-muted-foreground leading-7">
              More measured guides on what files reveal — including what the major sharing apps do
              and do not strip from a photo — are planned, and will be added one at a time. Checking
              the hidden properties of a PDF, such as its author and the software that made it, is under
              consideration, and like everything else will only ship once it works reliably in a
              browser rather than approximately. The{" "}
              <Link className="underline font-medium" href="/changelog/">
                changelog
              </Link>{" "}
              records what has actually shipped, not what is planned.
            </p>
          </section>

          <section>
            <h2>
              <IconTile icon={ShieldCheck} size="sm" tone="blue" className="hidden sm:inline-flex" />
              Elsewhere on the site
            </h2>
            <p className="text-muted-foreground leading-7">
              The{" "}
              <Link className="underline font-medium" href="/how-to-use/">
                usage guide
              </Link>{" "}
              walks through each tool step by step, the{" "}
              <Link className="underline font-medium" href="/faq/">
                FAQ
              </Link>{" "}
              answers the questions that come up most, and{" "}
              <Link className="underline font-medium" href="/guides/troubleshooting/">
                troubleshooting
              </Link>{" "}
              covers what to do when something fails. For anything else,{" "}
              <Link className="underline font-medium" href="/contact/">
                get in touch
              </Link>
              .
            </p>
          </section>
        </Prose>
      </div>
    </main>
  );
}
