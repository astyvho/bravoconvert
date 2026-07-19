import type { Metadata } from "next";
import ImageEditor from "@/components/ImageEditor";
import Link from "next/link";
import {
  CircleAlert,
  Download,
  FlipHorizontal2,
  ImageIcon,
  Maximize2,
  RotateCw,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "/edit/image" },
  title: "Free Online Image Editor - Resize, Rotate and Flip | BravoConvert",
  description: "Resize, rotate, flip, and export JPG, PNG, or WebP images privately in your browser. No upload or installation required.",
  keywords: ["online image editor", "resize image", "rotate image", "flip image", "browser image editor", "private image editor"],
  openGraph: {
    title: "Free Browser-Based Image Editor",
    description: "Resize, rotate, flip, and export images without uploading them to a server.",
    type: "website",
  },
};

export default function ImageEditorPage() {
  return (
    <main className="min-h-screen bg-white pt-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "BravoConvert Image Editor",
            url: "https://bravoconvert.com/edit/image",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: ["Resize images", "Rotate images", "Flip images", "Export JPG, PNG, and WebP", "Browser-only processing"],
          }),
        }}
      />
      <ImageEditor />

      <article className="mx-auto mt-8 max-w-4xl space-y-10 rounded-3xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm md:p-10">
        <header>
          <h2 className="flex items-center gap-3 text-3xl font-bold text-black">
            <ImageIcon className="h-8 w-8 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Edit images without uploading them
          </h2>
          <p className="mt-4 leading-7">
            BravoConvert&apos;s image editor resizes, rotates, and flips JPG, PNG, and WebP files directly in your browser. The selected image is not uploaded to a BravoConvert editing server, and each change remains non-destructive until you export the result. Keep the original file until you have checked the downloaded image, especially when reducing dimensions or using a lossy output format.
          </p>
        </header>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <Maximize2 className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Resize while preserving proportions
          </h2>
          <p className="mt-3 leading-7">
            Enter a width or height in pixels to create an image that fits a website, document, message, or social post. Aspect ratio locking is enabled by default, so changing one dimension calculates the other and prevents accidental stretching. The 25%, 50%, 75%, and 100% presets are useful when you want a quick size based on the original image rather than an exact pixel measurement.
          </p>
          <p className="mt-3 leading-7">
            Enlarging an image adds pixels but cannot restore detail that was absent from the source. For the sharpest result, avoid scaling beyond the original dimensions unless a larger canvas is required. Very large dimensions are limited to protect the browser from excessive memory use.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <RotateCw className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Rotate and correct image orientation
          </h2>
          <p className="mt-3 leading-7">
            Rotate an image left or right in 90-degree steps. A quarter-turn automatically swaps the output width and height, so portrait and landscape images retain the correct canvas dimensions. You can combine rotation with resizing, undo individual edits, redo them, or return to the original orientation with Reset.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <FlipHorizontal2 className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Flip horizontally or vertically
          </h2>
          <p className="mt-3 leading-7">
            Horizontal flip creates a mirrored version of the image, while vertical flip reverses it from top to bottom. Both operations can be combined with rotation. The large preview reflects the current edit state, and the exported file uses the same sequence of transformations shown on screen.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <Download className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Choose JPG, PNG, or WebP output
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-5">
              <h3 className="text-lg font-semibold text-black">JPG for photographs</h3>
              <p className="mt-2 leading-7">JPG usually creates compact photographic files and works with a wide range of apps. It does not support transparency, so transparent areas receive the background color selected in the export settings.</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5">
              <h3 className="text-lg font-semibold text-black">PNG for transparency</h3>
              <p className="mt-2 leading-7">PNG preserves transparent pixels and sharp edges without a lossy quality setting. It is a practical choice for logos, screenshots, diagrams, and interface graphics.</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5">
              <h3 className="text-lg font-semibold text-black">WebP for the web</h3>
              <p className="mt-2 leading-7">WebP supports transparency and adjustable quality while often producing smaller files for modern websites and apps. Use JPG or PNG if an older application does not accept WebP.</p>
            </div>
          </div>
          <p className="mt-5 leading-7">
            The quality control applies to JPG and WebP. Higher values normally retain more visual detail and produce larger files. For batch format conversion, image compression controls, ZIP downloads, or combining several images into a PDF, use the <Link href="/convert/img" className="font-medium text-black underline">image converter</Link> instead.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <ShieldCheck className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Private browser-based processing
          </h2>
          <p className="mt-3 leading-7">
            Image decoding, preview rendering, editing, and export take place on your device with browser image and Canvas APIs. No account or cloud storage is required. Performance depends on the available memory and processing power of your phone or computer, so a very large image can take longer to preview or export.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <CircleAlert className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Troubleshooting image editing
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li>Confirm that the source is a valid JPG, PNG, or WebP file no larger than 10MB.</li>
            <li>Use a smaller resolution if the browser reports that the requested image is too large.</li>
            <li>Keep aspect ratio locking enabled when the image looks stretched after resizing.</li>
            <li>Select PNG or WebP if the downloaded image must retain transparent areas.</li>
            <li>Try JPG or PNG if another application cannot open the exported WebP file.</li>
          </ul>
          <p className="mt-4 leading-7">
            If a supported image consistently fails, see the <Link href="/faq" className="font-medium text-black underline">FAQ</Link> or use the <Link href="/contact" className="font-medium text-black underline">contact page</Link> and include the browser, device, source format, and displayed error message—but do not send a private source image.
          </p>
        </section>
      </article>
    </main>
  );
}
