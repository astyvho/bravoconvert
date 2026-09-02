"use client";
import Link from "next/link";
import { CircleAlert, FileImage, FileText, Gauge, Image, ImageIcon as ImageFormatIcon, ListChecks, PencilRuler, ShieldCheck } from "lucide-react";
import benchmarks from "@/data/format-benchmarks.json";

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;
const homePhoto = benchmarks.samples.find((s) => s.id === "photo")!;
const homeJpg80 = homePhoto.jpeg.find((e) => e.quality === 0.8)!.bytes;
const homeWebp80 = homePhoto.webp.find((e) => e.quality === 0.8)!.bytes;
const homeHalf = benchmarks.resize.rows.find((r) => r.scale === 0.5)!;

const commonTasks = [
  {
    task: "A photo is too big to email or upload",
    how: "Resize it down first, then convert to JPG or WebP at quality 0.8. Resizing preserves apparent sharpness better than heavy compression does.",
    tool: "Image Editor",
    href: "/edit/image/",
  },
  {
    task: "A form only accepts JPG or PNG",
    how: "Convert the file and download the result. Batch conversion returns a ZIP when there is more than one file.",
    tool: "Image Converter",
    href: "/convert/img/",
  },
  {
    task: "Someone needs one page of a long PDF",
    how: "Render that page as an image so it opens instantly anywhere, with no PDF viewer needed. Choose PNG for text-heavy pages.",
    tool: "PDF Converter",
    href: "/convert/pdf/",
  },
  {
    task: "A photo is about to be posted publicly",
    how: "Convert it before sharing. The output is rebuilt from pixels, so camera metadata including GPS coordinates does not carry over.",
    tool: "Image Converter",
    href: "/convert/img/",
  },
  {
    task: "Several images need to become one document",
    how: "Add them in the order you want, then choose PDF as the output format.",
    tool: "Image Converter",
    href: "/convert/img/",
  },
  {
    task: "A phone photo came out sideways",
    how: "Rotate it in 90-degree steps and export. The rotation is baked into the pixels, so it stays correct everywhere.",
    tool: "Image Editor",
    href: "/edit/image/",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "BravoConvert",
            url: "https://bravoconvert.com",
            description: "Free browser-based image editing, image conversion, and PDF-to-image tools.",
            publisher: {
              "@type": "Organization",
              name: "BravoConvert",
              url: "https://bravoconvert.com/",
              email: "bravoconvert.help@gmail.com",
            },
            hasPart: [
              { "@type": "WebApplication", name: "Image Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/convert/img/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
              { "@type": "WebApplication", name: "PDF to Image Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/convert/pdf/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
              { "@type": "WebApplication", name: "Image Editor", applicationCategory: "MultimediaApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/edit/image/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
            ],
          }),
        }}
      />
      <div className="w-full max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
            BravoConvert
          </h1>
          <p className="text-xl md:text-2xl text-black mb-8">
            Private Image Editing and File Conversion
          </p>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Convert images and PDFs, or resize, rotate, and flip a picture.
            Free browser-based tools with no installation required.
          </p>
        </div>

        {/* Conversion Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* 이미지 변환 */}
          <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-200 hover:border-gray-400 relative">
            <Link href="/convert/img/" className="block">
              <div className="text-gray-600 mb-6 flex justify-center">
                <Image size={64} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">Image Converter</h3>
              <div className="space-y-2 text-black text-base mb-6">
                <p>• JPG, PNG, WebP and PDF</p>
                <p>• Batch conversion support</p>
                <p>• Local browser processing</p>
              </div>
              <p className="text-sm text-gray-500 text-center">Use this to switch formats, shrink file size, or combine photos into one PDF</p>
            </Link>
            {/* 추천 배지 */}
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
              HOT
            </div>
          </div>

          {/* PDF를 이미지로 변환 */}
          <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-200 hover:border-gray-400">
            <Link href="/convert/pdf/" className="block">
              <div className="text-gray-600 mb-6 flex justify-center">
                <FileText size={64} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">PDF to Image</h3>
              <div className="space-y-2 text-black text-base mb-6">
                <p>• Convert PDF to JPG, PNG</p>
                <p>• Split by pages</p>
                <p>• High-quality conversion</p>
              </div>
              <p className="text-sm text-gray-500 text-center">Use this to preview, print, or embed a single PDF page as an image</p>
            </Link>
          </div>

          {/* Image editor */}
          <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-200 hover:border-gray-400 relative">
            <Link href="/edit/image/" className="block">
              <div className="text-gray-600 mb-6 flex justify-center">
                <PencilRuler size={64} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">Image Editor</h3>
              <div className="space-y-2 text-black text-base mb-6">
                <p>• Resize with aspect ratio lock</p>
                <p>• Rotate and flip images</p>
                <p>• Export JPG, PNG, or WebP</p>
              </div>
              <p className="text-sm text-gray-500 text-center">Use this to fix a sideways photo or resize one image to exact pixel dimensions</p>
            </Link>
            <div className="absolute -top-3 -right-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
              NEW
            </div>
          </div>

        </div>

        <section className="max-w-5xl mx-auto mt-16 space-y-10 text-gray-800">
          <div>
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold text-black">
              <ShieldCheck className="h-8 w-8 flex-shrink-0 text-gray-700" aria-hidden="true" />
              File conversion that stays on your device
            </h2>
            <p className="leading-7">BravoConvert performs image editing, image conversion, and PDF rendering in your browser. The contents of files you select are not uploaded to a BravoConvert processing server. This avoids waiting for an upload and is useful for images and documents you prefer to keep on your own device.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 p-6 bg-gray-50">
              <h2 className="mb-3 flex items-center gap-3 text-xl font-bold text-black">
                <ImageFormatIcon className="h-6 w-6 flex-shrink-0 text-gray-700" aria-hidden="true" />
                Choose an image format
              </h2>
              <p className="leading-7">Use JPG for compact photographs, PNG for lossless graphics and transparency, or WebP for modern web delivery. Supported files can be processed as a batch and downloaded together as a ZIP archive.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6 bg-gray-50">
              <h2 className="mb-3 flex items-center gap-3 text-xl font-bold text-black">
                <FileImage className="h-6 w-6 flex-shrink-0 text-gray-700" aria-hidden="true" />
                Turn PDF pages into images
              </h2>
              <p className="leading-7">PDF pages are rendered with PDF.js and exported as JPG or PNG. PNG is often suitable for text and diagrams; JPG generally produces smaller files for pages dominated by photographs.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6 bg-gray-50">
              <h2 className="mb-3 flex items-center gap-3 text-xl font-bold text-black">
                <PencilRuler className="h-6 w-6 flex-shrink-0 text-gray-700" aria-hidden="true" />
                Edit one image quickly
              </h2>
              <p className="leading-7">Resize an image to exact pixel dimensions, correct its orientation, mirror it horizontally or vertically, and export the result without sending the source image to a server.</p>
            </div>
          </div>
          <div>
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold text-black">
              <Gauge className="h-8 w-8 flex-shrink-0 text-gray-700" aria-hidden="true" />
              What it does to a file, in numbers
            </h2>
            <p className="leading-7 mb-5">
              These are measured results, not estimates — produced by encoding a test photograph
              through the same browser API the converter uses. Your own files will land on different
              absolute numbers, but the relationships hold.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Same 900×600 photo, saved as</th>
                    <th className="p-3 font-bold">Size</th>
                    <th className="p-3 font-bold">Against the PNG</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium text-black">PNG (lossless)</td>
                    <td className="p-3">{kb(homePhoto.png)}</td>
                    <td className="p-3 text-gray-400">—</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium text-black">JPG, quality 0.8</td>
                    <td className="p-3">{kb(homeJpg80)}</td>
                    <td className="p-3">{Math.round((1 - homeJpg80 / homePhoto.png) * 100)}% smaller</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-3 font-medium text-black">WebP, quality 0.8</td>
                    <td className="p-3">{kb(homeWebp80)}</td>
                    <td className="p-3">{Math.round((1 - homeWebp80 / homePhoto.png) * 100)}% smaller</td>
                  </tr>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="p-3 font-medium text-black">WebP at half the dimensions</td>
                    <td className="p-3 font-medium text-black">{kb(homeHalf.webp)}</td>
                    <td className="p-3 font-medium text-black">{Math.round((1 - homeHalf.webp / homePhoto.png) * 100)}% smaller</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 leading-7">
              The <Link href="/guides/jpg-png-webp-comparison/" className="underline font-medium">format comparison guide</Link>{" "}
              publishes every measurement and the test images themselves, including the case where JPG
              beats WebP — which is not the result most articles will tell you to expect.
            </p>
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold text-black">
              <ListChecks className="h-8 w-8 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Common tasks, and where to start
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {commonTasks.map((task) => (
                <div key={task.task} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-1 font-bold text-black">{task.task}</div>
                  <p className="text-sm leading-6 text-gray-700">
                    {task.how}{" "}
                    <Link href={task.href} className="underline font-medium">
                      {task.tool}
                    </Link>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <CircleAlert className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Before converting
            </h2>
            <p className="leading-7">
              Keep a backup of every original — conversion makes a copy, it does not manage your
              files, and nothing is stored here after you close the tab. Speed, memory use and format
              support depend on your browser and device, because the work happens on your machine
              rather than on a server. Images are limited to 10MB each and PDFs to 50MB, and
              password-protected PDFs cannot be opened. Accepted inputs are JPG, PNG and WebP for
              images, and PDF for documents; HEIC, RAW, TIFF, GIF and BMP are not supported. If
              something fails, <Link href="/guides/troubleshooting/" className="underline font-medium">troubleshooting</Link>{" "}
              lists the usual causes.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-2 text-xl font-bold text-black">Not sure which format or setting to use?</h2>
            <p className="leading-7">
              The <Link href="/guides/" className="underline font-medium">guides section</Link> covers when to use JPG, PNG, or WebP, how to reduce file size without losing quality, why EXIF metadata matters for privacy, and fixes for common conversion problems.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
