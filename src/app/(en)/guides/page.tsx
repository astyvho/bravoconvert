import type { Metadata } from "next";
import { alternatesFor } from "@/lib/locale";
import Link from "next/link";
import {
  BarChart3,
  Fingerprint,
  FlaskConical,
  LifeBuoy,
  Library,
  Minimize2,
  Files,
  FileText,
} from "lucide-react";
import ContentHeader from "@/components/content/content-header";
import ToolCard from "@/components/home/tool-card";
import IconTile, { type IconTileTone } from "@/components/tool/icon-tile";
import Prose from "@/components/tool/prose";
import benchmarks from "@/data/format-benchmarks.json";
import exifDemo from "@/data/exif-demo.json";
import pdfMetaDemo from "@/data/pdf-metadata-demo.json";

const PUBLISHED = "2026-07-28";
const UPDATED = benchmarks.generatedAt;

export const metadata: Metadata = {
  title: "Guides: Measured Answers About Image and PDF Conversion | BravoConvert",
  description:
    "Seven guides built on measurements we took ourselves, in the same browser engine the tools use — what photos and PDFs reveal and what survives conversion, format comparisons, file size, PDF output resolution, troubleshooting and terminology.",
  alternates: alternatesFor("/guides/", "en"),
  openGraph: {
    title: "Guides: Measured Answers About Image and PDF Conversion",
    description:
      "Not rules of thumb — actual measurements, with the test files published so you can check them.",
    type: "website",
  },
};

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;

const photo = benchmarks.samples.find((s) => s.id === "photo")!;
const detail = benchmarks.samples.find((s) => s.id === "detail")!;
const half = benchmarks.resize.rows.find((r) => r.scale === 0.5)!;
const jpegAt = (s: typeof photo, q: number) => s.jpeg.find((e) => e.quality === q)!.bytes;
const webpAt = (s: typeof photo, q: number) => s.webp.find((e) => e.quality === q)!.bytes;
const pdfJpg95 = benchmarks.pdfPage.jpeg.find((e) => e.quality === 0.95)!.bytes;

const groups = [
  {
    heading: "What your files reveal",
    blurb: "The information that travels inside photos and PDFs, and what it takes to remove it — tested rather than assumed.",
    items: [
      {
        href: "/guides/exif-metadata-privacy/",
        icon: Fingerprint,
        title: "EXIF data and privacy",
        description:
          "We built a photo carrying GPS coordinates, camera model and a timestamp, converted it, and read the metadata back field by field. Includes what stripping EXIF does not protect you from.",
        finding: `Every field was gone after conversion — ${exifDemo.exifBlockBytes} bytes of metadata that a viewer never sees but any EXIF reader can pull out.`,
      },
      {
        href: "/guides/pdf-metadata-privacy/",
        icon: FileText,
        title: "What a PDF reveals about who made it",
        description:
          "A PDF tagged with an author, a draft title, keywords, an XMP packet and a reviewer's comment, run through merge, extract, split and PDF-to-image, then read back.",
        finding: `The author, title and XMP were dropped every time — but the reviewer's comment survived all three page tools, and text under a drawn black box ${pdfMetaDemo.coveredText.extractableAfterExtract ? "was still extractable" : "was not extractable"}.`,
      },
    ],
  },
  {
    heading: "Choosing a format and a size",
    blurb:
      "The two decisions that change your file more than anything else, with the numbers behind each.",
    items: [
      {
        href: "/guides/jpg-png-webp-comparison/",
        icon: BarChart3,
        title: "JPG vs PNG vs WebP",
        description:
          "Three test images encoded at four quality levels each, with every byte count published. Covers transparency, compatibility, and when each format is the wrong choice.",
        finding: `WebP is not always smaller. On dense texture at quality 0.4, JPG produced ${kb(
          jpegAt(detail, 0.4)
        )} against WebP's ${kb(webpAt(detail, 0.4))}.`,
      },
      {
        href: "/guides/reduce-image-file-size/",
        icon: Minimize2,
        title: "How to reduce image file size",
        description:
          "Format, dimensions, quality and metadata measured against each other on one source photo, so you can see which lever is worth pulling first.",
        finding: `Downscaling beats the usual rule of thumb: halving both sides left a quarter of the pixels but under a fifth of the bytes — ${kb(
          photo.png
        )} down to ${kb(half.webp)} once format and size are both handled.`,
      },
    ],
  },
  {
    heading: "Working with PDFs",
    blurb: "What actually comes out when a document becomes images.",
    items: [
      {
        href: "/guides/pdf-to-image-use-cases/",
        icon: Files,
        title: "PDF to image: resolution and format",
        description:
          "The output resolution nobody documents, a page-size conversion table, and the cases where keeping the PDF is the better call.",
        finding: `Pages render at ${benchmarks.pdfPage.dpi} DPI, so A4 becomes ${benchmarks.pdfPage.pixelSize.width}×${benchmarks.pdfPage.pixelSize.height}. For a text document, JPG came out ${(
          pdfJpg95 / benchmarks.pdfPage.png
        ).toFixed(1)}× larger than PNG.`,
      },
    ],
  },
  {
    heading: "Reference",
    blurb: "For when something goes wrong, or a word needs pinning down.",
    items: [
      {
        href: "/guides/troubleshooting/",
        icon: LifeBuoy,
        title: "Troubleshooting conversion problems",
        description:
          "Why a file gets rejected, why a job stalls, why a download vanishes — each with the cause rather than just the fix, plus the real size and format ceilings for all three tools.",
        finding:
          "Most failures trace back to one fact: the work happens on your own device, so the limits are your memory, not our servers.",
      },
      {
        href: "/guides/glossary/",
        icon: Library,
        title: "Image and PDF terminology",
        description:
          "Resolution, DPI, lossy and lossless, alpha, chroma subsampling, vector versus raster — defined plainly, each with a note on what it changes in practice.",
        finding: "Grouped by topic so you can read a section rather than hunt an alphabetical list.",
      },
    ],
  },
];

const TONES: IconTileTone[] = ["blue", "yellow", "green", "pink", "peach"];

const totalGuides = groups.reduce((n, g) => n + g.items.length, 0);

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "BravoConvert Guides",
  description:
    "Guides about image and PDF conversion built on measurements taken in the same browser engine the site's converters use.",
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  publisher: { "@type": "Organization", name: "BravoConvert" },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: totalGuides,
    itemListElement: groups
      .flatMap((g) => g.items)
      .map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://bravoconvert.com${item.href}`,
        name: item.title,
      })),
  },
};

export default function GuidesIndexPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6">
        <ContentHeader label="Guides" title="Guides">
          <p className="mt-3 text-lg leading-relaxed text-foreground">Measured answers, not rules of thumb</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            {totalGuides} guides on what travels inside a photo, picking formats, shrinking files,
            and converting PDFs
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Published <time dateTime={PUBLISHED}>{PUBLISHED}</time> · Updated{" "}
            <time dateTime={UPDATED}>{UPDATED}</time>
          </p>
        </ContentHeader>

        <div className="mt-8 flex max-w-[880px] gap-4 rounded-card bg-primary-soft p-6">
          <IconTile icon={FlaskConical} tone="blue" size="sm" className="hidden bg-card sm:inline-flex" />
          <div>
            <p className="font-bold text-foreground">Why these guides quote exact numbers</p>
            <p className="mt-2 leading-7 text-foreground">
              Most articles about image formats repeat the same approximate ratios without saying where
              they came from. The figures here were produced by a script in this project that encodes
              deterministic test images through the Canvas{" "}
              <code className="rounded bg-card px-1.5 py-0.5 text-sm">toBlob</code> API in Chromium{" "}
              {benchmarks.engine} — the same code path the{" "}
              <Link className="font-semibold text-primary underline underline-offset-4" href="/convert/img/">
                Image Converter
              </Link>{" "}
              runs in your browser. So when a guide says a photo lands at {kb(webpAt(photo, 0.8))}, that
              is what this site would actually hand you. The source images are published for download so
              you can reproduce any of it.
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-12">
          {groups.map((group, groupIndex) => (
            <section key={group.heading}>
              <h2 className="text-h2 text-foreground">{group.heading}</h2>
              <p className="mt-2 max-w-[720px] text-muted-foreground">{group.blurb}</p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {group.items.map((item, itemIndex) => (
                  <ToolCard
                    key={item.href}
                    icon={item.icon}
                    tone={TONES[(groupIndex * 2 + itemIndex) % TONES.length]}
                    title={item.title}
                    body={item.description}
                    note={<><strong className="text-foreground">What we found:</strong> {item.finding}</>}
                    href={item.href}
                    cta="Read the guide"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <Prose as="section" className="mt-12">
          <h2>Where to start</h2>
          <p>
            If you are about to share a photo, start with{" "}
            <Link href="/guides/exif-metadata-privacy/">
              EXIF data and privacy
            </Link>{" "}
            and check the file in the{" "}
            <Link href="/view/exif/">
              EXIF Viewer
            </Link>
            . If you are here because a file is too big, read{" "}
            <Link href="/guides/reduce-image-file-size/">
              how to reduce image file size
            </Link>{" "}
            first — it ranks the four things you can change by how much they actually move the number.
            If you are choosing between formats, start with the{" "}
            <Link href="/guides/jpg-png-webp-comparison/">
              format comparison
            </Link>
            . If something is failing outright, go straight to{" "}
            <Link href="/guides/troubleshooting/">
              troubleshooting
            </Link>
            .
          </p>
          <p>
            Prefer to just use the tools? The{" "}
            <Link href="/convert/img/">
              Image Converter
            </Link>
            ,{" "}
            <Link href="/convert/pdf/">
              PDF Converter
            </Link>{" "}
            and{" "}
            <Link href="/edit/image/">
              Image Editor
            </Link>{" "}
            all run entirely in your browser, and the{" "}
            <Link href="/how-to-use/">
              how-to page
            </Link>{" "}
            walks through each one.
          </p>
        </Prose>
      </div>
    </main>
  );
}
