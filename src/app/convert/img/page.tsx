import { Metadata } from "next";
import ImageConverter from "@/components/ImageConverter";

export const metadata: Metadata = {
  alternates: { canonical: "/convert/img" },
  title: "Free Image Converter - JPG, PNG, WebP and PDF | BravoConvert",
  description: "Convert JPG, PNG and WebP images in batches, adjust output quality, reduce file size, or combine images into one PDF. Processing stays in your browser.",
  keywords: [
    "image format converter",
    "metadata removal",
    "privacy protection",
    "strip EXIF data",
    "remove photo metadata",
    "PNG to WebP",
    "JPG to PNG", 
    "WebP to JPG",
    "batch image conversion",
    "free image converter",
    "online image converter",
    "browser image processing",
    "image compression",
    "images to PDF",
    "social media image prep",
    "professional photo converter"
  ],
  openGraph: {
    title: "Free JPG, PNG and WebP Image Converter",
    description: "Batch-convert images, control output quality, reduce file size, and combine images into PDF in your browser.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert Images Without Installing Software",
    description: "Convert JPG, PNG and WebP images in batches or combine them into a PDF directly in your browser."
  }
};

export default function ImageConverterPage() {
  return (
    <main className="min-h-screen bg-white pb-12 px-4">
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BravoConvert Smart Image Converter",
            "description": "Free browser-based JPG, PNG and WebP batch converter with quality controls and PDF creation",
            "url": "https://bravoconvert.com/convert/img",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "EXIF metadata removal for privacy",
              "Batch image conversion",
              "Support for PNG, JPG and WebP formats",
              "Browser-based processing (no upload required)",
              "Image compression and PDF creation"
            ]
          })
        }}
      />
      <ImageConverter />
    </main>
  );
}
