import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BravoConvert - Free Online File Conversion Tools",
  description: "Convert images and PDFs for free, fast, and securely in your browser. No installation required. Batch upload, bulk conversion, privacy protected. The best online file converter for your image and PDF conversion needs.",
  keywords: [
    "file converter",
    "free file converter",
    "online file converter",
    "image converter",
    "PDF converter",
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
    "PDF image converter"
  ],
  // viewport 제거
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
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        
        {/* Canonical URL and RSS Feed */}
        <link rel="canonical" href="https://bravoconvert.com" />
        <link rel="alternate" type="application/rss+xml" title="BravoConvert File Converter RSS Feed" href="https://bravoconvert.com/feed.xml" />
        
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-2QXJN1E3TF"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2QXJN1E3TF');
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased text-black`}
      >
        <Navigation />
        <div className="pt-8">
          {children}
        </div>
        
        {/* 푸터 */}
        <div className="w-full px-4 pt-8 pb-6">
          <footer className="max-w-6xl mx-auto text-center text-xs text-black py-8 bg-white/70 rounded-3xl shadow-lg shadow-gray-200/20 border border-gray-100/50 backdrop-blur-sm">
            <div className="mb-3">
              {/* 데스크톱 푸터 링크 */}
              <div className="hidden sm:block">
                <a href="/how-to-use" className="hover:text-gray-700 mx-3 text-black transition-colors duration-300">How to Use</a>
                <span className="text-gray-400">•</span>
                <a href="/faq" className="hover:text-gray-700 mx-3 text-black transition-colors duration-300">FAQ</a>
                <span className="text-gray-400">•</span>
                <a href="/privacy-policy" className="hover:text-gray-700 mx-3 text-black transition-colors duration-300">Privacy Policy</a>
                <span className="text-gray-400">•</span>
                <a href="/terms" className="hover:text-gray-700 mx-3 text-black transition-colors duration-300">Terms of Service</a>
              </div>
              
              {/* 모바일 푸터 링크 */}
              <div className="sm:hidden flex flex-wrap justify-center gap-2">
                <a href="/how-to-use" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">How to Use</a>
                <a href="/faq" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">FAQ</a>
                <a href="/privacy-policy" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">Privacy Policy</a>
                <a href="/terms" className="hover:text-gray-700 px-2 py-1 text-black transition-colors duration-300">Terms of Service</a>
              </div>
            </div>
            <div className="text-black font-medium">© 2025 BravoConvert</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
