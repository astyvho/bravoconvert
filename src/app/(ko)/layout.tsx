import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import SiteHeader from "@/components/site/site-header";
import { ConsentBannerProvider } from "@/components/site/consent-context";
import ConsentManager from "@/components/ConsentManager";
import SiteHead from "@/components/site/SiteHead";
import SiteFooter from "@/components/site/SiteFooter";

// 한국어판 루트 레이아웃. <html lang="ko"> 를 정적 HTML에 넣으려면 영어판과 별도의 루트 레이아웃이 필요하다.
export const metadata: Metadata = {
  metadataBase: new URL("https://bravoconvert.com"),
  title: "BravoConvert - 사진을 보내기 전에 위치·기기 정보 확인하고 지우기",
  description: "사진에 촬영 위치(GPS), 시간, 기기 정보가 들어 있는지 확인하고, 변환해서 지우세요. 파일은 브라우저 안에서만 처리되고 업로드되지 않습니다.",
  openGraph: {
    title: "BravoConvert - 사진이 무엇을 드러내는지 공유 전에 확인하세요",
    description: "사진 속 GPS 위치, 촬영 시간, 기기 정보를 확인하고 변환으로 지웁니다. 모든 처리는 브라우저 안에서 이루어집니다.",
    type: "website",
    locale: "ko_KR",
    url: "https://bravoconvert.com/ko/",
  },
  twitter: {
    card: "summary_large_image",
    title: "BravoConvert - 사진이 무엇을 드러내는지 공유 전에 확인하세요",
    description: "사진 속 GPS 위치, 촬영 시간, 기기 정보를 확인하고 지웁니다. 업로드는 없습니다.",
  },
};

// No maximumScale: pinch-zoom must stay available (accessibility audit `meta-viewport`).
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans", display: "swap" });
// 한국어 글꼴은 Pretendard. 파일을 저장소에 두지 않고 jsDelivr 의 dynamic-subset CSS 를 쓴다.
const PRETENDARD_CSS = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

export default function KoreanRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={sans.variable}>
      <head>
        <SiteHead />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href={PRETENDARD_CSS} />
      </head>
      <body className="break-keep" style={{ fontFamily: '"Pretendard Variable", Pretendard, var(--font-sans), system-ui, sans-serif' }}>
        <ConsentBannerProvider>
          <ConsentManager locale="ko" />
          <SiteHeader locale="ko" />
          <div className="pt-6">
            {children}
          </div>
          <SiteFooter locale="ko" />
        </ConsentBannerProvider>
      </body>
    </html>
  );
}
