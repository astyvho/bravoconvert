"use client";
import Link from "next/link";
import { CircleAlert, FileImage, FileText, Image, ImageIcon as ImageFormatIcon, PencilRuler, ShieldCheck } from "lucide-react";

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
            hasPart: [
              { "@type": "WebApplication", name: "Image Converter", url: "https://bravoconvert.com/convert/img" },
              { "@type": "WebApplication", name: "PDF to Image Converter", url: "https://bravoconvert.com/convert/pdf" },
              { "@type": "WebApplication", name: "Image Editor", url: "https://bravoconvert.com/edit/image" },
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
            <Link href="/convert/img" className="block">
              <div className="text-gray-600 mb-6 flex justify-center">
                <Image size={64} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">Image Converter</h3>
              <div className="space-y-2 text-black text-base mb-6">
                <p>• JPG, PNG, WebP and PDF</p>
                <p>• Batch conversion support</p>
                <p>• Local browser processing</p>
              </div>
            </Link>
            {/* 추천 배지 */}
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
              HOT
            </div>
          </div>

          {/* PDF를 이미지로 변환 */}
          <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-200 hover:border-gray-400">
            <Link href="/convert/pdf" className="block">
              <div className="text-gray-600 mb-6 flex justify-center">
                <FileText size={64} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">PDF to Image</h3>
              <div className="space-y-2 text-black text-base mb-6">
                <p>• Convert PDF to JPG, PNG</p>
                <p>• Split by pages</p>
                <p>• High-quality conversion</p>
              </div>
            </Link>
          </div>

          {/* Image editor */}
          <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-200 hover:border-gray-400 relative">
            <Link href="/edit/image" className="block">
              <div className="text-gray-600 mb-6 flex justify-center">
                <PencilRuler size={64} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">Image Editor</h3>
              <div className="space-y-2 text-black text-base mb-6">
                <p>• Resize with aspect ratio lock</p>
                <p>• Rotate and flip images</p>
                <p>• Export JPG, PNG, or WebP</p>
              </div>
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
            <h2 className="mb-3 flex items-center gap-3 text-2xl font-bold text-black">
              <CircleAlert className="h-7 w-7 flex-shrink-0 text-gray-700" aria-hidden="true" />
              Before converting
            </h2>
            <p className="leading-7">Keep a backup of every original. Conversion quality, speed, memory use and format support depend on your browser and device. Image uploads are limited to 10MB per file and PDF uploads to 50MB. Password-protected PDFs are not supported.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
