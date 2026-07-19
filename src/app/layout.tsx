import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AdSenseAutoAds from "@/components/AdSenseAutoAds";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://bravoconvert.com"),
  title: "BravoConvert - Free Online Image and PDF Converter",
  description: "Convert JPG, PNG and WebP images, combine images into PDF, or render PDF pages as JPG and PNG. Free batch conversion processed locally in your browser.",
  keywords: [
    "file converter",
    "free file converter",
    "online file converter",
    "image converter",
    "PDF converter",
    "metadata removal",
    "EXIF data removal",
    "privacy protection",
    "strip metadata",
    "remove photo data",
    "PNG to WebP",
    "PNG to JPG",
    "JPG to WebP",
    "WebP to JPG",
    "JPG to PNG",
    "PNG to PDF",
    "PDF to JPG",
    "PDF to PNG",
    "batch conversion",
    "bulk converter",
    "privacy safe converter",
    "BravoConvert",
    "photo converter",
    "fast file converter",
    "browser file converter",
    "no install converter",
    "convert files online",
    "file conversion tool",
    "image format converter",
    "PDF image converter",
    "image compression",
    "images to PDF"
  ],
  openGraph: {
    title: "BravoConvert - Free Online Image and PDF Converter",
    description: "Convert images in batches, combine images into PDF, and turn PDF pages into JPG or PNG—all in your browser.",
    type: "website",
    url: "https://bravoconvert.com"
  },
  twitter: {
    card: "summary_large_image",
    title: "BravoConvert - Browser-Based Image and PDF Converter",
    description: "Convert JPG, PNG and WebP images or export PDF pages as images. Free, fast and no installation required."
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Default to denied until a consent platform supplies the user's choice. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{'ad_storage':'denied','analytics_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','wait_for_update':500});`,
          }}
        />
        {/* Google Search Console 도메인 소유 확인 */}
        <meta name="google-site-verification" content="f_yi04ke2AOQgKSmgW2C60LLIMow3yeWvahynPvZDzI" />
        
        {/* 네이버 서치 사이트 확인 */}
        <meta name="naver-site-verification" content="d6ff057d950b725e2fa3332f0d42c3b1d9546034" />
        
        {/* Google 애드센스 소유권 확인 */}
        <meta name="google-adsense-account" content="ca-pub-6552891879490275" />
        
        {/* Canonical URL and RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="BravoConvert File Converter RSS Feed" href="https://bravoconvert.com/feed.xml" />
      </head>
      <body
        className="antialiased text-black"
      >
        <GoogleAnalytics />
        <AdSenseAutoAds />
        <Navigation />
        <div className="pt-8">
          {children}
        </div>
        
        {/* 푸터 */}
        <div className="w-full px-4 pt-8 pb-6">
          <footer className="max-w-6xl mx-auto text-center text-xs text-black py-8 bg-white/70 rounded-3xl shadow-lg shadow-gray-200/20 border border-gray-100/50 backdrop-blur-sm">
            <div className="mb-4">
              
              {/* 데스크톱 푸터 링크 */}
              <div className="hidden sm:block">
                <Link href="/how-to-use" className="hover:text-gray-700 mx-3 text-black transition-colors duration-300">How to Use</Link>
                <span className="text-gray-400">•</span>
                <Link href="/faq" className="hover:text-gray-700 mx-3 text-black transition-colors duration-300">FAQ</Link>
                <span className="text-gray-400">•</span>
                <Link href="/privacy-policy" className="hover:text-gray-700 mx-3 text-black transition-colors duration-300">Privacy Policy</Link>
                <span className="text-gray-400">•</span>
                <Link href="/terms" className="hover:text-gray-700 mx-3 text-black transition-colors duration-300">Terms of Service</Link>
                <span className="text-gray-400">•</span>
                <Link href="/about" className="hover:text-gray-700 mx-3 text-black transition-colors duration-300">About</Link>
                <span className="text-gray-400">•</span>
                <Link href="/contact" className="hover:text-gray-700 mx-3 text-black transition-colors duration-300">Contact</Link>
              </div>
              
              {/* 모바일 푸터 링크 */}
              <div className="sm:hidden flex flex-wrap justify-center gap-2">
                <Link href="/how-to-use" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">How to Use</Link>
                <Link href="/faq" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">FAQ</Link>
                <Link href="/privacy-policy" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">Terms of Service</Link>
                <Link href="/about" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">About</Link>
                <Link href="/contact" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">Contact</Link>
              </div>
            </div>
            <div className="text-black font-medium">© {new Date().getFullYear()} BravoConvert</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
