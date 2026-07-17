"use client";
import Link from "next/link";
import { Image, FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center px-4">
      <div className="w-full max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
            BravoConvert
          </h1>
          <p className="text-xl md:text-2xl text-black mb-8">
            A New Experience in File Conversion
          </p>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Convert images and PDFs quickly and easily. 
            A powerful conversion tool available online for free.
          </p>
        </div>

        {/* Conversion Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
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

        </div>

        <section className="max-w-3xl mx-auto mt-16 space-y-10 text-gray-800">
          <div>
            <h2 className="text-3xl font-bold text-black mb-4">File conversion that stays on your device</h2>
            <p className="leading-7">BravoConvert performs image conversion and PDF rendering in your browser. The contents of files you select are not uploaded to a BravoConvert conversion server. This avoids waiting for an upload and is useful for documents you prefer to keep on your own device.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 p-6 bg-gray-50">
              <h2 className="text-xl font-bold text-black mb-3">Choose an image format</h2>
              <p className="leading-7">Use JPG for compact photographs, PNG for lossless graphics and transparency, or WebP for modern web delivery. Supported files can be processed as a batch and downloaded together as a ZIP archive.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6 bg-gray-50">
              <h2 className="text-xl font-bold text-black mb-3">Turn PDF pages into images</h2>
              <p className="leading-7">PDF pages are rendered with PDF.js and exported as JPG or PNG. PNG is often suitable for text and diagrams; JPG generally produces smaller files for pages dominated by photographs.</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black mb-3">Before converting</h2>
            <p className="leading-7">Keep a backup of every original. Conversion quality, speed, memory use and format support depend on your browser and device. Image uploads are limited to 10MB per file and PDF uploads to 50MB. Password-protected PDFs are not supported.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
