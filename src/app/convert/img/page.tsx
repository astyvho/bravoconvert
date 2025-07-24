import { Metadata } from "next";
import ClientRoot from "@/components/ClientRoot";
import ImageConverter from "@/components/ImageConverter";

export const metadata: Metadata = {
  title: "Image Converter - BravoConvert",
  description: "Convert PNG, JPG, WebP, GIF images for free. Batch conversion, high quality, works in your browser. No upload required, privacy protected.",
  keywords: "image converter, PNG to WebP, JPG to PNG, image format converter, free image converter, online image converter",
};

export default function ImageConverterPage() {
  return (
    <main className="min-h-screen bg-white pb-12 px-4">
      <ClientRoot>
        <ImageConverter />
      </ClientRoot>
    </main>
  );
} 