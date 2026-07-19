import { Metadata } from "next";
import ImageConverter from "@/components/ImageConverter";
import Link from "next/link";
import {
  CircleAlert,
  Gauge,
  Images,
  Layers3,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Blend,
} from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "/convert/img" },
  title: "Free Image Converter - JPG, PNG, WebP and PDF | BravoConvert",
  description: "Convert JPG, PNG and WebP images in batches, adjust output quality, reduce file size, or combine images into one PDF. Processing stays in your browser.",
  keywords: [
    "image format converter",
    "metadata removal",
    "privacy protection",
    "strip EXIF data",
    "remove photo metadata",
    "PNG to WebP",
    "JPG to PNG", 
    "WebP to JPG",
    "batch image conversion",
    "free image converter",
    "online image converter",
    "browser image processing",
    "image compression",
    "images to PDF",
    "social media image prep",
    "professional photo converter"
  ],
  openGraph: {
    title: "Free JPG, PNG and WebP Image Converter",
    description: "Batch-convert images, control output quality, reduce file size, and combine images into PDF in your browser.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert Images Without Installing Software",
    description: "Convert JPG, PNG and WebP images in batches or combine them into a PDF directly in your browser."
  }
};

export default function ImageConverterPage() {
  return (
    <main className="min-h-screen bg-white pb-12 px-4">
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BravoConvert Smart Image Converter",
            "description": "Free browser-based JPG, PNG and WebP batch converter with quality controls and PDF creation",
            "url": "https://bravoconvert.com/convert/img",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "EXIF metadata removal for privacy",
              "Batch image conversion",
              "Support for PNG, JPG and WebP formats",
              "Browser-based processing (no upload required)",
              "Image compression and PDF creation"
            ]
          })
        }}
      />
      <ImageConverter />

      <article className="mx-auto mt-8 max-w-4xl space-y-10 rounded-3xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm md:p-10">
        <header>
          <h2 className="flex items-center gap-3 text-3xl font-bold text-black">
            <SlidersHorizontal className="h-8 w-8 flex-shrink-0 text-gray-700" aria-hidden="true" />
            How to choose the right image conversion settings
          </h2>
          <p className="mt-4 leading-7">
            Image conversion is more useful when the output format matches the way you plan to use the file. BravoConvert accepts JPG/JPEG, PNG, and WebP images and can create JPG, PNG, WebP, or PDF output. The conversion takes place in your browser, so the selected image contents are not uploaded to a BravoConvert conversion server. Keep the original file until you have checked the downloaded result, because re-encoding can change file size, color rendering, transparency, and visual quality.
          </p>
        </header>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <Images className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            JPG, PNG, and WebP compared
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-5">
              <h3 className="text-lg font-semibold text-black">JPG for photographs</h3>
              <p className="mt-2 leading-7">JPG uses lossy compression and is usually a practical choice for photographs, email attachments, and websites where a smaller file matters. It does not support transparent pixels. Repeatedly converting a JPG can gradually introduce visible compression artifacts, so retain the original whenever possible.</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5">
              <h3 className="text-lg font-semibold text-black">PNG for detail and transparency</h3>
              <p className="mt-2 leading-7">PNG uses lossless compression and supports transparency. It is often appropriate for logos, interface captures, diagrams, text-heavy graphics, and images that need a transparent background. A photographic PNG can be much larger than an equivalent JPG or WebP file.</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5">
              <h3 className="text-lg font-semibold text-black">WebP for modern web delivery</h3>
              <p className="mt-2 leading-7">WebP can produce compact photographs and can also retain transparency. It is useful for modern websites and apps, although an older editor or workflow may not accept it. For maximum compatibility with office software and older devices, JPG or PNG may be safer.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <Gauge className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Quality and target file size
          </h2>
          <p className="mt-3 leading-7">
            The optional compression controls apply to JPG and WebP output. A higher quality percentage preserves more image detail but normally creates a larger file. A lower value can reduce transfer time and storage use, but fine textures, text edges, and gradients may show artifacts. Start near the default value, inspect the result at full size, and lower the setting only when the file must be smaller.
          </p>
          <p className="mt-3 leading-7">
            The target size field is an estimate rather than a guarantee. Some images compress efficiently, while noisy photographs and complex textures require more data. PNG compression is lossless, so BravoConvert does not expose the same quality slider for PNG. The displayed input and output sizes make it easier to compare the result before downloading a batch.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <Blend className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Transparency and background behavior
          </h2>
          <p className="mt-3 leading-7">
            PNG and WebP can contain transparent pixels, but JPG cannot. If a transparent PNG or WebP is converted to JPG, do not assume the transparent area will look correct against every background. Review the downloaded JPG before publishing it. If transparency is required for a logo, product cutout, sticker, or overlay, choose PNG or WebP output instead. Converting a JPG to PNG does not recreate transparency that was absent from the source.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <ShieldCheck className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Local processing and metadata
          </h2>
          <p className="mt-3 leading-7">
            BravoConvert decodes and re-encodes supported images locally in the browser. The newly encoded JPG, PNG, or WebP output does not copy the source EXIF block, which can contain GPS coordinates, capture time, camera model, and camera settings. This reduces accidental metadata sharing, but it is still sensible to inspect sensitive files with a metadata viewer before publication. Browser processing also means that conversion speed and memory limits depend on your phone or computer rather than a remote server.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <Smartphone className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            WebP conversion on iPhone and iPad
          </h2>
          <p className="mt-3 leading-7">
            Safari and Chrome on iOS both use Apple&apos;s browser engine, and some iOS versions can display WebP without providing Canvas-based WebP encoding. BravoConvert detects iPhone and iPad conversion conditions and uses a browser-side WebAssembly encoder when native WebP encoding is unavailable. Large batches are processed one image at a time on iOS to reduce peak memory use. The file still remains on the device throughout this process.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <Layers3 className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Batch conversion and PDF creation
          </h2>
          <p className="mt-3 leading-7">
            Files in one image batch must share the detected input type. Each image can be up to 10MB. Converted images can be downloaded individually, while multiple completed results can be collected in a ZIP archive. Selecting PDF as the destination combines the chosen images into one document, with reorder controls available before creation. For a PDF that already contains pages, use the dedicated <Link href="/convert/pdf" className="font-medium text-black underline">PDF to image converter</Link> instead.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-black">
            <CircleAlert className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Troubleshooting a failed image conversion
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
            <li>Confirm that the input is a valid JPG/JPEG, PNG, or WebP file and is no larger than 10MB.</li>
            <li>Reload the page after a browser tab has been open for a long time, especially on a memory-limited phone.</li>
            <li>Convert fewer high-resolution photos at once if the browser closes the tab or reports a memory error.</li>
            <li>Keep the browser current. Encoding and download behavior can differ between browser versions.</li>
            <li>Try JPG or PNG when another application does not recognize a downloaded WebP file.</li>
          </ul>
          <p className="mt-4 leading-7">
            For more detail, see the <Link href="/how-to-use" className="font-medium text-black underline">step-by-step guide</Link> and <Link href="/faq" className="font-medium text-black underline">image converter FAQ</Link>. If a supported file consistently fails, use the <Link href="/contact" className="font-medium text-black underline">contact page</Link> and include the browser, device, input format, output format, and displayed error message—but do not send a private source image.
          </p>
        </section>
      </article>
    </main>
  );
}
