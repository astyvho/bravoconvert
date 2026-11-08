import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Image Converter - Convert PDF to JPG/PNG | BravoConvert",
  description: "Render PDF files as high-quality JPG and PNG images locally in your browser with page-by-page and ZIP downloads.",
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
    "batch PDF conversion",
    "PDF.js converter",
    "secure PDF processing"
  ],
  openGraph: {
    title: "Free PDF to Image Converter with Privacy Protection",
    description: "Render PDF pages as JPG or PNG images locally in your browser.",
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
