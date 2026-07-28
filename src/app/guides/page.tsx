import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  BookMarked,
  Fingerprint,
  LifeBuoy,
  Library,
  Minimize2,
  Files,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Guides | BravoConvert",
  description: "Practical guides on image formats, file size, PDF-to-image workflows, EXIF privacy, and common conversion problems.",
  alternates: { canonical: "/guides" },
};

const guides = [
  {
    href: "/guides/jpg-png-webp-comparison",
    icon: BarChart3,
    title: "JPG vs PNG vs WebP: Which Format Should You Use?",
    description: "Compare compression, transparency support, and typical file size so you can pick the right output format.",
  },
  {
    href: "/guides/reduce-image-file-size",
    icon: Minimize2,
    title: "How to Reduce Image File Size Without Losing Quality",
    description: "Four practical ways to shrink a photo: format choice, quality level, dimensions, and metadata removal.",
  },
  {
    href: "/guides/pdf-to-image-use-cases",
    icon: Files,
    title: "Why and When to Convert PDF Pages to Images",
    description: "Common situations where turning a PDF page into a JPG or PNG is more useful than sharing the whole file.",
  },
  {
    href: "/guides/exif-metadata-privacy",
    icon: Fingerprint,
    title: "What Is EXIF Data, and Why Removing It Matters",
    description: "How camera and phone metadata can expose your location and device, and how re-encoding removes it.",
  },
  {
    href: "/guides/troubleshooting",
    icon: LifeBuoy,
    title: "Troubleshooting Common Conversion Problems",
    description: "Fixes for files that won't upload, conversions that fail, blurry output, and downloads that don't appear.",
  },
  {
    href: "/guides/glossary",
    icon: Library,
    title: "Image and PDF Terminology Glossary",
    description: "Plain-language definitions for resolution, DPI, compression, alpha channel, and other terms used on this site.",
  },
];

export default function GuidesIndexPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-4xl font-bold text-black md:text-6xl">
            <BookMarked className="mr-4 h-16 w-16 flex-shrink-0 text-gray-700" aria-hidden="true" />
            Guides
          </h1>
          <p className="mb-8 text-xl text-black">Background reading on formats, file size, and privacy</p>
          <p className="text-base text-gray-600">These guides explain the reasoning behind common conversion and editing decisions</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gray-400 hover:shadow-xl"
              >
                <Icon className="mb-4 h-8 w-8 text-gray-700" aria-hidden="true" />
                <h2 className="mb-2 text-xl font-bold text-black group-hover:underline">{guide.title}</h2>
                <p className="text-gray-700 leading-6">{guide.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
