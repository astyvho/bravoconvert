import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Image Converter - Convert PDF to JPG/PNG with Auto-Rotation | BravoConvert",
  description: "Convert PDF files to high-quality JPG and PNG images with automatic photo rotation and metadata removal. Free online PDF to image converter with privacy protection and batch processing.",
  keywords: [
    "PDF to image converter",
    "PDF to JPG",
    "PDF to PNG", 
    "convert PDF to image",
    "PDF image extractor",
    "free PDF converter",
    "PDF to photo",
    "PDF page to image",
    "online PDF converter",
    "PDF splitter",
    "PDF privacy protection",
    "remove PDF metadata",
    "auto rotate PDF images",
    "batch PDF conversion",
    "PDF.js converter",
    "secure PDF processing"
  ],
  openGraph: {
    title: "Free PDF to Image Converter with Privacy Protection",
    description: "Convert PDF pages to images with automatic rotation correction and metadata removal for privacy.",
    type: "website"
  }
};

export default function PDFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 