import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";

export const metadata: Metadata = {
  title: "Troubleshooting Common Conversion Problems | BravoConvert",
  description: "Fixes for files that won't upload, conversions that fail, blurry output, and downloads that don't appear.",
  alternates: { canonical: "/guides/troubleshooting" },
};

const issues = [
  {
    problem: "The file won't upload or is rejected",
    fix: "Check that the file is one of the supported input formats (JPG/JPEG, PNG, or WebP for the converter and editor; PDF for the PDF tool) and under the size limit (10MB per image, 50MB per PDF). Files renamed with the wrong extension, or genuinely corrupted files, will also fail to load.",
  },
  {
    problem: "Conversion or export seems stuck or very slow",
    fix: "Large images, high page counts, or a large browser tab count can use significant memory. Close other tabs, wait for the current operation to finish, or try a smaller batch. Performance depends on your browser and device, not on a BravoConvert server queue.",
  },
  {
    problem: "The download didn't start or the file is missing",
    fix: "Some browsers block multiple automatic downloads or route them to a different folder than expected. Check your browser's download prompt, the default downloads folder, and any \"blocked pop-up\" or \"multiple downloads\" notification the browser may have shown.",
  },
  {
    problem: "The converted image looks blurry or has visible blocky artifacts",
    fix: "This usually means the quality/compression level for JPG or WebP output was set too low, or the image was resized up rather than down. Increase the quality setting, or start from the original file instead of an already-compressed copy.",
  },
  {
    problem: "A PDF page rendered incorrectly or looks different from the original",
    fix: "Rendering quality depends on the PDF page's own content and the rendering scale used. Very large or complex pages can also take longer. Password-protected or encrypted PDFs are not supported and will fail to load.",
  },
  {
    problem: "Transparency turned black or a solid color after converting to JPG",
    fix: "JPG cannot store transparent pixels, so transparent areas are filled with the background color chosen in the export settings. Use PNG or WebP instead if transparency needs to be preserved.",
  },
  {
    problem: "The page feels unresponsive on mobile",
    fix: "Large images and PDFs use more memory on phones than on desktop browsers. Try a smaller file, close other apps and tabs, or switch to a desktop browser for large batches.",
  },
];

export default function TroubleshootingGuide() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <LifeBuoy className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Troubleshooting
          </h1>
          <p className="mb-8 text-xl text-black">Common conversion problems and how to fix them</p>
          <p className="text-base text-gray-600">Most issues come down to file format, size limits, or browser behavior</p>
        </header>

        <article className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl md:p-10">
          {issues.map((item, index) => (
            <div key={item.problem} className="rounded-lg border-l-4 border-black bg-gray-50 p-6">
              <h2 className="mb-3 flex items-center text-xl font-bold text-black">
                <span className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-black to-gray-800 text-sm font-bold text-white shadow-md">
                  {index + 1}
                </span>
                {item.problem}
              </h2>
              <p className="pl-12 text-base leading-relaxed text-gray-700">{item.fix}</p>
            </div>
          ))}

          <div className="rounded-xl border border-gray-200 bg-white p-6 mt-8">
            <p className="text-gray-700">
              Still stuck? Check the <Link className="underline font-medium" href="/faq">FAQ</Link> for more detail, or <Link className="underline font-medium" href="/contact">contact us</Link> with your browser, file format, and the exact error message.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
