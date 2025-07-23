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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* 이미지 변환 */}
          <Link href="/convert/img" className="group">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-200 hover:border-gray-400 relative">
              <div className="text-gray-600 mb-6 flex justify-center">
                <Image size={64} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">Image Converter</h3>
              <div className="space-y-2 text-black text-base mb-6">
                <p>• PNG, JPG, WEBP, PDF & more</p>
                <p>• Batch conversion support</p>
                <p>• Quality settings available</p>
              </div>
              {/* 추천 배지 */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
                HOT
              </div>
            </div>
          </Link>

          {/* PDF를 이미지로 변환 */}
          <Link href="/convert/pdf" className="group">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-gray-200 hover:border-gray-400">
              <div className="text-gray-600 mb-6 flex justify-center">
                <FileText size={64} />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 text-center">PDF to Image</h3>
              <div className="space-y-2 text-black text-base mb-6">
                <p>• Convert PDF to JPG, PNG</p>
                <p>• Split by pages</p>
                <p>• High-quality conversion</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
