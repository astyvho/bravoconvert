"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// PDFConverter를 동적으로 import하여 서버 사이드에서 제외
const PDFConverter = dynamic(() => import("@/components/PDFConverter"), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto pt-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          PDF to Image Converter
        </h1>
        <p className="text-gray-600 mb-8">
          Loading PDF converter...
        </p>
      </div>
    </div>
  ),
});

export default function PDFConvertPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <main className="min-h-screen bg-white pb-12 px-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              PDF to Image Converter
            </h1>
            <p className="text-gray-600 mb-8">
              Loading PDF converter...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-12 px-4">
      <PDFConverter />
    </main>
  );
} 