import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BravoConvert - Free Online Image Converter with Auto-Rotation & Privacy Protection",
  description: "Convert images and PDFs with automatic photo rotation correction and metadata removal for privacy. Free EXIF auto-rotate, batch conversion, and instant processing in your browser. Perfect for iPhone photos, social media, and professional use.",
  keywords: [
    "file converter",
    "free file converter",
    "online file converter",
    "image converter",
    "PDF converter",
    "auto rotate images",
    "EXIF rotation fix",
    "photo orientation correction",
    "iPhone photo rotation",
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
    "rotate photos automatically",
    "fix sideways photos",
    "correct image orientation"
  ],
  openGraph: {
    title: "BravoConvert - Smart Image Converter with Auto-Rotation",
    description: "Automatically fix photo orientation and remove metadata for privacy. Free online converter with EXIF auto-rotate feature.",
    type: "website",
    url: "https://bravoconvert.com"
  },
  twitter: {
    card: "summary_large_image",
    title: "BravoConvert - Auto-Rotate & Privacy-Safe Image Converter",
    description: "Fix sideways iPhone photos automatically! Remove metadata for privacy. Free online image converter."
  }
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
        {/* Google Search Console 도메인 소유 확인 */}
        <meta name="google-site-verification" content="f_yi04ke2AOQgKSmgW2C60LLIMow3yeWvahynPvZDzI" />
        
        {/* 네이버 서치 사이트 확인 */}
        <meta name="naver-site-verification" content="d6ff057d950b725e2fa3332f0d42c3b1d9546034" />
        
        {/* Google 애드센스 소유권 확인 */}
        <meta name="google-adsense-account" content="ca-pub-5227371483154382" />
        
        {/* Canonical URL and RSS Feed */}
        <link rel="canonical" href="https://bravoconvert.com" />
        <link rel="alternate" type="application/rss+xml" title="BravoConvert File Converter RSS Feed" href="https://bravoconvert.com/feed.xml" />
        
        
        {/* Google AdSense 자동 광고 */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5227371483154382"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${inter.variable} antialiased text-black`}
      >
        <GoogleAnalytics />
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
              </div>
              
              {/* 모바일 푸터 링크 */}
              <div className="sm:hidden flex flex-wrap justify-center gap-2">
                <Link href="/how-to-use" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">How to Use</Link>
                <Link href="/faq" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">FAQ</Link>
                <Link href="/privacy-policy" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">Terms of Service</Link>
              </div>
            </div>
            <div className="text-black font-medium">© 2025 BravoConvert</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
