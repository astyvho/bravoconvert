"use client";
import Link from "next/link";
import { Camera, CircleAlert, Clock, Combine, Eraser, FileSearch, FileText, Fingerprint, Gauge, Image, ListChecks, MapPin, PencilRuler, PenLine, Share2, ShieldCheck, User } from "lucide-react";
import benchmarks from "@/data/format-benchmarks.json";
import exifDemo from "@/data/exif-demo.json";

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;
const homePhoto = benchmarks.samples.find((s) => s.id === "photo")!;
const homeJpg80 = homePhoto.jpeg.find((e) => e.quality === 0.8)!.bytes;
const homeWebp80 = homePhoto.webp.find((e) => e.quality === 0.8)!.bytes;
const homeHalf = benchmarks.resize.rows.find((r) => r.scale === 0.5)!;

// exif-demo.json 의 필드명을 사람이 읽는 이름으로. 값은 스크립트가 만든 샘플 사진의 실제 값이다.
const demoLabels: Record<string, string> = {
  Make: "Camera make",
  Model: "Camera model",
  DateTimeOriginal: "Date and time taken",
  Orientation: "Orientation",
  latitude: "GPS latitude",
  longitude: "GPS longitude",
  GPSLatitudeRef: "Latitude hemisphere",
  GPSLongitudeRef: "Longitude hemisphere",
};

const revealed = [
  { icon: MapPin, label: "Where it was taken", body: "GPS coordinates precise enough to find a house, written by phones whose camera app has location access." },
  { icon: Clock, label: "When it was taken", body: "The date and time to the second, which can place you somewhere at a moment you did not mention." },
  { icon: Camera, label: "What took it", body: "The make and model of the phone or camera, and sometimes the lens." },
  { icon: Fingerprint, label: "Which device exactly", body: "Some cameras write a body serial number, which ties every photo back to one physical device." },
  { icon: User, label: "Who owns it", body: "An owner, artist or copyright name, if the camera or editing app was set up with one." },
  { icon: PenLine, label: "What edited it", body: "The software that last saved the file, and on some systems the name of the computer." },
];

const steps = [
  {
    icon: FileSearch,
    title: "1. Check",
    body: "Open the photo in the EXIF Viewer. It reports which of six kinds of identifying information the file carries, and shows the GPS point if there is one.",
    href: "/view/exif/",
    cta: "Check a photo",
  },
  {
    icon: Eraser,
    title: "2. Clean",
    body: "Convert it, or export it from the Image Editor. Both rebuild the picture from its pixels, so the metadata block from the original is not copied into the new file.",
    href: "/convert/img/",
    cta: "Convert a photo",
  },
  {
    icon: Share2,
    title: "3. Confirm and share",
    body: "Open the new file in the viewer again. It should report nothing found. Then look at the picture itself — metadata tools cannot see a street sign or a face.",
    href: "/guides/exif-metadata-privacy/",
    cta: "Read what we tested",
  },
];

const commonTasks = [
  {
    task: "A photo is about to be posted publicly",
    how: "Check it in the EXIF viewer to see whether it carries a location, time, or device details. If it does, convert it: the output is rebuilt from pixels, so none of that carries over.",
    tool: "EXIF Viewer",
    href: "/view/exif/",
  },
  {
    task: "Selling something online with a photo taken at home",
    how: "Listing photos taken in your own home can carry your home's coordinates. Convert them before uploading, then check one of the results to confirm the location is gone.",
    tool: "Image Converter",
    href: "/convert/img/",
  },
  {
    task: "A document is too confidential to upload anywhere",
    how: "Merge, split, or render it here: the PDF is opened by your own browser and never sent to a server, so there is no copy of it anywhere but your device.",
    tool: "Merge & Split PDF",
    href: "/edit/pdf/",
  },
  {
    task: "Someone needs one page of a long PDF",
    how: "Extract that page as its own PDF so the rest of the document does not travel with it. If it has to open anywhere without a PDF viewer, render it as a PNG image instead.",
    tool: "Merge & Split PDF",
    href: "/edit/pdf/",
  },
  {
    task: "A photo is too big to email or upload",
    how: "Resize it down first, then convert to JPG or WebP at quality 0.8. The export is a new file, so the original's EXIF block is not copied into it either.",
    tool: "Image Editor",
    href: "/edit/image/",
  },
  {
    task: "A form only accepts JPG or PNG",
    how: "Convert the file and download the result. Batch conversion returns a ZIP when there is more than one file.",
    tool: "Image Converter",
    href: "/convert/img/",
  },
];

const otherTools = [
  {
    href: "/convert/img/",
    icon: Image,
    title: "Image Converter",
    points: ["JPG, PNG, WebP and PDF", "Batch conversion with ZIP download", "Output carries no source EXIF"],
    use: "Use this to clean a batch of photos, switch formats, or combine photos into one PDF",
  },
  {
    href: "/convert/pdf/",
    icon: FileText,
    title: "PDF to Image",
    points: ["Convert PDF to JPG or PNG", "One image per page", "The PDF never leaves your device"],
    use: "Use this to share a single page as a picture instead of sending the whole document",
  },
  {
    href: "/edit/image/",
    icon: PencilRuler,
    title: "Image Editor",
    points: ["Resize with aspect ratio lock", "Rotate and flip", "Export JPG, PNG, or WebP"],
    use: "Use this to fix or resize one photo — the export does not copy the original's EXIF block",
  },
  {
    href: "/edit/pdf/",
    icon: Combine,
    title: "Merge & Split PDF",
    points: ["Combine several PDFs into one", "Extract pages or split every page", "No upload, text stays selectable"],
    use: "Use this to send only the pages someone needs, without uploading the document to a service",
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
            description: "Check what a photo reveals before you share it, and clean it without uploading it. Browser-based photo metadata, image and PDF tools.",
            publisher: {
              "@type": "Organization",
              name: "BravoConvert",
              url: "https://bravoconvert.com/",
              email: "bravoconvert.help@gmail.com",
            },
            hasPart: [
              { "@type": "WebApplication", name: "EXIF Viewer", applicationCategory: "UtilitiesApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/view/exif/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
              { "@type": "WebApplication", name: "Image Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/convert/img/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
              { "@type": "WebApplication", name: "PDF to Image Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/convert/pdf/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
              { "@type": "WebApplication", name: "Image Editor", applicationCategory: "MultimediaApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/edit/image/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
              { "@type": "WebApplication", name: "PDF Merge and Split", applicationCategory: "UtilitiesApplication", operatingSystem: "Any browser", url: "https://bravoconvert.com/edit/pdf/", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
            ],
          }),
        }}
      />
      <div className="w-full max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">BravoConvert</p>
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
            Check what a photo reveals before you share it
          </h1>
          <p className="text-lg md:text-xl text-black max-w-3xl mx-auto mb-8">
            Photos carry more than the picture: often the exact place they were taken, the time, and the phone that took them.
            See what is in yours, remove it, and share only the image — without uploading the file anywhere.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/view/exif/" className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:bg-gray-800">
              <FileSearch className="h-5 w-5" aria-hidden="true" />
              Check a photo
            </Link>
            <Link href="/convert/img/" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-bold text-black transition-all duration-300 hover:bg-gray-200">
              <Eraser className="h-5 w-5" aria-hidden="true" />
              Remove metadata by converting
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">Files are read and processed by your own browser. Nothing is uploaded.</p>
        </div>

        {/* Check, clean, share */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                <Icon className="mb-4 h-10 w-10 text-gray-700" aria-hidden="true" />
                <h2 className="mb-2 text-2xl font-bold text-black">{step.title}</h2>
                <p className="mb-4 leading-7 text-gray-700">{step.body}</p>
                <Link href={step.href} className="mt-auto font-medium underline">
                  {step.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <section className="max-w-5xl mx-auto mt-16 space-y-12 text-gray-800">
          <div>
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold text-black">
              <ShieldCheck className="h-8 w-8 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Tested, not assumed: what survives a conversion
            </h2>
            <p className="leading-7 mb-5">
              We built a sample photo carrying {exifDemo.before.length} metadata fields — {exifDemo.exifBlockBytes} bytes that
              no one sees when looking at the picture — then put it through the same decode-and-redraw path the converter
              uses and read the result back with an EXIF parser.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 font-bold">Field</th>
                    <th className="p-3 font-bold">In the original</th>
                    <th className="p-3 font-bold">After conversion</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {exifDemo.before.map((row, index) => (
                    <tr key={row.field} className="border-t border-gray-200">
                      <td className="p-3 font-medium text-black">{demoLabels[row.field] ?? row.field}</td>
                      <td className="p-3 font-mono">{String(row.value)}</td>
                      <td className="p-3">{exifDemo.after[index].value === null ? "Not present" : String(exifDemo.after[index].value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 leading-7">
              {exifDemo.anyFieldSurvived ? "Some fields survived." : "None of the fields survived."} The sample is a real file
              with made-up details, and you can{" "}
              <Link href="/view/exif/" className="underline font-medium">open it in the viewer</Link> yourself. The{" "}
              <Link href="/guides/exif-metadata-privacy/" className="underline font-medium">EXIF privacy guide</Link>{" "}
              covers the full test and what removing metadata does not protect you from.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-3xl font-bold text-black">What a photo can say about you</h2>
            <p className="mb-5 leading-7">
              These are the six things the EXIF Viewer looks for. A photo rarely carries all of them, and which ones appear
              depends on the device and its settings rather than on the picture.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {revealed.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <div className="mb-1 flex items-center gap-2 font-bold text-black">
                      <Icon className="h-5 w-5 flex-shrink-0 text-gray-700" aria-hidden="true" />
                      {item.label}
                    </div>
                    <p className="text-sm leading-6 text-gray-700">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-3xl font-bold text-black">Tools that keep files on your device</h2>
            <p className="mb-6 leading-7">
              The other tools do everyday image and PDF work the same way: the file is opened by your browser and the result
              is handed back as a download, so there is never a copy on someone else&apos;s server.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.href} href={tool.href} className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gray-400 hover:shadow-xl">
                    <div className="mb-3 flex items-center gap-3">
                      <Icon className="h-8 w-8 flex-shrink-0 text-gray-600" aria-hidden="true" />
                      <h3 className="text-2xl font-bold text-black group-hover:underline">{tool.title}</h3>
                    </div>
                    <ul className="mb-3 space-y-1 text-base text-black">
                      {tool.points.map((point) => (
                        <li key={point}>• {point}</li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-500">{tool.use}</p>
                  </Link>
                );
              })}
            </div>
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
              What removing metadata does not do
            </h2>
            <p className="leading-7 mb-3">
              Converting removes the information stored alongside the picture. It does nothing about the picture itself: a
              street sign, a house number, a face, a reflection in a window or a screen in the background can identify a
              place or a person just as well as GPS coordinates. Look at the image before you share it.
            </p>
            <p className="leading-7">
              The tools accept JPG, PNG and WebP images and PDF documents. HEIC photos from an iPhone, RAW, TIFF, GIF and BMP are not
              accepted. Keep your
              originals: converting makes a copy and nothing is stored here after you close the tab. If something fails,{" "}
              <Link href="/guides/troubleshooting/" className="underline font-medium">troubleshooting</Link> lists the usual causes.
            </p>
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-black">
              <Gauge className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Also measured: what conversion does to file size
            </h2>
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
              publishes every measurement and the test images themselves, including the case where JPG beats WebP.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-2 text-xl font-bold text-black">More in the guides</h2>
            <p className="leading-7">
              The <Link href="/guides/" className="underline font-medium">guides section</Link> starts with what EXIF metadata
              reveals and how we tested its removal, and also covers choosing between JPG, PNG and WebP, reducing file size,
              PDF output resolution, and fixes for common problems.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
