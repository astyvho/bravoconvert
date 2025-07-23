import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Image Converter - BravoConvert",
  description: "Convert PDF to JPG, PNG images for free. High-quality conversion, page splitting, works in your browser. No upload required, privacy protected.",
  keywords: "PDF to image, PDF to JPG, PDF to PNG, PDF converter, free PDF converter, online PDF converter",
};

export default function PDFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 