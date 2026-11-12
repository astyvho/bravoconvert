import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import Navigation from "@/components/Navigation";
import ConsentManager from "@/components/ConsentManager";
import SiteHead from "@/components/site/SiteHead";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://bravoconvert.com"),
  title: "BravoConvert - Check and Remove Photo Metadata Before You Share",
  description: "See whether a photo reveals its GPS location, time, or device, then remove that metadata by converting it. Image and PDF tools that run in your browser, with nothing uploaded.",
  keywords: [
    "EXIF viewer",
    "photo metadata",
    "check photo location",
    "remove EXIF data",
    "remove GPS from photo",
    "strip metadata",
    "image converter",
    "online image editor",
    "PDF to image",
    "merge PDF",
    "split PDF",
    "no upload",
    "BravoConvert"
  ],
  openGraph: {
    title: "BravoConvert - Check What a Photo Reveals Before You Share It",
    description: "Check a photo for GPS location, time and device details, then remove them by converting it. Everything runs in your browser.",
    type: "website",
    url: "https://bravoconvert.com"
  },
  twitter: {
    card: "summary_large_image",
    title: "BravoConvert - Check What a Photo Reveals Before You Share It",
    description: "Check a photo for GPS location, time and device details, then remove them by converting it. Nothing is uploaded."
  },
  alternates: {
    canonical: "/",
  },
};

// No maximumScale: pinch-zoom must stay available (accessibility audit `meta-viewport`).
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans", display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sans.variable}>
      <head>
        <SiteHead />
      </head>
      <body>
        <ConsentManager locale="en" />
        <Navigation locale="en" />
        <div className="pt-8">
          {children}
        </div>
        <SiteFooter locale="en" />
      </body>
    </html>
  );
}
