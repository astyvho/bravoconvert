import { Metadata } from "next";
import ImageConverter from "@/components/ImageConverter";

export const metadata: Metadata = {
  alternates: { canonical: "/convert/img" },
  title: "Smart Image Converter with Auto-Rotation & Privacy Protection | BravoConvert",
  description: "Convert JPG, PNG and WebP images with photo orientation correction and metadata-free re-encoding. Free batch conversion in your browser.",
  keywords: [
    "smart image converter",
    "auto rotate photos",
    "EXIF rotation fix",
    "iPhone photo orientation",
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
    "fix sideways photos",
    "correct photo orientation",
    "social media image prep",
    "professional photo converter"
  ],
  openGraph: {
    title: "Smart Image Converter - Auto-Rotate & Privacy Protection",
    description: "Automatically fix photo orientation and remove metadata. Perfect for iPhone photos and privacy-conscious users.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Fix Sideways Photos Automatically!",
    description: "Smart image converter with auto-rotation and privacy protection. Convert and fix iPhone photos instantly."
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
            "description": "Free online JPG, PNG and WebP converter with orientation correction and metadata-free re-encoding",
            "url": "https://bravoconvert.com/convert/img",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Automatic photo rotation correction",
              "EXIF metadata removal for privacy",
              "Batch image conversion",
              "Support for PNG, JPG and WebP formats",
              "Browser-based processing (no upload required)",
              "iPhone photo orientation fixing"
            ]
          })
        }}
      />
      <ImageConverter />
    </main>
  );
}
