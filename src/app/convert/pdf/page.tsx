"use client";

import dynamic from "next/dynamic";

// 🎯 완전한 CSR 전용 - 서버에서는 아무것도 렌더링하지 않음
const PDFConverter = dynamic(() => import("@/components/PDFConverter"), {
  ssr: false, // 서버 사이드 렌더링 완전 비활성화
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Loading PDF Converter
        </h2>
        <p className="text-gray-600">
          Initializing PDF.js library...
        </p>
      </div>
    </div>
  ),
});

export default function PDFConvertPage() {
  return (
    <main className="min-h-screen bg-white">
      <PDFConverter />
    </main>
  );
} 